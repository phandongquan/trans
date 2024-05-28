import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { getStaff, detail as getDetailSkill } from '~/apis/company/skill';
import { updateLevel } from '~/apis/company/staff/skill';
import { Table, Button, Row, Col, Form, Input, Image, Avatar } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen } from '@fortawesome/free-solid-svg-icons';
import { skillStatus, levels } from '~/constants/basic';
import StaffPickerModal from './StaffPickerModal';
import tabConfig from '../config/tab';
import Tab from '~/components/Base/Tab';
import Dropdown from '~/components/Base/Dropdown';
import { checkPermission, historyReplace, historyParams, getThumbnailHR, getURLHR } from '~/services/helper';
import { screenResponsive } from '~/constants/basic';
import { UserOutlined } from '@ant-design/icons';
import { URL_HR } from '~/constants';

const FormItem = Form.Item;

class SkillStaff extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        let params = historyParams();
        this.state = {
            modalStaffPickerVisible: false,
            loading: false,
            skill: null,
            staffList: [],
            limit: 25,
            page: params.page ? Number(params.page) : 1,
            total: 0
        }

        this.formRef = React.createRef();

        this.onSubmitUpdateLevelFinished = this.onSubmitUpdateLevelFinished.bind(this);
        this.setModalStaffPickerVisible = this.setModalStaffPickerVisible.bind(this);
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        let { id } = this.props.match.params;
        if (id) {
            this.getSkillDetail(id);
            this.getStaffs(id);
        }
    }

    /**
     * 
     * @param {boolean} modalStaffPickerVisible 
     */
    setModalStaffPickerVisible(modalStaffPickerVisible = false) {
        this.setState({ modalStaffPickerVisible });
    }

    /**
     * Get skill detail
     * @param {*} id 
     */
    async getSkillDetail(id) {
        let response = await getDetailSkill(id);
        if (response.status) {
            let skill = response.data;
            this.setState({ skill: skill });
        }
    }

    /**
     * @event change page
     * 
     * @param {*} page 
     */
    onChangePage(page) {
        let { id } = this.props.match.params;
        let values = this.formRef.current.getFieldsValue();
        this.setState({ page }, () => this.getStaffs(id, { ...values }));
    }

    /**
     * Get list staff of skill_id
     * @param {*} params 
     */
    getStaffs(id, params = {}) {
        this.setState({ loading: true });
        params = {
            ...params,
            limit: this.state.limit,
            offset: (this.state.page - 1) * this.state.limit,
        }
        historyReplace(params);

        let xhr = getStaff(id, params);
        xhr.then((response) => {
            if (response.status) {
                let { data } = response;
                this.setState({
                    staffList: data.rows,
                    loading: false,
                    total: data.total
                });
            }
        });
    }

    /**
     * @event search report
     */
    submitForm = (e) => {
        let { id } = this.props.match.params;
        let values = this.formRef.current.getFieldsValue();
        this.getStaffs(id, values);
    }

    /**
     * Event submit update level for list staff and list skill
     */
    onSubmitUpdateLevelFinished() {
        this.submitForm();
    }

    render() {
        let { staffList, skill } = this.state;
        let { t, match, baseData: { locations, departments, divisions, majors } } = this.props;
        let { id } = match.params;
        const columns = [
            {
                title: t('hr:avatar'),
                align: 'center',
                width: '10%',
                render: r => {
                    if (r.staff && r.staff.avatar) {
                        return <Image
                            className='staff_image'
                            width={64}
                            height={64}
                            preview={{ src: getURLHR(r.staff.avatar) }}
                            src={getThumbnailHR(r.staff.avatar, '40x40')} />
                    } else {
                        return <Avatar size={64} icon={<UserOutlined />} />
                    }
                }
            },
            {
                title: t('hr:staff'),
                render: r => <>
                    <span>{r.staff_name}<strong> #{r.code}</strong></span><br />
                    <small>{r.staff_email}</small><br />
                    <span>
                        {departments.find(d => r.staff_dept_id == d.id)?.name}-
                        {majors.find(m => r.major_id == m.id)?.name}
                    </span>
                </>
            },
            {
                title: t('hr:level'),
                render: r => { return r.level || 0 }
            },
            {
                title: t('hr:location'),
                render: r => { return locations.map(l => r.staff_loc_id == l.id && l.name) }
            },
            {
                title: t('hr:created_by'),
                render: r => r.created_by && '#' + r.created_by
            },
            {
                title: t('hr:updated_by'),
                render: r => <>
                    {r.updated_by && '#' + r.updated_by}<br />
                    {r.updated_at}
                </>
            },
            // {
            //     title: 'Action',
            //     dataIndex: 'id',
            //     align: 'right',
            //     render: (staff_skill_id) => {
            //         return (
            //             <>
            //                 <Link to={`/company/skill/${id}/staff/${staff_skill_id}/edit`} key="edit-staff-skill">
            //                     <TooltipButton title={t('Edit')} type="primary" size='small' icon={<FontAwesomeIcon icon={faPen} />} />
            //                 </Link>
            //             </>
            //         );
            //     }
            // }
        ]
        return (
            <div id='page_staff_skill'>
                <PageHeader
                    title={t('hr:skill')}
                    subTitle={skill ? skill.name : ''}
                    tags={
                        checkPermission('hr-skill-staff-list-update') ?
                            [
                                <Button key="create-skill" icon={<FontAwesomeIcon icon={faPlus} />}
                                    type="primary" onClick={() => this.setModalStaffPickerVisible(true)} >
                                    &nbsp; &nbsp;{t('hr:update_skill_for_staff')}
                                </Button>
                            ]
                            : ''
                    }
                />
                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={tabConfig(id,this.props)} />
                    <Form className="pt-3"
                        ref={this.formRef}
                        name="searchSkillForm"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical"
                    >
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} >
                                <FormItem name='name'>
                                    <Input placeholder={t('hr:code') + '/' + t('hr:name')} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <FormItem name='level'>
                                    <Dropdown datas={{ 0: 'Level 0', ...levels }} defaultOption={t("hr:all_level")} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <FormItem name='location_id'>
                                    <Dropdown datas={locations} defaultOption={t("hr:all_location")} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <FormItem name='status'>
                                    <Dropdown datas={skillStatus} defaultOption={t("hr:all_status")} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Button type="primary" htmlType="submit" className='mb-3'>
                                    {t('hr:search')}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        {window.innerWidth < screenResponsive ?
                            <div className='block_scroll_data_table'>
                                <div className='main_scroll_table'>
                                    <Table
                                        dataSource={staffList}
                                        columns={columns}
                                        loading={this.state.loading}
                                        pagination={{
                                            pageSize: this.state.limit, total: this.state.total,
                                            hideOnSinglePage: true, showSizeChanger: false,
                                            onChange: page => this.onChangePage(page)
                                        }}
                                        rowKey={(staff) => staff.id}
                                    >
                                    </Table>
                                </div>
                            </div>
                            :
                            <Table
                                dataSource={staffList}
                                columns={columns}
                                loading={this.state.loading}
                                pagination={{
                                    pageSize: this.state.limit, total: this.state.total,
                                    hideOnSinglePage: true, showSizeChanger: false,
                                    onChange: page => this.onChangePage(page)
                                }}

                                rowKey={(staff) => staff.id}
                            >
                            </Table>
                        }
                    </Col>
                </Row>
                {this.state.skill ? (
                    <StaffPickerModal visible={this.state.modalStaffPickerVisible} toggleModal={this.setModalStaffPickerVisible.bind(this)}
                        skill={skill} onSubmitFinished={this.onSubmitUpdateLevelFinished}
                    />
                ) : null}
            </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SkillStaff));