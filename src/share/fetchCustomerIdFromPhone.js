import { getDetailByPhone } from '~/apis/sales/customer'

export default (phone, customer_id)=> {
    const promise = new Promise((resolve, reject) => {
        if(customer_id > 0){
            resolve(customer_id)
        }
        if(phone && phone.length > 0){
            getDetailByPhone(phone).then(({status, data})=>{
                let id = null
                if(status){
                    if(status && data.customer){
                        id = data.customer.customer_id
                    }
                }
                resolve(id)
            }).catch(error=>{
                resolve(null)
            })
        }
    })
    return promise
}