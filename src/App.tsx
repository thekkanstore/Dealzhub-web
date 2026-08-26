import './App.css'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import LoginPage from './screens/Login/LoginPage';
import PersonalDetailsPage from './screens/Onboard/PersonalDetailsPage';
import EditProfilePage from './screens/Onboard/EditProfilePage';
import ChooseUserType from './screens/Onboard/ChooseUserType';
import VendorFormPage from './screens/Vendor/VendorDetailsPage';
import Home from './screens/Home/Home';
import HomePage from './screens/Home/HomePage';
import ProductPage from './screens/Home/ProductPage';
import CartPage from './screens/Home/CartPage';
import FavoritesPage from './screens/Home/FavoritesPage';
import StorePage from './screens/Store/StorePage';
import StoreRedirectPage from './screens/Store/StoreRedirectPage'; // Import StoreRedirectPage
import EditStorePage from './screens/Store/EditStorePage'; // Import EditStorePage
import AddProductPage from './screens/Store/AddProductPage'; // Import AddProductPage
import BulkAddProductPage from './screens/Store/BulkAddProductPage'; // Import BulkAddProductPage
import EditProductPage from './screens/Store/EditProductPage';
import SearchResultsPage from './screens/Search/SearchResultsPage'; // Import search page
import { AppProvider } from './context/AppContext';
import MainLayout from './components/layouts/MainLayout';
import AboutUsPage from './screens/Info/AboutUsPage';
import PrivacyPolicyPage from './screens/Info/PrivacyPolicyPage';
import RefundPolicyPage from './screens/Info/RefundPolicyPage';
import TermsAndConditionsPage from './screens/Info/TermsAndConditionsPage';


const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/home" replace />,
  },
  {
    path: '/store-redirect',
    element: <StoreRedirectPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/personaldetails',
    element: <PersonalDetailsPage />,
  },
  {
    path: '/chooseusertype',
    element: <ChooseUserType />,
  },
  {
    path: '/vendordetails',
    element: <VendorFormPage />,
  },
  {
    element: <MainLayout />,
    children: [
      {
        path: '/home',
        element: <Home />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
        ],
      },
      {
        path: '/product/:productId',
        element: <ProductPage />,
      },
      {
        path: '/vendor/:id',
        element: <StorePage />,
      },
      {
        path: '/favorites',
        element: <FavoritesPage />,
      },
      {
        path: '/search',
        element: <SearchResultsPage />,
      },
      {
        path: '/cart',
        element: <CartPage />,
      },
      {
        path: '/editprofile',
        element: <EditProfilePage />,
      },
      {
        path: '/editstore',
        element: <EditStorePage />,
      },
      {
        path: '/add-product', // New route for AddProductPage
        element: <AddProductPage />,
      },
      {
        path: '/bulk-add-product', // New route for BulkAddProductPage
        element: <BulkAddProductPage />,
      },
      {
        path:'/edit-product/:productId',
        element: <EditProductPage />,
      },
      {
        path: '/about',
        element: <AboutUsPage />,
      },
      {
        path: '/privacy',
        element: <PrivacyPolicyPage />,
      },
      {
        path: '/cancellation-refund',
        element: <RefundPolicyPage />,
      },
      {
        path: '/terms',
        element: <TermsAndConditionsPage />,
      }
    ],
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
