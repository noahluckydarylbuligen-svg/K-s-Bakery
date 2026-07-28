/************************************************************
 * K'S BAKERY — MODERN CLIENT APPLICATION LOGIC
 * Handles Buy Now (Direct Single-Item Order) & Shopee-Style Add to Cart,
 * Direct Facebook Messenger Order Integration (https://m.me/marygrace.baduyenbuligen),
 * Multi-Platform Checkout for PC & Mobile (WhatsApp Web, Clipboard, SMS),
 * Dual-Level Category Filtering, Dynamic Tag Management, and Store Status Tagging.
 ************************************************************/

const STORAGE_KEY_PRODUCTS = "KS_BAKERY_PRODUCTS_V6";
const STORAGE_KEY_SELLER_MODE = "KS_BAKERY_SELLER_LOGGED_IN";
const STORAGE_KEY_STORE_STATUS = "KS_BAKERY_STORE_STATUS_V1";
const STORAGE_KEY_ORDERS = "KS_BAKERY_ORDERS_V1";
const STORAGE_KEY_TAGS = "KS_BAKERY_PRODUCT_TAGS_V1";
const STORAGE_KEY_CART = "KS_BAKERY_CART_V1";
const DEFAULT_PASSWORD = "KsBakery2026";
const SELLER_PHONE_NUMBER = "09955314145";
const SELLER_PHONE_INTL = "+639955314145";
const SELLER_MESSENGER_HANDLE = "marygrace.baduyenbuligen"; // Mary Grace Baduyen Buligen

// Default Dynamic Bakery Product Tags
const DEFAULT_BAKERY_TAGS = [
  "Breads",
  "Cakes",
  "Cookies",
  "Pastries & Tarts",
  "Others"
];

// Initial sample pastries
const INITIAL_PASTRIES = [
  {
    id: 1,
    name: "Pandecoco",
    itemType: "Breads",
    category: "In Store",
    price: 7,
    stock: 1000,
    available: true,
    badge: "Fresh Baked",
    description: "Pandecoco is a sweet Filipino bread roll filled with rich, caramelized coconut, beloved as a snack or breakfast treat.",
    image: "images/pandecoco.jpg"
  },
  {
    id: 2,
    name: "Fresh Strawberry Fruit Tart",
    itemType: "Pastries & Tarts",
    category: "In Store",
    price: 150,
    stock: 12,
    available: true,
    badge: "Chef's Favorite",
    description: "Crisp butter pastry shell filled with rich Madagascar vanilla bean custard and topped with fresh glazed strawberries.",
    image: "images/strawberry_tart.jpg"
  },
  {
    id: 3,
    name: "Artisanal Sourdough Bread Loaf",
    itemType: "Breads",
    category: "In Store",
    price: 180,
    stock: 8,
    available: true,
    badge: "In Store Pick",
    description: "Naturally fermented sourdough with a dark crunchy crust and open, chewy crumb. Ideal for breakfast sandwiches and toast.",
    image: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 4,
    name: "Deluxe Chocolate Ganache Cake",
    itemType: "Cakes",
    category: "For Delivery",
    price: 750,
    stock: 5,
    available: true,
    badge: "Boxed Special",
    description: "Moist Belgian dark chocolate cake layered with rich chocolate ganache, securely packaged in a premium bakery presentation box for door-to-door delivery.",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 5,
    name: "Double Chocolate Chip Cookies (Box of 8)",
    itemType: "Cookies",
    category: "For Delivery",
    price: 240,
    stock: 15,
    available: true,
    badge: "Chewy Special",
    description: "Freshly baked soft and chewy double chocolate chip cookies loaded with real dark chocolate chunks. Perfect with coffee or milk.",
    image: "images/chocolate_cookies.jpg"
  },
  {
    id: 6,
    name: "Classic Cinnamon Rolls (Box of 6)",
    itemType: "Pastries & Tarts",
    category: "For Delivery",
    price: 320,
    stock: 10,
    available: true,
    badge: "Best Seller",
    description: "Soft glazed cinnamon rolls swirled with Saigon cinnamon and topped with cream cheese frosting. Specially sealed for delivery freshness.",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 7,
    name: "Japanese Uji Matcha Chiffon Cake",
    itemType: "Cakes",
    category: "For Delivery",
    price: 620,
    stock: 0,
    available: false,
    badge: "Specialty",
    description: "Light and airy chiffon cake infused with premium ceremonial grade Uji Matcha green tea. Handcrafted per batch.",
    image: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80"
  }
];

// Default Store Status
const DEFAULT_STORE_STATUS = {
  code: "OPEN",
  customMessage: ""
};

// App State
let pastries = [];
let orders = [];
let bakeryTags = [];
let cart = []; // Shopee-Style Customer Cart items: [{ pastryId, qty }]
let activeFulfillmentCategory = "All"; // Top category bar: All, In Store, For Delivery
let activeProductType = "All"; // Bakery Products pills: All, Breads, Cakes, Cookies, Pastries & Tarts, etc.
let isSellerMode = false;
let storeStatus = { ...DEFAULT_STORE_STATUS };
let editingPastryId = null;
let activeOrderingPastry = null;
let currentUploadedBase64 = null;
let currentPreparedOrderText = "";

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  loadBakeryTags();
  loadPastries();
  loadOrders();
  loadCart();
  loadStoreStatus();
  checkSellerSession();
  renderApp();
  setupEventListeners();
});

