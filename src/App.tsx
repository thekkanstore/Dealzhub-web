import React, { lazy, Suspense } from 'react';
import './App.css';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import MainLayout from './components/layouts/MainLayout';
import LoadingSpinner from './components/common/LoadingSpinner';
import RouteErrorBoundary from './components/common/RouteErrorBoundary';

// Lazy-loaded pages for lightning-fast initial load times
const LoginPage = lazy(() => import('./screens/Login/LoginPage'));
const PersonalDetailsPage = lazy(() => import('./screens/Onboard/PersonalDetailsPage'));
const EditProfilePage = lazy(() => import('./screens/Onboard/EditProfilePage'));
const ChooseUserType = lazy(() => import('./screens/Onboard/ChooseUserType'));
const VendorFormPage = lazy(() => import('./screens/Vendor/VendorDetailsPage'));
const Home = lazy(() => import('./screens/Home/Home'));
const HomePage = lazy(() => import('./screens/Home/HomePage'));
const ProductPage = lazy(() => import('./screens/Home/ProductPage'));
const CartPage = lazy(() => import('./screens/Home/CartPage'));
const FavoritesPage = lazy(() => import('./screens/Home/FavoritesPage'));
const StorePage = lazy(() => import('./screens/Store/StorePage'));
const StoreRedirectPage = lazy(() => import('./screens/Store/StoreRedirectPage'));
const EditStorePage = lazy(() => import('./screens/Store/EditStorePage'));
const AddProductPage = lazy(() => import('./screens/Store/AddProductPage'));
const BulkAddProductPage = lazy(() => import('./screens/Store/BulkAddProductPage'));
const EditProductPage = lazy(() => import('./screens/Store/EditProductPage'));
const SearchResultsPage = lazy(() => import('./screens/Search/SearchResultsPage'));
const AboutUsPage = lazy(() => import('./screens/Info/AboutUsPage'));
const PrivacyPolicyPage = lazy(() => import('./screens/Info/PrivacyPolicyPage'));
const RefundPolicyPage = lazy(() => import('./screens/Info/RefundPolicyPage'));
const TermsAndConditionsPage = lazy(() => import('./screens/Info/TermsAndConditionsPage'));
const PaymentStatusPage = lazy(() => import('./screens/Store/PaymentStatusPage'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50/60">
    <LoadingSpinner />
  </div>
);

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/home" replace />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/store-redirect',
    element: withSuspense(StoreRedirectPage),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/payment-status',
    element: withSuspense(PaymentStatusPage),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/login',
    element: withSuspense(LoginPage),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/personaldetails',
    element: withSuspense(PersonalDetailsPage),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/chooseusertype',
    element: withSuspense(ChooseUserType),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/vendordetails',
    element: withSuspense(VendorFormPage),
    errorElement: <RouteErrorBoundary />,
  },
  {
    element: <MainLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: '/home',
        element: withSuspense(Home),
        children: [
          {
            index: true,
            element: withSuspense(HomePage),
          },
        ],
      },
      {
        path: '/product/:productId',
        element: withSuspense(ProductPage),
      },
      {
        path: '/vendor/:id',
        element: withSuspense(StorePage),
      },
      {
        path: '/shop/:slug',
        element: withSuspense(StorePage),
      },
      {
        path: '/favorites',
        element: withSuspense(FavoritesPage),
      },
      {
        path: '/search',
        element: withSuspense(SearchResultsPage),
      },
      {
        path: '/cart',
        element: withSuspense(CartPage),
      },
      {
        path: '/editprofile',
        element: withSuspense(EditProfilePage),
      },
      {
        path: '/editstore',
        element: withSuspense(EditStorePage),
      },
      {
        path: '/add-product',
        element: withSuspense(AddProductPage),
      },
      {
        path: '/bulk-add-product',
        element: withSuspense(BulkAddProductPage),
      },
      {
        path: '/edit-product/:productId',
        element: withSuspense(EditProductPage),
      },
      {
        path: '/about',
        element: withSuspense(AboutUsPage),
      },
      {
        path: '/privacy',
        element: withSuspense(PrivacyPolicyPage),
      },
      {
        path: '/cancellation-refund',
        element: withSuspense(RefundPolicyPage),
      },
      {
        path: '/terms',
        element: withSuspense(TermsAndConditionsPage),
      },
      {
        path: '*',
        element: <RouteErrorBoundary />,
      },
    ],
  },
  {
    path: '*',
    element: <RouteErrorBoundary />,
  },
]);

function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}

export default App;

