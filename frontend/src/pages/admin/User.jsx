import { useState } from "react";
import AddCard from "../../components/AddCard"
import AddFormUser from "../../components/admin/AddFormUser";
import HeroContent from "../../components/admin/HeroContent";
import UserEditForm from "../../components/admin/UserEditForm";

const User = () => {

  const [addFormShow, setAddFormShow] = useState(false)
  const [editShowForm, setEditShowForm] = useState(false)
  const [editData, setEditData] = useState('')

  const title1 = "Add New User"
  const title2 = "Create and manage user for vendors/admin."
  const btn = " + Add User"
  return (
    <div>
      
      <AddCard  showForm={setAddFormShow} title1={title1} title2={ title2} btn={btn}/>

      <div>
        {addFormShow&& <AddFormUser setAddFormShow={setAddFormShow}/> }
      </div>
     
     <div>
      {editShowForm && <UserEditForm setEditShowForm={setEditShowForm} editData={editData}/>}
     </div>
      <div>
        <HeroContent setEditShowForm={setEditShowForm} setEditData={setEditData}/>
      </div>
    </div>

    
  );
};

export default User;
