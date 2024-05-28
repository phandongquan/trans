import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import money from '~/utils/money'
import { Tooltip, Modal, Spin, Table } from 'antd'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { getList as getStockProduct} from '~/apis/inventory/stock_product'
import { getList as getListReceiptDetail } from '~/apis/report/receipt_detail'
import { getList as getListPrescription } from '~/apis/spa/prescription'
import { getList as getListServiceSchedule} from '~/apis/spa/service_schedule'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons'
import dayjs from 'dayjs'
import fetchCustomerIdFromPhone from '~/share/fetchCustomerIdFromPhone'

const Component = ({service, hideSku=true, hidePrice, children, prefix, boldName, store, disabledClick, inline, customerId, customerPhone}) => {
    const [stock, setStock] = useState({})
    const [showDetail, setShowDetail] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loadingHistory, setLoadingHistory] = useState(false)
    const [histories, setHistories] = useState([])
    const { t } = useTranslation()
    if(!service){
        return null
    }
    const is_diagnostic = service.type == 4
    const is_medical = service.type == 3
    const is_service = service.type == 1 || service.type == 2
    const is_dangerous = service.options ? service.options.find(item=>item.option_key === 'dangerous_catalog') : null

    const handleShowDetail =()=>{
        if(disabledClick){
            return
        }
        setStock({})
        setShowDetail(true)
        if(store?.store_stock_id && is_medical){
            setLoading(true)
            getStockProduct({
                sku: service.service_sku,
                stock_id: store?.store_stock_id || 0,
                limit: 1
            }).then(({status, data})=>{
                if(status && data.rows.length > 0){
                    setStock(data.rows[0])
                }
                setLoading(false)
            }).catch(error=>{
                setLoading(false)
            })
        }

        if(customerId || customerPhone){
            setLoadingHistory(true)
            fetchCustomerIdFromPhone(customerPhone, customerId).then((customer_id)=>{
                if(is_medical){
                    getListReceiptDetail({
                        sku: service.service_sku,
                        customer_id,
                        // receipt_type: 1,
                        limit: 0
                    }).then(({status, data})=>{
                        if(status){
                            setHistories(data.rows.map(item=> ({
                                key: item.receiptdt_id,
                                date: dayjs.unix(item.receiptdt_ctime).format('YYYY-MM-DD HH:mm'),
                                qty: item.receiptdt_qty
                            })))
                        }
                        setLoadingHistory(false)
                    }).catch(error=>{
                        setLoadingHistory(false)
                    })
                }
                if(is_diagnostic){
                    getListPrescription({
                        sku: service.service_sku,
                        customer_id,
                        status: 2,
                        limit: 0
                    }).then(({status, data})=>{
                        if(status){
                            setHistories(data.rows.map(item=> ({
                                key: item.id,
                                date: dayjs(item.created_at).format('YYYY-MM-DD HH:mm'),
                            })))
                        }
                        setLoadingHistory(false)
                    }).catch(error=>{
                        setLoadingHistory(false)
                    })
                }
                if(is_service){
                    getListServiceSchedule({
                        service_sku: service.service_sku,
                        customer_id,
                        status: 2,
                        limit: 0
                    }).then(({status, data})=>{
                        if(status){
                            setHistories(data.rows.map(item=> ({
                                key: item.id,
                                date: dayjs(item.created_at).format('YYYY-MM-DD HH:mm'),
                            })))
                        }
                        setLoadingHistory(false)
                    }).catch(error=>{
                        setLoadingHistory(false)
                    })
                }
            }).catch(error=>{
                setLoadingHistory(false)
            })
            
            
        }
    }
    return (
        <div className={classNames({'d-inline': inline})}>
            {prefix}
            <Tooltip title={is_dangerous ? is_dangerous.option_value || 'Dangerous catalog' : ''}>
                <span onClick={handleShowDetail} className={classNames('cursor-pointer', {'text-warning': is_dangerous})}>{!hideSku && <span><b>{service.service_sku}</b> - </span>}<span className={classNames({'font-weight-bold': boldName})}>{service.service_name}</span>{!hidePrice && !is_diagnostic && ` (${money(service.service_price || 0)})`} {!disabledClick && <FontAwesomeIcon className="text-info" icon={faQuestionCircle}/>}</span>
            </Tooltip>
            {children}
            <Modal
                open={showDetail}
                onCancel={()=> setShowDetail(false)}
                title={service.service_name}
                footer={null}
            >
                <div>
                    SKU: <Link to={`/service?q=${service.service_sku}`}>{service.service_sku}</Link>
                </div>
                {!is_diagnostic && <div>
                    {t('Price')}: {money(service.service_price || 0)}
                </div>}
                {is_medical && <div>
                    {t('Stock')}: {loading ? <Spin/> : <b className={classNames({'text-info': stock.stockprod_in_stock > 0, 'text-danger': stock.stockprod_in_stock <= 0})}>{stock.stockprod_in_stock}</b>} ({t('Store')}: {store?.store_name})
                </div>}
                {(customerId || customerPhone) && <Table
                    className="mt-2"
                    loading={loadingHistory}
                    dataSource={histories}
                    pagination={false}
                    title={()=> <span>{t('Customer usage history')}</span>}
                    bordered
                    columns={[
                        {
                            title: '#',
                            width: 30,
                            className: 'text-center',
                            render: (value, row, i, k) => (
                              <div>
                                {i + 1} 
                              </div>
                            )
                        },
                        {
                            title: t('Date'),
                            dataIndex: 'date',
                            key: 'date',
                            className: 'text-center'
                        },
                        ...(is_medical ? [{
                            title: t('Qty'),
                            width: 90,
                            dataIndex: 'qty',
                            key: 'qty',
                            className: 'text-center'
                        }] : [])
                    ]}
                />}
            </Modal>
        </div>
    )
}
const mapStateToProps = (state) => ({
    store: state.auth.info.profile.store
})

const mapDispatchToProps = {
    
}

export const FormatService = connect(mapStateToProps, mapDispatchToProps)(Component)