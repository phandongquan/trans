import React from 'react';
import classNames from 'classnames'
import Trans from '~/utils/Trans'

export const options_payment_types = [
    {value: '5', short_label: 'Gift card', label: <span><Trans value="Payment Type"/>: <b><Trans value="Gift card"/></b></span>},
    {value: '1', short_label: 'Tiền mặt', label: <span><Trans value="Payment Type"/>: <b><Trans value="Tiền mặt"/></b></span>},
    {value: '3', short_label: 'Thẻ', label: <span><Trans value="Payment Type"/>: <b><Trans value="Thẻ"/></b></span>},
    {value: '4', short_label: 'Voucher', label: <span><Trans value="Payment Type"/>: <b><Trans value="Voucher"/></b></span>},
    {value: '7', short_label: 'Esteem Gift', label: <span><Trans value="Payment Type"/>: <b><Trans value="Esteem Gift"/></b></span>},
    {value: '8', short_label: 'Mobile Gift', label: <span><Trans value="Payment Type"/>: <b><Trans value="Mobile Gift"/></b></span>},
    {value: '2', short_label: 'Chuyển khoản', label: <span><Trans value="Payment Type"/>: <b><Trans value="Chuyển khoản"/></b></span>},
    {value: '6', short_label: 'Balance', label: <span><Trans value="Payment Type"/>: <b><Trans value="Balance"/></b></span>},
    {value: '9', short_label: 'QR Pay', label: <span><Trans value="Payment Type"/>: <b><Trans value="QR Pay"/></b></span>},
]
export const options_payment_companys = [
    {value: '2', short_label: 'Hasaki', label: <span><Trans value="Company"/>: <b><Trans value="Hasaki"/></b></span>},
    {value: '3', short_label: 'Got It', label: <span><Trans value="Company"/>: <b><Trans value="Got It"/></b></span>},
    {value: '1', short_label: 'Mobile Gift', label: <span><Trans value="Company"/>: <b><Trans value="Mobile Gift"/></b></span>},
    {value: '4', short_label: 'VNPAY', label: <span><Trans value="Company"/>: <b><Trans value="VNPAY"/></b></span>},
]
export const options_yes_no = [
    {value: '1', type_color: 'success', short_label: 'Yes', label: <span><b><Trans value="Yes"/></b></span>},
    {value: '0', type_color: 'danger', short_label: 'No', label: <span><b><Trans value="No"/></b></span>},
]

export const options_service_schedule_status = [
    {value: '1', type_color: 'warning', short_label: 'Pending', label: <span><Trans value="Status"/>: <b><Trans value="Pending"/></b></span>},
    {value: '2', type_color: 'success', short_label: 'Confirmed', label: <span><Trans value="Status"/>: <b><Trans value="Confirmed"/></b></span>},
    {value: '3', type_color: 'secondary', short_label: 'Cancel', label: <span><Trans value="Status"/>: <b><Trans value="Cancel"/></b></span>}
]
export const options_service_schedule_status_filter = [
    {value: '0', label: <span><Trans value="Status"/>: <b><Trans value="All Status"/></b></span>},
    ...options_service_schedule_status
]
export const options_service_schedule_commission = [
    {value: '1', short_label: 'Fixed', label: <span><Trans value="Commission"/>: <b><Trans value="Fixed"/></b></span>},
    {value: '2', short_label: 'Customize', label: <span><Trans value="Commission"/>: <b><Trans value="Customize"/></b></span>},
    {value: '3', short_label: 'Warranty', label: <span><Trans value="Commission"/>: <b><Trans value="Warranty"/></b></span>},
    {value: '4', type_color: 'danger', short_label: 'Complaint', label: <span><Trans value="Commission"/>: <b className="text-danger"><Trans value="Complaint"/></b></span>},
    {value: '5', short_label: 'Promotion', label: <span><Trans value="Commission"/>: <b><Trans value="Promotion"/></b></span>},
]
export const options_service_schedule_extra_id = [
    {value: '1', short_label: 'Primary', label: <span><Trans value="Type"/>: <b><Trans value="Primary"/></b></span>},
    {value: '2', short_label: 'Extra', label: <span><Trans value="Type"/>: <b><Trans value="Extra"/></b></span>},
]
export const options_service_schedule_type = [
    {value: '1', type_color: 'info', short_label: 'Customer Request', label: <span><Trans value="Request Type"/>: <b><Trans value="Customer"/></b></span>},
    {value: '2', type_color: 'warning', short_label: 'Special Request', label: <span><Trans value="Request Type"/>: <b><Trans value="Special"/></b></span>},
]

