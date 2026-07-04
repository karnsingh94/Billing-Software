const StatCard = ({ title, value }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition-all">
      <h3 className="text-gray-500 text-sm font-semibold uppercase">
        {title}
      </h3>

      <p className="text-3xl font-bold mt-2">
        {value}
      </p>
    </div>
  );
};

export default StatCard;