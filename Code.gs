/************************************************************
 * K'S BAKERY MANAGEMENT SYSTEM
 * Version 3.0 - Server Script (Code.gs)
 ************************************************************/

/************************************************************
 * SPREADSHEET CONFIGURATION
 ************************************************************/
const SPREADSHEET_ID = "1jFFxpg3XeE54TFeegIKnRZHmgdt3mLVHiZvI3BkRGZ8";

const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

const CONFIG = {
  WEBSITE_NAME: "K's Bakery",
  PRODUCTS_SHEET: "Products",
  SETTINGS_SHEET: "Settings",
  ADMIN_PASSWORD: "KsBakery2026",
  // Root folder where all bakery images will be stored
  DRIVE_FOLDER_ID: "1f_uS2JSPiNEZBIGwoXWoEy-MS-1idmJe",
  DEFAULT_IMAGE: "https://placehold.co/600x600?text=No+Image"
};

/************************************************************
 * HTML INCLUDE HELPER
 ************************************************************/
function include(filename) {
  return HtmlService
    .createHtmlOutputFromFile(filename)
    .getContent();
}

/************************************************************
 * AUTHENTICATION & ROUTER
 ************************************************************/
function isLoggedIn() {
  const userProperties = PropertiesService.getUserProperties();
  return userProperties.getProperty("IS_LOGGED_IN") === "true";
}

function loginUser(password) {
  if (password === CONFIG.ADMIN_PASSWORD) {
    PropertiesService.getUserProperties().setProperty("IS_LOGGED_IN", "true");
    return { success: true };
  }
  return { success: false, message: "Invalid Password" };
}

function logoutUser() {
  PropertiesService.getUserProperties().deleteProperty("IS_LOGGED_IN");
  return { success: true };
}

function doGet(e) {
  try {
    let page = "Index";

    if (e && e.parameter && e.parameter.page) {
      switch (e.parameter.page) {
        case "login":
          page = "Login";
          break;
        case "admin":
          if (!isLoggedIn()) {
            return HtmlService
              .createTemplateFromFile("Login")
              .evaluate()
              .setTitle("K's Bakery Admin Login")
              .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
          }
          page = "Admin";
          break;
        default:
          page = "Index";
      }
    }

    return HtmlService
      .createTemplateFromFile(page)
      .evaluate()
      .setTitle(CONFIG.WEBSITE_NAME)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

  } catch(err) {
    return HtmlService.createHtmlOutput(
      "<h2>Application Error</h2><pre>" +
      err.message + "\n\n" + err.stack + "</pre>"
    );
  }
}

/************************************************************
 * DRIVE & FILE STORAGE
 ************************************************************/
function getRootFolder() {
  return DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
}

function getOrCreateFolder(folderName) {
  const root = getRootFolder();
  const folders = root.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return root.createFolder(folderName);
}

function getDriveImageUrl(fileId) {
  if (!fileId) {
    return CONFIG.DEFAULT_IMAGE;
  }
  return "https://drive.google.com/uc?export=view&id=" + fileId;
}

/**
 * Uploads a base64 encoded image string to Google Drive in the target subfolder.
 */
function uploadFileToFolder(base64Data, fileName, folderName) {
  try {
    const folder = getOrCreateFolder(folderName);
    const splitData = base64Data.split(",");
    const contentType = splitData[0].match(/:(.*?);/)[1];
    const decodedData = Utilities.base64Decode(splitData[1]);
    const blob = Utilities.newBlob(decodedData, contentType, fileName);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getId();
  } catch(err) {
    Logger.log("Upload error: " + err.message);
    throw new Error("Failed to upload image: " + err.message);
  }
}

/************************************************************
 * PRODUCTS MANAGEMENT
 ************************************************************/

