import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Table, Button, Row, Modal, Form, Input, Col, DatePicker } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { formatVND, showNotify, timeFormatStandard, historyParams, historyReplace, checkPermission, exportToXLS, parseBitwiseValues, parseBitwiseReasons } from '~/services/helper'
import { dateFormat, listDamage, priorityAssetDevice, reasonDamage, statusMaintenanceDevice } from '../../../constants/basic'
import dayjs from 'dayjs';
import { dateTimeFormat, isHasQrCode, screenResponsive } from '~/constants/basic'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faLink } from '@fortawesome/free-solid-svg-icons';
import { LinkOutlined } from '@ant-design/icons';
import tabList from '../config/tabList'
import Tab from '~/components/Base/Tab'
import { list as apiGetList } from '~/apis/assetDevice/broken'
import Dropdown from '~/components/Base/Dropdown'
import * as XLSX from 'xlsx';
import { MEDIA_URL_HR, URL_MEDIA_HR } from '~/constants';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
const FormatDate = 'YYYY-MM-DD';
const { RangePicker } = DatePicker;

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
            tempStocks: [],
            assetImage: null
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
        this.setState({ tempStocks })
        let params = historyParams();
        this.formSearchRef.current.setFieldsValue(params);
        let values = this.formSearchRef.current.getFieldsValue();
        this.getList(values);
    }


    /**
     * Get list
     */
    getList = (params = {}) => {
        this.setState({ loading: true })
        params = {
            ...params,
            from_date: params.date ? new Date(params.date[0]).toISOString().split('T')[0] : null,
            to_date: params.date ? new Date(params.date[1]).toISOString().split('T')[0] : null,
            offset: this.state.offset,
            limit: this.state.limit
        }
        delete params.date;
        historyReplace(params);
        let xhr = apiGetList(params);
        xhr.then(res => {
            this.setState({ loading: false })
            if (res.status) {
                this.setState({ datas: res.data.rows, total: res.data.total })
            } else {
                showNotify('Notify', res.message, 'error')
            }
        })
    }


    /**
     * Click add group
     * @param {*} asset 
     */
    clickViewImage = asset => {
        this.setState({ visible: true, assetImage: asset.medias})
    }

    /**
     * On cancel modal
     */
    onCancelModal = () => {
        this.setState({ visible: false, selectedRowKeys: [] })
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
     * On change page
     * @param {*} page 
     */
    onChangePage = page => {
        let values = this.formSearchRef.current.getFieldsValue();
        this.setState({ offset: (page - 1) * this.state.limit }, () => this.getList({ ...values }));
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
        try {
            const currentDate = dayjs().format('YYYY-MM-DD');
            const res = await apiGetList();

            if (res.status) {
                const data = res.data.rows;
                const dataExport = data.map(item => ({
                    'Product': item.product_name,
                    'Label Code': item.code,
                    'SKU': item.product_sku,
                    'Assigned To': item.staff ? item.staff.staff_name : '',
                    'Ngày mua': item.purchase_date ? dayjs(item.purchase_date).format('DD/MM/YYYY') : '',
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
        const { datas, visible, limit, offset, total, groups, selectedRowKeys } = this.state;
        let {t, baseData: { locations, cities } } = this.props
        
        const columns = [
            {
                title: t('name') + t(' ') + t('device'),
                render: r => {
                    return (
                        <>
                            {r.asset ? <>
                                {r.asset.product_name}
                                <small>
                                    <div>SKU: {r.asset.product_sku}</div>
                                    <div>S/N: {r.asset.serial_number}</div>
                                </small>
                            </> : 
                            r.asset_name
                            }
                        </>
                    );
                }
            },
            {
                title: t('code'),
                render: r => r.code

            },
            {
                title: t('hr:branch'),
                width: 150,
                render: r => {
                    let location = locations.find(l => r.location_id == l.id)
                    return location ? location.name : ''
                }
            },
            {
                title: t('city'),
                width: 150,
                render: r => {
                    let cityId = Object.keys(cities).find(id => r.city_id.toString() === id);
                    return cityId ? cities[cityId] : '';
                }
            },
            {
                title: t('hr:description_of_damage'),
                dataIndex : 'description'
            },
            {
                title: t('hr:reason_of_dame'),
                render: r => {
                    if (!r.reasons) {
                        return ''
                    }
                    let parseValue = parseBitwiseReasons(reasonDamage, r.reasons);
                    return parseValue.join(', ');

                }
            },
            {
                title: t('hr:category_dame'),
                render: r => {
                    if (!r.category_id){
                        return '';
                    }
                    return listDamage[r.category_id];
                }
            },
            {
                title: t('priority'),
                render: r => {
                    if (!r.priority){
                        return '';
                    }
                    return priorityAssetDevice[r.priority];
                }
            },
            {
                title: t('status'),
                render: r => {
                    if (!r.status){
                        return '';
                    }
                    return statusMaintenanceDevice[r.status];
                }
            },
            {
                title: t('date'),
                render: r => <small>
                    <span>Created at: {r.created_at} By <strong> #{ r.created_by }</strong> </span>
                    <br />
                    <span>Updated: {r.updated_at} </span>
                </small>
            },
            {
                title: t('hr:image'),
                align: 'center',
                render: r => {
                    return (
                        <div>
                            <Button
                                
                                type="primary"
                                onClick={() => this.clickViewImage(r)}
                            >
                                <FontAwesomeIcon icon={faEye} />
                            </Button>
                        </div>
                    )
                }
            },
            {
                title: t('hr:reference_task'),
                align: 'center',
                render: r => {
                    return (
                        <div>
                            {r.reference_task ? (
                                <a href={r.reference_task} target="_blank" rel="noopener noreferrer">
                                    <Button type="primary">
                                        <FontAwesomeIcon icon={faLink} />
                                    </Button>
                                </a>
                            ) : null}
                        </div>
                    )
                }
            }
        ]
        return (
            <>
                <PageHeader title={t('hr:maintenance') + (' ') + t('hr:device')} />
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
                            <Col xs={24} sm={24} md={24} lg={6} xl={4} >
                                <Form.Item name='keyword'>
                                    <Input placeholder={t('Name') + (', ') + t('SKU')+ (', ') + t('serial_number')+ (', ') + t('label code')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={4}>
                                <Form.Item name='date'>
                                    <RangePicker className='w-100' format={FormatDate} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={4} >
                                <Form.Item name='location_id'>
                                    <Dropdown datas={locations} defaultOption={t('location')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={3} >
                                <Form.Item name='city_id'>
                                    <Dropdown datas={cities} defaultOption={t('city')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={2} >
                                <Form.Item name='status'>
                                    <Dropdown datas={statusMaintenanceDevice} defaultOption={t('status')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={3} >
                                <Form.Item name='reasons'>
                                    <Dropdown datas={reasonDamage} defaultOption={t('reason')} />
                                </Form.Item>
                            </Col>
                            {/* <Col xs={24} sm={24} md={24} lg={6} xl={4} >
                                <Form.Item name='priority'>
                                    <Dropdown datas={priorityAssetDevice} defaultOption='--- Priority ---' />
                                </Form.Item>
                            </Col>  */}
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item>
                                    <Button type="primary" style={{ marginLeft: 8 }} htmlType="submit">
                                       {t('search')}
                                    </Button>
                                    {/* <Button type="primary" style={{ marginLeft: 8 }} onClick={this.exportList}>
                                        Export
                                    </Button> */}
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Row>
                {window.innerWidth < screenResponsive ?
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
                                    current: (offset / limit) + 1,
                                    total: total
                                }}
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
                            current: (offset / limit) + 1,
                            total: total
                        }}
                        loading={this.state.loading}
                    />
                }
                <Modal
                    open={visible}
                    onCancel={() => this.onCancelModal()}
                    onOk={this.handleSubmitForm.bind(this)}
                >
                    <div>
                        {this.state.assetImage && this.state.assetImage.length > 0 ? (
                            this.state.assetImage.map((item, key) => (
                                <div key={key}>
                                    <img src={MEDIA_URL_HR + item} style={{ width: '100%' }} />
                                </div>
                            ))
                        ) : (
                            <p>Don't have device image</p>
                        )}
                    </div>
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