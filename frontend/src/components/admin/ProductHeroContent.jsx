import { useEffect, useState } from "react";
import { products } from "../DymiData";
import { FiSearch } from "react-icons/fi";

const ProductHeroContent = ({ setEditShowForm, setEditId }) => {
  const [productData, setProductData] = useState([]);
  const [actionShow, setActionShow] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const localData = JSON.parse(localStorage.getItem("products"));
    if (localData && localData.length > 0) {
      setProductData(localData);
    } else {
      setProductData(products);
    }
  }, []);

  {
    /*----------------------Search, Status,  resertFilter-----------------------------*/
  }
  const filteredData = productData.filter((item) => {
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

  //---------------------------
  //   Delete
  //----------------
  const dataDelet = (id) => {
    const FilterData = productData.filter((item) => item.id !== id);
    setProductData(FilterData);
    setActionShow(null);
  };

  return (
    <div className="mt-7    rounded-xl bg-white shadow-sm pt-5 pb-5">
      {/* Search, Status, Filter */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between w-full pl-5 pr-5 border-b border-gray-300 pb-3">
        <div className="relative ">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Product... "
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl outline-none font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-3 sm:justify-end">
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
            <h1> Reset Filter</h1>
          </div>
        </div>
      </div>

      {/* content Cate */}
      <div className="mt-3">
        <div className="md:grid md:grid-cols-7 bg-white pt-5 pr-5 pl-5 pb-2 font-semibold text-gray-700 border-b  border-gray-300 md:block hidden ">
          <div className="col-span-2 ">
            <h1>Name</h1>
          </div>
          <div>
            <h1>sku</h1>
          </div>
          <div className="">
            <h1>price</h1>
          </div>
          <div className="">
            <h1>stock</h1>
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
              className="grid grid-cols-7 items-center bg-white px-5 py-3 border-b border-gray-300"
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

              {/* sku */}
              <div className="flex ">
                <p>{item.sku}</p>
              </div>
              {/* price */}
              <div className="flex ">
                <p>{item.price}</p>
              </div>

              {/* stock */}
              <div className="flex ">
                <p>{item.stock}</p>
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
                    className="absolute top-5 right-23 w-32 py-1 bg-white rounded-lg shadow-lg border z-50"
                  >
                    <button className="block w-full text-left px-4 py-1 hover:bg-gray-200 hover:rounded-xl">
                      View
                    </button>

                    <button
                      onClick={() => {
                        setEditShowForm(true);
                        setActionShow(null);
                        setEditId(item);
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
          ))}
        </div>

        {/* ==================Mobile Menu================= */}
        <div className="block md:hidden">
          {filteredData.map((item, idx) => (
            <div
              key={idx}
              className="border-b border-gray-300 flex flex-col gap-3 shadow pt-2 p-2"
            >
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
                <h1>sku</h1>
                <p>{item.sku}</p>
              </div>
             <div className="flex items-center justify-between ">
                <h1>price</h1>
                <p>{item.price}</p>
              </div>
              <div className="flex items-center justify-between ">
                <h1>stock</h1>
                <p>{item.stock}</p>
              </div>
              <div className="flex items-center justify-between ">
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
             <div className="flex items-center justify-between ">
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
                    <button className="block w-full text-left px-4 py-1 hover:bg-gray-200 hover:rounded-xl">
                      View
                    </button>

                    <button
                      onClick={() => {
                        setEditShowForm(true);
                        setActionShow(null);
                        setEditId(item);
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductHeroContent;
