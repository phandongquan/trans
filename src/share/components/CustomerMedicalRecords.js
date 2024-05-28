import React, { useEffect, useState } from 'react'
import { notification, Table } from 'antd'
import LightBoxSingle from './LightBoxSingle'
import { MEDIA_URL } from '~/constants'
import { Trans, useTranslation } from 'react-i18next'
import {lastestByCustomer} from '~/apis/spa/customer_medical_record'
import classNames from 'classnames'
import MedicalRecords from '~/share/components/MedicalRecords'

const gender_obj = {
    'male': 'Nam',
    'female': 'Nữ',
    'nam': 'Nam',
    'nữ': 'Nữ',
    'nu': 'Nữ'
}

export default ({id, phone=''}) => {
    const [loading, setLoading] = useState(false)
    const [customerMedicalRecords, setCustomerMedicalRecords] = useState([])

    const { t } = useTranslation()
    useEffect(() => {
        let isSubscribed = true
        if(id > 0){
            setLoading(true)
            lastestByCustomer(id).then(({status, data})=>{
                if (isSubscribed) {
                    if(status && data.customer_medical_record){
                        const fields = data.medical_record_fields.reduce((acc, cur, i)=> {
                            acc[cur.id] = cur
                            return acc
                        }, {})
                        setCustomerMedicalRecords(data.customer_medical_record.medical_records.filter(item=> fields[item.medical_record_field_id] && fields[item.medical_record_field_id].priority > 0).map(item=> {
                            const medical_record_field = fields[item.medical_record_field_id]
                            const options = typeof medical_record_field.options === 'string' ? JSON.parse(medical_record_field.options) : []
                            const options_obj = options.reduce((acc, cur, i)=> {
                                acc[cur.value] = cur
                                return acc
                            }, {})
                            
                            return {...item, options, options_obj, medical_record_field }
                        }).sort((a,b)=> a.medical_record_field.sort_order - b.medical_record_field.sort_order))
                    }else{
                        // notification.error({
                        //     message: 'Error'
                        // })
                    }
                }
            }).catch(error=>{
                console.log(error)
                notification.error({
                    message: 'Error'
                })
            }).finally(()=>{
                if (isSubscribed) {
                    setLoading(false)
                }
            })
        }
        return () => {
            isSubscribed = false
        }
    }, [id])

    // useEffect(() => {
    //     let isSubscribed = true
    //     // setDataSource(fieldMedicalRecords.map(item=> {
    //     //     const record = customerMedicalRecords.find(record=> record.medical_record_field_id == item.id)
    //     //     return {
    //     //         id: item.id,
    //     //         name: item.name,
    //     //         input_type: item.input_type,
    //     //         priority: item.priority,
    //     //         ...(item.options && typeof item.options === 'string' ?  { 
    //     //             options : JSON.parse(item.options),
    //     //             options_obj: JSON.parse(item.options).reduce((acc, cur, i)=> {
    //     //                 acc[cur.value] = cur
    //     //                 return acc
    //     //             }, {}),
    //     //         } : {}),

    //     //         ...(record ? {
    //     //             updated_at: record.updated_at,
    //     //             user_id: record.user_id,
    //     //             user: record.user,
    //     //             value: record.value,
    //     //             customer_id: record.customer_id,
    //     //             customer_medical_record_id: record.id
    //     //         } : {}),
    //     //     }
    //     // }))
    //     return () => {
    //         isSubscribed = false
    //     }
    // }, [subscribedCustomerMedicalRecord])

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
                <b className="text-danger">{value.name}</b>
            )
        },
        {
            // title: t('Value'),
            dataIndex: 'value',
            key: 'value',
            // width: 400,
            editable: true,
            render: (value, record)=> {
                switch (record.medical_record_field.input_type) {
                    case 'select':
                        return record.options_obj[value]?.label ? t(record.options_obj[value].label) : ''
                    case 'image':
                        return <LightBoxSingle image={{src: `${MEDIA_URL}/${value}`}}/>
                    case 'yesno':
                        if(value == 1 ){
                            return <div className="text-white text-center">
                                <div className="bg-danger position-absolute" style={{inset: 0}}></div>
                                <div className="position-relative">
                                    {t('Yes')}
                                </div>
                            </div>
                        }
                        return <div className="text-center">{t('No')}</div>
                    case 'customer_gender':
                        return t(gender_obj[value] || value)
                    case 'number_of_visits':
                        return <div className="text-center">{value == 1 ? t('The first time') : <Trans>{{value}}th time</Trans>}</div>
                    default:
                        return value
                }
            }
            //     value && <div>
            //         {record.medical_record_field.input_type == 'text' && value}
            //         {record.medical_record_field.input_type == 'image' && <LightBoxSingle image={{src: `${MEDIA_URL}/${value}`}}/>}
            //         {record.medical_record_field.input_type == 'radio' && record.options_obj[value]?.label}
            //         {record.medical_record_field.input_type == 'select' && record.options_obj[value]?.label}
            //     </div>
            // )
        },
    ]
    return (
        <Table
            title={()=><div className="d-flex justify-content-between">
                <b>{t('Medical Records')}</b>
                <MedicalRecords id={id} phone={phone}>
                    <div><button className="btn btn-sm btn-outline-primary btn-block">{t('View')}</button></div>
                </MedicalRecords>
            </div>}
            more
            rowKey="id"
            loading={loading}
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


