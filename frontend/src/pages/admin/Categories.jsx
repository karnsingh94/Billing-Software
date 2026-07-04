import { useEffect, useState } from "react"
import AddCard from "../../components/AddCard"
import CategoryHeroContent from "../../components/admin/CategoryHeroContent"
import CategoryAddForm from "../../components/admin/CategoryAddForm"
import CategoryEditForm from "../../components/admin/CategoryEditForm"

const Categories = () => {
  const [catAddFormShow, setCatAddFormShow] = useState(false)
  const [catEditFormShow, setCatEditFormShow] = useState(false)
  const [editData, seteditData] = useState(null)
  const title1 = "Add New Category"
  const title2 = "Create and manage category"
  const btn = "+ Add category"

   
  return (
    <div>

      <div>
        <AddCard title1={title1} title2={title2} btn={btn} showForm={setCatAddFormShow}/>
      </div>
      <div onClick={(e)=>  e.stopPropagation()}>
        {catAddFormShow && <CategoryAddForm setCatAddFormShow={setCatAddFormShow} />}
      </div>
      <div>
        {catEditFormShow && <CategoryEditForm setCatEditFormShow={setCatEditFormShow} editData={editData}/>}
      </div>
      <div>
        <CategoryHeroContent setCatEditFormShow={setCatEditFormShow} seteditData={seteditData}/>
      </div>
    </div>
  )
}

export default Categories