import React, { Component } from "react";
import { render } from "react-dom";
import { Stage, Layer, Group, Text, Rect, Transformer, RegularPolygon, Image, Arrow } from "react-konva";
import { Row, Form, Input, Button, Col, Divider, Modal , Dropdown as DropdownAntd } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReply, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { showNotify } from '~/services/helper';
import Dropdown from '~/components/Base/Dropdown';
class TransformerComponent extends React.Component {
    componentDidMount() {
        this.checkNode();
    }
    componentDidUpdate() {
        this.checkNode();
    }
    checkNode() {
        // here we need to manually attach or detach Transformer node
        const stage = this.transformer.getStage();
        const { selectedShapeName } = this.props;
        var selectedNode = stage.findOne("." + selectedShapeName);
        // do nothing if selected node is already attached
        if (selectedNode === this.transformer.node()) {
            return;
        }
        if (selectedNode) {
            const type = selectedNode.getType();
            if (type != "Group") {
                selectedNode = selectedNode.findAncestor("Group");
            }
            // attach to another node
            this.transformer.attachTo(selectedNode);
        } else {
            // remove transformer
            this.transformer.detach();
        }
        this.transformer.getLayer().batchDraw();
    }
    render() {
        return (
            <Transformer
                ref={node => {
                    this.transformer = node;
                }}
                // rotateEnabled={false}
            />
        );
    }
}

export default class Canvas extends Component {
    constructor(props) {
        super(props);
        this.groupRef = React.createRef();
        this.formRef = React.createRef();
        this.layerRef = React.createRef();
        this.state = {
            selectedShapeName: "",
            image: null,
            isOnRetangle: false,
            isOnConfig: false,
            isOnArrow: false,
            imgHeight: 0,
            imgWidth: 0,
            positionX1: 0,
            positionY1: 0,
            positionX2: 0,
            positionY2: 0,
            positionX3: 0,
            positionY3: 0,
            positionX4: 0,
            positionY4: 0,
            scaleX : 1,
            scaleY : 1,
            rotation: 0,
            isModalVisible: false,
            visibleMode : 0 ,
        };
    }
    componentDidMount() {
        //set value form info camera 
        this.renderDataImageCamera()
    }
    componentDidUpdate(prevProps, prevState) {
        if(this.props.infoCamera != prevProps.infoCamera) {
            this.setState({ infoCamera: this.props.infoCamera })
            this.renderDataImageCamera()
        }
    }
    //value form info camera & img camera
    renderDataImageCamera = () =>{
        let { infoCamera } = this.props
        
        this.formRef.current.setFieldsValue(infoCamera)
        if(infoCamera.POINTS){
            this.setState({
                positionX1 : infoCamera.POINTS[0][0],
                positionY1 : infoCamera.POINTS[0][1],
                rotation : infoCamera.ROTATION,
                scaleX : infoCamera.SCALEX,
                scaleY : infoCamera.SCALEY
            })
        }else{
            this.setState({
                rotation : infoCamera.ROTATION,
                scaleX : infoCamera.SCALEX,
                scaleY : infoCamera.SCALEY
            })
        }
        if(infoCamera.MODE != -1){
            if(infoCamera.MODE == 0){
                this.setState({visibleMode : infoCamera.MODE , isOnRetangle: true, isOnArrow: false})
            }
            if(infoCamera.MODE == 1){
                this.setState({visibleMode : infoCamera.MODE , isOnRetangle: true, isOnArrow: true})
            }
        }
        const image = new window.Image();
        // image.setAttribute('src', 'https://picsum.photos/2000');
        image.setAttribute('src', this.props.urlImg ? this.props.urlImg : '');
        image.onload = () => {
            // setState will redraw layer
            // because "image" property is changed
            this.setState({ image, imgHeight: image.height, imgWidth: image.width });
        };
    }
    handleStageMouseDown = e => {
        // clicked on stage - cler selection
        if (e.target === e.target.getStage()) {
            this.setState({
                selectedShapeName: ""
            });
            return;
        }
        // clicked on transformer - do nothing
        const clickedOnTransformer =
            e.target.getParent().className === "Transformer";
        if (clickedOnTransformer) {
            return;
        }
        // find clicked rect by its name
        const name = e.target.name();
        if (name) {
            this.setState({
                selectedShapeName: name
            });
        } else {
            this.setState({
                selectedShapeName: ""
            });
        }
    };

