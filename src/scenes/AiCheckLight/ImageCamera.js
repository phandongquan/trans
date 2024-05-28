import React, { Component } from 'react'
import { Button, Row, Col ,Dropdown , Image ,Popconfirm, Spin , Menu } from "antd";
import { uniqueId } from 'lodash';
import ButtonDelete from '~/components/Base/DeleteButton';
import { faTrashAlt ,faPowerOff , faDollarSign , faLightbulb , faEllipsisV , faCaretDown , faDoorClosed} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { QuestionCircleOutlined , RedoOutlined , DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import LazyLoad from 'react-lazy-load';
import { reloadClient ,getListCamera as getFilterCamera,  deleteShop  as apiDelete , apiRemoveChannelCam} from '~/apis/aiCheckLight/ai_check_light';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { checkPermission, showNotify } from '~/services/helper';
import { Link } from 'react-router-dom';
import { typeCamera } from '~/constants/basic';

const urlAI = 'https://ai.hasaki.vn/speech/check_light_is_on/config';
const locationCams = {
    0: 'Chưa xác định',
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

class ImageCamera extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loadingReload : false,
            valuesCashier : this.props.checkCashier,
            valuesCheckLight : this.props.checkLight,
            valuesCheckError:this.props.checkError,
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
    onCheckPriority(shop, channel, priority, IP, Port, valueCheck) {
        this.setState({ loadingFile: true })
        axios.post(`${urlAI}?key=priority&IP=${IP}&C=${channel}&port=${Port}&value=${valueCheck}`)
            .then(response =>
                this.props.refreshPriority(priority, shop)
            )
            .catch(error => console.log(error))
    }
    
    onCheckLight(shop,channel , checkLight ,IP , Port , valueCheck){
        this.setState({loadingFile : true})
        axios.post(`${urlAI}?key=check_light&IP=${IP}&C=${channel}&port=${Port}&value=${valueCheck}`)
            .then(response =>
                this.props.refreshCheckLight(checkLight,shop)
            )
            .catch(error => console.log(error))
    }
    onCheckError(shop,channel , checkError ,IP , Port  , valueCheck){
        this.setState({loadingFile : true})
        axios.post(`${urlAI}?key=check_error&IP=${IP}&C=${channel}&port=${Port}&value=${valueCheck}`)
            .then(response =>
                this.props.refreshStatusCheckError(checkError,shop)
            )
            .catch(error => console.log(error))
    }
    onTypeCamera(shop,channel , area_type, IP , Port , type){
        this.setState({loadingFile : true})
        axios.post(`https://ai.hasaki.vn/control/check_light_is_on/config?key=area_type&value=${JSON.stringify(type)}&IP=${IP}&port=${Port}&C=${channel}`)
            .then(response =>{
                this.props.refreshTypeCamera(area_type,shop) 
            })
            .catch(error => console.log(error))
    }
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
    removeImgChannel (e , channel, port, ip) {
        e.stopPropagation();
        let params = {
            keys: ['ip', 'port', 'C'],
            values : [ip , port , channel ]
        }
        let xhr = apiRemoveChannelCam(params)
        xhr.then(res =>{
            this.props.refreshApi()
            showNotify('Notification', 'Đã xoá thành công !')
        })
    }
    /**
     * Render content
     */
    renderImageCamera = () => {
        let { locaName, valueImages , channelImage ,checkLight ,checkCashier, checkError , IP ,Port ,ai_control , area_type ,priority , ai_control_status ,store_id , idx} = this.props
        let result = []
        let arrImgs = []
        const sizeChunk = 4;

        Object.keys(valueImages).map((indexCamera , index) => {
            arrImgs.push({
                channel: channelImage[indexCamera],
                src: valueImages[indexCamera],
                nameShop: locaName,
                checkLight : checkLight[indexCamera],
                index : index ,
                // checkCashier : checkCashier[indexCamera],
                checkError : checkError[indexCamera],
                IP : IP,
                Port: Port,
                ai_control : ai_control[indexCamera],
                area_type : area_type[indexCamera],
                priority : priority[indexCamera],
                ai_control_status : ai_control_status[indexCamera],
                store_id : store_id,
                idx : idx
            });
        })
        this.chunk(arrImgs, sizeChunk).map((arrChunk, index) => {
            let arrCol = [];
            if (Array.isArray(arrChunk)) {
                arrChunk.map((i, indexChunk) => {
                    const items = [
                        {
                            key: '1',
                            label: 
                            typeof i.area_type === 'object' && !Array.isArray(i.area_type) && i.area_type !== null ?
                                Object.keys(locationCams).map(key => {
                                    if (key == 0) {
                                        return <Menu.Item key={uniqueId('_dropdown')} onClick={() => {
                                            i.area_type[key] == 0 ? i.area_type[key] = 1 : i.area_type[key] = 0
                                            i.area_type[1] = 0
                                            i.area_type[2] = 0
                                            i.area_type[3] = 0
                                            i.area_type[4] = 0
                                            i.area_type[5] = 0
                                            i.area_type[6] = 0
                                            i.area_type[7] = 0
                                            i.area_type[8] = 0
                                            i.area_type[9] = 0
                                            i.area_type[10] = 0
                                            i.area_type[0] = (!Object.values(i.area_type).includes(1) || Object.values(i.area_type)[0] == 1) ? 1 : 0
                                            this.onTypeCamera(i.nameShop, i.channel, area_type, i.IP, i.Port, i.area_type)
                                        }}>
                                            <Button
                                                style={i.area_type[key] == '1' ? { marginRight: '4px', color: '#140b0b', background: '#ced91f' }
                                                    : { marginRight: '4px', color: 'rgb(188 193 197)', background: 'transparent' }} size='small'
                                            >{locationCams[key]}</Button>
                                        </Menu.Item>
                                    } else {
                                        return <Menu.Item key={uniqueId('_dropdown')} onClick={() => {
                                            i.area_type[key] == 0 ? i.area_type[key] = 1 : i.area_type[key] = 0
                                            i.area_type[0] = !Object.values(i.area_type).includes(1) ? 1 : 0
                                            // i.area_type[0]
                                            // if(!Object.values(i.area_type).includes(1)){
                                            //     i.area_type[0] = 1
                                            // }
                                            this.onTypeCamera(i.nameShop, i.channel, area_type, i.IP, i.Port, i.area_type)
                                        }}>
                                            <Button
                                                style={i.area_type[key] == '1' ? { marginRight: '4px', color: '#140b0b', background: '#ced91f' }
                                                    : { marginRight: '4px', color: 'rgb(188 193 197)', background: 'transparent' }} size='small'
                                            >{locationCams[key]}</Button>
                                        </Menu.Item>
                                    }

                                })
                                :
                                []
                        }
                    ];
                    arrCol.push(<Col key={uniqueId('__shop_img')} span={6} className='mb-2'>
                        <div className='mr-2 mb-3 text-center' style={i.checkError == '0' ? { boxShadow: 'rgb(0 0 0 / 10%) 1.3px 2.7px 5px 0px' , backgroundColor:'#000000' , color:'white'} : {boxShadow: 'rgb(0 0 0 / 10%) 1.3px 2.7px 5px 0px' }}>
                            <div className='d-flex justify-content-between'>
                                <LazyLoad height={200}>
                                    <Image src={i.src + '?' + this.props.dateTime} style={{ width: '100%', height: '200px' }} />
                                </LazyLoad>
                                <Popconfirm
                                    title="Bạn có muốn xoá camera không?"
                                    onConfirm={(e) => {
                                        this.removeImgChannel(e , i.channel , i.Port , i.IP)
                                    }}
                                    // onCancel={cancel}
                                    okText="Có"
                                    cancelText="Không"
                                    placement="topLeft"
                                    icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                                >
                                    {checkPermission('hr-tool-camera-shop-delete') ?
                                        <Button className='mr-2' icon={<FontAwesomeIcon icon={faTrashAlt} />} />
                                        : ''
                                    } 
                                </Popconfirm>
                            </div>
                            <div className='mb-1 p-1' style={{ height: 45 }}>
                                {i.channel ?
                                    <div className='d-flex justify-content-between align-items-end mr-1'>
                                        <div className='mt-2' style={{ lineHeight: '1.2' }}>
                                            <p>Channel : {i.channel} </p>
                                        </div>
                                        <div className='text-muted float-right mb-1' style={{ lineHeight: '1.2'}}>
                                            {/* <Popconfirm
                                                title="Bạn có muốn bật/tắt Ưu tiên không?"
                                                onConfirm={() => {

                                                    if (priority[i.index] == 1) {
                                                        priority[i.index] = String(0)
                                                        i.priority = String(0)
                                                    } else {
                                                        priority[i.index] = String(1)
                                                        i.priority = String(1)
                                                    }
                                                    this.onCheckPriority(i.nameShop, i.channel, priority, i.IP, i.Port, i.priority)
                                                }}
                                                // onCancel={cancel}
                                                okText="Có"
                                                cancelText="Không"
                                                placement="topLeft"
                                                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                                            >
                                                <Button
                                                    style={i.priority == '0' ? { marginRight: '4px', color: 'rgb(188 193 197)', background: 'transparent' } : { marginRight: '4px', color: '#140b0b', background: '#ced91f' }} size='small'
                                                >Ưu tiên</Button>
                                            </Popconfirm> */}
                                            <Link to={{
                                                pathname: `/edit-camera-shop`,
                                                // search: `?channel=${i.channel}&shop=${i.nameShop}`,
                                                search: `?idx=${i.idx}`,
                                                state: {
                                                    ai_control: i.ai_control,
                                                    channel: i.channel,
                                                    Port: i.Port,
                                                    IP: i.IP,
                                                    ai_control_status : i.ai_control_status,
                                                    store_id : i.store_id,
                                                    idx: i.idx , 
                                                    locaName : i.nameShop
                                                }

                                                }}>
                                                    { checkPermission('hr-tool-camera-shop-update') ?
                                                        <Button size='small' style={i.ai_control_status == 1 ? { marginRight: '4px', backgroundColor: '#ffed4a' }
                                                            : { marginRight: '4px', color: 'rgb(188 193 197)', background: 'transparent' }}>
                                                            AI
                                                        </Button>
                                                        : ''
                                                    }
                                                </Link>
                                            
                                            <Popconfirm
                                                title="Bạn có muốn bật/tắt kiểm tra đóng mở cửa không?"
                                                onConfirm={()=>{
                                                    
                                                    if(checkLight[i.index] == 1){
                                                        checkLight[i.index] = String(0)
                                                        i.checkLight = String(0)
                                                    }else{
                                                        checkLight[i.index] = String(1)
                                                        i.checkLight = String(1)
                                                    }
                                                    this.onCheckLight(i.nameShop,i.channel, checkLight , i.IP , i.Port , i.checkLight)
                                                }}
                                                // onCancel={cancel}
                                                okText="Có"
                                                cancelText="Không"
                                                placement="topLeft"
                                                icon={<QuestionCircleOutlined style={{ color: 'red' }}/>}
                                            >
                                                {checkPermission('hr-tool-camera-shop-update') ? 
                                                    <Button
                                                        style={i.checkLight == '0' ? { marginRight: '4px', color: 'rgb(188 193 197)', background: 'transparent' } : { marginRight: '4px', color: '#140b0b', background: '#ced91f' }} size='small'
                                                        icon={<FontAwesomeIcon icon={faDoorClosed} />}
                                                    ></Button>
                                                     : ""
                                                }
                                            </Popconfirm>
                                            <Popconfirm
                                                title="Bạn có muốn bật/tắt camera không?"
                                                onConfirm={()=>{
                                                    
                                                    if(checkError[i.index] == 1){
                                                        checkError[i.index] = String(0)
                                                        i.checkError = String(0)
                                                    }else{
                                                        checkError[i.index] = String(1)
                                                        i.checkError = String(1)
                                                    }
                                                    this.onCheckError(i.nameShop,i.channel, checkError , i.IP , i.Port ,i.checkError)
                                                }}
                                                // onCancel={cancel}

                                                okText="Có"
                                                cancelText="Không"
                                                placement="topLeft"
                                                icon={<QuestionCircleOutlined style={{ color: 'red' }}/>}
                                            >
                                               {checkPermission('hr-tool-camera-shop-update') ?
                                                    <Button size='small' danger ghost icon={<FontAwesomeIcon icon={faPowerOff} />}></Button>
                                                     : ''
                                                }
                                            </Popconfirm>
                                            <Dropdown trigger={['click']} key={uniqueId('_dropdown')} 
                                            menu={{items}} 
                                                type="primary" placement="bottomLeft">
                                                <Button size='small'
                                                    style={{ color: '#140b0b', background: '#ced91f', fontSize: 10, marginLeft: 2, padding: 2 }}
                                                >
                                                    {
                                                        typeof i.area_type === 'object' && !Array.isArray(i.area_type) && i.area_type !== null ?
                                                            i.area_type[0] ?
                                                                'Chưa xác định'
                                                                :
                                                                Object.keys(i.area_type).map(key => {
                                                                    if(i.area_type[key]){
                                                                        return '(' + locationCams[key] + ')'
                                                                    }
                                                                })
                                                            : 'Chưa xác định'
                                                    }   
                                                </Button>
                                            </Dropdown>
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
    onDeleteShop = (e , IP , Port) =>{
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
                <Popconfirm
                    title="Bạn có muốn xoá không?"
                    onConfirm={(e) => this.onDeleteShop(e, IP, Port)}
                    // onCancel={cancel}
                    okText="Có"
                    cancelText="Không"
                    placement="topLeft"
                    icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                >
                    {checkPermission('hr-tool-camera-shop-delete') ? 
                        <Button type='danger' ><DeleteOutlined /></Button> 
                        : ''
                    }
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