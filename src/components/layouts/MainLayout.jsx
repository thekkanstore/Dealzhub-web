import { useEffect, useRef } from 'react';
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
  const prevQueryRef = useRef(debouncedSearchQuery);

  useEffect(() => {
    // Only trigger search navigation if the query text itself was actively modified by the user
    if (prevQueryRef.current !== debouncedSearchQuery) {
      prevQueryRef.current = debouncedSearchQuery;

      if (debouncedSearchQuery.trim() !== '') {
        // Use replace when already on /search to avoid polluting browser history while typing
        navigate(`/search?q=${encodeURIComponent(debouncedSearchQuery.trim())}`, { 
          replace: location.pathname === '/search' 
        });
      } else if (location.pathname === '/search') {
        navigate('/home');
      }
    }
  }, [debouncedSearchQuery, navigate, location.pathname]);

  const isHomePage = location.pathname === '/home' || location.pathname === '/';
  const showHeader = isHomePage || location.pathname.startsWith('/search');

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        {showHeader && (
          <Header
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            navigateTo={navigate}
            favoritesCount={favorites ? favorites.length : 0}
            cartCount={cart ? cart.length : 0}
            logout={logout}
          />
        )}
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
      {isHomePage && <Footer />}
    </div>
  );
};

export default MainLayout;
