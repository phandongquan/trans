import React from 'react';
import classNames from 'classnames'

export const order_status = [
    {value: '1', type_color: 'warning', short_label: 'Pending', label: <span>Status: <b>Pending</b></span>},
    {value: '2', type_color: 'primary', short_label: 'Processing', label: <span>Status: <b>Processing</b></span>},
    {value: '4', short_label: 'Shipped', label: <span>Status: <b>Shipped</b></span>},
    {value: '6', type_color: 'success', short_label: 'Completed', label: <span>Status: <b>Completed</b></span>},
    {value: '8', type_color: 'danger', short_label: 'Cancel', label: <span>Status: <b>cancel</b></span>},
    {value: '10', type_color: 'secondary', short_label: 'Return', label: <span>Status: <b>Return</b></span>},
    {value: '12', type_color: '', short_label: 'Re-processing', label: <span>Status: <b>Re-processing</b></span>},
    {value: '14', type_color: '', short_label: 'Delivered', label: <span>Status: <b>Delivered</b></span>},
    {value: '16', type_color: '', short_label: 'Packed', label: <span>Status: <b>Packed</b></span>},
    {value: '18', type_color: '', short_label: 'Picking', label: <span>Status: <b>Picking</b></span>},
    {value: '20', type_color: '', short_label: 'Partial delivery', label: <span>Status: <b>Partial delivery</b></span>},
]
export const order_status_by_name = {
    pending: 1,
    processing: 2,
    shipped: 4,
    completed: 6,
    cancel: 8,
    return: 10,
    're-processing': 12,
    delivery: 14,
    packed: 16,
    picking: 18,
    'partial-delivery': 2
}
export const order_status_filter = [
    {value: '1', short_label: 'Pending', label: <span>Status: <b>Pending</b></span>},
    {value: '2', short_label: 'Processing', label: <span>Status: <b>Processing</b></span>},
    {value: '16', short_label: 'Packed', label: <span>Status: <b>Packed</b></span>},

    {value: '102', short_label: 'Packed(Print)', label: <span>Status: <b>Packed</b>(Print)</span>},
    {value: '103', short_label: 'Delay', label: <span>Status: <b>Delay</b></span>},
    {value: '104', short_label: 'Shipping Date', label: <span>Status: <b>Shipping Date</b></span>},

    {value: '12', short_label: 'Re-processing', label: <span>Status: <b>Re-processing</b></span>},
    {value: '18', short_label: 'Picking', label: <span>Status: <b>Picking</b></span>},
    {value: '8', short_label: 'Cancel', label: <span>Status: <b>cancel</b></span>},
]

export const order_shipping = [
    {value: '1', short_label: 'HASAKI', label: <span>Shipping: <b>HASAKI</b></span>},
    {value: '2', short_label: 'POST', label: <span>Shipping: <b>POST</b></span>},
    {value: '3', short_label: 'SHOPEE', label: <span>Shipping: <b>SHOPEE</b></span>},
    {value: '4', short_label: 'PICK UP', label: <span>Shipping: <b>PICK UP</b></span>},
    {value: '12', short_label: 'DHL', label: <span>Shipping: <b>DHL</b></span>},
    {value: '101', short_label: 'N/A', label: <span>Shipping: <b>N/A</b></span>},
]
export const order_ischeck_status = [
    {value: '1', type_color: 'success', short_label: 'OK', label: <span>Check Is: <b>OK</b></span>},
    {value: '2', type_color: 'warning', short_label: 'No Answer', label: <span>Check Is: <b>No Answer</b>(NA)</span>},
    // {value: '3', short_label: 'Wrong Number', label: <span>Check Is: <b>Wrong Number</b></span>},
    // {value: '4', short_label: 'Not Verify', label: <span>Check Is: <b>4</b></span>},
    {value: '0', type_color: 'danger', short_label: 'Not Verify', label: <span>Check Is: <b>Not Verify</b>(NV)</span>},
    // {value: '111', short_label: 'Waiting Reply', label: <span>Check Is: <b>Waiting Reply</b>(RE)</span>},
    // {value: '112', short_label: 'Waiting Confirm', label: <span>Check Is: <b>Waiting Confirm</b>(CO)</span>},
    // {value: '105', short_label: 'Waiting Internal transfer', label: <span>Check Is: <b>Waiting Internal transfer</b>(IT)</span>},
    // {value: '109', short_label: 'Waiting PO', label: <span>Check Is: <b>Waiting PO</b>(PO)</span>},
    // {value: '106', short_label: 'Waiting Out Stock', label: <span>Check Is: <b>Waiting Out Stock</b>(OS)</span>},
    // {value: '107', short_label: 'Waiting VAT', label: <span>Check Is: <b>Waiting VAT</b>(VA)</span>},
    // {value: '108', short_label: 'Waiting Bank Transfer', label: <span>Check Is: <b>Waiting Bank Transfer</b>(BT)</span>},
    // {value: '110', short_label: 'Other', label: <span>Check Is: <b>Other</b>(OT)</span>},
]
export const order_reason_delay = [
    // {value: '5', short_label: 'Not Verify', label: <span>Check Is: <b>Not Verify</b></span>},
    // {value: '1', short_label: 'OK', label: <span>Check Is: <b>OK</b></span>},
    // {value: '2', short_label: 'No Answer', label: <span>Check Is: <b>No Answer</b>(NA)</span>},
    {value: 'waiting_rely', short_label: 'Waiting Reply', label: <span>Reason: <b>Waiting Reply</b>(RE)</span>},
    {value: 'waiting_confirm', short_label: 'Waiting Confirm', label: <span>Reason: <b>Waiting Confirm</b>(CO)</span>},
    {value: 'waiting_internal_transfer', short_label: 'Waiting Internal transfer', label: <span>Reason: <b>Waiting Internal transfer</b>(IT)</span>},
    {value: 'waiting_po', short_label: 'Waiting PO', label: <span>Reason: <b>Waiting PO</b>(PO)</span>},
    {value: 'waiting_out_stock', short_label: 'Waiting Out Stock', label: <span>Reason: <b>Waiting Out Stock</b>(OS)</span>},
    {value: 'waiting_vat', short_label: 'Waiting VAT', label: <span>Reason: <b>Waiting VAT</b>(VA)</span>},
    {value: 'waiting_bank_transfer', short_label: 'Waiting Bank Transfer', label: <span>Reason: <b>Waiting Bank Transfer</b>(BT)</span>},
    {value: 'pending_other', short_label: 'Other', label: <span>Reason: <b>Other</b>(OT)</span>},
    {value: 'wrong_number', short_label: 'Wrong Number', label: <span>Reason: <b>Wrong Number</b>(WN)</span>},
    {value: 'no_answer', short_label: 'No Answer', label: <span>Reason: <b>No Answer</b>(NA)</span>},
]

