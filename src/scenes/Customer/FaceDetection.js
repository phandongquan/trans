import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Camera } from '@mediapipe/camera_utils';
import drawingUtils from '@mediapipe/drawing_utils';
import controlUltis from '@mediapipe/control_utils';
import { FaceDetection } from '@mediapipe/face_detection';
import { uniqueId } from 'lodash';

import { withTranslation } from 'react-i18next';
import { Button, Table, Row, Col, Form, Input, Image } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { detectCustomer } from '~/apis/ai/face_detect';
import Tab from '~/components/Base/Tab';
import tabListFaceRegconite from '../Company/config/tabListFaceRegconite';

import './FaceDetect.css';

class CustomerFaceDetection extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            customerInfos: []
        };

        this.initialFaceDetect = this.initialFaceDetect.bind(this);
    }

    /**
     * @lifecycle 
     */
    componentDidMount() {
        this.initialFaceDetect();
    }

    initialFaceDetect = () => {
        const videoElement = document.getElementsByClassName('input_video')[0];
        const canvasElement = document.getElementsByClassName('output_canvas')[0];
        const canvasCtx = canvasElement.getContext('2d');

        const faceDetection = new FaceDetection({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.3/${file}` });
        faceDetection.setOptions({ minDetectionConfidence: 0.7 });
        let count = 0;
        faceDetection.onResults((results) => {
            // Draw the menus.
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
            canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
            if (results.detections.length > 0) {
                if (count == 0) {
                    let base64Img = results.image.toDataURL().split(',')[1];
                    detectCustomer({ image: base64Img })
                        .then(res => {
                            if (!res.faces.length) return;
                            const seen = new Set();

                            let customerInfos = [
                                ...this.state.customerInfos.slice().filter(c => c.customer_id != 0),
                                ...res.faces
                            ]
                                // Filter dupplicate customer in [combine with old result]
                                .filter(c => {
                                    const duplicate = seen.has(c.customer_id);
                                    seen.add(c.customer_id);
                                    return !duplicate;
                                })
                                // Filter in result
                                .filter(c => {
                                    let flag = false;
                                    for (let i = 0; i < res.faces.length; i++) {
                                        if (res.faces[i].cus_id === c.cus_id) {
                                            flag = true;
                                            break;
                                        }
                                    }
                                    return flag;
                                });
                            this.setState({ customerInfos });
                        })
                        .catch(err => console.log(err));
                }
                count++;
                drawingUtils.drawRectangle(canvasCtx, results.detections[0].boundingBox, { color: 'blue', lineWidth: 0.2, fillColor: '#00000000' });
                if (count == 80) {
                    count = 0;
                }
            }
            canvasCtx.restore();
        });
        const camera = new Camera(videoElement, {
            onFrame: async () => {
                await faceDetection.send({ image: videoElement });
            },
            width: 720,
            height: 576
        });
        camera.start();
    }

    renderImages() {
        let { customerInfos } = this.state;
        if (!customerInfos.length) {
            return;
        }
        let returnImages = [];
        customerInfos.map(customerInfo => {
            returnImages.push(
                <Row key={'customer_face_' + customerInfo.id} style={{ paddingTop: 5 }}>
                    <Col span={4}>
                        <Image src={`data:image/jpeg;base64,${customerInfo.face}`} style={{ width: 80, height: 80 }} />
                    </Col>
                    {customerInfo.customer_id > 0 ? (
                        <Col span={20} style={{}}>
                            <Row >
                                <Col span={16}>
                                    <p><b>{customerInfo.name}</b></p>
                                    <p>{customerInfo.phone}</p>
                                </Col>
                                < Col span={8} style={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <Button type={'primary'} onClick={() => null}>Tạo phiếu tư vấn</Button>
                                </Col>
                            </Row>
                        </Col>
                    ) : (
                        <Col span={20} style={{ paddingTop: 5, paddingLeft: 5 }}>
                            <Row>
                                <Col span={16}>
                                    <p>Không tồn tại thông tin khách hàng trong hệ thống!</p>
                                </Col>
                                {/* < Col span={8} style={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <Button onClick={() => null}>Thêm thông tin khách hàng</Button>
                                </Col> */}
                            </Row>
                        </Col>)}
                </Row >
            )
        });
        return returnImages;
    }
    /**
     * @render
     */
    render() {
        return (
            <div>
                {/* <PageHeader title={t('Customer Face Detection')} /> */}
                <Row gutter={[16, 24]} className="card mt-3 pl-3 pr-3 mb-3">
                    <Tab tabs={tabListFaceRegconite(this.props)} />
                    <Col span={13}>
                        <video className="input_video" ></video>
                        <canvas className="output_canvas"></canvas>
                    </Col>
                    <Col span={11}>
                        {this.renderImages()}
                        {/* <Button key="create-skill" type="primary" icon={<FontAwesomeIcon icon={faCamera} />}>
                            &nbsp;{t('Take Picture')}
                        </Button> */}
                    </Col>
                </Row>
            </div>
        );
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(CustomerFaceDetection));
