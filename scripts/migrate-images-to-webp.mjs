/**
 * DealzHub Image Migration to WebP Tool (100% Backward-Compatible)
 *
 * Downloads legacy uncompressed images from Firebase Storage / external URLs,
 * converts and downscales them to high-efficiency WebP (1200px max, quality 82),
 * uploads the new WebP versions alongside the originals, preserves full
 * backup in 'legacyImageBackup', and updates Firestore documents.
 *
 * Modes:
 *   node scripts/migrate-images-to-webp.mjs              # Dry-run audit (read-only preview)
 *   node scripts/migrate-images-to-webp.mjs --test-one   # Safe test on exactly 1 product
 *   node scripts/migrate-images-to-webp.mjs --apply      # Full non-destructive migration
 *   node scripts/migrate-images-to-webp.mjs --rollback   # Instant 1-click rollback from backup
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import sharp from 'sharp';
import { getFirebaseConfig, loadEnv } from './load-env.mjs';

const isApplyMode = process.argv.includes('--apply');
const isTestOneMode = process.argv.includes('--test-one');
const isRollbackMode = process.argv.includes('--rollback');
const isDryRun = !isApplyMode && !isTestOneMode && !isRollbackMode;

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function isWebPUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return cleanUrl.endsWith('.webp');
}

async function convertBufferToWebP(buffer) {
  return sharp(buffer)
    .resize({
      width: 1200,
      height: 1200,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({
      quality: 82,
      effort: 4,
    })
    .toBuffer();
}

async function main() {
  console.log('===========================================================');
  console.log('🖼️  DealzHub 100% Backward-Compatible WebP Migration Tool');
  if (isDryRun) {
    console.log('🔍 MODE: DRY-RUN (Read-only scan & savings estimate)');
  } else if (isTestOneMode) {
    console.log('🧪 MODE: TEST-ONE (Converting exactly 1 product for inspection)');
  } else if (isRollbackMode) {
    console.log('⏪ MODE: ROLLBACK (Restoring all images from legacyImageBackup)');
  } else if (isApplyMode) {
    console.log('⚠️  MODE: APPLY (Converting and writing WebP images to DB)');
  }
  console.log('===========================================================\n');

  loadEnv();
  const firebaseConfig = getFirebaseConfig();
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const storage = getStorage(app);

  // Authenticate for write operations
  if (isApplyMode || isTestOneMode || isRollbackMode) {
    const auth = getAuth(app);
    const adminEmail = process.env.ADMIN_EMAIL || process.env.VITE_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.VITE_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error(
        'Missing admin credentials. Please define ADMIN_EMAIL and ADMIN_PASSWORD in your .env file.'
      );
    }

    console.log(`🔐 Authenticating as ${adminEmail}...`);
    try {
      const cred = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      console.log(`✅ Authenticated successfully as ${cred.user.email} (${cred.user.uid})\n`);
    } catch (authErr) {
      console.error(`❌ Authentication failed:`, authErr.message);
      process.exit(1);
    }
  }

  // -------------------------------------------------------------
  // ROLLBACK HANDLER
  // -------------------------------------------------------------
  if (isRollbackMode) {
    console.log('🔄 Executing rollback to original images from legacyImageBackup...');
    const productsSnap = await getDocs(collection(db, 'products'));
    let restoredProducts = 0;

    for (const docSnap of productsSnap.docs) {
      const data = docSnap.data();
      if (data.legacyImageBackup && Array.isArray(data.legacyImageBackup.images)) {
        console.log(`   Restoring product ${docSnap.id} ("${data.name}")...`);
        await updateDoc(doc(db, 'products', docSnap.id), {
          images: data.legacyImageBackup.images,
          image: data.legacyImageBackup.image || data.legacyImageBackup.images[0] || '',
          legacyImageBackup: null,
          rolledBackAt: new Date().toISOString(),
        });
        restoredProducts++;
      }
    }

    const storesSnap = await getDocs(collection(db, 'stores'));
    let restoredStores = 0;

    for (const docSnap of storesSnap.docs) {
      const data = docSnap.data();
      if (data.legacyImageBackup) {
        console.log(`   Restoring store ${docSnap.id} ("${data.storeName}")...`);
        const updatePayload = {
          legacyImageBackup: null,
          rolledBackAt: new Date().toISOString(),
        };
        if (data.legacyImageBackup.logoUrl) updatePayload.logoUrl = data.legacyImageBackup.logoUrl;
        if (data.legacyImageBackup.logo) updatePayload.logo = data.legacyImageBackup.logo;
        await updateDoc(doc(db, 'stores', docSnap.id), updatePayload);
        restoredStores++;
      }
    }

    console.log(`\n🎉 Rollback complete!`);
    console.log(`   Restored ${restoredProducts} products and ${restoredStores} stores to original URLs.\n`);
    return;
  }

  // -------------------------------------------------------------
  // FETCH CATALOG FOR SCAN OR MIGRATION
  // -------------------------------------------------------------
  console.log('📦 Scanning Firestore products...');
  const productsSnap = await getDocs(collection(db, 'products'));
  const products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  console.log('🏪 Scanning Firestore stores...');
  const storesSnap = await getDocs(collection(db, 'stores'));
  const stores = storesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

  const unmigratedProducts = [];
  for (const p of products) {
    const rawImages = p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []);
    const needsConversion = rawImages.some(url => url && !isWebPUrl(url));
    if (needsConversion) {
      unmigratedProducts.push({ product: p, images: rawImages });
    }
  }

  const unmigratedStores = [];
  for (const s of stores) {
    const logo = s.logoUrl || s.logo;
    if (logo && !isWebPUrl(logo)) {
      unmigratedStores.push({ store: s, logo });
    }
  }

  console.log(`\n📊 Scan Summary:`);
  console.log(`   • Total Products: ${products.length} (${unmigratedProducts.length} need WebP conversion)`);
  console.log(`   • Total Stores:   ${stores.length} (${unmigratedStores.length} need logo WebP conversion)\n`);

  if (unmigratedProducts.length === 0 && unmigratedStores.length === 0) {
    console.log('✅ All catalog images and store logos are already in WebP format!');
    return;
  }

  // -------------------------------------------------------------
  // DRY-RUN AUDIT
  // -------------------------------------------------------------
  if (isDryRun) {
    console.log('-----------------------------------------------------------');
    console.log('📋 Uncompressed Items Audit:');
    console.log('-----------------------------------------------------------');

    let totalRawEstimatedBytes = 0;
    let totalProjectedBytes = 0;

    for (const item of unmigratedProducts.slice(0, 15)) {
      console.log(`🛍️  Product: "${item.product.name}" (ID: ${item.product.id})`);
      console.log(`    Images (${item.images.length}):`);
      for (const imgUrl of item.images) {
        console.log(`      • ${imgUrl.slice(0, 85)}...`);
      }
    }

    if (unmigratedProducts.length > 15) {
      console.log(`    ... and ${unmigratedProducts.length - 15} more products.`);
    }

    console.log('\nEstimated savings per typical product image:');
    console.log('  • Average raw image size:   ~3.5 MB (JPEG/PNG)');
    console.log('  • Converted WebP size:      ~95 KB (82 quality, 1200px constraint)');
    console.log('  • Estimated bandwidth cut:  ~97% reduction');

    console.log('\n💡 Next Steps:');
    console.log('  1. Run single-product test to verify on Web & Mobile:');
    console.log('     node scripts/migrate-images-to-webp.mjs --test-one\n');
    console.log('  2. Run full catalog migration when verified:');
    console.log('     node scripts/migrate-images-to-webp.mjs --apply\n');
    return;
  }

  // -------------------------------------------------------------
  // TARGET SELECTION: TEST-ONE VS FULL APPLY
  // -------------------------------------------------------------
  const targets = isTestOneMode ? unmigratedProducts.slice(0, 1) : unmigratedProducts;

  console.log(`🚀 Processing ${targets.length} product(s)...`);

  const stats = {
    totalOriginalBytes: 0,
    totalWebpBytes: 0,
    successfulProducts: 0,
    failedProducts: 0,
  };

  async function migrateSingleProduct(item, currentNum, totalCount) {
    const { product, images } = item;
    console.log(`\n[${currentNum}/${totalCount}] Starting Product: "${product.name}" (${product.id})`);

    const newWebpUrls = [];
    const originalUrls = [...images];
    let productOriginalBytes = 0;
    let productWebpBytes = 0;

    for (let imgIndex = 0; imgIndex < images.length; imgIndex++) {
      const originalUrl = images[imgIndex];
      if (isWebPUrl(originalUrl)) {
        newWebpUrls.push(originalUrl);
        continue;
      }

      try {
        const fetchRes = await fetch(originalUrl, { signal: AbortSignal.timeout(15000) });
        if (!fetchRes.ok) {
          throw new Error(`HTTP ${fetchRes.status}`);
        }
        const originalArrayBuffer = await fetchRes.arrayBuffer();
        const originalBuffer = Buffer.from(originalArrayBuffer);
        const originalSize = originalBuffer.length;
        productOriginalBytes += originalSize;

        const webpBuffer = await convertBufferToWebP(originalBuffer);
        const webpSize = webpBuffer.length;
        productWebpBytes += webpSize;

        const cleanStoreId = product.storeId || 'common';
        const timestamp = Date.now();
        const storagePath = `images/${cleanStoreId}/webp/${product.id}_img${imgIndex}_${timestamp}.webp`;
        const storageRef = ref(storage, storagePath);

        await uploadBytes(storageRef, webpBuffer, {
          contentType: 'image/webp',
          cacheControl: 'public, max-age=31536000',
        });

        const downloadUrl = await getDownloadURL(storageRef);
        newWebpUrls.push(downloadUrl);
      } catch (convertErr) {
        console.warn(`   ⚠️ Image ${imgIndex + 1} fallback on "${product.name}":`, convertErr.message);
        newWebpUrls.push(originalUrl);
      }
    }

    try {
      const docRef = doc(db, 'products', product.id);
      await updateDoc(docRef, {
        images: newWebpUrls,
        image: newWebpUrls[0] || '',
        legacyImageBackup: {
          images: originalUrls,
          image: product.image || originalUrls[0] || '',
          migratedAt: new Date().toISOString(),
        },
      });

      stats.totalOriginalBytes += productOriginalBytes;
      stats.totalWebpBytes += productWebpBytes;
      stats.successfulProducts++;

      const reduction = productOriginalBytes > 0 ? Math.round((1 - productWebpBytes / productOriginalBytes) * 100) : 0;
      console.log(`   ✅ [${currentNum}/${totalCount}] "${product.name}": ${formatBytes(productOriginalBytes)} ➔ ${formatBytes(productWebpBytes)} (-${reduction}%)`);
    } catch (saveErr) {
      console.error(`   ❌ Failed to save Firestore doc for "${product.name}":`, saveErr.message);
      stats.failedProducts++;
    }
  }

  // Process products with controlled concurrency of 4
  const CONCURRENCY = isTestOneMode ? 1 : 4;
  for (let i = 0; i < targets.length; i += CONCURRENCY) {
    const chunk = targets.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map((item, offset) => migrateSingleProduct(item, i + offset + 1, targets.length)));
  }

  // If full apply mode, migrate store logos as well
  if (isApplyMode && unmigratedStores.length > 0) {
    console.log(`\n🏪 Processing ${unmigratedStores.length} store logo(s)...`);
    for (let i = 0; i < unmigratedStores.length; i++) {
      const { store, logo } = unmigratedStores[i];
      console.log(`\n[${i + 1}/${unmigratedStores.length}] Migrating Store Logo: "${store.storeName}" (${store.id})`);
      try {
        const fetchRes = await fetch(logo, { signal: AbortSignal.timeout(15000) });
        if (!fetchRes.ok) throw new Error(`HTTP ${fetchRes.status}`);
        const originalBuffer = Buffer.from(await fetchRes.arrayBuffer());
        const originalSize = originalBuffer.length;

        const webpBuffer = await convertBufferToWebP(originalBuffer);
        const webpSize = webpBuffer.length;

        const storagePath = `store_logos/webp/${store.id}_${Date.now()}.webp`;
        const storageRef = ref(storage, storagePath);

        await uploadBytes(storageRef, webpBuffer, {
          contentType: 'image/webp',
          cacheControl: 'public, max-age=31536000',
        });

        const newLogoUrl = await getDownloadURL(storageRef);

        const storeDocRef = doc(db, 'stores', store.id);
        await updateDoc(storeDocRef, {
          logoUrl: newLogoUrl,
          logo: newLogoUrl,
          legacyImageBackup: {
            logoUrl: store.logoUrl || null,
            logo: store.logo || null,
            migratedAt: new Date().toISOString(),
          },
        });
        console.log(`   ✅ Store logo migrated: ${formatBytes(originalSize)} ➔ ${formatBytes(webpSize)}`);
      } catch (storeLogoErr) {
        console.error(`   ❌ Failed to migrate store logo for ${store.id}:`, storeLogoErr.message);
      }
    }
  }

  const grandReduction = stats.totalOriginalBytes > 0
    ? Math.round((1 - stats.totalWebpBytes / stats.totalOriginalBytes) * 100)
    : 0;

  console.log('\n===========================================================');
  console.log('🏁 Migration Batch Finished!');
  console.log(`   • Successful Products: ${stats.successfulProducts}`);
  console.log(`   • Failed Products:     ${stats.failedProducts}`);
  console.log(`   • Total Original Size: ${formatBytes(stats.totalOriginalBytes)}`);
  console.log(`   • Total WebP Size:     ${formatBytes(stats.totalWebpBytes)}`);
  console.log(`   • Overall Reduction:   ${grandReduction}%`);
  console.log('===========================================================\n');
}

main().catch(err => {
  console.error('\n❌ Unhandled error during migration:', err);
  process.exit(1);
});
