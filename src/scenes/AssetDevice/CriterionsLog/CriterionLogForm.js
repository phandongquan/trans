import { connect } from 'react-redux'
import React, { Component } from 'react'
import { Form, Row, Col, Input, Button, Divider } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import Tab from '~/components/Base/Tab'
import tabList from '../config/tabList'
import Dropdown from '~/components/Base/Dropdown'
import UploadMultiple from '~/components/Base/UploadMultiple'
import { mineTypeImage, mineTypeVideo } from '~/constants/basic';
import AssetDropdown from '../config/AssetDropdown'
import { getMaintenaceByAsset } from '~/apis/assetDevice/group'
import { RollbackOutlined } from '@ant-design/icons';
import { saveLog } from '~/apis/assetDevice/criterion_log'
import { convertToFormData, cleanObject, showNotify } from '~/services/helper'

export class CriterionForm extends Component {
    constructor(props) {
        super(props)
        this.state = {
            criterions: []
        }

        this.aUploadRef = null;
        this.bUploadRef = null;
    }

    /**
     * On change asset
     * @param {*} id 
     */
    onChangeAsset = id => {
        this.setState({ criterions: [] })
        let xhr = getMaintenaceByAsset(id)
        xhr.then(res => {
            let { data } = res;
            if(data && data.asset_device_part) {
                if(Array.isArray(data.asset_device_part)) {
                    let criterions = [];
                    data.asset_device_part.map(part => {
                        if(part.criterions && Array.isArray(part.criterions)) {
                            part.criterions.map(crit => {
                                criterions.push(crit)
                            })
                        }
                    })
                    this.setState({ criterions })
                }
            }
        })
    }

    /**
     * Submit form
     * @param {*} values 
     */
    submitForm = values => {
        let id = values.crit_id
        values = cleanObject(values);
        let formData = convertToFormData(values);

        let bdataUpload = this.bUploadRef.getValues();
        if(bdataUpload.fileList && Array.isArray(bdataUpload.fileList)) {
            bdataUpload.fileList.map(f => formData.append('images_before[]', f))
        }

        let adataUpload = this.aUploadRef.getValues();
        if(adataUpload.fileList && Array.isArray(adataUpload.fileList)) {
            adataUpload.fileList.map(f => formData.append('images_after[]', f))
        }

        let xhr = saveLog(id, formData);
        xhr.then(res => {
            if(res.status) {
                this.props.history.push('/asset-device/criterion-log')
            } else {
                showNotify('Notify', res.message, 'error')
            }
        })
    }

    render() {
        const { criterions } = this.state;
        return (
            <div>
                <PageHeader title='Thêm mới lịch sử bảo trì' />
                <Row className="card mb-3 p-3">
                    <Tab tabs={tabList(this.props)} />
                </Row>
                <Row className='card p-3'>
                    <Form
                        ref={this.formRef}
                        layout='vertical'
                        onFinish={values => this.submitForm(values)}
                    >
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                <Form.Item label='Thiết bị' name='asset_id' rules={[{ required: true, message: 'Vui lòng chọn thiết bị' }]}>
                                    <AssetDropdown onChange={id => this.onChangeAsset(id)} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                <Form.Item label='Tiêu chuẩn' name='crit_id' rules={[{ required: true, message: 'Vui lòng chọn tiêu chuẩn' }]}>
                                    <Dropdown datas={criterions} />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={12}>
                            <Col span={24}>
                                <Form.Item label='Mô tả' name='note'>
                                    <Input.TextArea rows={4} placeholder='Mô tả' />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                <Form.Item name='current_status' label='Tình trạng thiết bị' 
                                    rules={[{ required: true, message: 'Vui lòng nhập tình trạng thiết bị' }]}>
                                    <Input placeholder='Tình trạng thiết bị' />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                <Form.Item name='status' label='Kết quả'>
                                    <Input placeholder='Kết quả' />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                <Form.Item name='solution' label='Biện pháp xử lý'>
                                    <Input placeholder='Biện pháp xử lý' />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                <Form.Item name='solution_next' label='Hướng xử lý tiếp theo'>
                                    <Input placeholder='Hướng xử lý tiếp theo' />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                <Form.Item label='Hình ảnh trước bảo trì'>
                                    <UploadMultiple 
                                        type={[...mineTypeVideo, ...mineTypeImage]}
                                        size={30} 
                                        onRef={ref => { this.aUploadRef = ref }}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                <Form.Item label='Hình ảnh sau bảo trì'>
                                    <UploadMultiple 
                                        type={[...mineTypeVideo, ...mineTypeImage]}
                                        size={30} 
                                        onRef={ref => { this.bUploadRef = ref }}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Divider className='m-0' />
                        <Row gutter={24} className="pt-3">
                            <Col xs={24} sm={24} md={24} lg={12} xl={12} key='btn-back'>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit">
                                        Submit
                                    </Button></Form.Item> 
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={12} xl={12} key='bnt-submit' style={{ textAlign: "right" }}>
                                <Form.Item> 
                                    <Button type="default" icon={<RollbackOutlined />}
                                        onClick={() => this.props.history.push('/asset-device/log')}>
                                        Cancel
                                    </Button>
                                </Form.Item> 
                            </Col>
                        </Row>
                    </Form>
                </Row>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(CriterionForm)