import { useEffect, useState } from "react";
import StatCard from "../../components/super-admin/StatCard";
import RevenueChart from "../../components/super-admin/RevenueChart";

const API_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
  const [stats, setStats] = useState({
    admins: 0,
    users: 0,
    products: 0,
    payments: 0,
    invoices: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [
        adminRes,
        userRes,
        productRes,
        paymentRes,
        invoiceRes,
      ] = await Promise.all([
        fetch(`${API_URL}/auth/admins`, { headers }),
        fetch(`${API_URL}/auth/users`, { headers }),
        fetch(`${API_URL}/products/get-products`, { headers }),
        fetch(`${API_URL}/payments`, { headers }),
        fetch(`${API_URL}/invoices`, { headers }),
      ]);

      const adminData = await adminRes.json();
      const userData = await userRes.json();
      const productData = await productRes.json();
      const paymentData = await paymentRes.json();
      const invoiceData = await invoiceRes.json();

      setStats({
        admins: adminData.admins?.length || 0,
        users: userData.users?.length || 0,
        products: productData.data?.length || 0,
        payments: paymentData.data?.length || 0,
        invoices: invoiceData.data?.length || 0,
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: "Total Admins",
      value: stats.admins,
    },
    {
      title: "Total Users",
      value: stats.users,
    },
    {
      title: "Total Products",
      value: stats.products,
    },
    {
      title: "Total Payments",
      value: stats.payments,
    },
    {
      title: "Total Invoices",
      value: stats.invoices,
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Super Admin Dashboard
      </h1>

      {loading ? (
        <div className="text-center py-10 text-lg">
          Loading Dashboard...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
            {cards.map((item, index) => (
              <StatCard
                key={index}
                title={item.title}
                value={item.value}
              />
            ))}
          </div>

          <div className="mt-6">
            <RevenueChart />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;