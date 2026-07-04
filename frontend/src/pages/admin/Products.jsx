import { useState } from "react"
import AddCard from "../../components/AddCard"
import ProductHeroContent from "../../components/admin/ProductHeroContent"
import ProductAddForm from "../../components/admin/ProductAddForm"
import ProductEditForm from "../../components/admin/ProductEditForm"

const Products = () => {

  const [ptoAddFormShow, setPtoAddFormShow] = useState(false)
  const [editShowForm, setEditShowForm] = useState(false)
  const [editId, setEditId] = useState('')
  const title1 = "Add New Products"
  const title2 = "Create and manage product"
  const btn = "+ Add product"
  return (
    <div>
      <div>
        <AddCard title1={title1} title2={title2} btn={btn} showForm={setPtoAddFormShow}/>  
      </div>
{/* addForm */}
      <div>
        {ptoAddFormShow&&<ProductAddForm setPtoAddFormShow={setPtoAddFormShow}/>}
      </div>
      {/*--------------- EditForm------------------- */}
      <div>
        {editShowForm &&<ProductEditForm setEditShowForm={setEditShowForm} editId={editId}/>}
      </div>
    {/* ProductHeroContent */}
      <div>
         <ProductHeroContent setEditShowForm={setEditShowForm} setEditId={setEditId}/>
      </div>
    </div>
  )
}

export default Products