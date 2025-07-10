import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, modeToggle } from "../store/features/authSlice";
import hospitalicon from "../assets/hospitalicon.png";
import axiosInstance from "../lib/axio";
import SettingsIcon from "../assets/Settings.png";

export default function Sidebar({ className = "" }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const mode = useSelector((state) => state.auth.mode);
  const { isAuthenticated, currentUser, businessProfile } = useSelector(
    (state) => state.auth
  );

  const handleLogout = async () => {
    try {
      dispatch(logoutUser());
      alert("Logout successful");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      alert(
        "Logout failed: " + (error.response?.data?.message || error.message)
      );
    }
  };

  const handleModeToggle = async () => {
    try {
      const response = await axiosInstance.get("recuriter/checkRecuriter");
      console.log(response);
      await dispatch(modeToggle());
      if (mode === "individual") {
        navigate("/recruitment");
      } else if (mode === "recruiter") {
        navigate("/jobs");
      }
    } catch (error) {
      console.log("Error on toggle", error);
    }
  };

  return (
    <>
      <div
        className={`fixed left-0 top-0 h-full w-[210px] bg-white z-40 ${className}`}
      ></div>
      <aside
        className={`w-[18vw] ml-[70px] h-full bg-[#FFFFFF] fixed shadow-md flex flex-col transition-all duration-[300] z-50 pt-[12vh] ${className}`}
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
              className="cursor-pointer hover:bg-gray-100 mx-3 p-3 bg-[#F5F5F5] border rounded-lg shadow-sm flex items-center justify-between mb-5 border-[#FFFFFF]"
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
                      Main Menu
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
                        text="Dashboard"
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
                      <NavItem
                        icon={
                          <img
                            src={SettingsIcon}
                            alt="Settings"
                            className="w-5 h-5"
                          />
                        }
                        text="Feed"
                      />
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
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  {/* User Side */}
                  <div className="mb-5 relative">
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
