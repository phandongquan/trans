import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Form, Row, Col, Divider, Button } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import Dropdown from '~/components/Base/Dropdown';
import Upload from '~/components/Base/Upload';
import { typeFileExcel } from '~/constants/basic';
import BackButton from '~/components/Base/BackButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import Tab from '~/components/Base/Tab';
import TabList from '../config/tabList';
import { importTimesheet as apiImportTimesheet } from '~/apis/company/timesheet';
import { convertToFormData, showNotify } from '~/services/helper'

class ImportTimesheet extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            file: ''
        }
    }

    /**
     * @event submit form
     */
    submitForm(values) {
        const { t } = this.props;
        let formData;
        formData = convertToFormData(values);
        formData.append('file_name', this.state.file[0])

        let xhr = apiImportTimesheet(formData);
        xhr.then( response => {
            if(response.status) {
                
            } 
        }).catch( err => {
            showNotify(t('notification'), err.message, 'error')
        })
    }

    render() {
        let { t, baseData: { locations } } = this.props;
        return(
            <>
                <PageHeader
                    title={t('hr:timesheet')}
                    subTitle={t('hr:import')}
                />
                <Row>
                    <Col span={24} className='card mr-1 pl-3 pr-3 mb-3 pb-3'>
                        <Tab tabs={TabList(this.props)} />
                    </Col>
                </Row>
                <Row>
                    <Col xs={24} sm={24} md={24} lg={12} xl={12} className='card mr-1 pl-3 pr-3'>
                    <Form
                            ref={this.formRef}
                            name="searchStaffForm"
                            onFinish={this.submitForm.bind(this)}
                            className="ant-advanced-search-form pt-3"
                            layout="vertical"
                        >
                            <Row gutter={24}>
                                <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                    <Form.Item name='location_id' label={t('location')}>
                                        <Dropdown datas={locations} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={24}>
                                <Col span={24}>
                                    <Form.Item name='file' label={t('hr:file')}>
                                        <Upload 
                                            fileList={this.state.file}
                                            type={typeFileExcel}
                                            size={5}
                                            onChange={(e) => this.setState({file: e})}
                                            onRemove={() => this.setState({file: ''})}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Divider className="m-0" />
                                <Row gutter={24} className="pt-3 pb-3">
                                    <Col xs={12} sm={12} md={12} lg={12} xl={12} key='bnt-approve'>
                                        <Button type="primary" icon={<FontAwesomeIcon icon={faSave} />} htmlType="submit" >
                                            &nbsp;{t('hr:save')}
                                        </Button>
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={12} xl={12} key='btn-back' style={{ textAlign: "right" }}>
                                        <BackButton url={`/company/timesheet`} />
                                    </Col>
                                </Row>
                        </Form>
                    </Col>
                </Row>
            </>
        )
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ImportTimesheet))