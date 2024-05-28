import { getList as searchProduct } from '~/apis/sales/product' 

export default (rows, sku_key='product_sku', limit=0)=> {
    let products = {}
    const promise = new Promise((resolve, reject) => {
        let skus = rows.map(item=>item[sku_key]).filter((v, i, a) => a.indexOf(v) === i)
        if(limit > 0){
            skus = skus.slice(0, limit)
        }
        if(skus.length == 0){
            resolve(products)
        }else{
            searchProduct({
                sku: skus.join(),
                limit: skus.length
            }).then(({status, data})=>{
                if(status){
                    products = data.rows.reduce((r, a) => {
                        r[a.product_sku] = a;
                        return r;
                    }, {})
                }
                resolve(products)
            }).catch(error=>{
                console.log(error)
                resolve(products)
            })
        }
    })
    return promise
}