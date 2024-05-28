import { search as searchService } from '~/apis/spa/service'

export default (rows, sku_key='service_sku')=> {
    let services = {}
    const promise = new Promise((resolve, reject) => {
        const skus = rows.map(item=>item[sku_key]).filter((v, i, a) => v && a.indexOf(v) === i)
        if(skus.length == 0){
            resolve(services)
        }else{
            searchService({
                skus: skus.join(),
                limit: skus.length
            }).then(({status, data})=>{
                if(status){
                    services = data.rows.reduce((r, a) => {
                        r[a.service_sku] = a;
                        return r;
                    }, {})
                }
                resolve(services)
            }).catch(error=>{
                console.log(error)
                resolve(services)
            })
        }
    })
    return promise
}