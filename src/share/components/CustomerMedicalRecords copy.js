import React, { useEffect, useState } from 'react'
import { notification, Table } from 'antd'
import LightBoxSingle from './LightBoxSingle'
import dayjs from 'dayjs'
import { MEDIA_URL } from '~/constants'
import { useTranslation } from 'react-i18next'
import {getList as getListMedicalRecord} from '~/apis/spa/medical_record'
import classNames from 'classnames'

export default ({id}) => {
    const [dataSource, setDataSource] = useState([])

    const [customerMedicalRecords, setCustomerMedicalRecords] = useState([])
    const [loadingCustomerMedicalRecords, setLoadingCustomerMedicalRecords] = useState(false)

    const [subscribedCustomerMedicalRecord, setSubscribedCustomerMedicalRecord] = useState(null)

    const { t } = useTranslation()
    useEffect(() => {
        let isSubscribed = true
        if(id > 0){
            setLoadingCustomerMedicalRecords(true)
            getListMedicalRecord({
                customer_id: id,
                priority: 1,
                data_medical_record_field: 1,
            }).then(({status, data})=>{
                if (isSubscribed) {
                    if(status){
                        setCustomerMedicalRecords(data.rows.sort((a,b)=> a.medical_record_field.sort_order - b.medical_record_field.sort_order).map(item=> {
                            const options = typeof item.medical_record_field.options === 'string' ? JSON.parse(item.medical_record_field.options) : []
                            const options_obj = options.reduce((acc, cur, i)=> {
                                acc[cur.value] = cur
                                return acc
                            }, {})
                            return {...item, options, options_obj }
                        }))
                    }else{
                        notification.error({
                            message: 'Error'
                        })
                    }
                }
            }).catch(error=>{
                console.log(error)
                notification.error({
                    message: 'Error'
                })
            }).finally(()=>{
                if (isSubscribed) {
                    setLoadingCustomerMedicalRecords(false)
                    setSubscribedCustomerMedicalRecord(+ new Date())
                }
            })
        }
        return () => {
            isSubscribed = false
        }
    }, [id])

    useEffect(() => {
        let isSubscribed = true
        // setDataSource(fieldMedicalRecords.map(item=> {
        //     const record = customerMedicalRecords.find(record=> record.medical_record_field_id == item.id)
        //     return {
        //         id: item.id,
        //         name: item.name,
        //         input_type: item.input_type,
        //         priority: item.priority,
        //         ...(item.options && typeof item.options === 'string' ?  { 
        //             options : JSON.parse(item.options),
        //             options_obj: JSON.parse(item.options).reduce((acc, cur, i)=> {
        //                 acc[cur.value] = cur
        //                 return acc
        //             }, {}),
        //         } : {}),

        //         ...(record ? {
        //             updated_at: record.updated_at,
        //             user_id: record.user_id,
        //             user: record.user,
        //             value: record.value,
        //             customer_id: record.customer_id,
        //             customer_medical_record_id: record.id
        //         } : {}),
        //     }
        // }))
        return () => {
            isSubscribed = false
        }
    }, [subscribedCustomerMedicalRecord])

    const columns = [
        // {
        //     // title: '#',
        //     width: 50,
        //     className: 'text-center',
        //     render: (value, row, i, k) => (
        //         i + 1
        //     ),
        // },
        {
            // title: t('Name'),
            dataIndex: 'medical_record_field',
            key: 'medical_record_field',
            className: 'text-danger',
            // width: 400,
            render: (value, record)=> (
                <b className={classNames({'text-danger': record.priority})}>{value.name}</b>
            )
        },
        {
            // title: t('Value'),
            dataIndex: 'value',
            key: 'value',
            // width: 400,
            editable: true,
            render: (value, record)=> (
                value && <div>
                    {record.medical_record_field.input_type == 'text' && value}
                    {record.medical_record_field.input_type == 'image' && <LightBoxSingle image={{src: `${MEDIA_URL}/${value}`}}/>}
                    {record.medical_record_field.input_type == 'radio' && record.options_obj[value]?.label}
                    {record.medical_record_field.input_type == 'select' && record.options_obj[value]?.label}
                </div>
            )
        },
    ]
    return (
        <Table
            title={()=><b>{t('Medical Record')}</b>}
            rowKey="id"
            loading={loadingCustomerMedicalRecords}
            dataSource={customerMedicalRecords}
            columns={columns}
            pagination={false}
            size="small"
            bordered
            className="mb-3"
            showHeader={false}
            // rowClassName="text-danger"
            // scroll={{ x: 850 }}
        />
    )
}


