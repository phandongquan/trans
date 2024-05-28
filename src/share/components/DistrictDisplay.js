import React, { useState, useEffect } from 'react'
import { getDistrictById } from '~/apis/setting/address'
import { Spin } from 'antd'

const DistrictDisplay = ({id}) => {
    const [ district, setDistrict ] = useState()
    const [loading, setLoading] = useState(false)
    useEffect(() => {
        let isSubscribed = true
        if(id){
            setLoading(true)
            getDistrictById(id).then(({status, data})=>{
                if (isSubscribed) {
                    setLoading(false)
                    if(status && data.district){
                        setDistrict(data.district.district_name)
                    }
                }
            }).catch(error=>{
                setLoading(false)
                console.log(error)
            })
        }
        return () => isSubscribed = false
    }, [id])
    if(loading){
        return <Spin/>
    }
    return <span>{district}</span>
}

export default DistrictDisplay