// Load from localStorage if available, else use defaults
const defaultProducts = [
  {
    name: "Premium Shirt",
    price: 999,
    image: "https://via.placeholder.com/200x250?text=Shirt"
  },
  {
    name: "Trendy T-shirt",
    price: 699,
    image: "https://via.placeholder.com/200x250?text=T-shirt"
  }
];



// Product Management Functions
function loadProducts() {
    const stored = localStorage.getItem("adminProducts");
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            return Array.isArray(parsed) ? parsed : defaultProducts;
        } catch {
            return defaultProducts;
        }
    }
    return defaultProducts;
}

function saveProducts(products) {
    localStorage.setItem("adminProducts", JSON.stringify(products));
}

let products = loadProducts();
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// WhatsApp Integration
function createWhatsAppLink(product, size = "M") {
    const base = "https://wa.me/9960761173"; // Replace with your WhatsApp number
    const text = `Hi, I want to order *${product.name}* (Size: ${size}) at ₹${product.price}.`;
    return `${base}?text=${encodeURIComponent(text)}`;
}

function createWhatsAppCartLink() {
    const base = "https://wa.me/9960761173";
    let message = "Hi, I want to order the following items:\n\n";
    
    cart.forEach(item => {
        message += `- ${item.product.name} (Size: ${item.size}) x${item.qty} = ₹${item.product.price * item.qty}\n`;
    });
    
    message += `\nTotal: ₹${calculateCartTotal()}`;
    return `${base}?text=${encodeURIComponent(message)}`;
}

// Product Rendering
function renderProducts() {
    const grid = document.getElementById("product-grid");
    if (!grid) return;
    
    grid.innerHTML = "";
    
    products.forEach(product => {
        const col = document.createElement("div");
        col.className = "col-6 col-md-4 col-lg-3";
        
        col.innerHTML = `
    <div class="card product-card shadow-sm h-100">
        <img src="${product.image}" class="card-img-top" alt="${product.name}" loading="lazy">
        <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between">
                <h6 class="card-title mb-1">${product.name}</h6>
            </div>
            <p class="mb-1">₹${product.price}</p>
            <select class="form-select form-select-sm mb-2 size-select">
                ${(product.sizeOptions || ['Free Size']).map(size => 
                    `<option value="${size}">${size}</option>`
                ).join("")}
            </select>
            <div class="mt-auto d-flex gap-2">
                <button class="btn btn-sm btn-primary flex-grow-1 add-cart-btn">Add to Cart</button>
                <a href="${createWhatsAppLink(product, (product.sizeOptions || ['Free Size'])[0])}" 
                   class="btn btn-sm btn-outline-success whatsapp-btn" target="_blank">
                    <span class="badge-whatsapp">WhatsApp</span> Order
                </a>
            </div>
        </div>
    </div>
`;

        
        grid.appendChild(col);
    });

    // Initialize event listeners for the new elements
    initializeProductEventListeners();
}

function initializeProductEventListeners() {
    // WhatsApp link updates when size changes
    document.querySelectorAll(".size-select").forEach(select => {
        select.addEventListener("change", function() {
            const card = this.closest(".card");
            const productName = card.querySelector(".card-title").textContent;
            const product = products.find(p => p.name === productName);
            const whatsappBtn = card.querySelector(".whatsapp-btn");
            whatsappBtn.href = createWhatsAppLink(product, this.value);
        });
    });

    // Add to cart functionality
    document.querySelectorAll(".add-cart-btn").forEach(btn => {
        btn.addEventListener("click", function() {
            const card = this.closest(".card");
            const productName = card.querySelector(".card-title").textContent;
            const product = products.find(p => p.name === productName);
            const size = card.querySelector(".size-select").value;
            addToCart(product, size);
        });
    });
}

// Cart Management
function addToCart(product, size) {
    const key = `${product.id}-${size}`;
    const existingItem = cart.find(item => item.key === key);
    
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({
            key,
            product,
            size,
            qty: 1
        });
    }
    
    saveCart();
    renderCart();
}

function calculateCartTotal() {
    return cart.reduce((total, item) => total + (item.product.price * item.qty), 0);
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function renderCart() {
    const panel = document.getElementById("cart-panel");
    const itemsDiv = document.getElementById("cart-items");
    const totalSpan = document.getElementById("cart-total");
    const whatsappCheckout = document.getElementById("whatsapp-checkout");
    
    if (!panel || !itemsDiv || !totalSpan) return;
    
    if (cart.length === 0) {
        panel.style.display = "none";
        return;
    }
    
    panel.style.display = "block";
    itemsDiv.innerHTML = "";
    
    cart.forEach(item => {
        const itemElement = document.createElement("div");
        itemElement.className = "d-flex justify-content-between small mb-1";
        itemElement.innerHTML = `
            <div>${item.product.name} (${item.size}) x${item.qty}</div>
            <div>₹${item.product.price * item.qty}</div>
        `;
        itemsDiv.appendChild(itemElement);
    });
    
    const total = calculateCartTotal();
    totalSpan.textContent = `₹${total}`;
    whatsappCheckout.href = createWhatsAppCartLink();
}

function clearCart() {
    cart = [];
    saveCart();
    renderCart();
}

// Admin Functions
function openAdminEditor(editId = null) {
    let product = editId ? products.find(p => p.id === editId) : null;
    
    const name = prompt("Product name:", product?.name || "");
    if (name === null) return;
    
    const price = prompt("Price (₹):", product?.price || "");
    if (price === null) return;
    
    const image = prompt("Image URL:", product?.image || "https://placehold.co/300x350");
    if (image === null) return;
    
    const sizes = prompt("Available sizes (comma separated):", 
                        product?.sizeOptions?.join(",") || "S,M,L,XL");
    if (sizes === null) return;
    
    const newProduct = {
        id: product?.id || Date.now(),
        name: name.trim(),
        price: parseInt(price, 10),
        image: image.trim(),
        sizeOptions: sizes.split(",").map(s => s.trim()).filter(Boolean)
    };
    
    if (editId) {
        products = products.map(p => p.id === editId ? newProduct : p);
    } else {
        products.push(newProduct);
    }
    
    saveProducts(products);
    renderProducts();
}

function handleAdminAction() {
    const action = prompt("Type 'add' to add product, 'clear' to reset all products:");
    
    if (action?.toLowerCase() === "add") {
        openAdminEditor();
    } else if (action?.toLowerCase() === "clear") {
        if (confirm("Clear all products and restore defaults?")) {
            localStorage.removeItem("adminProducts");
            products = loadProducts();
            renderProducts();
        }
    }
}

// Initialization
function initialize() {
    renderProducts();
    renderCart();
    
    // Set up event listeners
    document.getElementById("clear-cart")?.addEventListener("click", clearCart);
    document.getElementById("admin-toggle")?.addEventListener("click", handleAdminAction);
    
    // Staggered fade-in animation
    setTimeout(() => {
        document.querySelectorAll('.product-card').forEach((card, index) => {
            card.style.opacity = '0';
            setTimeout(() => {
                card.style.transition = 'opacity 0.6s ease, transform 0.3s ease';
                card.style.opacity = '1';
            }, 100 * index);
        });
    }, 100);
}

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
});
