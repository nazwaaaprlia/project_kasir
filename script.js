
"use strict";

// =====================================
// 1. PENYIMPANAN DATA
// =====================================

const STORAGE_KEYS = {
    products: "kasir_products",
    orders: "kasir_orders"
};

function loadData(key, fallback) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch (error) {
        console.error(error);
        return fallback;
    }
}

function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error(error);
        alert("Gagal menyimpan data. Periksa penyimpanan browser.");
        return false;
    }
}

// =====================================
// 2. DATA PRODUK
// =====================================

const defaultProducts = [
    { id: 1, name: "Kopi Hitam", price: 15000, image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300" },
    { id: 2, name: "Es Teh Manis", price: 5000, image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300" },
    { id: 3, name: "Roti Bakar", price: 12000, image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300" },
    { id: 4, name: "Nasi Goreng", price: 20000, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300" }
];

let products = loadData(STORAGE_KEYS.products, defaultProducts);
let orderHistory = loadData(STORAGE_KEYS.orders, []);
let cart = [];

if (!Array.isArray(products)) products = defaultProducts;
if (!Array.isArray(orderHistory)) orderHistory = [];

function saveProducts() {
    return saveData(STORAGE_KEYS.products, products);
}

function saveOrders() {
    return saveData(STORAGE_KEYS.orders, orderHistory);
}

function rupiah(value) {
    return "Rp " + Number(value || 0).toLocaleString("id-ID");
}

// =====================================
// 3. ELEMEN HTML
// =====================================

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

// =====================================
// 4. KATALOG PRODUK
// =====================================

function renderProducts() {
    productListEl.innerHTML = "";

    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}"
                 class="product-img"
                 onerror="this.src='https://via.placeholder.com/150'">

            <div class="product-info">
                <div>
                    <h3>${product.name}</h3>
                    <p>${rupiah(product.price)}</p>
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

// =====================================
// 5. KERANJANG
// =====================================

function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const item = cart.find(p => p.id === id);

    if (item) {
        item.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    renderCart();
}

function updateQty(id, delta) {
    const item = cart.find(p => p.id === id);
    if (!item) return;

    item.qty += delta;

    if (item.qty <= 0) {
        cart = cart.filter(p => p.id !== id);
    }

    renderCart();
}

// =====================================
// 6. DISKON DAN TOTAL
// =====================================

function getDiscount() {
    return Math.max(0, Math.min(100, Number(discountValueEl.value) || 0));
}

function calculateTotals() {
    const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.qty, 0
    );

    const discountPercent = getDiscount();
    const discount = subtotal * discountPercent / 100;
    const total = subtotal - discount;

    subtotalPriceEl.innerText = rupiah(subtotal);
    discountAmountEl.innerText = "-" + rupiah(discount);
    totalPriceEl.innerText = rupiah(total);

    calculateChange(total);
    return total;
}

function calculateChange(total) {
    const cash = Number(cashGivenEl.value) || 0;

    changeDueEl.innerText =
        cash >= total && total > 0
            ? rupiah(cash - total)
            : rupiah(0);
}

function renderCart() {
    if (cart.length === 0) {
        cartListEl.innerHTML = `
            <tr><td colspan="5" style="text-align:center">
                Keranjang kosong
            </td></tr>`;

        subtotalPriceEl.innerText = rupiah(0);
        discountAmountEl.innerText = "-" + rupiah(0);
        totalPriceEl.innerText = rupiah(0);
        changeDueEl.innerText = rupiah(0);
        return;
    }

    cartListEl.innerHTML = "";

    cart.forEach(item => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${item.name}</td>
            <td>${rupiah(item.price)}</td>
            <td>${item.qty}</td>
            <td>${rupiah(item.price * item.qty)}</td>
            <td>
                <button class="qty-btn" onclick="updateQty(${item.id},1)">+</button>
                <button class="qty-btn" onclick="updateQty(${item.id},-1)">-</button>
            </td>`;

        cartListEl.appendChild(row);
    });

    calculateTotals();
}

// =====================================
// 7. STATISTIK
// =====================================

function updateStats() {
    statTotalEl.innerText = orderHistory.length;

    statProcessEl.innerText =
        orderHistory.filter(o => o.status === "Sedang Diproses").length;

    statCompletedEl.innerText =
        orderHistory.filter(o => o.status === "Selesai").length;
}

// =====================================
// 8. RIWAYAT TRANSAKSI
// =====================================

function renderHistory() {
    if (orderHistory.length === 0) {
        historyListEl.innerHTML = `
            <tr><td colspan="4" style="text-align:center">
                Belum ada riwayat transaksi.
            </td></tr>`;

        updateStats();
        return;
    }

    historyListEl.innerHTML = "";

    orderHistory.forEach((order, index) => {
        const row = document.createElement("tr");

        const badge = order.status === "Selesai"
            ? "badge-completed"
            : "badge-process";

        row.innerHTML = `
            <td>${order.receiptNo}</td>
            <td>${order.customer}</td>
            <td>
                <span class="badge ${badge}"
                      onclick="toggleStatus(${index})"
                      style="cursor:pointer">
                    ${order.status}
                </span>
            </td>
            <td>
                <button class="btn-detail"
                        onclick="showReceipt(${index})">
                    Struk
                </button>
            </td>`;

        historyListEl.appendChild(row);
    });

    updateStats();
}

function toggleStatus(index) {
    if (!orderHistory[index]) return;

    orderHistory[index].status =
        orderHistory[index].status === "Selesai"
            ? "Sedang Diproses"
            : "Selesai";

    if (!saveOrders()) return;
    renderHistory();
}

// =====================================
// 9. TAMBAH DAN EDIT PRODUK
// =====================================

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

productForm.addEventListener("submit", event => {
    event.preventDefault();

    const id = editProductIdEl.value;
    const name = pNameEl.value.trim();
    const price = Number(pPriceEl.value);
    const image = pImageEl.value.trim();

    if (!name || !Number.isFinite(price) || price < 0 || !image) {
        alert("Isi data menu dengan benar!");
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

    if (!saveProducts()) return;

    productModal.classList.add("hidden");
    renderProducts();
    renderCart();
});

function deleteProduct(id) {
    if (!confirm("Yakin ingin menghapus menu ini?")) return;

    const oldProducts = products;
    products = products.filter(p => p.id !== id);

    if (!saveProducts()) {
        products = oldProducts;
        return;
    }

    cart = cart.filter(p => p.id !== id);

    renderProducts();
    renderCart();
}

// =====================================
// 10. PEMBAYARAN
// =====================================

function generateReceiptNo() {
    return "TRX-" + Date.now() + "-" +
        Math.floor(Math.random() * 1000);
}

payBtn.addEventListener("click", () => {
    if (cart.length === 0) {
        alert("Keranjang masih kosong!");
        return;
    }

    const customer = customerNameEl.value.trim() || "Umum";

    const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.qty, 0
    );

    const discountPercent = getDiscount();
    const discountAmount = subtotal * discountPercent / 100;
    const finalTotal = subtotal - discountAmount;
    const cash = Number(cashGivenEl.value) || 0;

    if (cash < finalTotal) {
        alert("Uang tunai tidak mencukupi!");
        return;
    }

    const items = cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        subtotal: item.price * item.qty
    }));

    const newOrder = {
        receiptNo: generateReceiptNo(),
        customer: customer,
        date: new Date().toISOString(),
        items: items,
        subtotal: subtotal,
        discountPercent: discountPercent,
        discountAmount: discountAmount,
        finalTotal: finalTotal,
        cash: cash,
        change: cash - finalTotal,
        status: "Selesai"
    };

    orderHistory.unshift(newOrder);

    if (!saveOrders()) {
        orderHistory.shift();
        alert("Transaksi gagal disimpan. Pembayaran dibatalkan.");
        return;
    }

    renderHistory();
    showReceiptModalContent(newOrder);

    cart = [];
    customerNameEl.value = "";
    cashGivenEl.value = "";
    discountValueEl.value = "0";

    renderCart();
});

// =====================================
// 11. CETAK DAN LIHAT STRUK
// =====================================

function showReceipt(index) {
    const order = orderHistory[index];
    if (!order) return;

    showReceiptModalContent(order);
}

function showReceiptModalContent(order) {
    let html = `
        <strong>No Transaksi:</strong> ${order.receiptNo}<br>
        <strong>Nama Pembeli:</strong> ${order.customer}<br>
        <strong>Tanggal:</strong>
        ${new Date(order.date).toLocaleString("id-ID")}
        <hr>
    `;

    order.items.forEach(item => {
        html += `
            ${item.name}<br>
            ${item.qty} x ${rupiah(item.price)}
            = ${rupiah(item.subtotal ?? item.price * item.qty)}
            <br><br>
        `;
    });

    html += `
        <hr>
        Subtotal: ${rupiah(order.subtotal)}<br>
        Diskon (${order.discountPercent ?? 0}%):
        -${rupiah(order.discountAmount)}<br>
        <strong>Total Akhir: ${rupiah(order.finalTotal)}</strong><br>
        Tunai: ${rupiah(order.cash)}<br>
        Kembalian: ${rupiah(order.change)}<br>
        <hr>
        <center>Terima Kasih Atas Kunjungan Anda!</center>
    `;

    receiptBody.innerHTML = html;
    receiptModal.classList.remove("hidden");
}

closeModalBtn.addEventListener("click", () => {
    receiptModal.classList.add("hidden");
});

printReceiptBtn.addEventListener("click", () => {
    window.print();
});

// =====================================
// 12. INPUT DISKON DAN UANG
// =====================================

discountTypeEl.value = "percent";
discountTypeEl.disabled = true;

discountValueEl.min = 0;
discountValueEl.max = 100;

discountValueEl.addEventListener("input", () => {
    if (Number(discountValueEl.value) > 100) {
        discountValueEl.value = 100;
    }

    if (Number(discountValueEl.value) < 0) {
        discountValueEl.value = 0;
    }

    calculateTotals();
});

cashGivenEl.addEventListener("input", calculateTotals);

// =====================================
// 13. JALANKAN APLIKASI
// =====================================

renderProducts();
renderCart();
renderHistory();

console.log("Aplikasi Kasir Pro berhasil dijalankan.");
console.log("Total transaksi tersimpan:", orderHistory.length);
