import { useEffect, useState } from "react";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:9000/api/v1";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

 
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberEmail");

    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // ===========================================
  // LOGIN API
  // ===========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // ===========================================
      // SAVE TOKEN AND USER
      // ===========================================

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }

      localStorage.setItem(
        "currentUser",
        JSON.stringify(data.user)
      );

      // ===========================================
      // REMEMBER EMAIL
      // ===========================================

      if (rememberMe) {
        localStorage.setItem("rememberEmail", email);
      } else {
        localStorage.removeItem("rememberEmail");
      }

      alert(data.message);

      // ===========================================
      // ROLE BASED REDIRECT
      // ===========================================

      
      switch (data?.user?.role) {

        case "SUPER_ADMIN":
          console.log("init");
          
          navigate("/super-admin/dashboard");
          break;

        case "ADMIN":
          navigate("/admin/dashboard");
          break;

        case "USER":
          navigate("/user/dashboard");
          break;

        default:
          console.log("init");

          localStorage.removeItem("accessToken");
          localStorage.removeItem("currentUser");

          throw new Error("Invalid user role");
      }
    } catch (err) {
      console.error("Login error:", err);

      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Background decorative circles */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

        {/* Login Card */}
        <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center">
            <div className="absolute inset-0 bg-black/10" />

            <div className="relative">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-4 shadow-lg">
                <MdAdminPanelSettings className="text-5xl text-white" />
              </div>

              <h1 className="text-3xl font-bold text-white">
                Billing Software
              </h1>

              <p className="text-blue-100 mt-2">
                Sign in to your account
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-8">
            {/* Welcome Heading */}
            <div className="text-center mb-7">
              <h2 className="text-2xl font-bold text-gray-800">
                Welcome Back
              </h2>

              <p className="text-gray-500 mt-1 text-sm">
                Login to continue to your dashboard
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                <span className="text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="mb-5">
                <label
                  htmlFor="email"
                  className="block text-gray-700 text-sm font-semibold mb-2"
                >
                  Email Address
                </label>

                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </span>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl outline-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-gray-700 text-sm font-semibold mb-2"
                >
                  Password
                </label>

                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </span>

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl outline-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((previousValue) => !previousValue)
                    }
                    disabled={loading}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-500 transition disabled:cursor-not-allowed"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-xl" />
                    ) : (
                      <FaEye className="text-xl" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember and Forgot Password */}
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(e.target.checked)
                    }
                    disabled={loading}
                    className="w-4 h-4 accent-blue-600 border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed"
                  />

                  <span className="ml-2 text-sm text-gray-600">
                    Remember me
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-semibold"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />

                    Logging In...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/70 text-xs mt-4">
          ©️ {new Date().getFullYear()} Billing Software. All
          rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;