function getProducts() {
  initializeDatabase();
  const sheet = ss.getSheetByName(CONFIG.PRODUCTS_SHEET);
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  data.shift(); // remove header row

  return data.map(row => ({
    id: row[0],
    category: row[1],
    name: row[2],
    price: Number(row[3]),
    stock: Number(row[4]),
    available: row[5] === true || row[5] === "TRUE" || Number(row[4]) > 0,
    badge: row[6],
    description: row[7],
    imageID: row[8],
    image: getDriveImageUrl(row[8])
  }));
}

function getProduct(id) {
  const products = getProducts();
  return products.find(p => String(p.id) === String(id));
}

function getNextProductID() {
  const sheet = ss.getSheetByName(CONFIG.PRODUCTS_SHEET);
  if (!sheet || sheet.getLastRow() <= 1) {
    return 1;
  }
  const ids = sheet
    .getRange(2, 1, sheet.getLastRow() - 1, 1)
    .getValues()
    .flat()
    .map(Number);

  return Math.max(...ids) + 1;
}

function addProduct(product) {
  initializeDatabase();
  const sheet = ss.getSheetByName(CONFIG.PRODUCTS_SHEET);
  const id = getNextProductID();

  sheet.appendRow([
    id,
    product.category,
    product.name,
    Number(product.price),
    Number(product.stock),
    Number(product.stock) > 0,
    product.badge || "",
    product.description || "",
    product.imageID || ""
  ]);

  return true;
}

function updateProduct(product) {
  initializeDatabase();
  const sheet = ss.getSheetByName(CONFIG.PRODUCTS_SHEET);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(product.id)) {
      sheet.getRange(i + 1, 2).setValue(product.category);
      sheet.getRange(i + 1, 3).setValue(product.name);
      sheet.getRange(i + 1, 4).setValue(Number(product.price));
      sheet.getRange(i + 1, 5).setValue(Number(product.stock));
      sheet.getRange(i + 1, 6).setValue(Number(product.stock) > 0);
      sheet.getRange(i + 1, 7).setValue(product.badge || "");
      sheet.getRange(i + 1, 8).setValue(product.description || "");

      if (product.imageID) {
        sheet.getRange(i + 1, 9).setValue(product.imageID);
      }
      return true;
    }
  }
  return false;
}

/**
 * Higher-level function to save (add or update) product with optional image upload
 */
function saveProductWithImage(productData, imageBase64, imageName) {
  if (imageBase64 && imageName) {
    const fileId = uploadFileToFolder(imageBase64, imageName, "Products");
    productData.imageID = fileId;
  }

  if (productData.id) {
    updateProduct(productData);
  } else {
    addProduct(productData);
  }

  return { success: true, message: "Product saved successfully!" };
}

function deleteProduct(id) {
  const sheet = ss.getSheetByName(CONFIG.PRODUCTS_SHEET);
  if (!sheet) return false;
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return true;
    }
  }
  return false;
}

function searchProducts(keyword) {
  keyword = (keyword || "").toLowerCase();
  return getProducts().filter(p =>
    p.name.toLowerCase().includes(keyword) ||
    p.category.toLowerCase().includes(keyword)
  );
}

function getCategory(category) {
  return getProducts().filter(p => p.category === category);
}

/************************************************************
 * STORE SETTINGS MANAGEMENT
 ************************************************************/

function safe(value) {
  if (value === null || value === undefined) return "";
  return value;
}

function initializeSettingsSheet() {
  let sheet = ss.getSheetByName(CONFIG.SETTINGS_SHEET);
  if (sheet) return;

  sheet = ss.insertSheet(CONFIG.SETTINGS_SHEET);
  sheet.appendRow(["Key", "Value"]);

  const defaults = [
    ["StoreName", "K's Bakery"],
    ["Tagline", "Freshly Baked Everyday"],
    ["Logo", ""],
    ["Banner", ""],
    ["Address", "Tabuk City, Kalinga"],
    ["Phone", "0995-531-4145"],
    ["Facebook", ""],
    ["Email", ""]
  ];

  sheet.getRange(2, 1, defaults.length, 2).setValues(defaults);
  sheet.autoResizeColumns(1, 2);
}