export const options_service_type = [
    {value: '1', short_label: 'Normal', label: <span><Trans value="Type"/>: <b><Trans value="Normal"/></b></span>},
    {value: '2', short_label: 'Combo', label: <span><Trans value="Type"/>: <b><Trans value="Combo"/></b></span>},
    {value: '3', short_label: 'Medic', label: <span><Trans value="Type"/>: <b><Trans value="Medic"/></b></span>},
    {value: '4', short_label: 'Diagnostic', label: <span><Trans value="Type"/>: <b><Trans value="Diagnostic"/></b></span>},
    {value: '5', short_label: 'Payment', label: <span><Trans value="Type"/>: <b><Trans value="Payment"/></b></span>},
    {value: '6', short_label: 'Voucher', label: <span><Trans value="Type"/>: <b><Trans value="Voucher"/></b></span>}
]
export const options_service_type_filter = [
    {value: '0', label: <span><Trans value="Type"/>: <b><Trans value="All Type"/></b></span>},
    ...options_service_type
]

export const options_reminder_type = [
    {value: '1', short_label: 'Events',label: <span><Trans value="Type"/>: <b><Trans value="Events"/></b></span>},
    {value: '2', short_label: 'Schedule', label: <span><Trans value="Type"/>: <b><Trans value="Schedule"/></b></span>},
    {value: '3', short_label: 'Appointment', label: <span><Trans value="Type"/>: <b><Trans value="Appointment"/></b></span>},
    {value: '4', short_label: 'Complaint', label: <span><Trans value="Type"/>: <b><Trans value="Complaint"/></b></span>},
    {value: '5', short_label: 'Survey', label: <span><Trans value="Type"/>: <b><Trans value="Survey"/></b></span>},
]
export const options_reminder_type_filter = [
    {value: '0', label: <span><Trans value="Type"/>: <b><Trans value="All Type"/></b></span>},
    ...options_reminder_type
]
export const options_reminder_status = [
    {value: '1', short_label: 'No Answer', label: <span><Trans value="Status"/>: <b><Trans value="No Answer"/></b></span>},
    {value: '2', short_label: 'Not Sure', label: <span><Trans value="Status"/>: <b><Trans value="Not Sure"/></b></span>},
    {value: '3', short_label: 'Yes', label: <span><Trans value="Status"/>: <b><Trans value="Yes"/></b></span>},
    {value: '4', short_label: 'Cancel', label: <span><Trans value="Status"/>: <b><Trans value="Cancel"/></b></span>},
    {value: '11', short_label: 'CallBack', label: <span><Trans value="Status"/>: <b><Trans value="CallBack"/></b></span>},
    {value: '22', short_label: 'No Feedback', label: <span><Trans value="Status"/>: <b><Trans value="No Feedback"/></b></span>},
    {value: '33', short_label: 'Consulted', label: <span><Trans value="Status"/>: <b><Trans value="Consulted"/></b></span>},
    {value: '34', short_label: 'Success(Receipt)', label: <span><Trans value="Status"/>: <b><Trans value="Success(Receipt)"/></b></span>},
    {value: '44', short_label: 'Processed', label: <span><Trans value="Status"/>: <b><Trans value="Processed"/></b></span>},
]
export const options_reminder_status_filter = [
    {value: '0', label: <span><Trans value="Status"/>: <b><Trans value="All Status"/></b></span>},
    ...options_reminder_status
]
export const options_feedback_status = [
    {value: '1', short_label: 'No Answer', label: <span><Trans value="Status"/>: <b><Trans value="No Answer"/></b></span>},
    {value: '2', short_label: 'Not Sure', label: <span><Trans value="Status"/>: <b><Trans value="Not Sure"/></b></span>},
    {value: '3', short_label: 'Yes', label: <span><Trans value="Status"/>: <b><Trans value="Yes"/></b></span>},
    {value: '4', short_label: 'Cancel', label: <span><Trans value="Status"/>: <b><Trans value="Cancel"/></b></span>},
    {value: '11', short_label: 'CallBack', label: <span><Trans value="Status"/>: <b><Trans value="CallBack"/></b></span>},
    {value: '22', short_label: 'No Feedback', label: <span><Trans value="Status"/>: <b><Trans value="No Feedback"/></b></span>},
    {value: '33', short_label: 'Consulted', label: <span><Trans value="Status"/>: <b><Trans value="Consulted"/></b></span>},
    {value: '34', short_label: 'Success', label: <span><Trans value="Status"/>: <b><Trans value="Success(Receipt)"/></b></span>},
    {value: '44', short_label: 'Processed', label: <span><Trans value="Status"/>: <b><Trans value="Processed"/></b></span>},
]
export const options_feedback_status_filter = [
    {value: '0', label: <span><Trans value="Status"/>: <b><Trans value="All Status"/></b></span>},
    ...options_feedback_status
]
export const options_module_feedback_type = [
    {value: '0', short_label: 'Khiếu nại', label: <span><Trans value="Type"/>: <b><Trans value="Khiếu nại"/></b></span>},
    {value: '1', short_label: 'Góp ý', label: <span><Trans value="Type"/>: <b><Trans value="Góp ý"/></b></span>},
]
export const options_module_feedback_status = [
    {value: '0', type_color: 'secondary', short_label: 'Cancel', label: <span><Trans value="Status"/>: <b><Trans value="Cancel"/></b></span>},
    {value: '1', type_color: 'warning', short_label: 'Pending', label: <span><Trans value="Status"/>: <b><Trans value="Pending"/></b></span>},
    {value: '2', type_color: 'info', short_label: 'Verified', label: <span><Trans value="Status"/>: <b><Trans value="Verified"/></b></span>},
    {value: '3', type_color: 'success', short_label: 'Completed', label: <span><Trans value="Status"/>: <b><Trans value="Completed"/></b></span>},
]
export const options_module_feedback_status_report = [
    {value: '0', type_color: 'secondary', short_label: 'Cancel', label: <span><Trans value="Status"/>: <b><Trans value="Cancel"/></b></span>},
    {value: '1', type_color: 'warning', short_label: 'Pending', label: <span><Trans value="Status"/>: <b><Trans value="Pending"/></b></span>},
    {value: '2', type_color: 'info', short_label: 'Verified', label: <span><Trans value="Status"/>: <b><Trans value="Verified"/></b></span>},
    {value: '3', type_color: 'success', short_label: 'Completed', label: <span><Trans value="Status"/>: <b><Trans value="Completed"/></b></span>},
    {value: '100', type_color: 'danger', short_label: 'Incomplete', label: <span><Trans value="Status"/>: <b><Trans value="Incomplete"/></b></span>},
]
export const options_module_feedback_reference_type = [
    {value: 'hotline', short_label: 'Hotline', label: <span><Trans value="Source"/>: <b><Trans value="Hotline"/></b></span>},
    {value: 'facebook', short_label: 'Facebook', label: <span><Trans value="Source"/>: <b><Trans value="Facebook"/></b></span>},
    {value: 'survey', short_label: 'Survey', label: <span><Trans value="Source"/>: <b><Trans value="Survey"/></b></span>},
    {value: 'offline', short_label: 'Offline', label: <span><Trans value="Source"/>: <b><Trans value="Offline"/></b></span>},
]
export const options_module_feedback_object_type = [
    // {value: '1', short_label: 'Hiệu quả/ Phương pháp điều trị', label: <Trans value="Hiệu quả/ Phương pháp điều trị"/>},
    // {value: '2', short_label: 'Thái độ nhân viên', label: <Trans value="Thái độ nhân viên"/>},
    // {value: '3', short_label: 'Quy trình thực hiện', label: <Trans value="Quy trình thực hiện"/>},
    // {value: '4', short_label: 'Nhân viên', label: <Trans value="Nhân viên"/>},
    // {value: '5', short_label: 'Kỹ thuật viên', label: <Trans value="Kỹ thuật viên"/>},
    // {value: '6', short_label: 'Bác sĩ', label: <Trans value="Bác sĩ"/>},
    // {value: '7', short_label: 'Không gian/địa điểm phục vụ', label: <Trans value="Không gian/địa điểm phục vụ"/>},
    // {value: '8', short_label: 'Chất lượng MMTB/NVL', label: <Trans value="Chất lượng MMTB/NVL"/>},
    // {value: '9', short_label: 'Chất lượng sản phẩm', label: <Trans value="Chất lượng sản phẩm"/>},
    // {value: '10', short_label: 'Chất lượng dịch vụ', label: <Trans value="Chất lượng dịch vụ"/>},
    // {value: '11', short_label: 'Thái độ shipper', label: <Trans value="Thái độ shipper"/>},
    // {value: '12', short_label: 'Thời gian giao hàng', label: <Trans value="Thời gian giao hàng"/>},
    // {value: '13', short_label: 'Chất lượng sản phẩm', label: <Trans value="Chất lượng sản phẩm"/>},
    // {value: '14', short_label: 'Chương trình khuyến mãi', label: <Trans value="Chương trình khuyến mãi"/>},
    // {value: '15', short_label: 'Đóng gói', label: <Trans value="Đóng gói"/>},
    {value: '2', short_label: 'Thái độ nhân viên', label: <Trans value="Thái độ nhân viên"/>},
    {value: '13', short_label: 'Chất lượng sản phẩm', label: <Trans value="Chất lượng sản phẩm"/>},
    {value: '10', short_label: 'Chất lượng dịch vụ', label: <Trans value="Chất lượng dịch vụ"/>},
    {value: '7', short_label: 'Không gian/địa điểm phục vụ', label: <Trans value="Không gian/địa điểm phục vụ"/>},
    {value: '11', short_label: 'Thái độ shipper', label: <Trans value="Thái độ shipper"/>},
    {value: '12', short_label: 'Thời gian giao hàng', label: <Trans value="Thời gian giao hàng"/>},
    {value: '14', short_label: 'Chương trình khuyến mãi', label: <Trans value="Chương trình khuyến mãi"/>},
    {value: '15', short_label: 'Đóng gói', label: <Trans value="Đóng gói"/>}
]
export const options_module_feedback_processing_time = [
    {value: '1440', short_label: '> 1 ngày', label: <Trans value="> 1 ngày"/>},
    {value: '2880', short_label: '> 2 ngày', label: <Trans value="> 2 ngày"/>},
    {value: '4320', short_label: '> 3 ngày', label: <Trans value="> 3 ngày"/>},
    {value: '10080', short_label: '> 7 ngày', label: <Trans value="> 7 ngày"/>},
]

