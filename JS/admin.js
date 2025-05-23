// =============================================
// لوحة تحكم المشرف - admin.js
// =============================================

// 1. تهيئة المتغيرات العامة
let currentAdmin = JSON.parse(localStorage.getItem('currentUser')) || null;
let products = JSON.parse(localStorage.getItem('products')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];

// 2. تهيئة لوحة التحكم عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    setupSidebarNavigation();

    //  التحقق من صلاحيات المشرف
     if (!currentAdmin || currentAdmin.role !== 'admin') {
        alert('You do not have permission to access the admin panel!');
         window.location.href = '../index.html';
         return;
     }

    // عرض معلومات المشرف
    document.getElementById('admin-name').textContent = `Hello, ${currentAdmin.name}`;
    
    // تحميل البيانات الأولية
    loadDashboardData();
    loadAllProducts();
    loadAllOrders();
    loadAllUsers();
    
    // إعداد معالجات الأحداث
    setupEventListeners();
});



function setupSidebarNavigation() {
    const menuItems = document.querySelectorAll('.sidebar li[data-section]');

    menuItems.forEach(item => {
        item.addEventListener('click', function () {
            // إزالة التفعيل من جميع العناصر
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');

            // إخفاء كل الأقسام
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });

            // إظهار القسم المطلوب
            const sectionId = this.getAttribute('data-section');
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.add('active');
            }

            // تحديث العنوان العلوي
            document.getElementById('section-title').textContent = this.textContent.trim();
        });
    });
}







// 3. تحميل بيانات لوحة التحكم
function loadDashboardData() {
    // تحديث الإحصائيات
    document.getElementById('products-count').textContent = products.length;
    document.getElementById('orders-count').textContent = orders.length;
    document.getElementById('users-count').textContent = users.length;
    
    // حساب إجمالي المبيعات
    const totalSales = orders.reduce((total, order) => total + (order.total || 0), 0);
    document.getElementById('total-sales').textContent = `$${totalSales.toFixed(2)}`;
    
    // عرض أحدث 5 طلبات
    const recentOrdersTable = document.querySelector('#recent-orders-table tbody');
    recentOrdersTable.innerHTML = '';
    
    const recentOrders = [...orders].reverse().slice(0, 5);
    recentOrders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${new Date(order.date).toLocaleDateString()}</td>
            <td>$${order.total?.toFixed(2) || '0.00'}</td>
            <td><span class="status-badge ${order.status || 'pending'}">${getOrderStatusText(order.status)}</span></td>
            <td><button onclick="viewOrderDetails(${order.id})" class="btn-view">View</button></td>
        `;
        recentOrdersTable.appendChild(row);
    });
}

// 4. إدارة المنتجات
function loadAllProducts() {
    const productsTable = document.getElementById('products-table');
    productsTable.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${product.image || '../img/default-product.png'}" alt="${product.name}" class="product-thumb"></td>
            <td>${product.name}</td>
            <td>$${product.price?.toFixed(2) || '0.00'}</td>
            <td>${product.category || 'General'}</td>
            <td class="actions">
                <button onclick="openEditProductModal(${product.id})" class="btn-edit"><i class="fas fa-edit"></i></button>
                <button onclick="confirmDeleteProduct(${product.id})" class="btn-delete"><i class="fas fa-trash"></i></button>
            </td>
        `;
        productsTable.appendChild(row);
    });
}

