import { useEffect, useState } from "react";
import { vendors } from "../DymiData";
import { FiSearch } from "react-icons/fi";

const VendorHeroContent = ({ setEditData, setEdiFormShow }) => {
  const [vendorData, setVendorData] = useState([]);
  const [actionShow, setActionShow] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const localData = JSON.parse(localStorage.getItem("vendors"));

    if (localData && localData.length > 0) {
      setVendorData(localData);
    } else {
      setVendorData(vendors);
    }
  }, []);

  // Delete data
  const dataDelet = (id) => {
    const filterVendor = vendorData.filter((item) => item.id !== id);
    setVendorData(filterVendor);
  };

  const filteredData = vendorData.filter((item) => {
    const searchMatch = item.name.toLowerCase().includes(search.toLowerCase());

    const statusMatch =
      statusFilter === "all"
        ? true
        : item.status.toLowerCase() === statusFilter.toLowerCase();

    return searchMatch && statusMatch;
  });

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

  return (
    <div className="mt-7  rounded-xl bg-white shadow-sm pt-5 pb-5">
      {/* Search, Status, Filter */}
      <div className="md:flex sm:items-center md:justify-between w-full pl-5 pr-5 border-b border-gray-300 pb-3">
        <div className="relative ">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl outline-none font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-3 mt-3 md:mt-0 sm:justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 hover:shadow-md rounded-xl w-40 outline-none px-2 "
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="Inactive">InActive</option>
          </select>

          <div
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
            className="w-32 text-center cursor-pointer rounded-xl px-4 py-2 font-semibold  shadow-sm transition-all duration-200 border border-gray-300 hover:shadow-md active:scale-95"
          >
            <h1>Reset Filter</h1>
          </div>
        </div>
      </div>

      {/* Vendors Contents */}
      <div className="mt-3 hidden md:block">
        {/* heade */}
        <div className="grid grid-cols-8 bg-white pt-5 pr-5 pl-5 pb-2 font-semibold text-gray-700 border-b border-gray-300">
          <h1 className="col-span-2 ">Name</h1>

          <h1 className="text-center pr-20">Company</h1>

          <h1 className="text-center">Email</h1>

          <h1 className="text-center">Phone</h1>

          <h1 className="text-center">Status</h1>

          <h1 className="text-center">Join Date</h1>

          <h1 className="text-center">Action</h1>
        </div>

        {/*----------------- Vendors Content --------------------- */}
        <div>
          {filteredData.map((item, idx) => {
            return (
              <div
                key={idx}
                className="grid grid-cols-8 bg-white pt-2 pr-5 pl-5 pb-2 hover:bg-gray-200 font-semibold text-gray-700 border-b border-gray-300"
              >
                <div className="flex gap-3 items-center  col-span-2  ">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border"
                  />
                  <p className="font-medium text-gray-800 text-sm md:text-base">
                    {item.name}
                  </p>
                </div>

                <div className="flex items-center ">
                  <p className="ml-[-20px] ">{item.company}</p>
                </div>

                <div className="flex items-center justify-center">
                  <p className="text-center">{item.email}</p>
                </div>

                <div className="flex items-center justify-center">
                  <p className="text-center">{item.phone}</p>
                </div>

                <div className="flex items-center justify-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center justify-center">
                  <p className="text-center">{item.joinDate}</p>
                </div>

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
                      className="absolute top-5 right-23 w-32 py-1 bg-white rounded-lg shadow-lg border border-gray-300 z-50"
                    >
                      <button className="block w-full text-left px-4 py-1 hover:bg-gray-200 hover:rounded-xl">
                        View
                      </button>

                      <button
                        onClick={() => {
                          setEdiFormShow(true);
                          setActionShow(null);
                          setEditData(item);
                        }}
                        className="block w-full text-left px-4 py-1 hover:bg-gray-200 hover:rounded-xl"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => dataDelet(item.id)}
                        className="block w-full text-left px-4 py-1 text-red-600 hover:bg-red-100 hover:rounded-xl"
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
      </div>
      {/* ========================Mobile-Menu======================== */}

      <div className="mt-3 md:hidden block">
        {filteredData.map((item, idx) => {
          return (
            <div key={idx} className="flex flex-col gap-3 p-3 border-b border-gray-300 shadow">
              <div className="flex items-center justify-between">
                <h1 className="col-span-2 ">Name</h1>
                <div className="flex gap-3 items-center  col-span-2  ">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border"
                  />
                  <p className="font-medium text-gray-800 text-sm md:text-base">
                    {item.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h1 className="text-center pr-20">Company</h1>
                <p className="ml-[-20px] ">{item.company}</p>
              </div>

              <div className="flex items-center justify-between">
                <h1 className="text-center">Email</h1>
                 <p className="text-center">{item.email}</p>
              </div>
              <div className="flex items-center justify-between">
                 <h1 className="text-center">Phone</h1>
                  <p className="text-center">{item.phone}</p>
              </div>
              <div className="flex items-center justify-between">
                <h1 className="text-center">Status</h1>
                 <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.status}
                  </span>
              </div>
              <div className="flex items-center justify-between">
                 <h1 className="text-center">Join Date</h1>
                 <p className="text-center">{item.joinDate}</p>
              </div>
              <div className="flex items-center justify-between">
              <h1 className="text-center">Action</h1>
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
                      className="absolute top-5 right-10 w-32 py-1 bg-white rounded-lg shadow-lg border border-gray-300 z-50"
                    >
                      <button className="block w-full text-left px-4 py-1 hover:bg-gray-200 hover:rounded-xl">
                        View
                      </button>

                      <button
                        onClick={() => {
                          setEdiFormShow(true);
                          setActionShow(null);
                          setEditData(item);
                        }}
                        className="block w-full text-left px-4 py-1 hover:bg-gray-200 hover:rounded-xl"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => dataDelet(item.id)}
                        className="block w-full text-left px-4 py-1 text-red-600 hover:bg-red-100 hover:rounded-xl"
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
  );
};

export default VendorHeroContent;
