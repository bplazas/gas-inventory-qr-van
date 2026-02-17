/**
 * Main trigger: Runs on every change in the spreadsheet.
 * Only processes new rows added to the Transactions sheet.
 */
function logNewTransaction(e) {
  Logger.log("=== TRIGGER FIRED at " + new Date().toISOString() + " ===");

  if (!e) {
    Logger.log("ERROR: No event object");
    return;
  }

  const spreadsheet = e.source;
  const sheet = spreadsheet.getActiveSheet();

  if (!sheet || sheet.getName().trim() !== "Transactions") {
    Logger.log("Skipping - not Transactions sheet");
    return;
  }

  const lastRow = sheet.getLastRow();
  const columnCount = sheet.getLastColumn();
  const rowValues = sheet.getRange(lastRow, 1, 1, columnCount).getValues()[0];

  const timestampIndex = 0; // column A = Timestamp
  const typeIndex = 1; // column B = Type (CHARGE / DISCHARGE)
  const skuIndex = 2; // column C = SKU
  const quantityIndex = 3; // column D = Quantity

  const time2Update = rowValues[timestampIndex]
    ? new Date(rowValues[timestampIndex])
    : new Date();
  const transactionType = rowValues[typeIndex]
    ? rowValues[typeIndex].toString().trim()
    : "";
  const sku2Update = rowValues[skuIndex]
    ? rowValues[skuIndex].toString().trim()
    : "";
  const quant2Update = Number(rowValues[quantityIndex]) || 0;

  Logger.log("Extracted from transaction:");
  Logger.log("  Timestamp: " + time2Update.toISOString());
  Logger.log("  Type:      " + transactionType);
  Logger.log("  SKU:       " + sku2Update);
  Logger.log("  Quantity:  " + quant2Update);

  // Safety checks
  if (!sku2Update || quant2Update === 0) {
    Logger.log("Skipping - missing SKU or quantity = 0");
    return;
  }

  // Pass all needed data to the updater function
  updateInventory(sku2Update, quant2Update, transactionType, time2Update);

  Logger.log("=== TRIGGER COMPLETE ===");
}
