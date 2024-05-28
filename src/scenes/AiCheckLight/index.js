import React, { Component } from 'react'
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Row, Col, Form, Table, Select, Input, Button, Modal, Spin, InputNumber ,Pagination } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import axios from 'axios';
import ImageCamera from './ImageCamera';
import Dropdown from '~/components/Base/Dropdown';
import { getListCamera, getListLocation ,addNewCamera } from '~/apis/aiCheckLight/ai_check_light';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { showNotify , historyParams, historyReplace, checkPermission } from '~/services/helper';
import Tab from '~/components/Base/Tab';
import tabs from './config/tabs';

const locationCams = {
    0: 'Chưa xđ',
    1: 'Cashier-shop',
    2: 'Ngoài sân',
    3: 'Shop',
    4: 'Kho',
    5: 'Camera AI',
    6 :'Clinic - phòng chờ' ,
    7 :'Cashier - clinic',
    8 :'Kệ hàng',
    9 : 'Hàng chờ thanh toán',
    10: 'Két sắt'
}
const urlAI = 'https://ai.hasaki.vn/speech';

class AiCheckLight extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.modalRef = React.createRef();
        this.myRef = React.createRef()  
        let params = historyParams();

        this.state = {
            visible: false,
            loading: false,
            datas: [],
            dataFormat: [],
            datasListLocation: [],
            page: params.page ? Number(params.page) : 1,
            total : 100,
            maxPage : 0,
            dateTime : new Date().getTime()  
        }
    }
    componentDidMount() {
        let params = historyParams();
        let keyHistory = {}
        if(params){
            if(Array.isArray(params['filter_by']) && params['filter_by'].length > 0){
                params['filter_by'].map((key,index) =>{
                    params['value'].map((v,i) =>{
                        if(index  == i)
                        keyHistory[key] = v
                    })
                })
            }else {
                keyHistory[params['filter_by']] = params['value']
            }
        }
        this.formRef.current.setFieldsValue(keyHistory);
        let values = this.formRef.current.getFieldsValue();
        this.getListCamera(values)
        this.getListLocation()
    }
    /**
     * Get list camera 
     */
    getListCamera = async (params = {}) => {
        let field = []
        let value = []
        Object.keys(params).forEach((k) => params[k] == null && delete params[k]);
        if (params) {
            Object.keys(params).map(e => {
                field.push(e)
            })
        }
        if (field.length) {
            field.map(v => {
                value.push(params[v])
            })
        }
        let result = {
            filter_by: field,
            value: value,
            page: this.state.page
        }
        historyReplace(result);
        this.setState({ loading: true })
        let response = await getListCamera(result)
        if (response) {
            let resultTotal = response.maxPage * 10
            this.setState({ datas: response.camList , total : resultTotal, loading: false , maxPage :   response.maxPage})
        }
    }
    /**
     * Get list location 
     */
    getListLocation = async () => {
        let response = await getListLocation()
        let listLocation = []
        if (response) {
            (response.clientList).map(location => {
                listLocation.push({
                    id: location,
                    name: location
                })
            })
            this.setState({ datasListLocation: listLocation })
        }
    }
    /**
     * @event change page
     * 
     * @param {*} page 
     */
     onChangePage(page) {
        let values = this.formRef.current.getFieldsValue();
        //remove value undefined
        Object.keys(values).forEach((k) => values[k] == null && delete values[k]);
        
        window.scrollTo(0, this.myRef.current.offsetTop)

        this.setState({ page }, () => this.getListCamera({ ...values }));
    }
    /**
    * @event submit form
    * @param {Object} values 
    */
    submitForm = () => {
        let values = this.formRef.current.getFieldsValue();
        //remove value undefined
        Object.keys(values).forEach((k) => (values[k] == null || values[k].length < 1) && delete values[k]);
        this.setState({ page: 1 }, () => this.getListCamera({ ...values }));
        // this.getListCamera(values);
    }
    addNewCamera = async (params = {}) =>{
        let {t} = this.props
        let response = await addNewCamera(params)
        if(response){
            showNotify(t('Notification'), t('Thêm camera thành công!'));
            this.setState({visible: false})
        }
    }
    /**
    * @event submit form
    * @param {Object} values 
    */
    submitModal = () =>{
        let { baseData: { locations } } = this.props;
        let values = this.modalRef.current.getFieldsValue();
        if(values.id > 0){
            let locFind = locations.find(l => l.id == values.id)
            values.store_name = locFind?.name
        }
        this.addNewCamera(values)
    }
    render() {
        let { t, baseData: { locations } } = this.props;
        let { datas, datasListLocation } = this.state;
        return (
            <div ref={this.myRef}>
                <PageHeader title={t('list_camera')}
                    tags={[
                        checkPermission('hr-tool-camera-shop-create') ?
                        <Button key="create-shop" type="primary" icon={<FontAwesomeIcon icon={faPlus} />} onClick={() => this.setState({ visible: true })}>
                            &nbsp;{t('add_new')}
                        </Button> 
                        : ""
                    ]}
                />
                 <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={tabs(this.props)} />
                    <Form
                        className="pt-3"
                        ref={this.formRef}
                        name="searchForm"
                        onFinish={() => this.submitForm()}
                        layout="vertical">
                        <Row gutter={24}>
                            <Col span={4}>
                                <Form.Item name="client" >
                                    <Dropdown datas={datasListLocation} defaultOption={t('all_location')}/>
                                </Form.Item>
                            </Col>
                            <Col span={3}>
                                <Form.Item name="check_error" >
                                    <Dropdown datas={{ 0: t('cam_un_working'), 1: t('cam_working') }} defaultOption={t('choose_check_error')} />
                                </Form.Item>
                            </Col>
                            <Col span={3}>
                                <Form.Item name="check_light" >
                                    <Dropdown datas={{ 0: t('off_check_light'), 1: t('on_check_light') }} defaultOption={t('choose_check_light')}/>
                                </Form.Item>
                            </Col>
                            <Col span={3}>
                                <Form.Item name="ai_control_status" >
                                    <Dropdown datas={{ 0: t('off_ai'), 1: t('on_ai') }} defaultOption={t('choose_check_ai')} />
                                </Form.Item>
                            </Col>
                            <Col span={3}>
                                <Form.Item name="area_type" >
                                    <Dropdown datas={locationCams} defaultOption={t('all_type')} mode='multiple'/>
                                </Form.Item>
                            </Col>
                            <Col span={3}>
                                <Form.Item name="IP" >
                                    <Input placeholder="IP" />
                                </Form.Item>
                            </Col>
                            <Col span={2}>
                                <Button type="primary" style={{ marginLeft: 8 }} htmlType="submit">
                                    {t('search')}
                                </Button>
                            </Col>

                        </Row>
                    </Form>
                </Row>
                <Spin spinning={this.state.loading}>
                    {
                        Object.keys(datas).map((keys, index) => {
                            return (
                                    <ImageCamera
                                        idx = {datas[keys].idx}
                                        ai_control_status = {datas[keys].ai_control_status}
                                        priority = {datas[keys].priority}
                                        area_type = {datas[keys].area_type}
                                        ai_control = {datas[keys].ai_control}
                                        idLocation = {datas[keys].id}
                                        locaName={keys}
                                        IP={datas[keys].IP}
                                        Port={datas[keys].port}
                                        valueImages={datas[keys].image_urls}
                                        key={keys} channelImage={datas[keys].C}
                                        checkLight={datas[keys].check_light}
                                        checkCashier={datas[keys].cashier}
                                        checkError={datas[keys].check_error}
                                        refreshCheckLight={(values, keys) => datas[keys].check_light = values}
                                        refreshTypeCamera={(types, keys) => datas[keys].area_type = types}
                                        refreshStatusCheckError={(values, keys) => datas[keys].check_error = values} 
                                        refreshImage = {(valuesCheckLight ,valuesCheckError,valuesCashier ,keys) => {
                                            datas[keys].check_light = valuesCheckLight
                                            datas[keys].cashier = valuesCashier
                                            datas[keys].check_error = valuesCheckError
                                            this.setState({ dateTime: new Date().getTime() })
                                        }}
                                        dateTime={this.state.dateTime}
                                        refreshPriority = {(values, keys) => datas[keys].priority = values}
                                        refreshApi = {() =>{
                                            let values = this.formRef.current.getFieldsValue();
                                            this.getListCamera(values)
                                        }}
                                        store_id = {datas[keys].id}
                                        />
                            )
                        })
                    }
                </Spin>
                <div className='float-right'>
                    <Pagination
                        total={this.state.total}
                        // pageSize={this.state.limit}
                        showSizeChanger={false}
                        current={this.state.page}
                        onChange={(page) => this.onChangePage(page)}
                        defaultPageSize={this.state.maxPage}
                        showQuickJumper
                    />
                </div>
                <Modal
                    open={this.state.visible}
                    title={t('add_new') + 'camera'}
                    onCancel={() => this.setState({ visible: false })}
                    onOk={() => this.submitModal()}
                    afterClose={() => this.modalRef.current.resetFields()}
                    width={800}
                    
                >
                    <Form
                        className="p-2"
                        ref={this.modalRef}
                        name="addForm"
                        // onFinish={() => this.submitFormModal()}
                        layout="vertical">
                        <Row gutter={[24, 0]}>
                            <Col span={12}>
                                <Form.Item label={t('IP')} name='IP'>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={t('port')} name='port'>
                                    <InputNumber controls={false} style={{ width: '100%' }}/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="id" label={t('location')} >
                                    <Dropdown datas={locations} defaultOption={t('all_location')}/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={t('number_channel')} name='numberChannels'>
                                    <InputNumber controls={false} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                           
                        </Row>

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
const mapDispatchToProps = (dispatch) => {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(AiCheckLight));