function loadBakeryTags() {
  const saved = localStorage.getItem(STORAGE_KEY_TAGS);
  if (saved) {
    try { bakeryTags = JSON.parse(saved); } catch (e) { bakeryTags = [...DEFAULT_BAKERY_TAGS]; }
  } else {
    bakeryTags = [...DEFAULT_BAKERY_TAGS];
    saveBakeryTagsToStorage();
  }
}

function saveBakeryTagsToStorage() {
  localStorage.setItem(STORAGE_KEY_TAGS, JSON.stringify(bakeryTags));
}

function loadPastries() {
  const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
  if (saved) {
    try { pastries = JSON.parse(saved); } catch (e) { pastries = INITIAL_PASTRIES; }
  } else {
    pastries = INITIAL_PASTRIES;
    savePastriesToStorage();
  }
}

function savePastriesToStorage() {
  localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(pastries));
}

function loadOrders() {
  const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
  if (saved) {
    try { orders = JSON.parse(saved); } catch (e) { orders = []; }
  } else {
    orders = [];
  }
}

function saveOrdersToStorage() {
  localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
}

function loadCart() {
  const saved = localStorage.getItem(STORAGE_KEY_CART);
  if (saved) {
    try { cart = JSON.parse(saved); } catch (e) { cart = []; }
  } else {
    cart = [];
  }
}

function saveCartToStorage() {
  localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(cart));
}

function loadStoreStatus() {
  const saved = localStorage.getItem(STORAGE_KEY_STORE_STATUS);
  if (saved) {
    try { storeStatus = JSON.parse(saved); } catch (e) { storeStatus = { ...DEFAULT_STORE_STATUS }; }
  } else {
    storeStatus = { ...DEFAULT_STORE_STATUS };
  }
}

function setStoreStatus(code, customMsg = "") {
  storeStatus.code = code;
  if (code === "CUSTOM") storeStatus.customMessage = customMsg;
  else storeStatus.customMessage = "";
  localStorage.setItem(STORAGE_KEY_STORE_STATUS, JSON.stringify(storeStatus));
  showToast(`Store status updated to: ${code.replace('_', ' ')}`);
  renderApp();
}

function checkSellerSession() {
  isSellerMode = localStorage.getItem(STORAGE_KEY_SELLER_MODE) === "true";
}

// Main Render Function
function renderApp() {
  renderStoreStatusBanner();
  renderSellerHeaderState();
  renderBakeryProductTagPills();
  renderCartCounters();
  renderPastriesGrid();
}

function renderStoreStatusBanner() {
  const container = document.getElementById("storeStatusBannerContainer");
  if (!container) return;

  let bannerClass = "status-open";
  let icon = "🟢";
  let text = "We are OPEN Today! Fresh pastries baked daily (7:00 AM – 7:00 PM).";

  switch (storeStatus.code) {
    case "CLOSED_TODAY":
      bannerClass = "status-closed-today";
      icon = "🔴";
      text = "STORE NOTICE: K's Bakery is CLOSED TODAY. Regular baking & orders will resume tomorrow!";
      break;
    case "CLOSED_TOMORROW":
      bannerClass = "status-closed-tomorrow";
      icon = "⚠️";
      text = "IMPORTANT NOTICE: K's Bakery will be CLOSED TOMORROW. Order today's fresh bake early!";
      break;
    case "CUSTOM":
      bannerClass = "status-custom";
      icon = "📢";
      text = storeStatus.customMessage || "Special Announcement from K's Bakery!";
      break;
    case "OPEN":
    default:
      bannerClass = "status-open";
      icon = "🟢";
      text = "We are OPEN Today! Fresh pastries baked daily (7:00 AM – 7:00 PM).";
      break;
  }

  container.innerHTML = `
    <div class="store-status-banner ${bannerClass}">
      <span class="banner-icon">${icon}</span>
      <span>${escapeHtml(text)}</span>
    </div>
  `;
}

function renderSellerHeaderState() {
  const sellerBtn = document.getElementById("sellerPortalBtn");
  const sellerBanner = document.getElementById("sellerBanner");
  const addPastryBtn = document.getElementById("addPastryNavBtn");
  const manageTagsBtn = document.getElementById("manageTagsNavBtn");
  const sellerStatusManager = document.getElementById("sellerStatusManager");

  if (isSellerMode) {
    if (sellerBtn) sellerBtn.innerHTML = "🔓 Seller Mode Active (Logout)";
    if (sellerBanner) sellerBanner.style.display = "block";
    if (addPastryBtn) addPastryBtn.style.display = "inline-flex";
    if (manageTagsBtn) manageTagsBtn.style.display = "inline-flex";
    if (sellerStatusManager) {
      sellerStatusManager.style.display = "block";
      renderSellerStatusControls();
    }
  } else {
    if (sellerBtn) sellerBtn.innerHTML = "🔒 Seller Portal";
    if (sellerBanner) sellerBanner.style.display = "none";
    if (addPastryBtn) addPastryBtn.style.display = "none";
    if (manageTagsBtn) manageTagsBtn.style.display = "none";
    if (sellerStatusManager) sellerStatusManager.style.display = "none";
  }
}