export const options_reminder_priority_filter = [
    {value: '0', label: <span><Trans value="Priority"/>: <b><Trans value="All Priority"/></b></span>},
    {value: '1', label: <span><Trans value="Priority"/>: <b><Trans value="Hight"/></b></span>}
]
export const options_reminder_priority = [
    {value: '0', type_color: 'default', label: <span><Trans value="Priority"/>: <b><Trans value="Normal"/></b></span>},
    {value: '1', type_color: 'danger', label: <span><Trans value="Priority"/>: <b><Trans value="Hight"/></b></span>}
]

export const options_time = [
    {value: '1', short_label: 'AM', label: <span><Trans value="Time"/>: <b><Trans value="AM"/></b></span>},
    {value: '2', short_label: 'PM', label: <span><Trans value="Time"/>: <b><Trans value="PM"/></b></span>},
]

export const options_status = [
    {value: '1', type_color: 'warning', short_label: 'Pending', label: <span><Trans value="Status"/>: <b><Trans value="Pending"/></b></span>},
    {value: '2', type_color: 'success', short_label: 'Completed', label: <span><Trans value="Status"/>: <b><Trans value="Completed"/></b></span>},
]
export const options_status_filter = [
    {value: '0', short_label: 'All Status', label: <span><Trans value="Status"/>: <b><Trans value="All Status"/></b></span>},
    ...options_status
]
export const options_staff_service_schedule_status = [
    {value: '11', type_color: 'success', short_label: 'Available', label: <span><Trans value="Status"/>: <b><Trans value="Available"/></b></span>},
    {value: '1', type_color: 'info', short_label: 'Pending', label: <span><Trans value="Status"/>: <b><Trans value="Pending"/></b></span>},
    {value: '2', type_color: 'primary', short_label: 'Confirmed', label: <span><Trans value="Status"/>: <b><Trans value="Confirmed"/></b></span>},
    {value: '4', type_color: 'secondary', short_label: 'Cancel', label: <span><Trans value="Status"/>: <b><Trans value="Cancel"/></b></span>},
]
export const options_active = [
    {value: '1', type_color: 'success', short_label: 'Active', label: <span><Trans value="Status"/>: <b><Trans value="Active"/></b></span>},
    {value: '2', type_color: 'danger', short_label: 'Inactive', label: <span><Trans value="Status"/>: <b><Trans value="Inactive"/></b></span>},
]

