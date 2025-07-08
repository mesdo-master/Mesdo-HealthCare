import { useState } from "react";
import axiosInstance from "../../lib/axio";
import { Link } from "react-router-dom";
import { set } from "mongoose";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const checkUserExistence = async (email) => {
    setLoading(true);
    setError("");
    setMessage("");
    
    try {
      const response = await axiosInstance.post("/forget-password", {email});
      console.log(response)
      if (response.data.success) {
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setMessage(response.data.message);
        setEmail('');
      } else {
        setError(response.data.error || "Something went wrong.");
      }
    } catch (err) {
      console.log(err)
      setError("Server error. Please try again later.");
    }
    
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setError("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email format.");
      return;
    }
    checkUserExistence(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md p-8 bg-white">
        <h2 className="text-center text-2xl font-semibold text-gray-800">Forgot Password</h2>
        <div className="flex justify-center my-6">
          <img 
            src='https://res.cloudinary.com/dy9voteoc/image/upload/v1742123850/Web_Security_qwa547.svg' 
            alt="Security" 
            className="h-[40vh]"
          />
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Enter Registered Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className={`mt-2 block w-full px-4 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                error ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"
              } text-gray-900 bg-gray-100 text-lg`}
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {message && <p className="text-green-600 text-sm mt-2">{message}</p>}
          </div>
          <button
            type="submit"
            className="w-full px-4 py-3 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={loading}
          >
            {loading ? "Checking..." : "Continue"}
          </button>
          <Link to={'/login'}>
          <button
            type="button"
            className="w-full px-4 py-3 border my-4 border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Back
          </button>
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ForgetPassword;
