import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Modal, Form, Row, Col, Input , Select } from 'antd';
import Dropdown from '~/components/Base/Dropdown';
import axios from 'axios';  
import queryString from 'query-string';
import { showNotify } from '~/services/helper';
const { Option } = Select;

class AddForm extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
        }
    }
    componentDidUpdate(prevState, prevProps) {
        if(this.props.datas != prevProps.datas) {
            this.formRef.current.setFieldsValue(this.props.datas);
        }
    }
    /**
     * render option url
     */
    renderOptionURL = () =>{
        let {datas ,listChannels} = this.props
        let listChannelMiss = []
        if(listChannels){
            for( let i = 1; i < 17; i++ ){
                if(!listChannels.includes(String(i))){
                    listChannelMiss.push(i)
                }
            }
        }
        let dataCamera = datas.CAMERA_URL
        let optionCamera = []
        listChannelMiss.map(e => {
            let values = dataCamera?.replace('channel=2',`channel=${e}`)
            optionCamera[values] = values
        })
        return <Dropdown datas={optionCamera} defaultOption='-- Choose URL --' />
    }
    /**
     * Submit form
     */
    submitForm (){
        let {client_name} = this.props
        let values = this.formRef.current.getFieldsValue()
        // console.log(client_name, values)
        let urlChannel = values.CAMERA_URL
        console.log(urlChannel)
        let params = queryString.parse(urlChannel)
        let channelCamera = params['rtsp://viennh:viennh11@113.161.49.29:554/cam/realmonitor?channel']

        axios({
            method: "post",
            url: "http://171.244.36.99:555/add_remove_camera",
            data: { 
                config: values ,
                client_name : client_name ,
                channel: channelCamera
            }
        })
            .then(function (response) {
                //handle success
                showNotify(('Notification'), ('Đã thêm thành công!'))
                console.log(response);
            })
            .catch(function (response) {
                //handle error
                console.log(response);
            });
        this.props.refreshList();
        this.props.togglePopup();
    }
    render() {
        let {t , visible} = this.props
        
        return (
            <Modal
                title={t('Add camera')}
                open={visible}
                forceRender
                width='60%'
                onCancel={() => this.props.togglePopup()}
                onOk={() => this.submitForm()}
            >
                <Form
                    preserve={false}
                    ref={this.formRef}
                    layout='vertical'
                >
                    <Row gutter={24}>
                        <Col span={24}>
                            <Form.Item label={t('BAD CAMERA')} name='BAD_CAMERA'>
                                <Input disabled />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label={t('CAMERA URL')} name='CAMERA_URL'>
                                    {this.renderOptionURL()}
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label={t('CODEC')} name='CODEC'>
                                <Select defaultValue="Option1">
                                    <Option value="Option1">h264</Option>
                                    <Option value="Option2">h265</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label={t('FPS')} name='FPS'>
                                <Input disabled/>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item label={t('MODE')} name='MODE'>
                                <Input disabled/>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        )
    }
}
const mapStateToProps = (state) => ({
    
})

const mapDispatchToProps = {
    
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(AddForm))
