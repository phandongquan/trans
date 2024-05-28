import React, { Fragment, useEffect, useState } from 'react'
import { getList, create } from '~/apis/spa/customer_clinic'
import { getList as getListFile } from '~/apis/setting/upload'
import { Modal, Form, notification, Space, Spin, Table, Tooltip } from 'antd'
import LightBoxSingle from './LightBoxSingle'
import dayjs from 'dayjs'
import { MEDIA_URL } from '~/constants'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faImage, faSave, faTimes } from '@fortawesome/free-solid-svg-icons'
import {getList as getListMedicalRecordField} from '~/apis/spa/medical_record_field'
import {getList as getListMedicalRecord, create as createMedicalRecord, update as updateMedicalRecord} from '~/apis/spa/medical_record'
import EditableCell from './EditableCell'
import classNames from 'classnames'

const MedicalRecord = ({t, onSave, onCancel, dataSource, loading, value}) => {
    const [selected, setSelected] = useState(null)
    const columns = [
        {
            title: t('Image'),
            dataIndex: 'name',
            key: 'name',
            width: 95,
            className: 'text-center',
            render: (value) => (
                value && <LightBoxSingle image={{src: `${MEDIA_URL}/${value}`}}/>
            ),
        },
        {
            title: t('Note'),
            render: (_, record) => (
                <div>
                    Path: {record.name}
                    {record.note && <div>{record.note}</div>}
                </div>
            ),
        },
        {
            title: t('Upload By'),
            width: 150,
            dataIndex: 'user',
            key: 'user',
            render: (value) => (
                value && `${value.name} (ID: ${value.id})`
            ),
        },
        {
            title: t('Uploaded At'),
            dataIndex: 'created_at',
            key: 'created_at',
            width: 150,
            className: 'text-center',
            sorter: true,
            render: (value, record) => (
                dayjs(value, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm')
            ),
        },
    ];
    const rowSelection = {
        selectedRowKeys: selected ? [selected.id] : [dataSource.find(item=> item.name == value)].filter(item=> item).map(item=> item.id),
        onChange: (selectedRowKeys, selectedRows) => {
            console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
            setSelected(selectedRows[0])
        },
    };
    return (
        <div style={{maxHeight: 700, overflow: 'auto'}}>
           
            <Table 
                loading={loading}
                rowKey="id" 
                columns={columns} 
                dataSource={dataSource}
                pagination={false}
                bordered
                size="small"
                className="mb-3"
                rowSelection={{
                    type: 'radio',
                    ...rowSelection,
                }}
                scroll={{ x: 800 }}
            />
        
            <div className="text-center">
                <Space>
                    <button type="button" onClick={onCancel} className="btn btn-secondary"><FontAwesomeIcon icon={faTimes}/> {t('Close')}</button>
                    <button type="button" disabled={!selected} onClick={()=> onSave(selected.name)} className="btn btn-info"><FontAwesomeIcon icon={faSave}/> {t('Save')}</button>
                </Space>
            </div>
        </div>
    )
}

export default ({id, children}) => {
    const [dataSource, setDataSource] = useState([])

    const [fieldMedicalRecords, setFieldMedicalRecords] = useState([])
    const [loadingFieldMedicalRecords, setLoadingFieldMedicalRecords] = useState(false)

    const [customerMedicalRecords, setCustomerMedicalRecords] = useState([])
    const [loadingCustomerMedicalRecords, setLoadingCustomerMedicalRecords] = useState(false)

    const [loadingFiles, setLoadingFiles] = useState(false)
    const [loadingForm, setLoadingForm] = useState(false)
    const [files, setFiles] = useState([])
    const [visible, setVisible] = useState(false)
    const [visibleForm, setVisibleForm] = useState(null)
    const [key, setKey] = useState(null)
    const [subscribedCustomerMedicalRecord, setSubscribedCustomerMedicalRecord] = useState(null)
    const [form] = Form.useForm();
    const [newRow, setNewRow] = useState(null)
    const isEditing = record => record.id === newRow?.id;
    const { t } = useTranslation()
    useEffect(() => {
        let isSubscribed = true
        if(id > 0 && visible){
            setLoadingCustomerMedicalRecords(true)
            getListMedicalRecord({
                customer_id: id,
            }).then(({status, data})=>{
                if (isSubscribed) {
                    if(status){
                        setCustomerMedicalRecords(data.rows)
                        
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
    }, [id, visible, key])

    useEffect(() => {
        let isSubscribed = true
        if(id > 0 && visible){
            setLoadingFiles(true)
            getListFile({
                object_type: 1,
                object_id: id,
                // type: 4, //SPA
                limit: 0
            }).then(({status, data})=>{
                if (isSubscribed) {
                    setLoadingFiles(false)
                    if(status && data.rows){
                        setFiles(data.rows)//.filter(item=> !dataSource.find(customer_clinic=> customer_clinic.value == item.name)))
                    }else{
                        notification.error({
                            message: 'Error'
                        })
                    }
                }
            }).catch(error=>{
                if (isSubscribed) {
                    setLoadingFiles(false)
                }
                console.log(error)
                notification.error({
                    message: 'Error'
                })
            })
        }
        return () => {
            isSubscribed = false
        }
    }, [id, visibleForm])

    useEffect(() => {
        let isSubscribed = true
        if(visible){
            setLoadingFieldMedicalRecords(true)
            getListMedicalRecordField({limit: 0, status: 1}).then(({status, data})=>{
                if (isSubscribed) {
                    if(status){
                        setFieldMedicalRecords(data.rows)
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
                    setLoadingFieldMedicalRecords(false)
                    setSubscribedCustomerMedicalRecord(+ new Date())
                }
            })
        }
        return () => {
            isSubscribed = false
        }
    }, [visible])

    useEffect(() => {
        let isSubscribed = true
        setDataSource(fieldMedicalRecords.map(item=> {
            const record = customerMedicalRecords.find(record=> record.medical_record_field_id == item.id)
            return {
                id: item.id,
                name: item.name,
                input_type: item.input_type,
                priority: item.priority,
                ...(item.options && typeof item.options === 'string' ?  { 
                    options : JSON.parse(item.options),
                    options_obj: JSON.parse(item.options).reduce((acc, cur, i)=> {
                        acc[cur.value] = cur
                        return acc
                    }, {}),
                } : {}),

                ...(record ? {
                    updated_at: record.updated_at,
                    user_id: record.user_id,
                    user: record.user,
                    value: record.value,
                    customer_id: record.customer_id,
                    customer_medical_record_id: record.id
                } : {}),
            }
        }))
        return () => {
            isSubscribed = false
        }
    }, [subscribedCustomerMedicalRecord])

    const edit = record => {
        form.resetFields();
        form.setFieldsValue(record);
        setNewRow(record);
    };
    const cancel = () => {
        setNewRow(null);
    };
    const save = async (record, values) => {
        try {
            let params = {}
            if(record.input_type == 'image'){
                params = { 
                    value: values 
                }
                setVisibleForm(null)
            }else{
                const row = await form.validateFields();
                params = {
                    value: row.value
                }
            }

            setLoadingCustomerMedicalRecords(true)
            if(record.customer_medical_record_id){
                updateMedicalRecord(record.customer_medical_record_id, params).then(({status, data})=>{
                    if(status && data.medical_record){
                        notification.success({
                            message: 'Update success'
                        })
                    }else{
                        notification.error({
                            message: 'Update error'
                        })
                    }
                    
                }).catch(error=>{
                    console.log(error)
                    notification.error({
                        message: 'Update error'
                    })
                }).finally(()=>{
                    setLoadingCustomerMedicalRecords(true)
                    setKey(+ new Date())
                })
            }else{
                createMedicalRecord({
                    ...params,
                    customer_id: id,
                    medical_record_field_id: record.id
                }).then(({status, data})=>{
                    if(status && data.medical_record){
                        notification.success({
                            message: 'Insert success'
                        })
                    }else{
                        notification.error({
                            message: 'Insert Error'
                        })
                    }
                
                }).catch(error=>{
                    console.log(error)
                    notification.error({
                        message: 'Insert Error'
                    })
                }).finally(()=>{
                    setLoadingCustomerMedicalRecords(true)
                    setKey(+ new Date())
                })
            }
            
            setNewRow(null);
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    };

    const columns = [
        {
            title: '#',
            width: 50,
            className: 'text-center',
            render: (value, row, i, k) => (
                i + 1
            ),
        },
        // {
        //     title: t('Image'),
        //     dataIndex: 'value',
        //     key: 'value',
        //     width: 95,
        //     className: 'text-center',
        //     render: (value) => (
        //         value && <LightBoxSingle image={{src: `${MEDIA_URL}/${value}`}}/>
        //     ),
        // },
        {
            title: t('Name'),
            dataIndex: 'name',
            key: 'name',
            width: 400,
            render: (value, record)=> (
                <div>
                    <b className={classNames({'text-danger': record.priority})}>{value}</b>
                    <div className="small">
                        {record.user && <span>
                            {t('Updated By')}: {record.user.name} (ID: {record.user.id})
                        </span>}
                        {record.updated_at && <span>
                            {' - '} {t('Updated At')}: {dayjs(record.updated_at, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm')}
                        </span>}
                    </div>
                </div>
            )
        },
        {
            title: t('Value'),
            dataIndex: 'value',
            key: 'value',
            width: 400,
            editable: true,
            render: (value, record)=> (
                value ? <div>
                    {record.input_type == 'text' && value}
                    {record.input_type == 'image' && <LightBoxSingle image={{src: `${MEDIA_URL}/${value}`}}/>}
                    {record.input_type == 'radio' && record.options_obj[value]?.label}
                    {record.input_type == 'select' && record.options_obj[value]?.label}
                </div> : <div className="small text-warning">chưa có dữ liệu</div>
            )
        },
        {
            width: 70,
            className: 'text-center',
            render: (_, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <span>
                        <Tooltip placement="top" title={t('Save')}>
                            <button
                                type="button"
                                className="rounded-0 btn btn-info btn-sm"
                                onClick={() => save(record)}
                            >
                                <FontAwesomeIcon icon={faSave}/>
                            </button>
                        </Tooltip>
                        <Tooltip placement="top" title={t('Cancel')}>
                            <button
                                type="button"
                                className="rounded-0 btn btn-secondary btn-sm"
                                onClick={() => cancel()}
                            >
                                <FontAwesomeIcon icon={faTimes}/>
                            </button>
                        </Tooltip>
                    </span>
                ) : (
                    record.input_type == 'image' ? (
                        <Tooltip placement="top" title={t('Select image')}>
                            <span>
                                <button
                                    type="button"
                                    className="rounded-0 btn btn-info btn-sm"
                                    // disabled={newRow}
                                    onClick={() => {
                                        setVisibleForm(record)
                                        setNewRow(null)
                                    }}
                                >
                                    <FontAwesomeIcon icon={faImage}/>
                                </button>
                            </span>
                        </Tooltip>
                    ) : (
                        <Tooltip placement="top" title={t('Edit')}>
                            <span>
                                <button
                                    type="button"
                                    className="rounded-0 btn btn-outline-info btn-sm"
                                    // disabled={newRow}
                                    onClick={() => edit(record)}
                                >
                                    <FontAwesomeIcon icon={faEdit}/>
                                </button>
                            </span>
                        </Tooltip>
                    )
                );
            },
        }
    ]
    const mergedColumns = columns.map(col => {
        if (!col.editable) {
            return col;
            
        }
        return {
            ...col,
            onCell: (record) => ({
                record,
                inputType: record.input_type || 'text',
                inputProps: col.inputProps,
                dataIndex: col.dataIndexEdit || col.dataIndex,
                title: col.title,
                editing: isEditing(record),
                placeholder: col.placeholder,
                required: col.required,
                options: record.options || []
            }),
        };
    });
    return (
        <Fragment>
            <span onClick={()=>setVisible(true)}>
                {children}
            </span>
            <Modal
               width={1100}
               onCancel={()=>setVisible(false)}
               open={visible}
               destroyOnClose
               footer={null}
               title={t('Medical Records')}
               bodyStyle={{padding: 0}}
            >
                <Form form={form} component={false}>
                    <Table
                        rowKey="id"
                        loading={loadingFieldMedicalRecords || loadingCustomerMedicalRecords}
                        dataSource={dataSource}
                        columns={mergedColumns}
                        pagination={false}
                        size="small"
                        bordered
                        scroll={{ x: 850 }}
                        components={{
                            body: {
                                cell: EditableCell
                            },
                        }}
                    />
                </Form>
            </Modal>
            <Modal
                width={850}
                onCancel={()=>setVisibleForm(null)}
                open={!!visibleForm}
                destroyOnClose
                footer={null}
                closable={false}
            >
                <Spin spinning={loadingForm}>
                    <MedicalRecord dataSource={files} value={visibleForm?.value} loading={loadingFiles} t={t} onSave={(values)=>save(visibleForm, values)} onCancel={()=>setVisibleForm(null)}/>
                </Spin>
            </Modal>
        </Fragment>
    )
}


