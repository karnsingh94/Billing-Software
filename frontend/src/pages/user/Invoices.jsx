import { useState } from 'react'
import InviceCustomer from '../../components/user/InviceCustomer'
import ViewInvoice from '../../components/user/ViewInvoice'


const Invoices = () => {
  const [viewInvoiceShow, setViewInvoiceShow] = useState(false)
  return (
    <div>
      
      {/* ==============ViewInvoice======================= */}
      <div>
       {viewInvoiceShow&& <ViewInvoice setViewInvoiceShow={setViewInvoiceShow}/>}
      </div>
      {/* =========== InviceCustomer=================*/}
      <div>
        <InviceCustomer setViewInvoiceShow={setViewInvoiceShow}/>
      </div>
    </div>
  )
}

export default Invoices