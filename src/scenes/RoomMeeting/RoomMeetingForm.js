import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next';
import { Row, Col, Form, Input, Modal ,Button} from 'antd';
import {create, update} from '~/apis/roomMeeting/index'
import Dropdown from '~/components/Base/Dropdown';
import { showNotify } from '~/services/helper';

class RoomMeetingForm extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.room.id != this.props.room.id) {
            if (Object.keys(this.props.room).length) {
                this.formRef.current.setFieldsValue(this.props.room);
            } else {
                this.formRef.current.resetFields();
            }
        }
    }
    async SubmitForm() {
        const { t, room } = this.props;
        let xhr;
        let message = '';
        let values = this.formRef.current.getFieldsValue()
        let params = {}
        if (room.id) {
            let formData = new FormData()
            formData.append('name', values.name)
            formData.append('_method', 'put')
            formData.append('location_id', values.location_id)
            let response = await update(room.id , formData)
            if(response.status){
                showNotify('Notification', t('hr:update_susscess'))
                this.props.hidePopup()
                this.props.refreshTable()
            }
        }else {
            params = {
                name : values.name,
                location_id : values.location_id
            }
            let response = await create(params)
            if(response.status){
                showNotify('Notification', t('hr:added_success'))
                this.props.hidePopup()
                this.props.refreshTable()
            }
        }
    }
  render() {
    const { t , room , baseData: { locations } } = this.props;
    let title = room.id ? (t('update') + (' ') + t('room_meeting')) : (t('add_new') + (' ') + t('room_meeting'))
    return (
        <Modal
            open={this.props.visible}
            title={title}
            forceRender
            width='40%'
            onCancel={() => this.props.hidePopup()}
            afterClose={() => this.formRef.current.resetFields()}
            // onOk={this.SubmitForm.bind(this)}
            footer= {false}
        >
            <Form
                preserve={false}
                ref={this.formRef}
                layout='vertical'
                onFinish={() => this.SubmitForm()}
            >
                <Row gutter={24}>
                    <Col span={24}>
                        <Form.Item label={t('name')} name='name' hasFeedback rules={[{ required: true, message: t('hr:input_name') }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item name="location_id" hasFeedback rules={[{ required: true, message: t('hr:choose_location') }]}>
                            <Dropdown datas={locations} defaultOption={t('hr:all_location')} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row className='d-flex flex-row-reverse'>
                    <Button type="primary" htmlType="submit">
                       {t('submit')}
                    </Button>
                </Row>
            </Form>
        </Modal>
    )
  }
}

const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    };
}
const mapDispatchToProps = {
    
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(RoomMeetingForm))
