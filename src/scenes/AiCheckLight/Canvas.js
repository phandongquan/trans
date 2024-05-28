import React, { Component } from "react";
import { render } from "react-dom";
import { Stage, Layer, Group, Text, Rect, Transformer, RegularPolygon, Image, Arrow, Line, Circle } from "react-konva";
import { Row, Form, Input, Button, Col, TimePicker, Modal, Dropdown as DropdownAntd, InputNumber, Image as ImageAnt } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReply, faTrashAlt, faPlusCircle, faMinusCircle, faSave } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { showNotify } from '~/services/helper';
import Dropdown from '~/components/Base/Dropdown';
import { submitCanvas } from '~/apis/aiCheckLight/ai_check_light'
import dayjs from "dayjs";
import { typeCamera } from '~/constants/basic';

const WS_API = 'https://ai.hasaki.vn/control/check_light_is_on/updateTask'

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
        this.stageRef = React.createRef();
        this.state = {
            selectedShapeName: "",
            image: null,
            // isOnConfigWaiting: true,
            // isOnConfigInOut: true,
            isOnRetangle: false,
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
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            isModalVisible: false,
            disabledForm: false,
            timeStartStop: [],
            //polygon
            isPolygon: false,
            pointsPolygon: [],
            curMousePos: [0, 0],
            isMouseOverStartPoint: false,
            isFinished: false,
            groupPoints: [],
            fullDatasLayer: [],
        };
    }
    componentDidMount() {
        //set value form info camera 
        this.setState({
            fullDatasLayer: this.props.fullLayer,
        })
        this.renderDataImageCamera()
    }
    componentDidUpdate(prevProps, prevState) {
        if (this.props.ai_control != prevProps.ai_control || this.props.fullLayer != prevProps.fullLayer || this.props.priority != prevProps.priority) {
            this.setState({
                fullDatasLayer: this.props.fullLayer,
                ai_control: this.props.ai_control,
                priority: this.props.priority,
            })
            this.formRef.current.resetFields();
            this.renderDataImageCamera()
        }
    }
    //value form info camera & img camera
    renderDataImageCamera = async () => {
        let { ai_control, ai_control_status } = this.props
        if (Object.keys(ai_control).length) {
            if (ai_control?.new) {
                this.setState({
                    isOnRetangle: false,
                    isOnArrow: false,
                    // disabledForm: false,
                    isPolygon: false,
                    isFinished: false,
                    positionX1: 0,
                    positionY1: 0,
                    positionX2: 0,
                    positionY2: 0,
                    positionX3: 0,
                    positionY3: 0,
                    positionX4: 0,
                    positionY4: 0,
                    scaleX: 1,
                    scaleY: 1,
                    rotation: 0,
                    pointsPolygon: [],
                    timeStartStop: [],

                })
            }
            if (ai_control?.TYPE == 'LINE') {
                this.setState({
                    isOnArrow: true, isPolygon: false, isOnRetangle: true,
                    positionX1: ai_control.PARAMS?.points[0][0],
                    positionY1: ai_control.PARAMS?.points[0][1],
                    positionX2: ai_control.PARAMS?.points[1][0],
                    positionY2: ai_control.PARAMS?.points[1][1],
                    positionX3: ai_control.PARAMS?.points[2][0],
                    positionY3: ai_control.PARAMS?.points[2][1],
                    positionX4: ai_control.PARAMS?.points[3][0],
                    positionY4: ai_control.PARAMS?.points[3][1],
                    rotation: ai_control.PARAMS?.rotation,
                    scaleX: ai_control.PARAMS?.scaleX,
                    scaleY: ai_control.PARAMS?.scaleY,
                    timeStartStop: ai_control.OPERATING_TIME_LIST
                })
            }
            if (ai_control?.TYPE == 'POLYGON') {
                if (ai_control.PARAMS.type == 'polygon') {
                    this.setState({
                        isOnArrow: false, isPolygon: true, isFinished: true,
                        pointsPolygon: ai_control.PARAMS.points, timeStartStop: ai_control.OPERATING_TIME_LIST
                    })
                    // this.setState({
                    //     isOnArrow: false, isPolygon: true, isFinished: true,
                    //     groupPoints: ai_control.PARAMS.points, timeStartStop: ai_control.OPERATING_TIME_LIST
                    // })
                }
                if (ai_control.PARAMS.type == 'retangle') {
                    this.setState({
                        isOnArrow: false, isPolygon: false, isOnRetangle: true,
                        positionX1: ai_control.PARAMS?.points[0][0],
                        positionY1: ai_control.PARAMS?.points[0][1],
                        positionX2: ai_control.PARAMS?.points[1][0],
                        positionY2: ai_control.PARAMS?.points[1][1],
                        positionX3: ai_control.PARAMS?.points[2][0],
                        positionY3: ai_control.PARAMS?.points[2][1],
                        positionX4: ai_control.PARAMS?.points[3][0],
                        positionY4: ai_control.PARAMS?.points[3][1],
                        rotation: ai_control.PARAMS?.rotation,
                        scaleX: ai_control.PARAMS?.scaleX,
                        scaleY: ai_control.PARAMS?.scaleY,
                        timeStartStop: ai_control.OPERATING_TIME_LIST
                    })
                }
            }
        }
        if (ai_control_status == 0) {
            this.setState({ disabledForm: true })
        }


        this.formRef.current.setFieldsValue(ai_control)

        const image = new window.Image();
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
            },
                () => this.checkChangeForm()
            )
        }
    }
    async submitForm() {
        // console.log(this.props.fullLayer , this.props.indexLayer)
        let { isPolygon, isOnArrow, positionX1, positionY1, positionX2, positionY2,
            positionX3, positionY3, positionX4, positionY4, scaleX, scaleY, rotation, pointsPolygon, timeStartStop, isOnRetangle, groupPoints, fullDatasLayer } = this.state

        let checkNotSave = []
        fullDatasLayer.map(d => {
            if (d.new) {
                checkNotSave.push(d)
            }
        })

        if (checkNotSave.length) {
            showNotify('Notification', 'Bạn có layer mới chưa chỉnh sửa !', 'error');
            return;
        } else {
            const formData = new FormData();
            const formDataStatus = new FormData();
            formData.append('IP', this.props.IP);
            formData.append('port', this.props.port);
            formData.append('C', this.props.channel);
            formData.append('json_list', JSON.stringify(fullDatasLayer));
            formData.append('priority', JSON.stringify(this.props.priority));
            formData.append('store_id', this.props.store_id
            );
            formDataStatus.append('IP', this.props.IP);
            formDataStatus.append('port', this.props.port);
            formDataStatus.append('C', this.props.channel);
            formDataStatus.append('value', 1);

            axios({
                method: 'POST',
                url: WS_API,
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                data: formData
            })
                .then(response =>  showNotify('Notification', 'Updated thành công'))
                .catch(error =>  showNotify('Notification', error , 'error'))
        }
    }

    async submitTurnOffOn(values = 0) {
        this.setState({ disabledForm: !this.state.disabledForm, isOnRetangle: !this.state.isOnRetangle })
            const formData = new FormData();
            formData.append('key', 'ai_control_status');
            formData.append('IP', this.props.IP);
            formData.append('port', this.props.port);
            formData.append('C', this.props.channel);
            formData.append('value', values);

            axios({
                method: 'POST',
                url: 'https://ai.hasaki.vn/control/check_light_is_on/config',
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                data: formData
            })
                .then(response => {
                    console.log({ response })
                    showNotify('Notification', values ? 'Turn on thành công !' : 'Turn off thành công !')
                })
                .catch(error => console.log(error))

            
    }
    checkChangeForm() {
        let { isPolygon, isOnArrow, positionX1, positionY1, positionX2, positionY2,
            positionX3, positionY3, positionX4, positionY4, scaleX, scaleY, rotation, pointsPolygon, timeStartStop, isOnRetangle, groupPoints } = this.state
        let values = this.formRef.current.getFieldsValue()

        let selfThis = this;
        if (isPolygon) {
            values = {
                ...values,
                TYPE: 'POLYGON',
                PARAMS: {
                    points: pointsPolygon,
                    type: 'polygon'
                },
                OPERATING_TIME_LIST: timeStartStop

            }
        }
        if (isOnRetangle) {
            let points = [[positionX1, positionY1], [positionX2, positionY2], [positionX3, positionY3], [positionX4, positionY4]]
            if (isOnArrow) {
                values = {
                    ...values,
                    TYPE: 'LINE',
                    PARAMS: {
                        points: points,
                        rotation: rotation,
                        scaleX: scaleX,
                        scaleY: scaleY,
                    },
                    OPERATING_TIME_LIST: timeStartStop
                }
            } else {
                values = {
                    ...values,
                    TYPE: 'POLYGON',
                    PARAMS: {
                        points: points,
                        rotation: rotation,
                        scaleX: scaleX,
                        scaleY: scaleY,
                        type: 'retangle'
                    },
                    OPERATING_TIME_LIST: timeStartStop
                }
            }
        }
        delete values.time
        Object.keys(values).map((k) => {
            if (values[k] == undefined) {
                values[k] = null
            }
        })
        let indexLayer = this.props.indexLayer
        selfThis.props.changeDatas(values, indexLayer - 1)
    }

    addTimeStartStop() {
        let { timeStartStop } = this.state
        let values = this.formRef.current.getFieldsValue()
        if (values?.time[0] && values?.time[1]) {
            let resultTime = dayjs(values?.time[0]).format('HH:mm') + '-' + dayjs(values?.time[1]).format('HH:mm')
            this.setState({
                timeStartStop: [...timeStartStop, resultTime]
            })
        }
    }
    removeListTime(index) {
        let { timeStartStop } = this.state
        let new_timeStartStop = timeStartStop.slice()
        new_timeStartStop.splice(index, 1)

        this.setState({ timeStartStop: new_timeStartStop })
    }
    formCountGuest() {
        let { timeStartStop } = this.state
        return (
            <>

                <Form ref={this.formRef} className={`card pl-3 pb-3 mt-1 mb-3 `}
                    onFinish={() => this.submitForm()}
                >
                    {
                        this.props.fullLayer.length ?
                            <>
                                <PageHeader title={`AI CONTROL ${this.props.indexLayer ? 'Layer ' + this.props.indexLayer : ''} - ${this.props.locaName}`}
                                />
                                <Row>
                                    <Col span={12}>
                                        <Form.Item name='IGNORE_TIME' label='Ignore time (seconds)'>
                                            <InputNumber disabled={this.state.disabledForm == true ? true : false} controls={false} style={{ width: '40%' }}
                                                onChange={() => this.checkChangeForm()} />
                                        </Form.Item>
                                        <Form.Item name='MAX_PERSON' label='Max person'>
                                            <InputNumber disabled={this.state.disabledForm == true ? true : false} controls={false} style={{ width: '40%' }}
                                                onChange={() => this.checkChangeForm()} />
                                        </Form.Item>
                                        <Form.Item name='MIN_PERSON' label='Min person'>
                                            <InputNumber disabled={this.state.disabledForm == true ? true : false} controls={false} style={{ width: '40%' }}
                                                onChange={() => this.checkChangeForm()} />
                                        </Form.Item>
                                        <Form.Item name='WAITING_TIME' label='Waiting time (minutes)'>
                                            <InputNumber disabled={this.state.disabledForm == true ? true : false} controls={false} style={{ width: '40%' }}
                                                onChange={() => this.checkChangeForm()} />
                                        </Form.Item>
                                        <Form.Item name='TASK_TYPE' label='Task type' rules={[{ required: true, message: 'Please input type task' }]}>
                                            <Dropdown datas={typeCamera} defaultOption="-- All type --"
                                                disabled={this.state.disabledForm == true ? true : false} style={{ width: '70%' }} onChange={() => this.checkChangeForm()}
                                            // mode='multiple'
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        {
                                            timeStartStop?.length > 0 ?
                                                <div>
                                                    <h6>List time start stop :</h6>
                                                    <div className="mt-2">
                                                        {
                                                            timeStartStop.map((t, index) => {
                                                                return (
                                                                    <div className="d-flex" key={index}>
                                                                        <div className="card p-1 mt-1" style={{ width: '30%', textAlign: 'center' }}>
                                                                            {t}
                                                                        </div>
                                                                        {
                                                                            this.state.disabledForm == false ?
                                                                                <Button className="ml-1 mt-1" icon={<FontAwesomeIcon icon={faMinusCircle} />}
                                                                                    onClick={async () => {
                                                                                        await this.removeListTime(index)
                                                                                        await this.checkChangeForm()
                                                                                    }}>
                                                                                </Button>
                                                                                : []
                                                                        }

                                                                    </div>
                                                                )
                                                            })
                                                        }

                                                    </div>
                                                </div>
                                                : []
                                        }
                                        <div className="d-flex mt-2">
                                            <Form.Item name='time'>
                                                <TimePicker.RangePicker disabled={this.state.disabledForm == true ? true : false} />
                                            </Form.Item>
                                            <Button className="ml-1" icon={<FontAwesomeIcon icon={faPlusCircle} />}
                                                onClick={async () => {
                                                    await this.addTimeStartStop()
                                                    await this.checkChangeForm()
                                                }}>
                                            </Button>
                                        </div>
                                    </Col>
                                </Row>

                                <div className="d-flex">
                                    <Button type="primary" htmlType='submit' className={this.state.disabledForm == true ? 'd-none' : ''} style={{ width: '15%' }}>Submit</Button>
                                    {

                                        this.state.disabledForm == false ?
                                            <Button className="ml-auto mr-3" type='primary' danger
                                                onClick={() => {
                                                    this.submitTurnOffOn(0)
                                                    this.setState({ isOnRetangle: false, isPolygon: false, disabledForm: true })
                                                }}>
                                                Turn Off
                                            </Button>
                                            : <Button className="ml-auto mr-3" type='primary'
                                                onClick={() => {
                                                    this.submitTurnOffOn(1)
                                                    this.setState({ disabledForm: false })
                                                }
                                                }>
                                                Turn On
                                            </Button>
                                    }

                                </div>
                            </>
                            : 
                            <div style={{height: 100}}></div>
                    }
                </Form>
            </>
        )
    }
    // /**
    //  * 
    //  * limit move retangle
    //  * 
    //  */
    // limitMoved = e => {
    //     const stage = e.target.getStage();
    //     e.target.x(
    //         Math.max(
    //             0,
    //             Math.min(e.target.x(), stage.width() - (e.target.width() - 200)))
    //     );
    //     e.target.y(
    //         Math.max(
    //             0,
    //             Math.min(e.target.y(), stage.height() - e.target.height())
    //         )
    //     );
    // }



    // POLYGON 

    getMousePos = stage => {
        return [stage.getPointerPosition().x, stage.getPointerPosition().y];
    };
    handleClick = event => {
        const {
            state: { pointsPolygon, isMouseOverStartPoint, isFinished, groupPoints },
            getMousePos
        } = this;
        const stage = event.target.getStage();
        const mousePos = getMousePos(stage);

        if (isFinished) {
            return;
        }
        if (isMouseOverStartPoint && pointsPolygon.length >= 3) {
            this.setState({
                isFinished: true
            }, () => this.checkChangeForm());
            // this.setState({
            //     pointsPolygon: [],
            //     groupPoints: [...groupPoints, pointsPolygon]
            // })
        } else {
            this.setState({
                pointsPolygon: [...pointsPolygon, mousePos]
            });
        }
    };
    handleMouseMove = event => {
        const { getMousePos } = this;
        const stage = event.target.getStage();
        const mousePos = getMousePos(stage);
        this.setState({
            curMousePos: mousePos
        });
    };
    handleMouseOverStartPoint = event => {
        if (this.state.isFinished || this.state.pointsPolygon.length < 3) return;
        event.target.scale({ x: 2, y: 2 });
        this.setState({
            isMouseOverStartPoint: true
        });
    };
    handleMouseOutStartPoint = event => {
        event.target.scale({ x: 1, y: 1 });
        this.setState({
            isMouseOverStartPoint: false
        });
    };
    handleDragStartPoint = event => {
        // console.log("start", event);
    };
    handleDragMovePoint = event => {
        const pointsPolygon = this.state.pointsPolygon;
        const index = (event.target.index - 2);
        const pos = [event.target.attrs.x, event.target.attrs.y];
        const new_pointsPolygon = [...pointsPolygon]
        new_pointsPolygon[index] = pos
        this.setState({
            pointsPolygon: new_pointsPolygon
        });
    };
    handleDragEndPoint = event => {
        // console.log("end", this.state.pointsPolygon);
    };

    handleKeyPress = (e) => {
        if (e.key === 'Delete' && this.state.selectedShapeName) {
            if(this.state.isOnRetangle){
                this.setState({ isOnRetangle: false, positionX1: 0, positionY1: 0, positionX2: 0, positionY2: 0,
                    positionX3: 0, positionY3: 0, positionX4: 0, positionY4: 0 
                },() => this.checkChangeForm())
            }
        }
        if(e.key === 'Delete' && this.state.isPolygon ){
            this.setState({ pointsPolygon: [], isFinished: false } , () => this.checkChangeForm())
        }
    }
    render() {
        let { imgHeight, imgWidth, rotation, positionX1, positionY1, scaleX, scaleY, isPolygon, isFinished, pointsPolygon, curMousePos, timeStartStop } = this.state
        let { handleClick,
            handleMouseMove,
            handleMouseOverStartPoint,
            handleMouseOutStartPoint,
            handleDragStartPoint,
            handleDragMovePoint,
            handleDragEndPoint } = this
        // [ [a, b], [c, d], ... ] to [ a, b, c, d, ...]
        const flattenedPoints = this.state.pointsPolygon
            .concat(isFinished ? [] : curMousePos)
            .reduce((a, b) => a.concat(b), []);
        return (
            <div style={{ position: 'absolute', zIndex: 1 }}>
                <Row style={{ marginLeft: 400 }}>
                    <Col span={16}>
                        {
                            this.formCountGuest()

                        }
                    </Col>
                </Row>

                <Row>
                    <div tabIndex={1} onKeyDown={this.handleKeyPress}>
                        <Stage
                            width={imgWidth}
                            height={imgHeight}
                            onMouseDown={isPolygon == false ? this.handleStageMouseDown : handleClick}
                            onMouseMove={(e) => this.handleMouseMove(e)}
                        >
                            <Layer ref={this.layerRef} >
                                <Image image={this.state.image} />
                                {
                                    isPolygon == false && this.state.isOnRetangle == true ?
                                        <>
                                            <Group
                                                ref={this.groupRef}
                                                name="group-retangle"
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
                                                // onDragMove={this.limitMoved}
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
                                            >
                                            </TransformerComponent>
                                        </>
                                        :
                                        <>
                                            <Line
                                                points={flattenedPoints}
                                                stroke="red"
                                                strokeWidth={5}
                                                closed={isFinished}
                                            />
                                            {pointsPolygon.map((point, index) => {
                                                const width = 6;
                                                const x = point[0] - width / 2;
                                                const y = point[1] - width / 2;
                                                const startPointAttr =
                                                    index === 0
                                                        ? {
                                                            hitStrokeWidth: 12,
                                                            onMouseOver: handleMouseOverStartPoint,
                                                            onMouseOut: handleMouseOutStartPoint
                                                        }
                                                        : null;
                                                return (
                                                    <Rect
                                                        name="polygon"
                                                        key={index}
                                                        x={x}
                                                        y={y}
                                                        width={width}
                                                        height={width}
                                                        fill="transparent"
                                                        stroke="blue"
                                                        strokeWidth={3}
                                                        // onDragStart={handleDragStartPoint}
                                                        // onDragMove={handleDragMovePoint}
                                                        // onDragEnd={handleDragEndPoint}
                                                        // draggable
                                                        {...startPointAttr}
                                                    />
                                                );
                                            })}
                                            {/* {this.state.groupPoints.map((item, i) => {
                                            const width = 6;
                                            const flattenedPoints_item = item
                                                .reduce((a, b) => a.concat(b), []);
                                            return (
                                                <>
                                                    <Text
                                                        text={i + 1}
                                                        fill={"red"}
                                                        x={item[0][0] - width*3}
                                                        y={item[0][1] - width*3}
                                                        fontSize={32}
                                                        fontFamily={"Arial"}
                                                        align="right"
                                                        shadowColor={"red"}
                                                    />
                                                    <Line
                                                        points={flattenedPoints_item}
                                                        stroke="red"
                                                        strokeWidth={5}
                                                        closed={true}
                                                        onClick={() => alert()}
                                                    />
                                                    {item.map((point, index) => {
                                                        const x = point[0] - width / 2;
                                                        const y = point[1] - width / 2;
                                                        const startPointAttr =
                                                            index === 0
                                                                ? {
                                                                    hitStrokeWidth: 12,
                                                                    onMouseOver: handleMouseOverStartPoint,
                                                                    onMouseOut: handleMouseOutStartPoint
                                                                }
                                                                : null;
                                                        return (
                                                            <Rect
                                                                name="polygon"
                                                                key={index}
                                                                x={x}
                                                                y={y}
                                                                width={width}
                                                                height={width}
                                                                fill="transparent"
                                                                stroke="blue"
                                                                strokeWidth={3}
                                                                {...startPointAttr}
                                                            />
                                                        );
                                                    })}
                                                </>
                                            )
                                        })}
                                        <Line
                                            points={flattenedPoints}
                                            stroke="blue"
                                            strokeWidth={5}
                                            closed={isFinished}
                                        />
                                        {pointsPolygon.map((point, index) => {
                                            const width = 6;
                                            const x = point[0] - width / 2;
                                            const y = point[1] - width / 2;
                                            const startPointAttr =
                                                index === 0
                                                    ? {
                                                        hitStrokeWidth: 12,
                                                        onMouseOver: handleMouseOverStartPoint,
                                                        onMouseOut: handleMouseOutStartPoint
                                                    }
                                                    : null;
                                            return (
                                                <Rect
                                                    name="polygon"
                                                    key={index}
                                                    x={x}
                                                    y={y}
                                                    width={width}
                                                    height={width}
                                                    fill="transparent"
                                                    stroke="red"
                                                    strokeWidth={3}
                                                    {...startPointAttr}
                                                />
                                            );
                                        })} */}
                                        </>

                                }
                            </Layer>

                        </Stage>
                    </div>

                    <div>
                        <div>
                            {
                                this.state.isOnRetangle == false ?
                                    <Button
                                        className='ml-2 mt-2'
                                        type='primary'
                                        onClick={() => this.setState({ isOnRetangle: true, isPolygon: false, disabledForm: false }, () => this.checkChangeForm())}

                                    >show retangle</Button>
                                    :
                                    <Button className='ml-2' type='primary'
                                        onClick={() => this.setState({
                                            isOnRetangle: false, positionX1: 0, positionY1: 0, positionX2: 0, positionY2: 0,
                                            positionX3: 0, positionY3: 0, positionX4: 0, positionY4: 0
                                        }, () => this.checkChangeForm())}
                                    >
                                        Off retangle
                                    </Button>


                            }
                        </div>
                        <div className="mt-2">
                            {
                                this.state.isOnRetangle == true ?
                                    this.state.isOnArrow == false ?
                                        <Button
                                            className='ml-2'
                                            type='primary'
                                            onClick={() => this.setState({ isOnArrow: true, isPolygon: false })}

                                        >show arrow</Button>
                                        :
                                        <Button className='ml-2' type='primary' onClick={() => this.setState({ isOnArrow: false })} >
                                            Off arrow
                                        </Button>
                                    :
                                    []
                            }
                        </div>
                        <div className="mt-2">
                            {
                                this.state.isPolygon == false ?
                                    <Button className='ml-2' type='primary' onClick={() => this.setState({ isPolygon: true, isOnRetangle: false, disabledForm: false, isFinished: false })} >
                                        Draw Polygon
                                    </Button>
                                    :
                                    <>
                                        <Button className='ml-2' type='primary' onClick={() => this.setState({ isPolygon: false, modeType: '' }, () => this.checkChangeForm())} >
                                            Off Polygon
                                        </Button>
                                        {/* <Button className='ml-2' type='primary' onClick={() => this.setState({ groupPoints: [], pointsPolygon: [], isFinished: false })}>delete</Button> */}
                                        <Button className='ml-2' type='primary'
                                            onClick={() => this.setState({ pointsPolygon: [], isFinished: false }, () => this.checkChangeForm())}>delete</Button>
                                        {/* <Button className='ml-2' type='primary' onClick={() => this.setState({isFinished: true})}>DONE</Button> */}
                                    </>
                            }
                        </div>
                    </div>
                </Row>
                <Row className='pt-3'>
                    <Link to={`/camera-shop`} >
                        <Button icon={<FontAwesomeIcon icon={faReply} />}>
                            &nbsp;{('Back')}
                        </Button>
                    </Link>
                </Row>
            </div>
        );
    }
}

