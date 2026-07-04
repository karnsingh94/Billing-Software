import { Navigate, NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaStore,
  FaChartLine,
  FaUsers,
  FaUserFriends,
  FaCog,
  FaBox,
  FaFileInvoice,
  FaBell,
} from "react-icons/fa";
import { X } from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    path: "/super-admin/dashboard",
    icon: <FaHome className="text-xl" />,
  },
  {
    name: "Vendors",
    path: "/super-admin/vendors",
    icon: <FaStore className="text-xl" />,
  },
  {
    name: "Reports",
    path: "/super-admin/reports",
    icon: <FaChartLine className="text-xl" />,
  },
  {
    name: "All-Admin",
    path: "/super-admin/all-admin",
    icon: <FaUsers className="text-xl" />,
  },
  {
    name: "All-User",
    path: "/super-admin/all-user",
    icon: <FaUserFriends className="text-xl" />,
  },
  // {
  //   name: "Settings",
  //   path: "/super-admin/settings",
  //   icon: <FaCog className="text-xl" />
  // },
];

const Sidebar = ({ showMenu, setShowMenu }) => {
  const navigate = useNavigate()
  return (
    <aside
      className={`fixed left-0 top-0 w-64 h-screen bg-slate-900 text-white shadow-xl z-50
  ${showMenu ? "translate-x-0" : "-translate-x-full"}
  md:translate-x-0 transition-transform duration-300 flex flex-col`}
    >
      {/* Logo */}
       <div className="p-4 border-b border-slate-700 flex items-center justify-between ">
        <h1 onClick={()=>{navigate("/super-admin/dashboard")
          setShowMenu(false)
        }} className="text-2xl font-semibold">Super admin </h1>
        <h1
          className={`md:hidden cursor-pointer`}
          onClick={() => setShowMenu(false)}
        >
          <X />
        </h1>
      </div>

      {/* Menu */}
      <ul className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => (
          <li key={item.name}>
            <NavLink
              to={item.path}
              onClick={()=>setShowMenu(false)}
              className={({ isActive }) =>
                `group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>

              <span className="font-medium">{item.name}</span>

              {/* {item.name === "Reports" && (
            <span className="ml-auto bg-red-500 px-2 py-0.5 text-xs rounded-full">
              New
            </span>
          )} */}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Footer */}
      {/* <div className="p-4 border-t border-slate-700">
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition cursor-pointer">

      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
        <span className="font-bold text-sm">SA</span>
      </div>

      <div className="flex-1">
        <p className="font-semibold text-sm">
          Super Admin
        </p>
        <p className="text-xs text-slate-400">
          admin@billing.com
        </p>
      </div>

      <FaCog className="text-slate-400 hover:text-white transition" />
    </div>
  </div> */}
    </aside>
  );
};

export default Sidebar;
