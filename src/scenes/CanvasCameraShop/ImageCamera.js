import React, { Component } from 'react'
import { Button, Row, Col, Image, Form, Pagination, Input ,Popconfirm, Spin } from "antd";
import { uniqueId } from 'lodash';
import { QuestionCircleOutlined , RedoOutlined , DeleteOutlined } from '@ant-design/icons';
import LazyLoad from 'react-lazy-load';
import { reloadClient ,getListCamera as getFilterCamera  , deleteShop  as apiDelete} from '~/apis/aiCheckLight/ai_check_light';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { showNotify } from '~/services/helper';
import axios from 'axios';
import { Link } from 'react-router-dom';

const urlAI = 'https://ai.hasaki.vn/speech/check_light_is_on/config';

class ImageCamera extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loadingReload : false,
        }
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
    reloadClient = (IP , Port , shop , idLocation) =>{
        this.setState({loadingReload : true}) 
        let params = {
            IP: IP,
            port : Port
        }
        let paramsFilter = {
            filter_by : ['IP' , 'port'],
            value : [IP , Port],
            page : 1
        }
        let xhr = reloadClient(params)
        xhr.then(res => {
            let response = getFilterCamera (paramsFilter)
            response.then(res =>{
                this.props.refreshImage(res.camList[shop].check_light, res.camList[shop].check_error, res.camList[shop].cashier, shop)
                this.setState({ loadingReload: false })
            })
        })
       
        
    }
    // onCheckCountGuestAtCashier = (shop,channel , checkCountGuestAtCashier ,IP , Port , valueCheck) =>{
    //     this.setState({loadingFile : true})
    //     axios.post(`${urlAI}?key=count_guest_at_cashier&IP=${IP}&C=${channel}&port=${Port}&value=${valueCheck}`)
    //     .then(response =>
    //         this.props.refreshCheckCountGuestAtCashier(checkCountGuestAtCashier,shop)
    //     )
    //     .catch(error => console.log(error))
    // }
    // onCheckCountGuestInOut = (shop,channel , checkCountGuestInOut ,IP , Port , valueCheck) =>{
    //     this.setState({loadingFile : true})
    //     axios.post(`${urlAI}?key=count_guest_in_out&IP=${IP}&C=${channel}&port=${Port}&value=${valueCheck}`)
    //     .then(response =>
    //         this.props.refreshCheckCountGuestInOut(checkCountGuestInOut,shop)
    //     )
    //     .catch(error => console.log(error))
    // }
    /**
     * Render content
     */
    renderImageCamera = () => {
        let { locaName, valueImages , channelImage , IP ,Port ,ai_control } = this.props
        let result = []
        let arrImgs = []
        const sizeChunk = 6;
        Object.keys(valueImages).map((indexCamera , index) => {
            arrImgs.push({
                channel: channelImage[indexCamera],
                src: valueImages[indexCamera],
                nameShop: locaName,
                index : index ,
                IP : IP,
                Port: Port,
                ai_control : ai_control[indexCamera]
            });
        })
        this.chunk(arrImgs, sizeChunk).map((arrChunk, index) => {
            let arrCol = [];
            if (Array.isArray(arrChunk)) {
                arrChunk.map((i, indexChunk) => {
                    arrCol.push(<Col key={uniqueId('__shop_img')} span={4} className='mb-2'>
                        <div className='mr-2 mb-3 text-center' style={{boxShadow: 'rgb(0 0 0 / 10%) 1.3px 2.7px 5px 0px' }}>
                        <LazyLoad height={140}>
                            <Image src={i.src + '?' + this.props.dateTime} style={{ width: '200%', height: '140px' }} />
                        </LazyLoad>
                            <div className='mb-1 p-1' style={{ height: 50 }}>
                                {i.channel ?
                                    <div className='d-flex justify-content-between mr-1'>
                                        <div className='d-flex align-items-start mt-2' style={{ lineHeight: '1.2' }}>
                                            <p>Channel : {i.channel} </p>
                                        </div>
                                        <div className='float-right mb-1' style={{ lineHeight: '1.2'}}>
                                            <div className='d-flex align-items-start flex-column'>
                                                <Link to={{
                                                    pathname: `/edit-camera-shop`,
                                                    search: `?channel=${i.channel}&shop=${i.nameShop}`,
                                                    state : {Image: i.src + '?' + this.props.dateTime ,
                                                            ai_control : i.ai_control,
                                                            channel : i.channel,
                                                            Port : i.Port , 
                                                            IP : i.IP
                                                    }
                                                    
                                                }}>
                                                    <Button className='mt-1' style={i.ai_control != 0 ? {backgroundColor : '#ffed4a'} : {}}>AI</Button>
                                                    
                                                </Link>
                                            </div>
                                        </div>
                                    </div> 
                                    : ''}
                            </div>
                        </div>
                    </Col>
                    )
                })
            }
            result.push(<Row key={index}>{arrCol}</Row>)
        })
        return result;
    }   
    onDelete = (e , IP , Port) =>{
        e.stopPropagation();
        let { t } = this.props;
        let params = {
            keys: ['ip', 'port'],
            values: [IP , Port] 
        }
        let xhr = apiDelete(params);
        xhr.then((response) => {
            showNotify('Notification', 'Đã xoá thành công !')
        })
    }
    render() {
        let { locaName, valueImages , IP , Port ,idLocation} = this.props
        return (
            <>
                <strong className='mb-5' style={{fontSize:'17px'}}>Cửa hàng : {locaName}</strong>
                &emsp;<Button loading={this.state.loadingReload} type='primary' onClick={() => this.reloadClient(IP ,Port ,locaName , idLocation)}><RedoOutlined /></Button>
                &nbsp;
                &nbsp;
                <Popconfirm
                    title="Bạn có muốn xoá không?"
                    onConfirm={(e) => this.onDelete(e, IP, Port)}
                    // onCancel={cancel}
                    okText="Có"
                    cancelText="Không"
                    placement="topLeft"
                    icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                >
                    <Button type='danger' ><DeleteOutlined /></Button>
                </Popconfirm>
                <Spin spinning={this.state.loadingReload}>
                    <div className='pt-3 mb-3'>{this.renderImageCamera()}</div>
                </Spin>
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
const mapDispatchToProps = (dispatch) => {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ImageCamera));