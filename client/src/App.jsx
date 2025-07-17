import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
  matchPath,
} from "react-router-dom";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { checkAuth } from "./store/features/authSlice";
import { useAuth } from "./hooks/useAuth";
import { Toaster } from "react-hot-toast";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import EmailVerificationPage from "./pages/auth/EmailVerificationPage";
import ForgotPassword from "./pages/auth/ForgetPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import JobPage from "./pages/user/jobs/JobPage";
import RecruitmentPage from "./pages/recuriter/recuritement/recuritmentPage/RecuritementPage";
import CreateJob from "./pages/recuriter/recuritement/recuritmentPage/CreateJob";
import LandingPage from "./pages/LandingPage";
import Sidebar from "./components/SideBar";
import OnboardingPage from "./pages/user/onboarding/OnboardingPage";
import ProfilePage from "./pages/user/profilePage/ProfilePage";
import Header from "./components/Header";
import ProtectedRoute from "./protectedRoute/ProtectedRoutes";
import OrganizationProfile from "./pages/recuriter/origanizationProfile/OrganizationProfile";
import Messages from "./pages/user/messages/MessagesPage";
import MessagesRecuriter from "./pages/recuriter/messages/MessagesPage";
import JobDetails from "./pages/user/jobs/components/JobDetails";
import OnboardingRecruiter from "./pages/recuriter/onBoarding/Onboarding";
import NotificationPage from "./pages/notification/NotificationsPage";
import Applicants from "./pages/recuriter/recuritement/recuritmentPage/Applicants";
import AppliedJob from "./pages/user/jobs/AppliedJobsPage";
import SavedJobs from "./pages/user/jobs/SavedJobsPage";
import HiddenJobs from "./pages/user/jobs/HiddenJobsPage";
import Settings from "./pages/settings/Settings";
import SearchResults from "./pages/SearchResults";
import PublicJobPage from "./pages/user/jobs/PublicJobPage";

function AppRoutes() {
  const {
    isAuthenticated,
    currentUser,
    needsOnboarding,
    needsRecruiterOnboarding,
    mode,
  } = useAuth();
  const location = useLocation();
  const noSidebarOffsetRoutes = ["/jobs", "/settings"];
  const isNoSidebarOffset =
    noSidebarOffsetRoutes.some((route) =>
      location.pathname.startsWith(route)
    ) || /^\/jobs\/[\w-]+$/.test(location.pathname);
  const isJobDetailsOpen = !!matchPath("/jobs/:jobId", location.pathname);

  return isAuthenticated ? (
    // Handle onboarding routes
    needsOnboarding ? (
      <Routes>
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute role="individual">
              <OnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/onboarding" />} />
      </Routes>
    ) : needsRecruiterOnboarding ? (
      <Routes>
        <Route
          path="/onboarding-recruiter"
          element={
            <ProtectedRoute role="recruiter">
              <OnboardingRecruiter />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/onboarding-recruiter" />} />
      </Routes>
    ) : (
      <div
        className={
          "flex" +
          (isJobDetailsOpen ? " blur-sm pointer-events-none select-none" : "")
        }
      >
        <Sidebar />
        <div
          className="flex-1 min-h-screen"
          style={isNoSidebarOffset ? {} : { marginLeft: "18vw" }}
        >
          <Header />
          <Routes>
            {/* Shared Authenticated Routes */}
            {/* <Route path="/" element={<HomePage />} /> */}
            <Route
              path="/profile/:username"
              element={
                <ProtectedRoute role={["recruiter", "individual"]}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organization/:orgname"
              element={
                <ProtectedRoute role={["recruiter", "individual"]}>
                  <OrganizationProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute role={["recruiter", "individual"]}>
                  <NotificationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute role={["recruiter", "individual"]}>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route path="/search" element={<SearchResults />} />

            {/* Individual User Routes */}
            <Route
              path="/jobs"
              element={
                <ProtectedRoute role="individual">
                  {" "}
                  <JobPage />{" "}
                </ProtectedRoute>
              }
            >
              <Route
                path=":jobId"
                element={
                  <ProtectedRoute role="individual">
                    <JobDetails />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route
              path="/appliedJobs"
              element={
                <ProtectedRoute role="individual">
                  <AppliedJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/savedJobs"
              element={
                <ProtectedRoute role="individual">
                  <SavedJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hiddenJobs"
              element={
                <ProtectedRoute role="individual">
                  <HiddenJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute role="individual">
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages/:conversationId"
              element={
                <ProtectedRoute role="individual">
                  <Messages />
                </ProtectedRoute>
              }
            />

            {/* Recruiter Routes */}
            <Route
              path="/recruitment"
              element={
                <ProtectedRoute role="recruiter">
                  <RecruitmentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruitment/create"
              element={
                <ProtectedRoute role="recruiter">
                  <CreateJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recruitment/:jobId/applicants"
              element={
                <ProtectedRoute role="recruiter">
                  <Applicants />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organization/messages"
              element={
                <ProtectedRoute role="recruiter">
                  <MessagesRecuriter />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organization/messages/:conversationId"
              element={
                <ProtectedRoute role="recruiter">
                  <MessagesRecuriter />
                </ProtectedRoute>
              }
            />

            {/* Catch all for unknown authenticated routes */}
            <Route
              path="*"
              element={
                <Navigate
                  to={mode === "individual" ? "/jobs" : "/recruitment"}
                />
              }
            />
          </Routes>
        </div>
      </div>
    )
  ) : (
    // Public Routes
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/verify-email" element={<EmailVerificationPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/jobs/:jobId" element={<PublicJobPage />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  const dispatch = useDispatch();
  const { authChecked } = useAuth();

  useEffect(() => {
    // Check for token in URL parameters (Google auth fallback)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get("token");

    if (tokenFromUrl) {
      // Store token in localStorage
      localStorage.setItem("jwt-mesdo-token", tokenFromUrl);
      console.log("Token extracted from URL and stored in localStorage");

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    dispatch(checkAuth());
  }, [dispatch]);

  if (!authChecked) {
    return (
      <div className="flex flex-row gap-2 h-screen w-full justify-center items-center">
        <div className="w-4 h-4 rounded-full bg-[#198FFF] animate-bounce [animation-delay:.7s]" />
        <div className="w-4 h-4 rounded-full bg-[#198FFF] animate-bounce [animation-delay:.3s]" />
        <div className="w-4 h-4 rounded-full bg-[#198FFF] animate-bounce [animation-delay:.7s]" />
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <AppRoutes />
    </Router>
  );
}

export default App;
