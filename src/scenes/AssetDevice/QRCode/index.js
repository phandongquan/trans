import React, { Component } from 'react'
import { connect } from 'react-redux';
import {
    Row,
    Col,
    Form,
    Table,
    Select,
    Input,
    Button,
    Modal,
    InputNumber,
    Image,
    Dropdown as DropdownAnt
} from "antd";

import { PageHeader } from '@ant-design/pro-layout';
import Dropdown from "~/components/Base/Dropdown";
import { getListType, create , getListQR as apiGetList, apiLogQR, apiLogDevice, detail} from "~/apis/qrCode";
import  CustomQRCode  from "qrcode.react";
import { Link } from 'react-router-dom'
import tabList from "../config/tabList";
import Tab from "~/components/Base/Tab";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faImage, faPen, faPrint, faPlus, faCaretDown, faSortDown, faSortUp, faPlusCircle, faMinusCircle } from "@fortawesome/free-solid-svg-icons";
import tabsQR from './config/tabsQR';
import { checkPermission, getThumbnailHR, getURLHR, showNotify ,historyParams , historyReplace} from '~/services/helper';
import dayjs from 'dayjs';
import {dataFloors, isHasAsset, screenResponsive } from '~/constants/basic'
import { getHeaderTitleList } from './config/GenQRCodeConfig'
import { MEDIA_URL_HR, URL_HR, WS_HR } from '~/constants';
import { list as apiListGroup } from '~/apis/assetDevice/group'
import moment from 'moment'
import ExcelJS from 'exceljs';
import './config/qrCode.css'

