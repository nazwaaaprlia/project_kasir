
let defaultProducts = [
    { id: 1, name: "Kopi Hitam", price: 15000, image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300" },
    { id: 2, name: "Es Teh Manis", price: 5000, image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300" },
    { id: 3, name: "Roti Bakar", price: 12000, image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300" },
    { id: 4, name: "Nasi Goreng", price: 20000, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300" }
];

// PENYIMPANAN DATA
function loadData(key, fallback) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch (error) {
        console.error(error);
        return fallback;
    }
}

let products = loadData("kasir_products", defaultProducts);
let cart = [];
let orderHistory = loadData("kasir_orders", []);

function saveData() {
    localStorage.setItem("kasir_products", JSON.stringify(products));
    localStorage.setItem("kasir_orders", JSON.stringify(orderHistory));
}

function formatRupiah(value) {
    return "Rp " + Number(value || 0).toLocaleString("id-ID");
}

// ELEMEN DOM
const productListEl = document.getElementById("product-list");
const cartListEl = document.getElementById("cart-list");
const subtotalPriceEl = document.getElementById("subtotal-price");
const discountAmountEl = document.getElementById("discount-amount");
const totalPriceEl = document.getElementById("total-price");
const cashGivenEl = document.getElementById("cash-given");
const changeDueEl = document.getElementById("change-due");
const payBtn = document.getElementById("pay-btn");
const discountTypeEl = document.getElementById("discount-type");
const discountValueEl = document.getElementById("discount-value");
const customerNameEl = document.getElementById("customer-name");
const historyListEl = document.getElementById("history-list");

const statTotalEl = document.getElementById("stat-total");
const statProcessEl = document.getElementById("stat-process");
const statCompletedEl = document.getElementById("stat-completed");

const productModal = document.getElementById("product-modal");
const openAddProductModalBtn = document.getElementById("open-add-product-modal");
const closeProductModalBtn = document.getElementById("close-product-modal");
const productForm = document.getElementById("product-form");
const productModalTitle = document.getElementById("product-modal-title");
const editProductIdEl = document.getElementById("edit-product-id");
const pNameEl = document.getElementById("p-name");
const pPriceEl = document.getElementById("p-price");
const pImageEl = document.getElementById("p-image");

const receiptModal = document.getElementById("receipt-modal");
const receiptBody = document.getElementById("receipt-body");
const closeModalBtn = document.getElementById("close-modal-btn");
const printReceiptBtn = document.getElementById("print-receipt-btn");

// RENDER PRODUK
function renderProducts() {
    productListEl.innerHTML = "";

    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-img"
            onerror="this.src='https://via.placeholder.com/150'">

            <div class="product-info">
                <div>
                    <h3>${product.name}</h3>
                    <p>${formatRupiah(product.price)}</p>
                </div>

                <div class="product-actions-btn">
                    <button class="btn-add" onclick="addToCart(${product.id})">Beli</button>
                    <button class="btn-edit" onclick="openEditProduct(${product.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteProduct(${product.id})">Hapus</button>
                </div>
            </div>
        `;

        productListEl.appendChild(card);
    });
}

// TAMBAH KE KERANJANG
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const item = cart.find(p => p.id === productId);

    if (item) {
        item.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    renderCart();
}

// UBAH QTY
function updateQty(productId, delta) {
    const item = cart.find(p => p.id === productId);
    if (!item) return;

    item.qty += delta;

    if (item.qty <= 0) {
        cart = cart.filter(p => p.id !== productId);
    }

    renderCart();
}

// HITUNG TOTAL
function calculateTotals() {
    const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.qty, 0
    );

    const percent = Math.max(
        0, Math.min(100, Number(discountValueEl.value) || 0)
    );

    const discountAmount = subtotal * percent / 100;
    const finalTotal = subtotal - discountAmount;

    subtotalPriceEl.innerText = formatRupiah(subtotal);
    discountAmountEl.innerText = "-" + formatRupiah(discountAmount);
    totalPriceEl.innerText = formatRupiah(finalTotal);

    calculateChange(finalTotal);

    return finalTotal;
}

// HITUNG KEMBALIAN
function calculateChange(finalTotal) {
    const cash = Number(cashGivenEl.value) || 0;

    changeDueEl.innerText =
        cash >= finalTotal && finalTotal > 0
            ? formatRupiah(cash - finalTotal)
            : formatRupiah(0);
}

// RENDER KERANJANG
function renderCart() {
    if (cart.length === 0) {
        cartListEl.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;color:#a0aec0">
                    Keranjang kosong
                </td>
            </tr>
        `;

        subtotalPriceEl.innerText = formatRupiah(0);
        discountAmountEl.innerText = "-" + formatRupiah(0);
        totalPriceEl.innerText = formatRupiah(0);
        changeDueEl.innerText = formatRupiah(0);
        return;
    }

    cartListEl.innerHTML = "";

    cart.forEach(item => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${item.name}</td>
            <td>${formatRupiah(item.price)}</td>
            <td>${item.qty}</td>
            <td>${formatRupiah(item.price * item.qty)}</td>
            <td>
                <button class="qty-btn" onclick="updateQty(${item.id},1)">+</button>
                <button class="qty-btn" onclick="updateQty(${item.id},-1)">-</button>
            </td>
        `;

        cartListEl.appendChild(row);
    });

    calculateTotals();
}

// STATISTIK
function updateStats() {
    statTotalEl.innerText = orderHistory.length;

    statProcessEl.innerText = orderHistory.filter(
        o => o.status === "Sedang Diproses"
    ).length;

    statCompletedEl.innerText = orderHistory.filter(
        o => o.status === "Selesai"
    ).length;
}

// RIWAYAT TRANSAKSI
function renderHistory() {
    if (orderHistory.length === 0) {
        historyListEl.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center;color:#7f8c8d">
                    Belum ada riwayat transaksi.
                </td>
            </tr>
        `;

        updateStats();
        return;
    }

    historyListEl.innerHTML = "";

    orderHistory.forEach((order, index) => {
        const row = document.createElement("tr");

        const badgeClass =
            order.status === "Selesai"
                ? "badge-completed"
                : "badge-process";

        row.innerHTML = `
            <td>${order.receiptNo}</td>
            <td>${order.customer}</td>

            <td>
                <span class="badge ${badgeClass}"
                    onclick="toggleStatus(${index})"
                    style="cursor:pointer">
                    ${order.status}
                </span>
            </td>

            <td>
                <button class="btn-detail" onclick="showReceipt(${index})">
                    Struk
                </button>
            </td>
        `;

        historyListEl.appendChild(row);
    });

    updateStats();
}

// UBAH STATUS
function toggleStatus(index) {
    if (!orderHistory[index]) return;

    orderHistory[index].status =
        orderHistory[index].status === "Selesai"
            ? "Sedang Diproses"
            : "Selesai";

    saveData();
    renderHistory();
}

// TAMBAH MENU
openAddProductModalBtn.addEventListener("click", () => {
    productModalTitle.innerText = "Tambah Menu Baru";
    editProductIdEl.value = "";
    pNameEl.value = "";
    pPriceEl.value = "";
    pImageEl.value = "";

    productModal.classList.remove("hidden");
});

closeProductModalBtn.addEventListener("click", () => {
    productModal.classList.add("hidden");
});

// EDIT MENU
function openEditProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    productModalTitle.innerText = "Edit Menu";
    editProductIdEl.value = product.id;
    pNameEl.value = product.name;
    pPriceEl.value = product.price;
    pImageEl.value = product.image;

    productModal.classList.remove("hidden");
}

// SIMPAN MENU
productForm.addEventListener("submit", event => {
    event.preventDefault();

    const id = editProductIdEl.value;
    const name = pNameEl.value.trim();
    const price = Number(pPriceEl.value);
    const image = pImageEl.value.trim();

    if (!name || !Number.isFinite(price) || price < 0 || !image) {
        alert("Mohon isi data menu dengan benar!");
        return;
    }

    if (id) {
        const product = products.find(p => p.id == id);

        if (product) {
            product.name = name;
            product.price = price;
            product.image = image;
        }
    } else {
        const newId = products.length
            ? Math.max(...products.map(p => p.id)) + 1
            : 1;

        products.push({ id: newId, name, price, image });
    }

    saveData();
    renderProducts();
    productModal.classList.add("hidden");
});

// HAPUS MENU
function deleteProduct(id) {
    if (!confirm("Yakin ingin menghapus menu ini?")) return;

    products = products.filter(p => p.id !== id);

    saveData();
    renderProducts();
}

// PROSES PEMBAYARAN
payBtn.addEventListener("click", () => {
    if (cart.length === 0) {
        alert("Keranjang belanja masih kosong!");
        return;
    }

    const customerName = customerNameEl.value.trim() || "Umum";

    const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.qty, 0
    );

    const discountPercent = Math.max(
        0, Math.min(100, Number(discountValueEl.value) || 0)
    );

    const discountAmount = subtotal * discountPercent / 100;
    const finalTotal = subtotal - discountAmount;
    const cash = Number(cashGivenEl.value) || 0;

    if (cash < finalTotal) {
        alert("Uang tunai kurang dari total pembayaran!");
        return;
    }

    const change = cash - finalTotal;

    const newOrder = {
        receiptNo: "TRX-" + Date.now(),
        customer: customerName,
        date: new Date().toLocaleString("id-ID"),
        items: cart.map(item => ({ ...item })),
        subtotal,
        discountPercent,
        discountAmount,
        finalTotal,
        cash,
        change,
        status: "Selesai"
    };

    // SIMPAN TRANSAKSI SECARA OTOMATIS
    orderHistory.unshift(newOrder);
    saveData();

    renderHistory();
    showReceiptModalContent(newOrder);

    // KOSONGKAN KERANJANG
    cart = [];
    customerNameEl.value = "";
    cashGivenEl.value = "";
    discountValueEl.value = "0";

    renderCart();
});

