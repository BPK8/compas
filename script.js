// Navbar show on scroll up
const nav = document.querySelector(".nav");
let lastScroll = window.scrollY;

window.addEventListener("scroll", () => {
  const currentScroll = window.scrollY;

  if (currentScroll < lastScroll && currentScroll > 80) {
    // scroll ke atas
    nav.classList.add("scrolled");
  } else {
    // scroll ke bawah
    nav.classList.remove("scrolled");
  }

  lastScroll = currentScroll;
});

// ===============================
// Countdown Flip 3D (Deep)
// ===============================

const countdownTarget = new Date(2026, 0, 20, 0, 0, 0).getTime();
const numbers = document.querySelectorAll(".countdown__number");

let lastValues = ["", "", ""];

function flip(el, value, index) {
  if (lastValues[index] === value) return;

  el.classList.remove("flip");
  void el.offsetWidth; // reset animation

  el.textContent = value;
  el.classList.add("flip");

  lastValues[index] = value;
}

function updateCountdown() {
  const now = Date.now();
  const distance = countdownTarget - now;

  if (distance <= 0) {
    numbers.forEach((el, i) => flip(el, "00", i));
    return;
  }

  const hours = String(
    Math.floor((distance / (1000 * 60 * 60)) % 24)
  ).padStart(2, "0");

  const minutes = String(
    Math.floor((distance / (1000 * 60)) % 60)
  ).padStart(2, "0");

  const seconds = String(
    Math.floor((distance / 1000) % 60)
  ).padStart(2, "0");

  flip(numbers[0], hours, 0);
  flip(numbers[1], minutes, 1);
  flip(numbers[2], seconds, 2);
}

updateCountdown();
setInterval(updateCountdown, 1000);

document.querySelectorAll(".quick-cart-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();

    const card = btn.closest(".collection__item");
    const name = card.querySelector("h4").innerText;
    const priceText = card.querySelector(".price").innerText.replace(/\D/g, "");
    const price = Number(priceText);

    let cart = getCart();

    const existing = cart.find(item => item.name === name);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: Date.now(),
        name,
        price,
        qty: 1
      });
    }

    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    renderCart();

    btn.textContent = "ADDED ✓";
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = "ADD TO CART";
      btn.disabled = false;
    }, 1200);
  });
});


// ===============================
// Render Cart to Page
// ===============================
const CART_KEY = "compas_cart";

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function formatRupiah(num) {
  return "Rp" + num.toLocaleString("id-ID");
}

function renderCart() {
  const cartItemsEl = document.getElementById("cart-items");
  const cartTotalEl = document.getElementById("cart-total");

  if (!cartItemsEl) return;

  const cart = getCart();
  cartItemsEl.innerHTML = "";

  if (cart.length === 0) {
    cartItemsEl.innerHTML = "<p>Cart masih kosong.</p>";
    cartTotalEl.textContent = "Rp0";
    return;
  }

  let total = 0;

  cart.forEach(item => {
    total += item.price * item.qty;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <div>
        <strong>${item.name}</strong><br>
        <small>${formatRupiah(item.price)} x ${item.qty}</small>
      </div>
      <div>
        <button class="remove-item" data-id="${item.id}">✕</button>
      </div>
    `;

    cartItemsEl.appendChild(div);
  });

  cartTotalEl.textContent = formatRupiah(total);

  // remove handler
  document.querySelectorAll(".remove-item").forEach(btn => {
    btn.addEventListener("click", () => {
      removeFromCart(Number(btn.dataset.id));
    });
  });
}

function removeFromCart(id) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== id);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
}

// clear cart
const clearBtn = document.getElementById("clear-cart");
if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    localStorage.removeItem(CART_KEY);
    renderCart();
  });
}

// initial render
renderCart();

// ===============================
// Gallery Masonry (Grid row-span)
// ===============================
function resizeGalleryItem(item) {
  const gallery = item.closest(".gallery");
  if (!gallery) return;

  const rowHeight = parseInt(getComputedStyle(gallery).getPropertyValue("grid-auto-rows"));
  const gap = parseInt(getComputedStyle(gallery).getPropertyValue("gap"));

  // tinggi konten aktual (img)
  const contentHeight = item.getBoundingClientRect().height;

  // hitung span row
  const rowSpan = Math.ceil((contentHeight + gap) / (rowHeight + gap));
  item.style.gridRowEnd = `span ${rowSpan}`;
}

function layoutGallery() {
  document.querySelectorAll(".gallery .gallery__image").forEach((item) => {
    resizeGalleryItem(item);
  });
}

// tunggu semua gambar load supaya tinggi akurat
function initGalleryMasonry() {
  const images = document.querySelectorAll(".gallery .gallery__image img");
  let loaded = 0;

  if (images.length === 0) return;

  images.forEach((img) => {
    if (img.complete) {
      loaded++;
      if (loaded === images.length) layoutGallery();
      return;
    }

    img.addEventListener("load", () => {
      loaded++;
      if (loaded === images.length) layoutGallery();
    });

    img.addEventListener("error", () => {
      loaded++;
      if (loaded === images.length) layoutGallery();
    });
  });

  // relayout saat resize
  window.addEventListener("resize", () => {
    layoutGallery();
  });
}

document.addEventListener("DOMContentLoaded", initGalleryMasonry);

// ===============================
// Scroll Reveal (Gallery)
// ===============================
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".gallery__image").forEach((item) => {
  observer.observe(item);
});

const cursor = document.querySelector(".cursor-view");
const galleryItems = document.querySelectorAll(".gallery__image");

window.addEventListener("mousemove", (e) => {
  cursor.style.left = e.clientX + "px";
  cursor.style.top = e.clientY + "px";
});

galleryItems.forEach(item => {
  const color = item.dataset.color || "rgba(0,0,0,.65)";

  item.addEventListener("mouseenter", () => {
    cursor.style.setProperty("--cursor-color", color);
    cursor.classList.add("active");
  });

  item.addEventListener("mouseleave", () => {
    cursor.classList.remove("active");
  });
});
