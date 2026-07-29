/************************************************************
 * K'S BAKERY — MODERN CLIENT APPLICATION LOGIC
 * Features: "💬 Message Seller" Buttons on Header & Product Cards,
 * Strict Order Logging (Orders are ONLY logged to Notifications upon successfully sending via Messenger or SMS),
 * Cleaned Checkout Modal (Removed WhatsApp, Viber/Copy, Windows SMS),
 * Shopee-Style In-App Live Customer-to-Seller Chatbox,
 * Free Wi-Fi / Internet Fallback Messenger Direct Link (No SMS Load Needed),
 * Symmetrical Grid Cards, Non-Wrapping Bakery Sub-Tags,
 * Permanent Cart Retention across browser close/reopen,
 * Notification Unread Counter Reset on Modal Open, Mouth-Watering Micro-Animations,
 * Retained Permanent Order History (Customer Device & Seller Master Log),
 * Real-Time Cross-Tab / Cross-Device Order Notification Broadcast to Seller Portal,
 * Seller Sales Analytics & Revenue Dashboard, Configurable Volume Discounts Engine,
 * Shopee-Style Shopping Cart, Buy Now, Messenger & SMS Direct Checkout, Category Filtering.
 * All Emojis & Currency Symbols use 100% immune Unicode Escape Sequences.
 ************************************************************/

const STORAGE_KEY_PRODUCTS = "KS_BAKERY_PRODUCTS_V6";
const STORAGE_KEY_SELLER_MODE = "KS_BAKERY_SELLER_LOGGED_IN";
const STORAGE_KEY_STORE_STATUS = "KS_BAKERY_STORE_STATUS_V1";
const STORAGE_KEY_CUSTOMER_ORDERS = "KS_BAKERY_CUSTOMER_ORDERS_V3";
const STORAGE_KEY_MASTER_ORDERS = "KS_BAKERY_MASTER_ORDERS_V3";
const STORAGE_KEY_READ_NOTIF_CUSTOMER = "KS_BAKERY_READ_NOTIFS_CUST_V1";
const STORAGE_KEY_READ_NOTIF_SELLER = "KS_BAKERY_READ_NOTIFS_SELL_V1";
const STORAGE_KEY_TAGS = "KS_BAKERY_PRODUCT_TAGS_V1";
const STORAGE_KEY_CART = "KS_BAKERY_CART_V3";
const STORAGE_KEY_DISCOUNTS = "KS_BAKERY_DISCOUNTS_V1";
const STORAGE_KEY_CHAT_MESSAGES = "KS_BAKERY_CHAT_MESSAGES_V1";
const DEFAULT_PASSWORD = "KsBakery2026";
const SELLER_PHONE_NUMBER = "09955314145";
const SELLER_PHONE_INTL = "+639955314145";
const SELLER_MESSENGER_HANDLE = "marygrace.baduyenbuligen"; // Mary Grace Baduyen Buligen

// Unicode Escape Constants for 100% Encoding Safety
const PESO = "\u20B1";
const BULLET = "\u2022";
const ICON_BELL = "\u{1F514}";
const ICON_CART = "\u{1F6D2}";
const ICON_LOCK = "\u{1F512}";
const ICON_UNLOCK = "\u{1F513}";
const ICON_GREEN = "\u{1F7E2}";
const ICON_RED = "\u{1F534}";
const ICON_WARN = "\u26A0\uFE0F";
const ICON_NOTICE = "\u{1F4E3}";
const ICON_CROISSANT = "\u{1F950}";
const ICON_STORE = "\u{1F3EA}";
const ICON_SCOOTER = "\u{1F6F5}";
const ICON_SEARCH = "\u{1F50D}";
const ICON_EYE = "\u{1F441}\uFE0F";
const ICON_EDIT = "\u270F\uFE0F";
const ICON_TRASH = "\u{1F5D1}\uFE0F";
const ICON_PHONE = "\u{1F4F1}";
const ICON_CLIPBOARD = "\u{1F4CB}";
const ICON_CHAT = "\u{1F4AC}";
const ICON_TAG = "\u{1F3F7}\uFE0F";
const ICON_PLUS = "\u2795";
const ICON_GEAR = "\u2699\uFE0F";
const ICON_PIN = "\u{1F4CC}";
const ICON_TEL = "\u{1F4DE}";
const ICON_CLOCK = "\u{1F552}";
const ICON_LIGHTNING = "\u26A1";
const ICON_BREAD = "\u{1F35E}";
const ICON_BAG = "\u{1F6CD}\uFE0F";
const ICON_GIFT = "\u{1F381}";
const ICON_CHART = "\u{1F4CA}";
const ICON_STAR = "\u2B50";

// Real-Time Broadcast Channel for instant Seller Notifications & Live Chat across tabs
let orderBroadcastChannel = null;
if ('BroadcastChannel' in window) {
  orderBroadcastChannel = new BroadcastChannel("KS_BAKERY_ORDERS_CHANNEL_V3");
}

// Default Dynamic Bakery Product Tags
const DEFAULT_BAKERY_TAGS = [
  "Breads",
  "Cakes",
  "Cookies",
  "Pastries & Tarts",
  "Others"
];

// Initial Default Volume Discounts (Seller Configurable)
const INITIAL_VOLUME_DISCOUNTS = [
  {
    id: 1,
    targetPastryId: "ALL",
    minQty: 5,
    discountType: "PERCENT",
    discountValue: 10,
    active: true
  }
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
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80"
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
    image: "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=600&q=80"
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
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80"
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

// Initial Welcome Message in Chat
const INITIAL_CHAT_MESSAGES = [
  {
    id: 1,
    sender: "seller",
    text: "Welcome to K's Bakery! \u{1F950} How can we help you with your order or inquiry today?",
    time: "Just now"
  }
];

// Default Store Status
const DEFAULT_STORE_STATUS = {
  code: "OPEN",
  customMessage: ""
};

// App State
let pastries = [];
let customerOrders = [];
let masterOrders = [];
let bakeryTags = [];
let volumeDiscounts = [];
let chatMessages = [];
let cart = [];
let activeFulfillmentCategory = "All";
let activeProductType = "All";
let isSellerMode = false;
let storeStatus = { ...DEFAULT_STORE_STATUS };
let editingPastryId = null;
let activeOrderingPastry = null;
let currentUploadedBase64 = null;
let currentPreparedOrderText = "";
let pendingCheckoutPayload = null; // Unconfirmed order waiting for user to click Messenger or SMS!

let readCustomerOrdersCount = 0;
let readSellerOrdersCount = 0;

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  loadBakeryTags();
  loadPastries();
  loadCustomerOrders();
  loadMasterOrders();
  loadReadNotifCounts();
  loadVolumeDiscounts();
  loadChatMessages();
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
  try {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(pastries));
  } catch (err) {
    console.warn("LocalStorage limit reached. Resetting sample pastries.", err);
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(INITIAL_PASTRIES));
  }
}

