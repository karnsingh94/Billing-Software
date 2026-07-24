import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FiSearch, FiMoreVertical } from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL;

const AdminUsers = () => {
  const { adminId } = useParams();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `${API_URL}/auth/admin/${adminId}/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      // if backend returns { users: [...] }
      const allUsers = data.users || [];

      setUsers(allUsers);
      setSearch(allUsers);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();

    if (!value) {
      setSearch(users);
      return;
    }

    const filtered = users.filter(
      (user) =>
        user.fullName
          ?.toLowerCase()
          .includes(value) ||
        user.email
          ?.toLowerCase()
          .includes(value)
    );

    setSearch(filtered);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <div className="bg-white rounded-xl shadow">

        {/* Search */}

        <div className="p-6 border-b">

          <div className="relative w-full md:w-1/2">

            <FiSearch className="absolute left-4 top-4 text-gray-400 text-xl" />

            <input
              type="text"
              placeholder="Search user..."
              onChange={handleSearch}
              className="w-full border rounded-xl py-3 pl-12 pr-4 outline-none"
            />

          </div>

        </div>

        {/* Table */}

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="border-b">

              <tr className="text-gray-700">

                <th className="py-5 text-left px-6">
                  Name
                </th>

                <th className="py-5 text-left">
                  Email
                </th>

                <th className="py-5 text-left">
                  Phone
                </th>

                <th className="py-5 text-left">
                  Location
                </th>

                <th className="py-5 text-left">
                  Join Date
                </th>

                <th className="py-5 text-center">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {search.length > 0 ? (
                search.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-5 px-6">
                      {user.fullName}
                    </td>

                    <td>{user.email}</td>

                    <td>{user.phone}</td>

                    <td>{user.location}</td>

                    <td>
                      {new Date(
                        user.createdAt
                      ).toLocaleDateString("en-GB")}
                    </td>

                    <td className="text-center">
                      <button>
                        <FiMoreVertical className="text-xl" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-10 text-gray-500"
                  >
                    No Users Found
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default AdminUsers;