export const options_active_filter = [
    {value: '0', short_label: 'All Status', label: <span><Trans value="Status"/>: <b><Trans value="All Status"/></b></span>},
    ...options_status
]

export const options_receipt_status = [
    ...options_status
]
export const options_receipt_status_filter = [
    ...options_status_filter
]
export const options_receipt_type = [
    {value: '1', type_color: 'primary', short_label: 'Payment', label: <span><Trans value="Type"/>: <b><Trans value="Payment"/></b></span>},
    {value: '3', type_color: 'info', short_label: 'Services', label: <span><Trans value="Type"/>: <b><Trans value="Services"/></b></span>}
]
export const options_receipt_type_filter = [
    {value: '0', short_label: 'All Type', label: <span><Trans value="Type"/>: <b><Trans value="All Type"/></b></span>},
    ...options_receipt_type
]


export const options_receipt_item_type = [
    {value: '1', short_label: 'Service', label: <span><Trans value="Type"/>: <b><Trans value="Service"/></b></span>},
    {value: '2', short_label: 'Product', label: <span><Trans value="Type"/>: <b><Trans value="Product"/></b></span>},
    {value: '3', short_label: 'Order', label: <span><Trans value="Type"/>: <b><Trans value="Order"/></b></span>}
]

export const options_service_material_unit = [
    {value: '1', short_label: 'ML', label: <span><Trans value="Unit"/>: <b><Trans value="ML"/></b></span>},
    {value: '2', short_label: 'GR', label: <span><Trans value="Unit"/>: <b><Trans value="GRAM"/></b></span>},
    {value: '3', short_label: 'PCS', label: <span><Trans value="Unit"/>: <b><Trans value="PCS"/></b></span>},
    {value: '4', short_label: 'UI', label: <span><Trans value="Unit"/>: <b><Trans value="UI"/></b></span>},
    {value: '5', short_label: 'MET', label: <span><Trans value="Unit"/>: <b><Trans value="MET"/></b></span>}
]