function renderSellerStatusControls() {
  const btnOpen = document.getElementById("statusBtnOpen");
  const btnClosedToday = document.getElementById("statusBtnClosedToday");
  const btnClosedTomorrow = document.getElementById("statusBtnClosedTomorrow");
  const btnCustom = document.getElementById("statusBtnCustom");

  [btnOpen, btnClosedToday, btnClosedTomorrow, btnCustom].forEach(btn => {
    if (btn) btn.classList.remove("active");
  });

  if (storeStatus.code === "OPEN" && btnOpen) btnOpen.classList.add("active");
  if (storeStatus.code === "CLOSED_TODAY" && btnClosedToday) btnClosedToday.classList.add("active");
  if (storeStatus.code === "CLOSED_TOMORROW" && btnClosedTomorrow) btnClosedTomorrow.classList.add("active");
  if (storeStatus.code === "CUSTOM" && btnCustom) btnCustom.classList.add("active");
}

function promptCustomStatusMessage() {
  const currentMsg = storeStatus.customMessage || "Closing early at 2:00 PM today for private event.";
  const input = prompt("Enter your custom store announcement notice:", currentMsg);
  if (input !== null && input.trim() !== "") {
    setStoreStatus("CUSTOM", input.trim());
  }
}

// Render Dynamic Bakery Product Tag Pills below section header
function renderBakeryProductTagPills() {
  const container = document.getElementById("subCategoryBarContainer");
  if (!container) return;

  let html = `
    <span class="sub-category-label">Bakery Products:</span>
    <button class="sub-tab-pill ${activeProductType === 'All' ? 'active' : ''}" data-type="All" onclick="setSubCategory('All')">
      🥐 All Types
    </button>
  `;

  bakeryTags.forEach(tag => {
    const isActive = activeProductType === tag;
    html += `
      <button class="sub-tab-pill ${isActive ? 'active' : ''}" data-type="${escapeHtml(tag)}" onclick="setSubCategory('${escapeHtml(tag)}')">
        ${escapeHtml(tag)}
      </button>
    `;
  });

  container.innerHTML = html;
}