    handleStageTranformEnd = e => {
        if (e.target) {
            let x2 = e.target.attrs.x + (e.target.attrs.width * e.target.attrs.scaleX)
            let y2 = e.target.attrs.y
            let x3 = e.target.attrs.x + (e.target.attrs.width * e.target.attrs.scaleX)
            let y3 = e.target.attrs.y + (e.target.attrs.height * e.target.attrs.scaleY)
            let x4 = e.target.attrs.x
            let y4 = e.target.attrs.y + (e.target.attrs.height * e.target.attrs.scaleY)

            let angle = e.target.attrs.rotation * (Math.PI / 180); // Convert to radians

            let rotatedX2 = Math.cos(angle) * (x2 - e.target.attrs.x) - Math.sin(angle) * (y2 - e.target.attrs.y) + e.target.attrs.x
            let rotatedY2 = Math.sin(angle) * (x2 - e.target.attrs.x) + Math.cos(angle) * (y2 - e.target.attrs.y) + e.target.attrs.y;
            let rotatedX3 = Math.cos(angle) * (x3 - e.target.attrs.x) - Math.sin(angle) * (y3 - e.target.attrs.y) + e.target.attrs.x;
            let rotatedY3 = Math.sin(angle) * (x3 - e.target.attrs.x) + Math.cos(angle) * (y3 - e.target.attrs.y) + e.target.attrs.y;
            let rotatedX4 = Math.cos(angle) * (x4 - e.target.attrs.x) - Math.sin(angle) * (y4 - e.target.attrs.y) + e.target.attrs.x;
            let rotatedY4 = Math.sin(angle) * (x4 - e.target.attrs.x) + Math.cos(angle) * (y4 - e.target.attrs.y) + e.target.attrs.y;

            this.setState(state => {
                return {
                    rotation: e.target.attrs.rotation,
                    positionX1: Number(e.target.attrs.x.toFixed()),
                    positionY1: Number(e.target.attrs.y.toFixed()),
                    positionX2: Number(rotatedX2.toFixed()),
                    positionY2: Number(rotatedY2.toFixed()),
                    positionX3: Number(rotatedX3.toFixed()),
                    positionY3: Number(rotatedY3.toFixed()),
                    positionX4: Number(rotatedX4.toFixed()),
                    positionY4: Number(rotatedY4.toFixed()),
                    scaleX: Number(e.target.attrs.scaleX),
                    scaleY: Number(e.target.attrs.scaleY)
                }
            }
            )
            // }
            
            this.formRef.current.setFieldsValue({
                POINTS: [
                    [
                        this.state.positionX1,
                        this.state.positionY1
                    ],
                    [
                        this.state.positionX2,
                        this.state.positionY2
                    ],
                    [
                        this.state.positionX3,
                        this.state.positionY3
                    ],
                    [
                        this.state.positionX4,
                        this.state.positionY4
                    ]
                ]
            })
        }
    }
    /**
     * @event submit coordinates
     * @param {Object} values 
     */
    submitPosition = (params = {}) => {
        let {channel , client_name} = this.props;
        let selfThis = this;
        axios({
            method: "post",
            url: "http://171.244.36.99:555/add_remove_camera",
            data: {
                config: params,
                channel :channel,
                client_name : client_name 
            }
        })
            .then(function (response) {
                //handle success
                selfThis.props.cbUpdateInfoCam(params)
                showNotify(('Notification'), ('Upload thành công!'));
            })
            .catch(function (response) {
                //handle error
                console.log(response);
            });
    }

