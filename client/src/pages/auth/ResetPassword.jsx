import { useState } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../lib/axio";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isResetSuccessful, setIsResetSuccessful] = useState(false); // New state for success
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(""); // Clear any previous errors

    try {
      await axiosInstance.post(`/reset-password/${token}`, { password });
      setIsResetSuccessful(true); // Set success state
      setTimeout(() => navigate("/login"), 1000); // Redirect after 1 second
    } catch (error) {
      setError(error.response?.data?.message || "Error resetting password");
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white px-8 overflow-hidden">
      {/* Back Button */}
      <div className="absolute top-6 left-6 flex items-center">
        <button
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 text-lg"
          onClick={() => navigate("/forgot-password")}
        >
          <AiOutlineArrowLeft className="text-2xl" />
          <span>Back</span>
        </button>
      </div>

      <div className="w-full max-w-xl p-10 bg-white">
        <h2 className="text-center text-3xl font-semibold">Change Password</h2>

        {/* Image Section */}
        <div className="flex justify-center my-6">
          <img
            src={
              "https://res.cloudinary.com/dy9voteoc/image/upload/v1742225155/Change_Password_ndbxlp.svg"
            }
            alt="Security"
            className="h-52 w-72"
          />
        </div>

        {isResetSuccessful ? (
          <div className="text-center">
            <p className="text-green-500 text-lg">Password successfully changed!</p>
            <p>Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-lg text-gray-700">
                New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                className={`mt-2 block w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none ${
                  error ? "border-red-500" : "border-gray-300"
                } text-gray-900 bg-gray-100 text-lg`}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            <button
              type="submit"
              className="block w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-white bg-[#1890FF] hover:bg-blue-700"
            >
              Continue
            </button>
            <button
              type="button"
              className="w-full flex items-center justify-center border border-gray-300 py-3 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              onClick={() => navigate("/login")}
            >
              Cancel
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;