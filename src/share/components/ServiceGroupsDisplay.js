import React, { useState, useEffect } from 'react'
import { getList } from '~/apis/spa/service_group'

const ServiceGroupsDisplay = ({ids, options={}}) => {
    const [ service_groups, setServiceGroups ] = useState([])
    useEffect(() => {
        let isSubscribed = true
        getList({
            limit: 1000,
            ...options
        }).then(({status, data})=>{
            if(status){
                if (isSubscribed) {
                setServiceGroups(data.rows.map(item=>({service_group_id: item.service_group_id, service_group_name: item.service_group_name})))
                }
            }
        }).catch(error=>{
            console.log(error)
        })
        return () => isSubscribed = false
    }, [])

    return (
        <div>
            {ids && service_groups.filter(item=> ids.split(',').indexOf(item.service_group_id) > -1 ).map(item=><div key={item.service_group_id}>
                        <b>{item.service_group_id}</b> - {item.service_group_name}
            </div> )}
        </div>
    )
}

export default ServiceGroupsDisplay