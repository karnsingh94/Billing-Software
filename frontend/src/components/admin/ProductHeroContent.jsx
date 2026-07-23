
import { useEffect, useState } from "react";
import axios from "axios";
import { FiSearch } from "react-icons/fi";

// Purana dummy data import delete nahi kiya
// import { products } from "../DymiData";

const API_URL = import.meta.env.VITE_API_URL;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ProductHeroContent = ({ setEditShowForm, setEditId }) => {
  const [productData, setProductData] = useState([]);
  const [actionShow, setActionShow] = useState(null);
  const [search, setSearch] = useState("");

  // Backend me status field nahi hai
  // const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  // ---------------- Get Products API ----------------
  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        setApiError("");

        const token = localStorage.getItem("accessToken");

        const response = await axios.get(
          `${API_URL}/products/get-products`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Get Products Response:", response.data);

  
        const productsList =
          response.data?.products ||
          response.data?.data?.products ||
          response.data?.data ||
          response.data ||
          [];

        setProductData(
          Array.isArray(productsList) ? productsList : []
        );
      } catch (error) {
        console.error(
          "Get Products Error:",
          error.response?.data || error.message
        );

        setApiError(
          error.response?.data?.message ||
            "Products load nahi hue"
        );

       
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  // ---------------- Search Filter ----------------
  const filteredData = productData.filter((item) => {
    const productName = item.productName || "";

    const searchMatch = productName
      .toLowerCase()
      .includes(search.toLowerCase());

    /*
      Backend me status field nahi hai,
      isliye status filter comment kiya hai.

      const statusMatch =
        statusFilter === "all"
          ? true
          : item.status
              ?.toLowerCase()
              .includes(statusFilter.toLowerCase());

      return searchMatch && statusMatch;
    */

    return searchMatch;
  });

  // ---------------- Action Show ----------------
  useEffect(() => {
    const handleClick = () => {
      setActionShow(null);
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  // ---------------- Delete ----------------
 // ---------------- Delete ----------------
const dataDelet = async (id) => {
  try {
    const token = localStorage.getItem("accessToken");

    const response = await axios.delete(
      `${API_URL}/products/delete-product/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Delete Product:", response.data);

    // API success hone ke baad state update
    const filterData = productData.filter(
      (item) => item.id !== id
    );

    setProductData(filterData);
    setActionShow(null);

    /*
      Purana frontend delete code
      delete nahi kiya,
      sirf comment kiya hai.

      const filterData = productData.filter(
        (item) => item.id !== id
      );

      setProductData(filterData);
      setActionShow(null);
    */
  } catch (error) {
    console.error(
      "Delete Product Error:",
      error.response?.data || error.message
    );

    alert(
      error.response?.data?.message ||
        "Product delete nahi hua."
    );
  }
};

  return (
    <div className="mt-7 rounded-xl bg-white pt-5 pb-5 shadow-sm">
      {/* Search and Reset Filter */}
      <div className="flex w-full flex-col gap-3 border-b border-gray-300 pr-5 pb-3 pl-5 md:flex-row md:items-center md:justify-between">
        <div className="relative">
          <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-lg text-gray-400" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Product..."
            className="w-full rounded-xl border border-gray-300 py-2 pr-4 pl-10 font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-3 sm:justify-end">
          {/*
            Backend me status nahi hai,
            isliye status select delete nahi kiya,
            sirf comment kiya hai.

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="w-40 rounded-xl border border-gray-300 px-2 outline-none hover:shadow-md"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          */}

          <button
            type="button"
            onClick={() => {
              setSearch("");

              // Backend me status field nahi hai
              // setStatusFilter("all");
            }}
            className="w-32 cursor-pointer rounded-xl border border-gray-300 px-4 py-2 text-center font-semibold shadow-sm transition-all duration-200 hover:shadow-md active:scale-95"
          >
            Reset Filter
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

          <p className="ml-3 font-medium text-gray-600">
            Products loading...
          </p>
        </div>
      )}

      {/* API Error */}
      {!loading && apiError && (
        <div className="px-5 py-8 text-center">
          <p className="font-medium text-red-500">
            {apiError}
          </p>
        </div>
      )}

      {/* Product Content */}
      {!loading && !apiError && (
        
<div className="mt-3">
  {/* Desktop Table Heading */}
  <div className="hidden grid-cols-7 border-b border-gray-300 bg-white pt-5 pr-5 pb-2 pl-5 font-semibold text-gray-700 md:grid">
    <div className="col-span-2">
      <h1>Name</h1>
    </div>

    <div>
      <h1>Product Price</h1>
    </div>

    <div>
      <h1>GST</h1>
    </div>

    <div>
      <h1>Selling Price</h1>
    </div>

    <div>
      <h1>Stock</h1>
    </div>

    <div className="text-center">
      <h1>Action</h1>
    </div>

   
  </div>

  {/* Desktop Product List */}
  <div className="hidden md:block">
    {filteredData.length > 0 ? (
      filteredData.map((item, idx) => (
        <div
          key={item.id || idx}
          className="grid grid-cols-7 items-center border-b border-gray-300 bg-white px-5 py-3"
        >
          {/* Product Name and Image */}
          <div className="col-span-2 flex items-center gap-3">
            <img
              src={`${BACKEND_URL}/${item.productImage}`
}
              alt={item.productName || "Product"}
              className="h-12 w-12 rounded-full border object-cover"
            />

            <p className="font-medium text-gray-800">
              {item.productName}
        
              

            </p>

            
          </div>

          {/* GST */}
          <div className="flex">
            <p>₹{item.productPrice}</p>
          </div>

          {/* Product Price */}
          <div className="flex">
             <p>{item.gst}%</p>

          
          </div>

          {/* Selling Price */}
          <div className="flex">
            <p>₹{item.sellingPrice}</p>
          </div>

          {/* Stock */}
          <div className="flex">
            <p>{item.stock}</p>
          </div>

          {/*
            Backend me SKU aur status nahi hain.

            <div className="flex">
              <p>{item.sku}</p>
            </div>

            <div className="flex justify-center">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  item.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {item.status}
              </span>
            </div>
          */}

          {/* Action */}
          <div className="relative flex justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();

                setActionShow(
                  actionShow === idx ? null : idx
                );
              }}
              className={`h-8 w-8 rounded-full text-xl ${
                actionShow === idx
                  ? "bg-slate-600 text-white"
                  : "hover:bg-slate-200"
              }`}
            >
              ⋮
            </button>

            {actionShow === idx && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute top-5 right-23 z-50 w-32 rounded-lg border bg-white py-1 shadow-lg"
              >
                {/* <button
                  type="button"
                  className="block w-full px-4 py-1 text-left hover:rounded-xl hover:bg-gray-200"
                >
                  View
                </button> */}

                <button
                  type="button"
                  onClick={() => {
                    setEditShowForm(true);
                    setActionShow(null);
                    setEditId(item);
                  }}
                  className="block w-full px-4 py-1 text-left  hover:bg-gray-200"
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => dataDelet(item.id)}
                  className="block w-full px-4 py-1 text-left text-red-600  hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      ))
    ) : (
      <div className="py-10 text-center text-gray-500">
        No products found.
      </div>
    )}
  </div>

  {/* Mobile Product List */}
  <div className="block md:hidden">
    {filteredData.length > 0 ? (
      filteredData.map((item, idx) => (
        <div
          key={item.id || idx}
          className="flex flex-col gap-3 border-b border-gray-300 p-3 shadow-sm"
        >
          {/* Product Name */}
          <div className="flex items-center justify-between">
            <h1 className="font-semibold">Name</h1>

            <div className="flex items-center gap-3">
              <img
                src={
                  item.productImage
                    ? item.productImage.startsWith("http")
                      ? item.productImage
                      : `http://localhost:9000${item.productImage}`
                    : "https://placehold.co/100x100?text=Product"
                }
                alt={item.productName || "Product"}
                className="h-12 w-12 rounded-full border object-cover"
              />

              <p className="font-medium text-gray-800">
                {item.productName}
              </p>
            </div>

            {/*
              Purane fields:

              src={item.image}
              alt={item.name}
              {item.name}
            */}
          </div>

          {/* GST */}
          <div className="flex items-center justify-between">
              <h1 className="font-semibold">
              Product Price
            </h1>
            <p>₹{item.productPrice}</p>
          </div>

          {/* Product Price */}
          <div className="flex items-center justify-between">
             <h1 className="font-semibold">GST</h1>
            <p>{item.gst}%</p>
          

          </div>

          {/* Selling Price */}
          <div className="flex items-center justify-between">
            <h1 className="font-semibold">
              Selling Price
            </h1>

            <p>₹{item.sellingPrice}</p>
          </div>

          {/* Stock */}
          <div className="flex items-center justify-between">
            <h1 className="font-semibold">
              Stock
            </h1>

            <p>{item.stock}</p>
          </div>

         

          {/* Action */}
          <div className="flex items-center justify-between">
            <h1 className="font-semibold">
              Action
            </h1>

            <div className="relative flex justify-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();

                  setActionShow(
                    actionShow === idx
                      ? null
                      : idx
                  );
                }}
                className={`h-8 w-8 rounded-full text-xl ${
                  actionShow === idx
                    ? "bg-slate-600 text-white"
                    : "hover:bg-slate-200"
                }`}
              >
                ⋮
              </button>

              {actionShow === idx && (
                <div
                  onClick={(e) =>
                    e.stopPropagation()
                  }
                  className="absolute top-5 right-10 z-50 w-32 rounded-lg border bg-white py-1 shadow-lg"
                >
                  {/* <button
                    type="button"
                    className="block w-full px-4 py-1 text-left hover:rounded-xl hover:bg-gray-200"
                  >
                    View
                  </button> */}

                  <button
                    type="button"
                    onClick={() => {
                      setEditShowForm(true);
                      setActionShow(null);
                      setEditId(item);
                    }}
                    className="block w-full px-4 py-1 text-left  hover:bg-gray-200"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      dataDelet(item.id)
                    }
                    className="block w-full px-4 py-1 text-left text-red-600  hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className="py-10 text-center text-gray-500">
        No products found.
      </div>
    )}
  </div>
</div>


      )}
    </div>
  );
};

export default ProductHeroContent;

