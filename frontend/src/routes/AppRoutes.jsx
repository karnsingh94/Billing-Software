import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

import SuperAdminLayout from "../layouts/SuperAdminLayout";
import AdminLayout from "../layouts/AdminLayout";
import UserLayout from "../layouts/UserLayout";

/* Super Admin */
import SuperDashboard from "../pages/super-admin/Dashboard";
import Vendors from "../pages/super-admin/Vendors";
import CreateVendor from "../pages/super-admin/CreateVendor";
import SuperReports from "../pages/super-admin/Reports";
import SuperSettings from "../pages/super-admin/Settings";
import AllAdmin from "../pages/super-admin/AllAdmin";
import AllUser from "../pages/super-admin/AllUser";
import Profile from "../pages/super-admin/Profile";

/* Admin */
import AdminDashboard from "../pages/admin/Dashboard";
import Categories from "../pages/admin/Categories";
import Products from "../pages/admin/Products";
import Staffs from "../pages/admin/Staffs";
import AdminReports from "../pages/admin/Reports";
import AdminSettings from "../pages/admin/Settings";
import ProfileAdmin from "../pages/admin/Profile";

/* User */
import UserDashboard from "../pages/user/Dashboard";
import AllProducts from "../pages/user/AllProducts";
import Invoices from "../pages/user/Invoices";
import Payments from "../pages/user/Payments";
// import Settings from "../pages/user/Settings";
import User from "../pages/admin/User";
import ProtectedRoute from "./ProtectedRoute";
import ProfileUser from "../pages/user/Profile";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Super Admin */}
        <Route
          path="/super-admin"
          element={
            // <ProtectedRoute allowedRole="super-admin">
              <SuperAdminLayout />
            // </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<SuperDashboard />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="vendors/create" element={<CreateVendor />} />
          <Route path="reports" element={<SuperReports />} />
          <Route path="settings" element={<SuperSettings />} />
          <Route path="all-admin" element={<AllAdmin />} />
          <Route path="all-user" element={<AllUser />} />
          <Route path="/super-admin/Profile" element={<Profile />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="user" element={<User />} />
          <Route path="categories" element={<Categories />} />
          <Route path="products" element={<Products />} />
          {/* <Route path="staffs" element={<Staffs />} /> */}
          <Route path="reports" element={<AdminReports />} />
          {/* <Route path="settings" element={<AdminSettings />} /> */}
          <Route path="/admin/profile" element={<ProfileAdmin />} />
        </Route>

        {/* User */}
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<UserDashboard />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="allproducts" element={<AllProducts />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="payments" element={<Payments />} />
          <Route path="profile" element={<ProfileUser />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
