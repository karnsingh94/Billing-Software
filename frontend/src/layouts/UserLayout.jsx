import Sidebar from "../components/user/Sidebar";
import Navbar from "../components/user/Navbar";
import { Outlet } from "react-router-dom";
import { useState } from "react";

const UserLayout = () => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-slate-100 min-h-screen">
      {/* Overlay */}
      {showMenu && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        showMenu={showMenu}
        setShowMenu={setShowMenu}
      />

      <div className="md:ml-64">
        {/* Navbar */}
        <Navbar
          showMenu={showMenu}
          setShowMenu={setShowMenu}
        />

        {/* Page Content */}
        <main className="p-6 pt-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;