import { useState } from "react"
import AddCard from "../../components/AddCard"
import UserHeroContent from "../../components/super-admin/UserHeroContent"
import UserAddForm from "../../components/super-admin/UserAddForm"
import UserEditForm from "../../components/super-admin/UserEditForm"

const AllUser = () => {
  const [addFormShow, setAddFormShow] = useState(false)
  const [editShowForm, setEditShowForm] = useState(false)
  const [editData, setEditData] = useState('')
  const title1 = "Add New User"
  const title2 = "Create and manage user for vendors/company."
  const btn = "+ Add User"
  return (
    <div>
      <div>
        <AddCard   showForm={setAddFormShow} title1={title1} title2={title2} btn={btn} />
      </div>
      <div>
        {addFormShow && <UserAddForm setAddFormShow={setAddFormShow} />}
      </div>
      <div>
        {editShowForm&& <UserEditForm  setEditShowForm={setEditShowForm} editData={editData}/>}
      </div>
      <div>
        <UserHeroContent setEditShowForm={setEditShowForm} setEditData={setEditData}/>
      </div>
    </div>
  )
}

export default AllUser