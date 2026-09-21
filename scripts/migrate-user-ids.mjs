/**
 * DealzHub User ID Standardization & Migration Tool
 *
 * Scans Firestore 'stores' and 'users' collections to identify records with
 * divergent user IDs (e.g., numeric Google Provider IDs or raw emails stored as userId)
 * and normalizes them to canonical Firebase Auth UIDs.
 *
 * Usage:
 *   node scripts/migrate-user-ids.mjs            # Dry-run mode (read-only audit, default)
 *   node scripts/migrate-user-ids.mjs --apply    # Executes updates in Firestore
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  limit,
} from 'firebase/firestore';

import { getFirebaseConfig, loadEnv } from './load-env.mjs';

const isApplyMode = process.argv.includes('--apply');

function isNumericGoogleId(id) {
  return typeof id === 'string' && /^\d{15,}$/.test(id.trim());
}

async function runMigration() {
  console.log('===========================================================');
  console.log('🚀 DealzHub User ID Migration & Standardization');
  console.log(`Mode: ${isApplyMode ? '⚠️  APPLY (Writes will be committed)' : '🔍 DRY-RUN (Read-only inspection)'}`);
  console.log('===========================================================\n');

  loadEnv();
  const firebaseConfig = getFirebaseConfig();
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log('📦 Step 1: Auditing users collection...');
  const usersSnapshot = await getDocs(collection(db, 'users'));
  console.log(`   Found ${usersSnapshot.size} total user documents.\n`);

  const emailToCanonicalUid = new Map();
  const providerIdToCanonicalUid = new Map();

  usersSnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const docId = docSnap.id;
    const email = data.email?.trim()?.toLowerCase();

    if (!isNumericGoogleId(docId)) {
      if (email) emailToCanonicalUid.set(email, docId);
    } else {
      if (email && emailToCanonicalUid.has(email)) {
        providerIdToCanonicalUid.set(docId, emailToCanonicalUid.get(email));
      }
    }
  });

  console.log('🏪 Step 2: Auditing stores collection for legacy userIds...');
  const storesSnapshot = await getDocs(collection(db, 'stores'));
  console.log(`   Found ${storesSnapshot.size} total store documents.\n`);

  let storesWithNumericIds = 0;
  let storesResolvable = 0;
  let storesUpdated = 0;

  for (const storeDoc of storesSnapshot.docs) {
    const store = storeDoc.data();
    const currentUserId = store.userId?.trim();
    const storeEmail = store.email?.trim()?.toLowerCase();

    if (currentUserId && isNumericGoogleId(currentUserId)) {
      storesWithNumericIds++;
      let canonicalUid = providerIdToCanonicalUid.get(currentUserId);

      if (!canonicalUid && storeEmail) {
        canonicalUid = emailToCanonicalUid.get(storeEmail);
      }

      if (canonicalUid) {
        storesResolvable++;
        console.log(`[RESOLVED] Store "${store.storeName}" (${storeDoc.id}):`);
        console.log(`  Current userId:   ${currentUserId} (Google Provider ID)`);
        console.log(`  Canonical userId: ${canonicalUid} (Firebase Auth UID)`);

        if (isApplyMode) {
          await updateDoc(doc(db, 'stores', storeDoc.id), {
            userId: canonicalUid,
            updatedAt: new Date(),
          });
          storesUpdated++;
          console.log('  Status: ✅ Updated successfully.\n');
        } else {
          console.log('  Status: 🔍 Dry-run: update skipped.\n');
        }
      } else {
        console.warn(`[UNRESOLVED] Store "${store.storeName}" (${storeDoc.id}):`);
        console.warn(`  Current userId: ${currentUserId} - no canonical UID match found.\n`);
      }
    }
  }

  console.log('===========================================================');
  console.log('📊 Migration Audit Summary:');
  console.log(`   Total stores scanned:       ${storesSnapshot.size}`);
  console.log(`   Stores with numeric IDs:    ${storesWithNumericIds}`);
  console.log(`   Stores resolvable to UIDs:  ${storesResolvable}`);
  if (isApplyMode) {
    console.log(`   Stores updated:             ${storesUpdated}`);
  }
  console.log('===========================================================\n');
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
