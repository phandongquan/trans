import React, { Fragment, useEffect, useState } from 'react'
import { Descriptions, Drawer, notification, Space, Spin, Empty, Checkbox, Radio } from 'antd'
import { useTranslation } from 'react-i18next'
import { lastestByCustomer } from '~/apis/spa/customer_medical_record'
import EditableCell from './EditableCell'
import classNames from 'classnames'
import StoreDisplay from './StoreDisplay'
import { MEDIA_URL } from '~/constants'
import LightBoxSingle from './LightBoxSingle'
import PrintMedicalRecords from './PrintMedicalRecords'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPrint } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'

const gender_obj = {
    'male': 'Nam',
    'female': 'Nữ',
    'nam': 'Nam',
    'nữ': 'Nữ',
    'nu': 'Nữ'
}

export default ({id, phone='', children}) => {
    const [loading, setLoading] = useState(false)
    const [visible, setVisible] = useState(false)
    const [customerMedicalRecord, setCustomerMedicalRecord] = useState({})
    const [values, setValues] = useState({})
    const [fields, setFields] = useState([])
    const { t } = useTranslation()
    useEffect(() => {
        let isSubscribed = true
        if(id > 0 && visible){
            setLoading(true)
            lastestByCustomer(id).then(({status, data})=>{
                if (isSubscribed) {
                    if(status && data.customer_medical_record){
                        setCustomerMedicalRecord(data.customer_medical_record)
                        setValues(data.customer_medical_record.medical_records.reduce((acc, cur, i)=> {
                            acc[cur.medical_record_field_id] = cur
                            return acc
                        }, {}))
                        setFields(data.medical_record_fields)
                    }else{
                        notification.error({
                            message: 'Không tìm thấy hồ sơ bệnh án'
                        })
                    }
                }
            }).catch(error=>{
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
    }, [id, visible])

    const renderBlock = (field, index) => {
        let label = index ? <><span className="mr-2">{index}.</span> {t(field.name)}</>: t(field.name)
        let input = null
        switch (field.input_type) {
            // case 'number_of_visits':
                // input = values[field.id] ? <span>{values[field.id].value == 1 ? 'Lần đầu' : `Lần thứ ${values[field.id].value}`}</span> : <hr/>
            case 'number_of_visits':
                input = <div className="d-flex justify-content-between align-items-center" style={{width: 300}}>
                    <Checkbox checked={values[field.id]?.value == 1}><b>Lần đầu</b></Checkbox>
                    <div>
                        <b>Lần thứ:</b> {values[field.id]?.value}
                    </div>
                </div>
                break;
            case 'customer_gender':
                input = values[field.id] ? <span>{gender_obj[values[field.id].value] || values[field.id].value}</span> : <hr/>
                break;
            case 'yesno':
                input = <>
                    <Radio.Group value={values[field.id]?.value} className="radio-square text-nowrap float-right mr-30">
                        <Radio value="1">Có</Radio>
                        <Radio value="0">Không</Radio>
                    </Radio.Group>
                    <span className="font-weight-light">{field.enable_desc ? values[field.id]?.desc : ''}</span>
                </>
                break;
            
            case 'image':
                input = values[field.id] && <LightBoxSingle image={{src: `${MEDIA_URL}/${values[field.id].value}`}}/>
                break;
            case 'textarea':
                input = values[field.id] && values[field.id].value != '' ? <span>{values[field.id].value}</span> : <><hr/><hr/></>
                break;
            default:
                input = values[field.id] && values[field.id].value != '' ? <span>{values[field.id].value}</span> : <hr/>
                break;
        }
        return <Descriptions.Item 
            key={field.id}
            className={classNames(`descriptions-preview font-size-16 descriptions-type-${field.input_type} descriptions-block-${field.block}`, {'description-dotted': (!values[field.id] || values[field.id].value == '') && field.input_type != 'yesno'})}
            span={field.number_of_columns || 12} 
            label={label ? <span className={classNames({'text-danger font-weight-bold': field.priority == 1})}>{label}:</span> : null}
        >
            {input}
        </Descriptions.Item>
    }

    return (
        <Fragment>
            <span onClick={()=>setVisible(true)}>
                {children}
            </span>
            <Drawer
                open={visible}
                onClose={()=>setVisible(false)}
                width={900}
                closable={false}
                className="modal-medical-records medical-records-preview"
                footer={
                    <div className="d-flex justify-content-between">
                        {customerMedicalRecord.medical_record_code > 0 ? <div>
                            <b>{customerMedicalRecord.medical_record_code}</b> - {t('Created At')}: {customerMedicalRecord.created_at}
                            <div className="small">{t('Store')}: <StoreDisplay id={customerMedicalRecord.store_id}/> - {t('User')}: {customerMedicalRecord.user && <b>{customerMedicalRecord.user.name}</b>}( ID:{customerMedicalRecord.user_id}) {customerMedicalRecord.updated_at&&<span>- {t('Updated At')}: {customerMedicalRecord.updated_at}</span>}</div>
                        </div> : <div></div>}
                        <div>
                            <button type="button" className="btn btn-outline-secondary" onClick={()=>setVisible(false)} style={{ marginRight: 8 }}>
                                {t('Cancel')}
                            </button>
                            {customerMedicalRecord.medical_record_code ? (
                                <>
                                    <PrintMedicalRecords 
                                        element={<button type="submit" className="btn btn-outline-info mr-1">
                                            <FontAwesomeIcon icon={faPrint} className="mr-1"/>
                                            {t('Print')}
                                        </button>}
                                        customerMedicalRecord={customerMedicalRecord}
                                        fields={fields}
                                        values={values}
                                    />
                                    <Link to={`/medical-records?code=${customerMedicalRecord.medical_record_code || ''}&phone=${phone}`} className="btn btn-primary px-5" style={{ marginRight: 8 }}>
                                        {t('Edit')}
                                    </Link>
                                </>
                            ) : (
                                <Link to={`/medical-records?code=${customerMedicalRecord.medical_record_code || ''}&phone=${phone}`} className="btn btn-primary" style={{ marginRight: 8 }}>
                                    {t('Medical records')}
                                </Link>
                            )}
                            
                        </div>
                    </div>
                }
            >
                <Spin spinning={loading}>
                    {(!customerMedicalRecord.medical_record_code && !loading) ? (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    ) : (
                        <Descriptions
                            column={12}
                            size="small"
                            className="mb-1"
                            colon={false}
                        >
                            {fields.filter(field=> field.block === 1).map(field=> (
                                renderBlock(field)
                            ))}
                            <Descriptions.Item span={12} label={<b className="font-size-16 text-uppercase">{t('Tiền sử y khoa')}</b>}/>
                            {fields.filter(field=> field.block > 1).map((field, field_index)=> (
                                renderBlock(field, field_index + 1)
                            ))}
                        </Descriptions>
                    )}
                    
                </Spin>
            </Drawer>
        </Fragment>
    )
}


