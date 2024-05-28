import React, { useState, useEffect } from 'react'
import { Modal, Button, Table, notification, Spin } from 'antd'
import money from '~/utils/money'
import classNames from 'classnames'
import StoreDisplay from '~/share/components/StoreDisplay';
import { useTranslation } from 'react-i18next';
import { getOptionLabel, options_receipt_status, options_receipt_type } from '~/share/options';
import { getDetailByCode } from '~/apis/accounting/receipt'
import dayjs from 'dayjs'
import { FormatService } from './FormatService';

const DetailReceipt = ({ actionElm, code, showCustomer }) => {
    const [visible, setVisible] = useState(false)
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState(null)
    const receipt = data?.receipt
    const customer = data?.customer
    const services = { ...(data?.products ? data.products.reduce((acc, cur)=>{
        acc[cur.product_sku] = {
            ...cur,
            service_sku: cur.product_sku,
            service_name: cur.product_name,
        }
        return acc
    }, {}) : {}), ...(data?.services ? data.services.reduce((acc, cur)=>{
        acc[cur.service_sku] = cur
        return acc
    }, {}) : {})}
    useEffect(() => {
        let isSubscribed = true
        if(code && visible){
            setLoading(true)
            getDetailByCode(code).then(({status, data})=>{
                if (isSubscribed) {
                    setLoading(false)
                    if(status && data.receipt){
                        setData(data)
                    }else{
                        notification.error({
                            message: 'Get Detail Error'
                        })
                    }
                }
            }).catch(error=>{
                setLoading(false)
                console.log(error)
                notification.error({
                    message: 'Get Detail Error'
                })
            })
        }
        return () => {
            isSubscribed = false
        }
    }, [code, visible])
    const { t } = useTranslation()
    const data_table =   receipt ? [
        { key: 'receipt_code', label: t('Code'), value: `${receipt.receipt_code} (ID: ${receipt.receipt_id})`},
        { key: 'receipt_status', label: t('Status'), value: getOptionLabel(options_receipt_status, receipt.receipt_status)},
        { key: 'receipt_type', label: t('Type'), value:  getOptionLabel(options_receipt_type, receipt.receipt_type)},
        // { key: 'receipt_store', label: t('Store'), value: `${state.list.store_obj[receipt.receipt_store_id]} (ID: ${receipt.receipt_store_id})`},
        { key: 'receipt_user_name', label: t('Created By'), value: data?.user ? `${data.user.name} (ID: ${data.user.id})` : data.receipt_user_id},
        { key: 'receipt_cdate', label: t('Created At'), value: receipt.receipt_cdate && dayjs.unix(receipt.receipt_cdate).format('YYYY-MM-DD HH:mm')},
        { key: 'receipt_udate', label: t('Last modified'), value: receipt.receipt_udate && dayjs.unix(receipt.receipt_udate).format('YYYY-MM-DD HH:mm')},
        { key: 'receipt_store_id', label: t('Store'), value: <StoreDisplay id={receipt.receipt_store_id}/>},
    ] : []
    const customer_table= customer ? [
        { key: 'customer_name', label: t('Name'), value: `${customer.customer_name} (ID: ${customer.customer_id})`},
        { key: 'customer_phone', label: t('Phone'), value: customer.customer_phone},
        { key: 'customer_email', label: t('Email'), value: customer.customer_email},
        { key: 'customer_address', label: t('Address'), value: customer.customer_address}
    ] : []
    const columns = [
        {
            dataIndex: 'label',
            key: 'label',
            render: (value) => t(value)
        },
        {
            dataIndex: 'value',
            key: 'value',
        },
    ];
    const receipt_detail_columns = [
        {
            title: '#',
            width: 40,
            className: 'text-center',
            render: (value, row, i, k) => i+1
        },
        // {
        //     title: t('SKU'),
        //     dataIndex: 'receiptdt_sku',
        //     key: 'receiptdt_sku',
        //     className: 'text-center',
        // },
        {
            title: t('Name'),
            dataIndex: 'receiptdt_sku',
            key: 'receiptdt_sku',
            render: (value, record)=>(
                <div>
                    {/* {services[value]?.service_name} */}
                    <FormatService customerId={data?.customer?.customer_id} service={services[value]} hidePrice>
                        {record.receiptdt_combo_sku && <span> - {t('COMBO')}: {record.receiptdt_combo_sku}</span>}
                    </FormatService>
                    {/* <div>
                        ({t('QTY')}: { money(record.receiptdt_qty, false) } - {t('COMBO')}: {record.receiptdt_combo_sku})
                    </div> */}
                </div>
            )
        },
        {
            title: t('Price'),
            dataIndex: 'receiptdt_price',
            key: 'receiptdt_price',
            className: 'text-right',
            width: 100,
            render: (value)=>(
                money(value)
            )
        },
        {
            title: t('Discount'),
            dataIndex: 'receiptdt_discount',
            key: 'receiptdt_discount',
            className: 'text-right',
            width: 100,
            render: (value)=>(
                money(value)
            )
        },
        {
            title: t('Amount'),
            width: 100,
            className: 'text-right',
            render: (record)=>(
                money((record.receiptdt_price - record.receiptdt_discount) * record.receiptdt_qty)
            )
        },
    ]
    return (
        <>
            <span className="cursor-pointer cursor-highlight" onClick={()=>setVisible(true)}>{actionElm}</span>
            <Modal
                open={visible}
                onCancel={()=> setVisible(false)}
                width={1000}
                title={<h4 className="h4 mb-0">{t('Receipt Info')}</h4>}
                footer={[
                    <Button key="back" onClick={()=> setVisible(false)} type="primary">
                      Close
                    </Button>
                ]}
            >
                <Spin spinning={loading}>
                    <div className="row">
                        {showCustomer && <div className="col-sm-6 mb-3">
                            <Table size="small" bordered showHeader={false} title={() => <b>{t('Customer Info')}</b>} dataSource={customer_table} columns={columns} pagination={false}/>
                        </div>}
                        <div className={classNames('mb-3', {'col-sm-6': showCustomer, 'col-12': !showCustomer})}>
                            <Table size="small" bordered showHeader={false} title={() => <b>{t('Receipt Info')}</b>} dataSource={data_table} columns={columns} pagination={false}/>
                        </div>
                        <div className="col-12 mb-3">
                            <Table 
                                size="small"
                                rowKey="receiptdt_id" 
                                bordered 
                                title={() => <b>{t('Receipt Detail')}</b>} 
                                dataSource={receipt?.items || []} 
                                columns={receipt_detail_columns} 
                                pagination={false}
                                scroll={{ x: 900 }}
                                summary={() => {
                                    return (
                                    <>
                                        <tr>
                                            <td colSpan={2} rowSpan={5}>
                                                {t('Note')}:
                                                <div>{receipt?.receipt_desc}</div>
                                            </td>
                                            <th colSpan={2}>{t('SubTotal')}</th>
                                            <td className="text-right">
                                                <b>{money(receipt?.receipt_subtotal)}</b>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={2}>
                                                <span><b>{t('Discount')}</b>{receipt?.voucher && <span>({receipt?.voucher.voucher_code})</span>}</span>
                                                {receipt?.voucher && <div>
                                                    {receipt?.voucher.voucher_price > 0 && <span>{money(receipt?.voucher.voucher_price)}</span>}
                                                    {receipt?.voucher.voucher_percent > 0 && <span> {receipt?.voucher.voucher_price && '-'} {receipt?.voucher.voucher_percent}%</span>}
                                                    {receipt?.voucher.voucher_desc && <div>{receipt?.voucher.voucher_desc}</div>}
                                                </div>}
                                            </td>
                                            <td className="text-right">
                                                <b>{money(receipt?.receipt_discount)}</b>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th colSpan={2}>{t('Total')}</th>
                                            <td className="text-right">
                                                <b>{money(receipt?.receipt_total)}</b>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={2}>
                                                <b>{t('Payment')}</b>({t('Type')}:{receipt?.receipt_payment})	
                                                {receipt?.receipt_cash > 0 && <div><b>{t('CASH')}:</b> {money(receipt?.receipt_cash)}</div>}
                                                {receipt?.receipt_card > 0 && <div><b>{t('CARD')}:</b> {money(receipt?.receipt_card)}</div>}
                                                {receipt?.receipt_customer_balance > 0 && <div><b>{t('BALANCE')}:</b> {money(receipt?.receipt_customer_balance)}</div>}
                                            </td>
                                            <td className="text-right">
                                                <b>{money(receipt?.receipt_cash + receipt?.receipt_card + receipt?.receipt_customer_balance)}</b>
                                            </td>
                                        </tr>
                                        <tr>
                                            <th colSpan={2}>{t('Balance')}</th>
                                            <td className="text-right">
                                                <b>{money(receipt?.receipt_balance)}</b>
                                            </td>
                                        </tr>
                                    </>
                                    );
                                }}
                            />
                        </div>
                    </div>
                </Spin>
            </Modal>
        </>
    )
}
export default DetailReceipt