const defineNameLog = {
    location_id : 'Locations',
    floor : 'Floor',
    // asset_id : 'Assets',
    group_device_id: 'Group devices',
    address : 'Address',
    note : 'Note',
}
export class QRCode extends Component {
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        let params = historyParams();
        this.state = {
            datas: [],
            loading: false,
            datasType: [],
            visible : false ,
            data : {},
            dataGroups : [],
            datasViewLog : [],
            visibleHistoryLog : false ,
            datasLogMaintenance : [] ,
            limit: 30,
            offset: params.offset ? Number(params.offset) : 0,
            total: 0,
        };
    }
    componentDidMount() {
        // this.getListType();
        let params = historyParams();
        this.formRef.current.setFieldsValue(params);
        let values = this.formRef.current.getFieldsValue();
        this.getListQRCode(values);
        this.getListAssetsGroup()
    }
    // async getListType() {
    //     let response = await getListType();
    //     if (response.status) {
    //         this.setState({ datasType: response.data.types });
    //     }
    // }
    getListAssetsGroup (){
        let xhr = apiListGroup()
        xhr.then(res => {
            if(res.status) {
                this.setState({ dataGroups: res.data.rows })
            }
        })
    }
    async getListQRCode(params = {}) {
        this.setState({ loading : true });
        params = {
            ...params,
            offset:this.state.offset,
            limit: params.limit ? params.limit : this.state.limit
        }
        historyReplace(params);
        let response = await apiGetList(params)
        if(response.status) {
            let datas = response.data.rows
            this.setState({ loading : false , datas: datas  ,datasType :  response.data.types , total: response.data.total});
        }else{
            showNotify('Notification' , response.message , 'error');
        }
    }
    async getLogQR(data){
        let params = {
            id : data.id ,
            type : 'QrMapping'
        }
        let paramsDevice  = {
            asset_id : data?.asset_id
        }
        let response = await apiLogQR(params)
        if(data?.asset_id){
            let responseDevice = await apiLogDevice(paramsDevice)
            if(responseDevice.status){
                this.setState({datasViewLog : response.data , datasLogMaintenance : responseDevice.data.rows})
            }
        }
       
    }
    submitForm(values){
        this.setState({offset : 0 } , () => this.getListQRCode(values))
    }
    popupModal(data) {
        let xhr = detail(data.id)
        xhr.then(res => {
            if (res.status) {
                this.getLogQR(data)
                this.setState({ visible: true, data: res.data.detail});
            }
        })
        xhr.catch(err => {
            console.log(err)
        })

    }
    openImage(data){
        let {datas}= this.state
        let dataFindIndex = datas.findIndex(d => d.id == data.id)
        data.visibleImage = !data.visibleImage
        datas[dataFindIndex] = data
        this.setState({ datas })
    }
    exportFileExcel = async () => {
        this.setState({ loading: true });
        const { baseData: { locations , stocks} } = this.props;
        let exportData = [];
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data Sheet');
        let params = this.formRef.current.getFieldsValue();
        params.limit = -1;
        params.offset = 0;
        try {
            const res = await apiGetList(params);
            if (res.status) {
                exportData = res.data.rows;
                let header = getHeaderTitleList();
                worksheet.addRows(header);
                const columnWidth = 40;
                let count = 1;
                let columnWidths = [5, 15, 25, 25, 15, 15, 25 ,25 ,25 , 10 ,15 ,20 ,15 ,15 , 15 ,15, 15 , 25 ,25] 
                worksheet.columns.forEach((column , index) => {
                    column.width = columnWidths[index];
                });
                exportData.forEach((data) => {
                    let diff_location = 'No'
                    if (data.asset && data.asset.stock_id) {
                        let locStock = stocks.find(s => s.stock_id == data.asset.stock_id)
                        if (locStock && data.location_id && locStock.location_id != data.location_id) {
                            diff_location = 'Yes'
                        }
                    }
                    worksheet.addRow([
                        count++,
                        data.code,
                        data?.asset?.serial_number ? data?.asset.serial_number : data.other?.label_code,
                        data?.asset?.product_name,
                        data?.asset?.product_sku,
                        data?.asset?.po_code.toString(),
                        stocks.find(s => s.stock_id == data?.asset?.stock_id)?.stock_name,
                        data?.asset?.staff?.staff_name,
                        locations.find(l => l.id == data.location_id)?.name,
                        dataFloors[data.other?.floor] ,
                        (data.location_detail_id && data.location_detail) ? data?.location_detail?.area + ' - ' +  dataFloors[data?.location_detail?.floor]  : data.address,
                        this.state.dataGroups.find(d => d.id == (data?.other?.group_device_id))?.name,
                        data.created_at,
                        data.created_by_user?.staff_name + '(' + data.created_by_user?.code + ')',
                        data.updated_at,
                        data.updated_by_user?.staff_name + '(' + data.updated_by_user?.code + ')',
                        data?.other?.note,
                        diff_location ,
                        data.images.length ? `https://hr.hasaki.vn/qrcode/edit/${data.id}` : ''
                        // data.images.length ? `${MEDIA_URL_HR}/${data.images[0]}` : '',
                        // data.asset?.document_asset?.length ? `https://hr.hasaki.vn/company/document/${data.asset?.document_asset[0]}/edit` : ''
                    ]);
                    // data.images.map((img, index) => {
                    //     if (index === 0) {
                    //         // Skip adding the first element
                    //         return;
                    //     }
                    //     if (img != undefined) {
                    //         worksheet.addRow([
                    //             '',
                    //             '',
                    //             '',
                    //             '',
                    //             '',
                    //             '',
                    //             '',
                    //             '',
                    //             '',
                    //             '',
                    //             '',
                    //             '',
                    //             '',
                    //             '',
                    //             '',
                    //             '',
                    //             '',
                    //             img ? `${MEDIA_URL_HR}/${img}` : '',
                    //         ]);
                    //     }
                    // });
                });
                workbook.xlsx.writeBuffer().then((buffer) => {
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'exported_data' + `-${moment().format('YYYY-MM-DD')}.xlsx`; // Specify the file name
                    a.click();
                    this.setState({ loading: false });
                });
            }
        } catch (error) {
            this.setState({ loading: false });
            showNotify('Error', error.message, 'error');
        }
    };
    /**
     * On change page
     * @param {*} page 
     */
    onChangePage = page => {
        let values = this.formRef.current.getFieldsValue();
        this.setState({ offset: ( page - 1) * this.state.limit }, () => this.getListQRCode({ ...values }));
    }
    renderViewLog() {
        let { datasViewLog } = this.state
        let { baseData: { locations } } = this.props
        let result = []
        if (datasViewLog.length) {
            datasViewLog.map(d => {
                let datasAttributes = d?.properties?.attributes
                let datasOld = d?.properties?.old
                result.push(
                    <Row className='mb-2'>
                        <Col span={24}><strong>{d.created_at} by {d?.user?.name} :</strong></Col>
                        <Col span={24}>
                            <Row gutter={12}>
                                <Col span={6} >
                                    Datas Old  :  { typeof datasOld != 'undefined' ? Object.keys(datasOld).map((key, indexOld) => {
                                        let resultDatasOld = []
                                        switch (key) {
                                            case 'other':
                                                let resultOther = []
                                                if (datasOld[key] != null && Object.keys(datasOld[key])?.length) {
                                                    Object.keys(datasOld[key]).map(keyOther => {
                                                        resultOther.push(<div>{keyOther} : {datasOld[key][keyOther]}</div>)
                                                    })
                                                }
                                                resultDatasOld.push(<div className='text-view-qrcode ml-4'>{resultOther}</div>)
                                            case 'location_id':
                                                resultDatasOld.push(<div className='text-view-qrcode ml-4'>Location : {locations.find(l => l.id == datasOld[key])?.name}</div>)
                                            case 'images':
                                                let resultImages = []
                                                if (datasOld[key]?.length) {
                                                    datasOld[key].map(image => {
                                                        resultImages.push(<span className='text-view-qrcode ml-4'>{MEDIA_URL_HR + '/' + image}<br /></span>)
                                                    })
                                                }
                                                resultDatasOld.push(<div className='text-view-qrcode ml-4'>image: <div className='ml-4'>{resultImages}</div></div>)
                                            default:
                                        }
                                        return resultDatasOld
                                    })
                                    : ''
                                }
                                </Col>
                                <Col span={6}>
                                    Datas Attributes  : { typeof datasAttributes != 'undefined' ? Object.keys(datasAttributes).map((key, indexAttributes) => {
                                        let resultDatasAttributes = []
                                        switch (key) {
                                            case 'other':
                                                let resultOther = []
                                                if (datasAttributes[key] != null && Object.keys(datasAttributes[key])?.length) {
                                                    Object.keys(datasAttributes[key]).map(keyOther => {
                                                        resultOther.push(<div>{keyOther} : {datasAttributes[key][keyOther]}</div>)
                                                    })
                                                }
                                                resultDatasAttributes.push(<div className='text-view-qrcode ml-4'>{resultOther}</div>)
                                            case 'location_id':
                                                resultDatasAttributes.push(<div className='text-view-qrcode ml-4'>Location : {locations.find(l => l.id == datasAttributes[key])?.name}</div>)
                                            case 'images':
                                                let resultImages = []
                                                if (datasAttributes[key]?.length) {
                                                    datasAttributes[key].map(image => {
                                                        resultImages.push(<span className='text-view-qrcode ml-4'>{MEDIA_URL_HR + '/' + image}<br /></span>)
                                                    })
                                                }
                                                resultDatasAttributes.push(<div className='text-view-qrcode ml-4'>image: <div className='ml-4'>{resultImages}</div></div>)
                                            default:
                                        }
                                        return resultDatasAttributes
                                    })
                                    : ''
                                }
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                )
            })
        }
        return result
    }
    renderView(){
        let {t,baseData:{locations , stocks}} = this.props;
        let { data } = this.state;
        // const keyViews = ['code','asset_id', ]
        return (
            <>
                <Row gutter={[24, 24]}>
                    <Col span={4}>
                        <strong>{t('code')}</strong><br />
                        <span>{data.code}</span>
                    </Col>
                    <Col span={4}>
                        <strong>{t('device_id')}</strong><br />
                        <span>{data?.asset?.serial_number ? data?.asset.serial_number :  data.other?.label_code}</span>
                    </Col>
                    <Col span={4}>
                        <strong>{t('name')}</strong><br />
                        <span>{data?.asset?.product_name}</span>
                    </Col>
                    <Col span={4}>
                        <strong>{t('location')}</strong><br />
                        <span>{locations.find(l => l.id == data.location_id)?.name}</span><br/>
                    </Col>
                    <Col span={4}>
                        <strong>{t('created')}</strong><br />
                        <span>
                            {data.created_by_user?.staff_name}({data.created_by_user?.code})<br />
                            {data.created_at}
                        </span>
                    </Col>
                    <Col span={4}>
                        <strong>{t('hr:last_modified')}</strong><br />
                        <span>
                            {data.updated_by_user?.staff_name}({data.updated_by_user?.code})<br />
                            {data.updated_at}
                        </span>
                    </Col>
                    <Col span={4}>
                        <strong>{t('floor')}</strong><br/>
                        <span>{dataFloors[data?.other?.floor]}</span>
                    </Col>
                    <Col span={4}>
                        <strong>{t('product') + (' SKU')}</strong><br />
                        <span>{data?.asset?.product_sku}</span>
                    </Col>
                    <Col span={4}>
                        <strong>{t('assign_to')}</strong><br/>
                        <span>{data?.asset?.staff?.staff_name}</span>
                    </Col>
                    <Col span={4}>
                        <strong>Location detail</strong><br/>
                        <span>{(data.location_detail_id && data.location_detail) ? data?.location_detail?.area + ' - ' +  dataFloors[data?.location_detail?.floor]  : data.address}</span>
                    </Col>
                    <Col span={4}>
                        <strong>{t('hr:asset_group')}</strong><br/>
                        <span>{this.state.dataGroups.find(d => d.id == (data?.other?.group_device_id))?.name}</span>
                    </Col>
                    <Col span={4}>
                        <strong>{t('stock')}</strong><br/>
                        <span>{stocks.find(s => s.stock_id == this.state.data.asset?.stock_id)?.stock_name}</span>
                    </Col>
                    <Col span={4}>
                        <strong>{t('po_code')}</strong><br/>
                        <span>{this.state.data.asset?.po_code}</span>
                    </Col>
                    <Col span={20}>
                        <strong>{t('note')}</strong><br/>
                        <span>{data?.other?.note}</span>
                    </Col>
                    {/* {data.visibleImage && ( */}
                    <Col span={24}>
                        <strong>{t('image')}</strong><br />
                        {
                            data.images.length ?
                                (data.images).map(img => (
                                    <span className='mr-2'>
                                        <Image 
                                            src={getThumbnailHR(img,'100x70')} 
                                            preview={{ src: getURLHR(img) }}
                                        />
                                    </span>
                                ))
                                : t('hr:no_data')
                        }
                    </Col>
                    {/* )} */}
                    <Col span={24}>

                    </Col>
                </Row>
                <div className='mb-2'>
                    <strong>{t('link_document')} :</strong>&nbsp;<br/>
                    {
                        data.asset?.document_asset?.length ? (data.asset?.document_asset).map(d => {
                            let result = []
                            result.push(<div><Link to={`/company/document/${d.document_id}/edit`} target="_blank"  className='ml-2'>
                                {d?.document?.title}
                                </Link>
                                </div>)
                            return result
                        })
                        : t('hr:no_data')
                    }
                </div>
                <div className='mb-2'>
                    <strong>{t('maintenance_history')} :</strong>&nbsp;<br />
                    {
                        this.state.datasLogMaintenance.length ? 
                        this.state.datasLogMaintenance.map(d => {
                            let result = []
                            result.push(<div><Link to={`/asset-device/criterion-log?asset_id=${d.asset_id}&date=${d.date}&type=${d.type}`} 
                            target="_blank"  className='ml-2'>
                                {d.date} : {d.asset?.product_name} 
                            </Link></div>)
                            return result
                        })
                            : t('hr:no_data')
                    }
                </div>
                <div>
                    <strong>{t('hr:edit_history')} :</strong>&nbsp;
                    <FontAwesomeIcon className='cursor-pointer' onClick={()=> this.setState({visibleHistoryLog :!this.state.visibleHistoryLog })} 
                    icon={this.state.visibleHistoryLog ?  faMinusCircle : faPlusCircle} /> 
                </div>
                {
                    this.state.visibleHistoryLog ? <div>{this.renderViewLog()}</div> : []
                }
                <Row gutter={[24, 24]} className='mt-3'>
                    <Col span={24} className='text-right'>
                        {/* <Button type='primary' icon={<FontAwesomeIcon icon={faImage} />} onClick={() => this.openImage(data)} /> */}
                        {/* <Link
                            to={{
                                pathname: `/qrcode/print`,
                                search: `?code=${data.code}`
                            }}
                            target="_blank"
                        >
                            <Button className='ml-2' type="primary" size='small' icon={<FontAwesomeIcon icon={faPrint} />}>
                            </Button>
                        </Link> */}
                        <div>
                            <CustomQRCode
                                id="qrCode"
                                value={JSON.stringify({key: "qr_mapping", code : data.code})}
                                style={{ marginTop: 20, marginRight: 10, width: 60, height: 60 }}
                            />
                        </div>
                    </Col>
                </Row>
            </>
        )
    }

    /**
     * 
     * @param {*} row 
     * @returns 
     */
    setClassNameRow = (row) => {
        const { baseData: { stocks } } = this.props;
        if(row.asset && row.asset.stock_id) {
            let locStock = stocks.find(s => s.stock_id == row.asset.stock_id)
            if(locStock && row.location_id && locStock.location_id != row.location_id) {
                return 'bg-light-yellow';
            }
        }
        return '';
    }

    render() {
        let {t, baseData: { locations , stocks } } = this.props
        const {  limit, offset, total } = this.state;
        const items = [
            {
                key: '1',
                label: 
                    <div style={{ textAlign: 'center' }}>
                    <span>{t('hr:generate')}</span>
                </div>
            },
            {
                key: '2',
                label:
                    checkPermission('hr-asset-device-qr-code-create') ?
                    <div style={{ textAlign:'center' }}>
                        <span>{t('create')}</span>
                    </div>
                    : null
            },
            {
                key: '3',
                label:
                    checkPermission('hr-asset-device-qr-code-export') ?
                    <div style={{ textAlign: 'center' }}>
                       <span>{t('export_file')}</span>
                    </div>
                    : null
            }
        ]
        const itemClick = ({ key }) => {
            if (key == 1) {
                this.props.history.push('/qrcode/generate')
            } else if (key == 2) {
                this.props.history.push('/qrcode/create')
            } else if (key == 3) {
                this.exportFileExcel()
            }
        }
        const columns = [
            {
                title: 'No',
                width:'3%',
                render : r => this.state.datas.indexOf(r) + 1
            },
            {
                title: t('code'),
                width:'8%',
                render : r => r.code
            },
            {
                title :t('device_id'),
                render : r =><span>{r?.asset?.serial_number ? r?.asset.serial_number : r.other?.label_code}</span>
            },
            {
                title : t('name') + t(' ') + t('device'),
                render: r=> <span>{r?.asset?.product_name}</span>
            },
            {
                title: t('group')+ t(' ') + t('hr:maintenance'),
                render: r => this.state.dataGroups.find(d => d.id == (r?.other?.group_device_id))?.name
            },
            {
                title : t('location'),
                render: r => {
                    let location = locations.find((l) => r.location_id == l.id);
                    return <>
                        <span>{location ? location.name : ""}</span><br />
                        <span>{dataFloors[r.other?.floor]}</span>
                    </> 
                }
            },
            {
                title : t('stock'),
                render: r => stocks.find(s => s.stock_id == r.asset?.stock_id)?.stock_name
            },
            {
                title: t('created_at'),
                render: r => <span>
                    {r.created_by_user?.staff_name}({r.created_by_user?.code})<br />
                    {r.created_at}
                </span>
            },
            {
                title: t('modified_by'),
                render: r => <span>
                    {r.updated_by_user?.staff_name}({r.updated_by_user?.code})<br />
                    {r.updated_at}
                </span>
            },
            {
                title: t('action'),
                render: r => <>
                    {checkPermission('hr-asset-device-qr-code-update') ?
                        <Link to={`/qrcode/edit/${r.id}`}>
                            <Button className='mr-2' type="primary" size='small'
                                icon={<FontAwesomeIcon icon={faPen} />}>
                            </Button>
                        </Link> : ''
                    }
                    {
                        checkPermission('hr-asset-device-qr-code-preview') ? 
                            <Button onClick={() => this.popupModal(r)} type="primary" size='small' icon={<FontAwesomeIcon icon={faEye} />} />
                        : ''
                    }   
                    <Link
                        to={{
                            pathname: `/qrcode/print`,
                            search: `?code=${r.code}`
                        }}
                        target="_blank"
                    >
                        <Button className='ml-2' type="primary" size='small' icon={<FontAwesomeIcon icon={faPrint} />}>
                        </Button>
                    </Link>
                </>
            },
        ]
        return (
            <div>
                <PageHeader title={t('qr_code')}
                    extra={
                        <div style={{textAlign:'right'}}>
                            <DropdownAnt className='ml-2' key='download_temp' menu={{ items, onClick: itemClick }} type="primary" placement="bottom" icon={<FontAwesomeIcon icon={faPlus} />}>
                                <Button key='download_temp_btn' className="mr-1"
                                    icon={<FontAwesomeIcon icon={faCaretDown} />}
                                />
                            </DropdownAnt>
                        </div>
                    }
                />
                <Row className="card pl-3 pr-3 mb-3">
                    <div id="tab_responsive">
                        <div className='tab_content_mantenance_device'>
                            <Tab tabs={tabList(this.props)} />
                        </div>
                    </div>
                    <Form
                        className="pt-3"
                        ref={this.formRef}
                        onFinish={(this.submitForm.bind(this))}
                    >
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={3} xl={6}>
                                <Form.Item name="code">
                                    <Input placeholder={t('code') + t(' ') + t('device_id') + t(' ') + t('name') + t(' ') + t('SKU')}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={3} xl={3}>
                                <Form.Item name="location_id">
                                    <Dropdown datas={locations} defaultOption={t('hr:all_location')}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={3} xl={3}>
                                <Form.Item name="group_device_id">
                                    <Dropdown datas={this.state.dataGroups} defaultOption={t('group')}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={4} >
                                <Form.Item name='is_has_asset'>
                                    <Dropdown datas={isHasAsset} defaultOption="Has Asset Device" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={4} >
                                <Form.Item name='is_diff_loc'>
                                    <Dropdown datas={isHasAsset} defaultOption="Diff Location" />
                                </Form.Item>
                            </Col>
                            {/* <Col xs={24} sm={24} md={24} lg={3} xl={3}>
                                <Form.Item name="skill_id">
                                    <SkillDropdown defaultOption="-- All Skills --" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={3} xl={3}>
                                <Form.Item name="document_id">
                                    <DocumentDropDown defaultOption="-- All Documents --" />
                                </Form.Item>
                            </Col> */}
                            <Col xs={24} sm={24} md={24} lg={6} xl={10} key="submit">
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" className="mr-2">
                                        {t('search')}
                                    </Button>
                                    {/* <Link to='/qrcode/generate'>
                                        <Button type="primary" className="mr-2">
                                            Generate
                                        </Button>
                                    </Link>
                                    <Link to='/qrcode/create'>
                                        {checkPermission('hr-asset-device-qr-code-create') ? (
                                            <Button type="primary" className="mr-2">
                                                Create
                                            </Button>
                                        ) : null}
                                    </Link>
                                    <Button 
                                    type="primary" 
                                    className="mr-2"
                                    onClick={this.exportFileExcel}
                                    >
                                        Export
                                    </Button> */}
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <strong className='ml-2'>Total : {this.state.total}</strong>
                {window.innerWidth < screenResponsive  ? 
                    <div className='block_scroll_data_table'>
                        <div className='main_scroll_table'> 
                            <Table
                               columns={columns}
                               dataSource={this.state.datas}
                               rowKey="id"
                               pagination={{ 
                                pageSize: limit, 
                                showSizeChanger: false,
                                onChange: page => this.onChangePage(page),
                                current: (offset/limit) + 1,
                                total: total
                            }}
                              loading={this.state.loading}
                            />
                        </div>
                    </div>
                    :
                    <Table
                        columns={columns}
                        dataSource={this.state.datas}
                        rowKey={r => r.id}
                        pagination={{ 
                            pageSize: limit, 
                            showSizeChanger: false,
                            onChange: page => this.onChangePage(page),
                            current: (offset/limit) + 1,
                            total: total
                        }}
                        rowClassName={r => this.setClassNameRow(r)}
                        loading={this.state.loading}
                    />
                }
                {
                    this.state.visible && (
                        <Modal
                            width={'90%'}
                            title= {t('views')}
                            open={this.state.visible}
                            onCancel={() => this.setState({ data: {}, visible: false ,visibleHistoryLog : false })}
                            footer={false}
                        >
                            {this.renderView()}
                        </Modal>
                    )
                }
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    };
  }
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(QRCode)