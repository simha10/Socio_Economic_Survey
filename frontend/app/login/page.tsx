"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import apiService from "@/services/api";
// Ensure you have lucide-react installed: npm install lucide-react
import {
  User,
  Lock,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Load remembered credentials on page load
  useEffect(() => {
    const loadCredentials = () => {
      // Load remembered credentials
      const rememberedCredentials = localStorage.getItem("rememberedCredentials");
      
      if (rememberedCredentials) {
        try {
          const { username, password } = JSON.parse(rememberedCredentials);
          if (username && password) {
            setFormData({ username, password });
          }
        } catch (error) {
          localStorage.removeItem("rememberedCredentials");
          console.error("Error parsing remembered credentials:", error);
        }
      }
    };
    
    loadCredentials();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("Login attempt initiated:", {
      username: formData.username,
      passwordLength: formData.password.length,
      apiUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    });

    try {
      const response = await apiService.login(
        formData.username,
        formData.password,
      );

      console.log("Login response received:", response);

      if (response.success && response.token) {
        console.log("Login successful, setting token and redirecting...");
        apiService.setToken(response.token);

        // Store user info in localStorage
        const userData = response.data?.user || response.user;
        if (userData) {
          localStorage.setItem("user", JSON.stringify(userData));
        }

        // Handle Remember Me functionality
        if (rememberMe) {
          // Store credentials in localStorage
          const credentialsToSave = {
            username: formData.username,
            password: formData.password
          };
          localStorage.setItem("rememberedCredentials", JSON.stringify(credentialsToSave));
        } else {
          // Clear any previously saved credentials
          localStorage.removeItem("rememberedCredentials");
        }

        const role = userData?.role?.toUpperCase(); // Convert to uppercase to match the enum values
        console.log("User role determined:", role);
        if (role === "ADMIN") {
          console.log("Redirecting to admin dashboard");
          router.push("/admin/dashboard");
        } else if (role === "SUPERVISOR") {
          console.log("Redirecting to supervisor dashboard");
          router.push("/supervisor/dashboard");
        } else {
          console.log("Redirecting to surveyor dashboard");
          router.push("/surveyor/dashboard");
        }
      } else {
        console.error("Login failed:", response.error);
        setError(
          response.error || "Login failed. Please check your credentials.",
        );
      }
    } catch (err: unknown) {
      setError("An unexpected error occurred. " + ((err as Error).message || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen! w-full! flex items-center justify-center p-4! relative bg-slate-950! overflow-hidden isolate">
      {/* --- Background Effects --- */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size[24px_24px] pointer-events-none"></div>

      {/* Glow Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-125 h--125 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      {/* --- Main Card --- */}
      <div className="w-full max-w-100 relative z-10">
        {/* Header Section */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-cyan-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
            <Image
              src="/SES_logo.png"
              alt="Socio-Economic Survey Logo"
              width={96}
              height={96}
              className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 relative z-10 drop-shadow-xl"
              priority
              unoptimized={true}
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-slate-400 text-sm">
            Sign in to access the Socio-Economic Survey
          </p>
          <div className="w-16 h-0.5 bg-linear-to-r from-blue-500 to-cyan-500 rounded-full mx-auto mt-4"></div>
        </div>

        {/* Glass Container */}
        <div className="backdrop-blur-xl bg-slate-900/70 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
          {/* Progress Bar Loader */}
          {loading && (
            <div className="h-1 w-full bg-linear-to-r from-blue-500 via-cyan-400 to-blue-500 animate-gradient-x" />
          )}

          <form onSubmit={handleSubmit} className="p-6 flex! flex-col gap-6">
            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3 text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-5">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                  Username
                </label>
                <div className="relative group">
                  {/* Icon Container - Perfectly Centered */}
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors pointer-events-none">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder="Enter your username"
                    required
                    className="box-border! w-full! bg-slate-950/50! border! border-slate-700! rounded-xl! py-3.5! pl-12! pr-4! text-slate-100! placeholder-slate-600! focus:outline-none! focus:ring-2! focus:ring-cyan-500/50! focus:border-cyan-500! transition-all! duration-200!"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                  Password
                </label>
                <div className="relative group">
                  {/* Icon Container - Perfectly Centered */}
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors pointer-events-none">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Enter your password"
                    required
                    className="box-border! w-full! bg-slate-950/50! border! border-slate-700! rounded-xl! py-3.5! pl-12! pr-4! text-slate-100! placeholder-slate-600! focus:outline-none! focus:ring-2! focus:ring-cyan-500/50! focus:border-cyan-500! transition-all! duration-200!"
                  />
                  {/* Eye Icon Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors focus:outline-none focus:text-cyan-400"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <Eye className="w-5 h-5 cursor-pointer" />
                    ) : (
                      <EyeOff className="w-5 h-5 cursor-pointer" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me Toggle */}
              <div className="flex items-center justify-between py-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                  Remember Me
                </label>
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer ${rememberMe ? 'bg-green-500' : 'bg-red-500'}`}
                  aria-label={rememberMe ? "Remember me enabled" : "Remember me disabled"}
                >
                  <span className="sr-only">{rememberMe ? "Remember me enabled" : "Remember me disabled"}</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${rememberMe ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2! w-full! bg-linear-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white! font-bold! py-3.5! rounded-xl! shadow-lg! shadow-blue-500/25! hover:shadow-blue-500/40! transition-all! duration-300! transform! active:scale-[0.98]! !disabled:opacity-70 !disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="bg-slate-950/30 py-4 px-8 text-center border-t border-slate-800">
            <p className="text-slate-600 text-xs font-medium">
              Secure System • Socio-Economic Survey v1.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}