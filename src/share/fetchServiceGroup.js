import { getList } from '~/apis/spa/service_group'

export default (sku_key='service_group_sku')=> {
    let options = {}
    const promise = new Promise((resolve, reject) => {
        getList().then(({status, data})=>{
            if(status){
                let rows = []
        
                if(Array.isArray(data.rows)){
                    rows = data.rows
                }else{
                    rows = Object.values(data.rows)
                }
                options = rows.reduce((r, a) => {
                    r[sku_key] = a;
                    return r;
                }, {})
            }
            resolve(options)
        }).catch(error=>{
            console.log(error)
            resolve(options)
        })
    })
    return promise
}