/* Smart Shopping Website Portal - SPA using plain HTML, CSS and JavaScript */

let products = [];           // filled from products.json
let categories = [];
let cart = [];               // [{id, qty}] saved in localStorage
let selectedCategory = "All";
let searchText = "";

const app = document.getElementById("app");
const cartCount = document.getElementById("cart-count");

/* ---------- 1. Cart storage (localStorage) ---------- */
function loadCart() {
  try { cart = JSON.parse(localStorage.getItem("cart")) || []; }
  catch (e) { cart = []; }
}
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}
function updateCartCount() {
  cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
}

/* ---------- 2. Cart operations ---------- */
function addToCart(id) {
  const item = cart.find(c => c.id === id);
  if (item) item.qty++; else cart.push({ id, qty: 1 });
  saveCart();
}
function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(c => c.id !== id);
  saveCart();
  renderCart();
}
function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  saveCart();
  renderCart();
}
function cartTotal() {
  return cart.reduce((sum, c) => {
    const p = products.find(p => p.id === c.id);
    return sum + (p ? p.price * c.qty : 0);
  }, 0);
}

/* ---------- 3. Views (each returns HTML into <main>) ---------- */
function renderHome() {
  app.innerHTML = `
    <section class="hero">
      <h2>Welcome to Smart Shop</h2>
      <p>Browse categories, add items to your cart and checkout, all without a page reload.</p>
      <a class="btn light" href="#/products">Shop Now</a>
    </section>
    <h2 style="margin-top:24px">Featured Products</h2>
    <div class="grid">${products.slice(0, 4).map(productCard).join("")}</div>`;
}

function productCard(p) {
  return `<div class="card">
    <div class="emoji">${p.emoji}</div>
    <h3>${p.name}</h3>
    <div class="cat">${p.category}</div>
    <p>${p.desc}</p>
    <div class="price">₹${p.price}</div>
    <button class="btn" data-add="${p.id}">Add to Cart</button>
  </div>`;
}

function renderProducts() {
  const list = products.filter(p =>
    (selectedCategory === "All" || p.category === selectedCategory) &&
    p.name.toLowerCase().includes(searchText.toLowerCase()));
  app.innerHTML = `
    <h2>Products</h2>
    <div class="filters">
      ${categories.map(c => `<button class="${c === selectedCategory ? "active" : ""}" data-cat="${c}">${c}</button>`).join("")}
    </div>
    ${list.length ? `<div class="grid">${list.map(productCard).join("")}</div>`
                  : `<div class="empty">No products found.</div>`}`;
}

function renderCart() {
  if (cart.length === 0) {
    app.innerHTML = `<h2>Your Cart</h2><div class="empty">Your cart is empty. <a href="#/products">Start shopping</a></div>`;
    return;
  }
  const rows = cart.map(c => {
    const p = products.find(p => p.id === c.id);
    return `<tr>
      <td>${p.emoji} ${p.name}</td>
      <td>₹${p.price}</td>
      <td class="qty"><button data-dec="${p.id}">-</button><span>${c.qty}</span><button data-inc="${p.id}">+</button></td>
      <td>₹${p.price * c.qty}</td>
      <td><button class="btn danger" data-remove="${p.id}">Remove</button></td>
    </tr>`;
  }).join("");
  app.innerHTML = `
    <h2>Your Cart</h2>
    <div class="table-wrap"><table>
      <thead><tr><th>Product</th><th>Price</th><th>Quantity</th><th>Subtotal</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <div class="total">Total: ₹${cartTotal()}</div>
    <a class="btn" href="#/checkout">Proceed to Checkout</a>`;
}

