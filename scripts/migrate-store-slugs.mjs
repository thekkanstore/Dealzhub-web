/**
 * DealzHub Store Slug & QR Link Migration Tool
 *
 * Scans Firestore 'stores' collection to identify legacy records missing
 * 'slug' and 'storeUrl' fields, generates clean SEO-friendly unique slugs,
 * and updates each document with 'slug' and 'storeUrl' (https://dealzhub.co.in/shop/<slug>).
 *
 * Usage:
 *   node scripts/migrate-store-slugs.mjs            # Dry-run mode (read-only preview)
 *   node scripts/migrate-store-slugs.mjs --apply    # Executes updates in Firestore
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
import { getFirebaseConfig, loadEnv } from './load-env.mjs';

const isApplyMode = process.argv.includes('--apply');

function generateBaseSlug(storeName) {
  if (!storeName || typeof storeName !== 'string') return 'shop';
  const cleaned = storeName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || 'shop';
}

async function runMigration() {
  console.log('===========================================================');
  console.log('🚀 DealzHub Store Slug & QR Link Migration');
  console.log(`Mode: ${isApplyMode ? '⚠️  APPLY (Writes will be committed to Firestore)' : '🔍 DRY-RUN (Read-only preview)'}`);
  console.log('===========================================================\n');

  loadEnv();
  const firebaseConfig = getFirebaseConfig();
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  if (isApplyMode) {
    const auth = getAuth(app);
    const adminEmail = process.env.ADMIN_EMAIL || process.env.VITE_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.VITE_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error(
        'Missing admin credentials in environment. Please set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file to commit writes to Firestore.'
      );
    }

    console.log(`🔐 Authenticating as ${adminEmail}...`);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      console.log(`✅ Authenticated successfully as ${userCredential.user.email} (${userCredential.user.uid})\n`);
    } catch (authErr) {
      console.error(`❌ Authentication failed:`, authErr.message);
      process.exit(1);
    }
  }

  console.log('📦 Fetching all stores from Firestore...');
  const snapshot = await getDocs(collection(db, 'stores'));
  console.log(`   Found ${snapshot.size} total store documents.\n`);

  // Step 1: Collect existing slugs and find stores needing slug or storeUrl
  const usedSlugs = new Set();
  const storesToMigrate = [];
  const storesMissingStoreUrlOnly = [];

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data.slug) {
      usedSlugs.add(data.slug.toLowerCase().trim());
      if (!data.storeUrl) {
        storesMissingStoreUrlOnly.push({
          id: docSnap.id,
          storeName: data.storeName || 'Store',
          slug: data.slug.toLowerCase().trim(),
        });
      }
    } else {
      storesToMigrate.push({
        id: docSnap.id,
        storeName: data.storeName || 'Store',
        email: data.email || '',
        vendorStatus: data.vendorStatus || 'unknown',
      });
    }
  });

  console.log(`📊 Initial Audit:`);
  console.log(`   - Stores with existing slug: ${usedSlugs.size}`);
  console.log(`   - Stores needing new slug:   ${storesToMigrate.length}`);
  console.log(`   - Stores with slug but missing storeUrl: ${storesMissingStoreUrlOnly.length}\n`);

  let updatedCount = 0;
  let errorCount = 0;

  // Step 2: Assign unique slugs to stores missing slugs
  for (const store of storesToMigrate) {
    const baseSlug = generateBaseSlug(store.storeName);
    let candidateSlug = baseSlug;

    // Resolve collisions using randomized 4-digit number (matching ADR-005 & storeFirestoreService)
    if (usedSlugs.has(candidateSlug)) {
      do {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        candidateSlug = `${baseSlug}-${randomNum}`;
      } while (usedSlugs.has(candidateSlug));
    }

    usedSlugs.add(candidateSlug);
    const storeUrl = `https://dealzhub.co.in/shop/${candidateSlug}`;

    if (isApplyMode) {
      try {
        const storeDocRef = doc(db, 'stores', store.id);
        await updateDoc(storeDocRef, {
          slug: candidateSlug,
          storeUrl: storeUrl,
          updatedAt: new Date(),
        });
        updatedCount++;
        console.log(`✅ [${updatedCount}/${storesToMigrate.length}] Migrated: "${store.storeName}" (${store.id}) -> ${candidateSlug}`);
      } catch (err) {
        errorCount++;
        console.error(`❌ Error migrating store "${store.storeName}" (${store.id}):`, err.message);
      }
    } else {
      updatedCount++;
      console.log(`[DRY-RUN] Will migrate: "${store.storeName}" (${store.id}) -> ${candidateSlug} (${storeUrl})`);
    }
  }

  // Step 3: Backfill storeUrl for stores that had slug but missing storeUrl
  for (const store of storesMissingStoreUrlOnly) {
    const storeUrl = `https://dealzhub.co.in/shop/${store.slug}`;
    if (isApplyMode) {
      try {
        const storeDocRef = doc(db, 'stores', store.id);
        await updateDoc(storeDocRef, {
          storeUrl: storeUrl,
          updatedAt: new Date(),
        });
        console.log(`✅ Fixed missing storeUrl: "${store.storeName}" (${store.id}) -> ${storeUrl}`);
      } catch (err) {
        console.error(`❌ Error updating storeUrl for "${store.storeName}":`, err.message);
      }
    } else {
      console.log(`[DRY-RUN] Will backfill storeUrl: "${store.storeName}" (${store.id}) -> ${storeUrl}`);
    }
  }

  console.log('\n===========================================================');
  console.log(`🎉 Migration Summary:`);
  console.log(`   - Total Stores Requiring New Slugs: ${storesToMigrate.length}`);
  console.log(`   - Successfully Processed:           ${updatedCount}`);
  console.log(`   - Errors:                           ${errorCount}`);
  console.log(`   - Status:                           ${isApplyMode ? 'COMMITTED TO FIRESTORE' : 'PREVIEW COMPLETE'}`);
  console.log('===========================================================');
}

runMigration()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration crashed:', err.message || err);
    process.exit(1);
  });
