import React, { useState, useEffect } from 'react'
import { search as searchService } from '~/apis/spa/service'
import { getList as searchProduct } from '~/apis/sales/product' 
import uniqBy from 'lodash/uniqBy';

const ServiceProductDisplay = ({skus, options}) => {
    const [ oldSkus, setOldSkus ] = useState()
    const [ services, setServices ] = useState([])
    const [ products, setProducts ] = useState([])
    useEffect(() => {
        if(skus && skus != oldSkus){
            setOldSkus(String(skus))
            const arr_skus = String(skus).split(',').filter((v, i, a) => a.indexOf(v) === i)
            // handleGetService({
            //     sku: arr_skus.join(),
            //     limit: arr_skus.length,
            //     ...options
            // })
            

            searchService({
                skus: arr_skus.join(),
                limit: arr_skus.length,
                ...options
            }).then(({status, data})=>{
                if(status){
                    setServices(data.rows.map(item=>({sku: item.service_sku, name: item.service_name})))
                    if(data.rows.length == 0){
                        
                    }
                }else{
                    setServices(arr_skus.map(item=>({sku: item})))
                }
                if(!status || data.rows.length == 0){
                    searchProduct({
                        sku: arr_skus.join(),
                        limit: arr_skus.length,
                        ...options
                    }).then(({status, data})=>{
                        if(status){
                            setProducts(data.rows.map(item=>({sku: item.product_sku, name: item.product_name})))
                        }else{
                            setProducts(arr_skus.map(item=>({sku: item})))
                        }
                    }).catch(error=>{
                        console.log(error)
                        setProducts(arr_skus.map(item=>({sku: item})))
                    })
                }
            }).catch(error=>{
                console.log(error)
                setServices(arr_skus.map(item=>({sku: item})))
            })
        }
    }, [skus])
    // const handleGetService =(params)=>{
    //     searchService(params).then(({status, data})=>{
    //         if(status){
    //             setServices(data.rows.map(item=>({sku: item.service_sku, name: item.service_name})))
    //         }else{
    //             setServices(arr_skus.map(item=>({sku: item})))
    //         }
    //     }).catch(error=>{
    //         console.log(error)
    //         setServices(arr_skus.map(item=>({sku: item})))
    //     })
    // }
    return (
        <div>
            {uniqBy([...products, ...services], 'sku').map(item=><div key={item.sku}>
                        <b>{item.sku}</b> - {item.name}
            </div> )}
        </div>
    )
}

export default ServiceProductDisplay