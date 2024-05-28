import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Row, Col, Form, Input, Button, Dropdown as DropdownAntd } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import Dropdown from "~/components/Base/Dropdown";
import { getListType, create, detail ,update} from "~/apis/qrCode";
import QRCode from "qrcode.react";
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import tabList from "../config/tabList";
import Tab from "~/components/Base/Tab";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faBackspace } from "@fortawesome/free-solid-svg-icons";
import { MinusCircleOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { checkPermission, convertToFormData, showNotify } from '~/services/helper';
import AssetDropdown from '../config/AssetDropdown';
import SkillDropdown from '~/components/Base/SkillDropdown';
import DocumentDropDown from '~/components/Base/DocumentDropDown';
import './config/qrCode.css'
import UploadMultiple from '~/components/Base/UploadMultiple';
import { dataFloors, mineTypeImage } from '~/constants/basic';
import { list as apiListGroupDevices } from '~/apis/assetDevice/group'
import { MEDIA_URL_HR } from '~/constants';
import { getList as apiGetListLocation } from '~/apis/assetDevice/location_detail'

const fiedlsDefault = [ 'location_id', 'location_detail_id' , 'asset_id', 'skill_id', 'document_id', 'other' , 'images' , 'type_id']


export class CreateQRCode extends Component {
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.uploadRef = null;
        this.state = {
            loading: false,
            datasType: [], 
            datasGroupDevices: [],
            data: {},
            datasLocationDetail : []
        };
    }
    componentDidMount(){
        let { id } = this.props.match.params;
        // this.getListType();
        this.getListGroupDevices()
        this.getListLocationDetail()
        if(id){
            this.getDetail(id);
        }
    }
    async getDetail(id){
        let response = await detail(id)
        if(response.status){
            let dataDetail = response.data.detail;
            if(dataDetail.other && Object.keys(dataDetail.other).length){
                Object.keys(dataDetail.other).map(k => {
                    if(k == 'note'){
                        dataDetail[k] = dataDetail['address'] ? dataDetail['address']  + '\r\ ' : '' + dataDetail.other[k]
                    }else{
                        dataDetail[k] = dataDetail.other[k]
                    }
                })
            }
            if(dataDetail.images.length){
                let imgs = []
                dataDetail.images.map((i, index) => {
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
            dataDetail.location_detail_id = dataDetail.location_detail_id && dataDetail.location_detail ?  dataDetail.location_detail_id : dataDetail.address
            this.setState({data : dataDetail})
            this.formRef.current.setFieldsValue(dataDetail)
        }
    }
    async getListGroupDevices(){
        let response = await apiListGroupDevices()
        if (response.status) {
            this.setState({ datasGroupDevices: response.data.rows })
        }
    }
    async getListLocationDetail(){
        let { baseData : {locations}} = this.props
        let response = await apiGetListLocation({limit : 1000 })
        if (response.status) {
            let datas = response.data.rows
            let result = []
            if(datas.length){
                datas.map(d => {
                    let locationFind = locations.find(l => l.id == d.location_id)
                    result.push({
                        id: d.id,
                        name : d?.area + ' - ' + dataFloors[d?.floor]
                    })
                })
            }
            this.setState({ datasLocationDetail: result })
        }
    }

    // async getListType() {
    //     let response = await getListType();
    //     if (response.status) {
    //       this.setState({ datasType: response.data.types });
    //     }
    //   }
    submitForm() {
        const {t} = this.props
        let { id } = this.props.match.params;
        // this.setState({loading: true});
        let { datasLocationDetail } = this.state
        let is_correct_location_detail = false ;

        let values = this.formRef.current.getFieldsValue();
        let valuesFile = this.uploadRef?.getValues();
        datasLocationDetail.map(d => {
            console.log(values.location_detail_id , d.id)
            if(values.location_detail_id == d.id){
                is_correct_location_detail = true
            }
        })
        if((id && is_correct_location_detail ) || !id){ // nếu edit bắt chọn lại locations detail thay cho address
            let dataForm = {}
            delete values.images
            Object.keys(values).map(f => {
                if (fiedlsDefault.includes(f)) {
                    dataForm[f] = typeof values[f] !== 'undefined' ? values[f] : null
                } else {
                    dataForm[`other[${f}]`] = typeof values[f] !== 'undefined' ? values[f] : null
                }
            })
            Object.keys(dataForm).forEach(key => {
                if (dataForm[key] == null || dataForm[key] == undefined) {
                    delete dataForm[key];
                }
            });
            let formData = convertToFormData(dataForm)
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
            if (!id) {
                let xhr = create(formData)
                    .then(res => {
                        if (res.status) {
                            showNotify('Notification', t('hr:create_susscess'))
                            this.props.history.push("/qrcode/list")
                        }else{
                            showNotify('Notification', res.message ,'error')
                        }
                    })
                    .catch(err => console.log(err))
            } else {
                formData.append('_method', 'PUT')
                formData.append('code', this.state.data.code)
                let xhr = update(id, formData)
                    .then(res => {
                        if (res.status) {
                            showNotify('Notification', t('hr:update_susscess'))
                            this.props.history.push("/qrcode/list")
                        }else{
                            showNotify('Notification', res.message ,'error')
                        }
                    })
                    .catch(err => console.log(err))
            }
        }else{
            if(!is_correct_location_detail){
                showNotify('Notification', 'Location detail is not correct !' ,'error')
            }
        }
    }

    render() {
        let {t, baseData: { locations } } = this.props;
        let { id } = this.props.match.params;
        let title = id ? t('edit') : t('create')
        let disabledDeviceID = ((id && this.state.data.asset_id) && !checkPermission('hr-asset-device-qr-code-detail-update'))  ? true : false
        
        return (
            <div>
                <PageHeader title={`${title}` + t(' ') + t('qr_code')} />
                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={tabList(this.props)} />
                </Row>
                <Row className='p-2 card'>
                    <Form layout="vertical" className='p-2' name="form-create" onFinish={() => this.submitForm()} ref={this.formRef}>
                        <Row gutter={12}>
                            <Col span={8}>
                                <Form.Item name={'location_id'} label={t('location')}>
                                    <Dropdown datas={locations} defaultOption={t('location')} />
                                </Form.Item>
                            </Col>
                            {/* <Col span={8}>
                                <Form.Item name={'type_id'} label='Type' rules={[{ required: true, message: ("Please input Type") }]}>
                                    <Dropdown datas={this.state.datasType} defaultOption="-- All Types --" />
                                </Form.Item>
                            </Col> */}
                            <Col span={8}>
                                <Form.Item name={'floor'} label={t('floor')}>
                                    <Dropdown datas={dataFloors} defaultOption={t('floor')} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name={'asset_id'} label={t('asset')}>
                                    <AssetDropdown defaultOption={t('asset')} 
                                        disabled={disabledDeviceID}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name={'group_device_id'} label={t('hr:device_group')}>
                                    <Dropdown datas={this.state.datasGroupDevices} defaultOption={t('group')}/>
                                </Form.Item>
                            </Col>
                            {/* <Col span={12}>
                                <Form.Item name={'skill_id'} label='Skill'>
                                    <SkillDropdown defaultOption="-- All Skills --" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name={'document_id'} label='Document'>
                                    <DocumentDropDown defaultOption="-- All Documents --" />
                                </Form.Item>
                            </Col> */}
                            {/* <Col span={10}>
                                <Form.Item name={'staff_id'} label='Staff'>
                                    < />
                                </Form.Item>
                            </Col> */}
                            <Col span={12}>
                                <Form.Item name={'location_detail_id'} label={t('location detail')} rules={[{ required: id ? true : false, message: ("Please input Location") }]}>
                                    {/* <Input placeholder='-- Address --' className='w-100' /> */}
                                    <Dropdown datas={this.state.datasLocationDetail} defaultOption={t('location')} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
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
                            </Col>
                            <Col span={24}>
                                <Form.Item name={'note'} label={t('note')}>
                                    <Input.TextArea rows={4} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <div className='d-flex'>
                            <Button onClick={() => this.props.history.push("/qrcode/list")}
                                icon={<FontAwesomeIcon icon={faBackspace} />}
                                className='mr-auto'>
                                {t('back')}
                            </Button>
                            <div>
                                <Button loading={this.state.loading} type="primary" htmlType="submit" className='mr-2'>
                                {t('save')}
                                </Button>
                                {/* <Link
                                    to={{
                                        pathname: `/qrcode/print`,
                                        search: `?qr=${this.state.datas}&type=${this.formRef.current.getFieldsValue()?.type_id}`
                                    }}
                                    target="_blank"
                                >
                                    <Button type="primary" className="mr-2" icon={<FontAwesomeIcon icon={faPrint} />}
                                    >
                                        &nbsp;Print
                                    </Button>
                                </Link> */}
                            </div>
                        </div>
                    </Form>
                </Row>
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

export default connect(mapStateToProps, mapDispatchToProps)(CreateQRCode)