// Shopee-Style Shopping Cart Functions
function getCartTotalCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function getCartTotalPrice() {
  return cart.reduce((sum, item) => {
    const p = pastries.find(x => x.id === item.pastryId);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
}

function renderCartCounters() {
  const totalCount = getCartTotalCount();
  const navBadge = document.getElementById("cartNavCountBadge");
  const floatBadge = document.getElementById("floatCartCountBadge");
  const floatWidget = document.getElementById("floatingCartWidget");

  if (navBadge) navBadge.textContent = totalCount;
  if (floatBadge) floatBadge.textContent = totalCount;

  if (floatWidget) {
    floatWidget.style.display = totalCount > 0 ? "flex" : "none";
  }
}

function addToCart(pastryId, quantityToAdd = 1) {
  const pastry = pastries.find(p => p.id === pastryId);
  if (!pastry) return;

  if (pastry.stock <= 0 || !pastry.available || storeStatus.code === "CLOSED_TODAY") {
    alert("Sorry! This item is currently unavailable or out of stock.");
    return;
  }

  const existingIndex = cart.findIndex(item => item.pastryId === pastryId);
  if (existingIndex !== -1) {
    cart[existingIndex].qty += quantityToAdd;
  } else {
    cart.push({ pastryId: pastryId, qty: quantityToAdd });
  }

  saveCartToStorage();
  renderCartCounters();
  showToast(`🛒 Added "${pastry.name}" to cart!`);
}

function updateCartItemQty(pastryId, delta) {
  const index = cart.findIndex(item => item.pastryId === pastryId);
  if (index === -1) return;

  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }

  saveCartToStorage();
  renderCartCounters();
  renderCartDrawer();
}

function removeFromCart(pastryId) {
  cart = cart.filter(item => item.pastryId !== pastryId);
  saveCartToStorage();
  renderCartCounters();
  renderCartDrawer();
}

function clearCart() {
  cart = [];
  saveCartToStorage();
  renderCartCounters();
  renderCartDrawer();
}

function openCartModal() {
  renderCartDrawer();
  document.getElementById("cartModal").classList.add("active");
}

function closeCartModal() {
  document.getElementById("cartModal").classList.remove("active");
}

function renderCartDrawer() {
  const container = document.getElementById("cartItemsContainer");
  const totalAmountEl = document.getElementById("cartTotalAmountText");
  const checkoutBtn = document.getElementById("cartCheckoutBtn");
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #78350f;">
        <span style="font-size: 44px; display: block; margin-bottom: 8px;">🛒</span>
        <h4 style="font-family: 'Playfair Display', serif; font-size: 20px;">Your Cart is Empty</h4>
        <p style="font-size: 13px; margin-top: 4px;">Browse our fresh pastries and click <b>🛒 Add to Cart</b> or <b>⚡ Buy Now</b>!</p>
      </div>
    `;
    if (totalAmountEl) totalAmountEl.textContent = "₱0.00";
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  if (checkoutBtn) checkoutBtn.disabled = false;

  const cartItemsHtml = cart.map(item => {
    const pastry = pastries.find(p => p.id === item.pastryId);
    if (!pastry) return '';
    const itemTotal = pastry.price * item.qty;

    return `
      <div class="cart-item-row">
        <img src="${pastry.image}" alt="${escapeHtml(pastry.name)}" class="cart-item-img" onerror="this.src='https://placehold.co/100?text=Pastry'">
        <div class="cart-item-info">
          <div class="cart-item-name">${escapeHtml(pastry.name)}</div>
          <div style="font-size:12px; color:#78350f;">${escapeHtml(pastry.itemType || 'Pastry')} • ₱${pastry.price.toFixed(2)} each</div>
          <div class="cart-item-price">₱${itemTotal.toFixed(2)}</div>
        </div>
        <div class="cart-qty-control">
          <button type="button" class="cart-qty-btn" onclick="updateCartItemQty(${pastry.id}, -1)">-</button>
          <span class="cart-qty-val">${item.qty}</span>
          <button type="button" class="cart-qty-btn" onclick="updateCartItemQty(${pastry.id}, 1)">+</button>
        </div>
        <button type="button" class="cart-remove-btn" onclick="removeFromCart(${pastry.id})">🗑</button>
      </div>
    `;
  }).join('');

  container.innerHTML = cartItemsHtml;

  const grandTotal = getCartTotalPrice();
  if (totalAmountEl) totalAmountEl.textContent = `₱${grandTotal.toFixed(2)}`;
}

// Single-Item Direct Buy Now Modal Controls
function openDirectBuyNowModal(id) {
  const pastry = pastries.find(p => p.id === id);
  if (!pastry) return;

  activeOrderingPastry = pastry;

  document.getElementById("orderItemName").textContent = pastry.name;
  document.getElementById("orderItemCategory").textContent = `${pastry.itemType || 'Pastry'} • ${pastry.category}`;
  document.getElementById("orderItemPrice").textContent = `₱${Number(pastry.price).toFixed(2)}`;
  document.getElementById("orderItemImg").src = pastry.image;

  document.getElementById("orderQty").value = 1;
  document.getElementById("orderCustomerName").value = "";
  document.getElementById("orderCustomerPhone").value = "";
  document.getElementById("orderFulfillment").value = pastry.category === "For Delivery" ? "Delivery" : "Pickup";
  document.getElementById("orderNote").value = "";

  updateOrderTotalPrice();
  document.getElementById("orderModal").classList.add("active");
}

function closeOrderModal() {
  document.getElementById("orderModal").classList.remove("active");
}

function updateOrderTotalPrice() {
  if (!activeOrderingPastry) return;
  const qty = parseInt(document.getElementById("orderQty").value, 10) || 1;
  const total = activeOrderingPastry.price * qty;
  document.getElementById("orderTotalPrice").textContent = `₱${total.toFixed(2)}`;
}

function submitCustomerSingleOrder(event) {
  event.preventDefault();

  if (!activeOrderingPastry) return;

  const name = document.getElementById("orderCustomerName").value.trim();
  const phone = document.getElementById("orderCustomerPhone").value.trim();
  const fulfillment = document.getElementById("orderFulfillment").value;
  const qty = parseInt(document.getElementById("orderQty").value, 10) || 1;
  const note = document.getElementById("orderNote").value.trim();

  if (!name || !phone) {
    alert("Please enter your name and phone number so the seller can confirm your order.");
    return;
  }

  const totalAmount = activeOrderingPastry.price * qty;

  const smsBody = `🍞 K'S BAKERY DIRECT ORDER 🍞\n` +
    `----------------------------\n` +
    `Customer: ${name}\n` +
    `Phone: ${phone}\n` +
    `Item: ${activeOrderingPastry.name} [Tag: ${activeOrderingPastry.itemType || 'Pastry'}] (${activeOrderingPastry.category})\n` +
    `Qty: ${qty} x ₱${activeOrderingPastry.price.toFixed(2)} = ₱${totalAmount.toFixed(2)}\n` +
    `Fulfillment: ${fulfillment === "Pickup" ? "🏪 In-Store Pickup" : "🛵 Home Delivery"}\n` +
    `Notes/Address: ${note || "None"}\n` +
    `----------------------------\n` +
    `Please confirm order availability. Thank you!`;

  currentPreparedOrderText = smsBody;

  const newOrder = {
    id: Date.now(),
    date: new Date().toLocaleString(),
    customerName: name,
    customerPhone: phone,
    item: activeOrderingPastry.name,
    qty: qty,
    total: totalAmount,
    fulfillment: fulfillment,
    note: note
  };

  orders.unshift(newOrder);
  saveOrdersToStorage();

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  
  if (isMobile) {
    const encodedSms = encodeURIComponent(smsBody);
    const smsUrl = `sms:${SELLER_PHONE_NUMBER}?body=${encodedSms}`;
    closeOrderModal();
    window.location.href = smsUrl;
  } else {
    // Desktop PC: Copy order text automatically & open PC Checkout Options Modal
    copyOrderToClipboardSilently(smsBody);
    closeOrderModal();
    openPCCheckoutModal(smsBody, totalAmount);
  }
}

// Multi-Item SMS Cart Checkout Function
function submitCartOrderSMS(event) {
  event.preventDefault();

  if (cart.length === 0) {
    alert("Your cart is empty. Please add pastries to your cart first.");
    return;
  }

  const name = document.getElementById("cartCustomerName").value.trim();
  const phone = document.getElementById("cartCustomerPhone").value.trim();
  const fulfillment = document.getElementById("cartFulfillment").value;
  const note = document.getElementById("cartNote").value.trim();

  if (!name || !phone) {
    alert("Please enter your name and phone number so the seller can confirm your order.");
    return;
  }

  const totalAmount = getCartTotalPrice();

  let itemsSummaryList = "";
  cart.forEach((item, index) => {
    const p = pastries.find(x => x.id === item.pastryId);
    if (p) {
      itemsSummaryList += `${index + 1}. ${p.name} (${item.qty}x @ ₱${p.price.toFixed(2)}) = ₱${(p.price * item.qty).toFixed(2)}\n`;
    }
  });

  const smsBody = `🍞 K'S BAKERY MULTI-ITEM ORDER 🍞\n` +
    `----------------------------------\n` +
    `Customer: ${name}\n` +
    `Phone: ${phone}\n` +
    `Fulfillment: ${fulfillment === "Pickup" ? "🏪 In-Store Pickup" : "🛵 Home Delivery"}\n` +
    `----------------------------------\n` +
    `ORDERED ITEMS:\n${itemsSummaryList}` +
    `----------------------------------\n` +
    `TOTAL AMOUNT: ₱${totalAmount.toFixed(2)}\n` +
    `Notes/Address: ${note || "None"}\n` +
    `----------------------------------\n` +
    `Please confirm order availability. Thank you!`;

  currentPreparedOrderText = smsBody;

  const newOrder = {
    id: Date.now(),
    date: new Date().toLocaleString(),
    customerName: name,
    customerPhone: phone,
    itemsCount: getCartTotalCount(),
    total: totalAmount,
    fulfillment: fulfillment,
    note: note
  };

  orders.unshift(newOrder);
  saveOrdersToStorage();

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  
  if (isMobile) {
    const encodedSms = encodeURIComponent(smsBody);
    const smsUrl = `sms:${SELLER_PHONE_NUMBER}?body=${encodedSms}`;
    clearCart();
    closeCartModal();
    window.location.href = smsUrl;
  } else {
    // Desktop PC: Copy order text automatically & open PC Checkout Options Modal
    copyOrderToClipboardSilently(smsBody);
    closeCartModal();
    openPCCheckoutModal(smsBody, totalAmount);
  }
}

function copyOrderToClipboardSilently(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast("📋 Order text automatically copied to clipboard!");
    }).catch(() => {});
  }
}

