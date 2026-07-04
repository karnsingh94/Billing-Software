import { useEffect, useState } from "react";
import { invoices } from "../DymiData";
import { FiSearch } from "react-icons/fi";

const InviceCustomer = ({ setViewInvoiceShow }) => {
  const [search, setSearch] = useState("");
  const [invoiceData, setInvoiceData] = useState([]);
  const [datematch, setDatematch] = useState("");
  console.log(datematch);

  useEffect(() => {
    setInvoiceData(invoices);
  }, []);

  const filterdata = invoiceData.filter((item) => {
    const searchData = item.customerName
      .toLowerCase()
      .includes(search.toLowerCase());

    const phoneData = item.phone.includes(search);

    const invoiceSearch = item.invoiceNo
      .toLowerCase()
      .includes(search.toLowerCase());

    const formattedDate = item.date.split("-").reverse().join("-");

    const dateSearch = datematch === "" || formattedDate === datematch;

    return (searchData || phoneData || invoiceSearch) && dateSearch;
  });

  return (
    <div className="mt-7    rounded-xl bg-white shadow-sm pt-5 pb-5">
      {/* Search, Status, Filter */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-0 md:items-center md:justify-between w-full pl-5 pr-5  border-b border-gray-300 pb-3">
        <div className="relative ">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl outline-none font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {/* ------------Date------ */}
        <div className="flex gap-3 justify-end ">
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
            className="w-32 text-center cursor-pointer rounded-xl px-4 py-2 font-semibold  shadow-sm transition-all duration-200 border border-gray-300 hover:shadow-md active:scale-95"
          >
            <h1>Reset Filter</h1>
          </div>
        </div>
      </div>

      {/*========================= content Invoices======================= */}

      <div className="mt-3 hidden md:block">
        <div className="grid  grid-cols-5 bg-white pt-5 pr-5 pl-5 pb-2 font-semibold text-gray-700 border-b  border-gray-300">
          <div className="">
            <h1>Name</h1>
          </div>
          <div className="text-center">
            <h1>Phone</h1>
          </div>
          <div className="text-center">
            <h1>Invoice No</h1>
          </div>
          <div className="text-center">
            <h1>Date</h1>
          </div>
          <div className="text-center">
            <h1>View Invoice</h1>
          </div>
        </div>

        <div>
          {filterdata.map((item, idx) => (
            <div
              key={idx}
              className="grid grid-cols-5 items-center bg-white px-5 py-3 border-b border-gray-300"
            >
              {/* Category */}
              <div className="items-center">
                <p className="font-medium text-gray-800">{item.customerName}</p>
              </div>

              {/* Products */}
              <div className="text-center ">
                <p>{item.phone}</p>
              </div>

              {/* invoiceNo */}
              <div className="text-center ">
                <p>{item.invoiceNo}</p>
              </div>
              {/* invoiceNo */}
              <div className="text-center ">
                <p>{item.date}</p>
              </div>

              {/* invoiceNo */}
              <button
                onClick={() => setViewInvoiceShow(true)}
                className="border border-gray-300 px-4 py-1 rounded-md hover:bg-gray-100"
              >
                View
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ================Mobile Menu============= */}

      <div className="md:hidden block">
        {filterdata.map((item, idx) => (
          <div
            key={idx}
            className="border-b shadow  border-gray-300 p-2 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <h1>Name</h1>
              <p>{item.customerName}</p>
            </div>

            <div className="flex items-center justify-between">
              <h1>Phone</h1>
              <p>{item.phone}</p>
            </div>

            <div className="flex items-center justify-between">
              <h1>Invoice No</h1>
              <p>{item.invoiceNo}</p>
            </div>

            <div className="flex items-center justify-between">
              <h1>Date</h1>
              <p>{item.date}</p>
            </div>

            <div className="flex items-center justify-between">
              <h1>View Invoice</h1>
              <button
                onClick={() => setViewInvoiceShow(true)}
                className="border border-gray-300 px-4 py-1 rounded-md hover:bg-gray-100"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InviceCustomer;