export const options_service_material_status = [
    {value: '1', type_color: 'danger', short_label: 'Required', label: <span><Trans value="Status"/>: <b><Trans value="Required"/></b></span>},
    {value: '2', type_color: 'info', short_label: 'Option', label: <span><Trans value="Status"/>: <b><Trans value="Option"/></b></span>},
    {value: '4', type_color: 'secondary', short_label: 'Remove', label: <span><Trans value="Status"/>: <b><Trans value="Remove"/></b></span>},
]

export const options_staff_service_schedule_commission = [
    {value: '1', short_label: 'Full', label: <span><Trans value="Commission"/>: <b><Trans value="Full"/></b></span>},
    {value: '2', short_label: 'Share', label: <span><Trans value="Commission"/>: <b><Trans value="Share"/></b></span>},
    {value: '3', short_label: 'Warranty', label: <span><Trans value="Commission"/>: <b><Trans value="Warranty"/></b></span>},
]

export const options_customer_schedule_commission_type = [
    {value: '3', short_label: 'Warranty', label: <span><Trans value="Commission"/>: <b><Trans value="Warranty"/></b></span>},
    {value: '4', short_label: 'Complaint', label: <span><Trans value="Commission"/>: <b><Trans value="Complaint"/></b></span>},
    {value: '5', short_label: 'Promotion', label: <span><Trans value="Commission"/>: <b><Trans value="Promotion"/></b></span>},
]
export const options_customer_service_status = [
    {value: '1', type_color: 'success', short_label: 'COMPLETED', label: <span><Trans value="Status"/>: <b><Trans value="COMPLETED"/></b></span>},
    {value: '2', type_color: 'warning', short_label: 'WARRANTY', label: <span><Trans value="Status"/>: <b><Trans value="WARRANTY"/></b></span>},
    {value: '3', type_color: 'info', short_label: 'SCHEDULE', label: <span><Trans value="Status"/>: <b><Trans value="SCHEDULE"/></b></span>},
    {value: '4', type_color: 'secondary', short_label: 'CANCEL', label: <span><Trans value="Status"/>: <b><Trans value="CANCEL"/></b></span>},
]

export const options_online_offline = [
    {value: '1', type_color: 'success', label: <span><Trans value="Type"/>: <b><Trans value="Online"/></b></span>},
    {value: '-1', type_color: 'secondary', label: <span><Trans value="Type"/>: <b><Trans value="Offline"/></b></span>}
]

export const options_overdue = [
    // {value: '0', short_label: 'OverDue', label: <Trans value="OverDue"/>},
    {value: '1', short_label: '>1 Hour', label: <Trans value=">1 Hour"/>},
    {value: '2', short_label: '>2 Hours', label: <Trans value=">2 Hours"/>},
    {value: '12', short_label: '>12 Hours', label: <Trans value=">12 Hours"/>}
]
export const options_expired_in = [
    {value: '0', short_label: 'Expired', label: <Trans value="Expired"/>},
    {value: '15', short_label: '<= 15', label: <Trans value="<= 15"/>},
    {value: '30', short_label: '<= 30', label: <Trans value="<= 30"/>},
    {value: '60', short_label: '<= 60', label: <Trans value="<= 60"/>},
    {value: '90', short_label: '<= 90', label: <Trans value="<= 90"/>},
    {value: '120', short_label: '<= 120', label: <Trans value="<= 120"/>},
    {value: '240', short_label: '<= 240', label: <Trans value="<= 240"/>},
    {value: '360', short_label: '<= 360', label: <Trans value="<= 360"/>},
]
export const options_file_type = [
    {value: '1', short_label: 'Avatar', label: <Trans value="Avatar"/>},
    {value: '2', short_label: 'Signature', label: <Trans value="Signature"/>},
    {value: '4', short_label: 'Spa', label: <Trans value="Spa"/>},
    {value: '8', short_label: 'PO', label: <Trans value="PO"/>},
    {value: '16', short_label: 'Inventory', label: <Trans value="Inventory"/>},
    {value: '32', short_label: 'Accounting', label: <Trans value="Accounting"/>},
    {value: '64', short_label: 'Delivery', label: <Trans value="Delivery"/>},
    {value: '128', short_label: 'HR', label: <Trans value="HR"/>},
    {value: '1024', short_label: 'Contract', label: <Trans value="Contract"/>},
    {value: '4096', short_label: 'Vendor Contract', label: <Trans value="Vendor Contract"/>},
]
export const options_booking_status = [
    {value: '1', type_color: 'info', short_label: 'Pending', label: <span><Trans value="Status"/>: <b><Trans value="Pending"/></b></span>},
    {value: '2', type_color: 'success', short_label: 'Confirmed', label: <span><Trans value="Status"/>: <b><Trans value="Confirmed"/></b></span>},
    {value: '3', type_color: 'secondary', short_label: 'No Show', label: <span><Trans value="Status"/>: <b><Trans value="No Show"/></b></span>},
    {value: '4', type_color: 'danger', short_label: 'Cancel', label: <span><Trans value="Status"/>: <b><Trans value="Cancel"/></b></span>},
]
export const options_promotion_type = [
    {value: '1', short_label: 'Hóa đơn', label: <Trans value="Hóa đơn"/>},
    {value: '2', short_label: 'Hàng hóa', label: <Trans value="Hàng hóa"/>},
    {value: '3', short_label: 'Hóa đơn và Hàng hóa', label: <Trans value="Hóa đơn và Hàng hóa"/>}
]

