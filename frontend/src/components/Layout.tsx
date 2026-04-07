import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { SidebarProvider } from "../context/SidebarContext";

const Layout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen grid grid-cols-[auto_1fr] grid-rows-[calc(var(--spacing)_*_16)_1fr]">
        <Navbar />
        <Outlet />
      </div>
    </SidebarProvider>
  );
};

export default Layout;
