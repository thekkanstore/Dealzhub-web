const { onObjectFinalized } = require("firebase-functions/v2/storage");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const Papa = require("papaparse");

initializeApp();
const db = getFirestore();

// Helper to generate search tokens
function generateSearchTokens(text) {
  if (!text) return [];
  const tokens = new Set();
  const normalizedText = text.toLowerCase().trim();
  const words = normalizedText.split(/\s+/);

  words.forEach(word => {
    tokens.add(word);
    for (let i = 0; i < word.length; i++) {
      for (let j = i + 2; j <= word.length; j++) {
        tokens.add(word.substring(i, j));
      }
    }
  });
  return Array.from(tokens);
}

// Utility to convert to snake_case for image paths if needed
function toSnakeCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

exports.processBulkUpload = onObjectFinalized(
  {
    timeoutSeconds: 300,
    memory: "1GiB",
  },
  async (event) => {
    const fileBucket = event.data.bucket;
    const filePath = event.data.name;

    // Check if it's a bulk upload CSV
    if (!filePath.startsWith("bulk-uploads/") || !filePath.endsWith(".csv")) {
      console.log(`Skipping file: ${filePath}`);
      return;
    }

    console.log(`Processing bulk upload file: ${filePath}`);

    // File path format: bulk-uploads/{storeId}/{filename}.csv
    const pathSegments = filePath.split("/");
    const storeId = pathSegments[1];

    if (!storeId) {
      console.error("Could not extract storeId from filePath.");
      return;
    }

    try {
      const bucket = getStorage().bucket(fileBucket);
      const file = bucket.file(filePath);

      // Download the file contents
      const [contents] = await file.download();
      const csvData = contents.toString("utf-8");

      // Parse the CSV
      const parsed = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
      });

      if (parsed.errors.length > 0) {
        console.error("CSV Parsing errors:", parsed.errors);
      }

      const rows = parsed.data;
      console.log(`Found ${rows.length} rows to process.`);

      if (rows.length === 0) {
        return;
      }

      // Fetch the store to attach to products
      const storeSnap = await db.collection("stores").doc(storeId).get();
      if (!storeSnap.exists) {
        console.error(`Store ${storeId} not found.`);
        return;
      }
      const storeData = storeSnap.data();

      // Fetch categories referenced in the CSV to get their full objects
      const uniqueCategoryIds = [...new Set(rows.map((row) => row.categoryId).filter(Boolean))];
      const categoriesMap = {};
      
      if (uniqueCategoryIds.length > 0) {
        const categoryDocs = await db.collection("categories").where("__name__", "in", uniqueCategoryIds).get();
        categoryDocs.forEach(doc => {
          categoriesMap[doc.id] = { id: doc.id, ...doc.data() };
        });
      }

      const bulkWriter = db.bulkWriter();
      const productsCollectionRef = db.collection("products");

      let processedCount = 0;

      rows.forEach((row) => {
        // Required fields
        const name = row.name || "Unnamed Product";
        const actualPrice = parseFloat(row.actualPrice) || 0;
        const discountPrice = parseFloat(row.discountPrice) || 0;
        const categoryId = row.categoryId || "";
        const description = row.description || "";
        const isSecondHand = String(row.isSecondHand).toLowerCase() === "true";

        const categoryData = categoriesMap[categoryId] || null;
        
        // Generate a new document reference
        const docRef = productsCollectionRef.doc();

        const imagePath = `images/${toSnakeCase(storeId)}/${toSnakeCase(name)}`;

        const productData = {
          id: docRef.id,
          name: name,
          description: description,
          actualPrice: actualPrice,
          discountPrice: discountPrice,
          images: [], // Empty initially
          imagePath: imagePath,
          categoryId: categoryId,
          category: categoryData,
          storeId: storeId,
          store: { id: storeId, ...storeData }, // Full store object
          userId: storeData.userId || "",
          isSecondHand: isSecondHand,
          isOutOfStock: false,
          isSoldOut: false,
          status: "instock",
          nameLower: name.toLowerCase(),
          searchTokens: generateSearchTokens(name),
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
        };

        bulkWriter.set(docRef, productData);
        processedCount++;
      });

      // Wait for all writes to finish
      await bulkWriter.close();
      console.log(`Successfully created ${processedCount} products via BulkWriter.`);

      // Optional: Delete the CSV file after successful processing
      // await file.delete();
      // console.log(`Deleted processed file: ${filePath}`);

    } catch (error) {
      console.error("Error processing bulk upload:", error);
    }
  }
);
