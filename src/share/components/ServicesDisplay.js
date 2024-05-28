import React, { useState, useEffect } from 'react'
import { search } from '~/apis/spa/service' 
import { Spin } from 'antd'

const ServicesDisplay = ({skus, options}) => {
    const [ oldSkus, setOldSkus ] = useState()
    const [ services, setServices ] = useState([])
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        let isSubscribed = true
        if(skus && skus != oldSkus){
            setOldSkus(skus)
            const arr_skus = skus.split(',').filter((v, i, a) => a.indexOf(v) === i)
            setLoading(true)
            search({
                skus: arr_skus.join(),
                limit: arr_skus.length,
                ...options
            }).then(({status, data})=>{
                setLoading(false)
                if (isSubscribed) {
                    if(status){
                        setServices(data.rows.map(item=>({service_sku: item.service_sku, service_name: item.service_name})))
                    }else{
                        setServices(arr_skus.map(item=>({service_sku: item})))
                    }
                }
            }).catch(error=>{
                setLoading(false)
                if (isSubscribed) {
                    setServices(arr_skus.map(item=>({service_sku: item})))
                }
            })
        }

        return () => isSubscribed = false
    }, [skus, oldSkus, options])
    return (
        <div>
            <Spin spinning={loading}>
                {services.map(item=><div key={item.service_sku}>
                    <b>{item.service_sku}</b> - {item.service_name}
                </div> )}
            </Spin>
        </div>
    )
}

export default ServicesDisplay