function openPCCheckoutModal(orderText, totalAmount) {
  const modal = document.getElementById("pcCheckoutModal");
  const textContainer = document.getElementById("pcOrderTextPreview");
  const totalDisplay = document.getElementById("pcOrderTotalDisplay");

  if (textContainer) textContainer.value = orderText;
  if (totalDisplay) totalDisplay.textContent = `₱${totalAmount.toFixed(2)}`;

  if (modal) modal.classList.add("active");
}

function closePCCheckoutModal() {
  document.getElementById("pcCheckoutModal").classList.remove("active");
  clearCart();
  renderApp();
}

/**
 * Open Messenger Directly to Mary Grace Baduyen Buligen (marygrace.baduyenbuligen)
 */
function openMessenger() {
  // 1. Copy the formatted order text to the user's clipboard automatically
  const previewArea = document.getElementById("pcOrderTextPreview");
  const orderText = previewArea ? previewArea.value : currentPreparedOrderText;
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(orderText);
  }

  // 2. Alert or notify the user that their order is copied
  alert("Order copied to clipboard! Paste it (Ctrl + V) into Mary Grace Baduyen Buligen's Messenger chat.");

  // 3. Open Messenger directly to Mary Grace Baduyen Buligen's account
  window.open(`https://m.me/${SELLER_MESSENGER_HANDLE}`, "_blank");
}

function sendViaWhatsAppWeb() {
  if (!currentPreparedOrderText) return;
  const encoded = encodeURIComponent(currentPreparedOrderText);
  const waUrl = `https://web.whatsapp.com/send?phone=63${SELLER_PHONE_NUMBER.substring(1)}&text=${encoded}`;
  window.open(waUrl, "_blank");
}

function copyOrderTextBtnClick() {
  if (!currentPreparedOrderText) return;
  navigator.clipboard.writeText(currentPreparedOrderText).then(() => {
    alert("✅ Order text copied to clipboard!\n\nYou can now paste (Ctrl+V) this order directly into Messenger, Viber, SMS, or Email to send to the seller (Mary Grace Baduyen Buligen).");
  }).catch(() => {
    const textarea = document.getElementById("pcOrderTextPreview");
    if (textarea) {
      textarea.select();
      document.execCommand("copy");
      alert("✅ Order text copied!");
    }
  });
}

function sendViaMobileSMSLink() {
  if (!currentPreparedOrderText) return;
  const encoded = encodeURIComponent(currentPreparedOrderText);
  const smsUrl = `sms:${SELLER_PHONE_INTL}?body=${encoded}`;
  window.location.href = smsUrl;
}

