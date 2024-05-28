import React, { Fragment, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Field, reduxForm, change } from 'redux-form'
import { getList, create } from '~/apis/spa/customer_clinic'
import { getList as getListFile } from '~/apis/setting/upload'
import { Modal, notification, Space, Spin, Table } from 'antd'
import LightBoxSingle from './LightBoxSingle'
import dayjs from 'dayjs'
import { FormatService } from './FormatService'
import { MEDIA_URL } from '~/constants'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faSave, faTimes } from '@fortawesome/free-solid-svg-icons'
import { SearchService } from '~/utils/Form'
import RenderTextareAnt from '~/utils/Form/RenderTextareaAnt'
import SelectSpaStores from '~/utils/Form/Search/SelectSpaStores'
import StoreDisplay from './StoreDisplay'
const TYPE_COMMIT = 1


const validate = values => {
    let errors = {}
    if(!values.sku){
        errors.sku = true
    }
    if(!values.value){
        errors.value = true
    }
    return errors
}

const CustomerCommit = ({t, handleSubmit, onCancel, dataSource, loading, changeFieldValue, submitting, invalid}) => {
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
        onChange: (selectedRowKeys, selectedRows) => {
            console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
            changeFieldValue('value', selectedRows[0].name)
        },
    };
    return (
        <form onSubmit={handleSubmit} style={{maxHeight: 700, overflow: 'auto'}}>
            <div className="row mb-3">
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="col-form-label">{t('Service')}</label>
                        <Field 
                            name="sku"
                            component={SearchService}
                            placeholder="--choose service--"
                            allowClear
                        />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group">
                        <label className="col-form-label">{t('Store')}</label>
                        <Field 
                            name="store_id"
                            component={SelectSpaStores}
                            allowClear
                        />
                    </div>
                </div>
                <div className="col-12">
                    <div className="form-group">
                        <label className="col-form-label">{t('Note')}</label>
                        <Field 
                            name="note"
                            cols={2}
                            component={RenderTextareAnt}
                            allowClear
                        />
                    </div>
                </div>
                <Field 
                    name="value"
                    component='input'
                    type="hidden"
                />
                <div className="col-12">
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
                </div>
            </div>
        
            <div className="text-center">
                <Space>
                    <button type="button" onClick={onCancel} className="btn btn-secondary"><FontAwesomeIcon icon={faTimes}/> {t('Close')}</button>
                    <button type="submit" disabled={submitting || invalid} className="btn btn-info"><FontAwesomeIcon icon={faSave}/> {t('Save')}</button>
                </Space>
            </div>
        </form>
    )
}

const mapStateToProps = (state) => ({
    initialValues: {
        value: null,
        store_id: state.auth.info.profile.store_id
    }
})

const mapDispatchToProps = dispatch => ({
    changeFieldValue: function(field, value) {
        dispatch(change('CustomerCommitForm', field, value))
    }
})

const CustomerCommitForm = connect(mapStateToProps, mapDispatchToProps)(reduxForm({
    form: 'CustomerCommitForm',  
    validate,
    enableReinitialize: true,
    destroyOnUnmount: true,
})(CustomerCommit))

export default ({id, children}) => {
    const [dataSource, setDataSource] = useState([])
    const [loading, setLoading] = useState(false)
    const [loadingFiles, setLoadingFiles] = useState(false)
    const [loadingForm, setLoadingForm] = useState(false)
    const [files, setFiles] = useState([])
    const [visible, setVisible] = useState(false)
    const [visibleForm, setVisibleForm] = useState(false)
    const [key, setKey] = useState(null)
    const { t } = useTranslation()
    useEffect(() => {
        let isSubscribed = true
        if(id > 0 && visible){
            setLoading(true)
            getList({
                customer_id: id,
                type: TYPE_COMMIT
            }).then(({status, data})=>{
                if (isSubscribed) {
                    setLoading(false)
                    if(status && data.rows){
                        setDataSource(data.rows)
                    }else{
                        notification.error({
                            message: 'Error'
                        })
                    }
                }
            }).catch(error=>{
                if (isSubscribed) {
                    setLoading(false)
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
    }, [id, visible, key])

    useEffect(() => {
        let isSubscribed = true
        if(id > 0 && visible){
            setLoadingFiles(true)
            getListFile({
                object_type: 1,
                object_id: id,
                type: 4, //SPA
                limit: 0
            }).then(({status, data})=>{
                if (isSubscribed) {
                    setLoadingFiles(false)
                    if(status && data.rows){
                        setFiles(data.rows.filter(item=> !dataSource.find(customer_clinic=> customer_clinic.value == item.name)))
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

    const handleSaveCommit =(values)=>{
        console.log(values)
        setLoadingForm(true)
        create({
            ...values,
            type: 1,
            customer_id: id,
        }).then(({status, data})=>{
            if(status && data.customer_clinic){
                notification.success({
                    message: 'Success'
                })
                setKey(+ new Date())
                setVisibleForm(false)
            }else{
                notification.error({
                    message: 'Error'
                })
            }
        }).catch(error=>{
            console.log(error)
            notification.error({
                message: 'Error'
            })
        }).finally(()=>{
            setLoadingForm(false)
        })
    }
    const columns = [
        {
            title: '#',
            width: 50,
            className: 'text-center',
            render: (value, row, i, k) => (
                i + 1
            ),
        },
        {
            title: t('Image'),
            dataIndex: 'value',
            key: 'value',
            width: 95,
            className: 'text-center',
            render: (value) => (
                value && <LightBoxSingle image={{src: `${MEDIA_URL}/${value}`}}/>
            ),
        },
        {
            title: t('Content'),
            dataIndex: 'service',
            key: 'service',
            render: (value, record) => (
                <div>
                    <FormatService customerId={id} service={value} hidePrice/>
                    {record.store_id && <div>{t('Store')}: <StoreDisplay id={record.store_id}/></div>}
                    {record.note && <div>{record.note}</div>}
                </div>
            ),
        },
        {
            title: t('Add By'),
            width: 200,
            dataIndex: 'user',
            key: 'user',
            render: (value) => (
                value && `${value.name} (ID: ${value.id})`
            ),
        },
        {
            title: t('Added At'),
            dataIndex: 'created_at',
            key: 'created_at',
            width: 150,
            className: 'text-center',
            render: (value, record) => (
                dayjs(value, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm')
            ),
        }
    ]
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
               title={<div>
                   <button onClick={()=> setVisibleForm(true)} className="btn btn-sm btn-primary"><FontAwesomeIcon icon={faPlus}/> Add commit</button>
               </div>}
            >
                <Table
                    rowKey="id"
                    loading={loading}
                    dataSource={dataSource}
                    columns={columns}
                    pagination={false}
                    size="small"
                    bordered
                />
            </Modal>
            <Modal
                width={850}
                onCancel={()=>setVisibleForm(false)}
                open={visibleForm}
                destroyOnClose
                footer={null}
            >
                <Spin spinning={loadingForm}>
                    <CustomerCommitForm dataSource={files} loading={loadingFiles} t={t} onSubmit={(values)=>handleSaveCommit(values)} onCancel={()=>setVisibleForm(false)}/>
                </Spin>
            </Modal>
        </Fragment>
    )
}


