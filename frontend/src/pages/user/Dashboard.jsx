import StatCard from "../../components/super-admin/StatCard";

const Dashboard = () => {
  const stats = [
    { title: "My Invoices", value: 24 },
    { title: "Total Orders", value: 56 },
    { title: "Total Spent", value: "₹18,500" },
    { title: "Pending Bills", value: "₹2,300" },
    { title: "Paid Bills", value: 21 },
    { title: "Purchased Products", value: 145 },
    { title: "GST Paid", value: "₹1,250" },
    { title: "Payment Success Rate", value: "95%" },
  ];

  return (
    <div className="min-h-screen bg-slate-100  md:px-2 pb-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          User Dashboard
        </h1>

        <p className="text-slate-500 mt-2">
          Welcome back! Here's a summary of your account.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((item, index) => (
          <StatCard
            key={index}
            title={item.title}
            value={item.value}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;