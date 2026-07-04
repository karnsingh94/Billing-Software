import { Outlet } from "react-router-dom";
import Sidebar from "../components/super-admin/Sidebar";
import Navbar from "../components/super-admin/Navbar";
import { useState } from "react";

const SuperAdminLayout = () => {
  const [showMenu, setShowMenu] = useState(false)
  return (
    <div className="bg-slate-100 min-h-screen">

       {/* Overlay */}
      {showMenu && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowMenu(false)}
        />
      )}

      <Sidebar showMenu={showMenu}  setShowMenu={setShowMenu} />

        <div className="md:ml-64">

        <Navbar setShowMenu={setShowMenu} />

       <main className="p-6 pt-20">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

export default SuperAdminLayout;