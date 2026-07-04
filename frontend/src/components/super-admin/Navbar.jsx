import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { Menu } from "lucide-react";

const Navbar = ({setShowMenu}) => {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const profileRef = useRef(null);

  const logout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
   <header className="fixed top-0 md:left-64 left-0  right-0 h-16 bg-white shadow-md z-40 px-2 md:px-6 flex items-center justify-between">
       <h2 className="text-xl font-bold text-slate-800"><Menu onClick={()=>setShowMenu(true)}  className="md:hidden"/></h2>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-base font-semibold text-slate-800">AdminMan</p>
          <p className="text-xs text-slate-500">Super Admin</p>
        </div>

        <div ref={profileRef} className="relative">
          <div
            onClick={() => setShowProfile(!showProfile)}
            className="w-8 h-8 rounded-full bg-gray-400 cursor-pointer"
          ></div>

          {showProfile && (
            <div className="absolute top-12 right-0 border border-gray-300 w-40 py-1 bg-white shadow rounded-lg">
              <p onClick={()=>{navigate("/super-admin/Profile")
                setShowProfile(!showProfile)
              }} className="flex items-center gap-2 px-5 text-gray-700 py-2 hover:bg-gray-100 cursor-pointer">
                <FaUserCircle />
                Profile
              </p>

              <p
                onClick={logout}
                className="flex items-center gap-2 px-5 text-gray-700 py-2 hover:bg-red-50 cursor-pointer"
              >
                <FiLogOut />
                Logout
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