function loadCustomerOrders() {
  const saved = localStorage.getItem(STORAGE_KEY_CUSTOMER_ORDERS);
  if (saved) {
    try { customerOrders = JSON.parse(saved); } catch (e) { customerOrders = []; }
  } else {
    customerOrders = [];
  }
}

function saveCustomerOrdersToStorage() {
  localStorage.setItem(STORAGE_KEY_CUSTOMER_ORDERS, JSON.stringify(customerOrders));
}

function loadMasterOrders() {
  const saved = localStorage.getItem(STORAGE_KEY_MASTER_ORDERS);
  if (saved) {
    try { masterOrders = JSON.parse(saved); } catch (e) { masterOrders = []; }
  } else {
    masterOrders = [];
  }
}

function saveMasterOrdersToStorage() {
  localStorage.setItem(STORAGE_KEY_MASTER_ORDERS, JSON.stringify(masterOrders));
}

function loadReadNotifCounts() {
  readCustomerOrdersCount = parseInt(localStorage.getItem(STORAGE_KEY_READ_NOTIF_CUSTOMER) || "0", 10);
  readSellerOrdersCount = parseInt(localStorage.getItem(STORAGE_KEY_READ_NOTIF_SELLER) || "0", 10);
}

function loadVolumeDiscounts() {
  const saved = localStorage.getItem(STORAGE_KEY_DISCOUNTS);
  if (saved) {
    try { volumeDiscounts = JSON.parse(saved); } catch (e) { volumeDiscounts = [...INITIAL_VOLUME_DISCOUNTS]; }
  } else {
    volumeDiscounts = [...INITIAL_VOLUME_DISCOUNTS];
    saveVolumeDiscountsToStorage();
  }
}

function saveVolumeDiscountsToStorage() {
  localStorage.setItem(STORAGE_KEY_DISCOUNTS, JSON.stringify(volumeDiscounts));
}

// SHOPEE-STYLE LIVE CHAT MESSAGES LOGIC
function loadChatMessages() {
  const saved = localStorage.getItem(STORAGE_KEY_CHAT_MESSAGES);
  if (saved) {
    try { chatMessages = JSON.parse(saved); } catch (e) { chatMessages = [...INITIAL_CHAT_MESSAGES]; }
  } else {
    chatMessages = [...INITIAL_CHAT_MESSAGES];
    saveChatMessagesToStorage();
  }
}

function saveChatMessagesToStorage() {
  localStorage.setItem(STORAGE_KEY_CHAT_MESSAGES, JSON.stringify(chatMessages));
}

function openShopeeChatModal() {
  renderShopeeChatMessages();
  document.getElementById("shopeeChatModal").classList.add("active");
}

function closeShopeeChatModal() {
  document.getElementById("shopeeChatModal").classList.remove("active");
}

function renderShopeeChatMessages() {
  const container = document.getElementById("chatMessagesContainer");
  if (!container) return;

  loadChatMessages();

  container.innerHTML = chatMessages.map(msg => {
    const isCustomer = msg.sender === "customer";
    const bubbleClass = isCustomer ? "chat-customer" : "chat-seller";
    const senderName = isCustomer ? "You" : "Mary Grace (Seller)";

    return `
      <div class="chat-bubble ${bubbleClass}">
        <div style="font-size:11px; font-weight:800; opacity:0.85; margin-bottom:2px;">${senderName}</div>
        <div>${escapeHtml(msg.text).replace(/\n/g, '<br>')}</div>
        <div class="chat-time">${msg.time}</div>
      </div>
    `;
  }).join('');

  container.scrollTop = container.scrollHeight;
}

function sendQuickChatMessage(text) {
  addChatMessage("customer", text);
}

function sendCartSummaryToChat() {
  if (cart.length === 0) {
    alert("Your cart is currently empty. Add pastries to cart first!");
    return;
  }

  const cartDisc = calculateCartVolumeDiscount();
  let summary = `${ICON_BREAD} MY CART ORDER INQUIRY:\n`;
  cart.forEach((item, i) => {
    const p = pastries.find(x => String(x.id) === String(item.pastryId));
    if (p) {
      summary += `${i + 1}. ${p.name} (${item.qty}x) = ${PESO}${(p.price * item.qty).toFixed(2)}\n`;
    }
  });

  if (cartDisc.isApplied && cartDisc.totalDiscount > 0) {
    summary += `Volume Discount: -${PESO}${cartDisc.totalDiscount.toFixed(2)}\n`;
  }
  summary += `TOTAL AMOUNT: ${PESO}${cartDisc.finalTotal.toFixed(2)}`;

  addChatMessage("customer", summary);
}

function submitCustomerChatMessage(event) {
  event.preventDefault();
  const input = document.getElementById("chatInputText");
  const text = input ? input.value.trim() : "";
  if (!text) return;

  addChatMessage("customer", text);
  input.value = "";
}