// TAMPILKAN STRUK
function showReceipt(index) {
    const order = orderHistory[index];
    if (!order) return;

    showReceiptModalContent(order);
}

function showReceiptModalContent(order) {
    let html = `
        <strong>No Transaksi:</strong> ${order.receiptNo}<br>
        <strong>Nama Pembeli:</strong> ${order.customer}<br>
        <strong>Tanggal:</strong> ${order.date || "-"}<br>
        <hr>
    `;

    order.items.forEach(item => {
        html += `
            ${item.name}<br>
            ${item.qty} x ${formatRupiah(item.price)}
            = ${formatRupiah(item.price * item.qty)}<br>
        `;
    });

    html += `
        <hr>
        Subtotal: ${formatRupiah(order.subtotal)}<br>
        Diskon (${order.discountPercent || 0}%):
        -${formatRupiah(order.discountAmount)}<br>

        <strong>Total Akhir: ${formatRupiah(order.finalTotal)}</strong><br>
        Tunai: ${formatRupiah(order.cash)}<br>
        Kembalian: ${formatRupiah(order.change)}<br>

        <hr>
        <center>Terima Kasih Atas Kunjungan Anda!</center>
    `;

    receiptBody.innerHTML = html;
    receiptModal.classList.remove("hidden");
}

// MODAL STRUK
closeModalBtn.addEventListener("click", () => {
    receiptModal.classList.add("hidden");
});

printReceiptBtn.addEventListener("click", () => {
    window.print();
});

// DISKON PERSEN SAJA
discountTypeEl.value = "percent";
discountTypeEl.disabled = true;

discountValueEl.min = 0;
discountValueEl.max = 100;

discountValueEl.addEventListener("input", () => {
    const value = Number(discountValueEl.value);

    if (discountValueEl.value !== "") {
        discountValueEl.value = Math.max(0, Math.min(100, value || 0));
    }

    calculateTotals();
});

cashGivenEl.addEventListener("input", calculateTotals);

// INISIALISASI
renderProducts();
renderCart();
renderHistory();

console.log("Kasir Pro siap digunakan!");