function getStoreSettings() {
  initializeSettingsSheet();
  const sheet = ss.getSheetByName(CONFIG.SETTINGS_SHEET);
  const values = sheet.getDataRange().getValues();
  const settings = {};

  values.slice(1).forEach(function (row) {
    settings[row[0]] = safe(row[1]);
  });

  return {
    storeName: settings.StoreName,
    tagline: settings.Tagline,
    logo: getDriveImageUrl(settings.Logo),
    banner: getDriveImageUrl(settings.Banner),
    address: settings.Address,
    phone: settings.Phone,
    facebook: settings.Facebook,
    email: settings.Email
  };
}

function updateSetting(sheet, map, key, value) {
  if (!map[key]) {
    sheet.appendRow([key, safe(value)]);
    return;
  }
  sheet.getRange(map[key], 2).setValue(safe(value));
}

function saveStoreSettings(data) {
  initializeSettingsSheet();
  const sheet = ss.getSheetByName(CONFIG.SETTINGS_SHEET);
  const values = sheet.getDataRange().getValues();
  const map = {};

  for (let i = 1; i < values.length; i++) {
    map[values[i][0]] = i + 1;
  }

  updateSetting(sheet, map, "StoreName", data.storeName);
  updateSetting(sheet, map, "Tagline", data.tagline);
  updateSetting(sheet, map, "Address", data.address);
  updateSetting(sheet, map, "Phone", data.phone);
  updateSetting(sheet, map, "Facebook", data.facebook);
  updateSetting(sheet, map, "Email", data.email);

  return {
    success: true,
    message: "Settings Saved"
  };
}

function saveLogo(fileId) {
  initializeSettingsSheet();
  const sheet = ss.getSheetByName(CONFIG.SETTINGS_SHEET);
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === "Logo") {
      sheet.getRange(i + 1, 2).setValue(fileId);
      return true;
    }
  }
  sheet.appendRow(["Logo", fileId]);
  return true;
}

function saveBanner(fileId) {
  initializeSettingsSheet();
  const sheet = ss.getSheetByName(CONFIG.SETTINGS_SHEET);
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === "Banner") {
      sheet.getRange(i + 1, 2).setValue(fileId);
      return true;
    }
  }
  sheet.appendRow(["Banner", fileId]);
  return true;
}

/**
 * Higher-level function to save settings along with optional Logo and Banner uploads
 */
function saveAllStoreSettings(settingsData, logoBase64, logoName, bannerBase64, bannerName) {
  if (logoBase64 && logoName) {
    const logoId = uploadFileToFolder(logoBase64, logoName, "Logo");
    saveLogo(logoId);
  }

  if (bannerBase64 && bannerName) {
    const bannerId = uploadFileToFolder(bannerBase64, bannerName, "Banner");
    saveBanner(bannerId);
  }

  return saveStoreSettings(settingsData);
}

/************************************************************
 * APPLICATION INITIALIZATION
 ************************************************************/
function initializeDatabase() {
  let sheet = ss.getSheetByName(CONFIG.PRODUCTS_SHEET);
  if (sheet) return;

  sheet = ss.insertSheet(CONFIG.PRODUCTS_SHEET);
  sheet.appendRow([
    "ID",
    "Category",
    "Name",
    "Price",
    "Stock",
    "Available",
    "Badge",
    "Description",
    "Image"
  ]);
  sheet.setFrozenRows(1);
}

function initializeApplication() {
  initializeDatabase();
  initializeSettingsSheet();
  getOrCreateFolder("Products");
  getOrCreateFolder("Logo");
  getOrCreateFolder("Banner");

  Logger.log("================================");
  Logger.log("K's Bakery Initialized");
  Logger.log("Products Sheet ✓");
  Logger.log("Settings Sheet ✓");
  Logger.log("Products Folder ✓");
  Logger.log("Logo Folder ✓");
  Logger.log("Banner Folder ✓");
  Logger.log("================================");
}

function getVersion() {
  return {
    version: "3.0",
    build: "2026.08",
    website: CONFIG.WEBSITE_NAME
  };
}
