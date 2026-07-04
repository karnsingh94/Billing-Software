const AddCard = ({ showForm, title1, title2, btn }) => {
  return (
    <div className="bg-white rounded-xl shadow border p-4 md:p-6 flex flex-col sm:flex-row gap-4 sm:gap-0 sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">{title1}</h2>

        <p className="text-gray-500 mt-1">{title2}</p>
      </div>

      <button
        onClick={() =>
           showForm(true)}
        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg"
      >
        {btn}
      </button>
    </div>
  );
};

export default AddCard;
