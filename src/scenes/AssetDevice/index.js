import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Table, Button, Row, Modal, Form, Input, Col } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { formatVND, showNotify, timeFormatStandard, historyParams, historyReplace, checkPermission, exportToXLS } from '~/services/helper'
import dayjs from 'dayjs';
import { dateTimeFormat, isHasQrCode, screenResponsive } from '~/constants/basic'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import tabList from './config/tabList'
import Tab from '~/components/Base/Tab'
import { list as apiListGroup, connectAsset } from '~/apis/assetDevice/group'
import { getList as apiGetList } from '~/apis/assetDevice'
import Dropdown from '~/components/Base/Dropdown'
import * as XLSX from 'xlsx';
import AssetDeviceChart from '~/components/Company/Asset Device/chart'

export class index extends Component {

    constructor(props) {
        super(props)

        let params = historyParams();
        this.state = {
            loading: false,
            datas: [],
            limit: 30,
            offset: params.offset ? Number(params.offset) : 0,
            total: 0,
            visible: false,
            selectedRowKeys: [],
            groups: [],
            tempStocks : []
        }
        this.formSearchRef = React.createRef()
        this.formRef = React.createRef()
    }

    componentDidMount() {
        const {
            baseData: { stocks: baseDataStocks },
        } = this.props;
        let tempStocks = [];
        if (baseDataStocks) {
            baseDataStocks.map((s) =>
                tempStocks.push({ id: s.stock_id, name: s.stock_name })
            );
        }
        this.setState({tempStocks})
        let params = historyParams();
        this.formSearchRef.current.setFieldsValue(params);
        let values = this.formSearchRef.current.getFieldsValue();
        this.getList(values);
        this.getListGroup();
    }


    /**
     * Get list
     */
    getList = (params = {}) => {
        this.setState({ loading: true })
        params = {
            ...params,
            offset: this.state.offset,
            limit: this.state.limit,
        }
        historyReplace(params);
        let xhr = apiGetList(params);
        xhr.then(res => {
            this.setState({ loading: false })
            if(res.status) {
                this.setState({ datas: res.data.rows, total: res.data.total })
            } else {
                showNotify('Notify', res.message, 'error')
            }
        })
    }

    /**
     * Get list group
     */
    getListGroup = () => {
        let xhr = apiListGroup()
        xhr.then(res => {
            if(res.status){
                this.setState({ groups: res.data.rows })
            }
        })
    }

    /**
     * Click add group
     * @param {*} asset 
     */
    clickAddGroup = asset => {
        this.setState({ visible: true }, () => {
            if(this.formRef.current) {
                this.formRef.current.setFieldsValue({ asset_id: asset.id, group_id: asset.asset_device_group?.group_id })
            }
        })
    }

    /**
     * On cancel modal
     */
    onCancelModal = () => {
        this.setState({ visible: false , selectedRowKeys : []})
    }

