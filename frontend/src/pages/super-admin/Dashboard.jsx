import StatCard from "../../components/super-admin/StatCard";
import { stats } from "../../components/DymiData";
import RevenueChart from "../../components/super-admin/RevenueChart";

const Dashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Super Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((item, index) => (
          <StatCard key={index} title={item.title} value={item.value} />
        ))}
      </div>

      <div className="grid grid-cols-1  gap-6 mt-5 ">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
