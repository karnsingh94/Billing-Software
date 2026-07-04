import { useEffect, useState } from "react";
import { products } from "../../components/DymiData";
import ProductBlingCard from "../../components/user/ProductBlingCard";
import { FiSearch } from "react-icons/fi";

const AllProducts = () => {
  const [cart, setCart] = useState({});
  const [productData, setProductData] = useState([]);
  const [itemId, setItemId] = useState([]);
  const [search, setSearch] = useState("");


  useEffect(() => {
    const localData = JSON.parse(localStorage.getItem("products"));
    if (localData && localData.length > 0) {
      setProductData(localData);
    } else {
      setProductData(products);
    }
  }, []);

  const increment = (id) => {
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };
  const decrement = (id) => {
    setCart((prev) => ({
      ...prev,
      [id]: Math.max((prev[id] || 0) - 1, 0),
    }));
  };

  // product select and add array
  const filterData = productData.filter((item) => itemId.includes(item.id));

  // itemId se remove
  const deleteItem = (id) => {
    setItemId((prev) => prev.filter((item) => item !== id));
  };

  // search
  const searchedData = productData.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="grid md:grid-cols-10 gap-4 w-full grid-rows grid-cols-2">
      {/* Products Section */}
      <div className=" col-span-5 md:col-span-7 bg-white shadow rounded-lg  p-4  ">
        <div className="relative mb-4">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl outline-none font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3  lg:grid-cols-5 gap-4">
          {searchedData.map((item) => (
            <div
              key={item.id}
              className="border border-gray-300 rounded-lg p-3 shadow-sm hover:shadow-md transition"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-20 object-cover rounded-md"
              />

              <h1 className="mt-2 font-semibold truncate">{item.name}</h1>

              <p className="text-green-600 font-bold">₹{item.price}</p>
              <div className=" mt-2">
                <div className="w-full flex items-center justify-between bg-blue-500 text-white px-1 py-2 rounded-lg">
                  <button
                    onClick={() => decrement(item.id)}
                    className="w-7 h-7 rounded-full bg-white text-black font-bold flex items-center justify-center shrink-0"
                  >
                    -
                  </button>

                  <span className="font-semibold text-sm">
                    {" "}
                    {cart[item.id] || "Add"}
                  </span>

                  <button
                    onClick={() => {
                      increment(item.id);
                      setItemId((prev) => [...prev, item.id]);
                    }}
                    className="w-7 h-7 rounded-full bg-white text-black font-bold flex items-center justify-center border border-black shrink-0"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div className=" col-span-5 md:col-span-3 bg-white border border-gray-300 rounded-lg h-[80vh] sticky top-22 ">
        <ProductBlingCard
          filterData={filterData}
          cart={cart}
          deleteItem={deleteItem}
        />
      </div>
    </div>
  );
};

export default AllProducts;
