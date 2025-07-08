// components/MainLayout.jsx
import { Outlet, useLocation, matchPath } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./SideBar";

const MainLayout = () => {
  const location = useLocation();
  // Check if JobDetails is open by matching /jobs/:jobId
  const isJobDetailsOpen = !!matchPath("/jobs/:jobId", location.pathname);
  return (
    <div className="flex min-h-screen">
      {/* Overlay for blur and pointer disabling */}
      {isJobDetailsOpen && (
        <div
          className="fixed inset-0 z-[100] bg-white/40 backdrop-blur-sm transition-all duration-200"
          style={{ pointerEvents: "auto" }}
        />
      )}
      <Sidebar
        className={isJobDetailsOpen ? "pointer-events-none select-none" : ""}
      />
      <div className="flex-1 flex flex-col">
        <Header
          className={isJobDetailsOpen ? "pointer-events-none select-none" : ""}
        />
        <main className="p-4 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
