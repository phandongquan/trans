import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Row, Col, Card, Form, Divider } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faBackspace } from '@fortawesome/free-solid-svg-icons';
import { detail as detailSkill, getStaffSkillDetai as apiGetStaffSkillDetai } from '~/apis/company/skill';
import { create as apiCreateStaffSkill, update as apiUpdateStaffSkill } from '~/apis/company/staff/skill'
import { getList as getListStaff, getLastExam } from '~/apis/company/staff';
import { getList as getListSkill } from '~/apis/company/skill';
import { Link } from 'react-router-dom';
import { showNotify } from '~/services/helper';
import Tab from '~/components/Base/Tab';
import Dropdown from '~/components/Base/Dropdown';
import tabConfig from '../config/tab';
import { skillStatus, levels } from '~/constants/basic';
import TextArea from 'antd/lib/input/TextArea';
import LatestExamination from '~/scenes/Company/Skill/Staff/LatestExamination';
import SubSkillInfo from '~/scenes/Company/Skill/Staff/SubSkillInfo';
import StaffDropdown from '~/components/Base/StaffDropdown';

class StaffSkillFrom extends Component {

    /**
     *
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            skill: null,
            staffSkill: null,
            staffs: [],
            skills: [],
            objLastExam: {},
        };
    }
    /**
     * @lifecycle
     */
    componentDidMount() {
        let { id, staff_skill_id } = this.props.match.params;
        if (id) {
            this.getSkillDetail(id);
            /**
             * @set form default value
             */
            this.formRef.current.setFieldsValue({
                status: 1,
                level: 1,
            });
        }
        if (staff_skill_id) {
            this.getStaffSkillDetail(staff_skill_id);
        }
        this.getStaffs();
        this.getSkills();
    }
    
    componentWillReceiveProps(nextProps) {
        if ((nextProps.match.params.id !== this.props.match.params.id) 
            ||(nextProps.match.params.staff_skill_id !== this.props.match.params.staff_skill_id)) {
            let { id, staff_skill_id } = nextProps.match.params;
            if (id) {
                this.getSkillDetail(id);
                /**
                 * @set form default value
                 */
                this.formRef.current.setFieldsValue({
                    status: 1,
                    level: 1,
                });
            }
            if (staff_skill_id) {
                this.getStaffSkillDetail(staff_skill_id);
            }
            this.getStaffs();
            this.getSkills();
            return true;
        }
        return true
    }

    /**
     * Get skill detail
     * @param {*} id 
     */
    async getSkillDetail(id) {
        let response = await detailSkill(id);

        if (response.status) {
            let skill = response.data;
            this.setState({ skill: skill });
            this.formRef.current.setFieldsValue({
                skill_id: skill ? skill.id : 0,
                department_id: skill ? skill.department_id : 0,
                division_id: skill ? skill.division_id : 0,
                major_id: skill ? skill.major_id : 0,
            });
        }
    }

    /**
     * Get staff skill detail
     * @param {*} id 
     */
    async getStaffSkillDetail(id) {
        let response = await apiGetStaffSkillDetai(id);
        
        if(response.status) {
            let { data } = response;
            this.formRef.current.setFieldsValue(data);
            this.setState({staffSkill: data})

            /** Call api get last exam by skill_id , staff_id */
            let responseLastExam = await getLastExam({
                skill_id: data.skill_id,
                staff_id: data.staff_id
            })

            if(responseLastExam.status){
                this.setState({objLastExam: responseLastExam.data})
            }
        }
    }

    /**
     * Get list staff
     * @param {*} id 
     */
    async getStaffs() {
        let { locations } = this.props.baseData;
        let response = await getListStaff({
            limit: 0,
            offset: 0,
            sort: 'staff_id'
        });
        if(response.status) {
            let { data } = response;
            let listData = [];
            if (data.rows) {
                Object.keys(data.rows).map(id => {
                    let locationName = ''
                    locations.map(l => { 
                        if(l.id == data.rows[id].staff_loc_id){
                            return locationName = l.name;
                        }
                    })

                    listData.push({
                        id: data.rows[id].staff_id,
                        name: data.rows[id].staff_name 
                            + ' #' + data.rows[id].staff_id 
                            + ' # ' + locationName
                    });
                })
            }
            this.setState({staffs: listData})
        }
    }

    /**
     * Get list skill
     * @param {*} id 
     */
    async getSkills() {
        let response = await getListSkill()
        if(response.status) {
            let { data } = response;
            this.setState({skills: data.rows})
        }
    }

    
    /**
     * Loading Button
     */
    enterLoading = () => {
        this.setState({ loading: true });
        setTimeout(() => {
            this.setState({ loading: false });
        }, 1000);
    }

