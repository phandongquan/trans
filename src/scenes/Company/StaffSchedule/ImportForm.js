import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Row, Col, Form, Button, Divider, DatePicker, Spin } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import Dropdown from '~/components/Base/Dropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import BackButton from '~/components/Base/BackButton';
import Upload from '~/components/Base/Upload';
import { typeFileExcel } from '~/constants/basic';
import dayjs from 'dayjs';
import { convertToFormData, showNotify } from '~/services/helper';
import { preImport } from '~/apis/company/staffSchedule';

class ImportForm extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef()
        this.state = {
            file: null,
            loading: false
        }
    }

    /**
     * @event submit form
     */
    submitForm = async (values) => {
        let { t } = this.props;
        if (values.date.startOf('month') < dayjs().startOf('month')) {
            showNotify('Notification', t('Can not import schedule for old month!'), 'error')
            return false;
        }
        this.setState({ loading: true });

        let formData = convertToFormData({
            year: values.date.format('YYYY'),
            month: values.date.format('MM'),
            location: values.location_id ? values.location_id : 0
        });

        formData.append('file', this.state.file[0]);

        let importXhr = preImport(formData);
        importXhr.then(res => {
            if (res.status && res.data.import !== false) {
                let { t} = this.props;
                showNotify(t('Notification'), t('Import hoàn tất!'), 'success');
            }else{
                showNotify(t('Notification'), 'Có lỗi xảy ra', 'error');
            }
        }).catch(err => {
            console.log({ importXhrErr: err });
            showNotify('Notification', err.message, 'error')
        }).finally(() => this.setState({ loading: false }));
    }

    render() {
        let { t, baseData: { locations } } = this.props;
        let { loading, file } = this.state;
        return (
            <>
                <PageHeader
                    title={t('Import Schedule ')}
                />
                <Row>
                    <Col xs={24} sm={24} md={24} lg={12} xl={12} className='card mr-1 pl-3 pr-3'>
                        <Form ref={this.formRef}
                            name="staff-leave-form"
                            className="ant-advanced-search-form pt-3"
                            layout="vertical"
                            onFinish={this.submitForm.bind(this)}
                        >
                            <Spin spinning={loading}>
                                <Row gutter={24}>
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12} >
                                        <Form.Item name='location_id' label={t('Location')}>
                                            <Dropdown datas={locations} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                        <Form.Item name='date' label={t('Date')} rules={[{ required: true, message: t('Please choose month') }]}>
                                            <DatePicker picker='month' />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                        <Form.Item name='file' label={t('Upload File')} rules={[{ required: true, message: t('Please choose file to import!') }]}>
                                            <Upload
                                                fileList={file}
                                                type={[typeFileExcel, 'application/vnd.ms-excel']}
                                                size={5}
                                                onChange={(e) => this.setState({ file: e })}
                                                onRemove={(e) => this.setState({ file: null })}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Divider className="m-0" />
                                <Row gutter={24} className="pt-3 pb-3">
                                    <Col span={12}>
                                        <Button type="primary" icon={<FontAwesomeIcon icon={faSave} />} htmlType="submit" >
                                            &nbsp;{t('Save')}
                                        </Button>
                                    </Col>
                                    <Col span={12} key='btn-back' style={{ textAlign: "right" }}>
                                        <BackButton url={`/company/staff-schedule`} />
                                    </Col>
                                </Row>
                            </Spin>
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ImportForm));