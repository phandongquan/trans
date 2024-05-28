import React, { useState, useEffect } from 'react'
import { getList as getListServiceGroup } from '~/apis/spa/service_group'
import { getList as getListProductCategory } from '~/apis/sales/category'
import uniqBy from 'lodash/uniqBy';

const ServiceProductGroupDisplay = ({ids, options={}}) => {
    const [ service_groups, setServiceGroups ] = useState([])
    const [ product_categories, setProductCategories ] = useState([])
    const arr_ids = ids.split(',')
    useEffect(() => {
        getListServiceGroup({
            limit: 1000,
            ...options
        }).then(({status, data})=>{
            if(status){
                setServiceGroups(data.rows.map(item=>({id: item.service_group_id, name: item.service_group_name})))
            }
        }).catch(error=>{
            console.log(error)
        })

        getListProductCategory({
            limit: 1000,
            ...options
        }).then(({status, data})=>{
            if(status){
                setProductCategories(data.rows.map(item=>({id: item.id, name: item.name})))
            }
        }).catch(error=>{
            console.log(error)
        })
    }, [])

    return (
        <div>
            {ids && uniqBy([...service_groups, ...product_categories], 'id').filter(item=> arr_ids.indexOf(item.id) > -1 ).map(item=><div key={item.id}>
                        <b>{item.id}</b> - {item.name}
            </div> )}
        </div>
    )
}

export default ServiceProductGroupDisplay