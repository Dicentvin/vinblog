import { useState, type FormEvent } from 'react';
import { useNav } from '../../hooks';
import { useAdminLoginMutation } from '../../store/apiSlice';

interface Props {
  onSuccess: () => void;
}

export default function AdminLogin({ onSuccess }: Props): JSX.Element {
  const { navigate }   = useNav();
  const [adminLogin]   = useAdminLoginMutation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await adminLogin({ username, password }).unwrap();
      // Store auth in sessionStorage
      sessionStorage.setItem('bytescribe_admin', 'true');
      sessionStorage.setItem('bytescribe_admin_user', username);
      onSuccess();
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'data' in err
        ? (err as { data?: { error?: string } }).data?.error ?? 'Login failed'
        : 'Login failed';
      setError(msg);
      setPassword('');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/20">
            <span className="font-display font-bold text-ink text-2xl">S</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-white tracking-tight mb-1">
            skyLimit Admin
          </h1>
          <p className="text-muted text-sm">Sign in to manage your blog</p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/40">
          <form onSubmit={e => void handleSubmit(e)} className="space-y-4">

            {/* Username */}
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-muted mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm pointer-events-none">
                  👤
                </span>
                <input
                  type="text"
                  className="input-field pl-9 text-sm"
                  placeholder="Enter username…"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoFocus
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold tracking-widets uppercase text-muted mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm pointer-events-none">
                  🔒
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field pl-9 pr-10 text-sm"
                  placeholder="Enter password…"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors bg-transparent border-0 cursor-pointer text-sm font-body"
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2.5">
                <span className="text-red-400 flex-shrink-0">⚠</span>
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !username.trim() || !password.trim()}
              className="btn-primary w-full py-3 text-sm disabled:opacity-60 mt-2"
            >
              {loading ? '⏳ Signing in…' : 'Sign In →'}
            </button>
          </form>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('home')}
            className="text-muted text-sm hover:text-accent transition-colors bg-transparent border-0 cursor-pointer font-body"
          >
            ← Back to Blog
          </button>
        </div>

      </div>
    </div>
  );
}