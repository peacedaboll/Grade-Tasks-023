import { Link, useRoute } from '../utils/router';
import { logout, useAuthRole } from '../services/auth';
import { ThemeToggle } from './ThemeToggle';

export function AppHeader() {
  const route = useRoute();
  const role = useAuthRole();
  const admin = role === 'admin';

  return (
    <header className="app-header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">Ж</span>
          <span className="brand-text">
            <span className="brand-title">Электронный журнал</span>
            <span className="brand-sub">группа 023 ИСП</span>
          </span>
        </Link>
        <nav className="header-actions">
          <ThemeToggle />
          {admin ? (
            <>
              {route.name !== 'admin-dashboard' && (
                <Link to="/admin" className="btn btn-ghost">
                  Админ-панель
                </Link>
              )}
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => logout()}
              >
                Выйти
              </button>
            </>
          ) : (
            <Link to="/admin/login" className="btn btn-ghost">
              Администратор
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}