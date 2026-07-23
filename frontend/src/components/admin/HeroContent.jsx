import { useEffect, useState } from "react";
import axios from "axios";

// Dummy data अभी use नहीं हो रहा, इसलिए comment किया है
// import { users } from "../DymiData";

import { FiSearch } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL;

const HeroContent = ({ setEditShowForm, setEditData }) => {
  const [user, setUser] = useState([]);
  const [actionShow, setActionShow] = useState(null);
  const [search, setSearch] = useState("");
  const [datematch, setDatematch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // पुराना localStorage और dummy data वाला code
  // API लगने के बाद use नहीं हो रहा, इसलिए comment किया है
  // =====================================================

  // useEffect(() => {
  //   const localAdmins = JSON.parse(localStorage.getItem("user"));

  //   if (localAdmins && localAdmins.length > 0) {
  //     setUser(localAdmins);
  //   } else {
  //     setUser(users);
  //   }
  // }, []);

  // =====================================================
  // Get All Users API
  // GET: http://localhost:9000/api/v1/auth/users
  // =====================================================

  useEffect(() => {
    const getAllUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("accessToken") ||
          localStorage.getItem("authToken");

        const response = await axios.get(`${API_URL}/auth/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Get Users API Response:", response.data);

        /*
          नीचे अलग-अलग backend response structures को handle किया गया है:

          1. { success: true, users: [...] }
          2. { success: true, data: [...] }
          3. { success: true, data: { users: [...] } }
          4. Direct array [...]
        */

        const usersData =
          response.data?.users ||
          response.data?.data?.users ||
          response.data?.data ||
          response.data;

        if (Array.isArray(usersData)) {
          setUser(usersData);
        } else {
          setUser([]);
          setError("Users data सही format में नहीं मिला");
        }
      } catch (error) {
        console.error("Get Users API Error:", error);

        setError(
          error.response?.data?.message ||
            error.message ||
            "Users fetch करने में error आया"
        );

        setUser([]);

        // API fail होने पर dummy data use करना हो तो इसे uncomment करें
        // setUser(users);
      } finally {
        setLoading(false);
      }
    };

    getAllUsers();
  }, []);

  // ---------------------- Action Show ---------------------- //

  useEffect(() => {
    const handleClick = () => {
      setActionShow(null);
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  // =========================== Delete ===========================

 // =========================== Delete User API ===========================

const DeleteUser = async (id) => {
  try {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken");

    const response = await axios.delete(
      `${API_URL}/auth/user/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Delete User Response:", response.data);

    // API successful होने पर UI update करें
    setUser((prev) => prev.filter((item) => item.id !== id));

    alert(response.data.message || "User deleted successfully");
  } catch (error) {
    console.error("Delete User Error:", error);

    alert(
      error.response?.data?.message ||
        "User delete failed"
    );
  }
};

  // =========================== Search ===========================

  const filteredData = user.filter((item) => {
    const userName = item.fullName || item.name || "";
    const userEmail = item.email || "";
    const userPhone = item.phone || "";

    const createdDate = item.createdAt
      ? new Date(item.createdAt).toISOString().split("T")[0]
      : item.joinDate || "";

    const searchValue = search.toLowerCase();

    const searchMatch =
      userName.toLowerCase().includes(searchValue) ||
      userEmail.toLowerCase().includes(searchValue) ||
      userPhone.toString().includes(search);

    const dateSearch =
      datematch === "" || createdDate === datematch;

    return searchMatch && dateSearch;
  });

  // =========================== Date Format ===========================

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN");
  };

  return (
    <div>
      <div className="mt-7 rounded-xl bg-white shadow-sm pt-5 pb-5">
        {/* Search and Date Filter */}

        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between w-full px-5 border-b border-gray-300 pb-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl outline-none font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex gap-3 sm:justify-end">
            <input
              type="date"
              value={datematch}
              onChange={(e) => setDatematch(e.target.value)}
              className="border border-gray-300 hover:shadow-md rounded-xl w-40 outline-none px-2"
            />

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setDatematch("");
              }}
              className="w-32 cursor-pointer rounded-xl px-4 py-2 font-semibold shadow-sm transition-all duration-200 border border-gray-300 hover:shadow-md active:scale-95"
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* Loading */}

        {loading && (
          <div className="text-center py-10 text-blue-600 font-semibold">
            Users loading...
          </div>
        )}

        {/* Error */}

        {!loading && error && (
          <div className="mx-5 mt-5 p-3 bg-red-100 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {/* No Users */}

        {!loading && !error && filteredData.length === 0 && (
          <div className="text-center py-10 text-gray-500 font-medium">
           
          </div>
        )}

        {!loading && filteredData.length > 0 && (
          <div>
            {/* Desktop Header */}

            <div className="hidden md:grid md:grid-cols-6 bg-white pt-5 px-5 pb-2 font-semibold text-gray-700 border-b border-gray-300">
              <div className="col-span-2">
                <h1>Name</h1>
              </div>

              <div>
                <h1>Email</h1>
              </div>

              <div className="text-center">
                <h1>Phone</h1>
              </div>

              <div className="text-center">
                <h1>Join Date</h1>
              </div>

              <div className="text-center">
                <h1>Actions</h1>
              </div>
            </div>

            {/* Desktop Users List */}

            <div className="hidden md:block">
              {filteredData.map((item, idx) => {
                const userName = item.fullName || item.name || "N/A";

                const userImage =
                  item.image ||
                  item.profileImage ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    userName
                  )}`;

                return (
                  <div
                    key={item.id || idx}
                    className="grid grid-cols-6 items-center bg-white px-5 py-3 border-b border-gray-300"
                  >
                    {/* Name */}

                    <div className="flex items-center gap-3 col-span-2">
                      <img
                        src={userImage}
                        alt={userName}
                        className="w-12 h-12 rounded-full object-cover border"
                      />

                      <p className="font-medium text-gray-800">
                        {userName}
                      </p>
                    </div>

                    {/* Email */}

                    <div className="overflow-hidden">
                      <p className="truncate">{item.email || "N/A"}</p>
                    </div>

                    {/* Phone */}

                    <div className="text-center">
                      <p>{item.phone || "N/A"}</p>
                    </div>

                    {/* Join Date */}

                    <div className="text-center">
                      <p>
                        {formatDate(item.createdAt || item.joinDate)}
                      </p>
                    </div>

                    {/* Actions */}

                    <div className="relative flex justify-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();

                          setActionShow(
                            actionShow === idx ? null : idx
                          );
                        }}
                        className={`w-8 h-8 rounded-full ${
                          actionShow === idx
                            ? "bg-slate-600 text-white"
                            : "hover:bg-slate-200"
                        } text-xl`}
                      >
                        ⋮
                      </button>

                      {actionShow === idx && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-5 right-27 w-32 py-1 bg-white rounded-lg shadow-lg border z-50"
                        >
                          <button
                            type="button"
                            className="block w-full text-left px-4 py-1 hover:bg-gray-200"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditShowForm(true);
                              setActionShow(null);
                              setEditData(item);
                            }}
                            className="block w-full text-left px-4 py-1 hover:bg-gray-200"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              DeleteUser(item.id);
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
                );
              })}
            </div>

            {/* Mobile Users List */}

            <div className="block md:hidden">
              {filteredData.map((item, idx) => {
                const userName = item.fullName || item.name || "N/A";

                const userImage =
                  item.image ||
                  item.profileImage ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    userName
                  )}`;

                return (
                  <div
                    key={item.id || idx}
                    className="flex flex-col gap-3 p-3 border-b border-gray-300"
                  >
                    {/* Name */}

                    <div className="flex items-center justify-between gap-4">
                      <h1 className="font-semibold">Name</h1>

                      <div className="flex items-center gap-3">
                        <img
                          src={userImage}
                          alt={userName}
                          className="w-12 h-12 rounded-full object-cover border"
                        />

                        <p className="font-medium text-gray-800">
                          {userName}
                        </p>
                      </div>
                    </div>

                    {/* Email */}

                    <div className="flex items-center justify-between gap-4">
                      <h1 className="font-semibold">Email</h1>

                      <p className="break-all text-right">
                        {item.email || "N/A"}
                      </p>
                    </div>

                    {/* Phone */}

                    <div className="flex items-center justify-between">
                      <h1 className="font-semibold">Phone</h1>
                      <p>{item.phone || "N/A"}</p>
                    </div>

                    {/* Join Date */}

                    <div className="flex items-center justify-between">
                      <h1 className="font-semibold">Join Date</h1>

                      <p>
                        {formatDate(item.createdAt || item.joinDate)}
                      </p>
                    </div>

                    {/* Actions */}

                    <div className="flex items-center justify-between">
                      <h1 className="font-semibold">Actions</h1>

                      <div className="relative flex justify-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();

                            setActionShow(
                              actionShow === idx ? null : idx
                            );
                          }}
                          className={`w-8 h-8 rounded-full ${
                            actionShow === idx
                              ? "bg-slate-600 text-white"
                              : "hover:bg-slate-200"
                          } text-xl`}
                        >
                          ⋮
                        </button>

                        {actionShow === idx && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-2 right-10 w-32 py-1 bg-white rounded-lg shadow-lg border z-50"
                          >
                            <button
                              type="button"
                              className="block w-full text-left px-4 py-1 hover:bg-gray-200"
                            >
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditShowForm(true);
                                setActionShow(null);
                                setEditData(item);
                              }}
                              className="block w-full text-left px-4 py-1 hover:bg-gray-200"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                DeleteUser(item.id);
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
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroContent;