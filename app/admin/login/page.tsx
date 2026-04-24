'use client';

import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/admin';
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: String(form.get('username') || ''),
        password: String(form.get('password') || ''),
      }),
    });
    const data = await response.json();

    setLoading(false);

    if (!response.ok || !data.ok) {
      setError(data.error || 'Could not log in.');
      return;
    }

    router.push(next.startsWith('/admin') ? next : '/admin');
    router.refresh();
  }

  return (
    <section className="adminLoginPage">
      <form className="adminLoginCard" onSubmit={onSubmit}>
        <span className="adminKicker">Private Access</span>
        <h1>Admin Login</h1>
        <p>
          Sign in to manage products, orders, sales, discounts, and site copy.
        </p>

        {error ? <div className="adminAlert">{error}</div> : null}

        <label>
          Username
          <input
            className="adminInput"
            name="username"
            autoComplete="username"
            required
          />
        </label>
        <label>
          Password
          <input
            className="adminInput"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>

        <button
          className="btn btn--primary btn--block"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </section>
  );
}
