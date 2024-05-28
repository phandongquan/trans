import React, { Component } from 'react'
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Row, Col, Input, Form,  Spin} from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faBackspace } from '@fortawesome/free-solid-svg-icons';
import { create as apiCreate , update as apiUpdate, detail as apiDetail } from '~/apis/company/staffGroup';
import { Link } from 'react-router-dom';
import Dropdown from '~/components/Base/Dropdown';
import { showNotify, checkValueToDropdown } from '~/services/helper';
import StaffDropdown from '~/components/Base/StaffDropdown';



class StaffGroupForm extends Component {
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
        };
    }

    /**
     * @lifecycle
     */
     componentDidMount() {
        this.getDetailStaffGroups();
    }
    /**
     * @get detail Staff Groups
     */
    getDetailStaffGroups(){
        let { id } = this.props.match.params;
        let xhr;
        if (id) {
            xhr = apiDetail(id);
        } else {
            xhr = apiDetail(0);
        }
        xhr.then((response) => {
            if(response.status){
                let datas = response.data
                this.formRef.current.setFieldsValue(datas); 
            }      
        })
    }
    /**
     * @event submitForm
     */
    submitForm(value) {
        this.setState({ loading: true })
        let { t } = this.props;
        let { id } = this.props.match.params;
        let xhr ;
        let message = ''; 
        if(id){
            // xhr = apiCreate(value);
            xhr = apiUpdate(id , value);
            message = t('Staff Groups updated!');
        }else{
            xhr = apiCreate(value);
            message = t('Staff Groups Created!');
        }
        xhr.then((response) => {
            this.setState({ loading: false })
            if (response.status != 0) {
                showNotify(t('Notification'), message);
                this.props.history.push("/company/staff-groups")
            } else {
                showNotify(t('Notification'), response.message, 'error');
            }
        });
    }

    render() {
        let { t, match, baseData: { departments, positions, majors }} = this.props;
        let id = match.params.id;
        let subTitle = id ? t('update') : t('add_new');

        return (
            <div>
                <PageHeader
                    title={t('hr:staff_group')}
                    subTitle={subTitle}
                />
                <Row>
                    <Col span={24} className='card mr-1 pl-3 pr-3'>
                        <Spin spinning={this.state.loading}>
                            <Form
                                ref={this.formRef}
                                name="upsertStaffForm"
                                className="ant-advanced-search-form pt-3"
                                layout="vertical"
                                onFinish={this.submitForm.bind(this)}
                            >
                                <Row gutter={12}>
                                    <Col xs={24} sm={24} md={24} lg={16} xl={16}>
                                        <Form.Item name="title" label={t('hr:title')} hasFeedback rules={[{ required: true, message: t('hr:input_title') }]}>
                                            <Input placeholder="Title" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item name="code" label={t('code')} hasFeedback rules={[{ required: true, message: t('hr:please_input') + t(' ') + t('code') }]}>
                                            <Input placeholder="Code" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={[12, 0]}>
                                    <Col xs={24} sm={24} md={24} lg={16} xl={16}>
                                        <Form.Item label={t('staff')} name="staff_ids">
                                            <StaffDropdown mode="multiple" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item name="role" label={t('Role')}>
                                            <Dropdown datas={{0 : t('hr:public') , 1 : t('staff') , 10 : t('manager')}}
                                                defaultOption={t('hr:all_role')} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={[12, 0]}>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                        <Form.Item name="position_id" label={t('position')}>
                                            <Dropdown datas={positions} defaultOption={t('hr:all_position')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8} key='department_id'>
                                        <Form.Item name="department_id" label={t('dept')}>
                                            <Dropdown datas={departments}
                                                defaultOption={t('dept')}/>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8} key='major_id'>
                                        <Form.Item name="major_id" label={t('major')}>
                                            <Dropdown datas={majors} defaultOption={t('hr:all_major')} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={12}>
                                </Row>
                                <Row gutter={24} className="pt-3 pb-3">
                                    <Col span={12} key='bnt-submit' >
                                        <Button type="primary"
                                            icon={<FontAwesomeIcon icon={faSave} />}
                                            htmlType="submit"
                                            loading={this.state.loading}
                                        // onClick={}
                                        >
                                           {t('save')}
                                        </Button>
                                    </Col>
                                    <Col span={12} key='btn-back' style={{ textAlign: "right" }}>
                                        <Link to={`/company/staff-groups`}>
                                            <Button type="default"
                                                icon={<FontAwesomeIcon icon={faBackspace} />}
                                            >{t('back')}</Button>
                                        </Link>
                                    </Col>
                                </Row>
                            </Form>
                        </Spin>
                    </Col>
                </Row>
            </div>
        )
    }
}
/**
 * Map redux state to component props
 * @param {Object} state 
 */
const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    }
}
export default connect(mapStateToProps)(withTranslation()(StaffGroupForm));
