import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Row, Button, Form, Col, Input, Divider } from 'antd'
import { PageHeader } from '@ant-design/pro-layout';
import { detail } from '~/apis/assetDevice/group'
// import { save, detail as apiDetailCriterion } from '~/apis/assetDevice/criterions'
import { showNotify, cleanObject, convertToFormData } from '~/services/helper'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faSave, faBackspace } from '@fortawesome/free-solid-svg-icons'
import UploadMultiple from '~/components/Base/UploadMultiple'
import { typeFileImagePng, typeFileImageJpg, typeFileImageJpeg } from '~/constants/basic';
import { Link } from 'react-router-dom'

export class TypeForm extends Component {

    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            type: null,
            criterion: null
        }
        this.formRef = React.createRef();
        this.uploadRef = null;
    }

    componentDidMount() {
        const { type_id, id } = this.props.match.params
        this.getTypeDetail(type_id)
        this.getCriterionDetail(id)
    }

    /**
     * Get type detail
     * @param {*} id 
     * @returns 
     */
     getTypeDetail = id => {
        if(!id) return;
        let xhr = detail(id)
        xhr.then(res => {
            if(res.status) {
                this.setState({ type: res.data })
            } else {
                showNotify('Notify', res.message, 'error')
            }
        })
    }

    /**
     * Get citerion detail
     * @param {*} id 
     */
    getCriterionDetail = id => {
        if(!id) return;
        // let xhr = apiDetailCriterion(id)
        // xhr.then(res => {
        //     if(res.status) {
        //         this.setState({ criterion: res.data })
        //     } else {
        //         showNotify('Notify', res.message, 'error')
        //     }
        // })
    }

    submitForm = values => {
        const { type_id, id } = this.props.match.params

        values.type_id = type_id;
        values = cleanObject(values);
        let formData = convertToFormData(values);

        let dataUpload = this.uploadRef.getValues();
        if(dataUpload.fileList && Array.isArray(dataUpload.fileList)) {
            dataUpload.fileList.map(f => formData.append('images[]', f))
        }
        if(dataUpload.removeFileList && Array.isArray(dataUpload.removeFileList)) {
            dataUpload.removeFileList.map(f => formData.append('remove_images[]', f))
        }

        // let xhr = save(id || 0, formData);
        // xhr.then(res => {
        //     if(res.status) {
        //         this.props.history.push('/asset-device/type');
        //     } else {
        //         showNotify('Notify', res.message, 'error')
        //     }
        // })
    }

    render() {
        const { type } = this.state;
        if(!type) return '';
        return (
            <>
                <PageHeader title={type.name}
                    tags={[
                        <Button type="primary" key='create-criterion' icon={<FontAwesomeIcon icon={faPlus} />}
                            onClick={() => this.setState({ visible: true })}
                        >
                            &nbsp; Add new
                        </Button>
                    ]}
                />

                <Row className='card p-3'>
                    <Form
                        ref={this.formRef}
                        layout='vertical'
                        onFinish={this.submitForm.bind(this)}
                    >
                        <Row gutter={12}>
                            <Col span={24}>
                                <Form.Item name='name' label='Name'>
                                    <Input placeholder='Name' />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name='note' label='Note'>
                                    <Input.TextArea rows={4} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label='Images'>
                                    <UploadMultiple 
                                        type={[typeFileImageJpg, typeFileImagePng, typeFileImageJpeg]}
                                        size={30} 
                                        onRef={ref => { this.uploadRef = ref }} />
                                </Form.Item>
                            </Col>
                            <Divider className='m-0 mb-2' />
                            <Col span={24}>
                                <Link to={`/asset-device/type`} className='mr-2'>
                                    <Button type="default" icon={<FontAwesomeIcon icon={faBackspace} />}> 
                                        &nbsp;Back 
                                    </Button>
                                </Link>
                                <Button type="primary"
                                    icon={<FontAwesomeIcon icon={faSave} />}
                                    htmlType="submit"
                                    loading={this.state.loading}
                                >
                                    &nbsp; Save
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Row>
            </>
        )
    }
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(TypeForm)