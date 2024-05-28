import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next';
import {
    Row,
    Col,
    Form,
    Table,
    Input,
    Button,
    Modal,
    Image,
} from "antd";

import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faPlus, faPrint } from '@fortawesome/free-solid-svg-icons';
import tabList from "../config/tabList";
import Tab from "~/components/Base/Tab";
import { checkPermission,  showNotify ,historyParams , historyReplace, convertToFormDataV2, convertToFormData, getThumbnailHR, getURLHR} from '~/services/helper';
import { getList as apiGetList , save , detail as apiGetDetail , destroy} from '~/apis/assetDevice/location_detail'
import Dropdown from '~/components/Base/Dropdown';
import DeleteButton from '~/components/Base/DeleteButton';
import { dataFloors, datasArea, mineTypeImage, statusLocationDetail } from '~/constants/basic';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import QRCode from "qrcode.react";
import UploadMultiple from '~/components/Base/UploadMultiple';
import { MEDIA_URL_HR } from '~/constants';

export class LocationDetail extends Component {
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.formModalRef = React.createRef();
        this.uploadRef = null;
        // let params = historyParams();
        this.state = {
            datas: [],
            loading: false,
            visible : false ,
            data : {},
            limit: 30,
            offset: 0,
            total: 0,
        };
    }
    componentDidMount(){
        this.getList()
    }
    async getList(params = {}){
        this.setState({ loading : true });
        params = {
            ...params,
            offset:this.state.offset,
            limit: this.state.limit
        }
        let response = await apiGetList(params)
        if(response.status) {
            let datas = response.data.rows
            this.setState({ loading : false , datas ,total: response.data.total});
        }else{
            showNotify('Notification' , response.message , 'error');
        }
    }
    popupModal(data){
        this.setState({
            visible : true , 
            data
        },() => {
            if(data?.images?.length){
                let imgs = []
                this.uploadRef.resetForm()
                data.images.map((i, index) => {
                    let name = i.split('\\');
                    imgs.push({
                      uid: 'history_image' + index,
                      name: name[name.length - 1],
                      status: 'done',
                      url: MEDIA_URL_HR + '/' + i,
                      fileRaw: i
                    })
                })
                this.uploadRef.setValues({historyFileList: imgs })
               
            }
            this.formModalRef.current.setFieldsValue(data)
        })
    }
    /**
     * On change page
     * @param {*} page 
     */
    onChangePage = page => {
        let values = this.formRef.current.getFieldsValue();
        this.setState({ offset: ( page - 1) * this.state.limit }, () => this.getList({ ...values }));
    }
    submitForm(values){
        this.setState({offset : 0 } , () => this.getList(values))
    }
    async submitModal(values){
        const {t} =  this.props
        this.setState({loading : true })
        let id = this.state.data?.id ? this.state.data.id : 0
        let valuesFile = this.uploadRef?.getValues();
        let formData = convertToFormData(values)
        if (valuesFile && valuesFile.fileList.length) {
            (valuesFile.fileList).map(n => {
                if (n.uid.includes('upload')) {
                    formData.append('images[]', n)
                }
            })
        }
        if (valuesFile.removeFileList && Array.isArray(valuesFile.removeFileList)) {
            valuesFile.removeFileList.map(f => formData.append('remove_images[]', f))
        }
        let response = await save(id , formData)
        if(response.status){
            showNotify('notification', t('success'))
            this.setState({visible : false })
            this.getList()            
        }else{
            showNotify('notification', response.message , 'error')
            this.setState({loading : false})
        }
    }
    // async onDelete (data){
    //     this.setState({loading : true })
    //     let response = await destroy(data.id)
    //     if(response.status){
    //         showNotify('notification', 'deleted success !')
    //         this.getList()   
    //     }else{
    //         showNotify('notification', response.message , 'error')
    //         this.setState({loading : false})
    //     }
    // }
    handleSubmitModal(){
        this.formModalRef.current
            .validateFields()
            .then((values) => {
                let valuesFile = this.uploadRef?.getValues();
                if( (valuesFile.fileList.length + valuesFile.historyFileList.length) < 4) {
                    Object.keys(values).forEach(key => {
                        if (values[key] == null  || values[key] == undefined) {
                            delete values[key]; // Xoá phần tử không có giá trị
                        }
                    });
                    delete values.images
                    this.submitModal(values);
                }else{
                    showNotify('Notification', 'Images should not exceed 3 images !','error')
                }
            })
            .catch((info) => {
                this.setState({ visibleViewsStaff: false })
                console.log("Validate Failed:", info);
                showNotify('Notification', 'Validate Failed', 'error')
            });
    }
    render() {
        let { t , baseData : {locations}} = this.props;
        let locationsAll = [
            {
                id : 0,
                name : 'All locations'
            },
            ...locations
        ]
        const columns = [
            {
                title: 'No.',
                render: r => this.state.datas.indexOf(r) + 1 
            },
            {
                title: t('area'),
                width : '20%',
                dataIndex : 'area'
            },
            {
                title: t('floor'),
                width : '10%',
                render : r => dataFloors[r.floor]
            },
            {
                title: t('location'),
                render: r => {
                    const location = locations.find(l => l.id == r.location_id);
                    return location?.name;
                }
            },
            {
                title: t('description'),
                width : '20%',
                dataIndex : 'description'
            },
            // {
            //     title: t('status'),
            //     render: r => statusLocationDetail[r.status]
            // },
            {
                title : 'Images',
                render : r => {
                    let images = r?.images
                    let result = []
                    if (images?.length) {
                        images.map(img => result.push(
                            <Image
                                className='p-2'
                                src={getThumbnailHR(img, '100x70')}
                                preview={{ src: getURLHR(img) }}
                            />
                        ))
                    }
                    return <div className='d-flex'>{result}</div>
                }
            },
            {
                title : 'QR Code',
                render : r => {
                    let params = {
                        key: "location_detail_id",
                        location_detail_id: r.id,
                        // area : r.area,
                        // floor : r.floor
                      };
                    return <QRCode
                    id="qrCode"
                    value={JSON.stringify(params)}
                    style={{ marginTop: 20, marginRight: 10, width: 60, height: 60 }}
                  />
                }
            },
            {
                title : t('date'),
                render : r => <small> 
                    <span>{t('created')} : {r.created_at} </span><br/>
                    <span>{t('updated')}: {r.updated_at} </span>
                </small>
            },
            {
                title : t('action'),
                render : r=> <>
                    {
                        checkPermission('hr-asset-device-location-detail-update') ?
                            <Button className='mr-2' type="primary" size='small'
                                icon={<FontAwesomeIcon icon={faPen} />}
                                onClick={() => this.popupModal(r)}>
                            </Button>
                            : []
                    }
                    {
                        checkPermission('hr-asset-device-location-detail-delete') ?
                            <DeleteButton onConfirm={() => this.onDelete(r)} />
                            : []
                    }
                    <Link
                        to={{
                            pathname: `/location-detail/print`,
                            search: `?location_detail_id=${r.id}`
                        }}
                        target="_blank"
                    >
                        <Button className='ml-2' type="primary" size='small' icon={<FontAwesomeIcon icon={faPrint} />}>
                        </Button>
                    </Link>
                </>
            }
        ]
        return (
            <div>
                <PageHeader title={t('location') + (' ') + t('detail')}
                    tags={checkPermission('hr-asset-device-location-detail-create') ? <Button
                        type='primary'
                        icon={<FontAwesomeIcon icon={faPlus} />}
                        onClick={() => this.setState({ visible: true, data: {} }, () => this.formModalRef.current.resetFields())}
                    >
                        {t('add_new')}
                    </Button> : []
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
                            <Col xs={24} sm={24} md={24} lg={3} xl={4}>
                                <Form.Item name="keyword">
                                    <Input placeholder= {t('area')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={3} xl={4}>
                                <Form.Item name="location_id">
                                    <Dropdown datas={locationsAll} defaultOption={t('hr:all_location')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={4} key="submit">
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" className="mr-2">
                                        {t('search')}
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <Table 
                    dataSource={this.state.datas}
                    columns={columns}
                    rowKey={r => r.id}
                    pagination={{
                        pageSize: this.state.limitlimit,
                        showSizeChanger: false,
                        onChange: page => this.onChangePage(page),
                        current: (this.state.offset / this.state.limit) + 1,
                        total: this.state.total
                    }}
                    loading={this.state.loading}
                />
                <Modal 
                    title={this.state.data?.id ? t('edit') : t('add_new')}
                    open={this.state.visible}
                    onCancel={() => {
                        this.formModalRef.current.resetFields()
                        this.setState({visible: false})
                    }}
                    onOk={() => this.handleSubmitModal()}
                    width={'40%'}
                    confirmLoading={this.state.loading}
                >
                    {
                        this.state.data?.id ?
                            <div>
                                <QRCode
                                    id="qrCode"
                                    value={JSON.stringify({
                                        key: "location_detail_id",
                                        location_detail_id: this.state.data.id,
                                        // area: this.state.data.area,
                                        // floor: this.state.data.floor
                                    })}
                                    style={{ marginTop: 20, marginRight: 10, width: 80, height: 80 }}
                                />
                            </div>
                            : []
                    }
                    <Form
                        className="pt-3"
                        ref={this.formModalRef}
                        layout='vertical'
                    >
                        <Form.Item name="area" label={t('area')} rules={[{ required: true, message:t('hr:please_input') + ('') + t('area')}]}>
                            {/* <Input placeholder='Area'/> */}
                            <Dropdown datas={datasArea} defaultOption='-- All area --' />
                        </Form.Item>
                        <Form.Item name="location_id" label={t('location')} rules={[{ required: true, message:t('hr:please_input') + ('') + t('location') }]}>
                            <Dropdown  datas={locationsAll} defaultOption={t('hr:all_location')}/>
                        </Form.Item>
                        <Form.Item name="floor" label={t('floor')} rules={[{ required: true, message:t('hr:please_input') + ('') + t('floor') }]}>
                            <Dropdown datas={dataFloors} defaultOption={t('floor')}/>
                        </Form.Item>
                        {/* <Form.Item name="status" label={t('Status')} rules={[{ required: true, message: "Please input status" }]}>
                            <Dropdown datas={statusLocationDetail} defaultOption={t('-- All Type --')}/>
                        </Form.Item> */}
                        <Form.Item name="description" label={t('description')}>
                            <Input placeholder={t('description')}/>
                        </Form.Item>
                        <Form.Item name={'images'} label={t('image')}>
                            <UploadMultiple
                                type={mineTypeImage}
                                size={100}
                                onRef={(ref) => {
                                    this.uploadRef = ref;
                                }}
                                listType="picture-card"
                            />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(LocationDetail))