import { Workbook } from 'exceljs';
const workbook = new Workbook();
const headerVertical = {
    qrCode: 'QRCode',
    code: 'Code',
    value: 'Value',
}
const headerVerticalList = {
    count: 'STT',
    code: 'Code',
    deviceId: 'Device ID',
    name: 'Product name',
    product_sku : 'Product sku',
    po_code : 'Po code',
    stock : 'Stock',
    assign_to : 'Assigned to',
    location: 'Location',
    floor : 'Floor',
    address : 'Location detail',
    asset_group : 'Asset group',
    created_at: 'Created at',
    created_by: 'Created by',
    modified: 'Modified',
    modified_by: 'Modified by',
    note : 'Note',
    diff_location : 'Diff location',
    image: 'Link HR',
}
export function getHeaderTitleList() {
    let headerFormat = []
    Object.keys(headerVerticalList).map(h => headerFormat.push(headerVerticalList[h]))
    return [headerFormat];
}

export function getHeaderTitle() {
    let headerFormat = []
    Object.keys(headerVertical).map(h => headerFormat.push(headerVertical[h]))
    return [headerFormat];
}
export function getHeaderHeight() {
    return 20;
}

export function getWidthColumn() {
    return [30, 30, 30];
}
export function getHeightRow() {
    return 200;
}
