import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Bell, Search, X, Clock, Loader2, ChevronDown } from "lucide-react";
import { setCurrentUser } from "../store/features/authSlice";
import axiosInstance from "../lib/axio";
import Loader from "./Loader";
import { NotificationPopup } from "../pages/notification/NotificationsPopup";
import { useSocket } from "../context/SocketProvider";
import NotificationIcon from "../../src/assets/Notification.png";
const Header = ({ className = "" }) => {
  const [showPreview, setShowPreview] = useState(false);
  const { currentUser, mode, businessProfile } = useSelector(
    (state) => state.auth
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const bellRef = useRef(null);
  const popupRef = useRef(null);
  const notificationIconRef = useRef(null); // Add proper ref for notification icon
  const socket = useSocket();
  const navigate = useNavigate();

  // Search type dropdown state
  const [searchType, setSearchType] = useState("Jobs");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchTypes = ["Jobs", "Companies", "Peoples"];
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const [requests, setRequests] = useState([]);

  // ✅ Wrap in useCallback to prevent dependency issues
  const fetchUnreadNotifications = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        `/notifications/unread?mode=${mode}`
      );
      // console.log(response)
      setUnreadCount(response?.data?.data?.length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [mode]);

  useEffect(() => {
    if (!socket) return;

    socket.on("newNotification", () => {
      setUnreadCount((prevCount) => prevCount + 1);
    });

    // ✅ Listen for follow-related notifications
    socket.on("followRequestReceived", () => {
      setUnreadCount((prevCount) => prevCount + 1);
    });

    socket.on("followAccepted", () => {
      setUnreadCount((prevCount) => prevCount + 1);
    });

    socket.on("followRejected", () => {
      // No notification for rejection, just update states
    });

    // ✅ Listen for follow request processing to refresh count
    socket.on("followRequestAccepted", () => {
      console.log("🎉 Follow request accepted - refreshing notification count");
      fetchUnreadNotifications(); // Refresh the count
    });

    socket.on("followRequestRejected", () => {
      console.log("❌ Follow request rejected - refreshing notification count");
      fetchUnreadNotifications(); // Refresh the count
    });

    // ✅ Listen for notifications marked as read
    socket.on("notificationsMarkedAsRead", () => {
      console.log("📖 Notifications marked as read - updating count");
      setUnreadCount(0); // Reset count immediately
      fetchUnreadNotifications(); // Also refresh from server
    });

    // Clean up the event listeners when the component unmounts
    return () => {
      socket.off("newNotification");
      socket.off("followRequestReceived");
      socket.off("followAccepted");
      socket.off("followRejected");
      socket.off("followRequestAccepted");
      socket.off("followRequestRejected");
      socket.off("notificationsMarkedAsRead");
    };
  }, [socket, fetchUnreadNotifications]); // Include fetchUnreadNotifications in dependency array

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        bellRef.current &&
        !bellRef.current.contains(event.target)
      ) {
        setShowPreview(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    console.log("=== HEADER DEBUG INFO ===");
    console.log("Current user from Redux:", currentUser);
    console.log("Current user ID:", currentUser?._id);
    console.log("Current user email:", currentUser?.email);
    console.log("Current user name:", currentUser?.name);
    console.log("Mode:", mode);
    console.log("========================");

    fetchUnreadNotifications();
  }, [currentUser, mode, fetchUnreadNotifications]);

  // --- Search State ---
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchHistory, setSearchHistory] = useState(() =>
    JSON.parse(localStorage.getItem("searchHistory") || "[]")
  );
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [page, setPage] = useState(1);
  const [resultCount, setResultCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const searchInputRef = useRef(null);
  const resultsDropdownRef = useRef(null);
  const limit = 10;
  // Debounce search
  useEffect(() => {
    if (!searchInput.trim()) {
      setSearchResults([]);
      setResultCount(0);
      setShowResults(false);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setShowResults(true);
    const handler = setTimeout(() => {
      axiosInstance
        .post("/api/search", {
          query: searchInput,
          category: searchType,
          page: 1,
          limit,
        })
        .then((res) => {
          setSearchResults(res.data.results);
          setResultCount(res.data.total);
          setHasMore(res.data.total > limit);
          setPage(1);
        })
        .catch(() => {
          setSearchResults([]);
          setResultCount(0);
        })
        .finally(() => setIsLoading(false));
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput, searchType]);
  // Keyboard navigation
  useEffect(() => {
    if (!showResults) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown") {
        setHighlightedIndex((prev) =>
          Math.min(prev + 1, searchResults.length - 1)
        );
      } else if (e.key === "ArrowUp") {
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        if (highlightedIndex >= 0) {
          handleResultSelect(searchResults[highlightedIndex]);
        } else if (searchInput.trim()) {
          setShowResults(false);
          navigate(
            `/search?category=${encodeURIComponent(
              searchType
            )}&query=${encodeURIComponent(searchInput)}`
          );
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    showResults,
    searchResults,
    highlightedIndex,
    searchInput,
    searchType,
    navigate,
  ]);
  // Save search history
  useEffect(() => {
    if (searchInput.trim() && !isLoading && searchResults.length > 0) {
      setSearchHistory((prev) => {
        const updated = [
          searchInput,
          ...prev.filter((h) => h !== searchInput),
        ].slice(0, 10);
        localStorage.setItem("searchHistory", JSON.stringify(updated));
        return updated;
      });
    }
  }, [searchResults]);
  // Clear results on blur
  const handleBlur = (e) => {
    setTimeout(() => setShowResults(false), 200);
  };
  // Handle result select
  const handleResultSelect = (item) => {
    setShowResults(false);
    setSearchInput("");
    navigate(
      `/search?category=${encodeURIComponent(
        searchType
      )}&query=${encodeURIComponent(searchInput)}`
    );
  };
  // Highlight match
  const highlightMatch = (text, soft = false) => {
    if (!searchInput) return text;
    const regex = new RegExp(`(${searchInput})`, "ig");
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          className={
            soft ? "bg-yellow-100 px-1 rounded" : "bg-yellow-200 px-0.5 rounded"
          }
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };
  // Load more results
  const loadMore = () => {
    setIsLoading(true);
    axiosInstance
      .post("/api/search", {
        query: searchInput,
        category: searchType,
        page: page + 1,
        limit,
      })
      .then((res) => {
        setSearchResults((prev) => [...prev, ...res.data.results]);
        setResultCount(res.data.total);
        setHasMore((page + 1) * limit < res.data.total);
        setPage((p) => p + 1);
      })
      .finally(() => setIsLoading(false));
  };

  // Handle notification preview hover
  const handleNotificationMouseEnter = () => setShowPreview(true);
  const handleNotificationMouseLeave = () => setShowPreview(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[51] bg-white border-b border-gray-200 ${className}`}
    >
      <div
        className="flex items-center h-[70px] px-6"
        style={{ marginLeft: "clamp(50px, 4vw, 120px)" }}
      >
        <div className="max-w-5xl mx-auto w-full flex items-center">
          {/* Logo */}
          <Link
            className="flex items-center gap-2 flex-shrink-0 ml-[-200px]"
            to="/"
          >
            <img
              src="https://res.cloudinary.com/dy9voteoc/image/upload/v1743179165/mesdo_logo_i08ymk.png"
              alt="Mesdo Logo"
              className="h-8 md:h-9 w-auto"
            />
            <span className="text-[18px] md:text-[20px] font-semibold text-gray-900">
              Mesdo
            </span>
          </Link>

          {/* Search Bar with Dropdown */}
          <div className="flex-1 mx-8">
            <div className="relative w-full max-w-full md:max-w-xl mx-auto flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-0">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500"
                  size={18}
                />
                <input
                  type="text"
                  placeholder={`Search ${searchType.toLowerCase()}...`}
                  className="w-full pl-10 h-[44px] md:h-[50px] pr-24 md:pr-32 py-2 border border-gray-200 border-r-0 rounded-t-lg md:rounded-l-lg md:rounded-tr-none bg-white text-base text-[#595959] focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition shadow-sm"
                  style={{ boxShadow: "0 1px 4px 0 rgba(16,30,54,0.06)" }}
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setHighlightedIndex(-1);
                  }}
                  onFocus={() => setShowResults(true)}
                  onBlur={handleBlur}
                  ref={searchInputRef}
                />
                {/* Loading spinner */}
                {isLoading && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  </div>
                )}
                {/* Clear button */}
                {searchInput && !isLoading && (
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => {
                      setSearchInput("");
                      setSearchResults([]);
                      setResultCount(0);
                      setShowResults(false);
                    }}
                    tabIndex={-1}
                  >
                    <X size={18} />
                  </button>
                )}
                {/* Results Dropdown */}
                {showResults && (searchInput || searchHistory.length > 0) && (
                  <div
                    ref={resultsDropdownRef}
                    className="absolute left-0 top-[110%] w-full bg-white rounded-2xl shadow-2xl z-50 p-2 max-h-[400px] overflow-y-auto animate-fade-in"
                    style={{
                      boxShadow: "0 8px 32px 0 rgba(60,72,88,0.10)",
                      border: "none",
                    }}
                  >
                    {/* Search History */}
                    {searchInput === "" && searchHistory.length > 0 && (
                      <div className="pb-2">
                        <div className="mb-2 font-semibold text-gray-700 text-xs px-2">
                          Recent Searches
                        </div>
                        <div className="flex flex-col gap-1">
                          {searchHistory.map((h, i) => (
                            <div
                              key={h}
                              className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer text-sm"
                              onClick={() => setSearchInput(h)}
                            >
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span>{h}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-gray-100 my-2" />
                      </div>
                    )}
                    {/* Results */}
                    {searchInput && (
                      <div>
                        <div className="px-4 py-2 text-xs text-gray-500 border-b bg-gray-50 rounded-t-2xl">
                          {isLoading
                            ? "Searching..."
                            : resultCount > 0
                            ? `${resultCount} result${
                                resultCount > 1 ? "s" : ""
                              } found`
                            : "No results found"}
                        </div>
                        <div className="flex flex-col gap-2 py-2">
                          {searchResults.map((item, idx) => (
                            <div
                              key={item._id || idx}
                              className={`px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition flex flex-col gap-1 shadow-sm cursor-pointer ${
                                idx === highlightedIndex
                                  ? "ring-2 ring-blue-100"
                                  : ""
                              }`}
                              onMouseEnter={() => setHighlightedIndex(idx)}
                              onClick={() => handleResultSelect(item)}
                            >
                              <div className="font-medium text-gray-900 text-base flex flex-wrap items-center gap-1">
                                {highlightMatch(
                                  item.jobTitle ||
                                    item.name ||
                                    item.username ||
                                    item.headline ||
                                    item.title ||
                                    "Result",
                                  true
                                )}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {highlightMatch(
                                  item.jobDescription ||
                                    item.about ||
                                    item.industry ||
                                    item.overview ||
                                    item.tagline ||
                                    item.locationName ||
                                    item.locationAddress ||
                                    item.skills?.join(", ") ||
                                    "",
                                  true
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        {hasMore && !isLoading && (
                          <button
                            className="w-full py-2 text-blue-600 hover:underline text-xs font-semibold border-t border-gray-100 bg-white rounded-b-2xl"
                            onClick={loadMore}
                          >
                            Load more
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Enhanced Dropdown - Now on the right */}
              <div className="relative md:w-auto w-full" ref={dropdownRef}>
                <button
                  className="h-[44px] md:h-[50px] w-full md:w-auto px-4 pr-3 pl-4 rounded-b-lg md:rounded-r-lg md:rounded-bl-none border border-gray-200 bg-white text-base text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 min-w-[120px] md:min-w-[140px] flex items-center justify-between font-medium shadow-sm"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ borderLeft: "none" }}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">
                      {searchType === "Jobs"}
                      {searchType === "Companies"}
                      {searchType === "Peoples"}
                    </span>
                    <span>{searchType}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-blue-600 transition-transform duration-200 flex-shrink-0 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 w-full bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                    {searchTypes.map((type, index) => (
                      <button
                        key={type}
                        className={`w-full px-4 py-3 text-left transition-colors duration-150 flex items-center gap-3 ${
                          searchType === type
                            ? "bg-blue-50 text-blue-700 font-semibold"
                            : "text-gray-700"
                        } hover:bg-gray-50 ${
                          index !== searchTypes.length - 1
                            ? "border-b border-gray-100"
                            : ""
                        }`}
                        onClick={() => {
                          setSearchType(type);
                          setDropdownOpen(false);
                          searchInputRef.current?.focus();
                        }}
                      >
                        <span className="flex-1">{type}</span>
                        {searchType === type && (
                          <span className="ml-auto text-blue-600 flex-shrink-0">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Icons + Profile */}
          <div className="flex items-center gap-3 md:gap-5 relative ml-auto mr-[-150px] sm:mr-[-150px]">
            {/* Notifications */}
            <div
              ref={notificationIconRef}
              className="relative"
              onMouseEnter={handleNotificationMouseEnter}
              onMouseLeave={handleNotificationMouseLeave}
            >
              <Link to="/notifications">
                <img
                  src={NotificationIcon}
                  alt="Notifications"
                  className="w-5 h-5 md:w-6 md:h-6 text-gray-600 hover:text-blue-600 transition"
                />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] font-semibold px-[6px] py-[4px] rounded-full leading-none">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Notification Preview - hide on small screens */}
            {showPreview && (
              <div
                ref={popupRef}
                className="absolute hidden md:block"
                onMouseEnter={handleNotificationMouseEnter}
                onMouseLeave={handleNotificationMouseLeave}
              >
                <NotificationPopup setShowPreview={setShowPreview} />
              </div>
            )}

            {/* User Avatar */}
            <img
              src={
                mode === "individual"
                  ? currentUser?.profilePicture
                    ? currentUser.profilePicture
                    : "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif"
                  : businessProfile?.orgLogo
                  ? businessProfile?.orgLogo
                  : "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif"
              }
              alt="User"
              className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-gray-300 object-cover cursor-pointer"
              onClick={() => {
                if (mode === "individual") {
                  navigate(`/profile/${currentUser?.username}`);
                } else if (mode === "recruiter") {
                  navigate(`/organization/${businessProfile?._id}`);
                }
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