    /**
     * @event submit form
     * @param {Object} values 
     */
    submitForm = () => {
        if (this.state.isOnRetangle == true) {
            if(this.state.isOnArrow == false){
                this.formRef.current.setFieldsValue({ MODE: 0 })
            }
            if(this.state.isOnArrow == true){
                this.formRef.current.setFieldsValue({ MODE: 1 })
            }
        } else {
            this.formRef.current.setFieldsValue({ MODE: -1 })
        }
        let values = this.formRef.current.getFieldsValue()
        let valueFormat = [];
        //format string to arr number
        valueFormat['POINTS'] = values.POINTS

        // valueFormat['FIRST_APPEARED_INDEX'] = values.FIRST_APPEARED_INDEX?values.FIRST_APPEARED_INDEX:''
        // valueFormat['P3_INDEX'] = values.P3_INDEX?values.P3_INDEX:''

        let newValueFormatPoint
        let newValueFormatFirstApprearedIndex
        let newValueFormatP3Index

        // newValueFormatFirstApprearedIndex = valueFormat['FIRST_APPEARED_INDEX'].split(',').map(function (item) {
        //     return parseInt(item, 10);
        // });
        // newValueFormatP3Index = valueFormat['P3_INDEX'].split(',').map(function (item) {
        //     return parseInt(item, 10);
        // });

        // valueFormat = valueFormat.split(',')
        if (typeof valueFormat['POINTS'] == 'string') {
            newValueFormatPoint = valueFormat['POINTS'].split(',').map(function (item) {
                return parseInt(item, 10);
            });
        } else {
            newValueFormatPoint = valueFormat['POINTS']
        }
        if(values.MODE != -1){
            if(values.MODE == 0){
                values = {
                    ...values,
                    POINTS: newValueFormatPoint,
                    SCALEX: this.state.scaleX,
                    SCALEY: this.state.scaleY,
                    ROTATION: this.state.rotation,
                    MAX_ALLOWED_PEOPLE_INSIDE_AREA: Number(values.MAX_ALLOWED_PEOPLE_INSIDE_AREA),
                    MAX_ALLOWED_TIME_INSIDE_AREA : Number(values.MAX_ALLOWED_TIME_INSIDE_AREA),
                    SKIP_ALERT_TIME : Number(values.SKIP_ALERT_TIME)
                }
            }
            if(values.MODE == 1){
                values = {
                    ...values,
                    POINTS: newValueFormatPoint,
                    SCALEX: this.state.scaleX,
                    SCALEY: this.state.scaleY,
                    ROTATION: this.state.rotation,
                    FIRST_APPEARED_INDEX :  Number(values.FIRST_APPEARED_INDEX),
                    P3_INDEX : Number(values.P3_INDEX),
                    SKIP_ALERT_TIME : Number(values.SKIP_ALERT_TIME)
                }
            }
        }else{
            values = {
                ...values,
                POINTS: newValueFormatPoint,
                SCALEX: this.state.scaleX,
                SCALEY: this.state.scaleY,
                ROTATION: this.state.rotation
            }
        }
        this.submitPosition(values)
    }
    /**
     * 
     * delete image camera
    */
    deleteImgCamera = () => {
        let { client_name, channel } = this.props
        axios({
            method: "post",
            url: "http://171.244.36.99:555/add_remove_camera",
            data : {
                config: {},
                channel :channel,
                client_name : client_name 
            }
        })
            .then(function (response) {
                //handle success
                console.log(response);
                showNotify(('Notification'), ('Xóa Camera thành công!'));
            })
            .catch(function (response) {
                //handle error
                console.log(response);
            });
        this.setState({isModalVisible: false})
    }
     /**
     * change mode add form
     */
    handleForm = (e) =>{
        //visibleMode : '-1' : 'camera chưa xử lý' , '0' : 'camera được xử lý không có hướng' , '1' : 'camera được xử lý có hướng'
        if(e != -1){
            if(e == 0){
                this.setState({visibleMode : 0 ,isOnRetangle : true ,isOnArrow : false})
            }
            if(e == 1){
                this.setState({visibleMode : 1 ,isOnRetangle : true ,isOnArrow : true})
            }
        }else{
            this.setState({visibleMode : -1 , isOnRetangle : false})
        }
    }
    /**
     * 
     * Form info camera
     */
    renderInfoCamera = () => {
        return <Row className='mb-3'>
            <Col span={20} >
                <Form ref={this.formRef} layout='vertical' className={`card pl-3 pb-3 mt-1 ${!this.state.isOnConfig && 'd-none'}`} onFinish={() => this.submitForm()}>
                    <PageHeader title='Info Camera'
                    />
                    <Row gutter={12}>
                        <Col span={6}>
                            <Form.Item name='BAD_CAMERA' label='Trạng thái camera' hasFeedback rules={[{ required: true, message: 'Select status camera' }]}>
                                <Dropdown datas={{ 0  : 'Bình thường', 1 : 'Bị lỗi'}}/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name='CODEC' label='CODEC'>
                                <Input  disabled />
                            </Form.Item>
                        </Col>
                        <Col span={11}>
                            <Form.Item name='CAMERA_URL' label='Camera url'>
                                <Input  disabled />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={12}>
                        <Col span={6}>
                            <Form.Item name='FPS' label='FPS'>
                                <Input  disabled />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name='MODE' label='Mode' rules={[{ required: true, message: 'Select MODE camera' }]} >
                                <Dropdown datas={{'-1' : 'camera chưa xử lý' , '0' : 'camera được xử lý không có hướng' , '1' : 'camera được xử lý có hướng'}}  
                                onChange={e => this.handleForm(e) }
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name='POINTS' label='Points'>
                                <Input  disabled />
                            </Form.Item>
                        </Col>
                    </Row>
                    {
                        // xử lý không có hướng
                        this.state.visibleMode == 0 ?
                        <Row gutter={12}>
                            <Col span={6}>
                                <Form.Item name='MAX_ALLOWED_TIME_INSIDE_AREA' label='Thời gian tối đa'>
                                    <Input  />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name='MAX_ALLOWED_PEOPLE_INSIDE_AREA' label='Số lượng người tối đa'>
                                    <Input   />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name='SKIP_ALERT_TIME' label='Tắt cảnh báo trong vòng'>
                                    <Input   />
                                </Form.Item>
                            </Col>
                        </Row>
                        :[]
                    }
                    {
                        // xử lý có hướng
                        this.state.visibleMode == 1 ?
                        <Row gutter={12}>
                            <Col span={6}>
                                <Form.Item name='FIRST_APPEARED_INDEX' label='FIRST_APPEARED_INDEX'>
                                    <Dropdown datas={{0 : 0  , 1 : 1 , 2 : 2, 3 : 3}}/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name='P3_INDEX' label='P3_INDEX'>
                                    {/* <Dropdown datas={{'0,1' : '0,1'  , '0,3' : '0,3' ,'2,1' : '2,1', '2,3' : '2,3'}}/> */}
                                    <Dropdown datas={{0 : 0  , 1 : 1 , 2 : 2, 3 : 3}}/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name='SKIP_ALERT_TIME' label='Tắt cảnh báo trong vòng'>
                                    <Input   />
                                </Form.Item>
                            </Col>
                        </Row>
                        :[]
                    }
                    
                    <Row>
                        <Col span={12}>
                            <Button type="primary" htmlType='submit' className="mr-2">Submit Info</Button>
                        </Col>
                        <Col span={12} style={{ textAlign: "right", paddingRight: 10 }}>
                            <Button type="danger" icon={<FontAwesomeIcon icon={faTrashAlt} />} className='mr-1' onClick={() =>this.setState({isModalVisible : true})}>
                                &nbsp;{('Delete Image')}
                            </Button>
                        </Col>
                    </Row>
                </Form>

            </Col>
        </Row>
    }
    /**
     * 
     * limit move retangle
     * 
     */
    limitMoved = e =>{
        const stage = e.target.getStage();
        e.target.x(
            Math.max(
                0,
                Math.min(e.target.x(), stage.width() - e.target.width()))
        );
        e.target.y(
            Math.max(
                0,
                Math.min(e.target.y(), stage.height() - e.target.height())
            )
        );
    }
    render() {
        let { imgHeight, imgWidth , rotation , positionX1, positionY1 , scaleX ,scaleY } = this.state
        return (
            <>
                {
                    this.renderInfoCamera()

                }
                <Divider className='m-2' />
                <Row>
                    <Col span={12}>
                        {
                            this.state.isOnConfig == false ?
                                <Button type='primary' size='medium' onClick={() => this.setState({ isOnConfig: true })} className='mb-3 mr-2'>show Config Image</Button>
                                :
                                <Button type='primary' size='medium' onClick={() => this.setState({ isOnConfig: false })} className='mb-3 mr-2'>Off Config Image</Button>
                        }
                        {/* {
                            this.state.isOnRetangle == false ?
                                <Button type='primary' size='medium' onClick={() => this.setState({ isOnRetangle: true })} className='mb-3'>show retangle</Button>
                                :
                                <Button type='primary' size='medium' onClick={() => this.setState({ isOnRetangle: false ,visibleMode : -1})} className='mb-3'>Off retangle</Button>

                        } */}
                        {
                            this.state.isOnRetangle == true ?
                                this.state.isOnArrow == false ?
                                    <Button type='primary' size='medium' onClick={() => this.setState({ isOnArrow: true ,visibleMode : 1  })} className='ml-3'>Show Arrow</Button>
                                    :
                                    <Button type='primary' size='medium' onClick={() => this.setState({ isOnArrow: false ,visibleMode : 0  })} className='ml-3'>Off Arrow</Button>
                                : []

                        }
                        {/* {
                            this.state.isOnRetangle == true ?
                                <Button type="primary" onClick={() => this.submitForm()} className='ml-3' >Submit Info</Button>
                                : []

                        } */}
                    </Col>
                </Row>
                <Row>
                    <Stage
                        width={imgWidth}
                        height={imgHeight}
                        onMouseDown={this.handleStageMouseDown}
                    >
                        <Layer ref={this.layerRef} >
                            <Image image={this.state.image} />
                            {
                                this.state.isOnRetangle == true ?
                                    <>
                                        <Group
                                            ref={this.groupRef}
                                            name="group"
                                            x={positionX1}
                                            y={positionY1}
                                            width={200}
                                            height={150}
                                            fill="red"
                                            draggable
                                            strokeWidth={1}
                                            onTransformEnd={this.handleStageTranformEnd}
                                            onDragEnd={this.handleStageTranformEnd}
                                            rotation={rotation}
                                            scaleX={scaleX}
                                            scaleY={scaleY}
                                            onDragMove={this.limitMoved}
                                        >
                                            <Rect
                                                name="rect"
                                                fill="transparent"
                                                width={200}
                                                height={150}
                                                stroke="red"
                                            />
                                            {
                                                this.state.isOnArrow == true ?
                                                    <Arrow
                                                        name="arrow"
                                                        points={[100, 150, 100, 50]}
                                                        pointerLength={10}
                                                        pointerWidth={10}
                                                        strokeWidth={2}
                                                        fill="red"
                                                        stroke="red"
                                                    />
                                                    : []
                                            }

                                        </Group>
                                        <TransformerComponent
                                            selectedShapeName={this.state.selectedShapeName}
                                        />
                                    </>
                                    : []
                            }
                        </Layer>
                    </Stage>
                </Row>
                <Row className='pt-3'>
                    <Link to={`/camera-shop`} >
                        <Button icon={<FontAwesomeIcon icon={faReply} />}>
                            &nbsp;{('back')}
                        </Button>
                    </Link>
                </Row>
                <Modal title="Xóa Camera" open={this.state.isModalVisible} onOk={this.deleteImgCamera} onCancel={()=> this.setState({isModalVisible: false})}>
                    <p>Bạn có muốn xóa Channel {this.props.channel} không ?</p>
                </Modal>
            </>
        );
    }
}

