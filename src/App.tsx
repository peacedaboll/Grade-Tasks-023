import { useDbReady } from './hooks/useDb';
import { useRoute } from './utils/router';
import { useAuthRole } from './services/auth';
import { AppHeader } from './components/AppHeader';
import { HomePage } from './pages/HomePage';
import { SubjectPage } from './pages/SubjectPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export default function App() {
  const route = useRoute();
  const role = useAuthRole();
  const { ready, error } = useDbReady();

  if (error) {
    return (
      <div className="app-shell">
        <main className="page">
          <div className="page-content narrow">
            <div className="auth-card">
              <div className="auth-icon">⚠️</div>
              <h1>Ошибка запуска</h1>
              <p className="muted">{error}. Убедитесь, что браузер поддерживает IndexedDB.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  let page: React.ReactNode;
  if (!ready) {
    page = (
      <div className="spinner-wrap">
        <div className="spinner" />
        <p className="muted">Загрузка журнала…</p>
      </div>
    );
  } else {
    switch (route.name) {
      case 'home':
        page = <HomePage />;
        break;
      case 'subject':
        page = <SubjectPage route={route} />;
        break;
      case 'admin-login':
        page = role === 'admin' ? <AdminDashboardPage /> : <AdminLoginPage />;
        break;
      case 'admin-dashboard':
        page = <AdminDashboardPage />;
        break;
      default:
        page = <HomePage />;
    }
  }

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="page">{page}</main>
      <footer className="app-footer">
        <div className="container">
          <span>Электронный журнал группы 023 ИСП</span>
          <span>Данные хранятся локально в браузере (IndexedDB)</span>
        </div>
      </footer>
    </div>
  );
}