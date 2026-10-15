// Data Awal Produk dengan URL Foto
let products = [
    { id: 1, name: "Kopi Hitam", price: 15000, image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300" },
    { id: 2, name: "Es Teh Manis", price: 5000, image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300" },
    { id: 3, name: "Roti Bakar", price: 12000, image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300" },
    { id: 4, name: "Nasi Goreng", price: 20000, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300" }
];

let cart = [];
let orderHistory = [];

// Elemen DOM
const productListEl = document.getElementById('product-list');
const cartListEl = document.getElementById('cart-list');
const subtotalPriceEl = document.getElementById('subtotal-price');
const discountAmountEl = document.getElementById('discount-amount');
const totalPriceEl = document.getElementById('total-price');
const cashGivenEl = document.getElementById('cash-given');
const changeDueEl = document.getElementById('change-due');
const payBtn = document.getElementById('pay-btn');
const discountTypeEl = document.getElementById('discount-type');
const discountValueEl = document.getElementById('discount-value');
const customerNameEl = document.getElementById('customer-name');
const historyListEl = document.getElementById('history-list');

// Elemen Statistik
const statTotalEl = document.getElementById('stat-total');
const statProcessEl = document.getElementById('stat-process');
const statCompletedEl = document.getElementById('stat-completed');

// Elemen Modal Produk
const productModal = document.getElementById('product-modal');
const openAddProductModalBtn = document.getElementById('open-add-product-modal');
const closeProductModalBtn = document.getElementById('close-product-modal');
const productForm = document.getElementById('product-form');
const productModalTitle = document.getElementById('product-modal-title');
const editProductIdEl = document.getElementById('edit-product-id');
const pNameEl = document.getElementById('p-name');
const pPriceEl = document.getElementById('p-price');
const pImageEl = document.getElementById('p-image');

// Elemen Modal Struk
const receiptModal = document.getElementById('receipt-modal');
const receiptBody = document.getElementById('receipt-body');
const closeModalBtn = document.getElementById('close-modal-btn');
const printReceiptBtn = document.getElementById('print-receipt-btn');

// Render Katalog Produk
function renderProducts() {
    productListEl.innerHTML = '';
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-img" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
            <div class="product-info">
                <div>
                    <h3>${product.name}</h3>
                    <p>Rp ${product.price.toLocaleString()}</p>
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

// Tambah Produk ke Keranjang
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const cartItem = cart.find(item => item.id === productId);

    if (cartItem) {
        cartItem.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    renderCart();
}

// Ubah Kuantitas Keranjang
function updateQty(productId, delta) {
    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        cartItem.qty += delta;
        if (cartItem.qty <= 0) {
            cart = cart.filter(item => item.id !== productId);
        }
    }
    renderCart();
}

// Kalkulasi Total, Diskon, Kembalian
function calculateTotals() {
    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    let discType = discountTypeEl.value;
    let discVal = parseFloat(discountValueEl.value) || 0;
    let discountAmount = discType === 'percent' ? (subtotal * discVal) / 100 : discVal;

    if (discountAmount > subtotal) discountAmount = subtotal;
    let finalTotal = subtotal - discountAmount;

    subtotalPriceEl.innerText = `Rp ${subtotal.toLocaleString()}`;
    discountAmountEl.innerText = `-Rp ${discountAmount.toLocaleString()}`;
    totalPriceEl.innerText = `Rp ${finalTotal.toLocaleString()}`;

    calculateChange(finalTotal);
    return finalTotal;
}

function calculateChange(finalTotal) {
    let cash = parseFloat(cashGivenEl.value) || 0;
    if (cash >= finalTotal && finalTotal > 0) {
        let change = cash - finalTotal;
        changeDueEl.innerText = `Rp ${change.toLocaleString()}`;
    } else {
        changeDueEl.innerText = 'Rp 0';
    }
}

// Render Keranjang Belanja
function renderCart() {
    if (cart.length === 0) {
        cartListEl.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #a0aec0;">Keranjang kosong</td></tr>`;
        subtotalPriceEl.innerText = 'Rp 0';
        discountAmountEl.innerText = '-Rp 0';
        totalPriceEl.innerText = 'Rp 0';
        changeDueEl.innerText = 'Rp 0';
        return;
    }

    cartListEl.innerHTML = '';
    cart.forEach(item => {
        let itemSubtotal = item.price * item.qty;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>Rp ${item.price.toLocaleString()}</td>
            <td>${item.qty}</td>
            <td>Rp ${itemSubtotal.toLocaleString()}</td>
            <td>
                <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
                <button class="qty-btn" onclick="updateQty(${item.id}, -1)">-</button>
            </td>
        `;
        cartListEl.appendChild(row);
    });

    calculateTotals();
}

// Statistik & Riwayat Pesanan
function updateStats() {
    let total = orderHistory.length;
    let processing = orderHistory.filter(o => o.status === 'Sedang Diproses').length;
    let completed = orderHistory.filter(o => o.status === 'Selesai').length;

    statTotalEl.innerText = total;
    statProcessEl.innerText = processing;
    statCompletedEl.innerText = completed;
}

function renderHistory() {
    if (orderHistory.length === 0) {
        historyListEl.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #7f8c8d;">Belum ada riwayat transaksi.</td></tr>`;
        updateStats();
        return;
    }

    historyListEl.innerHTML = '';
    orderHistory.forEach((order, index) => {
        const row = document.createElement('tr');
        let badgeClass = order.status === 'Selesai' ? 'badge-completed' : 'badge-process';
        row.innerHTML = `
            <td>${order.receiptNo}</td>
            <td>${order.customer}</td>
            <td>${order.date}</td>
            <td>Rp ${order.finalTotal.toLocaleString()}</td>
            <td><span class="badge ${badgeClass}" onclick="toggleStatus(${index})" style="cursor:pointer;" title="Klik ubah status">${order.status}</span></td>
            <td><button class="btn-detail" onclick="showReceipt(${index})">Struk</button></td>
        `;
        historyListEl.appendChild(row);
    });
    updateStats();
}

// Ubah Status Pesanan (Proses <-> Selesai)
function toggleStatus(index) {
    orderHistory[index].status = orderHistory[index].status === 'Sedang Diproses' ? 'Selesai' : 'Sedang Diproses';
    renderHistory();
}

// Modal Produk (Tambah / Edit Menu)
openAddProductModalBtn.addEventListener('click', () => {
    productModalTitle.innerText = "Tambah Menu Baru";
    editProductIdEl.value = "";
    pNameEl.value = "";
    pPriceEl.value = "";
    pImageEl.value = "";
    productModal.classList.remove('hidden');
});

closeProductModalBtn.addEventListener('click', () => {
    productModal.classList.add('hidden');
});

function openEditProduct(id) {
    const prod = products.find(p => p.id === id);
    if (!prod) return;

    productModalTitle.innerText = "Edit Menu";
    editProductIdEl.value = prod.id;
    pNameEl.value = prod.name;
    pPriceEl.value = prod.price;
    pImageEl.value = prod.image;
    productModal.classList.remove('hidden');
}

productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = editProductIdEl.value;
    const name = pNameEl.value;
    const price = parseFloat(pPriceEl.value);
    const image = pImageEl.value;

    if (id) {
        // Edit produk
        const prod = products.find(p => p.id == id);
        if (prod) {
            prod.name = name;
            prod.price = price;
            prod.image = image;
        }
    } else {
        // Tambah produk baru
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        products.push({ id: newId, name, price, image });
    }

    productModal.classList.add('hidden');
    renderProducts();
});

// Hapus Menu
function deleteProduct(id) {
    if (confirm("Apakah Anda yakin ingin menghapus menu ini?")) {
        products = products.filter(p => p.id !== id);
        renderProducts();
    }
}

// Proses Pembayaran
payBtn.addEventListener('click', () => {
    let customerName = customerNameEl.value.trim() || 'Umum';
    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    let discType = discountTypeEl.value;
    let discVal = parseFloat(discountValueEl.value) || 0;
    let discountAmount = discType === 'percent' ? (subtotal * discVal) / 100 : discVal;
    if (discountAmount > subtotal) discountAmount = subtotal;
    let finalTotal = subtotal - discountAmount;
    let cash = parseFloat(cashGivenEl.value) || 0;

    if (cart.length === 0) {
        alert('Keranjang belanja masih kosong!');
        return;
    }

    if (cash < finalTotal) {
        alert('Jumlah uang tunai kurang dari total pembayaran!');
        return;
    }

    let change = cash - finalTotal;
    let receiptNo = 'TRX-' + Math.floor(100000 + Math.random() * 900000);
    let currentDate = new Date().toLocaleString('id-ID');

    let newOrder = {
        receiptNo,
        customer: customerName,
        date: currentDate,
        items: [...cart],
        subtotal,
        discountAmount,
        finalTotal,
        cash,
        change,
        status: 'Selesai'
    };

    orderHistory.unshift(newOrder);
    renderHistory();
    showReceiptModalContent(newOrder);

    // Reset keranjang
    cart = [];
    customerNameEl.value = '';
    cashGivenEl.value = '';
    discountValueEl.value = '0';
    renderCart();
});

// Tampilkan Struk
function showReceipt(index) {
    showReceiptModalContent(orderHistory[index]);
}

function showReceiptModalContent(order) {
    let htmlContent = `
        No Transaksi: ${order.receiptNo}<br>
        Nama Pembeli: <b>${order.customer}</b><br>
        Tanggal: ${order.date}<br>
        ----------------------------------------<br>
    `;
    
    order.items.forEach(item => {
        let itemSub = item.price * item.qty;
        htmlContent += `${item.name}<br>  ${item.qty}x @Rp ${item.price.toLocaleString()} = Rp ${itemSub.toLocaleString()}<br>`;
    });

    htmlContent += `
        ----------------------------------------<br>
        Subtotal: Rp ${order.subtotal.toLocaleString()}<br>
        Diskon: -Rp ${order.discountAmount.toLocaleString()}<br>
        <b>Total Akhir: Rp ${order.finalTotal.toLocaleString()}</b><br>
        Tunai: Rp ${order.cash.toLocaleString()}<br>
        <b>Kembalian: Rp ${order.change.toLocaleString()}</b><br>
        ----------------------------------------<br>
        <center>Terima Kasih Atas Kunjungan Anda!</center>
    `;

    receiptBody.innerHTML = htmlContent;
    receiptModal.classList.remove('hidden');
}

closeModalBtn.addEventListener('click', () => receiptModal.classList.add('hidden'));
printReceiptBtn.addEventListener('click', () => window.print());

// Event listeners untuk kalkulasi instan
discountTypeEl.addEventListener('change', calculateTotals);
discountValueEl.addEventListener('input', calculateTotals);
cashGivenEl.addEventListener('input', calculateTotals);

// Inisialisasi Pertama
renderProducts();
renderHistory();