// 5. إدارة الطلبات
function loadAllOrders() {
    const ordersTable = document.getElementById('orders-table');
    ordersTable.innerHTML = '';
    
    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${order.customer?.name || 'Guest'}</td>
            <td>${new Date(order.date).toLocaleDateString()}</td>
            <td>$${order.total?.toFixed(2) || '0.00'}</td>
            <td><span class="status-badge ${order.status || 'pending'}">${getOrderStatusText(order.status)}</span></td>
            <td><button onclick="viewOrderDetails(${order.id})" class="btn-view">View</button></td>
        `;
        ordersTable.appendChild(row);
    });
}

// 6. إدارة المستخدمين
function loadAllUsers() {
    const usersTable = document.getElementById('users-table');
    usersTable.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role === 'admin' ? 'Admin' : 'User'}</td>
            <td>${new Date(user.joinDate || Date.now()).toLocaleDateString()}</td>
            <td class="actions">
                ${user.role !== 'admin' ? `<button onclick="promoteToAdmin('${user.email}')" class="btn-promote">Promote</button>` : ''}
                ${user.email !== currentAdmin.email ? `<button onclick="confirmDeleteUser('${user.email}')" class="btn-delete"><i class="fas fa-trash"></i></button>` : ''}
            </td>
        `;
        usersTable.appendChild(row);
    });
}

// 7. معالجات الأحداث
function setupEventListeners() {
    // البحث عن المنتجات
    document.getElementById('product-search').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) || 
            (product.description && product.description.toLowerCase().includes(searchTerm))
        );
        renderFilteredProducts(filteredProducts);
    });
    
    // تصفية الطلبات حسب الحالة
    document.getElementById('order-status-filter').addEventListener('change', function(e) {
        const status = e.target.value;
        const filteredOrders = status === 'all' ? orders : orders.filter(order => order.status === status);
        renderFilteredOrders(filteredOrders);
    });
    
    // نموذج إضافة/تعديل منتج
    document.getElementById('product-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveProduct();
        
    });
}

// 8. وظائف المنتجات
function showAddProductModal() {
    document.getElementById('modal-title').textContent = 'Add New Product';
    document.getElementById('product-id').value = '';
    document.getElementById('product-form').reset();
    document.getElementById('product-modal').style.display = 'flex';
}

function openEditProductModal(productId) {
    const product = products.find(p => p.id == productId);
    if (!product) return;
    
    document.getElementById('modal-title').textContent = 'Edit Product';
    document.getElementById('product-id').value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-category').value = product.category || 'electronics';
    document.getElementById('product-description').value = product.description || '';
    
    document.getElementById('product-modal').style.display = 'flex';
}

function saveProduct() {  
    const productId = document.getElementById('product-id').value;
    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const category = document.getElementById('product-category').value;
    const description = document.getElementById('product-description').value;
    
    if (productId) {
        // تعديل منتج موجود
        const index = products.findIndex(p => p.id == productId);
        if (index !== -1) {
            products[index] = { ...products[index], name, price, category, description };
        }
    } else {
        // إضافة منتج جديد
        const newProduct = {
            id: Date.now(),
            name,
            price,
            category,
            description,
            image: '../img/default-product.png',
            createdAt: new Date().toISOString()
        };
        products.push(newProduct);
    }
    
    localStorage.setItem('products', JSON.stringify(products));
    closeModal();
    loadAllProducts();
    loadDashboardData();
}

function confirmDeleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        deleteProduct(productId);
    }
}

function deleteProduct(productId) {
    products = products.filter(p => p.id != productId);
    localStorage.setItem('products', JSON.stringify(products));
    loadAllProducts();
    loadDashboardData();
}

