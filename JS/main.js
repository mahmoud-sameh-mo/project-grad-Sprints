// open & close Cart

var cart = document.querySelector('.cart');

function open_cart() {
    cart.classList.add("active")
}
function close_cart() {
    cart.classList.remove("active")
}

// open & close menu

var menu = document.querySelector('#menu');

function open_menu() {
    menu.classList.add("active")
}
function close_menu() {
    menu.classList.remove("active")
}

//change item image

let bigImage = document.getElementById("bigImg");

function ChangeItemImage(img) {
    bigImage.src = img
}



/* add itmes in cart */

var all_products_json;

var items_in_cart = document.querySelector(".items_in_cart");
let product_cart = [];

function addToCart(id , btn) {
    product_cart.push(all_products_json[id])
    btn.classList.add("active")

    console.log(product_cart);
    getCartItems()
}

let count_item = document.querySelector('.count_item');
let count_item_cart = document.querySelector('.count_item_cart');
let price_cart_total = document.querySelector('.price_cart_total');

let price_cart_Head = document.querySelector('.price_cart_Head');

function getCartItems() {
    let total_price = 0;

    let items_c = "";
    for (let i = 0; i < product_cart.length; i++) {
        items_c += `

        <div class="item_cart">
                <img src="${product_cart[i].img}" alt="">
                <div class="content">
                    <h4>${product_cart[i].name}</h4>
                    <p class="price_cart">${product_cart[i].price}</p>
                </div>
                <button onClick="remove_from_cart(${i})" class="delete_item"><i class="fa-solid fa-trash-can"></i></button>
            </div>
        
        `
        total_price += product_cart[i].price
        
    }
    items_in_cart.innerHTML = items_c

    price_cart_Head.innerHTML = "$" + total_price
    count_item.innerHTML = product_cart.length

    count_item_cart.innerHTML = ` (${product_cart.length}Item in Cart)`
    price_cart_total.innerHTML = "$" + total_price
}


function remove_from_cart(index) {
    product_cart.splice(index, 1)
    getCartItems()

    let addToCartButtons = document.querySelectorAll(".fa-cart-plus");
    for (let i = 0; i < addToCartButtons.length; i++) {
        addToCartButtons[i].classList.remove("active")
        
        product_cart.forEach(product =>{
            if(product.id == i){
                addToCartButtons[i].classList.add("active")
            }
        })
    }
}


// back_to_top js

let back_to_top = document.querySelector(".back_to_top")

back_to_top.addEventListener("click", function(){
    window.scrollTo({
        top: 0,
        behavior:"smooth"
    })
})









// في ملف main.js أو ملف جديد auth.js
let users = JSON.parse(localStorage.getItem('users')) || [];

// تسجيل مستخدم جديد
document.querySelector('.form-btn').addEventListener('click', (e) => {
  e.preventDefault();
  const name = document.querySelector('input[type="text"]').value;
  const email = document.querySelector('input[type="email"]').value;
  const password = document.querySelector('input[type="password"]').value;

  // تحقق من البريد الإلكتروني وكلمة المرور
  if (!email.includes('@')) {
    alert('البريد الإلكتروني غير صالح!');
    return;
  }
  if (password.length < 8) {
    alert('كلمة المرور يجب أن تكون 8 أحرف على الأقل!');
    return;
  }

  // حفظ المستخدم
  users.push({ name, email, password, role: 'user' });
  localStorage.setItem('users', JSON.stringify(users));
  alert('تم التسجيل بنجاح!');
  window.location.href = 'login.html';
});

// تسجيل الدخول
document.querySelector('.form-btn').addEventListener('click', (e) => {
  e.preventDefault();
  const email = document.querySelector('input[type="email"]').value;
  const password = document.querySelector('input[type="password"]').value;

  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = 'index.html';
  } else {
    alert('بيانات الدخول غير صحيحة!');
  }
});




// إضافة طلب جديد
function checkout() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const newOrder = {
      id: Date.now(),
      items: product_cart,
      total: product_cart.reduce((sum, item) => sum + item.price, 0),
      date: new Date().toLocaleString(),
      status: 'قيد الانتظار'
    };
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    product_cart = [];
    localStorage.removeItem('cart');
    alert('تم تأكيد الطلب بنجاح!');
  }