import { useEffect, useState } from "react";
import { users } from "../DymiData";
import { FiSearch } from "react-icons/fi";

const HeroContent = ({ setEditShowForm, setEditData }) => {
  const [user, setUser] = useState([]);
  const [actionShow, setActionShow] = useState(null);
  const [search, setSearch] = useState("");
  const [datematch, setDatematch] = useState("");

  useEffect(() => {
    const localAdmins = JSON.parse(localStorage.getItem("user"));

    if (localAdmins && localAdmins.length > 0) {
      setUser(localAdmins);
    } else {
      setUser(users);
    }
  }, []);

  // -----------------------------Action Show------------------------//
  useEffect(() => {
    const handleClick = () => {
      setActionShow(null);
    };
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  // ===========================delete=====================
  const DeleteUser = (id) => {
    const filterData = user.filter((item) => item.id !== id);
    setUser(filterData);
    localStorage.setItem("user", JSON.stringify(filterData));
  };

  

  {
    /*----------------------Search, Status,  resertFilter-----------------------------*/
  }
  const filteredData = user.filter((item) => {
    const searchMatch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase()) ||
      item.phone.includes(search);

    const dateSearch = datematch === "" || item.joinDate === datematch;

    return searchMatch && dateSearch;
  });

  return (
    <div>
   
      <div className="mt-7    rounded-xl bg-white shadow-sm pt-5 pb-5">
        {/* Search, Status, Filter */}
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between w-full pl-5 pr-5 border-b border-gray-300 pb-3 ">
          <div className="relative ">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search category..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl outline-none font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-3 sm:justify-end ">
            <input
              type="date"
              value={datematch}
              onChange={(e) => setDatematch(e.target.value)}
              className="border border-gray-300 hover:shadow-md rounded-xl w-40 outline-none px-2 "
            />

            <div
              onClick={() => {
                setSearch("");
                setDatematch("");
              }}
              className="w-32 sm:text-center cursor-pointer rounded-xl sm:x-2 px-4 py-2 font-semibold  shadow-sm transition-all duration-200 border border-gray-300 hover:shadow-md active:scale-95"
            >
              <h1>Reset Filter</h1>
            </div>
          </div>
        </div>

        <div>
          <div className="md:grid md:grid-cols-6 bg-white pt-5 pr-5 pl-5 pb-2 font-semibold text-gray-700 border-b  border-gray-300 hidden md:block">
            <div className="col-span-2 ">
              <h1>Name</h1>
            </div>
            <div className="pl-8">
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

          {/* hujk */}
          <div className="hidden md:block">
            {filteredData.map((item, idx) => (
              <div
                key={item.id}
                className="grid grid-cols-6 items-center bg-white px-5 py-3 border-b border-gray-300"
              >
                {/* Category */}
                <div className="flex items-center gap-3 col-span-2">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover border"
                  />
                  <p className="font-medium text-gray-800">{item.name}</p>
                </div>

                {/* email */}
                <div className="flex p">
                  <p>{item.email}</p>
                </div>

                {/* Phone */}
                <div className="flex pl-10">
                  <p>{item.phone}</p>
                </div>

                {/*Join Date */}
                <div className="flex pl-10">
                  <p>{item.joinDate}</p>
                </div>

                {/* Action */}
                <div className="relative flex justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActionShow(actionShow === idx ? null : idx);
                    }}
                    className={`w-8 h-8 rounded-full  ${
                      actionShow === idx
                        ? "bg-slate-600 text-white "
                        : "hover:bg-slate-200"
                    } text-xl`}
                  >
                    ⋮
                  </button>

                  {actionShow === idx && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-5 right-30 w-32 py-1 bg-white rounded-lg shadow-lg border z-50"
                    >
                      <button className="block w-full text-left px-4 py-1 hover:bg-gray-200">
                        View
                      </button>

                      <button
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
                        onClick={() => {
                          DeleteUser(item.id);
                          setActionShow(null);
                        }}
                        className="block w-full text-left px-4 py-1 text-red-600 hover:bg-red-100 "
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* end */}
        </div>
        {/* =====================Mobile-Menu======================= */}
        <div className="bock md:hidden">
          {filteredData.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-3 p-3 border-b border-gray-300">
              <div className="flex items-center justify-between ">
                <h1>Name</h1>
                 <div className="flex items-center gap-3 col-span-2">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover border"
                  />
                  <p className="font-medium text-gray-800">{item.name}</p>
                </div>
              </div>
            <div className="flex items-center justify-between ">
                <h1>Email</h1>
                 <p>{item.email}</p>
              </div>
              <div className="flex items-center justify-between ">
                <h1>Phone</h1>
                 <p>{item.phone}</p>
              </div>
              <div className="flex items-center justify-between ">
                <h1>Join Date</h1>
                 <p>{item.joinDate}</p>
              </div>
              <div className="flex items-center justify-between ">
                <h1>Actions</h1>
                {/* Action */}
                <div className="relative flex justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActionShow(actionShow === idx ? null : idx);
                    }}
                    className={`w-8 h-8 rounded-full  ${
                      actionShow === idx
                        ? "bg-slate-600 text-white "
                        : "hover:bg-slate-200"
                    } text-xl`}
                  >
                    ⋮
                  </button>

                  {actionShow === idx && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-5 right-10 w-32 py-1 bg-white rounded-lg shadow-lg border z-50"
                    >
                      <button className="block w-full text-left px-4 py-1 hover:bg-gray-200">
                        View
                      </button>

                      <button
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
                        onClick={() => {
                          DeleteUser(item.id);
                          setActionShow(null);
                        }}
                        className="block w-full text-left px-4 py-1 text-red-600 hover:bg-red-100 "
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
    </div>
  );
};

export default HeroContent;
