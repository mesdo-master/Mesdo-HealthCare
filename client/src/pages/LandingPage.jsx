import { FcGoogle } from "react-icons/fc"; // Import Google Icon
import mesdoLogo from "../assets/mesdo_logo.png";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const handleGoogleLogin = () => {
    // Redirect to backend Google auth route
    const apiUrl =
      process.env.REACT_APP_API_URL ||
      "https://mesdo-healthcare-4.onrender.com";
    window.location.href = `${apiUrl}/google`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      {/* Header */}
      <div className="absolute top-5 left-5 flex items-center">
        <img alt="Mesdo logo" className="w-12 h-12 mr-2 mt-2" src={mesdoLogo} />
        <span
          className="text-xl font-medium mt-2"
          style={{
            fontFamily: "Inter",
            fontWeight: 400,
            fontSize: "30px",
          }}
        >
          Mesdo
        </span>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between w-full max-w-6xl gap-24">
        {/* Left Section */}
        <div className="md:w-1/2 text-center md:text-left">
          <h1
            className="text-4xl font-bold mb-5 leading-tight"
            style={{
              fontFamily: "Inter",
              fontWeight: 700,

              lineHeight: "130%",
              letterSpacing: "0.04em",

              verticalAlign: "middle",
            }}
          >
            Connecting Healthcare, Empowering Professionals
          </h1>
          <p
            className="text-mid text-[#1F1F1F] mb-8 font-sm "
            style={{
              fontFamily: "Inter",
              fontWeight: 400,
              fontSize: "18px",
              lineHeight: "125%",
              letterSpacing: "0.04em",

              verticalAlign: "middle",
            }}
          >
            A comprehensive platform for healthcare professionals to network,
            exchange knowledge, search for jobs and stay up to date with
            industry news.
          </p>
          <div className="w-full max-w-sm mx-auto md:mx-0">
            <button
              onClick={handleGoogleLogin}
              className="w-full h-14 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-200 transition mb-4 px-4"
              style={{
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: "12px",
                lineHeight: "100%",
                letterSpacing: "0%",
                textAlign: "center",
                verticalAlign: "middle",
              }}
            >
              <FcGoogle className="mr-2 text-xl" />
              Sign Up with Google
            </button>
            <Link to={"/login"}>
              <button className="w-full h-14 bg-[#1890FF] text-white rounded-lg hover:bg-blue-600 transition mb-4 px-4">
                <span
                  style={{
                    fontFamily: "Inter",
                    fontWeight: 600,
                    fontSize: "12px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  Login
                </span>
              </button>
            </Link>
            <Link to={"/signup"}>
              <button className="w-full h-14 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition px-4">
                <span
                  style={{
                    fontFamily: "Inter",
                    fontWeight: 600,
                    fontSize: "12px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  Sign Up
                </span>
              </button>
            </Link>
          </div>
        </div>

        {/* Right Section */}
        <div className="md:w-1/2 flex justify-center">
          <img
            alt="Healthcare professional illustration"
            className="w-full max-w-lg"
            src="https://res.cloudinary.com/dy9voteoc/image/upload/v1742038245/MainPage_uw7a7k.png"
          />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