export const options_promotion_group = [
    {value: '1', short_label: 'SPA', label: <Trans value="SPA"/>},
    {value: '2', short_label: 'Clinic', label: <Trans value="Clinic"/>},
    {value: '3', short_label: 'Shopee', label: <Trans value="Shopee"/>},
]

export const options_answer_point = [
    {value: '1', short_label: '1', label: <span><Trans value="Point"/>: <b>1</b></span>},
    {value: '2', short_label: '2', label: <span><Trans value="Point"/>: <b>2</b></span>},
    {value: '3', short_label: '3', label: <span><Trans value="Point"/>: <b>3</b></span>},
    {value: '4', short_label: '4', label: <span><Trans value="Point"/>: <b>4</b></span>},
    {value: '5', short_label: '5', label: <span><Trans value="Point"/>: <b>5</b></span>}
]

export const options_max_answer_point = [
    {value: '1', short_label: '<= 1', label: <span><Trans value="Point"/>: <b>{'<='} 1</b></span>},,
    {value: '2', short_label: '<= 2', label: <span><Trans value="Point"/>: <b>{'<='} 2</b></span>},
    {value: '3', short_label: '<= 3', label: <span><Trans value="Point"/>: <b>{'<='} 3</b></span>},
    {value: '4', short_label: '<= 4', label: <span><Trans value="Point"/>: <b>{'<='} 4</b></span>},
    {value: '5', short_label: '<= 5', label: <span><Trans value="Point"/>: <b>{'<='} 5</b></span>}
]

export const options_question_type = [
    {value: '0', short_label: 'Radio', label: <span><Trans value="Type"/>: <b>Radio</b></span>},
    {value: '1', short_label: 'Text', label: <span><Trans value="Type"/>: <b>Text</b></span>}
]
export const options_input_type = [
    {value: 'radio', short_label: 'Radio', label: <span><Trans value="Type"/>: <b>Radio</b></span>},
    {value: 'text', short_label: 'Text', label: <span><Trans value="Type"/>: <b>Text</b></span>}
]
export const options_medical_record_input_type = [
    {value: 'customer_name', short_label: 'Customer name', label: <span><Trans value="Type"/>: <b>Customer name</b></span>},
    {value: 'customer_phone', short_label: 'Customer Phone', label: <span><Trans value="Type"/>: <b>Customer Phone</b></span>},
    {value: 'customer_gender', short_label: 'Customer Gender', label: <span><Trans value="Type"/>: <b>Customer Gender</b></span>},
    {value: 'customer_year', short_label: 'Customer year of birth', label: <span><Trans value="Type"/>: <b>Customer year of birth</b></span>},
    {value: 'customer_address', short_label: 'Customer address', label: <span><Trans value="Type"/>: <b>Customer address</b></span>},
    {value: 'customer_career', short_label: 'Customer career', label: <span><Trans value="Type"/>: <b>Customer career</b></span>},

    {value: 'number_of_visits', short_label: 'Number of visits', label: <span><Trans value="Type"/>: <b>Number of visits</b></span>},
    {value: 'text', short_label: 'Text', label: <span><Trans value="Type"/>: <b>Text</b></span>},
    {value: 'textarea', short_label: 'Textarea', label: <span><Trans value="Type"/>: <b>Textarea</b></span>},
    {value: 'yesno', short_label: 'Yes/No', label: <span><Trans value="Type"/>: <b>Yes/No</b></span>},
    {value: 'select', short_label: 'Select', label: <span><Trans value="Type"/>: <b>Select</b></span>},
    {value: 'image', short_label: 'Image', label: <span><Trans value="Type"/>: <b>Image</b></span>},
]
export const options_medical_record_input_block = [
    {value: '1', short_label: 'Block 1', label: <span><Trans value="Type"/>: <b>Block 1</b></span>},
    {value: '2', short_label: 'Block 2', label: <span><Trans value="Type"/>: <b>Block 2</b></span>},
]