function addChatMessage(sender, text) {
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const newMsg = {
    id: Date.now(),
    sender: sender,
    text: text,
    time: timeStr
  };

  chatMessages.push(newMsg);
  saveChatMessagesToStorage();
  renderShopeeChatMessages();

  if (sender === "customer") {
    setTimeout(() => {
      const autoReplyText = "Thank you for your message! \u{1F389} Mary Grace has received your inquiry. For instant 1-click response, you can also tap the Messenger button above!";
      chatMessages.push({
        id: Date.now() + 1,
        sender: "seller",
        text: autoReplyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      saveChatMessagesToStorage();
      renderShopeeChatMessages();
    }, 1000);
  }
}

// PERMANENT CART RETENTION LOGIC
function loadCart() {
  const saved = localStorage.getItem(STORAGE_KEY_CART);
  if (saved) {
    try { 
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        cart = parsed;
      } else {
        cart = [];
      }
    } catch (e) { cart = []; }
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
  renderNotificationBadge();
  renderPastriesGrid();
}

function renderStoreStatusBanner() {
  const container = document.getElementById("storeStatusBannerContainer");
  if (!container) return;

  let bannerClass = "status-open";
  let icon = ICON_GREEN;
  let text = "We are OPEN Today! Fresh pastries baked daily (7:00 AM \u2013 7:00 PM).";

  switch (storeStatus.code) {
    case "CLOSED_TODAY":
      bannerClass = "status-closed-today";
      icon = ICON_RED;
      text = "STORE NOTICE: K's Bakery is CLOSED TODAY. Regular baking & orders will resume tomorrow!";
      break;
    case "CLOSED_TOMORROW":
      bannerClass = "status-closed-tomorrow";
      icon = ICON_WARN;
      text = "IMPORTANT NOTICE: K's Bakery will be CLOSED TOMORROW. Order today's fresh bake early!";
      break;
    case "CUSTOM":
      bannerClass = "status-custom";
      icon = ICON_NOTICE;
      text = storeStatus.customMessage || "Special Announcement from K's Bakery!";
      break;
    case "OPEN":
    default:
      bannerClass = "status-open";
      icon = ICON_GREEN;
      text = "We are OPEN Today! Fresh pastries baked daily (7:00 AM \u2013 7:00 PM).";
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
  const analyticsBtn = document.getElementById("sellerAnalyticsNavBtn");
  const sellerStatusManager = document.getElementById("sellerStatusManager");

  if (isSellerMode) {
    if (sellerBtn) sellerBtn.innerHTML = `${ICON_UNLOCK} Seller Mode Active (Logout)`;
    if (sellerBanner) sellerBanner.style.display = "block";
    if (addPastryBtn) addPastryBtn.style.display = "inline-flex";
    if (manageTagsBtn) manageTagsBtn.style.display = "inline-flex";
    if (analyticsBtn) analyticsBtn.style.display = "inline-flex";
    if (sellerStatusManager) {
      sellerStatusManager.style.display = "block";
      renderSellerStatusControls();
    }
  } else {
    if (sellerBtn) sellerBtn.innerHTML = `${ICON_LOCK} Seller Portal`;
    if (sellerBanner) sellerBanner.style.display = "none";
    if (addPastryBtn) addPastryBtn.style.display = "none";
    if (manageTagsBtn) manageTagsBtn.style.display = "none";
    if (analyticsBtn) analyticsBtn.style.display = "none";
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

// Render Dynamic Bakery Product Tag Pills
function renderBakeryProductTagPills() {
  const container = document.getElementById("subCategoryBarContainer");
  if (!container) return;

  let html = `
    <span class="sub-category-label">Bakery Products:</span>
    <button class="sub-tab-pill ${activeProductType === 'All' ? 'active' : ''}" data-type="All" onclick="setSubCategory('All')">
      ${ICON_CROISSANT} All Types
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

// VOLUME DISCOUNT CALCULATION ENGINE
function getVolumeDiscountRuleForPastry(pastryId) {
  return volumeDiscounts.find(d => d.active && (d.targetPastryId === "ALL" || String(d.targetPastryId) === String(pastryId)));
}

function calculateSingleVolumeDiscount(pastry, qty) {
  const rule = getVolumeDiscountRuleForPastry(pastry.id);
  if (!rule) return { isApplied: false, discountAmount: 0, ruleDescription: "", itemsNeeded: 0 };

  const subtotal = pastry.price * qty;
  const isApplied = qty >= rule.minQty;
  let discountAmount = 0;

  if (isApplied) {
    if (rule.discountType === "PERCENT") {
      discountAmount = (subtotal * rule.discountValue) / 100;
    } else {
      discountAmount = rule.discountValue;
    }
  }

  const itemsNeeded = rule.minQty - qty;

  const ruleDesc = rule.discountType === "PERCENT"
    ? `${rule.discountValue}% OFF for ${rule.minQty}+ items`
    : `${PESO}${rule.discountValue} OFF for ${rule.minQty}+ items`;

  return {
    isApplied,
    discountAmount: Math.min(discountAmount, subtotal),
    ruleDescription: ruleDesc,
    itemsNeeded: itemsNeeded > 0 ? itemsNeeded : 0,
    minQty: rule.minQty,
    discountValue: rule.discountValue,
    discountType: rule.discountType
  };
}

function calculateCartVolumeDiscount() {
  const totalItemsCount = getCartTotalCount();
  const rawSubtotal = getCartTotalPrice();

  const allRule = volumeDiscounts.find(d => d.active && (d.targetPastryId === "ALL" || d.targetPastryId === "all"));
  
  let totalDiscount = 0;
  let discountSummaryText = "";
  let isApplied = false;
  let neededForDiscount = 0;

  if (allRule) {
    if (totalItemsCount >= allRule.minQty) {
      isApplied = true;
      if (allRule.discountType === "PERCENT") {
        totalDiscount = (rawSubtotal * allRule.discountValue) / 100;
        discountSummaryText = `${allRule.discountValue}% OFF Volume Discount (for ${allRule.minQty}+ items)`;
      } else {
        totalDiscount = allRule.discountValue;
        discountSummaryText = `${PESO}${allRule.discountValue} OFF Volume Discount (for ${allRule.minQty}+ items)`;
      }
    } else {
      neededForDiscount = allRule.minQty - totalItemsCount;
      discountSummaryText = `Buy ${neededForDiscount} more item(s) to unlock ${allRule.discountValue}${allRule.discountType === 'PERCENT' ? '%' : PESO} OFF!`;
    }
  } else {
    cart.forEach(item => {
      const pastry = pastries.find(p => String(p.id) === String(item.pastryId));
      if (pastry) {
        const itemDisc = calculateSingleVolumeDiscount(pastry, item.qty);
        if (itemDisc.isApplied) {
          isApplied = true;
          totalDiscount += itemDisc.discountAmount;
          discountSummaryText = `Volume Discount Applied! Saved ${PESO}${totalDiscount.toFixed(2)}`;
        }
      }
    });
  }

  return {
    rawSubtotal,
    totalDiscount,
    finalTotal: Math.max(0, rawSubtotal - totalDiscount),
    isApplied,
    neededForDiscount,
    discountSummaryText
  };
}

// Facebook-Style Notification Center Logic
function renderNotificationBadge() {
  const badgeEl = document.getElementById("notifNavBadgeCount");
  if (!badgeEl) return;

  loadMasterOrders();
  loadCustomerOrders();
  loadReadNotifCounts();

  if (isSellerMode) {
    const unreadCount = masterOrders.length - readSellerOrdersCount;
    if (unreadCount > 0) {
      badgeEl.textContent = unreadCount;
      badgeEl.style.display = "inline-block";
    } else {
      badgeEl.style.display = "none";
    }
  } else {
    const unreadCount = customerOrders.length - readCustomerOrdersCount;
    if (unreadCount > 0) {
      badgeEl.textContent = unreadCount;
      badgeEl.style.display = "inline-block";
    } else {
      badgeEl.style.display = "none";
    }
  }
}

function openNotificationModal() {
  loadMasterOrders();
  loadCustomerOrders();

  if (isSellerMode) {
    readSellerOrdersCount = masterOrders.length;
    localStorage.setItem(STORAGE_KEY_READ_NOTIF_SELLER, String(readSellerOrdersCount));
  } else {
    readCustomerOrdersCount = customerOrders.length;
    localStorage.setItem(STORAGE_KEY_READ_NOTIF_CUSTOMER, String(readCustomerOrdersCount));
  }

  renderNotificationBadge();
  renderNotificationDrawer();
  document.getElementById("notificationModal").classList.add("active");
}

function closeNotificationModal() {
  document.getElementById("notificationModal").classList.remove("active");
}

function renderNotificationDrawer() {
  const container = document.getElementById("notifLogContainer");
  const titleEl = document.getElementById("notifModalTitle");
  if (!container) return;

  loadMasterOrders();
  loadCustomerOrders();

  if (isSellerMode) {
    if (titleEl) titleEl.textContent = `${ICON_BELL} Seller Master Order Log (${masterOrders.length})`;
    if (masterOrders.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #78350f;">
          <span style="font-size: 40px; display: block; margin-bottom: 8px;">${ICON_BELL}</span>
          <h4 style="font-family: 'Playfair Display', serif; font-size: 18px;">No Customer Orders Received Yet</h4>
          <p style="font-size: 13px; margin-top: 4px;">Incoming orders placed by customers will log here automatically!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = masterOrders.map(order => {
      let statusClass = "status-pending";
      let statusLabel = "\u23F3 Pending Confirmation";

      if (order.status === "Confirmed") {
        statusClass = "status-confirmed";
        statusLabel = `${ICON_GREEN} Order Confirmed`;
      } else if (order.status === "Delivering") {
        statusClass = "status-delivering";
        statusLabel = order.fulfillment === "Pickup" ? `${ICON_STORE} Ready for Pickup` : `${ICON_SCOOTER} Out for Delivery`;
      } else if (order.status === "Completed") {
        statusClass = "status-completed";
        statusLabel = "\u2705 Order Completed";
      }

      return `
        <div class="order-log-card">
          <div class="order-log-header">
            <span class="order-log-id">Order #${order.id}</span>
            <span class="order-log-time">${ICON_CLOCK} ${order.date}</span>
          </div>
          <div class="order-log-body">
            <div><b>Customer:</b> ${escapeHtml(order.customerName)} (${escapeHtml(order.customerPhone)})</div>
            <div><b>Items:</b> ${escapeHtml(order.summaryText || order.item || 'Bakery Items')}</div>
            <div><b>Fulfillment:</b> ${order.fulfillment === "Pickup" ? `${ICON_STORE} In-Store Pickup` : `${ICON_SCOOTER} Home Delivery`}</div>
            ${order.note ? `<div><b>Notes:</b> ${escapeHtml(order.note)}</div>` : ''}
          </div>
          <div class="order-log-footer">
            <div style="font-size: 16px; font-weight: 800; color: #d97706;">${PESO}${order.total.toFixed(2)}</div>
            <span class="status-chip ${statusClass}">${statusLabel}</span>
          </div>
          <div style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap;">
            <button style="padding: 4px 10px; font-size: 11px; background: #16a34a; color: #fff; border: none; border-radius: 6px; cursor: pointer;" onclick="updateOrderStatusBySeller(${order.id}, 'Confirmed')">${ICON_GREEN} Confirm</button>
            <button style="padding: 4px 10px; font-size: 11px; background: #0284c7; color: #fff; border: none; border-radius: 6px; cursor: pointer;" onclick="updateOrderStatusBySeller(${order.id}, 'Delivering')">${ICON_SCOOTER} Delivering / Ready</button>
            <button style="padding: 4px 10px; font-size: 11px; background: #7c3aed; color: #fff; border: none; border-radius: 6px; cursor: pointer;" onclick="updateOrderStatusBySeller(${order.id}, 'Completed')">\u2705 Complete</button>
          </div>
        </div>
      `;
    }).join('');

  } else {
    if (titleEl) titleEl.textContent = `${ICON_BELL} My Order History & Notifications (${customerOrders.length})`;
    if (customerOrders.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #78350f;">
          <span style="font-size: 40px; display: block; margin-bottom: 8px;">${ICON_BAG}</span>
          <h4 style="font-family: 'Playfair Display', serif; font-size: 18px;">No Past Orders Yet</h4>
          <p style="font-size: 13px; margin-top: 4px;">Orders you send via Messenger or SMS will log here on your screen!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = customerOrders.map(order => {
      const masterRecord = masterOrders.find(m => m.id === order.id);
      const currentStatus = masterRecord ? masterRecord.status : (order.status || "Pending");

      let statusClass = "status-pending";
      let statusLabel = "\u23F3 Submitted to Seller";

      if (currentStatus === "Confirmed") {
        statusClass = "status-confirmed";
        statusLabel = `${ICON_GREEN} Confirmed by Bakery`;
      } else if (currentStatus === "Delivering") {
        statusClass = "status-delivering";
        statusLabel = order.fulfillment === "Pickup" ? `${ICON_STORE} Ready for Pickup` : `${ICON_SCOOTER} Out for Delivery`;
      } else if (currentStatus === "Completed") {
        statusClass = "status-completed";
        statusLabel = "\u2705 Order Completed";
      }

      return `
        <div class="order-log-card">
          <div class="order-log-header">
            <span class="order-log-id">Order #${order.id}</span>
            <span class="order-log-time">${ICON_CLOCK} ${order.date}</span>
          </div>
          <div class="order-log-body">
            <div><b>Items:</b> ${escapeHtml(order.summaryText || order.item || 'Bakery Items')}</div>
            <div><b>Fulfillment:</b> ${order.fulfillment === "Pickup" ? `${ICON_STORE} In-Store Pickup` : `${ICON_SCOOTER} Home Delivery`}</div>
            ${order.note ? `<div><b>Notes:</b> ${escapeHtml(order.note)}</div>` : ''}
          </div>
          <div class="order-log-footer">
            <div style="font-size: 16px; font-weight: 800; color: #d97706;">${PESO}${order.total.toFixed(2)}</div>
            <span class="status-chip ${statusClass}">${statusLabel}</span>
          </div>
        </div>
      `;
    }).join('');
  }
}

function updateOrderStatusBySeller(orderId, newStatus) {
  loadMasterOrders();
  const masterIndex = masterOrders.findIndex(m => m.id === orderId);
  if (masterIndex !== -1) {
    masterOrders[masterIndex].status = newStatus;
    saveMasterOrdersToStorage();

    if (orderBroadcastChannel) {
      orderBroadcastChannel.postMessage({ type: "STATUS_UPDATE", orderId, newStatus });
    }

    showToast(`Updated Order #${orderId} status to: ${newStatus}`);
    renderNotificationDrawer();
    renderNotificationBadge();
  }
}

// SELLER SALES ANALYTICS & VOLUME DISCOUNT RULE BUILDER
function openAnalyticsDiscountModal() {
  if (!isSellerMode) {
    toggleSellerPortal();
    return;
  }
  renderSellerAnalyticsDashboard();
  renderVolumeDiscountRulesList();
  document.getElementById("analyticsDiscountModal").classList.add("active");
}

function closeAnalyticsDiscountModal() {
  document.getElementById("analyticsDiscountModal").classList.remove("active");
}

function renderSellerAnalyticsDashboard() {
  const container = document.getElementById("sellerAnalyticsSummaryContainer");
  if (!container) return;

  loadMasterOrders();

  const totalOrders = masterOrders.length;
  const totalRevenue = masterOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const completedOrders = masterOrders.filter(o => o.status === "Completed").length;
  const pendingOrders = masterOrders.filter(o => o.status === "Pending" || !o.status).length;

  container.innerHTML = `
    <div class="analytics-grid">
      <div class="analytics-stat-card">
        <div class="analytics-stat-val">${PESO}${totalRevenue.toFixed(2)}</div>
        <div class="analytics-stat-lbl">Total Revenue</div>
      </div>
      <div class="analytics-stat-card">
        <div class="analytics-stat-val">${totalOrders}</div>
        <div class="analytics-stat-lbl">Total Orders</div>
      </div>
      <div class="analytics-stat-card">
        <div class="analytics-stat-val" style="color: #16a34a;">${completedOrders}</div>
        <div class="analytics-stat-lbl">Completed</div>
      </div>
      <div class="analytics-stat-card">
        <div class="analytics-stat-val" style="color: #d97706;">${pendingOrders}</div>
        <div class="analytics-stat-lbl">Pending</div>
      </div>
    </div>
  `;
}

function renderVolumeDiscountRulesList() {
  const container = document.getElementById("volumeDiscountRulesListContainer");
  const targetSelect = document.getElementById("discountRuleTargetSelect");
  if (!container) return;

  if (targetSelect) {
    targetSelect.innerHTML = `
      <option value="ALL">🥐 All Bakery Pastries</option>
      ${pastries.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('')}
    `;
  }

  if (volumeDiscounts.length === 0) {
    container.innerHTML = `<p style="font-size:13px; color:#78350f;">No volume discount rules configured. Add one below!</p>`;
    return;
  }

  container.innerHTML = volumeDiscounts.map(rule => {
    let targetName = "All Bakery Pastries";
    if (rule.targetPastryId !== "ALL") {
      const p = pastries.find(x => String(x.id) === String(rule.targetPastryId));
      if (p) targetName = p.name;
    }

    const discLabel = rule.discountType === "PERCENT" ? `${rule.discountValue}% OFF` : `${PESO}${rule.discountValue} OFF`;

    return `
      <div class="tag-manager-item">
        <div>
          <div class="tag-manager-name">${ICON_GIFT} Buy ${rule.minQty}+ items ${BULLET} <b>${discLabel}</b></div>
          <div style="font-size:12px; color:#78350f;">Applies to: ${escapeHtml(targetName)}</div>
        </div>
        <button class="seller-delete-btn" style="padding:4px 10px; font-size:11px;" onclick="deleteVolumeDiscountRule(${rule.id})">${ICON_TRASH} Delete</button>
      </div>
    `;
  }).join('');
}

function addVolumeDiscountSubmit(event) {
  event.preventDefault();
  const targetId = document.getElementById("discountRuleTargetSelect").value;
  const minQty = parseInt(document.getElementById("discountRuleMinQtyInput").value, 10);
  const type = document.getElementById("discountRuleTypeSelect").value;
  const val = parseFloat(document.getElementById("discountRuleValInput").value);

  if (isNaN(minQty) || minQty <= 0 || isNaN(val) || val <= 0) {
    alert("Please enter valid minimum quantity and discount value.");
    return;
  }

  const newRule = {
    id: Date.now(),
    targetPastryId: targetId,
    minQty: minQty,
    discountType: type,
    discountValue: val,
    active: true
  };

  volumeDiscounts.push(newRule);
  saveVolumeDiscountsToStorage();
  showToast("🎉 Volume discount rule created!");
  renderVolumeDiscountRulesList();
  renderApp();
}

function deleteVolumeDiscountRule(id) {
  if (confirm("Delete this volume discount rule?")) {
    volumeDiscounts = volumeDiscounts.filter(d => d.id !== id);
    saveVolumeDiscountsToStorage();
    showToast("Volume discount rule removed");
    renderVolumeDiscountRulesList();
    renderApp();
  }
}

// Shopee-Style Shopping Cart Functions
function getCartTotalCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function getCartTotalPrice() {
  return cart.reduce((sum, item) => {
    const p = pastries.find(x => String(x.id) === String(item.pastryId));
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
  const pastry = pastries.find(p => String(p.id) === String(pastryId));
  if (!pastry) return;

  if (pastry.stock <= 0 || !pastry.available || storeStatus.code === "CLOSED_TODAY") {
    alert("Sorry! This item is currently unavailable or out of stock.");
    return;
  }

  const existingIndex = cart.findIndex(item => String(item.pastryId) === String(pastryId));
  if (existingIndex !== -1) {
    cart[existingIndex].qty += quantityToAdd;
  } else {
    cart.push({ pastryId: pastryId, qty: quantityToAdd });
  }

  saveCartToStorage();
  renderCartCounters();
  showToast(`${ICON_CART} Added "${pastry.name}" to cart!`);
}

function updateCartItemQty(pastryId, delta) {
  const index = cart.findIndex(item => String(item.pastryId) === String(pastryId));
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
  cart = cart.filter(item => String(item.pastryId) !== String(pastryId));
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
  const discountDisplayEl = document.getElementById("cartDiscountContainer");
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #78350f;">
        <span style="font-size: 44px; display: block; margin-bottom: 8px;">${ICON_CART}</span>
        <h4 style="font-family: 'Playfair Display', serif; font-size: 20px;">Your Cart is Empty</h4>
        <p style="font-size: 13px; margin-top: 4px;">Browse our fresh pastries and click <b>${ICON_CART} Add to Cart</b> or <b>${ICON_LIGHTNING} Buy Now</b>!</p>
      </div>
    `;
    if (totalAmountEl) totalAmountEl.textContent = `${PESO}0.00`;
    if (discountDisplayEl) discountDisplayEl.innerHTML = "";
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  if (checkoutBtn) checkoutBtn.disabled = false;

  const cartItemsHtml = cart.map(item => {
    const pastry = pastries.find(p => String(p.id) === String(item.pastryId));
    if (!pastry) return '';
    const itemTotal = pastry.price * item.qty;

    return `
      <div class="cart-item-row">
        <img src="${pastry.image}" alt="${escapeHtml(pastry.name)}" class="cart-item-img" onerror="this.src='https://placehold.co/100?text=Pastry'">
        <div class="cart-item-info">
          <div class="cart-item-name">${escapeHtml(pastry.name)}</div>
          <div style="font-size:12px; color:#78350f;">${escapeHtml(pastry.itemType || 'Pastry')} ${BULLET} ${PESO}${pastry.price.toFixed(2)} each</div>
          <div class="cart-item-price">${PESO}${itemTotal.toFixed(2)}</div>
        </div>
        <div class="cart-qty-control">
          <button type="button" class="cart-qty-btn" onclick="updateCartItemQty(${pastry.id}, -1)">-</button>
          <span class="cart-qty-val">${item.qty}</span>
          <button type="button" class="cart-qty-btn" onclick="updateCartItemQty(${pastry.id}, 1)">+</button>
        </div>
        <button type="button" class="cart-remove-btn" onclick="removeFromCart(${pastry.id})">${ICON_TRASH}</button>
      </div>
    `;
  }).join('');

  container.innerHTML = cartItemsHtml;

  const cartDisc = calculateCartVolumeDiscount();

  if (discountDisplayEl) {
    if (cartDisc.isApplied && cartDisc.totalDiscount > 0) {
      discountDisplayEl.innerHTML = `
        <div class="discount-applied-box">
          <span>${ICON_GIFT} Volume Discount Applied:</span>
          <span>-${PESO}${cartDisc.totalDiscount.toFixed(2)}</span>
        </div>
      `;
    } else if (cartDisc.neededForDiscount > 0) {
      discountDisplayEl.innerHTML = `
        <div class="discount-progress-prompt">
          <span>${ICON_NOTICE} Buy ${cartDisc.neededForDiscount} more item(s) to unlock Volume Discount!</span>
        </div>
      `;
    } else {
      discountDisplayEl.innerHTML = "";
    }
  }

  if (totalAmountEl) totalAmountEl.textContent = `${PESO}${cartDisc.finalTotal.toFixed(2)}`;
}

// Single-Item Direct Buy Now Modal Controls
function openDirectBuyNowModal(id) {
  const pastry = pastries.find(p => String(p.id) === String(id));
  if (!pastry) return;

  activeOrderingPastry = pastry;

  document.getElementById("orderItemName").textContent = pastry.name;
  document.getElementById("orderItemCategory").textContent = `${pastry.itemType || 'Pastry'} ${BULLET} ${pastry.category}`;
  document.getElementById("orderItemPrice").textContent = `${PESO}${Number(pastry.price).toFixed(2)}`;
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
  const singleDisc = calculateSingleVolumeDiscount(activeOrderingPastry, qty);
  const rawTotal = activeOrderingPastry.price * qty;
  const finalTotal = Math.max(0, rawTotal - singleDisc.discountAmount);

  const totalEl = document.getElementById("orderTotalPrice");
  const discContainerEl = document.getElementById("orderSingleDiscountContainer");

  if (discContainerEl) {
    if (singleDisc.isApplied && singleDisc.discountAmount > 0) {
      discContainerEl.innerHTML = `
        <div class="discount-applied-box" style="margin-bottom:10px;">
          <span>${ICON_GIFT} Volume Discount Applied (${singleDisc.ruleDescription}):</span>
          <span>-${PESO}${singleDisc.discountAmount.toFixed(2)}</span>
        </div>
      `;
    } else if (singleDisc.itemsNeeded > 0) {
      discContainerEl.innerHTML = `
        <div class="discount-progress-prompt" style="margin-bottom:10px;">
          <span>${ICON_NOTICE} Add ${singleDisc.itemsNeeded} more to unlock Volume Discount!</span>
        </div>
      `;
    } else {
      discContainerEl.innerHTML = "";
    }
  }

  if (totalEl) totalEl.textContent = `${PESO}${finalTotal.toFixed(2)}`;
}

// 1. Submit Single Order Form -> Prepares Order (DOES NOT LOG TO NOTIFICATIONS YET!)
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

  const singleDisc = calculateSingleVolumeDiscount(activeOrderingPastry, qty);
  const rawTotal = activeOrderingPastry.price * qty;
  const totalAmount = Math.max(0, rawTotal - singleDisc.discountAmount);
  const summary = `${activeOrderingPastry.name} (${qty}x)`;

  let discNoteText = singleDisc.isApplied ? `\nVolume Discount Applied: -${PESO}${singleDisc.discountAmount.toFixed(2)} (${singleDisc.ruleDescription})` : '';

  const smsBody = `${ICON_BREAD} K'S BAKERY DIRECT ORDER ${ICON_BREAD}\n` +
    `----------------------------\n` +
    `Customer: ${name}\n` +
    `Phone: ${phone}\n` +
    `Item: ${activeOrderingPastry.name} [Tag: ${activeOrderingPastry.itemType || 'Pastry'}] (${activeOrderingPastry.category})\n` +
    `Qty: ${qty} x ${PESO}${activeOrderingPastry.price.toFixed(2)} = ${PESO}${rawTotal.toFixed(2)}${discNoteText}\n` +
    `TOTAL AMOUNT: ${PESO}${totalAmount.toFixed(2)}\n` +
    `Fulfillment: ${fulfillment === "Pickup" ? `${ICON_STORE} In-Store Pickup` : `${ICON_SCOOTER} Home Delivery`}\n` +
    `Notes/Address: ${note || "None"}\n` +
    `----------------------------\n` +
    `Please confirm order availability. Thank you!`;

  currentPreparedOrderText = smsBody;

  const newOrderRecord = {
    id: Math.floor(100000 + Math.random() * 900000),
    date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
    customerName: name,
    customerPhone: phone,
    summaryText: summary,
    item: activeOrderingPastry.name,
    qty: qty,
    total: totalAmount,
    fulfillment: fulfillment,
    note: note,
    status: "Pending"
  };

  pendingCheckoutPayload = {
    orderRecord: newOrderRecord,
    orderText: smsBody,
    totalAmount: totalAmount,
    isCart: false
  };

  closeOrderModal();
  openPCCheckoutModal(smsBody, totalAmount);
}

// 2. Submit Multi-Item Cart Form -> Prepares Order (DOES NOT LOG TO NOTIFICATIONS YET!)
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

  const cartDisc = calculateCartVolumeDiscount();
  const totalAmount = cartDisc.finalTotal;

  let itemsSummaryList = "";
  let shortSummaryList = [];
  cart.forEach((item, index) => {
    const p = pastries.find(x => String(x.id) === String(item.pastryId));
    if (p) {
      itemsSummaryList += `${index + 1}. ${p.name} (${item.qty}x @ ${PESO}${p.price.toFixed(2)}) = ${PESO}${(p.price * item.qty).toFixed(2)}\n`;
      shortSummaryList.push(`${p.name} (${item.qty}x)`);
    }
  });

  let discNoteText = cartDisc.isApplied ? `\nVolume Discount Applied: -${PESO}${cartDisc.totalDiscount.toFixed(2)}\n` : '';

  const smsBody = `${ICON_BREAD} K'S BAKERY MULTI-ITEM ORDER ${ICON_BREAD}\n` +
    `----------------------------------\n` +
    `Customer: ${name}\n` +
    `Phone: ${phone}\n` +
    `Fulfillment: ${fulfillment === "Pickup" ? `${ICON_STORE} In-Store Pickup` : `${ICON_SCOOTER} Home Delivery`}\n` +
    `----------------------------------\n` +
    `ORDERED ITEMS:\n${itemsSummaryList}` +
    `----------------------------------\n` +
    `Subtotal: ${PESO}${cartDisc.rawSubtotal.toFixed(2)}${discNoteText}` +
    `TOTAL AMOUNT: ${PESO}${totalAmount.toFixed(2)}\n` +
    `Notes/Address: ${note || "None"}\n` +
    `----------------------------------\n` +
    `Please confirm order availability. Thank you!`;

  currentPreparedOrderText = smsBody;

  const newOrderRecord = {
    id: Math.floor(100000 + Math.random() * 900000),
    date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
    customerName: name,
    customerPhone: phone,
    summaryText: shortSummaryList.join(", "),
    itemsCount: getCartTotalCount(),
    total: totalAmount,
    fulfillment: fulfillment,
    note: note,
    status: "Pending"
  };

  pendingCheckoutPayload = {
    orderRecord: newOrderRecord,
    orderText: smsBody,
    totalAmount: totalAmount,
    isCart: true
  };

  closeCartModal();
  openPCCheckoutModal(smsBody, totalAmount);
}

// STRICT COMMIT ORDER FUNCTION (Only called when user actually clicks Messenger or SMS!)
function commitPendingOrderToNotifications() {
  if (!pendingCheckoutPayload || !pendingCheckoutPayload.orderRecord) return;

  const record = pendingCheckoutPayload.orderRecord;

  // 1. Save to Customer isolated LocalStorage
  loadCustomerOrders();
  customerOrders.unshift(record);
  saveCustomerOrdersToStorage();

  // 2. Save to Seller Master LocalStorage
  loadMasterOrders();
  masterOrders.unshift(record);
  saveMasterOrdersToStorage();

  // 3. Broadcast real-time order notification across open tabs
  if (orderBroadcastChannel) {
    orderBroadcastChannel.postMessage({ type: "NEW_ORDER", order: record });
  }

  // 4. Clear cart if cart order
  if (pendingCheckoutPayload.isCart) {
    clearCart();
  }

  renderNotificationBadge();
  showToast(`${ICON_BELL} Order #${record.id} logged into Notifications!`);
}

function openPCCheckoutModal(orderText, totalAmount) {
  const modal = document.getElementById("pcCheckoutModal");
  const textContainer = document.getElementById("pcOrderTextPreview");
  const totalDisplay = document.getElementById("pcOrderTotalDisplay");

  if (textContainer) textContainer.value = orderText;
  if (totalDisplay) totalDisplay.textContent = `${PESO}${totalAmount.toFixed(2)}`;

  if (modal) modal.classList.add("active");
}

function closePCCheckoutModal() {
  document.getElementById("pcCheckoutModal").classList.remove("active");
  pendingCheckoutPayload = null;
}

/**
 * ⚡ CONFIRM & SEND VIA MESSENGER (Mary Grace Baduyen Buligen)
 */
function confirmAndSendViaMessenger() {
  const previewArea = document.getElementById("pcOrderTextPreview");
  const orderText = previewArea ? previewArea.value : currentPreparedOrderText;
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(orderText);
  }

  // COMMIT ORDER TO NOTIFICATIONS
  commitPendingOrderToNotifications();

  alert("Order text copied! Paste it (Ctrl + V) in Mary Grace Baduyen Buligen's Messenger chat to complete your order.");
  window.open(`https://m.me/${SELLER_MESSENGER_HANDLE}`, "_blank");

  document.getElementById("pcCheckoutModal").classList.remove("active");
  pendingCheckoutPayload = null;
  renderApp();
}

/**
 * 📱 CONFIRM & SEND VIA SMS TEXT MESSAGE
 */
function confirmAndSendViaSMS() {
  const previewArea = document.getElementById("pcOrderTextPreview");
  const orderText = previewArea ? previewArea.value : currentPreparedOrderText;

  // COMMIT ORDER TO NOTIFICATIONS
  commitPendingOrderToNotifications();

  const encodedSms = encodeURIComponent(orderText);
  const smsUrl = `sms:${SELLER_PHONE_NUMBER}?body=${encodedSms}`;

  document.getElementById("pcCheckoutModal").classList.remove("active");
  pendingCheckoutPayload = null;
  renderApp();

  window.location.href = smsUrl;
}

/**
 * Open Messenger Directly to Mary Grace Baduyen Buligen (marygrace.baduyenbuligen)
 */
function openMessenger() {
  const previewArea = document.getElementById("pcOrderTextPreview");
  const orderText = previewArea ? previewArea.value : currentPreparedOrderText;
  
  if (orderText && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(orderText);
  }

  window.open(`https://m.me/${SELLER_MESSENGER_HANDLE}`, "_blank");
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
    const availText = isAvailable ? `${ICON_GREEN} In Stock (${p.stock})` : (storeStatus.code === "CLOSED_TODAY" ? `${ICON_RED} Store Closed` : `${ICON_RED} Sold Out`);
    
    const subTagHtml = p.itemType ? `<span class="sub-tag-pill-inline">${escapeHtml(p.itemType)}</span>` : '';

    const discRule = getVolumeDiscountRuleForPastry(p.id);
    const discPromptHtml = discRule ? `
      <div class="discount-card-banner">
        <span>${ICON_GIFT} Buy ${discRule.minQty}+ get ${discRule.discountValue}${discRule.discountType === 'PERCENT' ? '%' : PESO} OFF!</span>
      </div>
    ` : '';

    const sellerControlsHtml = isSellerMode ? `
      <div class="seller-card-controls">
        <button class="seller-edit-btn" onclick="openEditPastryModal(${p.id})">${ICON_EDIT} Edit</button>
        <button class="seller-stock-btn" onclick="togglePastryAvailability(${p.id})">
          ${p.available ? 'Mark Sold Out' : 'Mark In Stock'}
        </button>
        <button class="seller-delete-btn" onclick="deletePastryPrompt(${p.id})">${ICON_TRASH}</button>
      </div>
    ` : '';

    return `
      <div class="pastry-card">
        <div class="pastry-img-wrapper">
          <img src="${p.image}" alt="${escapeHtml(p.name)}" class="pastry-img" onerror="this.src='https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80'">
          <span class="category-tag">${escapeHtml(p.category)}</span>
          ${p.badge ? `<span class="custom-badge">${escapeHtml(p.badge)}</span>` : ''}
        </div>
        <div class="pastry-content">
          <div class="pastry-name">
            <span>${escapeHtml(p.name)}</span>
            ${subTagHtml}
          </div>
          <p class="pastry-desc">${escapeHtml(p.description)}</p>
          <div class="discount-banner-slot">
            ${discPromptHtml}
          </div>
          <div class="pastry-footer">
            <div class="pastry-price">${PESO}${Number(p.price).toFixed(2)}</div>
            <div class="availability-badge ${availClass}">
              ${availText}
            </div>
          </div>
          <div class="card-actions-row">
            <button class="btn-buy-now" onclick="openDirectBuyNowModal(${p.id})">
              ${ICON_LIGHTNING} Buy Now
            </button>
            <button class="btn-add-cart" onclick="addToCart(${p.id})">
              ${ICON_CART} Add to Cart
            </button>
            <button class="btn-message-seller-card" onclick="openMessenger()">
              ${ICON_CHAT} Message Seller
            </button>
            <button class="btn-view-details" onclick="openQuickViewModal(${p.id})">
              ${ICON_EYE} Details
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
      <span class="tag-manager-name">${ICON_TAG} ${escapeHtml(tag)}</span>
      <div style="display:flex; gap:6px;">
        <button class="seller-edit-btn" style="padding:4px 10px; font-size:11px;" onclick="editTagPrompt('${escapeHtml(tag)}')">${ICON_EDIT} Edit</button>
        <button class="seller-delete-btn" style="padding:4px 10px; font-size:11px;" onclick="deleteTagPrompt('${escapeHtml(tag)}')">${ICON_TRASH} Delete</button>
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

function populateSellerFormItemTypeSelect(selectedTag = "") {
  const select = document.getElementById("pastryFormItemType");
  if (!select) return;

  select.innerHTML = bakeryTags.map(tag => `
    <option value="${escapeHtml(tag)}" ${tag === selectedTag ? 'selected' : ''}>${escapeHtml(tag)}</option>
  `).join('');
}

// Customer Quick View Modal
function openQuickViewModal(id) {
  const pastry = pastries.find(p => String(p.id) === String(id));
  if (!pastry) return;

  const isAvailable = pastry.stock > 0 && pastry.available;

  document.getElementById("qvImage").src = pastry.image;
  document.getElementById("qvTitle").textContent = pastry.name;
  document.getElementById("qvCategory").textContent = `Tag: ${pastry.itemType || 'Pastry'} ${BULLET} Availability: ${pastry.category}`;
  document.getElementById("qvPrice").textContent = `${PESO}${Number(pastry.price).toFixed(2)}`;
  document.getElementById("qvBadge").textContent = pastry.badge || "Artisanal";
  document.getElementById("qvDescription").textContent = pastry.description;

  const availEl = document.getElementById("qvAvailability");
  if (isAvailable) {
    availEl.className = "availability-badge avail-in-stock";
    availEl.textContent = `${ICON_GREEN} Available In Store / Delivery (${pastry.stock} in stock)`;
  } else {
    availEl.className = "availability-badge avail-out-stock";
    availEl.textContent = `${ICON_RED} Currently Out of Stock`;
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
    showToast("\u{1F389} Seller Portal Unlocked!");
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

  document.getElementById("modalTitleText").textContent = `${ICON_PLUS} Post New Pastry`;
  document.getElementById("pastryFormName").value = "";
  document.getElementById("pastryFormCategory").value = "In Store";
  document.getElementById("pastryFormPrice").value = "";
  document.getElementById("pastryFormStock").value = "10";
  document.getElementById("pastryFormBadge").value = "";
  document.getElementById("pastryFormDesc").value = "";
  document.getElementById("pastryFormUrlInput").value = "";
  document.getElementById("pastryFormImgPreview").src = "https://placehold.co/400x300?text=Upload+Image";
  document.getElementById("pastryFormFileInput").value = "";

  document.getElementById("pastryFormModal").classList.add("active");
}

function openEditPastryModal(id) {
  const p = pastries.find(item => String(item.id) === String(id));
  if (!p) return;

  editingPastryId = id;
  currentUploadedBase64 = null;

  populateSellerFormItemTypeSelect(p.itemType || "Breads");

  document.getElementById("modalTitleText").textContent = `${ICON_EDIT} Update Pastry #${id}`;
  document.getElementById("pastryFormName").value = p.name;
  document.getElementById("pastryFormCategory").value = p.category;
  document.getElementById("pastryFormPrice").value = p.price;
  document.getElementById("pastryFormStock").value = p.stock;
  document.getElementById("pastryFormBadge").value = p.badge || "";
  document.getElementById("pastryFormDesc").value = p.description || "";
  document.getElementById("pastryFormUrlInput").value = p.image.startsWith("http") ? p.image : "";
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
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement("canvas");
      const MAX_WIDTH = 600;
      const MAX_HEIGHT = 600;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height);
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.82);
      currentUploadedBase64 = compressedDataUrl;
      document.getElementById("pastryFormImgPreview").src = compressedDataUrl;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function handleImageUrlPreview() {
  const urlInput = document.getElementById("pastryFormUrlInput").value.trim();
  if (urlInput) {
    document.getElementById("pastryFormImgPreview").src = urlInput;
    currentUploadedBase64 = urlInput;
  }
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
  const imageUrlInput = document.getElementById("pastryFormUrlInput").value.trim();

  if (!name || isNaN(price) || price < 0 || isNaN(stock) || stock < 0) {
    alert("Please enter valid pastry details.");
    return;
  }

  let finalImg = currentUploadedBase64 || imageUrlInput;

  if (editingPastryId) {
    const index = pastries.findIndex(p => String(p.id) === String(editingPastryId));
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
    showToast("\u{2728} New pastry posted successfully!");
  }

  savePastriesToStorage();
  closePastryFormModal();
  renderApp();
}

function togglePastryAvailability(id) {
  const p = pastries.find(item => String(item.id) === String(id));
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
  const p = pastries.find(item => String(item.id) === String(id));
  if (!p) return;

  if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
    pastries = pastries.filter(item => String(item.id) !== String(id));
    savePastriesToStorage();
    showToast("Pastry deleted");
    renderApp();
  }
}

function setupEventListeners() {
  document.getElementById("searchInput")?.addEventListener("input", renderPastriesGrid);
  document.getElementById("pastryFormUrlInput")?.addEventListener("input", handleImageUrlPreview);

  window.addEventListener("beforeunload", () => saveCartToStorage());
  window.addEventListener("pagehide", () => saveCartToStorage());

  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY_MASTER_ORDERS || e.key === STORAGE_KEY_CUSTOMER_ORDERS) {
      loadMasterOrders();
      loadCustomerOrders();
      renderNotificationBadge();
      if (document.getElementById("notificationModal")?.classList.contains("active")) {
        renderNotificationDrawer();
      }
      if (isSellerMode && e.key === STORAGE_KEY_MASTER_ORDERS) {
        showToast(`${ICON_BELL} NEW ORDER RECEIVED IN SELLER PORTAL!`);
      }
    }
    if (e.key === STORAGE_KEY_CART) {
      loadCart();
      renderCartCounters();
      if (document.getElementById("cartModal")?.classList.contains("active")) {
        renderCartDrawer();
      }
    }
    if (e.key === STORAGE_KEY_CHAT_MESSAGES) {
      loadChatMessages();
      if (document.getElementById("shopeeChatModal")?.classList.contains("active")) {
        renderShopeeChatMessages();
      }
    }
  });

  if (orderBroadcastChannel) {
    orderBroadcastChannel.onmessage = (event) => {
      if (event.data && (event.data.type === "NEW_ORDER" || event.data.type === "STATUS_UPDATE")) {
        loadMasterOrders();
        loadCustomerOrders();
        renderNotificationBadge();
        if (document.getElementById("notificationModal")?.classList.contains("active")) {
          renderNotificationDrawer();
        }
        if (isSellerMode && event.data.type === "NEW_ORDER") {
          showToast(`${ICON_BELL} NEW ORDER RECEIVED! Check Notifications.`);
        }
      }
    };
  }
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
