import React, { Component } from 'react'
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import {Row ,Spin ,Col ,Tag , Modal ,Button , Popconfirm , Form ,Input, Table, Progress, Typography, Checkbox, Divider } from 'antd' ;
import { PageHeader } from '@ant-design/pro-layout';
import Tab from '~/components/Base/Tab';
import tabs from './config/tabs';
import { uniqueId } from 'lodash';
import './config/groupCameraShop.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faPlusCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { getShopStatus ,updateStatus ,editShop , apiAssignTask , apiRemoveTask , apiDeleteShop , editNameShop, updateIpShop} from '~/apis/aiCheckLight/ai_check_light';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { checkPermission, showNotify  , timeFormatStandard} from '~/services/helper';
import Dropdown from '~/components/Base/Dropdown';
import dayjs from 'dayjs';

class GroupCameraShop extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.formIPRef = React.createRef();
        this.state = {
            loading : false, 
            visible : false,
            datas : [],
            mac_Address : '',
            dataTasks : [],
            data : {}, 
            visibleLanIP: false,
            dataIP : {}
        }
    }
    componentDidMount () {
        this.getListShop()
        try {
            this.interval = setInterval(() => {
                this.getListShop();
            }, 15000);
        } catch (e) {
            console.log(e);
        }
        
    }
    componentWillUnmount() {
        clearInterval(this.interval);
    }
    getListShop = async () =>{
        let response = await getShopStatus()
        if(response){
            this.setState({datas : response.nodeList})
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
    // submitStatus (mac_address) {
    //     let params = {
    //         mac_address : mac_address
    //     }
    //     let xhr = updateStatus(params)
    //     xhr.then((response) => {
    //         if(response){
    //             showNotify('Notification', 'Cập nhật trạng thái thành công');
    //             this.getListShop()
    //         }
    //     })
    // }
    setFormModal(infoCamera){
        
    }
    async removeIP(id , dataIP){
        let params = { 
            id : id,
            action : 'delete',
            sub_object : dataIP
        }
        let response = await updateIpShop(params)
        if(response.status){
            showNotify('Notification' , response.message)
            this.getListShop()
        }else{
            showNotify('Notification' , response.message,'error')
        }
    }
    async submitForm(values){
        // let values = this.formRef.current.getFieldsValue()
        this.setState({loading : true})
        let params = {
            id : this.state.data.id,
            nickname : values.nickname
        }

        let response = await editNameShop(params)
        if(response){
            if(response.status){
                this.getListShop()
                showNotify('Thông báo' , 'Cập nhật thành công!')
                this.setState({loading : false , visible : false })
            }
        }else{
            showNotify('Notification' , response.message , 'error')
            this.setState({loading : false})
        }
    }
    async submitFormIP (values) {
        // let values = this.formIPRef.current.getFieldsValue()
        let params = {}
        if(this.state.dataIP?.id >= 0 ){
            values = {
                ...values,
                id: this.state.dataIP?.id
            }
            params.action  = 'update'
        }else{
            params.action  = 'add'
        }
        params.sub_object = values
        params.id = this.state.data.id
        let response = await updateIpShop(params)
        if(response.status){
            showNotify('Notification' , response.message)
            this.setState({visibleLanIP : false})
            this.getListShop()
        }else{
            showNotify('Notification' , response.message,'error')
        }
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
     * Handle submit form
     */
    handleSubmitFormIP = () => {
        this.formIPRef.current.validateFields()
            .then((values) => {
                if(values.roi){
                    let arrRoi = "[" + values.roi + "]";
                    values.roi = arrRoi
                }
                if(!values.is_cashier){
                    values.is_cashier = false
                }else{
                    values.is_cashier = true
                }
                this.submitFormIP(values);
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    }
    renderChannel(data , i) {
        let arrDatasFps = i?.fps_report ? i.fps_report : []
        if(arrDatasFps.length){
            let dataFps = arrDatasFps.find(d => data.id == d.id)
            if(dataFps){
                Object.keys(dataFps).map(key => {
                    if (key != 'id') {
                        data[key] = dataFps[key].toFixed(1)
                    }
                })
            }
        }
        const { baseData: { locations } } = this.props;
        let result = []
        Object.keys(data).map(key => {
            let new_Key = key.slice()
            new_Key = new_Key.charAt(0).toUpperCase() + new_Key.slice(1);
            if(['decode_fps','inference_fps','track_fps'].includes(key)){
                result.push(<div className='d-flex'>
                    - {new_Key} :<span className='ml-auto'  style={{ color: data[key] < 10 ? 'red' : '' }}>{data[key] ? data[key] : ''}</span>
                </div>)
            }else{
                switch (key){
                    case 'channel':
                        result.push(<div className='d-flex'>- {new_Key} : {data[key]}
                            {
                                checkPermission('hr-tool-group-camera-shop-update') ?
                                    <FontAwesomeIcon className='cursor-pointer ml-auto'
                                        icon={faPen}
                                        onClick={() =>
                                            this.setState({ visibleLanIP: true, dataIP: data, data: i },
                                                () => this.formIPRef.current.setFieldsValue(data)
                                            )
                                        }
                                    />
                                    : []

                            }
                            <Popconfirm title={('Confirm delete selected channel?')}
                                placement="topLeft"
                                icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                                onConfirm={() => this.removeIP(i.id, data)}
                            >
                                {
                                    checkPermission('hr-tool-group-camera-shop-delete') ?
                                        <FontAwesomeIcon className='cursor-pointer ml-2' icon={faTrash} />
                                    : []
                                }
                            </Popconfirm>
                        </div>)
                        break;
                    case 'roi':
                        if(data[key]){
                            let roi = data[key]
                            result.push(<div className='d-flex'>- {new_Key} :<span className='ml-auto'>{roi?.toString()}</span></div>)
                            break;
                        }
                    case 'store_ip':
                        let locFind = locations.find(l => {
                            if(l.ip && l.ip.length){
                                let arrIP = l.ip
                                if(arrIP.includes(data[key])){
                                    return l
                                } else{
                                    return
                                }
                            }
                        })
                        result.push(<div className='d-flex'>- {new_Key} :
                            <span className='ml-auto'>{data[key] ? locFind?.name : data[key]
                            }<br />({data[key]})</span>
                        </div>)
                        break;
                    case 'is_cashier':
                        result.push(<div className='d-flex'>- {new_Key} :<span className='ml-auto'>{data[key] ? 'Vị trí cashier' : 'Không phải vị trí cashier'}</span></div>)
                        break; 
                    default:
                        result.push(<div className='d-flex'>- {new_Key} :<span className='ml-auto'>{data[key] ? data[key] : ''}</span></div>)
                        break;
                }
            }
        })
        return <div key={data.id}>
            {result}
            <Divider />
        </div>
    }
    renderShop() {
        const { baseData: { locations } } = this.props;
        let {datas} = this.state ;
        let result = [] ;
        let arrShops = [] ;
        const sizeChunk = 6;
        let numberGb = 1024*1024*1024
        this.chunk(datas, sizeChunk).map((arrChunk, index) => {
            let arrCol = [];
            if (Array.isArray(arrChunk)) { 
                arrChunk.map((i, indexChunk) => {
                    const store = locations.find(l => (l?.ip && (Array.isArray(l?.ip))) ? (l.ip).includes(i.public_ip) : '' );
                    arrCol.push(<Col key={uniqueId('__shop')} span={4} className='mb-2'>
                            <div className='mr-2 mb-3 text-center card p-3'
                                style={i.online ? { backgroundColor: 'rgba(0,128,0,.2)', boxShadow: 'rgb(0 0 0 / 10%) 1.3px 2.7px 5px 0px' }
                                : { color: 'rgb(188 193 197)', background: 'transparent' }}>
                                <div className='d-flex'>
                                    {
                                        // i.online ?
                                        // <Tag className='p-2' color={i.online ? 'rgb(98, 210, 111)' : "rgb(204, 204, 204)"}/>
                                        // :
                                        // <Popconfirm title={'Bạn có muốn bật camera shop không ?'}
                                        //     onConfirm={() => this.submitStatus(i.mac_address)}
                                        //     icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                                        // >
                                        //     <Tag className='cursor-pointer' color={i.online ? 'rgb(98, 210, 111)' : "rgb(204, 204, 204)"} />
                                        // </Popconfirm>
                                    }
                                    {/* <Button className='ml-auto' type="text" size='small' icon={<FontAwesomeIcon icon={faPen}/>} onClick={() => {}}/> */}
                                    {/* <Button className='ml-2' type="text" size='small' icon={<FontAwesomeIcon icon={faTrash}/>} onClick={() => this.deleteShop(i.mac_address)}/> */}
                                </div>
                                <div>
                                    <span style={{ color: i.online ? '#333' : 'rgb(150 156 161)', fontWeight: 700, fontSize: 12 }}>{i.nickname ? i.nickname : 'N/A'}</span>
                                    {
                                    checkPermission('hr-tool-group-camera-shop-update') ?
                                        <FontAwesomeIcon
                                            className='cursor-pointer ml-2'
                                            icon={faPen}
                                            onClick={() =>
                                                this.setState({ visible: true, data: i },
                                                    () => this.formRef.current.setFieldsValue({ nickname: i.nickname }))
                                            }
                                        />
                                        : []
                                    }
                                </div>
                                <span className={i.online ? 'online mt-2 ' : 'offline mt-2'} style={{ textAlign: 'left', fontSize: 12 }}>
                                    {/* Unique Name:{i.unique_name ? i.unique_name : 'N/A'}
                                <br /> */}
                                    Unique Name:&nbsp;
                                    {i?.unique_name}
                                    <br />
                                    Face Version:&nbsp;
                                    {i?.face_version}
                                    <br />
                                    Manager Version:&nbsp;
                                    {i?.manager_version}
                                    <br />
                                    Location:&nbsp;
                                    {store ? store.name : i.public_ip}
                                    <br />
                                    Last Ping:&nbsp;
                                    {i.last_ping ? dayjs(i.last_ping).utc(0).format('HH:mm DD-MM-YYYY') : 'N/A'}
                                    <br />
                                    <br />
                                    {
                                        i.status != null && Object.keys(i?.status).length !== 0 ?
                                            <>
                                                Status :<br />
                                                <div className='d-flex' style={{ height: '25px', width: '100%' }}>
                                                    &nbsp; + Cpu  : &nbsp;
                                                    <div className='ml-auto' style={{ width: '30%' }}>
                                                        <Progress percent={i?.status?.CPU}
                                                            size="small"
                                                            showInfo={false}
                                                            status={i?.status?.CPU > 80 ? 'exception' : ''}
                                                        />
                                                    </div>
                                                    &nbsp;
                                                    <span style={{ width: '35%' }}>
                                                        {i?.status?.CPU}%
                                                    </span>
                                                </div>
                                                <div className='d-flex' style={{ height: '25px', width: '100%' }}>
                                                    &nbsp; + Ram  : &nbsp;
                                                    <div className='ml-auto' style={{ width: '30%' }}>
                                                        <Progress percent={i?.status?.RAM?.percent}
                                                            size="small"
                                                            showInfo={false}
                                                            status={i?.status?.RAM?.percent > 80 ? 'exception' : ''}
                                                        />
                                                    </div>
                                                    &nbsp;
                                                    <span style={{ width: '35%' }}>
                                                        {(Number((i?.status?.RAM?.used) / numberGb).toFixed(1)
                                                            + '/' +
                                                            Number((i?.status?.RAM?.total) / numberGb).toFixed(1))}
                                                        GB
                                                    </span>
                                                </div>
                                                <div className='d-flex' style={{ height: '25px', width: '100%' }}>
                                                    &nbsp; + Swap : &nbsp;
                                                    <div className='ml-auto' style={{ width: '30%' }}>
                                                        <Progress percent={i?.status?.SWAP?.percent} size="small"
                                                            showInfo={false}
                                                            status={i?.status?.SWAP?.percent > 80 ? 'exception' : ''}
                                                        />
                                                    </div>
                                                    &nbsp;
                                                    <span style={{ width: '35%' }}>
                                                        {(Number((i?.status?.SWAP?.used) / numberGb).toFixed(1)
                                                            + '/' +
                                                            Number((i?.status?.SWAP?.total) / numberGb).toFixed(1))}
                                                        GB
                                                    </span>
                                                </div>
                                            
                                            {
                                                i?.status?.GPU ?
                                                    <div>
                                                        &nbsp; + GPU :
                                                        <div className='ml-3 d-flex'>
                                                            <span style={{width: 60}}>-memory:</span>
                                                            <div className='ml-3' style={{ width: '33%' }}>
                                                                <Progress percent={i?.status?.GPU?.memory_used_percent?.toFixed(1)} size="small"
                                                                    showInfo={false}
                                                                    status={i?.status?.GPU?.memory_used_percent > 80 ? 'exception' : ''}
                                                                />
                                                            </div>
                                                            <span className='ml-1' style={{ width: '35%' }}>
                                                                {(Number((i?.status?.GPU?.memory_used) / numberGb).toFixed(1)
                                                                    + '/' +
                                                                    Number((i?.status?.GPU?.memory_total) / numberGb).toFixed(1))}
                                                                GB
                                                            </span>
                                                        </div>
                                                        <div className='ml-3 d-flex'>
                                                            <span style={{width: 60}}>-utiliz:</span>
                                                            <div className='ml-3' style={{ width: '33%' }}>
                                                                <Progress percent={i?.status?.GPU?.utilization?.toFixed(1)} size="small"
                                                                    showInfo={false}
                                                                    status={i?.status?.GPU?.utilization > 80 ? 'exception' : ''}
                                                                />
                                                            </div>
                                                            <span className='ml-1' style={{ width: '35%' }}>
                                                                {i?.status?.GPU?.utilization + '%' }
                                                            </span>
                                                        </div>
                                                    </div>
                                                    : []
                                            }
                                                
                                            {
                                                i?.status?.TEMP ?
                                                    <div className='d-flex' style={{ height: '25px', width: '100%' }}>
                                                        &nbsp; + Temp : &nbsp;<span style={{
                                                            color: i?.status?.TEMP >= 70 ? 'red' : '',
                                                            fontWeight: i?.status?.TEMP >= 70 ? 'bold' : ''
                                                        }}>
                                                            {i?.status?.TEMP}℃
                                                        </span>
                                                    </div>
                                                    : []
                                            }
                                            {
                                                i?.status?.NETWORK ?
                                                    <div>
                                                        &nbsp; + NETWORK :
                                                        <div className='ml-3 d-flex'>
                                                            <span style={{ width: 60 }}>-Recv:</span>
                                                            <span className='ml-auto' style={{ width: '35%' }}>
                                                                {Number((i?.status?.NETWORK?.bytes_recv) / (1024*1024)).toFixed(1)}
                                                                MB/s
                                                            </span>
                                                        </div>
                                                        <div className='ml-3 d-flex'>
                                                            <span style={{ width: 60 }}>-Sent:</span>
                                                            <span className='ml-auto' style={{ width: '35%' }}>
                                                                {Number((i?.status?.NETWORK?.bytes_sent) / (1024*1024)).toFixed(1)}
                                                                MB/s
                                                            </span>
                                                        </div>
                                                    </div>
                                                    : []
                                            }

                                                <span>
                                                    Camera Lan Ip:
                                                    {
                                                        checkPermission('hr-tool-group-camera-shop-update') ?
                                                        <FontAwesomeIcon className='cursor-pointer ml-2 mt-1'
                                                            icon={faPlusCircle}
                                                            onClick={() =>
                                                                this.setState({ visibleLanIP: true, data: i })
                                                            }
                                                        />
                                                        : ""
                                                    }
                                                </span>
                                                <br />
                                                {
                                                    (i.camera_lan_ip)?.map((c) =>this.renderChannel(c , i  ))
                                                }
                                                {
                                                    i.hardware_status != null ?
                                                        Object.keys(i.hardware_status).map((k, iHardware) => {
                                                            return (
                                                                //name.charAt(0).toUpperCase() + name.slice(1)
                                                                <span key={iHardware}>{k.charAt(0).toUpperCase() + k.slice(1)} 
                                                                : {i.hardware_status[k] ? i.hardware_status[k] : 'N/A'} <br /></span>
                                                            )
                                                        })
                                                        : []
                                                    }
                                            </>
                                            : []
                                    }


                                </span>
                            </div>
                    </Col>)
                })
            }
            result.push(<Row key={index}>{arrCol}</Row>)
        })
        return result;
    }
    render() {
        let { t , baseData: { locations } , auth} = this.props;
        const columns =[
            
            {
                title: 'IP',
                dataIndex: '_ip'
            },
            {
                title: t('port'),
                dataIndex: '_port'
            },
            {
                title: t('client'),
                dataIndex: 'client'
            },
            {
                title: t('channel'),
                dataIndex: '_channel'
            },
            {
                title: t('area_type'),
                dataIndex: '_type'
            },
            {
                title: t('assign_to'),
                dataIndex: 'assigned_to_node'
            },
            
            
        ]
        return (
            <>
                <PageHeader title={t('group_shop')}
                />
                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={tabs(this.props)} />
                </Row>

                <Spin spinning={this.state.loading}>
                    <div className='item_status_shop pt-3 mb-3'>{this.renderShop()}</div>
                </Spin>
                <Modal
                    forceRender
                    title="Edit Computer"
                    open={this.state.visible}
                    onCancel={() => this.setState({visible : false})}
                    onOk={() => this.handleSubmitForm()}
                    afterClose={() => {
                        this.setState({data : {}})
                        this.formRef.current.resetFields()
                    }}
                >  
                    <Form ref={this.formRef} className="p-3">
                            <Form.Item label='Nick name' name={'nickname'} hasFeedback rules={[{ required: true, message: t('input_name') }]}>
                                <Input placeholder='Nhập name' />
                            </Form.Item>
                    </Form>
                </Modal>
                <Modal
                    forceRender
                    title="Edit Lan IP"
                    open={this.state.visibleLanIP}
                    onCancel={() => this.setState({visibleLanIP : false})}
                    onOk={() => this.handleSubmitFormIP()}
                    afterClose={() => {
                        this.setState({dataIP : {} ,data :{} })
                        this.formIPRef.current.resetFields()
                    }}
                >
                    <Form ref={this.formIPRef} className="p-3" layout="vertical"
                    autoComplete="off">
                        <Form.Item label='Channel' name={'channel'} hasFeedback rules={[{ required: true, message:t('input_channel')}]}>
                            <Input placeholder='Nhập channel' />
                        </Form.Item>
                        <Form.Item label='IP (Local)' name={'ip'} hasFeedback rules={[{ required: true, message:t('input_ip')}]}>
                            <Input placeholder='Nhập IP' />
                        </Form.Item>
                        <Form.Item label='Port (RTSP)' name={'port'} hasFeedback rules={[{ required: true, message:t('input_port')}]}>
                            <Input placeholder='Nhập Port' />
                        </Form.Item>
                        <Form.Item label='Store Ip (Public)' name={'store_ip'} hasFeedback rules={[{ required: true, message:t('input_store_id') }]}>
                            <Input placeholder='Nhập Store Ip ' />
                        </Form.Item>
                        <Form.Item label={<span>Roi (Vùng crop) <Typography.Text type="secondary">Format input 'x,y,w,h' </Typography.Text> </span>} name={'roi'} >
                            <Input placeholder='Nhập Roi'/>
                        </Form.Item>
                        <Form.Item name={'is_cashier'} valuePropName="checked" >
                            <Checkbox >{t('position_cashier')}</Checkbox>
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
const mapDispatchToProps = (dispatch) => {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(GroupCameraShop));