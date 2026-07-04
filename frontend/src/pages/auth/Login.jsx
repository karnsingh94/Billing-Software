import  { useState } from 'react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, } from 'react-icons/fa';
import { MdAdminPanelSettings } from 'react-icons/md';
import { allUsers } from "../../components/DymiData"
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simple validation
    const user = allUsers.find(
    (item) =>
      item.email === email &&
      item.password === password
  );

  if (!user) {
    alert("Invalid Credentials");
    return;
  }

  localStorage.setItem(
    "currentUser",
    JSON.stringify(user)
  );

    
    // Simulate API call
    setTimeout(() => {
      if (user.role === "super-admin") {
    navigate("/super-admin/dashboard");
  } else if (user.role === "admin") {
    navigate("/admin/dashboard");
  } else if (user.role === "user") {
    navigate("/user/dashboard");
  } else {
    navigate("");
  }
    }, 1500);
  };

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Decorative elements */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with icon */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center relative">
            <div className="absolute top-0 left-0 w-full h-full bg-black/10"></div>
            <div className="relative">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-4">
                <MdAdminPanelSettings className="text-5xl text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">Billing Software</h1>
              <p className="text-blue-100 mt-2">Sign in to your account</p>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2 animate-shake">
                <span className="text-lg">⚠️</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className="mb-5">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-gray-400 hover:text-blue-500 text-xl" />
                    ) : (
                      <FaEye className="text-gray-400 hover:text-blue-500 text-xl" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                  Forgot Password?
                </a>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Logging in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            {/* <div className="mt-6">
              <p className="text-center text-gray-500 text-sm mb-3">Demo Credentials</p>
              <button
                onClick={fillDemoCredentials}
                className="w-full text-left p-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-xl transition-all group"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-700">Demo Account</p>
                    <p className="text-xs text-gray-500">demo@billing.com / demo123</p>
                  </div>
                  <span className="text-blue-500 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </button>
            </div> */}

            {/* Divider */}
            {/* <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div> */}

            {/* Social Login Buttons */}
            {/* <div className="grid grid-cols-3 gap-3">
              <button className="flex items-center justify-center gap-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition group">
                <FaGoogle className="text-red-500 group-hover:scale-110 transition" />
                <span className="text-sm hidden sm:inline">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition group">
                <FaFacebook className="text-blue-600 group-hover:scale-110 transition" />
                <span className="text-sm hidden sm:inline">Facebook</span>
              </button>
              <button className="flex items-center justify-center gap-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition group">
                <FaGithub className="text-gray-800 group-hover:scale-110 transition" />
                <span className="text-sm hidden sm:inline">GitHub</span>
              </button>
            </div> */}

            {/* Sign Up Link */}
            <p className="text-center mt-6 text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">
                Sign up
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/70 text-xs mt-4">
          © 2024 Billing Software. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;