    /**
     * @event submitForm
     */
    submitForm(values) {
        values.major_id = Array.isArray(values.major_id) ? values.major_id[0] : values.major_id;
        let { t } = this.props;
        let { staff_skill_id } = this.props.match.params;
        let xhr;
        let message = '';
        if (staff_skill_id) {
            xhr = apiUpdateStaffSkill(staff_skill_id, values);
            message = t('Staff skill updated!');
        } else {
            xhr = apiCreateStaffSkill(values);
            message = t('Staff skill created!');
        }
        xhr.then((response) => {
            if (response.status != 0) {
                showNotify(t('Notification'), message);
            } else {
                showNotify(t('Notification'), response.message, 'error');
            }
        });
    }

    /**
     * @render
     */
    render() {
        let { t, match, baseData: { departments, divisions, majors } } = this.props;
        let { id } = match.params;
        let { staffSkill, skill, staffs, skills, objLastExam } = this.state;
        let subTitle = false;
        if (id) {
            subTitle = (skill ? "'" + skill.name + "'" : '') + ' - ' + t('Edit staff');
        } else {
            subTitle = (skill ? "'" +  skill.name + "'" : '') + ' - ' + + t('Add new staff');
        }
        return (
            <div id='page_edit_kill_staff'>
                <PageHeader title={t('Skill')} subTitle={subTitle} />

                <Row className="card p-3 mb-3 pt-0">
                    <Tab tabs={tabConfig(id)} />
                </Row>
                <Row>
                    <Col span={16}>
                        <div className='card p-3'>
                            <Form ref={this.formRef} name="upsertForm" className="ant-advanced-search-form " layout="vertical"
                                onFinish={this.submitForm.bind(this)}>
                                <Row gutter={12}>
                                    <Col span={24} key='staff_id'>
                                        <Form.Item name="staff_id" 
                                            label={t('Staff')} 
                                            hasFeedback 
                                            rules={[{required: true, message: t('Please select staff')}]}>
                                            <StaffDropdown defaultOption={t('Please select staff')} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={12}>
                                    <Col span={24} key='skill_id'>
                                        <Form.Item name="skill_id" 
                                            label={t('Skill')} 
                                            hasFeedback 
                                            rules={[{required: true, message: t('Please select skill')}]}>
                                            <Dropdown datas={skills} defaultOption={t('-- All Skills --')} disabled={true} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={12}>
                                    <Col span={8} key='deparment'>
                                        <Form.Item name="department_id" label={t('Department')}>
                                            <Dropdown datas={departments} defaultOption="-- All Departments --" disabled={true} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8} key='section'>
                                        <Form.Item name="division_id" label={t('Section')}>
                                            <Dropdown datas={divisions} defaultOption="-- All Sections --" disabled={true} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8} key='major'>
                                        <Form.Item name="major_id" label={t('Major')}>
                                            <Dropdown datas={majors}  defaultOption="-- All Majors --" disabled={true} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={12}>
                                    <Col span={12}>
                                        <Form.Item name='level' label={t('Level')}>
                                            <Dropdown datas={levels} defaultOption='Level 0' />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label={t('Status')} name='status'>
                                            <Dropdown datas={skillStatus} defaultOption='-- All Status --' />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={12}>
                                    <Col span={24} key='note'>
                                        <Form.Item label={t('Note')} name='comment'>
                                            <TextArea rows={4}/>
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Divider className="m-0" />
                                <Row gutter={24} className="pt-3">
                                    <Col span={12} key='bnt-submit' >
                                        <Button type="primary" icon={<FontAwesomeIcon icon={faSave} />} htmlType="submit"
                                            loading={this.state.loading}
                                            onClick={this.enterLoading.bind(this)}
                                        >
                                            &nbsp;{t('Save')}
                                        </Button>
                                    </Col>
                                    <Col span={12} key='btn-back' style={{ textAlign: "right" }}>
                                        <Link to={`/company/skill/${id}/staff`}>
                                            <Button type="default"
                                                icon={<FontAwesomeIcon icon={faBackspace} />}
                                            >&nbsp;{t('Back')}</Button>
                                        </Link>
                                    </Col>
                                </Row>  
                            </Form>
                        </div>
                    </Col>
                    { staffSkill ? 
                        skill ? 
                            skill.parent_id ? 
                                <Col span={8}>
                                    <div id='box_sub_skill_info_page_edit_kill_staff' className='card ml-3 p-3 table_in_block'>
                                        <p style={{ fontSize: 18, marginBottom: -5}}> {t('Latest Examination')} </p>
                                        <Divider />
                                        { Object.keys(objLastExam).map(i => <LatestExamination key={i} type={i} data={objLastExam[i].rows}/>)}`
                                    </div>
                                </Col>
                            : 
                                <Col span={8}>
                                    <div id='box_sub_skill_info_page_edit_kill_staff' className='card ml-3 p-3 table_in_block'>
                                        <p style={{ fontSize: 18, marginBottom: -5}}> {t('Sub Skill Information')} </p>
                                        <Divider />
                                        <SubSkillInfo staff_skill={staffSkill} />
                                    </div>
                                </Col>
                        : [] 
                    : [] }
                </Row>
            </div >
        );
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
export default connect(mapStateToProps)(withTranslation()(StaffSkillFrom));