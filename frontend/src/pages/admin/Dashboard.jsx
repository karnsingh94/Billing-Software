
import StatCard from "../../components/super-admin/StatCard";

const Dashboard = () => {
  const stats = [
  {
    title: "Total Users",
    value: 150,
  },
  {
    title: "Total Vendors",
    value: 45,
  },
  {
    title: "Total Products",
    value: 850,
  },
  {
    title: "Total Invoices",
    value: 1250,
  },
  {
    title: "Total Revenue",
    value: "₹5,25,000",
  },
  {
    title: "Pending Payments",
    value: "₹45,000",
  },
  {
    title: "Paid Invoices",
    value: 1100,
  },
  {
    title: "GST Collected",
    value: "₹32,500",
  },
];
  return (
<div className="min-h-screen bg-slate-100 md:p-3">
  <h1 className="text-3xl font-bold text-slate-800 ">
  Admin  Dashboard 
  </h1>

  <p className="text-slate-500 mt-2 ">
          Welcome back! Here's a summary of your account.
        </p>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-3">
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