// Dual Filtering Logic
function filterPastriesList() {
  const searchQuery = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();

  return pastries.filter(p => {
    const fulfillmentMatch = (activeFulfillmentCategory === "All") || (p.category === activeFulfillmentCategory);
    const productTypeMatch = (activeProductType === "All") || (p.itemType === activeProductType);

    const searchMatch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery) ||
      p.description.toLowerCase().includes(searchQuery) ||
      (p.itemType && p.itemType.toLowerCase().includes(searchQuery)) ||
      (p.badge && p.badge.toLowerCase().includes(searchQuery));

    return fulfillmentMatch && productTypeMatch && searchMatch;
  });
}

function renderPastriesGrid() {
  const grid = document.getElementById("pastryGrid");
  const countBadge = document.getElementById("pastryCount");
  if (!grid) return;

  const filtered = filterPastriesList();
  if (countBadge) countBadge.textContent = `${filtered.length} Items`;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 48px 20px; background: #fff; border-radius: 18px; border: 1px dashed var(--border-amber);">
        <h3 style="font-family: 'Playfair Display', serif; font-size: 22px; color: #451a03; margin-bottom: 8px;">No Items Found</h3>
        <p style="color: #78350f;">Try selecting a different category or bakery product tag.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    const isAvailable = p.stock > 0 && p.available && storeStatus.code !== "CLOSED_TODAY";
    const availClass = isAvailable ? "avail-in-stock" : "avail-out-stock";
    const availText = isAvailable ? `🟢 In Stock (${p.stock})` : (storeStatus.code === "CLOSED_TODAY" ? "🔴 Store Closed" : "🔴 Sold Out");
    const subTagHtml = p.itemType ? `<span style="background: #fef3c7; color: #78350f; font-size: 11px; padding: 2px 8px; border-radius: 10px; font-weight: 700; border: 1px solid #fde68a; margin-left: 6px;">${escapeHtml(p.itemType)}</span>` : '';

    const sellerControlsHtml = isSellerMode ? `
      <div class="seller-card-controls">
        <button class="seller-edit-btn" onclick="openEditPastryModal(${p.id})">✏ Edit</button>
        <button class="seller-stock-btn" onclick="togglePastryAvailability(${p.id})">
          ${p.available ? 'Mark Sold Out' : 'Mark In Stock'}
        </button>
        <button class="seller-delete-btn" onclick="deletePastryPrompt(${p.id})">🗑</button>
      </div>
    ` : '';

    return `
      <div class="pastry-card">
        <div class="pastry-img-wrapper">
          <img src="${p.image}" alt="${escapeHtml(p.name)}" class="pastry-img" onerror="this.src='https://placehold.co/400x300?text=K%27s+Bakery'">
          <span class="category-tag">${escapeHtml(p.category)}</span>
          ${p.badge ? `<span class="custom-badge">${escapeHtml(p.badge)}</span>` : ''}
        </div>
        <div class="pastry-content">
          <h3 class="pastry-name">${escapeHtml(p.name)}${subTagHtml}</h3>
          <p class="pastry-desc">${escapeHtml(p.description)}</p>
          <div class="pastry-footer">
            <div class="pastry-price">₱${Number(p.price).toFixed(2)}</div>
            <div class="availability-badge ${availClass}">
              ${availText}
            </div>
          </div>
          <div class="card-actions-row">
            <button class="btn-buy-now" onclick="openDirectBuyNowModal(${p.id})">
              ⚡ Buy Now
            </button>
            <button class="btn-add-cart" onclick="addToCart(${p.id})">
              🛒 Add to Cart
            </button>
            <button class="btn-view-details" onclick="openQuickViewModal(${p.id})">
              👁 Details
            </button>
          </div>
          ${sellerControlsHtml}
        </div>
      </div>
    `;
  }).join('');
}

// Top Category Bar Handler (All, In Store, For Delivery)
function setCategory(categoryName) {
  activeFulfillmentCategory = categoryName;
  document.querySelectorAll(".category-tabs .tab-btn").forEach(btn => {
    btn.classList.remove("active");
    if (btn.dataset.category === categoryName) {
      btn.classList.add("active");
    }
  });
  renderPastriesGrid();
}

// Sub-Category Bakery Products Tag Handler
function setSubCategory(typeName) {
  activeProductType = typeName;
  renderBakeryProductTagPills();
  renderPastriesGrid();
}

// Seller Dynamic Bakery Product Tag Management Functions
function openManageTagsModal() {
  if (!isSellerMode) {
    toggleSellerPortal();
    return;
  }
  renderManageTagsList();
  document.getElementById("newTagInput").value = "";
  document.getElementById("manageTagsModal").classList.add("active");
}

function closeManageTagsModal() {
  document.getElementById("manageTagsModal").classList.remove("active");
}

