/**
 * Updates the Inventory sheet based on a single transaction.
 *
 * @param {string} sku - The SKU code to update (e.g. "REF-005")
 * @param {number} quantity - The number of units (positive)
 * @param {string} type - "CHARGE" or "DISCHARGE"
 * @param {Date} timestamp - When the transaction happened
 */
function updateInventory(sku, quantity, type, timestamp) {
  Logger.log("=== updateInventory called ===");
  Logger.log("  SKU:        " + sku);
  Logger.log("  Quantity:   " + quantity);
  Logger.log("  Type:       " + type);
  Logger.log(
    "  Timestamp:  " + (timestamp ? timestamp.toISOString() : "missing"),
  );

  // === Find the row in Inventory sheet where SKU matches ===

  const inventorySheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Inventory");
  if (!inventorySheet) {
    Logger.log("ERROR: Inventory sheet not found");
    return;
  }

  // Get all SKUs from column A (skip header row 1)
  const skuColumn = inventorySheet
    .getRange("A2:A" + inventorySheet.getLastRow())
    .getValues();
  const skuArray = skuColumn.flat(); // convert 2D array to 1D

  // Find the index in the array (0-based relative to A2)
  const foundIndex = skuArray.findIndex(
    (currentSku) => currentSku.toString().trim() === sku,
  );

  if (foundIndex === -1) {
    Logger.log("WARNING: SKU not found in Inventory: " + sku);
    return;
  }

  // Convert array index to real sheet row number (A2 is row 2)
  const targetRow = foundIndex + 2;

  Logger.log("SKU found!");
  Logger.log("  Target row: " + targetRow);

  // === Update LastUpdated and CurrentQty in the found row ===

  // Column letters (1-based)
  const qtyColumn = 3; // C = CurrentQty
  const updatedColumn = 4; // D = LastUpdated

  // Get current quantity from the target row
  const currentQtyCell = inventorySheet.getRange(targetRow, qtyColumn);
  const currentQty = Number(currentQtyCell.getValue()) || 0;

  // Calculate new quantity
  let newQty;
  if (type.toUpperCase() === "CHARGE") {
    newQty = currentQty + quantity;
  } else if (type.toUpperCase() === "DISCHARGE") {
    newQty = currentQty - quantity;
  } else {
    Logger.log("WARNING: Unknown transaction type: " + type);
    return;
  }

  // Write the new values (only two cells)
  currentQtyCell.setValue(newQty);

  const updatedCell = inventorySheet.getRange(targetRow, updatedColumn);
  updatedCell.setValue(timestamp);

  Logger.log("Inventory updated successfully:");
  Logger.log("  Old qty:   " + currentQty);
  Logger.log("  New qty:   " + newQty);
  Logger.log("  Last updated set to: " + timestamp.toISOString());

  Logger.log("=== updateInventory finished (placeholder) ===");
}
