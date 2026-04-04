import { useState, type FormEvent } from 'react';

interface Props { onSuccess: () => void; }

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'skylimits2025';

export default function AdminLogin({ onSuccess }: Props): JSX.Element {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem('skylimits_admin', 'true');
      onSuccess();
    } else {
      setError('Invalid username or password.');
      setPassword('');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(212,175,55,0.3)]">
            <span className="font-display font-bold text-ink text-2xl">S</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-white tracking-tight mb-1">SkyLimits Admin</h1>
          <p className="text-muted text-sm">Sign in to access the dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-2xl p-7 shadow-[0_24px_64px_rgba(0,0,0,0.4)]">
          <form onSubmit={e => void handleSubmit(e)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-widest mb-2">Username</label>
              <input type="text" className="input-field text-sm" placeholder="Enter username"
                value={username} onChange={e => setUsername(e.target.value)}
                autoComplete="username" autoFocus required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="input-field text-sm pr-10"
                  placeholder="Enter password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors bg-transparent border-0 cursor-pointer text-sm font-body">
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2.5">
                <span className="text-red-400 text-sm">⚠</span>
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading || !username || !password}
              className="btn-primary w-full py-3 text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin inline-block" />
                  Signing in…
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          {/* Dev hint */}
          <div className="mt-5 pt-5 border-t border-border">
            <p className="text-center text-[0.65rem] text-muted mb-2">Default credentials:</p>
            <div className="bg-surface2 rounded-lg px-3 py-2 text-center">
              <p className="text-[0.68rem] text-[#e8e6f0]">
                Username: <span className="text-accent font-mono">admin</span>
                &nbsp;|&nbsp;
                Password: <span className="text-accent font-mono">skylimits2025</span>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center mt-6 text-sm text-muted">
          Not an admin?{' '}
          <button onClick={() => window.history.back()}
            className="text-accent hover:underline bg-transparent border-0 cursor-pointer font-body text-sm">
            Go back to blog
          </button>
        </p>
      </div>
    </div>
  );
}
