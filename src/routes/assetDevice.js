import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDesktop } from '@fortawesome/free-solid-svg-icons'
import AssetDevice from '~/scenes/AssetDevice'
import Group from '~/scenes/AssetDevice/Group'
import Part from '~/scenes/AssetDevice/Part'
import CriterionsLog from '~/scenes/AssetDevice/CriterionsLog'
import CriterionsLogForm from '~/scenes/AssetDevice/CriterionsLog/CriterionLogForm'
import DeviceLogFrom from '~/scenes/AssetDevice/DeviceLog/DeviceLogForm';
import DeviceLogReport from '~/scenes/AssetDevice/DeviceLog/Report'
import DeviceLog from '~/scenes/AssetDevice/DeviceLog';
import  AssetLocations  from '~/scenes/AssetDevice/Locations';
import CreateQRCode from "~/scenes/AssetDevice/QRCode/CreateQRCode";
import Print from "~/scenes/AssetDevice/QRCode/Print";
import GenerateQRCode from '~/scenes/AssetDevice/QRCode/GenerateQRCode';
import QRCode from '~/scenes/AssetDevice/QRCode';
import AssetDeviceReport from '~/scenes/AssetDevice/Report';
import MaintenanceDevice from '~/scenes/AssetDevice/MaintenanceDevice';
import { GroupAssetDeviceForm } from '~/scenes/AssetDevice/Group/GroupAssetDeviceForm';
import LocationDetail from '~/scenes/AssetDevice/LocationDetail';
import PrintQRLocationDetail from '~/scenes/AssetDevice/LocationDetail/PrintQRLocationDetail';

export default [
    {
        key: 'asset-device',
        name: 'Asset Device',
        component: AssetDevice,
        path: '/asset-device',
        template: 'main',
        icon: <span className='icon_menu icon_asset_device'></span>,
        // permission: 'inventory-packed-label-list'
        permissionOfChild: ['hr-asset-device-list' , 'hr-asset-device-location-list', 'hr-asset-device-group-list', 'hr-asset-device-log-list', 'hr-asset-device-report-list', 'hr-asset-device-qr-code-list'],
        children: [
            {
                key: 'asset-device',
                name: 'Asset Device',
                component: AssetDevice,
                path: '/asset-device',
                template: 'main',
                // permission: 'inventory-packed-label-list'
                permission: 'hr-asset-device-list',
            },
            {
                key: "asset-device-report",
                name: "Asset Device Report",
                component: AssetDeviceReport,
                path: "/asset-device/report",
                template: "main",
            },
            {
                key: 'asset-device.locations',
                name: 'Chi nhánh',
                component: AssetLocations,
                path: '/asset-device/locations',
                template: 'main',
                // hide: true,
                permission: 'hr-asset-device-location-list'
            },
            {
                key: 'asset-device.group',
                name: 'Nhóm bảo dưỡng/bảo trì',
                component: Group,
                path: '/asset-device/group',
                template: 'main',
                // hide: true,
                permission: 'hr-asset-device-group-list'
            },

            {
                key: 'asset-device.log',
                name: 'Lịch sử bảo trì',
                component: DeviceLog,
                path: '/asset-device/log',
                template: 'main',
                // hide: true,
                permission: 'hr-asset-device-log-list'
            },
            {
                key: 'asset-device.log.report',
                name: 'Thống kê',
                component: DeviceLogReport,
                path: '/asset-device/log/report',
                template: 'main',
                // hide: true,
                permission: 'hr-asset-device-report-list'
            },
            {
                key: "qrcode",
                name: "QR Code",
                component: QRCode,
                path: "/qrcode/list",
                template: "main",
                // hide: true,
                permission: 'hr-asset-device-qr-code-list'
            },
            {
                key: "asset-device.maintainance",
                name: "Maintenance Device",
                component: MaintenanceDevice,
                path: "/asset-device/maintenance",
                template: "main",
            },{   
                key: "location-detail",
                name: "Location Detail",
                component: LocationDetail,
                path: "/location-detail",
                template: "main",
                // hide: true,
                permission: 'hr-asset-device-location-detail-list'
            },
        ]
    },
    {
        key: 'asset-device.group.create',
        name: 'Asset Device Group Create',
        component: GroupAssetDeviceForm,
        path: '/asset-device/group/create',
        template: 'main',
        hide: true,
        permission: 'hr-asset-device-group-list'
    },
    {
        key: 'asset-device.group.edit',
        name: 'Asset Device Group Edit',
        component: GroupAssetDeviceForm,
        path: '/asset-device/group/edit/:id',
        template: 'main',
        hide: true,
        permission: 'hr-asset-device-group-list'
    },
    {
        key: 'asset-device-part',
        name: 'Asset Device Part',
        component: Part,
        path: '/asset-device/part/:group_id',
        template: 'main',
        hide: true
    },
    {
        key: 'asset-device-log-form',
        name: 'Asset Device Log Form',
        component: DeviceLogFrom,
        path: '/asset-device/log/edit',
        template: 'main',
        hide: true
    },
    {
        key: 'asset-device-criterions-log',
        name: 'Asset Device Criterions Log',
        component: CriterionsLog,
        path: '/asset-device/criterion-log',
        template: 'main',
        hide: true
    },
    {
        key: 'asset-device-criterions-log-form',
        name: 'Asset Device Criterions Log Form',
        component: CriterionsLogForm,
        path: '/asset-device/criterion-log/edit',
        template: 'main',
        hide: true
    },
    {
        key: "qrcode-generate",
        name: "QR Code Generate",
        component: GenerateQRCode,
        path: "/qrcode/generate",
        template: "main",
        hide: true
    },
    {
        key: "qrcode-create",
        name: "QR Code Create",
        component: CreateQRCode,
        path: "/qrcode/create",
        template: "main",
        hide: true
    },
    {
        key: "qrcode-edit",
        name: "QR Code Edit",
        component: CreateQRCode,
        path: "/qrcode/edit/:id",
        template: "main",
        hide: true
    },
    {
        key: "qrcode-print",
        name: "QR Code Print",
        component: Print,
        path: "/qrcode/print",
        template: "print",
        hide: true
    },
    {
        key: "location-detail-print",
        name: "Location Detail Print",
        component: PrintQRLocationDetail,
        path: "/location-detail/print",
        template: "print",
        hide: true
    },

];