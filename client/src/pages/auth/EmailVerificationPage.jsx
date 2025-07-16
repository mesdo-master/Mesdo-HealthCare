import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../lib/axio";
import { checkAuth } from "../../store/features/authSlice";

const EmailVerificationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Get email from location state or localStorage
    const emailFromState = location.state?.email;
    const emailFromStorage = localStorage.getItem("pendingVerificationEmail");

    if (emailFromState) {
      setEmail(emailFromState);
      localStorage.setItem("pendingVerificationEmail", emailFromState);
    } else if (emailFromStorage) {
      setEmail(emailFromStorage);
    } else {
      // If no email found, redirect to signup
      navigate("/signup");
      return;
    }

    // Start resend timer
    setResendTimer(60);
  }, [location.state, navigate]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    document.body.classList.add("overflow-hidden");
    return () => document.body.classList.remove("overflow-hidden");
  }, []);

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return; // Only allow single character

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    // Clear errors when user starts typing
    if (errors.code) {
      setErrors({});
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join("");

    if (verificationCode.length !== 6) {
      setErrors({ code: "Please enter the complete 6-digit code" });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await axiosInstance.post("/verify-email", {
        email,
        code: verificationCode,
      });

      if (response.data.success) {
        // Clear stored email
        localStorage.removeItem("pendingVerificationEmail");

        // Dispatch checkAuth to update the auth state
        await dispatch(checkAuth());

        // Navigate to main app
        navigate("/");
      }
    } catch (error) {
      setErrors({
        general:
          error.response?.data?.message ||
          "Verification failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;

    setIsResending(true);
    setErrors({});

    try {
      const response = await axiosInstance.post("/resend-verification", {
        email,
      });

      if (response.data.success) {
        setResendTimer(60);
        setCode(["", "", "", "", "", ""]);
        // Focus first input
        const firstInput = document.getElementById("code-0");
        if (firstInput) firstInput.focus();
      }
    } catch (error) {
      setErrors({
        general:
          error.response?.data?.message ||
          "Failed to resend code. Please try again.",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-1/2 hidden md:block">
        <img
          src="https://res.cloudinary.com/dy9voteoc/image/upload/v1742050620/SignUp_py37lz.png"
          className="h-full w-full object-cover"
          alt="Email Verification"
        />
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Check your email
            </h1>
            <p className="text-gray-600">
              We've sent a 6-digit verification code to
            </p>
            <p className="text-blue-600 font-medium">{email}</p>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Enter verification code
              </label>
              <div className="flex space-x-2 justify-center">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-12 h-12 text-center text-xl font-bold border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.code ? "border-red-500" : "border-gray-300"
                    }`}
                    maxLength={1}
                    autoComplete="off"
                  />
                ))}
              </div>
              {errors.code && (
                <p className="text-red-500 text-sm mt-2">{errors.code}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendCode}
              disabled={resendTimer > 0 || isResending}
              className="text-blue-600 font-medium hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {isResending
                ? "Sending..."
                : resendTimer > 0
                ? `Resend in ${resendTimer}s`
                : "Resend code"}
            </button>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                localStorage.removeItem("pendingVerificationEmail");
                navigate("/signup");
              }}
              className="text-gray-500 text-sm hover:text-gray-700"
            >
              ← Back to Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
