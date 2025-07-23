import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { modeToggle } from "../store/features/authSlice";
import { useAuth } from "../hooks/useAuth";
import hospitalicon from "../assets/hospitalicon.png";
import axiosInstance from "../lib/axio";
import SettingsIcon from "../assets/Settings.png";

export default function Sidebar({ className = "" }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, businessProfile, mode, logout } =
    useAuth();

  const [showSwitchLoader, setShowSwitchLoader] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handleModeToggle = async () => {
    try {
      setShowSwitchLoader(true);
      const response = await axiosInstance.get("recuriter/checkRecuriter");
      console.log(response);
      await dispatch(modeToggle());
      setTimeout(() => {
        setShowSwitchLoader(false);
        if (mode === "individual") {
          navigate("/recruitment");
        } else if (mode === "recruiter") {
          navigate("/jobs");
        }
      }, 1200); // 1.2s for smooth UX
    } catch (error) {
      setShowSwitchLoader(false);
      console.log("Error on toggle", error);
    }
  };

  return (
    <>
      {showSwitchLoader && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-300 animate-fade-in">
          <div className="flex flex-col items-center bg-white rounded-2xl shadow-2xl px-10 py-8">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-[#1890FF] rounded-full animate-spin shadow-lg"></div>
              {/* Animated checkmark after 0.8s */}
              <span
                id="switch-checkmark"
                className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300"
              >
                <svg
                  className="w-10 h-10 text-[#1890FF]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
            </div>
            <div className="text-lg font-semibold text-[#1890FF] animate-pulse">
              Switching mode...
            </div>
          </div>
          <style jsx>{`
            @keyframes fade-in {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
            .animate-fade-in {
              animation: fade-in 0.4s;
            }
          `}</style>
          <script
            dangerouslySetInnerHTML={{
              __html: `
            setTimeout(function(){
              var el = document.getElementById('switch-checkmark');
              if(el) el.style.opacity = 1;
            }, 800);
          `,
            }}
          />
        </div>
      )}
      <div
        className={`fixed left-0 top-0 h-full w-[210px] bg-white z-40 ${className}`}
      ></div>
      <aside
        className={`fixed top-0 left-0 h-full w-[210px] md:w-[210px] lg:w-[18vw] ml-[70px] bg-[#FFFFFF] shadow-md flex flex-col pt-[12vh] z-50 ${className}`}
      >
        {/* Logo Section
        <div className="p-3 flex items-center">
          <img src={mesdoLogo} alt="Mesdo Logo" className="h-11 w-11" />
        </div> */}

        {/* If user is not authenticated, show Login and Signup buttons */}
        {!isAuthenticated ? (
          <div className="flex flex-col items-center mt-10 space-y-4 mx-2">
            <Link
              to="/login"
              className="w-full text-center py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="w-full text-center py-2 rounded-md border border-blue-500 text-blue-500 hover:bg-blue-50"
            >
              Signup
            </Link>
          </div>
        ) : (
          <>
            {/* Switch Card */}
            <div
              onClick={handleModeToggle}
              className="cursor-pointer hover:bg-gray-100 mx-3 p-3 bg-[#F5F5F5] rounded-lg shadow-sm flex items-center justify-between mb-5 border-none"
            >
              <div className="flex items-center space-x-3">
                <img src={hospitalicon} alt="Switch Icon" className="h-8 w-8" />
                <div>
                  <h2 className="text-sm font-medium text-gray-800">
                    {mode === "recruiter" ? "Hospital" : "Personal"}
                  </h2>
                  <p className="text-[11px] text-gray-500">
                    {mode === "recruiter"
                      ? "Switch to personal"
                      : "Switch to recruiter"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-500 rounded-full">
                <span className="text-[11px]">▼</span>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="px-3">
              {mode === "recruiter" ? (
                <>
                  {/* Recruiter Side */}
                  <div className="mb-5">
                    <h3 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      DASHBOARD
                    </h3>
                    <ul className="space-y-2">
                      {/* <NavItem
                        icon={
                          <img
                            src={SettingsIcon}
                            alt="Settings"
                            className="w-5 h-5"
                          />
                        }
                        text="Dashboard"
                      /> */}
                      <NavItem
                        icon={
                          <img
                            src={SettingsIcon}
                            alt="Settings"
                            className="w-5 h-5"
                          />
                        }
                        navTo={"/recruitment"}
                        text="Recruitment"
                      />

                      {/* <NavItem
                        icon={
                          <img
                            src={SettingsIcon}
                            alt="Settings"
                            className="w-5 h-5"
                          />
                        }
                        text="Feed"
                      /> */}
                      <NavItem
                        icon={
                          <img
                            src={SettingsIcon}
                            alt="Settings"
                            className="w-5 h-5"
                          />
                        }
                        navTo={"/organization/messages"}
                        text="Messages"
                      />
                      <NavItem
                        icon={
                          <img
                            src={SettingsIcon}
                            alt="Settings"
                            className="w-5 h-5"
                          />
                        }
                        text="Profile"
                        navTo={`/organization/${businessProfile?._id}`}
                      />
                    </ul>
                  </div>

                  <div className="mb-5">
                    <h3 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Others
                    </h3>
                    <ul className="space-y-2">
                      <NavItem
                        icon={
                          <img
                            src={SettingsIcon}
                            alt="Settings"
                            className="w-5 h-5"
                          />
                        }
                        text="Candidate Search"
                      />
                      <NavItem
                        icon={
                          <img
                            src={SettingsIcon}
                            alt="Settings"
                            className="w-5 h-5"
                          />
                        }
                        text="Analytics"
                      />
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Preferences
                    </h3>
                    <ul className="space-y-2">
                      <NavItem
                        icon={
                          <img
                            src={SettingsIcon}
                            alt="Settings"
                            className="w-5 h-5"
                          />
                        }
                        text="Help Center"
                      />
                      <NavItem
                        icon={
                          <img
                            src={SettingsIcon}
                            alt="Settings"
                            className="w-5 h-5"
                          />
                        }
                        text="Settings"
                        // navTo={`/organization/${businessProfile?._id}`}
                      />
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  {/* User Side */}
                  <div className="mb-5 relative">
                    <h3 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      DASHBOARD
                    </h3>
                    <ul className="space-y-2">
                      {/* <NavItem icon={<Home size={18} />} text="Home" navTo={'/'} /> */}
                      <NavItem
                        icon={
                          <img
                            src={SettingsIcon}
                            alt="Settings"
                            className="w-5 h-5"
                          />
                        }
                        text="Jobs"
                        navTo={"/jobs"}
                      />
                      <NavItem
                        icon={
                          <img
                            src={SettingsIcon}
                            alt="Settings"
                            className="w-5 h-5"
                          />
                        }
                        text="Message"
                        navTo={"/messages"}
                      />
                      <NavItem
                        icon={
                          <img
                            src={SettingsIcon}
                            alt="Settings"
                            className="w-5 h-5"
                          />
                        }
                        text="Profile"
                        navTo={`/profile/${currentUser?.username}`}
                      />
                    </ul>
                  </div>
                  <div className="mb-5 relative">
                    <h3 className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Preference
                    </h3>
                    <ul className="space-y-2">
                      {/* <NavItem icon={<Home size={18} />} text="Home" navTo={'/'} /> */}

                      <NavItem
                        icon={
                          <img
                            src={SettingsIcon}
                            alt="Settings"
                            className="w-5 h-5"
                          />
                        }
                        text="Settings"
                        navTo={"/settings"}
                      />
                      <NavItem
                        icon={
                          <img
                            src={SettingsIcon}
                            alt="Settings"
                            className="w-5 h-5"
                          />
                        }
                        text="Help Center"
                      />

                      <li>
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 px-3 py-2 w-full rounded-md text-sm text-[#767F8C] hover:bg-gray-100 hover:text-gray-900 transition-all"
                        >
                          <img
                            src={SettingsIcon}
                            alt="Settings"
                            className="w-5 h-5"
                          />
                          <span>Logout</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </nav>
          </>
        )}
      </aside>
    </>
  );
}

Sidebar.propTypes = {
  mode: PropTypes.oneOf(["recruiter", "individual"]),
};

/* Reusable NavItem Component */
const NavItem = ({ navTo, icon, text }) => {
  return (
    <li>
      <Link
        to={navTo}
        className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm text-[#767F8C] hover:bg-gray-100 hover:text-[#767F8C] transition-all"
      >
        {icon}
        <span>{text}</span>
      </Link>
    </li>
  );
};

NavItem.propTypes = {
  icon: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
};