export const options_medical_record_input_col = [...Array(12)].map((_, index)=> (
    {value: (index + 1) +'', short_label: `${index+1} columns`, label: <span><Trans value="Columns"/>: <b>{index + 1}</b></span>}
))

export const options_question_for = [
    {value: '0', short_label: 'Offline', label: <span><Trans value="Type"/>: <b>Offline</b></span>},
    {value: '1', short_label: 'Online', label: <span><Trans value="Type"/>: <b>Online</b></span>}
]
export const options_medical_record_priority = [
    {value: '0', short_label: 'Normal', label: <span><Trans value="Priority"/>: <b>Normal</b></span>},
    {value: '1', short_label: 'Hight', label: <span><Trans value="Priority"/>: <b>Hight</b></span>},
    {value: '2', short_label: 'Hight when has value', label: <span><Trans value="Priority"/>: <b>Hight when has value</b></span>},
]


export const options_service_options = [
    {value: 'is_reminder', short_label: 'Reminder', label: <Trans value="Reminder"/>},
    {value: 'share_commission', short_label: 'Share commission', label: <Trans value="Share commission"/>},
    {value: 'required_prescription', short_label: 'Request a doctor\'s prescription', label: <Trans value="Request a doctor's prescription"/>},
    {value: 'dangerous_catalog', short_label: 'Dangerous catalog', label: <Trans value="Dangerous catalog"/>},
    {value: 'doctor_absent', short_label: 'Only sold when the doctor is absent', label: <Trans value="Only sold when the doctor is absent"/>},
    {value: 'attached_printing', short_label: 'Attached when printing', label: <Trans value="Attached when printing"/>},
]
export const options_service_parameter_type = [
    {value: 'point', short_label: 'Point', label: <Trans value="Point"/>},
    {value: 'full_face', short_label: 'Full face', label: <Trans value="Full face"/>},
]

export const options_voucher_status = [
    {value: '1', type_color: 'info', short_label: 'Active', label: <span><Trans value="Status"/>: <b><Trans value="Active"/></b></span>},
    {value: '2', type_color: 'success', short_label: 'Used', label: <span><Trans value="Status"/>: <b><Trans value="Used"/></b></span>},
    {value: '100', type_color: 'warning', short_label: 'Unused', label: <span><Trans value="Status"/>: <b><Trans value="Unused"/></b></span>},
    {value: '4', type_color: 'secondary', short_label: 'Deleted', label: <span><Trans value="Status"/>: <b><Trans value="Deleted"/></b></span>},
]

export const options_voucher_type = [
    {value: '1', short_label: 'Product', label: <span><Trans value="Type"/>: <b><Trans value="Product"/></b></span>},
    {value: '2', short_label: 'Service', label: <span><Trans value="Type"/>: <b><Trans value="Service"/></b></span>},
]

export const options_web_booking_status = [
    {value: '1', type_color: 'info', short_label: 'Waiting', label: <span><Trans value="Status"/>: <b><Trans value="Waiting"/></b></span>},
    {value: '2', type_color: 'success', short_label: 'Called', label: <span><Trans value="Status"/>: <b><Trans value="Called"/></b></span>},
]

export const options_staff_position = [
    {value: '1', short_label: 'Director', label: <span><Trans value="Position"/>: <b><Trans value="Director"/></b></span>},
    {value: '8', short_label: 'Manager', label: <span><Trans value="Position"/>: <b><Trans value="Manager"/></b></span>},
    {value: '10', short_label: 'Assistant Manager', label: <span><Trans value="Position"/>: <b><Trans value="Assistant Manager"/></b></span>},
    {value: '11', short_label: 'Supervisor', label: <span><Trans value="Position"/>: <b><Trans value="Supervisor"/></b></span>},
    {value: '12', short_label: 'Assistant Supervisor', label: <span><Trans value="Position"/>: <b><Trans value="Assistant Supervisor"/></b></span>},
    {value: '2', short_label: 'Doctor', label: <span><Trans value="Position"/>: <b><Trans value="Doctor"/></b></span>},
    {value: '3', short_label: 'Engineer', label: <span><Trans value="Position"/>: <b><Trans value="Engineer"/></b></span>},
    {value: '5', short_label: 'Leader', label: <span><Trans value="Position"/>: <b><Trans value="Leader"/></b></span>},
    {value: '7', short_label: 'Sub Leader', label: <span><Trans value="Position"/>: <b><Trans value="Sub Leader"/></b></span>},
    {value: '13', short_label: 'Specialist', label: <span><Trans value="Position"/>: <b><Trans value="Specialist"/></b></span>},
    {value: '6', short_label: 'Staff', label: <span><Trans value="Position"/>: <b><Trans value="Staff"/></b></span>},
    {value: '4', short_label: 'Học việc', label: <span><Trans value="Position"/>: <b><Trans value="Học việc"/></b></span>},
]


