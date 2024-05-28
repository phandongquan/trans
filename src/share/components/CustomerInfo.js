import React, { useEffect, useState } from 'react'
import { getDetailByPhone, getDetail } from '~/apis/sales/customer'
import { notification, Space, Table, Avatar, Card, Spin } from 'antd'
import { faAddressCard, faMapMarkedAlt, faUserCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom'
import { MEDIA_URL } from '~/constants'
import { faFacebookSquare } from '@fortawesome/free-brands-svg-icons'
import DistrictDisplay from './DistrictDisplay'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import classNames from 'classnames'
import money from '~/utils/money'
export const CustomerInfo = ({phone, id}) => {
    const [loading, setLoading] = useState(false)
    const [customer, setCustomer] = useState(null)
    const { t } = useTranslation()
    useEffect(() => {
        let isSubscribed = true
        if(phone){
            setLoading(true)
            setCustomer(null)
            getDetailByPhone(phone).then(({status, data})=>{
                if (isSubscribed) {
                    setLoading(false)
                    if(status && data.customer){
                        setCustomer(data.customer)
                    }else{
                        notification.error({
                            message: 'The phone number is not registered with Hasaki'
                        })
                    }
                }
            }).catch(error=>{
                if (isSubscribed) {
                    setLoading(false)
                }
                console.log(error)
                notification.error({
                    message: 'Get Customer Error'
                })
            })
        }
        return () => {
            isSubscribed = false
        }
    }, [phone])

    useEffect(() => {
        let isSubscribed = true
        if(id > 0){
            setLoading(true)
            setCustomer(null)
            getDetail(id).then(({status, data})=>{
                if (isSubscribed) {
                    setLoading(false)
                    if(status && data.customer){
                        setCustomer(data.customer)
                    }else{
                        notification.error({
                            message: 'Get Customer Error'
                        })
                    }
                }
            }).catch(error=>{
                if (isSubscribed) {
                    setLoading(false)
                }
                console.log(error)
                notification.error({
                    message: 'Get Customer Error'
                })
            })
        }
        return () => {
            isSubscribed = false
        }
    }, [id])

    if(loading){
        return <Spin/>
    }
    if(!customer){
        return null
    }
    let points = (customer.customer_init_order_point + customer.customer_order_point + customer.customer_init_receipt_point + customer.customer_receipt_point)/1000;
    const dataSource = [
        ...(customer.customer_email ? [{ key: 'email', label: t('Email'), value: <a href={`mailto:${customer.customer_email}`}>{customer.customer_email}</a> }] : []),
        { key: 'points', label: t('Points'), value: <b className="text-info">{money(points, false)}</b> },
        { key: 'created_at', label: t('Created At'), value: dayjs(customer.created_at).format('YYYY-MM-DD HH:mm') },
    ]
    return (
        <Card
            className="mb-3"
            actions={[
                <Link to={`/customers/${customer.customer_id}/detail`}><FontAwesomeIcon icon={faAddressCard}/> {t('View Profile')}</Link>,
            ]}
            bodyStyle={{paddingBottom: 10}}
        >
            <div>
                <Space size="large">
                    <Avatar className="spa-avatar" size={70} {...(customer.customer_avatar ? {src: `${MEDIA_URL}/${customer.customer_avatar}`} : {icon: <UserOutlined />})}/>
                    <div>
                        <div className={classNames('h5 mb-0', {"text-info": customer.customer_name, 'text-danger' : !customer.customer_name})}>{customer.customer_name ? <Link className="text-info" to={`/customers/${customer.customer_id}/detail`}>{customer.customer_name}</Link> : 'UNKNOWN'}</div>
                        <div className="h5 mb-2">{customer.customer_phone} <span className="small font-weight-normal">(ID: {customer.customer_id})</span></div>
                        <Space>
                            {customer.customer_district > 0 && <div><FontAwesomeIcon icon={faMapMarkedAlt}/> <DistrictDisplay id={customer.customer_district}/></div>}
                        </Space>
                        
                    </div>
                </Space>
                <h5 className="py-2 rounded font-weight-normal px-3 bg-light mt-3"><FontAwesomeIcon icon={faUserCircle}/> {t('Customer Information')}</h5>
                <Table
                    showHeader={false}
                    size="small"
                    pagination={false}
                    columns={[
                        {
                            dataIndex: 'label',
                            key: 'label',
                            width: 130,
                            className: 'font-weight-bold align-top',
                            render: (value, record, index)=>{
                                if(record.key === 'note'){
                                    return {
                                        children: <span>
                                            <span className="text-warning">{value}</span>
                                            <div className="font-weight-light text-dark">{record.value}</div>
                                        </span>,
                                        props: {
                                            className: index === dataSource.length - 1 ? 'border-0' : '',
                                            colSpan: 2,
                                        },
                                    }
                                }
                                return {
                                    children: value,
                                    props: {
                                        className: index === dataSource.length - 1 ? 'border-0' : '',
                                        colSpan: 1,
                                    },
                                }
                            }
                        },
                        {
                            dataIndex: 'value',
                            key: 'value',
                            className: 'text-right',
                            render: (value, record, index)=>{
                                if(record.key === 'note'){
                                    return {
                                        props: {
                                            colSpan: 0,
                                        },
                                    }
                                }
                                return {
                                    children: value,
                                    props: {
                                        className: index === dataSource.length - 1 ? 'border-0' : '',
                                        colSpan: 1,
                                    },
                                }
                            }
                        },
                    ]}
                    dataSource={dataSource}
                />
            </div>
        </Card>
    )
}