// 9. وظائف الطلبات
function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id == orderId);
    if (!order) return;
    
    document.getElementById('order-id').textContent = order.id;
    document.getElementById('customer-name').textContent = order.customer?.name || 'Guest';
    document.getElementById('customer-email').textContent = order.customer?.email || 'Unknown';
    document.getElementById('customer-address').textContent = order.customer?.address || 'Unknown';
    document.getElementById('order-date').textContent = new Date(order.date).toLocaleString();
    document.getElementById('order-status').value = order.status || 'pending';
    document.getElementById('order-total').textContent = order.total?.toFixed(2) || '0.00';
    
    // عرض منتجات الطلب
    const orderProductsTable = document.getElementById('order-products');
    orderProductsTable.innerHTML = '';
    
    order.items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>$${item.price?.toFixed(2) || '0.00'}</td>
            <td>${item.quantity || 1}</td>
            <td>$${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
        `;
        orderProductsTable.appendChild(row);
    });
    
    document.getElementById('order-details-modal').style.display = 'flex';
}

function updateOrderStatus() {
    const orderId = parseInt(document.getElementById('order-id').textContent);
    const newStatus = document.getElementById('order-status').value;
    
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
        orders[orderIndex].status = newStatus;
        localStorage.setItem('orders', JSON.stringify(orders));
        loadAllOrders();
        loadDashboardData();
        closeModal();
    }
}

// 10. وظائف المستخدمين
function promoteToAdmin(userEmail) {
    if (confirm(`Are you sure you want to promote this user to admin?`)) {
        const userIndex = users.findIndex(u => u.email === userEmail);
        if (userIndex !== -1) {
            users[userIndex].role = 'admin';
            localStorage.setItem('users', JSON.stringify(users));
            loadAllUsers();
        }
    }
}

function confirmDeleteUser(userEmail) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        deleteUser(userEmail);
    }
}

function deleteUser(userEmail) {
    users = users.filter(u => u.email !== userEmail);
    localStorage.setItem('users', JSON.stringify(users));
    loadAllUsers();
}

// 11. وظائف مساعدة
function renderFilteredProducts(filteredProducts) {
    const productsTable = document.getElementById('products-table');
    productsTable.innerHTML = '';
    
    filteredProducts.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${product.image || '../img/default-product.png'}" alt="${product.name}" class="product-thumb"></td>
            <td>${product.name}</td>
            <td>$${product.price?.toFixed(2) || '0.00'}</td>
            <td>${product.category || 'General'}</td>
            <td class="actions">
                <button onclick="openEditProductModal(${product.id})" class="btn-edit"><i class="fas fa-edit"></i></button>
                <button onclick="confirmDeleteProduct(${product.id})" class="btn-delete"><i class="fas fa-trash"></i></button>
            </td>
        `;
        productsTable.appendChild(row);
    });
}

function renderFilteredOrders(filteredOrders) {
    const ordersTable = document.getElementById('orders-table');
    ordersTable.innerHTML = '';
    
    filteredOrders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${order.customer?.name || 'Guest'}</td>
            <td>${new Date(order.date).toLocaleDateString()}</td>
            <td>$${order.total?.toFixed(2) || '0.00'}</td>
            <td><span class="status-badge ${order.status || 'pending'}">${getOrderStatusText(order.status)}</span></td>
            <td><button onclick="viewOrderDetails(${order.id})" class="btn-view">View</button></td>
        `;
        ordersTable.appendChild(row);
    });
}

function getOrderStatusText(status) {
    const statusMap = {
        'pending': 'Pending',
        'processing': 'Processing',
        'shipped': 'Shipped',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '../login.html';
}

// جعل الدوال متاحة عالمياً للاستدعاء من HTML
window.showAddProductModal = showAddProductModal;
window.openEditProductModal = openEditProductModal;
window.confirmDeleteProduct = confirmDeleteProduct;
window.viewOrderDetails = viewOrderDetails;
window.updateOrderStatus = updateOrderStatus;
window.promoteToAdmin = promoteToAdmin;
window.confirmDeleteUser = confirmDeleteUser;
window.closeModal = closeModal;
window.logout = logout;
window.searchProducts = function() {
    const searchTerm = document.getElementById('product-search').value.toLowerCase();
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        (product.description && product.description.toLowerCase().includes(searchTerm))
    );
    renderFilteredProducts(filteredProducts);
};
window.filterOrders = function() {
    const status = document.getElementById('order-status-filter').value;
    const filteredOrders = status === 'all' ? orders : orders.filter(order => order.status === status);
    renderFilteredOrders(filteredOrders);
};










