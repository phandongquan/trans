import React, { Component } from 'react'
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Button, Form, Image, Table, Row, Col, Modal, Pagination, Spin, Input } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import axios from 'axios';
import './config/CameraShop.css'
import { uniqueId } from 'lodash';
import { ReloadOutlined, PlusOutlined } from "@ant-design/icons";
import history from '~/redux/history';
import EditImage from './EditImage';
import { Link } from 'react-router-dom';

import AddForm from './AddForm';

class CameraShop extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.addformRef = React.createRef();
        this.state = {
            loading: false,
            dataImg: [],
            data: [],
            isModalVisible: false,
            nameShop: '14.161.19.94',

            dataDefault: []
        };
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        this.getListCam();
        this.getDataAdd();
        try {
            this.interval = setInterval(() => {
                this.getListCam();
            }, 120000);
        } catch (e) {
            console.log(e);
        }
    }
    componentWillUnmount() {
        clearInterval(this.interval);
    }
    /**
     * 
     * get data default 
     */
    getDataAdd = async () => {
        await axios.get('http://171.244.36.99:555/cameraData/default_camera_config.json',
        )
            .then(response =>
                this.setState({ dataDefault: response.data }),
            )
            .catch(error => console.log(error))

    }
    /**
     * Get list
     * @param {Object} params 
     */
    getListCam = async (params = {}) => {
        // // append data of form for FormData()
        // let formData = new FormData();
        // formData.append('client_name','hello');
        // axios({
        //     method: "GET",
        //     url: `http://171.244.36.99:555/cam`,
        //     // headers: {
        //     //     'Content-Type': 'multipart/form-data',
        //     // },
        // })
        await axios.get('http://171.244.36.99:555/cam', {
            params: {
                client_name: this.state.nameShop
            }
        })
            .then(response =>
                this.setState({ data: response.data }),
            )
            .catch(error => console.log(error))

    }

    /**
     *
     * render img camera
     */
    renderImageCamera = () => {
        let { data } = this.state
        let result = [];
        const sizeChunk = 3;
        let indexCustom = -1;
        let objData = data?.config?.CAM_LIST
        if (data.pathes) {
            this.chunk(data.pathes, sizeChunk).map((arrChunk, index) => {
                let arrCol = [];
                if (Array.isArray(arrChunk)) {
                    arrChunk.map((i, indexChannels) => {
                        indexCustom += 1;
                        let camInfo = objData[data.channels[indexCustom]]
                        arrCol.push(<Col key={uniqueId('__ai_img')} span={8} className='mb-2'>
                            <div className='mr-2 mb-3' style={{ boxShadow: 'rgb(0 0 0 / 10%) 1.3px 2.7px 5px 0px' }}>
                                {
                                    camInfo?
                                    <Link to={{
                                        pathname: `/edit-camera-shop`,
                                        search: `?channel=${data.channels[indexCustom]}`,
                                        state: { camInfo: camInfo, channel: data.channels[indexCustom], client_name: this.state.nameShop , Image: i }
                                    }}>
                                        <img src={i} style={{ height: '300px', width: '390px' }} />
                                        {
                                            data.BAD_CAMERA[indexCustom] == 0 ?
                                                    data.last_update[indexCustom] > (data.config.SKIP_ALERT_TIME_DEFAULT + 120) ?
                                                    <div style={{ textAlign: 'center' , color: 'white', background: 'rgb(247 72 72)' }}>
                                                        <span>Cam {data.channels[indexCustom]} (offline)</span>
                                                    </div>
                                                    :
                                                    <div className='text-center'>
                                                    <span>Cam {data.channels[indexCustom]}</span>
                                                    </div>
                                                :
                                                <div style={{ textAlign: 'center', color: 'white', background: 'rgb(255 0 0)' }}>
                                                    <span>Cảnh báo !!! Cam {data.channels[indexCustom]}</span>
                                                </div>
                                        }
                                    </Link>
                                    :
                                    []
                                }
                                
                            </div>
                        </Col>)
                    }
                    )
                }
                result.push(<Row key={index}>{arrCol}</Row>)
            })
        }
        return <div>{result}</div>
    }
    /**
     * @event submit form
     * @param {Object} values 
     */
    submitForm = () => {
        let values = this.formRef.current.getFieldsValue()
        console.log(values)
    }
    renderInfomation = () => {
        let { data } = this.state
        let dataConfig = data.config
        let result = []
        if (dataConfig) {
            this.formRef.current.setFieldsValue(dataConfig)
            Object.keys(dataConfig).map((c, i) => {
                if (c != 'API_URL' && c != 'CAM_LIST') {
                    result.push(
                        <Row key={i}>
                            <Col span={20}>
                                <Form.Item name={c} label={c}>
                                    <Input placeholder={c} disabled/>
                                </Form.Item>
                            </Col>
                        </Row>
                    )
                }
            })
        }
        return <Form ref={this.formRef} layout='vertical' className='pl-2 pb-3 mt-1'>
            {result}
            <Row>
                <Col span={8}>
                    <Button type="primary"  onClick={() => this.submitForm()} >Submit Info</Button>
                </Col>
                
            </Row>
            <Row className='mt-2'>
                <Col span={8}>
                    <Button type="primary">Update software</Button>
                </Col>
            </Row>
        </Form>


    }
    /**
     * Chunk array
     * @param {*} arr 
     * @param {*} size 
     * @returns 
     */
    chunk = (arr, size) =>
        Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
            arr.slice(i * size, i * size + size)
        );
    render() {
        const { t } = this.props
        const { loading, dataDefault, data} = this.state
        let dataLastUpdate = data.last_update
        let resultStatusShop 
        if(dataLastUpdate){
            resultStatusShop =  dataLastUpdate.filter(times => times > (data.config.SKIP_ALERT_TIME_DEFAULT + 120) )
        }
        return (
            <div>
                <PageHeader title={t('Camera Shop')} />
                <Row className="main">
                    <Col span={3} className="d-flex flex-column block-guest">
                        <div className='text-center'>
                            <h6 className="header">DANH SÁCH CỬA HÀNG</h6>
                            {
                                resultStatusShop?.length == dataLastUpdate?.length ?
                                <div style={{ textAlign: 'center' , color: 'white', background: 'rgb(247 72 72)' }}>
                                    <span className='ml-1 cursor-pointer'>{this.state.nameShop} (offline)</span>
                                </div>
                                :
                                <div style={{ textAlign: 'center'}}>
                                    <span className='ml-1 cursor-pointer'>{this.state.nameShop}</span>
                                </div>
                            }
                        </div>
                    </Col>
                    <Col span={6} className="d-flex flex-column block-guest">
                        <div>
                            <h6 className="header">THÔNG SỐ</h6>
                            {this.renderInfomation()}

                        </div>
                    </Col>
                    <Col span={15} className="d-flex flex-column block-guest">
                        <div>
                            <   div className="d-flex justify-content-between align-items-center">
                                <h6 className="header">DANH SÁCH CAMERA</h6>
                                <div>
                                    <Button
                                        type="primary"
                                        className="mr-2"
                                        icon={<PlusOutlined />}
                                        onClick={() => this.setState({ isModalVisible: true })}
                                    >
                                        Add
                                    </Button>
                                    <Button
                                        type="primary"
                                        className="mr-2"
                                        icon={<ReloadOutlined />}
                                        onClick={() => this.getListCam()}
                                    >
                                        Reload
                                    </Button>
                                </div>
                            </div>
                            <Spin spinning={loading}>
                                {this.renderImageCamera()}
                            </Spin>
                        </div>
                    </Col>
                </Row>
                <AddForm 
                    visible = {this.state.isModalVisible} 
                    datas={dataDefault}
                    togglePopup={() => this.setState({isModalVisible: false})}
                    listChannels = { this.state.data.channels}
                    refreshList={() => this.getListCam()}
                    client_name ={this.state.nameShop} 
                 />
                
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(CameraShop));