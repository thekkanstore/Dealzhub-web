import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Header from '../home/Header';
import { useAppContext } from '../../context/AppContext';
import LoginModal from '../common/LoginModal';
import useDebounce from '../../hooks/useDebounce';
import Footer from '../common/Footer';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const appContext = useAppContext();
  const { 
    favorites, 
    cart, 
    logout, 
    loginModalOpen, 
    setLoginModalOpen,
    onLoginModalContinue,
    setOnLoginModalContinue,
    searchQuery,
    setSearchQuery,
  } = appContext;

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    // Only navigate if the user has typed something and is not on the home page trying to clear search
    if (debouncedSearchQuery.trim() !== '') {
      // Use replace to avoid polluting browser history while typing
      navigate(`/search?q=${debouncedSearchQuery}`, { replace: location.pathname === '/search' });
    }
    // If the search query is cleared, and we are on the search page, navigate back home
    else if (debouncedSearchQuery.trim() === '' && location.pathname === '/search') {
      navigate('/home');
    }
  }, [debouncedSearchQuery, navigate, location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          navigateTo={navigate}
          favoritesCount={favorites ? favorites.length : 0}
          cartCount={cart ? cart.length : 0}
          logout={logout}
        />
        <LoginModal 
          isOpen={loginModalOpen} 
          onClose={() => {
            setLoginModalOpen(false);
            setOnLoginModalContinue(null);
          }} 
          onContinue={onLoginModalContinue}
        />
        <Outlet context={appContext} />
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;