function renderCheckout() {
  if (cart.length === 0) {
    app.innerHTML = `<h2>Checkout</h2><div class="empty">Your cart is empty. <a href="#/products">Add some products</a></div>`;
    return;
  }
  app.innerHTML = `
    <h2>Checkout</h2>
    <p style="margin-bottom:12px">Order total: <strong>₹${cartTotal()}</strong></p>
    <form id="checkout-form" novalidate>
      <label for="name">Full Name</label>
      <input id="name" type="text" placeholder="Your name">
      <div class="error" id="err-name"></div>

      <label for="email">Email</label>
      <input id="email" type="email" placeholder="you@example.com">
      <div class="error" id="err-email"></div>

      <label for="phone">Phone (10 digits)</label>
      <input id="phone" type="text" placeholder="9876543210">
      <div class="error" id="err-phone"></div>

      <label for="address">Address</label>
      <textarea id="address" rows="3" placeholder="Delivery address"></textarea>
      <div class="error" id="err-address"></div>

      <label for="pin">PIN Code (6 digits)</label>
      <input id="pin" type="text" placeholder="411044">
      <div class="error" id="err-pin"></div>

      <br><button class="btn" type="submit">Place Order</button>
    </form>`;
  document.getElementById("checkout-form").addEventListener("submit", handleCheckout);
}

function renderNotFound() {
  app.innerHTML = `<div class="empty"><h2>404</h2><p>Page not found. <a href="#/home">Go Home</a></p></div>`;
}

/* ---------- 4. Client-side validation ---------- */
function setError(field, message) {
  document.getElementById("err-" + field).textContent = message;
  document.getElementById(field).classList.toggle("invalid", message !== "");
  return message === "";
}
function handleCheckout(e) {
  e.preventDefault();
  const v = id => document.getElementById(id).value.trim();
  let ok = true;
  ok = setError("name", /^[A-Za-z ]{3,}$/.test(v("name")) ? "" : "Enter a valid name (letters only, min 3).") && ok;
  ok = setError("email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v("email")) ? "" : "Enter a valid email address.") && ok;
  ok = setError("phone", /^[6-9]\d{9}$/.test(v("phone")) ? "" : "Enter a valid 10 digit mobile number.") && ok;
  ok = setError("address", v("address").length >= 10 ? "" : "Address must be at least 10 characters.") && ok;
  ok = setError("pin", /^\d{6}$/.test(v("pin")) ? "" : "Enter a valid 6 digit PIN code.") && ok;
  if (!ok) return;

  const total = cartTotal();
  const orderId = "ORD" + Date.now().toString().slice(-6);
  cart = [];
  saveCart();
  app.innerHTML = `<div class="msg"><h2>✅ Order Placed!</h2>
    <p>Thank you, ${v("name")}. Your order <strong>${orderId}</strong> of ₹${total} will be delivered soon.</p>
    <br><a class="btn" href="#/products">Continue Shopping</a></div>`;
}

/* ---------- 5. Simulated client-side router (hash based) ---------- */
const routes = {
  home: renderHome,
  products: renderProducts,
  cart: renderCart,
  checkout: renderCheckout
};
function router() {
  const route = (location.hash.replace("#/", "") || "home");
  (routes[route] || renderNotFound)();
  document.querySelectorAll(".nav a").forEach(a =>
    a.classList.toggle("active", a.dataset.route === route));
  window.scrollTo(0, 0);
}

/* ---------- 6. Event delegation for buttons rendered dynamically ---------- */
app.addEventListener("click", e => {
  const t = e.target;
  if (t.dataset.add) { addToCart(+t.dataset.add); t.textContent = "Added ✓"; setTimeout(() => t.textContent = "Add to Cart", 800); }
  if (t.dataset.cat) { selectedCategory = t.dataset.cat; renderProducts(); }
  if (t.dataset.inc) changeQty(+t.dataset.inc, 1);
  if (t.dataset.dec) changeQty(+t.dataset.dec, -1);
  if (t.dataset.remove) removeFromCart(+t.dataset.remove);
});
document.getElementById("search").addEventListener("input", e => {
  searchText = e.target.value;
  if (location.hash !== "#/products") location.hash = "#/products"; else renderProducts();
});
window.addEventListener("hashchange", router);

/* ---------- 7. Start: load JSON with fetch, then route ---------- */
async function init() {
  loadCart();
  updateCartCount();
  try {
    const res = await fetch("products.json");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    products = data.products;
    categories = data.categories;
    router();
  } catch (err) {
    app.innerHTML = `<div class="empty">Could not load products. Run the project using Live Server (not by double-clicking the file).<br><small>${err.message}</small></div>`;
  }
}
init();