    /**
     * Handle submit form
     */
    handleSubmitForm = () => {
        this.formRef.current.validateFields()
            .then((values) => {
                this.submitForm(values);
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    }

    /**
     * Submit form
     * @param {*} values 
     */
    submitForm = values => {
        if(this.state.selectedRowKeys.length){
            values = {
                ...values,
                asset_id : this.state.selectedRowKeys
            }
        }
        let valuesSearch = this.formSearchRef.current.getFieldsValue()
        let xhr = connectAsset(values)
        xhr.then(res => {
            if(res.status) {
                this.getList(valuesSearch);
                this.onCancelModal();
            }
        })
    }

    /**
     * On change page
     * @param {*} page 
     */
    onChangePage = page => {
        let values = this.formSearchRef.current.getFieldsValue();
        this.setState({ offset: ( page - 1) * this.state.limit }, () => this.getList({ ...values }));
    }

    /**
     * Submit search form
     * @param {*} values 
     */
    submitSearchForm = values => {
        this.setState({ page: 1, limit: 30, offet: 0 }, () => {
            this.getList(values)
        })
    }
    /**
     * OnSelect change
     * @param {*} selectedRowKeys 
     */
    onSelectChange = (selectedRowKeys) => {
        this.setState({ selectedRowKeys })
    }
    /**
     * On Start
     */
     onStart = () => {
        this.setState({ selectedRowKeys: [] })
    }
    async exportList() {
        let valuesSearch = this.formSearchRef.current.getFieldsValue()
        let { baseData : { stocks }} = this.props;
        try {
            const currentDate = dayjs().format('YYYY-MM-DD');
            const res = await apiGetList(valuesSearch);

            if (res.status) {
                const data = res.data.rows;
                const dataExport = data.map(item => ({
                    'Product': item.product_name,
                    'Label Code': item.code,
                    'QR Code': item?.qr_maping?.code,
                    'Stock':  stocks.find(s => s.stock_id == item.stock_id)?.stock_name ,
                    'PO' : item?.po_code.toString(),
                    'SKU': item.product_sku,
                    'Assigned To': item.staff ? item.staff.staff_name : '',
                    'Ngày mua': item.purchase_date ? timeFormatStandard(item.purchase_date, dateTimeFormat, true) : '',
                    'TG bảo hành': item.warranty_time,
                    'Nhóm': item.asset_device_group && item.asset_device_group.group ? item.asset_device_group.group.name : ''
                }));

                const wb = XLSX.utils.book_new();
                const ws = XLSX.utils.json_to_sheet(dataExport);

                // Set column widths (in pixels)
                const columnWidths = [
                    { wpx: 350 },
                    { wpx: 150 },
                    { wpx: 150 },
                    { wpx: 150 },
                    { wpx: 150 },
                    { wpx: 150 },
                    { wpx: 150 },
                    { wpx: 150 },
                    { wpx: 150 },
                    { wpx: 150 },
                ];

                // Apply column widths to the worksheet
                ws['!cols'] = columnWidths;

                // Add the worksheet to the workbook
                XLSX.utils.book_append_sheet(wb, ws, 'Exported Data');

                const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
                const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const fileName = `exported_data_${currentDate}.xlsx`;
                const url = URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;

                document.body.appendChild(a);
                a.click();

                document.body.removeChild(a);
                URL.revokeObjectURL(url);

            } else {
                showNotify('Notify', res.message, 'error');
            }
        } catch (error) {
            console.error('Error exporting data:', error);
            showNotify('Notify', 'Error exporting data', 'error');
        }
    }


    

    render() {
        const { datas, visible, limit, offset, total, groups , selectedRowKeys } = this.state;
        let { t, baseData: { stocks, locations } } = this.props
        const params = historyParams();
        
        const columns = [
            {
                title : 'No.',
                render: r => this.state.datas.indexOf(r) + 1 + this.state.offset,
            },
            {
                title: t('product'),
                render: r => {
                    return <>
                        {r.product_name}
                        <small>
                            <div>SKU: {r.product_sku}</div>
                            <div>S/N: {r.serial_number}</div>
                        </small>
                    </>
                }
            },
            {
                title: t('label') +(' ')+ t('code'),
                dataIndex: 'code'
            },
            {
                title:  t('qr_code'),
                width: '8%',
                render : r => r?.qr_maping?.code
            },
            {
                title:  t('stock'),
                render : r => stocks.find(s => s.stock_id == r.stock_id)?.stock_name
            },
            {
                title: t('po_code'),
                dataIndex: 'po_code'
            },
            {
                title: t('assign_to'),
                dataIndex: 'staff',
                render: staff => {
                    if(!staff) return '';
                    return <span>{staff.staff_name} <small><strong>#{staff.code}</strong></small></span>
                }
            },
            {
                title: t('purchase_date'),
                dataIndex: 'purchase_date',
                render: r => r ? timeFormatStandard(r, dateTimeFormat, true) : ''
            },
            { 
                title: t('warranty_time'),
                dataIndex: 'warranty_time'
            },
            {
                title: t('group'),
                render: r => {
                    if(r.asset_device_group && r.asset_device_group.group) {
                        return <> 
                            {checkPermission('hr-asset-device-update') ?
                                <Button type='link' onClick={() => this.clickAddGroup(r)}>{r.asset_device_group.group.name}</Button> 
                                : r.asset_device_group.group.name    
                        }
                        </>
                    }
                    return <>
                    {
                            checkPermission('hr-asset-device-create') ? 
                            <Button type='primary' size='small' icon={<FontAwesomeIcon icon={faPlus} />}
                                onClick={() => this.clickAddGroup(r)}
                            >
                                &nbsp; Thêm nhóm
                            </Button> : ''
                    }
                        
                    </>
                },
                align: 'center'
            }
        ]
        const rowSelection = {
            selectedRowKeys,
            onChange: value => this.onSelectChange(value),
        };

        const hasSelected = selectedRowKeys.length > 0;

        return (
            <>
                <PageHeader title={t('hr:asset_equipment')} />
                <Row className="card pl-3 pr-3 mb-3">
                    <div id="tab_responsive">
                        <div className='tab_content_mantenance_device'>
                            <Tab tabs={tabList(this.props)} />
                        </div>
                    </div>
                    <Form
                        className="pt-3"
                        ref={this.formSearchRef}
                        name="searchSkillForm"
                        onFinish={this.submitSearchForm.bind(this)}
                        layout="vertical"
                    >
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6} >
                                <Form.Item name='keyword'>
                                    <Input placeholder={t('name') + t(', ') + t('SKU') + t(', ') + t('hr:serial_number') + t(', ') + t('label') +(' ')+ t('code')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={4} >
                                <Form.Item name='group_id'>
                                    <Dropdown datas={groups} defaultOption={t('group')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={4} >
                                <Form.Item name='is_has_qr'>
                                    <Dropdown datas={isHasQrCode} defaultOption={t('qr_code')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={4} >
                                <Form.Item name='location_id'>
                                    <Dropdown datas={locations} defaultOption='--- Locations ---' />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={4} >
                                <Form.Item name='stock_id'>
                                    <Dropdown datas={this.state.tempStocks} defaultOption={t('stock')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item>
                                    <Button type="primary" style={{ marginLeft: 8 }} htmlType="submit">
                                       {t('search')}
                                    </Button>
                                    <Button type="primary" style={{ marginLeft: 8 }} onClick={() => this.exportList()}>
                                       {t('export_file')}
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Row>
                {params.location_id && !params.keyword ? <AssetDeviceChart history={this.props.history} params={params} /> : ''}
                <div  className='mb-2'>
                    {hasSelected ?
                        <Button  icon={<FontAwesomeIcon icon={faPlus} />} 
                        onClick={() => this.setState({visible: true})} type='primary'>{t('add')} {selectedRowKeys.length} {t('device') + t(' ') + t('hr:to_group')}</Button>
                        : ''}
                </div>
                <strong className='ml-2'>Total : {this.state.total}</strong>
                {window.innerWidth < screenResponsive  ? 
                    <div className='block_scroll_data_table'>
                        <div className='main_scroll_table'> 
                            <Table
                               columns={columns}
                               rowKey='id'
                               dataSource={datas}
                               pagination={{ 
                                   pageSize: limit, 
                                   showSizeChanger: false,
                                   onChange: page => this.onChangePage(page),
                                   current: (offset/limit) + 1,
                                   total: total
                               }}
                               rowSelection={rowSelection}
                               loading={this.state.loading}
                            />
                        </div>
                    </div>
                    :
                    <Table
                        columns={columns}
                        rowKey='id'
                        dataSource={datas}
                        pagination={{ 
                            pageSize: limit, 
                            showSizeChanger: false,
                            onChange: page => this.onChangePage(page),
                            current: (offset/limit) + 1,
                            total: total
                        }}
                        rowSelection={rowSelection}
                        loading={this.state.loading}
                    />
                }
                <Modal
                    open={visible}
                    onCancel={() => this.onCancelModal()}
                    onOk={this.handleSubmitForm.bind(this)}
                >
                    <Form className='p-3' ref={this.formRef}>
                        <Form.Item name='asset_id' hidden>
                            <Input />
                        </Form.Item>
                        <Form.Item name='group_id' rules={[{ required: true, message: t('hr:input_title') }]}>
                            <Dropdown datas={groups} />
                        </Form.Item>
                    </Form>
                </Modal>
            </>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    };
  }
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(index)