import { FC, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
            <div
              className={`${styles.link} ${location.pathname === '/' ? styles.link_active : ''}`}
              onClick={handleConstructorClick}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <BurgerIcon
                type={location.pathname === '/' ? 'primary' : 'secondary'}
              />
              <p className='text text_type_main-default ml-2 mr-10'>
                Конструктор
              </p>
            </div>
            <div
              className={`${styles.link} ${location.pathname === '/feed' ? styles.link_active : ''}`}
              onClick={handleFeedClick}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <ListIcon
                type={location.pathname === '/feed' ? 'primary' : 'secondary'}
              />
              <p className='text text_type_main-default ml-2'>Лента заказов</p>
            </div>
          </div>
          <div
            className={styles.logo}
            onClick={handleLogoClick}
            style={{ cursor: 'pointer' }}
          >
            <Logo className='' />
          </div>
          <div
            className={`${styles.link_position_last} ${styles.desktopOnly} ${location.pathname.startsWith('/profile') ? styles.link_active : ''}`}
            onClick={handleProfileClick}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <ProfileIcon
              type={
                location.pathname.startsWith('/profile')
                  ? 'primary'
                  : 'secondary'
              }
            />
            <p className='text text_type_main-default ml-2'>
              {user?.name || 'Личный кабинет'}
            </p>
          </div>
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
                  <ProfileIcon
                    type={
                      location.pathname.startsWith('/profile')
                        ? 'primary'
                        : 'secondary'
                    }
                  />
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
              <div
                className={styles.mobileMenuItem}
                onClick={handleConstructorClick}
              >
                <BurgerIcon
                  type={location.pathname === '/' ? 'primary' : 'secondary'}
                />
                <span className='text text_type_main-default ml-2'>
                  Конструктор бургеров
                </span>
              </div>

              <div className={styles.mobileMenuItem} onClick={handleFeedClick}>
                <ListIcon
                  type={location.pathname === '/feed' ? 'primary' : 'secondary'}
                />
                <span className='text text_type_main-default ml-2'>
                  Лента заказов
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
