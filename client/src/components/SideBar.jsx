import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { modeToggle } from "../store/features/authSlice";
import { useAuth } from "../hooks/useAuth";
import { useNotifications } from "../context/NotificationContextFinal";
import hospitalicon from "../assets/hospitalicon.png";
import axiosInstance from "../lib/axio";
import SettingsIcon from "../assets/Settings.png";
import {
  Briefcase,
  MessageCircle,
  User,
  Settings,
  HelpCircle,
  Users,
  Building,
  Search,
  BarChart,
  Power,
} from "lucide-react";

export default function Sidebar({ className = "" }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, businessProfile, mode, logout } =
    useAuth();
  const { unreadMessageCount } = useNotifications();

  const [showSwitchLoader, setShowSwitchLoader] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [targetRoute, setTargetRoute] = useState("");
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  const handleNavigation = (route, routeName) => {
    if (route) {
      setNavigating(true);
      setTargetRoute(routeName);

      // Add a small delay for smooth UX
      setTimeout(() => {
        navigate(route);
        setTimeout(() => {
          setNavigating(false);
          setTargetRoute("");
        }, 300); // Quick fade out after navigation
      }, 500); // 0.5s loading animation
    }
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
      {(showSwitchLoader || navigating) && (
        <div
          className="fixed inset-0 z-[9999] flex items-center  justify-center bg-white/80 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
          aria-busy="true"
          aria-live="polite"
          style={{ pointerEvents: "none" }}
        >
          <div className="flex flex-col items-center bg-white  rounded-2xl shadow-2xl px-10 py-8 animate-fade-in">
            <div className="mb-6">
              <div className="w-14 h-14 border-4 border-blue-100 border-t-[#1890FF] rounded-full animate-spin"></div>
            </div>
            <div className="text-lg font-semibold text-primary-500 animate-pulse">
              Just a moment...
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
        </div>
      )}
      <div
        className={`absolute left-0 top-0 h-full w-[210px] bg-white z-40 ${className}`}
      ></div>
      <aside
        className={`absolute top-0 left-0 h-full w-[250px] md:w-[250px] lg:w-[250px] ml-[70px] bg-white flex flex-col pt-[140px] z-50 ${className}`}
        style={
          showSwitchLoader || navigating
            ? { pointerEvents: "none", opacity: 0.7 }
            : {}
        }
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
                          <Users color="#7F7F7F" strokeWidth={1.8} size={22} />
                        }
                        navTo={"/recruitment"}
                        text="Recruitment"
                        isActive={location.pathname.startsWith("/recruitment")}
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
                          <MessageCircle
                            color="#7F7F7F"
                            strokeWidth={1.8}
                            size={22}
                          />
                        }
                        navTo={"/organization/messages"}
                        text="Messages"
                        notificationCount={unreadMessageCount}
                        isActive={location.pathname.startsWith(
                          "/organization/messages"
                        )}
                      />
                      <NavItem
                        icon={
                          <Building
                            color="#7F7F7F"
                            strokeWidth={1.8}
                            size={22}
                          />
                        }
                        text="Profile"
                        navTo={`/organization/${businessProfile?._id}`}
                        isActive={location.pathname.startsWith(
                          `/organization/${businessProfile?._id}`
                        )}
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
                          <Search color="#7F7F7F" strokeWidth={1.8} size={22} />
                        }
                        text="Candidate Search"
                      />
                      <NavItem
                        icon={
                          <BarChart
                            color="#7F7F7F"
                            strokeWidth={1.8}
                            size={22}
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
                          <HelpCircle
                            color="#7F7F7F"
                            strokeWidth={1.8}
                            size={22}
                          />
                        }
                        text="Help Center"
                      />
                      <NavItem
                        icon={
                          <Settings
                            color="#7F7F7F"
                            strokeWidth={1.8}
                            size={22}
                          />
                        }
                        text="Settings"
                        navTo={
                          mode === "recruiter"
                            ? "/recuriter/settings"
                            : "/settings"
                        }
                      />
                      <li>
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 px-3 py-2 w-full rounded-md text-sm text-[#7F7F7F] transition-all hover:bg-gray-100 group"
                        >
                          <Power
                            color="currentColor"
                            className="transition-colors group-hover:text-primary-500"
                            strokeWidth={1.8}
                            size={22}
                          />
                          <span className="transition-colors group-hover:text-primary-500">
                            Logout
                          </span>
                        </button>
                      </li>
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
                          <Briefcase
                            color="#7F7F7F"
                            strokeWidth={1.8}
                            size={22}
                          />
                        }
                        text="Jobs"
                        navTo={"/jobs"}
                        onNavigate={handleNavigation}
                        isActive={location.pathname.startsWith("/jobs")}
                      />
                      <NavItem
                        icon={
                          <MessageCircle
                            color="#7F7F7F"
                            strokeWidth={1.8}
                            size={22}
                          />
                        }
                        text="Message"
                        navTo={"/messages"}
                        onNavigate={handleNavigation}
                        isActive={location.pathname.startsWith("/messages")}
                        notificationCount={unreadMessageCount}
                      />
                      <NavItem
                        icon={
                          <User color="#7F7F7F" strokeWidth={1.8} size={22} />
                        }
                        text="Profile"
                        navTo={`/profile/${currentUser?.username}`}
                        onNavigate={handleNavigation}
                        isActive={location.pathname.startsWith("/profile")}
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
                          <Settings
                            color="#7F7F7F"
                            strokeWidth={1.8}
                            size={22}
                          />
                        }
                        text="Settings"
                        navTo={"/settings"}
                        onNavigate={handleNavigation}
                        isActive={location.pathname.startsWith("/settings")}
                      />
                      <NavItem
                        icon={
                          <HelpCircle
                            color="#7F7F7F"
                            strokeWidth={1.8}
                            size={22}
                          />
                        }
                        text="Help Center"
                        onNavigate={handleNavigation}
                        isActive={location.pathname.startsWith("/help")}
                      />

                      <li>
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 px-3 py-2 w-full rounded-md text-sm text-[#7F7F7F] transition-all hover:bg-gray-100 group"
                        >
                          <Power
                            color="currentColor"
                            className="transition-colors group-hover:text-primary-500"
                            strokeWidth={1.8}
                            size={22}
                          />
                          <span className="transition-colors group-hover:text-primary-500">
                            Logout
                          </span>
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
const NavItem = ({
  navTo,
  icon,
  text,
  onNavigate,
  isActive,
  notificationCount,
}) => {
  const handleClick = (e) => {
    if (onNavigate && navTo) {
      e.preventDefault();
      onNavigate(navTo, text);
    }
  };

  return (
    <li>
      <Link
        to={navTo || "#"}
        onClick={handleClick}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-all group ${
          isActive
            ? "bg-[#E6F0FF] text-primary-500"
            : "text-[#7F7F7F] hover:bg-gray-100"
        }`}
        style={{ position: "relative", overflow: "hidden" }}
      >
        <div className="relative">
          {React.cloneElement(icon, {
            className: isActive
              ? "text-primary-500"
              : "transition-colors group-hover:text-primary-500",
            color: "currentColor",
          })}
          {/* Notification indicator */}
          {notificationCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
              {notificationCount > 99 ? "99+" : notificationCount}
            </div>
          )}
        </div>
        <span
          className={
            isActive
              ? "text-primary-500"
              : "transition-colors group-hover:text-primary-500"
          }
        >
          {text}
        </span>
        {/* Simple dot indicator for smaller screens or alternative style */}
        {notificationCount > 0 && (
          <div className="w-2 h-2 bg-red-500 rounded-full ml-auto animate-pulse"></div>
        )}
      </Link>
    </li>
  );
};

NavItem.propTypes = {
  icon: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
  navTo: PropTypes.string,
  onNavigate: PropTypes.func,
  isActive: PropTypes.bool,
  notificationCount: PropTypes.number,
};
