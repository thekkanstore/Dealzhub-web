import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getFirebaseConfig } from './load-env.mjs';

async function checkStores() {
  console.log('🔍 Auditing Firestore store slugs and URLs...');
  const firebaseConfig = getFirebaseConfig();
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const snapshot = await getDocs(collection(db, 'stores'));

  let total = 0;
  let withSlug = 0;
  let withoutSlug = 0;
  let withStoreUrl = 0;
  let withoutStoreUrl = 0;
  const slugsSet = new Set();
  const duplicates = [];

  snapshot.forEach(doc => {
    total++;
    const data = doc.data();
    if (data.slug) {
      withSlug++;
      const lower = data.slug.toLowerCase().trim();
      if (slugsSet.has(lower)) {
        duplicates.push({ id: doc.id, name: data.storeName, slug: lower });
      }
      slugsSet.add(lower);
    } else {
      withoutSlug++;
    }

    if (data.storeUrl) {
      withStoreUrl++;
    } else {
      withoutStoreUrl++;
    }
  });

  console.log('===========================================================');
  console.log('📊 Firestore Store Slugs Audit:');
  console.log(`   TOTAL STORES:        ${total}`);
  console.log(`   WITH SLUG:           ${withSlug}`);
  console.log(`   WITHOUT SLUG:        ${withoutSlug}`);
  console.log(`   WITH STORE URL:      ${withStoreUrl}`);
  console.log(`   WITHOUT STORE URL:   ${withoutStoreUrl}`);
  console.log(`   UNIQUE SLUGS:        ${slugsSet.size}`);
  if (duplicates.length > 0) {
    console.warn(`   ⚠️ DUPLICATE SLUGS DETECTED:`, duplicates);
  } else {
    console.log(`   ✅ NO DUPLICATE SLUGS DETECTED.`);
  }
  console.log('===========================================================');
}

checkStores()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Audit failed:', err.message || err);
    process.exit(1);
  });
