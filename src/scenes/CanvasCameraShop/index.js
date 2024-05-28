// import React, { Component } from 'react'
// import { withTranslation } from 'react-i18next';
// import { connect } from 'react-redux';
// import { Row, Col, Form, Table, Select, Input, Button, Modal, Spin, InputNumber ,Pagination } from 'antd';
// import { PageHeader } from '@ant-design/pro-layout';
// import axios from 'axios';
// import Dropdown from '~/components/Base/Dropdown';
// import { getListCamera, getListLocation ,addNewCamera } from '~/apis/aiCheckLight/ai_check_light';
// import { faPlus } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { showNotify , historyParams, historyReplace, } from '~/services/helper';
// import ImageCamera from './ImageCamera';

// class CanvasCameraShop extends Component {
//     constructor(props) {
//         super(props)
//         this.formRef = React.createRef();
//         this.modalRef = React.createRef();
//         this.myRef = React.createRef()  

//         let params = historyParams();
//         this.state = {
//             visible: false,
//             loading: false,
//             datas: [],
//             dataFormat: [],
//             datasListLocation: [],

//             page: params.page ? Number(params.page) : 1,
//             total : 100,
//             dateTime : new Date().getTime()  
//         }
//     }
//     componentDidMount() {
//         let params = historyParams();
//         let keyHistory = {}
//         if(params){
//             if(Array.isArray(params['filter_by']) && params['filter_by'].length > 0){
//                 params['filter_by'].map((key,index) =>{
//                     params['value'].map((v,i) =>{
//                         if(index  == i)
//                         keyHistory[key] = v
//                     })
//                 })
//             }else {
//                 keyHistory[params['filter_by']] = params['value']
//             }
//         }
//         this.formRef.current.setFieldsValue(keyHistory);
//         let values = this.formRef.current.getFieldsValue();
//         this.getListCamera(values)
//         this.getListLocation()
//     }
//     /**
//      * Get list camera 
//      */
//     getListCamera = async (params = {}) => {
//         let field = []
//         let value = []
//         Object.keys(params).forEach((k) => params[k] == null && delete params[k]);
//         if (params) {
//             Object.keys(params).map(e => {
//                 field.push(e)
//             })
//         }
//         if (field.length) {
//             field.map(v => {
//                 value.push(params[v])
//             })
//         }
//         let result = {
//             filter_by: field,
//             value: value,
//             page: this.state.page
//         }
//         historyReplace(result);
//         this.setState({ loading: true })
//         let response = await getListCamera(result)
//         if (response) {
//             let resultTotal = response.maxPage * 10
//             this.setState({ datas: response.camList , total : resultTotal, loading: false })
//         }
//     }
//     /**
//      * Get list location 
//      */
//     getListLocation = async () => {
//         let response = await getListLocation()
//         let listLocation = []
//         if (response) {
//             (response.clientList).map(location => {
//                 listLocation.push({
//                     id: location,
//                     name: location
//                 })
//             })
//             this.setState({ datasListLocation: listLocation })
//         }
//     }
//     /**
//      * @event change page
//      * 
//      * @param {*} page 
//      */
//      onChangePage(page) {
//         let values = this.formRef.current.getFieldsValue();
//         //remove value undefined
//         Object.keys(values).forEach((k) => values[k] == null && delete values[k]);
        
//         window.scrollTo(0, this.myRef.current.offsetTop)

//         this.setState({ page }, () => this.getListCamera({ ...values }));
//     }
//     /**
//     * @event submit form
//     * @param {Object} values 
//     */
//     submitForm = () => {
//         let values = this.formRef.current.getFieldsValue();
//         //remove value undefined
//         Object.keys(values).forEach((k) => values[k] == null && delete values[k]);
//         this.setState({ page : 1 }, () => this.getListCamera({ ...values }));
//         // this.getListCamera(values);
//     }
//     render() {
//         let { t, baseData: { locations } } = this.props;
//         let { datas, datasListLocation } = this.state;
//         return (
//             <div ref={this.myRef}>
//                 <PageHeader title={t('Camera Shop')}/>
//                 <Row className="card pl-3 pr-3 mb-3">
//                     <Form
//                         className="pt-3"
//                         ref={this.formRef}
//                         name="searchForm"
//                         onFinish={() => this.submitForm()}
//                         layout="vertical">
//                         <Row gutter={12}>
//                             <Col span={5}>
//                                 <Form.Item name="client" >
//                                     <Dropdown datas={datasListLocation} defaultOption="-- All Location --" />
//                                 </Form.Item>
//                             </Col>
//                             <Col span={4}>
//                                 <Form.Item name="count_guest_at_cashier" >
//                                     <Dropdown datas={{ 0: 'không hoạt động', 1: 'hoạt động' }} defaultOption="-- Choose check guest at cashier--" />
//                                 </Form.Item>
//                             </Col>
//                             <Col span={4}>
//                                 <Form.Item name="count_guest_in_out" >
//                                     <Dropdown datas={{ 0: 'không hoạt động', 1: 'hoạt động' }} defaultOption="-- Choose check in out--" />
//                                 </Form.Item>
//                             </Col>
//                             <Col span={5}>
//                                 <Form.Item name="IP" >
//                                     <Input placeholder="IP" />
//                                 </Form.Item>
//                             </Col>
//                             <Col span={2}>
//                                 <Button type="primary" style={{ marginLeft: 8 }} htmlType="submit">
//                                     {t('Search')}
//                                 </Button>
//                             </Col>
//                         </Row>
//                     </Form>
//                 </Row>
//                 <Spin spinning={this.state.loading}>
//                     {
//                         Object.keys(datas).map((keys, index) => {
//                             return (
//                                     <ImageCamera
//                                         ai_control = {datas[keys].ai_control}
//                                         idLocation = {datas[keys].id}
//                                         locaName={keys}
//                                         IP={datas[keys].IP}
//                                         Port={datas[keys].port}
//                                         valueImages={datas[keys].image_urls}
//                                         key={keys} channelImage={datas[keys].C}
//                                         refreshCheckCountGuestAtCashier={(values, keys) => datas[keys].count_guest_at_cashier = values}
//                                         refreshCheckCountGuestInOut={(values, keys) =>  datas[keys].count_guest_in_out = values}
//                                         refreshImage = {(valuesCheckLight ,valuesCheckError,valuesCashier ,keys) => {
//                                             datas[keys].check_light = valuesCheckLight
//                                             datas[keys].cashier = valuesCashier
//                                             datas[keys].check_error = valuesCheckError
//                                             this.setState({ dateTime: new Date().getTime() })
//                                         }}
//                                         dateTime={this.state.dateTime}
//                                         />
//                             )
//                         })
//                     }
//                 </Spin>
//                 <div className='float-right'>
//                     <Pagination
//                         total={this.state.total}
//                         // pageSize={this.state.limit}
//                         showSizeChanger={false}
//                         current={this.state.page}
//                         onChange={(page) => this.onChangePage(page)}
//                         defaultPageSize={this.state.maxPage}
//                         showQuickJumper
//                     />
//                 </div>
//             </div>
//         )
//     }
// }

// const mapStateToProps = (state) => {
//     return {
//         auth: state.auth.info,
//         baseData: state.baseData
//     };
// }
// const mapDispatchToProps = (dispatch) => {
//     return {};
// }

// export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(CanvasCameraShop));