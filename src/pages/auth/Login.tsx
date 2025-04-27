import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser, setToken } from "../../store/slices/authSlice";
import { decodeJWT } from "../../utils/jwtUtils";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(true);
  useEffect(() => {
    if (error) {
      setShowErrorMessage(true);
      const hideTimer = setTimeout(() => {
        setShowErrorMessage(false);
      }, 4000);
      const clearTimer = setTimeout(() => {
        setError("");
      }, 5000);

      return () => {
        clearTimeout(hideTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [error]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;
  const [localSuccessMessage, setLocalSuccessMessage] = useState(
    successMessage || ""
  );
  const [showSuccessMessage, setShowSuccessMessage] = useState(true);

  useEffect(() => {
    if (localSuccessMessage) {
      setShowSuccessMessage(true);
      const hideTimer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 4000); // start fade out at 4 seconds
      const clearTimer = setTimeout(() => {
        setLocalSuccessMessage("");
      }, 5000); // remove after 5 seconds

      return () => {
        clearTimeout(hideTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [localSuccessMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() && !password.trim()) {
      setError("Моля попълнете всички полета");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://sportzone-api.onrender.com/api/Auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error("Моля въведете правилен имейл и парола");
        return;
      }

      if (!response.ok) {
        throw new Error("Моля въведете правилен имейл и парола");
      }

      if (!data.accessToken) {
        throw new Error("Моля въведете правилен имейл и парола");
      }

      // Decode the JWT token to get user information
      const decodedToken = decodeJWT(data.accessToken);
      const role =
        decodedToken?.[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ];

      dispatch(setToken(data.accessToken));
      dispatch(
        setUser({
          id: data.id,
          email: data.email,
          name: data.names,
          role: role || "User",
        })
      );

      if (role === "Admin") {
        navigate("/admin/products");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Моля въведете правилен имейл и парола");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-dark-200 p-8 rounded-lg shadow-xl">
        <div>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-dark-700">
            Вход в акаунта
          </h2>
          <p className="mt-2 text-center text-sm text-dark-700">
            Нямате акаунт?{" "}
            <Link
              to="/register"
              className="font-medium text-primary-400 hover:text-primary-300"
            >
              Регистрирайте се тук
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {localSuccessMessage && (
            <div
              className={`border border-green-500 text-green-400 px-4 py-3 rounded transition-opacity duration-1000 ${
                showSuccessMessage ? "opacity-100" : "opacity-0"
              }`}
            >
              {localSuccessMessage}
            </div>
          )}
          {error && (
            <div
              className={`border border-red-500 text-red-400 px-4 py-3 rounded transition-opacity duration-1000 ${
                showErrorMessage ? "opacity-100" : "opacity-0"
              }`}
            >
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Имейл адрес <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 rounded-lg border border-gray-300 shadow-sm 
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                  transition duration-150 ease-in-out
                  placeholder-gray-400 text-gray-900
                  hover:border-gray-400"
                placeholder="Въведете имейл адрес"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Парола <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 rounded-lg border border-gray-300 shadow-sm 
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                  transition duration-150 ease-in-out
                  placeholder-gray-400 text-gray-900
                  hover:border-gray-400"
                placeholder="Въведете парола"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-dark-900 bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Влизане...
                </span>
              ) : (
                "Вход"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
