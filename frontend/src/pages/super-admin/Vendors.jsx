import { useState } from "react"
import AddCard from "../../components/AddCard"
import VendorHeroContent from "../../components/super-admin/VendorHeroContent"
import VendorAddForm from "../../components/super-admin/VendorAddForm"
import VendorEditForm from "../../components/super-admin/VendorEditForm"

const Vendors = () => {
 const [showAddForm, setShowAddForm] = useState(false)
 const [ediFormShow, setEdiFormShow] = useState(false)
 const [editData, setEditData] = useState('')

  const title1 = "Add New Vendors"
  const title2 = "Create and manage vendors/company."
  const btn = "+ Add vendors"

  return (
    <div>
      <div>
        <AddCard showForm={setShowAddForm} title1={title1} title2={title2} btn={btn}/>
      </div>
      {/* Add Form Verndos */}
      <div>
        {showAddForm && <VendorAddForm  setShowAddForm={setShowAddForm}/>}
      </div>
      {/* ------------------editForm ------------- */}
      <div>
        {ediFormShow && <VendorEditForm setEdiFormShow={setEdiFormShow} editData={editData}/> }
      </div>
      {/* ----------------VendorHeroContent------------- */}
      <div>
        <VendorHeroContent setEdiFormShow={setEdiFormShow} setEditData={setEditData}/>
      </div>
    </div>
  )
}

export default Vendors