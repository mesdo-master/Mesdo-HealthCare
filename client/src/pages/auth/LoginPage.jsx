import { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../store/features/authSlice";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });

  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let validationErrors = {};

    if (!email) {
      validationErrors.email = "Email is required.";
    } else if (!validateEmail(email)) {
      validationErrors.email = "Invalid email format.";
    }

    if (!password) {
      validationErrors.password = "Password is required.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({ email: "", password: "" });

    try {
      await dispatch(loginUser({ email, password })).unwrap();
      window.location.href = "/jobs";
    } catch (error) {
      console.log(error);
      setErrors({ email: error?.email, password: error?.password });
      console.error(error);
    }
  };

  // Handle Google Login
  const handleGoogleLogin = () => {
    // Redirect to backend Google auth route
    window.location.href = `${
      process.env.REACT_APP_API_URL || "http://localhost:5020"
    }/auth/google`;
  };

  return (
    <div className="min-h-screen flex">
      {/* Image Section */}
      <div className="w-1/2 hidden md:block">
        <img
          src="https://res.cloudinary.com/dy9voteoc/image/upload/v1742050620/SignUp_py37lz.png"
          className="h-full w-full object-cover"
          alt="Login"
        />
      </div>

      {/* Login Form Section */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-8">
        <div className="max-w-md w-full">
          <h2 className="text-[#DB4E82] font-bold text-sm">Hey!</h2>
          <h1 className="text-3xl font-bold mt-2">Welcome Back</h1>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                className={`mt-1 block w-full px-4 py-3 border rounded-sm shadow-sm focus:outline-none ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } text-gray-900 bg-gray-100`}
                placeholder="example@mail.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                className={`mt-1 block w-full px-4 py-3 border rounded-sm shadow-sm focus:outline-none ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } text-gray-900 bg-gray-100`}
                placeholder="Enter Your Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Login Button */}
            <button
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-white bg-[#1890FF] hover:bg-blue-700"
              type="submit"
            >
              Log in
            </button>
          </form>

          {/* Links */}
          <div className="mt-3 flex justify-between text-sm text-gray-600">
            <Link className="text-[#5A6FE4] font-small" to="/forgot-password">
              Forgot password?
            </Link>
            <Link className="text-gray-600 font-small" to="/signup">
              Don't have an account?{" "}
              <span className="text-blue-500 text-small">Sign up</span>
            </Link>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center border border-gray-300 py-3 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <FcGoogle className="mr-2 text-xl" />
            Log in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
