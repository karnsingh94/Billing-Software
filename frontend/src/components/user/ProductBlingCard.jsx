import { useState } from "react";
import { ArrowBigLeft } from "lucide-react";

const ProductBlingCard = ({ filterData, cart, deleteItem }) => {
  const [showPayment, setshowPayment] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerNumber, setCustomerNumber] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(0);

  const totalPrice = filterData.reduce((acc, item) => {
    return acc + item.price * (cart[item.id] || 0);
  }, 0);

  // ===============GST==================

  const GrandTotal = (totalPrice * 18) / 100;

  // =============================new ============================
  const totalGst = totalPrice + GrandTotal;

  const totalDiscount = (totalGst * discountPercentage) / 100;

  const totalGstDiscount = totalGst - totalDiscount;


  //=============isFormValid==============

  const isFormValid =
    customerName.trim() !== "" &&
    customerNumber.trim() !== "" &&
    totalPrice > 0;

  return (
    <div className="h-full flex flex-col">
      {/* Customer Details */}
      <div
        className={`border-b  border-gray-300 pb-5 ${showPayment ? "hidden" : "block"} `}
      >
        <div className="flex items-center gap-2 p-4">
          <label className="text-gray-700 text-sm font-semibold">Name:</label>

          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer's full name"
            className="w-full px-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 px-4">
          <label className="text-gray-700 text-sm font-semibold">Number:</label>

          <input
            type="text"
            value={customerNumber}
            onChange={(e) => setCustomerNumber(e.target.value)}
            placeholder="7654367876"
            className="w-full px-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Scrollable Products */}
      <div
        className={`flex-1 overflow-y-auto [scrollbar-width:none] ${showPayment ? "hidden" : "block"} `}
      >
        {filterData.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between px-4 border-b border-gray-300"
          >
            <div>{item.name} -</div>
            <div>{item.price * (cart[item.id] || deleteItem(item.id))}</div>
          </div>
        ))}
      </div>

      {/* Fixed Bottom Button */}
      <div
        className={`flex items-center justify-between gap-2 p-1 ${showPayment ? "hidden" : "block"}`}
      >
        <button
          disabled={!isFormValid}
          onClick={() => setshowPayment(true)}
          className={`w-full py-2 rounded-xl font-semibold ${
            isFormValid
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Create Bill
        </button>
        <div className=" w-full border border-gray-300 py-2 rounded-xl px-2 text-shadow-gray-900 font-bold">
          Total: ₹ {totalPrice}
        </div>
      </div>

      {/*--------------showPayment --------------*/}
      {showPayment && (
        <div>
          <div className="mt-3 ml-4 flex items-center justify-between pr-3">
            <h1>
              <ArrowBigLeft
                onClick={() => setshowPayment(false)}
                className="text-gray-300 ml-1 hover:text-gray-400  "
              />
            </h1>

            <div className="flex items-center gap-3">
              <label>Discount:</label>
              <input
                type="text"
                placeholder="Enter Discount %"
                value={discountPercentage}
                onChange={(e) =>
                  setDiscountPercentage(Number(e.target.value) || 0)
                }
                className="border border-gray-300 outline-none rounded-xl px-3 w-20"
              />
            </div>
          </div>
          <div className=" border m-4 border-gray-300 py-2 rounded-xl px-3 font-bold">
            <div className="text-gray-700 font-semibold">
              Total: ₹ {totalPrice}
            </div>
            <div className="text-gray-700 font-semibold text-sm">GST: 18%</div>

           

            {/* Discount तभी दिखे जब > 0 हो */}
            {discountPercentage > 0 && (
              <div>
                Discount ({discountPercentage}%): ₹ {totalDiscount.toFixed(2)}
              </div>
            )}

            {/* Final Amount हमेशा दिखे */}
            <div className="text-green-600 font-bold">
              Final Amount: ₹ {totalGstDiscount.toFixed(2)}
            </div>
          </div>

          <div className="p-4 flex gap-4 items-center justify-between">
            <button className="w-full py-2 border border-gray-300 rounded-lg font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition duration-200">
              Online
            </button>
            <button className="w-full py-2 border border-gray-300 rounded-lg font-semibold text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition duration-300">
              Cash
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductBlingCard;
