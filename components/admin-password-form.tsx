'use client';

import { FormEvent, useState } from 'react';

type PasswordResponse = {
  error?: string;
  ok?: boolean;
};

export function AdminPasswordForm() {
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus('');

    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/admin/account/password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        confirmPassword: String(form.get('confirmPassword') || ''),
        currentPassword: String(form.get('currentPassword') || ''),
        newPassword: String(form.get('newPassword') || ''),
        username: String(form.get('username') || ''),
      }),
    });
    const data = (await response.json()) as PasswordResponse;

    setSaving(false);

    if (!response.ok || !data.ok) {
      setStatus(data.error || 'Password update failed.');
      return;
    }

    event.currentTarget.reset();
    setStatus(
      'Admin password updated. Use the new password next time you log in.',
    );
  }

  return (
    <section className="adminSecurityCard adminSpan2">
      <div>
        <span className="adminKicker">Security</span>
        <h2>Admin Password</h2>
        <p>
          Change the password used to log in to this admin panel. Choose at
          least 8 characters.
        </p>
      </div>

      {status ? <div className="adminAlert">{status}</div> : null}

      <form className="adminForm" onSubmit={save}>
        <div className="adminFormGrid">
          <label>
            Admin Username
            <input
              className="adminInput"
              name="username"
              autoComplete="username"
              defaultValue="admin"
              required
            />
          </label>
          <label>
            Current Password
            <input
              className="adminInput"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <label>
            New Password
            <input
              className="adminInput"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
          <label>
            Confirm New Password
            <input
              className="adminInput"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
        </div>
        <div className="adminFormActions">
          <button className="btn btn--primary" type="submit" disabled={saving}>
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </section>
  );
}
