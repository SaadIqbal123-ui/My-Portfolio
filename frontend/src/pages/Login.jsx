import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      // Store token for authenticated API calls
      localStorage.setItem('adminToken', idToken);
      localStorage.setItem('adminEmail', userCredential.user.email);

      navigate('/admin/dashboard');
    } catch (err) {
      // Map Firebase error codes to friendly messages
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Invalid email or password.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Try again later.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        default:
          setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background font-body selection:bg-primary/30 min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center px-6 py-20 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[100px]"></div>

        <div className="w-full max-w-md z-10">
          <div className="mb-12 text-center md:text-left md:pl-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group mb-8"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span className="font-label text-xs uppercase tracking-[0.2em]">Return to Portfolio</span>
            </Link>
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter text-on-surface mb-2">
              Admin Access
            </h1>
            <p className="font-body text-on-surface-variant/80 text-lg">
              Enter your credentials to manage the editorial archives.
            </p>
          </div>

          <div className="glass-panel p-8 md:p-10 rounded-xl shadow-[0_40px_40px_-15px_rgba(73,75,214,0.06)] border border-outline-variant/15">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-error-container/20 text-error p-4 rounded-md text-sm border border-error/20 flex items-center gap-3">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="email">
                  Email
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
                    mail
                  </span>
                  <input
                    className="w-full bg-surface-container-high border-none rounded-md py-4 pl-12 pr-4 text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary transition-all outline-none"
                    id="email"
                    name="email"
                    placeholder="admin@example.com"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="password">
                    Password
                  </label>
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
                    lock
                  </span>
                  <input
                    className="w-full bg-surface-container-high border-none rounded-md py-4 pl-12 pr-4 text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary transition-all outline-none"
                    id="password"
                    name="password"
                    placeholder="••••••••••••"
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  className="signature-gradient w-full py-4 rounded-full text-on-primary font-bold tracking-tight text-sm shadow-lg shadow-primary/20 active:scale-[0.98] transition-all hover:brightness-110 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : 'Authenticate'}
                  <span className="material-symbols-outlined text-sm">login</span>
                </button>
              </div>
            </form>

            <div className="mt-8 pt-8 border-t border-outline-variant/10 text-center">
              <p className="text-xs font-label text-on-surface-variant/60 uppercase tracking-widest flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">security</span>
                Secured by Firebase Auth
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Standalone Footer */}
      <footer className="w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-8 bg-[#1c1b1b]">
        <div className="text-lg font-bold text-[#e5e2e1] font-headline tracking-tighter">
          M Saad Iqbal
        </div>
        <div className="flex gap-8">
          <a className="font-['Manrope'] text-sm tracking-widest uppercase text-[#e5e2e1]/60 hover:text-[#c0c1ff] transition-colors" href="#">LinkedIn</a>
          <a className="font-['Manrope'] text-sm tracking-widest uppercase text-[#e5e2e1]/60 hover:text-[#c0c1ff] transition-colors" href="#">GitHub</a>
          <a className="font-['Manrope'] text-sm tracking-widest uppercase text-[#e5e2e1]/60 hover:text-[#c0c1ff] transition-colors" href="#">Discord</a>
          <a className="font-['Manrope'] text-sm tracking-widest uppercase text-[#e5e2e1]/60 hover:text-[#c0c1ff] transition-colors" href="#">Instagram</a>
        </div>
        <div className="font-['Manrope'] text-sm tracking-widest uppercase text-[#e5e2e1]/60">
          All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Login;
