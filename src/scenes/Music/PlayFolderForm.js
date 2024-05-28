import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Row, Col, Form, Modal } from 'antd';
import { activeFolder } from '~/apis/music/songs';
import Dropdown from '~/components/Base/Dropdown';
import { showNotify } from '~/services/helper';

export class PlayFolderForm extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            data : {},
            isRandom : false ,
        }
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.folder != this.props.folder) {
            if (Object.keys(this.props.folder).length) {
                this.formRef.current.setFieldsValue({active : this.props.folder.active , type : this.props.folder.type});
                this.setState({isRandom : this.props.folder.active == 0  ? true : false})

            } else {
                this.formRef.current.resetFields();
            }
        }
    }
    /**
     * handle submit form
     */
     async submitForm() {
        let values = this.formRef.current.getFieldsValue()
        const { t } = this.props.transLang
        let params = {
            active : values.active ,
            type : values.type,
            _method : 'PUT'
        }
        let response = await activeFolder(this.props.folder.id , params)
        if(response.status){
            this.props.hidePopup();
            this.props.refreshFolder();
            showNotify('Notification', t('hr::update_susscess'))
        }
     }
    render() {
        const { t } = this.props.transLang;
       
        return (
            <Modal
                open={this.props.visiblePlay}
                title={t('hr:active_music_playlist')}
                forceRender
                width='30%'
                onCancel={() => this.props.hidePopup()}
                onOk={this.submitForm.bind(this)}
                afterClose={() => this.formRef.current.resetFields()}
            >
                <Form
                    preserve={false}
                    ref={this.formRef}
                    layout='vertical'
                >
                    <Col span={24}>
                        <Form.Item name='active' label={t('active') + ('/') +t('inactive') + t(' ') + t('playlist') } hasFeedback rules={[{ required: true, message: t('hr:please_select') + t(' ') + t('hr:option') }]}>
                            <Dropdown datas={{ 1: t('active'), 0: t('inactive') }} defaultOption={t('hr:option')} onChange={v => this.setState({isRandom : v == 0 ? true : false})}/>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item name='type' label='Active Random' hasFeedback rules={[{ required: true, message: t('hr:please_select') + t(' ') + t('hr:option') }]}>
                            <Dropdown datas={{ 1:t('random'), 0:t('normal') }} defaultOption={t('hr:option')} />
                        </Form.Item>
                    </Col>
                    
                    
              </Form>
          </Modal>
      )
  }
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(PlayFolderForm)