export const options_account_locale = [
    {value: 'vi', short_label: 'Tiếng Việt', label: <Trans value="Tiếng Việt"/>},
    {value: 'en', short_label: 'English', label: <Trans value="English"/>},
]

export const options_customer_medical_records_status = [
    {value: '1', type_color: 'info', short_label: 'Pending', label: <span><Trans value="Status"/>: <b><Trans value="Pending"/></b></span>},
    {value: '2', type_color: 'success', short_label: 'Active', label: <span><Trans value="Status"/>: <b><Trans value="Active"/></b></span>},
    {value: '0', type_color: 'secondary', short_label: 'Cancel', label: <span><Trans value="Status"/>: <b><Trans value="Cancel"/></b></span>},
]

export const options_checklist_status = [
    {value: '3', type_color: 'warning', short_label: 'Request', label: <span><Trans value="Status"/>: <b><Trans value="Request"/></b></span>},
    {value: '1', type_color: 'info', short_label: 'Pending', label: <span><Trans value="Status"/>: <b><Trans value="Pending"/></b></span>},
    {value: '2', type_color: 'success', short_label: 'Confirmed', label: <span><Trans value="Status"/>: <b><Trans value="Confirmed"/></b></span>},
]

export const options_checklist_total_time = [
    {value: 4*60*60, type_color: 'warning', short_label: 'Request', label: <span><Trans value="Time"/>{'>='} <b>4H</b></span>},
    {value: 8*60*60, type_color: 'info', short_label: 'Pending', label: <span><Trans value="Time"/>{'>='} <b>8H</b></span>},
    {value: 12*60*60, type_color: 'success', short_label: 'Confirmed', label: <span><Trans value="Time"/>{'>='} <b>12H</b></span>},
    {value: 24*60*60, type_color: 'success', short_label: 'Confirmed', label: <span><Trans value="Time"/>{'>='} <b>24H</b></span>},
]

export const options_internal_transfer_status = [
    {value: '1', type_color: 'info', short_label: 'Confirm', label: <span><Trans value="Status"/>: <b><Trans value="Confirm"/></b></span>},
    {value: '2', type_color: 'info', short_label: 'Export', label: <span><Trans value="Status"/>: <b><Trans value="Export"/></b></span>},
    {value: '4', type_color: 'secondary', short_label: 'Cancel', label: <span><Trans value="Status"/>: <b><Trans value="Cancel"/></b></span>},
    {value: '6', type_color: 'success', short_label: 'Completed', label: <span><Trans value="Status"/>: <b><Trans value="Completed"/></b></span>},
    {value: '8', type_color: 'secondary', short_label: 'Draft', label: <span><Trans value="Status"/>: <b><Trans value="Draft"/></b></span>},
    {value: '16', type_color: 'info', short_label: 'Waiting PO', label: <span><Trans value="Status"/>: <b><Trans value="Waiting PO"/></b></span>},
]
export const options_internal_transfer_receiving = [
    {value: '1', type_color: 'success', short_label: 'Correct', label: <span><b><Trans value="Correct"/></b></span>},
    {value: '2', type_color: 'danger', short_label: 'InCorrect', label: <span><b><Trans value="InCorrect"/></b></span>},
]
export const options_internal_transfer_priority = [
    {value: '1', type_color: 'secondary', short_label: 'Normal', label: <span><Trans value="Priorify"/>: <b><Trans value="Normal"/></b></span>},
    {value: '2', type_color: 'warning', short_label: 'Hight', label: <span><Trans value="Priorify"/>: <b><Trans value="Hight"/></b></span>},
    {value: '4', type_color: 'danger', short_label: 'Express', label: <span><Trans value="Priorify"/>: <b><Trans value="Express"/></b></span>},
]

export const options_sku_type = [
    {value: '1', short_label: 'Product', label: <span><Trans value="Type"/>: <b><Trans value="Product"/></b></span>},
    {value: '2', short_label: 'Service', label: <span><Trans value="Type"/>: <b><Trans value="Service"/></b></span>},
]

export const getOptionLabel = (options, value, custom)=>{
    const { uppercase=true, label_if_not, hide_if_not, hideColor } = custom || {}
    if(value === 'none'){
        return
    }
    let option = options.find(item=>String(item.value) === String(value))// || { label: label_if_not || value, short_label: label_if_not || value}
    if(hide_if_not && !option){
        return null
    }
    if(!option){
        option = { label: label_if_not || value, short_label: label_if_not || value}
    }
    let label = <span className={classNames({'text-uppercase' : uppercase})}>{<Trans value={option.short_label}/>}</span>
    if(option.type_color && !hideColor){
        label = <span className={classNames(`badge badge-${option.type_color} text-uppercase pt-1`, {'text-uppercase' : uppercase, 'text-white': option.type_color == 'warning'})}>{<Trans value={option.short_label}/>}</span>
    }
    return label
}