function renderManageTagsList() {
  const container = document.getElementById("manageTagsListContainer");
  if (!container) return;

  if (bakeryTags.length === 0) {
    container.innerHTML = `<p style="font-size:13px; color:#78350f;">No Bakery Product tags configured.</p>`;
    return;
  }

  container.innerHTML = bakeryTags.map(tag => `
    <div class="tag-manager-item">
      <span class="tag-manager-name">🏷️ ${escapeHtml(tag)}</span>
      <div style="display:flex; gap:6px;">
        <button class="seller-edit-btn" style="padding:4px 10px; font-size:11px;" onclick="editTagPrompt('${escapeHtml(tag)}')">✏ Edit</button>
        <button class="seller-delete-btn" style="padding:4px 10px; font-size:11px;" onclick="deleteTagPrompt('${escapeHtml(tag)}')">🗑 Delete</button>
      </div>
    </div>
  `).join('');
}

function addTagSubmit(event) {
  event.preventDefault();
  const input = document.getElementById("newTagInput");
  const newTag = input ? input.value.trim() : "";

  if (!newTag) return;

  if (bakeryTags.some(t => t.toLowerCase() === newTag.toLowerCase())) {
    alert("This Bakery Product Tag already exists.");
    return;
  }

  bakeryTags.push(newTag);
  saveBakeryTagsToStorage();
  input.value = "";
  showToast(`Added tag: "${newTag}"`);
  renderManageTagsList();
  renderApp();
}

function editTagPrompt(oldTag) {
  const newTag = prompt(`Edit Bakery Product Tag name:`, oldTag);
  if (newTag === null || newTag.trim() === "") return;

  const trimmed = newTag.trim();
  if (trimmed === oldTag) return;

  if (bakeryTags.some(t => t.toLowerCase() === trimmed.toLowerCase() && t.toLowerCase() !== oldTag.toLowerCase())) {
    alert("Another tag already has this name.");
    return;
  }

  const index = bakeryTags.indexOf(oldTag);
  if (index !== -1) {
    bakeryTags[index] = trimmed;
    
    pastries.forEach(p => {
      if (p.itemType === oldTag) {
        p.itemType = trimmed;
      }
    });

    saveBakeryTagsToStorage();
    savePastriesToStorage();
    showToast(`Updated tag to: "${trimmed}"`);
    renderManageTagsList();
    renderApp();
  }
}

function deleteTagPrompt(tagToDelete) {
  if (bakeryTags.length <= 1) {
    alert("You must keep at least one Bakery Product tag.");
    return;
  }

  if (confirm(`Are you sure you want to delete the tag "${tagToDelete}"? Pastries with this tag will be set to "${bakeryTags[0]}".`)) {
    bakeryTags = bakeryTags.filter(t => t !== tagToDelete);

    const fallbackTag = bakeryTags[0] || "Others";
    pastries.forEach(p => {
      if (p.itemType === tagToDelete) {
        p.itemType = fallbackTag;
      }
    });

    if (activeProductType === tagToDelete) {
      activeProductType = "All";
    }

    saveBakeryTagsToStorage();
    savePastriesToStorage();
    showToast(`Deleted tag "${tagToDelete}"`);
    renderManageTagsList();
    renderApp();
  }
}

// Populate Bakery Product Tag Select Dropdown in Seller Add/Edit Pastry Form
function populateSellerFormItemTypeSelect(selectedTag = "") {
  const select = document.getElementById("pastryFormItemType");
  if (!select) return;

  select.innerHTML = bakeryTags.map(tag => `
    <option value="${escapeHtml(tag)}" ${tag === selectedTag ? 'selected' : ''}>${escapeHtml(tag)}</option>
  `).join('');
}

// Customer Quick View Modal
function openQuickViewModal(id) {
  const pastry = pastries.find(p => p.id === id);
  if (!pastry) return;

  const isAvailable = pastry.stock > 0 && pastry.available;

  document.getElementById("qvImage").src = pastry.image;
  document.getElementById("qvTitle").textContent = pastry.name;
  document.getElementById("qvCategory").textContent = `Tag: ${pastry.itemType || 'Pastry'} • Availability: ${pastry.category}`;
  document.getElementById("qvPrice").textContent = `₱${Number(pastry.price).toFixed(2)}`;
  document.getElementById("qvBadge").textContent = pastry.badge || "Artisanal";
  document.getElementById("qvDescription").textContent = pastry.description;

  const availEl = document.getElementById("qvAvailability");
  if (isAvailable) {
    availEl.className = "availability-badge avail-in-stock";
    availEl.textContent = `🟢 Available In Store / Delivery (${pastry.stock} in stock)`;
  } else {
    availEl.className = "availability-badge avail-out-stock";
    availEl.textContent = `🔴 Currently Out of Stock`;
  }

  const orderNowBtn = document.getElementById("qvOrderBtn");
  if (orderNowBtn) {
    orderNowBtn.onclick = function() {
      closeQuickViewModal();
      openDirectBuyNowModal(id);
    };
  }

  document.getElementById("quickViewModal").classList.add("active");
}

function closeQuickViewModal() {
  document.getElementById("quickViewModal").classList.remove("active");
}

// Seller Authentication Portal
function toggleSellerPortal() {
  if (isSellerMode) {
    if (confirm("Logout from Seller Portal?")) {
      isSellerMode = false;
      localStorage.setItem(STORAGE_KEY_SELLER_MODE, "false");
      showToast("Logged out from Seller Portal");
      renderApp();
    }
  } else {
    document.getElementById("sellerPasswordInput").value = "";
    document.getElementById("sellerLoginModal").classList.add("active");
  }
}

