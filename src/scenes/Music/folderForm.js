import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Row, Col, Form, Input, Modal } from 'antd';
import { createFolder, updateFolder } from '~/apis/music/songs';
import Dropdown from '~/components/Base/Dropdown';
import { showMessage, showNotify } from '~/services/helper';
export class folderForm extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            data : {}
        }
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.folder.id != this.props.folder.id) {
            if (Object.keys(this.props.folder).length) {
                this.formRef.current.setFieldsValue(this.props.folder);
            } else {
                this.formRef.current.resetFields();
            }
        }
    }
    handleFormSubmit() {
        // let values = this.formRef.current.getFieldsValue()
        // delete(values.category_id)
        this.formRef.current.validateFields()
             .then((values) => {
                         this.submitForm(values);
             })
             .catch((info) => {
                 console.log('Validate Failed:', info);
             });
    }
    /**
     * handle submit form
     */
     async submitForm(params = {}) {
        const { t, folder } = this.props;
        let response 
        if(folder.id){
            params ={
                ...params,
                _method: 'PUT'
            }
            response = await updateFolder(folder.id , params)
            if(response.status){
                this.props.hidePopup();
                this.props.refreshFolder();
                showNotify('Notification', t('hr:update_susscess'))
            }else{
                showNotify('Notification',response.message,'error')
            }
        }else{
            response = await createFolder(params)
            if(response.status){
                this.props.hidePopup();
                this.props.refreshFolder();
                showNotify('Notification', t('hr:create_susscess'))
            }else{
                showNotify('Notification',response.message,'error')
            }
        }
     }
    render() {
        const { t } = this.props.transLang;
        let title = this.props.folder.id ? t('hr:update_folder') : t('hr:addnew_folder')
        return (
            <Modal
                open={this.props.visibleFolder}
                title={title}
                forceRender
                width='30%'
                onCancel={() => this.props.hidePopup()}
                onOk={this.handleFormSubmit.bind(this)}
                afterClose={() => this.formRef.current.resetFields()}
            >
                <Form
                    preserve={false}
                    ref={this.formRef}
                    layout='vertical'
                >
                <Row gutter={24}>
                    <Col span={24}>
                        <Form.Item label={t('name')} name='name' hasFeedback rules={[{ required: true, message: t('hr:input_name_folder') }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label={t('category')} name='category_id' hasFeedback rules={[{ required: true, message:  t('hr:please_select') + t(' ') + t('hr:category')}]}>
                            <Dropdown datas = {{ 1: t('shop'), 2: t('hr:clinic') }} defaultOption={t('category')}/>
                        </Form.Item>
                    </Col>
                </Row>
              </Form>
          </Modal>
      )
  }
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(folderForm)