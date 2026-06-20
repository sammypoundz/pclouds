import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiGithub, FiLogIn, FiLoader, FiMail } from 'react-icons/fi';
import { useAuth, useToast } from '../shared';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const { loginWithEmail, loginWithGitHub } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsEmailLoading(true);
    try {
      await loginWithEmail(email, password);
      addToast('success', 'Signed in successfully');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
      addToast('error', err.message || 'Login failed');
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleGitHub = async () => {
    setIsGitHubLoading(true);
    try {
      await loginWithGitHub();
      // Redirect happens, no further code
    } catch (err: any) {
      setError(err.message || 'GitHub login failed');
      addToast('error', 'GitHub login failed');
      setIsGitHubLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header – no logo, only heading */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Welcome back
          </h2>
          <p className="text-gray-400 mt-2 text-sm">
            Sign in to your PCLOUDs account
          </p>
        </div>

        {/* Card */}
        <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-2xl shadow-2xl p-8 transition-all hover:shadow-blue-500/5">
          {/* GitHub Button */}
          <button
            onClick={handleGitHub}
            disabled={isGitHubLoading || isEmailLoading}
            className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 font-medium flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGitHubLoading ? (
              <FiLoader className="w-5 h-5 animate-spin" />
            ) : (
              <FiGithub className="w-5 h-5" />
            )}
            {isGitHubLoading ? 'Signing in...' : 'Continue with GitHub'}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gray-900 px-3 text-xs text-gray-500">or</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 placeholder:text-gray-500"
                required
                disabled={isEmailLoading || isGitHubLoading}
              />
            </div>
            <div className="relative">
              <FiLogIn className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all duration-200 placeholder:text-gray-500"
                required
                disabled={isEmailLoading || isGitHubLoading}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 text-red-400 text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isEmailLoading || isGitHubLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 rounded-xl px-4 py-3 font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEmailLoading ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Sign up link */}
          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-400 hover:text-blue-300 hover:underline transition">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;