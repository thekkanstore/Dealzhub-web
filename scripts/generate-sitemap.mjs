import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase config
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyDKa7RU7vue1gMvp6zNeNhzSh_e8CR4i28",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "thekkan-app.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "thekkan-app",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "thekkan-app.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "298300377700",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:298300377700:android:d6a2e60667b1d6db3b2d71",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-PC24YJYQBC"
};

const BASE_URL = 'https://dealzhub.co.in';

async function generateSitemap() {
  console.log('🚀 Starting dynamic sitemap generation for DealzHub...');
  
  const staticPages = [
    { loc: `${BASE_URL}/home`, priority: '1.0', changefreq: 'daily' },
    { loc: `${BASE_URL}/about`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${BASE_URL}/privacy`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${BASE_URL}/cancellation-refund`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${BASE_URL}/terms`, priority: '0.7', changefreq: 'monthly' },
  ];

  const dynamicUrls = [];
  const today = new Date().toISOString().split('T')[0];

  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // 1. Fetch Approved Stores
    console.log('📦 Fetching active stores from Firestore...');
    try {
      const storesSnapshot = await getDocs(collection(db, 'stores'));
      storesSnapshot.forEach((docSnap) => {
        const store = docSnap.data();
        const status = (store.vendorStatus || '').toLowerCase();
        if (status !== 'inactive' && status !== 'rejected') {
          const updatedAt = store.updatedAt?.toDate?.() ? store.updatedAt.toDate().toISOString().split('T')[0] : today;
          dynamicUrls.push({
            loc: `${BASE_URL}/vendor/${docSnap.id}`,
            lastmod: updatedAt,
            priority: '0.85',
            changefreq: 'weekly',
          });
        }
      });
      console.log(`✅ Found ${storesSnapshot.size} stores for sitemap.`);
    } catch (storeErr) {
      console.warn('⚠️ Could not fetch stores for sitemap:', storeErr.message);
    }

    // 2. Fetch Active Products
    console.log('🛍️ Fetching active products from Firestore...');
    try {
      const productsSnapshot = await getDocs(collection(db, 'products'));
      productsSnapshot.forEach((docSnap) => {
        const product = docSnap.data();
        if (product.isActive !== false) {
          const updatedAt = product.updatedAt?.toDate?.() ? product.updatedAt.toDate().toISOString().split('T')[0] : today;
          dynamicUrls.push({
            loc: `${BASE_URL}/product/${docSnap.id}`,
            lastmod: updatedAt,
            priority: '0.9',
            changefreq: 'daily',
          });
        }
      });
      console.log(`✅ Found ${productsSnapshot.size} products for sitemap.`);
    } catch (prodErr) {
      console.warn('⚠️ Could not fetch products for sitemap:', prodErr.message);
    }

  } catch (err) {
    console.error('❌ Firebase connection error while generating sitemap:', err);
  }

  // Combine static and dynamic URLs
  const allUrls = [
    ...staticPages.map(p => ({ ...p, lastmod: today })),
    ...dynamicUrls,
  ];

  // Construct XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

  const outputPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, xml.trim(), 'utf-8');
  console.log(`🎉 Sitemap successfully generated with ${allUrls.length} URLs at ${outputPath}`);
}

generateSitemap().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error('Error generating sitemap:', err);
  process.exit(1);
});
