import { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../../store/features/authSlice";

const SignUpPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strengthLabels = [
    "Very Weak",
    "Weak",
    "Moderate",
    "Strong",
    "Very Strong",
  ];
  const strengthColors = [
    "bg-[#DD4963]",
    "bg-[#FF9A40]",
    "bg-[#F2E03E]",
    "bg-[#B6E949]",
    "bg-[#48C61C]",
  ];

  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!validateEmail(email)) {
      newErrors.email = "Invalid email format.";
    }
    if (!password) {
      newErrors.password = "Password is required.";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    setErrors({});
    try {
      const response = await dispatch(signupUser({ email, password })).unwrap();

      // Check if email verification is required
      if (response.requiresVerification) {
        navigate("/verify-email", { state: { email } });
      } else {
        navigate("/");
      }
    } catch (error) {
      setErrors({ general: error?.message || "Unable to Signup" });
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Signup
  const handleGoogleSignup = () => {
    // Redirect to backend Google auth route
    const apiUrl =
      process.env.REACT_APP_API_URL ||
      "https://mesdo-healthcare-4.onrender.com";
    window.location.href = `${apiUrl}/google`;
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div className="w-1/2 hidden md:block">
        <img
          src="https://res.cloudinary.com/dy9voteoc/image/upload/v1742050620/SignUp_py37lz.png"
          className="h-full w-full object-cover"
          alt="Sign Up"
        />
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center px-8 bg-white">
        <div className="max-w-md w-full">
          <h2 className="text-[#DB4E82] font-bold text-sm">START FOR FREE</h2>
          <h1 className="text-3xl font-bold mt-2">Create new account.</h1>

          {errors.general && (
            <p className="text-red-500 text-sm mt-2">{errors.general}</p>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                className={`mt-1 block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } bg-white`}
                placeholder="example@mail.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Create a password <span className="text-red-500">*</span>
              </label>
              <input
                className={`mt-1 block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } bg-white`}
                placeholder="At least 8 characters"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 flex-1 rounded-md ${
                        index < getPasswordStrength(password)
                          ? strengthColors[getPasswordStrength(password)]
                          : "bg-gray-200"
                      }`}
                    ></div>
                  ))}
                </div>
                <p
                  className={`text-sm mt-1 font-small ${strengthColors[
                    getPasswordStrength(password)
                  ].replace("bg", "text")}`}
                >
                  {strengthLabels[getPasswordStrength(password)]}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-white bg-[#1890FF] hover:bg-primary-600 disabled:bg-gray-400"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link className="text-primary-500 font-semibold" to={"/login"}>
                Sign in
              </Link>
            </p>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center border border-gray-300 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 bg-white"
          >
            <FcGoogle className="mr-2 text-xl" />
            Sign Up with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