function closeSellerLoginModal() {
  document.getElementById("sellerLoginModal").classList.remove("active");
}

function submitSellerLogin() {
  const pass = document.getElementById("sellerPasswordInput").value;
  if (pass === DEFAULT_PASSWORD) {
    isSellerMode = true;
    localStorage.setItem(STORAGE_KEY_SELLER_MODE, "true");
    closeSellerLoginModal();
    showToast("🎉 Seller Portal Unlocked!");
    renderApp();
  } else {
    alert("Incorrect seller password. Please try again.");
  }
}

// Seller Add / Edit Modal Controls
function openAddPastryModal() {
  if (!isSellerMode) {
    toggleSellerPortal();
    return;
  }
  editingPastryId = null;
  currentUploadedBase64 = null;

  populateSellerFormItemTypeSelect();

  document.getElementById("modalTitleText").textContent = "➕ Post New Pastry";
  document.getElementById("pastryFormName").value = "";
  document.getElementById("pastryFormCategory").value = "In Store";
  document.getElementById("pastryFormPrice").value = "";
  document.getElementById("pastryFormStock").value = "10";
  document.getElementById("pastryFormBadge").value = "";
  document.getElementById("pastryFormDesc").value = "";
  document.getElementById("pastryFormImgPreview").src = "https://placehold.co/400x300?text=Upload+Image";
  document.getElementById("pastryFormFileInput").value = "";

  document.getElementById("pastryFormModal").classList.add("active");
}

function openEditPastryModal(id) {
  const p = pastries.find(item => item.id === id);
  if (!p) return;

  editingPastryId = id;
  currentUploadedBase64 = null;

  populateSellerFormItemTypeSelect(p.itemType || "Breads");

  document.getElementById("modalTitleText").textContent = `✏ Update Pastry #${id}`;
  document.getElementById("pastryFormName").value = p.name;
  document.getElementById("pastryFormCategory").value = p.category;
  document.getElementById("pastryFormPrice").value = p.price;
  document.getElementById("pastryFormStock").value = p.stock;
  document.getElementById("pastryFormBadge").value = p.badge || "";
  document.getElementById("pastryFormDesc").value = p.description || "";
  document.getElementById("pastryFormImgPreview").src = p.image;
  document.getElementById("pastryFormFileInput").value = "";

  document.getElementById("pastryFormModal").classList.add("active");
}

function closePastryFormModal() {
  document.getElementById("pastryFormModal").classList.remove("active");
}

function handleImageUploadPreview(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    currentUploadedBase64 = e.target.result;
    document.getElementById("pastryFormImgPreview").src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function savePastrySubmit(event) {
  event.preventDefault();

  const name = document.getElementById("pastryFormName").value.trim();
  const itemType = document.getElementById("pastryFormItemType").value;
  const category = document.getElementById("pastryFormCategory").value;
  const price = parseFloat(document.getElementById("pastryFormPrice").value);
  const stock = parseInt(document.getElementById("pastryFormStock").value, 10);
  const badge = document.getElementById("pastryFormBadge").value.trim();
  const description = document.getElementById("pastryFormDesc").value.trim();

  if (!name || isNaN(price) || price < 0 || isNaN(stock) || stock < 0) {
    alert("Please enter valid pastry details.");
    return;
  }

  let finalImg = currentUploadedBase64;

  if (editingPastryId) {
    const index = pastries.findIndex(p => p.id === editingPastryId);
    if (index !== -1) {
      if (!finalImg) {
        finalImg = pastries[index].image;
      }
      pastries[index] = {
        ...pastries[index],
        name,
        itemType,
        category,
        price,
        stock,
        available: stock > 0,
        badge,
        description,
        image: finalImg
      };
      showToast("Pastry updated successfully!");
    }
  } else {
    if (!finalImg) {
      finalImg = "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80";
    }
    const newId = pastries.length > 0 ? Math.max(...pastries.map(p => p.id)) + 1 : 1;
    pastries.unshift({
      id: newId,
      name,
      itemType,
      category,
      price,
      stock,
      available: stock > 0,
      badge,
      description,
      image: finalImg
    });
    showToast("✨ New pastry posted successfully!");
  }

  savePastriesToStorage();
  closePastryFormModal();
  renderApp();
}

function togglePastryAvailability(id) {
  const p = pastries.find(item => item.id === id);
  if (!p) return;

  if (p.stock > 0) {
    p.stock = 0;
    p.available = false;
    showToast(`Marked ${p.name} as Sold Out`);
  } else {
    p.stock = 10;
    p.available = true;
    showToast(`Marked ${p.name} as In Stock (10)`);
  }

  savePastriesToStorage();
  renderApp();
}

function deletePastryPrompt(id) {
  const p = pastries.find(item => item.id === id);
  if (!p) return;

  if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
    pastries = pastries.filter(item => item.id !== id);
    savePastriesToStorage();
    showToast("Pastry deleted");
    renderApp();
  }
}

function setupEventListeners() {
  document.getElementById("searchInput")?.addEventListener("input", renderPastriesGrid);
}

function showToast(msg) {
  const toast = document.getElementById("toastNotice");
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
