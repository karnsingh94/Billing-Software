import { useEffect, useState } from "react";

import AddFormAdmin from "../../components/super-admin/AddFormAdmin";
import HeroContent from "../../components/super-admin/HeroContent";
import AddCard from "../../components/AddCard";
import AllEditForm from "../../components/super-admin/AllEditForm";

const API_URL = import.meta.env.VITE_API_URL;

const AllAdmin = () => {
  const [addFormShow, setAddFormShow] = useState(false);
  const [editShowForm, setEditShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  const [admins, setAdmins] = useState([]);

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${API_URL}/auth/admins`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setAdmins(data.admins || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return (
    <div>
      <AddCard
        showForm={setAddFormShow}
        title1="Add New Admin"
        title2="Create and manage admins for vendors/company."
        btn="+ Add Admin"
      />

      {addFormShow && (
        <AddFormAdmin
          setAddFormShow={setAddFormShow}
          onAdminAdded={fetchAdmins}
        />
      )}

      {editShowForm && (
        <AllEditForm
          editData={editData}
          setEditShowForm={setEditShowForm}
          onAdminUpdated={fetchAdmins}
        />
      )}

      <HeroContent
        admins={admins}
        fetchAdmins={fetchAdmins}
        setEditShowForm={setEditShowForm}
        setEditData={setEditData}
      />
    </div>
  );
};

export default AllAdmin;