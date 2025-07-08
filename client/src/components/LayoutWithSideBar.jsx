import { Outlet, useLocation, matchPath } from "react-router-dom";
import Sidebar from "./SideBar";

function LayoutWithSidebar() {
  const location = useLocation();
  const isJobDetailsOpen = !!matchPath("/jobs/:jobId", location.pathname);
  return (
    <div
      className={
        isJobDetailsOpen ? "blur-sm pointer-events-none select-none" : ""
      }
    >
      <Sidebar />
      <Outlet />
    </div>
  );
}

export default LayoutWithSidebar;