export const order_city = [
    {value: '3', short_label: 'HCM', label: <span>Shipping: <b>HCM</b></span>},
    {value: '1001', short_label: 'Other', label: <span>Shipping: <b>Other</b></span>},
    {value: '1002', short_label: 'N/A', label: <span>Shipping: <b>N/A</b></span>}
]
export const order_priority = [
    {value: '1', short_label: 'Normal', label: <span>Priority: <b>Normal</b></span>},
    {value: '2', short_label: 'High', label: <span>Priority: <b>High</b></span>},
    {value: '3', short_label: 'Express', label: <span>Priority: <b>Express</b></span>},
    {value: '16', short_label: 'Mall', label: <span>Priority: <b>Mall</b></span>},
]
export const order_pre_order = [
    {value: '-1', short_label: 'All', label: <span>Priority: <b>All</b></span>},
    {value: '0', short_label: 'Order', label: <span>Priority: <b>Order</b></span>},
    {value: '1', short_label: 'Pre-Order', label: <span>Priority: <b>Pre-Order</b></span>},
    {value: '-2', short_label: 'Original', label: <span>Priority: <b>Original</b></span>},
    {value: '-3', short_label: 'Order + Pre-Order', label: <span>Priority: <b>Order + Pre-Order</b></span>},
]

export const products_type = [
    {value: '1', short_label: 'Normal', label: <span>Type: <b>Normal</b></span>},
    {value: '2', short_label: 'Combo', label: <span>Type: <b>Combo</b></span>},
    {value: '3', short_label: 'Material', label: <span>Type: <b>Material</b></span>},
    {value: '4', short_label: 'Gift', label: <span>Type: <b>Gift</b></span>},
    {value: '5', short_label: 'Spa', label: <span>Type: <b>Spa</b></span>},
]

export const product_categories = [
    {value: 1, short_label: 'Mẹ và Bé', label: <span>Category: <b>Mẹ và Bé</b></span>},
    {value: 2, short_label: 'Sức khỏe - Làm đẹp', label: <span>Category: <b>Sức khỏe - Làm đẹp</b></span>},
    {value: 4, short_label: 'SPA', label: <span>Category: <b>SPA</b></span>},
    {value: 8, short_label: 'VPP/Thiết bị', label: <span>Category: <b>VPP/Thiết bị</b></span>},
]

export const options_stock_type = [
    {value: 1, type_color: 'danger', short_label: 'Out Stock', label: <span>Type: <b>Out Stock</b></span>},
    {value: 2, type_color: 'success', short_label: 'In Stock', label: <span>Type: <b>In Stock</b></span>},
]

export const options_product_return_type = [
    {value: 1, type_color: 'info', short_label: 'On Store', label: <span>Type: <b>On Store</b></span>},
    {value: 2, type_color: 'warning', short_label: 'At Home', label: <span>Type: <b>At Home</b></span>},
]

export const options_product_return_status = [
    {value: 2, type_color: 'warning', short_label: 'Pending', label: <span>Status: <b>Pending</b></span>},
    {value: 1, type_color: 'success', short_label: 'Approved', label: <span>Status: <b>Approved</b></span>},
]

export const getOptionLabel = (options, value, uppercase=true, label_if_not, hide_if_note)=>{
    if(value === 'none'){
        return
    }
    let option = options.find(item=>item.value === value)// || { label: label_if_not || value, short_label: label_if_not || value}
    if(hide_if_note && !option){
        return null
    }
    if(!option){
        option = { label: label_if_not || value, short_label: label_if_not || value}
    }
    let label = <span className={classNames({'text-uppercase' : uppercase})}>{option.short_label}</span>
    if(option.type_color){
        label = <span className={classNames(`badge badge-${option.type_color} text-uppercase`, {'text-uppercase' : uppercase})}>{option.short_label}</span>
    }
    return label
}
