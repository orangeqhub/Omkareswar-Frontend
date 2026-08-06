import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import ToastContainer from './components/common/ToastContainer';
import CompareBar from './components/properties/CompareBar';
import LocationPermissionPopup from './components/common/LocationPermissionPopup';
import { useAuthStore } from './store/authStore';
import { useFavouritesStore } from './store/favouritesStore';

function App() {
  const init = useAuthStore((state) => state.init);
  const user = useAuthStore((state) => state.user);

  const clearSession = useAuthStore(
    (state) => state.clearSession
  );

  const refreshFavourites = useFavouritesStore(
    (state) => state.refresh
  );

  /*
   * App open ayinappudu saved JWT token tho
   * current session restore chestundi.
   */
  useEffect(() => {
    init();
  }, [init]);

  /*
   * Access token and refresh token expire ayithe
   * apiClient ee event dispatch chestundi.
   *
   * App event ni receive chesi frontend auth state
   * clear chestundi.
   */
  useEffect(() => {
    function handleAuthenticationExpired() {
      clearSession();
    }

    window.addEventListener(
      'omkar:authentication-expired',
      handleAuthenticationExpired
    );

    return () => {
      window.removeEventListener(
        'omkar:authentication-expired',
        handleAuthenticationExpired
      );
    };
  }, [clearSession]);

  /*
   * Login user change ayinappudu favourites refresh chestundi.
   */
  useEffect(() => {
    refreshFavourites(user?.id);
  }, [user?.id, refreshFavourites]);

  return (
    <BrowserRouter>
      <AppRoutes />
      <CompareBar />
      <ToastContainer />
      <LocationPermissionPopup />
    </BrowserRouter>
  );
}

export default App;