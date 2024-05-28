import React, { useEffect, useState } from 'react'
import isJSON from '~/utils/isJSON'
import { searchOptions } from '~/apis/spa/machine'
import { Spin } from 'antd'
import { getOptionLabel, options_service_parameter_type } from '~/share/options'

export const FormatServiceNote = ({ note }) => {
    const [loading, setLoading] = useState(false)
    const [options, setOptions] = useState({})
    useEffect(() => {
        let isSubscribed = true
        
        if(note && isJSON(note)){
            const data = JSON.parse(note);
            const option_ids = Object.keys(data.options).map(item=>item.replace('id_', ''));
            setLoading(true)
            searchOptions({
                ids: option_ids.join(),
                limit: option_ids.length,
            }).then(({status, data})=>{
                if (isSubscribed) {
                    setLoading(false)
                    if(status){
                        setOptions(data.rows.reduce((acc, cur, i)=>{
                            acc[`id_${cur.id}`] = cur
                            return acc
                        }, {}))
                    }
                }
            }).catch(error=>{
                if (isSubscribed) {
                    setLoading(false)
                }
            })
        }

        return () => isSubscribed = false
    }, [note])

    if(isJSON(note)){
        const data = JSON.parse(note);
        const option_ids = Object.keys(data.options)
        return <span>
            {data.note}
            <Spin spinning={loading}>
                {option_ids.map((item, index)=> <span key={item}>
                    <span>{options[item]?.name} <small>({getOptionLabel(options_service_parameter_type, options[item]?.type, {uppercase: false})})</small>: {data.options[item]}</span>
                    {index < option_ids.length - 1 && ` - `}
                </span>)}
            </Spin>
        </span>
    }else{
        return <span>{note}</span>
    }
}
