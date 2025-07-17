import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../store/features/authSlice";

export const useAuth = () => {
  const dispatch = useDispatch();
  const {
    isAuthenticated,
    currentUser,
    authChecked,
    loading,
    error,
    mode,
    businessProfile,
  } = useSelector((state) => state.auth);

  const logout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      // Force a page reload to clear any cached state
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, clear local state and redirect
      window.location.href = "/";
    }
  };

  return {
    isAuthenticated,
    currentUser,
    authChecked,
    loading,
    error,
    mode,
    businessProfile,
    logout,
    // Helper methods
    isIndividual: mode === "individual",
    isRecruiter: mode === "recruiter",
    needsOnboarding: mode === "individual" && !currentUser?.onboardingCompleted,
    needsRecruiterOnboarding:
      mode === "recruiter" && !currentUser?.recruiterOnboardingCompleted,
  };
};
