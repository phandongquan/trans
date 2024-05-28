import React from 'react'
import PropTypes from 'prop-types'
import { Card, Avatar, Space, Table, Alert } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAddressCard, faEnvelope, faPhoneAlt, faMapMarkedAlt, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { faFacebookSquare } from '@fortawesome/free-brands-svg-icons';
import classNames from 'classnames'
import money from '~/utils/money';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DistrictDisplay from './DistrictDisplay';
import dayjs from 'dayjs';
import { MEDIA_URL } from '~/constants';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import CustomerMedicalRecords from './CustomerMedicalRecords';
const ProfileCard = ({accountBalance, profile, data: { customer_id, customer_avatar, customer_name, customer_phone, customer_email, customer_facebook, customer_district, customer_init_order_point=0, customer_order_point=0, customer_init_receipt_point=0, customer_receipt_point=0, created_at }, loading, showActions=true, showMedicalRecord=true}) => {
    const { t } = useTranslation()
    let points = (customer_init_order_point + customer_order_point + customer_init_receipt_point + customer_receipt_point)/1000;
    let balance_debit = []
    let balance_promotion = []
    if(accountBalance && accountBalance.balance){
        const balance = typeof accountBalance.balance === 'string' ? JSON.parse(accountBalance.balance) : accountBalance.balance
        for (let index = 0; index < balance.length; index++) {
            const element = balance[index];
            if(element.balance_type == 1 && element.debit > 1){
                balance_debit.push({
                    key: `balance_debit_${index}`,
                    label: t('Balance Debit'), value: <b className="text-danger">-{money(element.debit)}</b>
                })
            }if(element.balance_type == 2 && element.credit > 1){
                balance_promotion.push({
                    key: `balance_promotion${index}`,
                    label: t('Balance Promotion'), value: <b className="text-info">+{money(element.credit)}</b>
                })
            }
        }
    }
    const dataSource = [
        ...balance_debit,
        ...balance_promotion,
        ...(customer_email ? [{ key: 'email', label: t('Email'), value: <a href={`mailto:${customer_email}`}>{customer_email}</a> }] : []),
        { key: 'points', label: t('Points'), value: <b className="text-info">{money(points, false)}</b> },
        { key: 'created_at', label: t('Created At'), value: dayjs(created_at).format('YYYY-MM-DD HH[H]') },
        // ...(profile?.note ? [{ key: 'note', label: <span><FontAwesomeIcon icon={faClipboard}/> {t('Note')}</span>, value: profile.note}] : []),
    ]
    return (
    <div>
        <Card 
            loading={loading} 
            className="mb-3"
            actions={showActions ? [
                <Link to={`/customers/${customer_id}/detail`}><FontAwesomeIcon icon={faAddressCard}/> {t('View Profile')}</Link>,
            ] : []}
            bodyStyle={{paddingBottom: 10}}
        >
            <div>
                <Space size="large">
                    <Avatar className="spa-avatar" size={70} {...(customer_avatar ? {src: `${MEDIA_URL}/${customer_avatar}`} : {icon: <UserOutlined />})}/>
                    <div>
                        <div className={classNames('h5 mb-0', {"text-info": customer_name, 'text-danger' : !customer_name})}>{customer_name ? <Link className="text-info" to={`/customers/${customer_id}/detail`}>{customer_name}</Link> : 'UNKNOWN'}</div>
                        <div className="h5 mb-2">{customer_phone} <span className="small font-weight-normal">(ID: {customer_id})</span></div>
                        <Space>
                            {customer_district > 0 && <div><FontAwesomeIcon icon={faMapMarkedAlt}/> <DistrictDisplay id={customer_district}/></div>}
                            {customer_facebook && <div className="h5 mb-0"><a href={customer_facebook} target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faFacebookSquare}/></a></div>}
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
        
        {profile?.note && <Alert
            message={<span className="text-warning"><FontAwesomeIcon icon={faClipboard}/> {t('Note')}</span>}
            className="mb-3"
            description={profile.note}
            type="error"
        />}
        {showMedicalRecord && <CustomerMedicalRecords id={customer_id} phone={customer_phone}/>}
    </div>
    )
}

ProfileCard.propTypes = {
    loading: PropTypes.bool,
    data: PropTypes.object.isRequired
}

export default ProfileCard
