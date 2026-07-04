import { useState } from "react";

import AddFormAdmin from "../../components/super-admin/AddFormAdmin";
import HeroContent from "../../components/super-admin/HeroContent";
import AddCard from "../../components/AddCard";
import AllEditForm from "../../components/super-admin/AllEditForm";

const AllAdmin = () => {
  const [addFormShow, setAddFormShow] = useState(false);
  const [editShowForm, setEditShowForm] = useState(false)
  const [editData, setEditData] = useState(false)

  const title1 = " Add New Admin";
  const title2 = "Create and manage admins for vendors/company.";
  const btn = "+ Add Admin";

  return (
    <div>
      <AddCard
        showForm={setAddFormShow}
        title1={title1}
        title2={title2}
        btn={btn}
      />
      <div>
        {addFormShow && <AddFormAdmin setAddFormShow={setAddFormShow} />}
      </div>
      {/* AddForn */}
      <div>
        {editShowForm && <AllEditForm editData={editData} setEditShowForm={setEditShowForm}/>}
      </div>
      {/* HeroContent */}
      <div>
        <HeroContent setEditShowForm={setEditShowForm} setEditData={setEditData}/>
      </div>
    </div>
  );
};

export default AllAdmin;
