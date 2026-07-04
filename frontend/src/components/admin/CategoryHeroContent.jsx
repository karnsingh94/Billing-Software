import { useEffect, useState } from "react";
import { categories } from "../DymiData";
import { FiSearch } from "react-icons/fi";

const CategoryHeroContent = ({ setCatEditFormShow, seteditData }) => {
  const [categoryData, setCategoryData] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionShow, setActionShow] = useState(null);

  useEffect(() => {
    const localCategory = JSON.parse(localStorage.getItem("category"));

    if (localCategory && localCategory.length > 0) {
      setCategoryData(localCategory);
    } else {
      setCategoryData(categories);
    }
  }, []);

  //---------------------------
  //   Delete
  //----------------
  const dataDelet = (id) => {
    const FilterData = categoryData.filter((item) => item.id !== id);
    setCategoryData(FilterData);
    setActionShow(null);
  };

  {
    /*----------------------Search, Status,  resertFilter-----------------------------*/
  }
  const filteredData = categoryData.filter((item) => {
    const searchMatch = item.name.toLowerCase().includes(search.toLowerCase());

    const statusMatch =
      statusFilter === "all"
        ? true
        : item.status.toLowerCase() === statusFilter.toLowerCase();
    return searchMatch && statusMatch;
  });

  // -----------------------------Action Show------------------------
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
            className="w-32 sm:text-center cursor-pointer rounded-xl sm:x-2 px-4 py-2 font-semibold  shadow-sm transition-all duration-200 border border-gray-300 hover:shadow-md active:scale-95"
          >
            <h1>Reset Filter</h1>
          </div>
        </div>
      </div>

      {/* content Cate */}
      <div className="mt-3">
        <div className="md:grid md:grid-cols-5 bg-white pt-5 pr-5 pl-5 pb-2 font-semibold text-gray-700 border-b  border-gray-300 hidden md:block">
          <div className="col-span-2 ">
            <h1>Name</h1>
          </div>
          <div>
            <h1>totalProducts</h1>
          </div>
          <div className="text-center">
            <h1>status</h1>
          </div>
          <div className="text-center">
            <h1>Action</h1>
          </div>
        </div>

        <div className="hidden md:block">
          {filteredData.map((item, idx) => (
            <div
              key={item.id}
              className="grid grid-cols-5 items-center bg-white px-5 py-3 border-b border-gray-300"
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

              {/* Products */}
              <div className="flex pl-10">
                <p>{item.totalProducts}</p>
              </div>

              {/* Status */}
              <div className="flex justify-center">
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
                        setCatEditFormShow(true);
                        setActionShow(null);
                        seteditData(item);
                      }}
                      className="block w-full text-left px-4 py-1 hover:bg-gray-200"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => dataDelet(item.id)}
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

        {/* ==============Mobile Menu========== */}

        <div className="block md:hidden">
          {filteredData.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-3 p-2 border-b border-gray-300 shadow">
              <div className="flex items-center gap-3 justify-between   ">
                <h1>Name</h1>
                <div className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover border"
                  />
                  <p className="font-medium text-gray-800">{item.name}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <h1>totalProducts</h1>
                 <p>{item.totalProducts}</p>
              </div>
              <div className="flex items-center justify-between">
                <h1>status</h1>
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
                <h1>Action</h1>

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
                        setCatEditFormShow(true);
                        setActionShow(null);
                        seteditData(item);
                      }}
                      className="block w-full text-left px-4 py-1 hover:bg-gray-200"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => dataDelet(item.id)}
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

export default CategoryHeroContent;
