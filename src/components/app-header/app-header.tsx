import { FC, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useSelector } from '../../services/store';
import {
  BurgerIcon,
  ListIcon,
  Logo,
  ProfileIcon,
  MenuIcon,
  CloseIcon
} from '@zlden/react-developer-burger-ui-components';
import styles from '../ui/app-header/app-header.module.css';

export const AppHeader: FC = () => {
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileSubmenuOpen, setIsProfileSubmenuOpen] = useState(false);

  const handleLogoClick = () => {
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleConstructorClick = () => {
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleFeedClick = () => {
    navigate('/feed');
    setIsMobileMenuOpen(false);
  };

  const handleProfileClick = () => {
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileSubmenu = () => {
    setIsProfileSubmenuOpen(!isProfileSubmenuOpen);
  };

  const isConstructorActive =
    location.pathname === '/' || location.pathname.startsWith('/ingredients');
  const isFeedActive = location.pathname.startsWith('/feed');
  const isProfileActive = location.pathname.startsWith('/profile');

  return (
    <>
      <header className={styles.header}>
        <nav className={`${styles.menu} p-4`}>
          {}
          <button
            className={styles.mobileMenuButton}
            onClick={toggleMobileMenu}
            aria-label='Открыть меню'
          >
            <MenuIcon type='primary' />
          </button>

          {}
          <div className={styles.menu_part_left}>
            <Link
              to='/'
              className={`${styles.link} ${isConstructorActive ? styles.link_active : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleConstructorClick();
              }}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <BurgerIcon type={isConstructorActive ? 'primary' : 'secondary'} />
              <p className='text text_type_main-default ml-2 mr-10'>Конструктор</p>
            </Link>
            <Link
              to='/feed'
              className={`${styles.link} ${isFeedActive ? styles.link_active : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleFeedClick();
              }}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <ListIcon type={isFeedActive ? 'primary' : 'secondary'} />
              <p className='text text_type_main-default ml-2'>Лента заказов</p>
            </Link>
          </div>
          <div
            className={styles.logo}
            onClick={handleLogoClick}
            style={{ cursor: 'pointer' }}
          >
            <Logo className='' />
          </div>
          <Link
            to={isAuthenticated ? '/profile' : '/login'}
            className={`${styles.link} ${styles.link_position_last} ${styles.desktopOnly} ${isProfileActive ? styles.link_active : ''}`}
            onClick={(e) => {
              e.preventDefault();
              handleProfileClick();
            }}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <ProfileIcon type={isProfileActive ? 'primary' : 'secondary'} />
            <p className='text text_type_main-default ml-2'>
              {user?.name || 'Личный кабинет'}
            </p>
          </Link>
        </nav>
      </header>

      {}
      {isMobileMenuOpen && (
        <div className={styles.mobileOverlay} onClick={toggleMobileMenu}>
          <div
            className={styles.mobileMenu}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.mobileMenuHeader}>
              <h2 className='text text_type_main-large'>Меню</h2>
              <button
                className={styles.closeButton}
                onClick={toggleMobileMenu}
                aria-label='Закрыть меню'
              >
                <CloseIcon type='primary' />
              </button>
            </div>

            <div className={styles.mobileMenuContent}>
              {}
              <div className={styles.profileSection}>
                <div
                  className={styles.mobileMenuItem}
                  onClick={toggleProfileSubmenu}
                >
                  <ProfileIcon type={isProfileActive ? 'primary' : 'secondary'} />
                  <span className='text text_type_main-default ml-2'>
                    Личный кабинет
                  </span>
                  <span className={styles.arrow}>
                    {isProfileSubmenuOpen ? '▲' : '▼'}
                  </span>
                </div>

                {}
                {isProfileSubmenuOpen && (
                  <div className={styles.submenu}>
                    {isAuthenticated ? (
                      <>
                        <div
                          className={styles.submenuItem}
                          onClick={() => {
                            navigate('/profile');
                            setIsMobileMenuOpen(false);
                            setIsProfileSubmenuOpen(false);
                          }}
                        >
                          Профиль
                        </div>
                        <div
                          className={styles.submenuItem}
                          onClick={() => {
                            navigate('/profile/orders');
                            setIsMobileMenuOpen(false);
                            setIsProfileSubmenuOpen(false);
                          }}
                        >
                          История заказов
                        </div>
                        <div
                          className={styles.submenuItem}
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setIsProfileSubmenuOpen(false);
                          }}
                        >
                          Выход
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className={styles.submenuItem}
                          onClick={() => {
                            navigate('/login');
                            setIsMobileMenuOpen(false);
                            setIsProfileSubmenuOpen(false);
                          }}
                        >
                          Войти
                        </div>
                        <div
                          className={styles.submenuItem}
                          onClick={() => {
                            navigate('/register');
                            setIsMobileMenuOpen(false);
                            setIsProfileSubmenuOpen(false);
                          }}
                        >
                          Регистрация
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {}
              <Link to='/' className={styles.mobileMenuItem} onClick={(e) => { e.preventDefault(); handleConstructorClick(); }}>
                <BurgerIcon type={location.pathname === '/' ? 'primary' : 'secondary'} />
                <span className='text text_type_main-default ml-2'>Конструктор бургеров</span>
              </Link>

              <Link to='/feed' className={styles.mobileMenuItem} onClick={(e) => { e.preventDefault(); handleFeedClick(); }}>
                <ListIcon type={isFeedActive ? 'primary' : 'secondary'} />
                <span className='text text_type_main-default ml-2'>Лента заказов</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
