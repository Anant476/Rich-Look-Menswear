// Default products
const defaultProducts = [
  {
    id: 1,
    name: "Classic Shirt",
    price: 799,
    image: "https://placehold.co/300x350",
    sizeOptions: ["S","M","L","XL"]
  },
  {
    id: 2,
    name: "Denim Jacket",
    price: 1499,
    image: "https://placehold.co/300x350",
    sizeOptions: ["M","L","XL"]
  },
  {
    id: 3,
    name: "Kids T-Shirt",
    price: 499,
    image: "https://placehold.co/300x350",
    sizeOptions: ["4","6","8"]
  }
];

function loadProducts() {
  const stored = localStorage.getItem("products");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultProducts;
    }
  }
  return defaultProducts;
}

function saveProducts(products) {
  localStorage.setItem("products", JSON.stringify(products));
}

let products = loadProducts();
let cart = [];

function createWhatsAppLink(product, size) {
  const base = "https://wa.me/918123456789"; // ← replace with real WhatsApp number, e.g. 91xxxxxxxxxx
  const text = `Hi, I want to order *${product.name}* size ${size} at ₹${product.price}.`;
  return `${base}?text=${encodeURIComponent(text)}`;
}

function renderProducts() {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = "";
  products.forEach(p => {
    const col = document.createElement("div");
    col.className = "col-6 col-md-4 col-lg-3";
    col.innerHTML = `
      <div class="card product-card shadow-sm h-100">
        <div class="ribbon">New</div>
        <img src="${p.image}" class="card-img-top" alt="${p.name}">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between">
            <div class="product-title">${p.name}</div>
            <div class="dropdown">
              <button class="btn btn-sm btn-light dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">⋮</button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item edit-product" href="#" data-id="${p.id}">Edit</a></li>
                <li><a class="dropdown-item delete-product text-danger" href="#" data-id="${p.id}">Delete</a></li>
              </ul>
            </div>
          </div>
          <div class="price">₹${p.price}</div>
          <div class="mb-2">
            <select class="form-select form-select-sm size-select" data-product-id="${p.id}">
              ${p.sizeOptions.map(s => `<option value="${s}">${s}</option>`).join("")}
            </select>
          </div>
          <div class="mt-auto d-flex gap-2">
            <button class="btn btn-sm btn-primary flex-grow-1 add-cart-btn" style="border-radius: 999px;">Add to Cart</button>
            <a href="#" class="btn btn-sm btn-outline-success whatsapp-btn" target="_blank" style="border-radius: 999px;">
              <span class="badge-whatsapp">WhatsApp</span> Order
            </a>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(col);
  });

  // Wire up WhatsApp links
  document.querySelectorAll(".whatsapp-btn").forEach(btn => {
    const card = btn.closest(".card");
    const title = card.querySelector(".product-title").textContent;
    const product = products.find(p => p.name === title);
    const sizeSelect = card.querySelector(".size-select");
    const updateLink = () => {
      const size = sizeSelect.value;
      btn.href = createWhatsAppLink(product, size);
    };
    sizeSelect.addEventListener("change", updateLink);
    updateLink();
  });

  // Edit/Delete handlers
  document.querySelectorAll(".edit-product").forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      const id = Number(a.dataset.id);
      openAdminEditor(id);
    });
  });
  document.querySelectorAll(".delete-product").forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      const id = Number(a.dataset.id);
      if (confirm("Delete this product?")) {
        products = products.filter(p => p.id !== id);
        saveProducts(products);
        renderProducts();
      }
    });
  });

  // Add to cart buttons
  document.querySelectorAll(".add-cart-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".card");
      const title = card.querySelector(".product-title").textContent;
      const product = products.find(p => p.name === title);
      const size = card.querySelector(".size-select").value;
      addToCart(product, size);
    });
  });
}

function addToCart(product, size) {
  const key = `${product.id}-${size}`;
  const existing = cart.find(c => c.key === key);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ key, product, size, qty: 1 });
  }
  renderCart();
}

function renderCart() {
  const panel = document.getElementById("cart-panel");
  const itemsDiv = document.getElementById("cart-items");
  const totalSpan = document.getElementById("cart-total");
  if (cart.length === 0) {
    panel.style.display = "none";
    return;
  }
  panel.style.display = "block";
  itemsDiv.innerHTML = "";
  let total = 0;
  cart.forEach(entry => {
    const line = document.createElement("div");
    line.className = "d-flex justify-content-between small mb-1";
    line.innerHTML = `
      <div>${entry.product.name} (${entry.size}) x${entry.qty}</div>
      <div>₹${entry.product.price * entry.qty}</div>
    `;
    itemsDiv.appendChild(line);
    total += entry.product.price * entry.qty;
  });
  totalSpan.textContent = `₹${total}`;

  const base = "https://wa.me/918123456789"; // replace with real number
  let msg = "Hi, I want to order:%0A";
  cart.forEach(e => {
    msg += `- ${e.product.name} size ${e.size} x${e.qty} = ₹${e.product.price * e.qty}%0A`;
  });
  msg += `Total: ₹${total}%0A`;
  document.getElementById("whatsapp-checkout").href = `${base}?text=${msg}`;
}

document.getElementById("clear-cart").addEventListener("click", () => {
  cart = [];
  renderCart();
});

// Admin panel
function openAdminEditor(editId = null) {
  let product;
  if (editId !== null) {
    product = products.find(p => p.id === editId);
    if (!product) return;
  } else {
    product = { id: Date.now(), name: "", price: 0, image: "", sizeOptions: [] };
  }
  const name = prompt("Product name:", product.name);
  if (name === null) return;
  const priceRaw = prompt("Price (number):", product.price);
  if (priceRaw === null) return;
  const image = prompt("Image URL:", product.image || "https://placehold.co/300x350");
  if (image === null) return;
  const sizes = prompt("Sizes (comma separated):", product.sizeOptions.join(","));
  if (sizes === null) return;

  product.name = name.trim() || product.name;
  product.price = parseInt(priceRaw, 10) || product.price;
  product.image = image.trim();
  product.sizeOptions = sizes.split(",").map(s => s.trim()).filter(Boolean);

  if (editId !== null) {
    products = products.map(p => (p.id === editId ? product : p));
  } else {
    products.push(product);
  }
  saveProducts(products);
  renderProducts();
}

document.getElementById("admin-toggle").addEventListener("click", () => {
  const action = prompt("Type 'add' to add product, 'clear' to reset all products:");
  if (!action) return;
  if (action.toLowerCase() === "add") {
    openAdminEditor(null);
  } else if (action.toLowerCase() === "clear") {
    if (confirm("Clear all saved products and restore defaults?")) {
      localStorage.removeItem("products");
      products = loadProducts();
      renderProducts();
    }
  }
});

// Initial render
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  renderCart();
  // staggered fade-in
  setTimeout(() => {
    document.querySelectorAll('.product-card').forEach((c, i) => {
      c.style.opacity = 0;
      setTimeout(() => {
        c.style.transition = 'opacity .6s ease, transform .3s ease';
        c.style.opacity = 1;
      }, 100 * i);
    });
  }, 100);
});
