import React, { Component } from 'react';
import { Modal, Form, Row, Col, Input } from 'antd';
import { withTranslation } from 'react-i18next';
import { create as apiCreate, update as apiUpdate, detail as apiDetail } from '~/apis/company/communication/category';
import { showNotify } from '~/services/helper';
import {screenResponsive} from '~/constants/basic';

const FormItem = Form.Item;
class CategoryForm extends Component{
    constructor(props){
        super(props)
        this.modalForm = React.createRef();
    }

    componentDidMount(){
        this.getDetailCategory();
    }

    /**
     * Get detail category
     */
    getDetailCategory = () => {
        let { id } = this.props;
        if(id){
            let xhr = apiDetail(id);
            xhr.then((response) => {
                let { data } = response;
                this.modalForm.current.setFieldsValue(data);
            })
        }
    }

    /**
     * Event submit form 
     */
    submitForm = () => {
        let data = this.modalForm.current.getFieldsValue();
        let { t, id } = this.props;

        let xhr;
        let message = '';
        if (id) {
            xhr = apiUpdate(id, data);
            message = t('Category updated!');
        } else {
            xhr = apiCreate(data);
            message = t('Category created!');
        }
        xhr.then((response) => {
            if (response.status != 0) {
                showNotify(t('Notification'), message);
                this.props.hidePopup();
                this.props.resetTable();
            } else {
                showNotify(t('Notification'), response.message, 'error');
            }
        });
    }
    
    render() {
        let { t } = this.props
        return (
            <Modal
                title="Category"
                open={this.props.visible}
                onCancel={this.props.hidePopup}
                onOk={this.submitForm}
                width={window.innerWidth < screenResponsive  ? '100%' : '35%'}
            >
                <Form
                    preserve={false} 
                    ref={this.modalForm}
                    layout="vertical">
                    <Row gutter={24}>
                        <Col xs={24} sm={24} md={24} lg={18} xl={18}>
                            <FormItem name='name' label={t('Name')} > 
                                <Input placeholder={t('Name')} />
                            </FormItem>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                            <FormItem name='piority' label={t('Priority')}> 
                                <Input type='number' min={0}/>
                            </FormItem>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        )
    }
} 

export default (withTranslation()(CategoryForm))
