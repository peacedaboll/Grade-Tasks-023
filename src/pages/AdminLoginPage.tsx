import { useState } from 'react';
import type { FormEvent } from 'react';
import { loginAsAdmin, useAuthRole } from '../services/auth';
import { navigate } from '../utils/router';

export function AdminLoginPage() {
  const role = useAuthRole();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!login.trim()) {
      setError('Введите логин');
      return;
    }
    if (!password) {
      setError('Введите пароль');
      return;
    }
    setBusy(true);
    const result = loginAsAdmin(login.trim(), password);
    setBusy(false);
    if (result.ok) {
      navigate('/admin');
    } else {
      setError(result.error);
    }
  };

  if (role === 'admin' && error === null) {
    return (
      <div className="page-content narrow">
        <section className="auth-card">
          <h1>Вы уже вошли как администратор</h1>
          <button type="button" className="btn btn-primary btn-block" onClick={() => navigate('/admin')}>
            Открыть админ-панель
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="page-content narrow">
      <section className="auth-card">
        <div className="auth-icon">🔐</div>
        <h1>Вход администратора</h1>
        <p className="muted">Доступ только для преподавателя.</p>
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Логин</span>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Логин"
              autoFocus
              autoComplete="username"
            />
          </label>
          <label className="field">
            <span className="field-label">Пароль</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              autoComplete="current-password"
            />
          </label>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Вход…' : 'Войти'}
          </button>
        </form>
      </section>
    </div>
  );
}