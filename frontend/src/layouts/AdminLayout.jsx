import Sidebar from "../components/admin/Sidebar";
import Navbar from "../components/admin/Navbar";
import { Outlet } from "react-router-dom";
import { useState } from "react";

const AdminLayout = () => {
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
      <Sidebar  showMenu={showMenu} setShowMenu={setShowMenu} />

       <div className="md:ml-64">
        <Navbar setShowMenu={setShowMenu}/>

       <main className="p-6 pt-20">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
