// Sample Top Grossing Products (You can replace or expand this)
const topGrossing = [
  {
    title: "Classic White Shirt",
    price: "₹799",
    image: "assets/images/white-shirt.png",
  },
  {
    title: "Oversized Black T-shirt",
    price: "₹699",
    image: "assets/images/oversize-black.png",
  },
  {
    title: "Slim Fit Pants",
    price: "₹999",
    image: "assets/images/slim-fit-pant.png",
  },
  {
    title: "Baggy Cargo Joggers",
    price: "₹1099",
    image: "assets/images/baggy-cargo.png",
  }
];

// Render Products
const container = document.getElementById("top-grossing");

topGrossing.forEach((item) => {
  const card = document.createElement("div");
  card.className = "col-md-3";
  card.innerHTML = `
    <div class="card h-100 text-center p-2">
      <img src="${item.image}" class="card-img-top" alt="${item.title}">
      <div class="card-body">
        <h6 class="product-title">${item.title}</h6>
        <p class="price">${item.price}</p>
        <button class="btn btn-accent w-100">Add to Cart</button>
      </div>
    </div>
  `;
  container.appendChild(card);
});
