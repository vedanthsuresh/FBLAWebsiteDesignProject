import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("admin_auth", "true");
        localStorage.setItem("admin_token", data.access_token);
        localStorage.setItem("admin_role", data.role);
        localStorage.setItem("admin_email", email);
        navigate("/");
      } else {
        const errData = await response.json();
        setError(errData.detail || "Invalid credentials");
      }
    } catch (err) {
      setError("Server connection failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8]">
      <div className="bg-white p-10 rounded-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-full max-w-md border border-gray-100">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-black flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-light tracking-tighter text-center mb-8 text-black uppercase">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border-b border-gray-200 focus:border-black outline-none transition-all text-sm"
                placeholder="admin@high.org"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? "password" : "text"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border-b border-gray-200 focus:border-black outline-none transition-all text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-black transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-black text-white py-4 rounded-none hover:bg-gray-900 transition-all font-bold text-xs uppercase tracking-[0.3em] flex justify-center items-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing in...
              </>
            ) : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
