import { NavLink, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaListAlt,
  FaBoxOpen,
  FaChartBar,
  FaUserTie,
  FaCog,
  FaHome,
} from "react-icons/fa";
import { X } from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: <FaHome className="text-xl" />,
  },
  {
    name: "User",
    path: "/admin/user",
    icon: <FaUsers />,
  },
  // {
  //   name: "Categories",
  //   path: "/admin/categories",
  //   icon: <FaListAlt />,
  // },
  {
    name: "Products",
    path: "/admin/products",
    icon: <FaBoxOpen />,
  },
  {
    name: "Reports",
    path: "/admin/reports",
    icon: <FaChartBar />,
  },
  // {
  //   name: "Staffs",
  //   path: "/admin/staffs",
  //   icon: <FaUserTie />,
  // },
  // {
  //   name: "Settings",
  //   path: "/admin/settings",
  //   icon: <FaCog />,
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
      <div className="p-4 border-b border-slate-700 flex items-center justify-between ">
        <h1 onClick={()=>{navigate("/admin/dashboard")
           setShowMenu(false)
        }} className="text-xl font-bold">Admin BillingPro</h1>
        <h1
          className={`md:hidden cursor-pointer`}
          onClick={() => setShowMenu(false)}
        >
          <X />
        </h1>
      </div>

      <ul className="p-4 space-y-2">
        {menuItems.map((item) => (
          <li key={item.name}>
            <NavLink
              to={item.path}
              onClick={() => setShowMenu(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg transition ${
                  isActive ? "bg-blue-600" : "hover:bg-slate-800"
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
