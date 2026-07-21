import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL;

const HeroContent = ({ setEditShowForm, setEditData }) => {
  const [admin, setAdmin] = useState([]);
  const [actionShow, setActionShow] = useState(null);
  const [search, setSearch] = useState("");

  // ================= Fetch Admins =================
  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${API_URL}/auth/admins`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch admins");
      }

      setAdmin(data.admins || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // ================= Delete =================
  const DeleteAdmin = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/admin/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      alert(data.message);

      // Refresh list
      fetchAdmins();

    } catch (error) {
      alert(error.message);
    }
  };

  // ================= Search =================
  const filteredData = admin.filter((item) =>
    item.fullName.toLowerCase().includes(search.toLowerCase())
  );

  // ================= Close Action Menu =================
  useEffect(() => {
    const handleClick = () => {
      setActionShow(null);
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div className="mt-7 rounded-xl bg-white shadow-sm pt-5 pb-5">
      {/* Search */}
      <div className="w-full pl-5 pr-5 border-b border-gray-300 pb-3">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search admin..."
            className="w-full md:w-110 pl-10 pr-4 py-2 border border-gray-300 rounded-xl outline-none font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Desktop */}
      {/* Desktop */}
      <div className="mt-3 hidden md:block">
        {/* Table Header */}
        <div className="grid grid-cols-6 bg-white pt-5 pr-5 pl-5 pb-2 font-semibold text-gray-700 border-b border-gray-300">
          <div className="col-span-2">
            <h1>Name</h1>
          </div>

          <div>
            <h1 className="pl-10">Email</h1>
          </div>

          <div className="text-center">
            <h1>Location</h1>
          </div>

          <div className="text-center">
            <h1>Join Date</h1>
          </div>

          <div className="text-center">
            <h1>Action</h1>
          </div>
        </div>

        {/* Table Body */}
        {filteredData.map((item, idx) => (
          <div
            key={item.id}
            className="grid grid-cols-6 items-center bg-white px-5 py-3 border-b border-gray-300"
          >
            {/* Name */}
            <div className="flex items-center gap-3 col-span-2">
              {/* Uncomment if image exists */}
              {/*
        <img
          src={`https://ui-avatars.com/api/?name=${item.fullName}`}
          alt={item.fullName}
          className="w-12 h-12 rounded-full border"
        />
        */}

              <p className="font-medium text-gray-800">
                {item.fullName}
              </p>
            </div>

            {/* Email */}
            <div>
              <p>{item.email}</p>
            </div>

            {/* Location */}
            <div className="text-center">
              <p>{item.location}</p>
            </div>

            {/* Join Date */}
            <div className="text-center">
              <p>
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Action */}
            <div className="relative flex justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActionShow(actionShow === idx ? null : idx);
                }}
                className={`w-8 h-8 rounded-full ${actionShow === idx
                  ? "bg-slate-600 text-white"
                  : "hover:bg-slate-200"
                  } text-xl`}
              >
                ⋮
              </button>

              {actionShow === idx && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-5 right-30 w-32 py-1 bg-white rounded-lg shadow-lg border border-gray-300 z-50"
                >
                  {/* <button className="block w-full text-left px-4 py-1 hover:bg-gray-200">
                    View
                  </button> */}

                  <button
                    onClick={() => {
                      setEditShowForm(true);
                      setEditData(item);
                      setActionShow(null);
                    }}
                    className="block w-full text-left px-4 py-1 hover:bg-gray-200"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => {
                      DeleteAdmin(item.id);
                      setActionShow(null);
                    }}
                    className="block w-full text-left px-4 py-1 text-red-600 hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile */}
      {/* Mobile */}
      <div className="block md:hidden">
        {filteredData.map((item, idx) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 p-4 border-b border-gray-300 bg-white"
          >
            {/* Name */}
            <div className="flex justify-between items-center">
              <h1 className="font-semibold text-gray-700">Name</h1>

              <div className="flex items-center gap-3">
                <img
                  src={`https://ui-avatars.com/api/?name=${item.fullName}`}
                  alt={item.fullName}
                  className="w-12 h-12 rounded-full border"
                />

                <p className="font-medium text-gray-800">
                  {item.fullName}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex justify-between items-center">
              <h1 className="font-semibold text-gray-700">Email</h1>

              <p className="text-gray-600 break-all">
                {item.email}
              </p>
            </div>

            {/* Location */}
            <div className="flex justify-between items-center">
              <h1 className="font-semibold text-gray-700">Location</h1>

              <p className="text-gray-600">
                {item.location}
              </p>
            </div>

            {/* Join Date */}
            <div className="flex justify-between items-center">
              <h1 className="font-semibold text-gray-700">Join Date</h1>

              <p className="text-gray-600">
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Action */}
            <div className="flex justify-between items-center">
              <h1 className="font-semibold text-gray-700">Action</h1>

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActionShow(actionShow === idx ? null : idx);
                  }}
                  className={`w-8 h-8 rounded-full ${actionShow === idx
                    ? "bg-slate-600 text-white"
                    : "hover:bg-slate-200"
                    } text-xl`}
                >
                  ⋮
                </button>

                {actionShow === idx && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-10 w-32 py-1 bg-white rounded-lg shadow-lg border border-gray-300 z-50"
                  >
                    {/* <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                      View
                    </button> */}

                    <button
                      onClick={() => {
                        setEditShowForm(true);
                        setEditData(item);
                        setActionShow(null);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        DeleteAdmin(item.id);
                        setActionShow(null);
                      }}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroContent;