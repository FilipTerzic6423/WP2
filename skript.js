function loadNavbar(activePage) {
  var navHTML = `
    <nav class="navbar navbar-expand-lg sticky-top">
      <div class="container">
        <a class="navbar-brand" href="index.html">
          <span class="brand-icon">📖</span> ReadMore
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="mainNav">
          <ul class="navbar-nav mx-auto gap-1">
            <li class="nav-item">
              <a class="nav-link ${activePage === 'home' ? 'active' : ''}" href="index.html">Home</a>
            </li>
            <li class="nav-item">
              <a class="nav-link ${activePage === 'books' ? 'active' : ''}" href="books.html">Books</a>
            </li>
            <li class="nav-item">
              <a class="nav-link ${activePage === 'contact' ? 'active' : ''}" href="contact.html">Contact</a>
            </li>
            <li class="nav-item">
              <a class="nav-link ${activePage === 'author' ? 'active' : ''}" href="author.html">Author</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="Documentation.pdf">Documentation</a>
            </li>
          </ul>
          <a href="cart.html" class="nav-cart-btn ${activePage === 'cart' ? 'active' : ''}">
            Cart
            <span id="cart-badge" class="cart-badge">0</span>
          </a>
        </div>
      </div>
    </nav>
  `;

  document.body.insertAdjacentHTML('afterbegin', navHTML);
  updateCartBadge();
}
function loadFooter() {
  var footerHTML = `
    <footer>
      <div class="container">
        <div class="row g-4">
          <div class="col-md-4">
            <div class="footer-brand">📖 ReadMore</div>
            <p class="footer-desc">Your favorite corner for great books. Find your next favorite read.</p>
          </div>
          <div class="col-md-2 offset-md-2">
            <h6 class="footer-heading">Browse</h6>
            <ul class="footer-links">
              <li><a href="books.html">All Books</a></li>
              <li><a href="books.html?genre=Classic">Classics</a></li>
              <li><a href="books.html?genre=Thriller">Thrillers</a></li>
              <li><a href="books.html?genre=Fantasy">Fantasy</a></li>
            </ul>
          </div>
          <div class="col-md-2">
            <h6 class="footer-heading">Info</h6>
            <ul class="footer-links">
              <li><a href="contact.html">Contact Us</a></li>
              <li><a href="cart.html">My Cart</a></li>
              <li><a href="sitemap.xml">Sitemap</a></li>
            </ul>
          </div>
        </div>
        <hr class="footer-divider">
        <p class="footer-copy">© 2026 ReadMore Book Store</p>
      </div>
    </footer>
  `;
  document.body.insertAdjacentHTML('beforeend', footerHTML);
}

var CART_KEY = 'readmore_cart';

function getCart() {
  try {
    var data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.log('Could not read cart from storagr:', e);
    return [];
  }
}

function saveCart(cartItems) {
  localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  updateCartBadge();
}

function addToCart(book) {
  var cart = getCart();
  var existing = cart.find(function(item) { return item.id === book.id; });

  //ako postoji, stackuje se proizvod
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: book.id, title: book.title, author: book.author, price: book.price, cover: book.cover, genre: book.genre, qty: 1 });
  }

  saveCart(cart);
}

function removeFromCart(bookId) {
  var cart = getCart().filter(function(item) { return item.id !== bookId; });
  saveCart(cart);
}

function updateQty(bookId, delta) {
  var cart = getCart();
  var item = cart.find(function(i) { return i.id === bookId; });
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(bookId);
    return;
  }
  saveCart(cart);
}

function getCartTotal() {
  return getCart().reduce(function(sum, item) { return sum + item.price * item.qty; }, 0);
}

function getCartCount() {
  return getCart().reduce(function(sum, item) { return sum + item.qty; }, 0);
}

function updateCartBadge() {
  var badge = document.getElementById('cart-badge');
  if (!badge) return;
  var count = getCartCount();
  badge.textContent = count;
  badge.style.display = count > 0 ? 'inline-flex' : 'none';
}

function renderBookCard(book) {


  var oldPriceHTML = '';
  if (book.oldPrice) {
    oldPriceHTML = `<span class="price-old">$${book.oldPrice.toFixed(2)}</span>`;
  }

  return `
    <div class="col">
      <div class="book-card">
        <div class="book-cover-wrap">
        <img src="${book.cover}" alt="${book.title}" class="book-cover" onerror="this.src='https://placehold.co/300x420/5c3d2e/f5e6c8?text=No+Cover'">
        </div>
        <div class="book-info">
          <span class="book-genre">${book.genre}</span>
          <h5 class="book-title">${book.title}</h5>
          <p class="book-author">${book.author}</p>
          <div class="book-meta">
            <span class="stars">${book.rating}⭐</span>
            <span class="review-count">(${book.reviews.toLocaleString()})</span>
          </div>
          <div class="book-footer">
            <div class="price-wrap">
              <span class="price-now">$${book.price.toFixed(2)}</span>
              ${oldPriceHTML}
            </div>
            <button class="btn-cart" onclick="handleAddToCart(${book.id}, this)">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function handleAddToCart(bookId, btn) {
  if (typeof allBooks === 'undefined') {
    console.log('Books not found');
    return;
  }

  var book = allBooks.find(function(b) { return b.id === bookId; });
  if (!book) return;

  addToCart(book);

  
  var original = btn.textContent;
  btn.textContent = 'Added!';
  btn.classList.add('added');
  btn.disabled = true;

  setTimeout(function() {
    btn.textContent = original;
    btn.classList.remove('added');
    btn.disabled = false;
  }, 1500);

  showToast('"' + book.title + '" added to your cart!');
}

// Toast za cart
function showToast(message, type) {
  type = type || 'success';

  var container = document.getElementById('toast-area');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-area';
    document.body.appendChild(container);
  }

  var toast = document.createElement('div');
  toast.className = 'toast-popup toast-' + type;

  toast.innerHTML = `${message}`;
  container.appendChild(toast);

// nestaje posle 3 sec
  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(function() { toast.remove(); }, 300);
  }, 3000);
}

function showMessage(containerId, message, type) {
  var container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="inline-msg inline-msg-${type}">
      <strong>${type === 'error' ? 'Error: ' : type === 'info' ? 'Info: ' : 'Success: '}</strong>
      ${message}
    </div>
  `;

  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearMessage(containerId) {
  var el = document.getElementById(containerId);
  if (el) el.innerHTML = '';
}
