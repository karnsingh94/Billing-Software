const ViewInvoice = ({ setViewInvoiceShow }) => {
  const products = [
    { id: 1, productName: "Rice", qty: 1, price: 100 },
    { id: 2, productName: "Sugar", qty: 1, price: 50 },
    { id: 3, productName: "Tea", qty: 1, price: 120 },
    { id: 4, productName: "Coffee", qty: 1, price: 200 },
  ];

  const subtotal = products.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  const cgst = subtotal * 0.025;
  const sgst = subtotal * 0.025;
  const total = subtotal + cgst + sgst;

  return (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">

      {/* Header */}
      <div className="text-center border-b border-gray-300
       pb-4">
        <h1 className="text-3xl font-bold tracking-wide">
          RESTAURANT
        </h1>
        <h2 className="text-xl font-semibold mt-2 text-gray-700">
          FOOD BILL
        </h2>
      </div>

      {/* Invoice Info */}
      <div className="flex justify-between items-center mt-6 text-sm">
        <div>
          <p className="font-semibold">Customer: Walk In</p>
        </div>

        <div className="text-right">
          <p>
            <span className="font-semibold">Invoice :</span> #1304
          </p>
          <p>
            <span className="font-semibold">Date :</span> 24/04/2024
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 border border-gray-300 rounded-lg overflow-hidden">

        {/* Heading */}
        <div className="grid grid-cols-4 bg-gray-100 font-semibold text-sm py-3 px-4">
          <p>Description</p>
          <p className="text-center">Qty</p>
          <p className="text-center">Rate</p>
          <p className="text-right">Amount</p>
        </div>

        {/* Products */}
        {products.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-4 items-center text-sm py-3 px-4 border-t border-gray-300"
          >
            <p>{item.productName}</p>

            <p className="text-center">
              {item.qty}
            </p>

            <p className="text-center">
              ₹{item.price}
            </p>

            <p className="text-right font-medium">
              ₹{item.qty * item.price}
            </p>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 ml-auto w-full  space-y-2">

        <div className="flex justify-between">
          <span>CGST (2.5%)</span>
          <span>₹{cgst.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>SGST (2.5%)</span>
          <span>₹{sgst.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span>Disc (2.5%)</span>
          <span>₹{sgst.toFixed(2)}</span>
        </div>

        <hr className="text-gray-300" />

        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>

      </div>

      {/* Footer */}
      <div className="flex justify-end mt-8">
        <button
          onClick={() => setViewInvoiceShow(false)}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Close
        </button>
      </div>

    </div>
  </div>
);
};

export default ViewInvoice;