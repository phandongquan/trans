import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Table, Row, Col, Input, Form, Modal } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { faKey, faPen, faPlus, faTrashAlt, faTimes, faCheck, faEye } from '@fortawesome/free-solid-svg-icons';
import { getByParam } from '~/apis/company/staff';
import { getByStaff as getSkillByStaff, create, update, destroy, massDestroy } from '~/apis/company/staff/skill';
import skill, { getList as getListSkill } from '~/apis/company/skill';
import { Link } from 'react-router-dom';
import Dropdown from '~/components/Base/Dropdown';
import debounce from 'lodash/debounce';
import { searchForDropdown as getSkillList } from '~/apis/company/skill';
import Tab from '~/components/Base/Tab';
import tabConfig from './config/tab';
import { checkPermission, showNotify } from '~/services/helper';
import { staffStatus } from '~/constants/basic';
import './config/staffSkill.css';
import StaffSkillLog from './StaffSkillLog';

import { screenResponsive, skillLogSourceType } from '~/constants/basic';

const FormItem = Form.Item;
const { confirm } = Modal;
class StaffSkill extends Component {

    /**
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            staffSkillRowKeysSelected: [],
            skillRowKeysSelected: [],
            skillsDropdownSelected: [],
            currentStaffSkills: [],
            skills: [],
            staff: null,
            visibleLog: false,
            staffSkillId: null
        };
        this.formRef = React.createRef();
        this.formSkillRef = React.createRef();
        this.getListSkill = debounce(this.getListSkill, 500);
    }

    /**
     * @lifecycle 
     */
    componentDidMount() {
        this.getData();
    }

    /**
     * Get list data skill for staff
     * @param {} params 
     */
    async getData(params = {}) {
        this.setState({ loading: true });
        let { match } = this.props;
        let { id } = match.params;
        /**
         * @fetch API
         */
        let staffXhr = await getByParam({ staff_id: id });
        let staff = (staffXhr.status == 1) ? staffXhr.data.rows : {};

        let staffSkillsXhr = await getSkillByStaff(id, { is_child: 1 });
        let staffSkills = (staffSkillsXhr.status == 1) ? staffSkillsXhr.data.rows : [];

        let skillsXhr = await getListSkill({ department_id: staff.staff_dept_id, status: 2, limit: 1000 });
        let skills = (skillsXhr.status == 1) ? skillsXhr.data.rows : {};

        this.setState({ currentStaffSkills: staffSkills, skills, staff }, () => this.setState({ loading: false }));
    }

    /**
     * @event toggle modal
     * @param {*} visible 
     */
    toggleModal(visible) {
        this.setState({ visible });
    }

    /**
     * List skill for dropdown
     */
    async getListSkill(params = {}) {
        let { department_id, major_id } = this.formRef.current.getFieldsValue();
        if (!params.id) {
            params = {
                ...params,
                department_id: department_id !== undefined ? department_id : 0,
                major_id: major_id !== undefined ? major_id : 0
            }
        }

        let skillResponse = await getSkillList(params);
        if (skillResponse && skillResponse.data) {
            let listSkill = skillResponse.data.results;
            this.setState({ listSkill });
        }
    }

    /**
     * @event Search skill
     * @param {*} value 
     */
    onSearchSkill(value) {
        if (!value) {
            return;
        }
        this.getListSkill({ value });
    }


    /**
     * @event insert staff skill
     * @param {*} id 
     */
    onCreateStaffSkill(id = []) {
        let { t, match } = this.props;
        let { currentStaffSkills } = this.state;

        let childId = [];
        let skillFinded = currentStaffSkills.find(c => c.id == id);
        if (skillFinded && skillFinded.children) {
            skillFinded.children.map(child => childId.push(child.skills ? child.skills.id : child.id))
        }

        if (!id.length) {
            showNotify(t('Notification'), t('Please select skills'), 'error');
            return;
        }
        confirm({
            title: 'Confirm?',
            icon: <ExclamationCircleOutlined />,
            content: 'Add skill for staff with level = 1?',
            maskStyle: { background: 'rgba(0, 0, 0, 0.1)' },
            onOk: async () => {
                this.setState({ loading: true });
                let staff_id = match.params.id;
                let formData = {
                    staff_id,
                    skill_id: id.concat(childId)
                };
                let xhr = await create(formData);
                if (xhr.status == 1) {
                    this.getData();
                    showNotify(t('Notification'), t('Data has been created!'));
                }
                this.setState({ loading: false });
            },
            onCancel: () => { },
        });

    }

    /**
     * Toggle modal staff skill log
     */
    toggleModalStaffSkillLog = (hidden = true, id = null) => {
        this.setState({ visibleLog: !hidden, staffSkillId: id })
    }

    /**
     * On view modal staff skill log
     * @param {*} id 
     */
    onViewStaffSkillLog = id => {
        this.toggleModalStaffSkillLog(false, id);
    }

    /**
     * @event before show modal edit relationship
     * @param {*} id 
     */
    onEditStaffSkill(id = null) {
        this.toggleModal(true);
        let { currentStaffSkills } = this.state;
        let staffSkill = currentStaffSkills.find(s => s.id == id);
        if (!staffSkill) {
            currentStaffSkills.map(skillParent => {
                if (!staffSkill) {
                    if (typeof skillParent.children != 'undefined' && Array.isArray(skillParent.children)) {
                        staffSkill = skillParent.children.find(child => child.id == id && typeof child.skills != 'undefined')
                    }
                }
            })
        }

        this.formRef.current.setFieldsValue({
            name: staffSkill.skills ? staffSkill.skills.name : staffSkill.name,
            ...staffSkill
        });
    }

    /**
     * @event delete staff skill
     * @param {*} id 
     */
    async onDeleteStaffSkill(id = null) {
        this.setState({ loading: true });
        let { t } = this.props;
        let xhr = await destroy(id);
        if (xhr.status == 1) {
            this.getData();
            showNotify(t('hr:notification'), t('Data has been deleleted'));
        }
        this.setState({ loading: false });
    }
    /**
     * @event delete mass staff skill
     * @param {*} id 
     */
    async onMassDeleteStaffSkill(data = []) {
        let { t } = this.props;
        if (!data['staff_skill_ids'].length) {
            showNotify(t('hr:notification'), t('hr:please_select_skills'), 'error');
            return;
        }
        this.setState({ loading: true });

        let xhr = await massDestroy(data);
        if (xhr.status == 1) {
            this.getData();
            showNotify(t('hr:notification'), t('Data has been deleleted'));
        }
        this.setState({ loading: false });
    }

    /**
     * @event before submit form
     * Validate before submit
     */
    handleFormSubmit() {
        this.formRef.current.validateFields()
            .then((values) => {
                this.submitForm(values);
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    }

    /**
     * @event submit form
     * @param {Object} values 
     */
    async submitForm(values) {
        let xhr;
        this.setState({ loading: true });
        let { t, match } = this.props;
        let staff_id = match.params.id;
        let submitData = {
            ...values,
            staff_id
        }
        xhr = await update(values.id, submitData);
        if (xhr.status == 1) {
            this.getData();
            showNotify(t('hr:notification'), t('hr:update_susscess'));
            this.toggleModal(false);
        }
        this.setState({ loading: false });
    }

    /**
     * @render
     */
    render() {
        let { t, match } = this.props;
        let { id } = match.params;
        let { currentStaffSkills, staff } = this.state;

        const constTablist = tabConfig(id,this.props);

        // Trình tự sắp xếp:
        // 1) Kỹ thuật viên - điều dưỡng - bác sĩ - tư vấn viên
        // 2) Điều dưỡng - kỹ thuật viên -  bác sĩ - tư vấn viên
        // 3) Tư vấn viên - ...
        let arrTech = []; let arrNursing = []; let arrDoctor = []; let arrCustomerCare = []; let arrRemaining = [];
        currentStaffSkills.map(s => {
            if (s.children && s.children.length == 0) {
                delete s['children'];
            } else if (s.children) {
                let childrenSorted = s['children'].sort(function (a, b) {
                    return a.code.localeCompare(b.code);
                });
                s['children'] = childrenSorted;
            }

            let majorId = s.skills ? s.skills.major_id : s.major_id
            switch (majorId) {
                case 48: // kỹ thuật viên spa
                    arrTech.push(s);
                    break;
                case 40: // điều dưỡng
                    arrNursing.push(s);
                    break;
                case 25: // Bác sĩ
                    arrDoctor.push(s);
                    break;
                case 27:
                case 56: // Tư vấn
                    arrCustomerCare.push(s);
                    break;
                default:
                    arrRemaining.push(s);
                    break;
            }
        })

        let currentStaffSkillsNew = [];
        if (staff) {
            switch (staff.major_id) {
                case 48: // 1) Kỹ thuật viên - điều dưỡng - bác sĩ - tư vấn viên
                    currentStaffSkillsNew = arrTech.concat(arrNursing).concat(arrDoctor).concat(arrCustomerCare).concat(arrRemaining)
                    break;
                case 40: // 2) Điều dưỡng - kỹ thuật viên - bác sĩ - tư vấn viên
                    currentStaffSkillsNew = arrNursing.concat(arrTech).concat(arrDoctor).concat(arrCustomerCare).concat(arrRemaining)
                    break;
                default:
                    currentStaffSkillsNew = arrCustomerCare.concat(arrNursing).concat(arrTech).concat(arrDoctor).concat(arrRemaining)
                    break;
            }
        }

        const columns = [
            {
                title: t('hr:skill_code'),
                align: 'center',
                render: r => r.code ? r.code : r.skills?.code
            },
            {
                title: t('hr:skill_name'),
                dataIndex: 'name',
                render: (text, record) => {
                    let skillName = record.skills ? record.skills.name : record.name;
                    return (
                        <div>
                            <Link className={record.children && 'text-bold'} to={`/company/skill/${record.skill_id}/edit`}>
                                {skillName}
                            </Link>
                            &nbsp;{record.is_required_100 == 1 ? (<FontAwesomeIcon icon={faKey} />) : ''}
                        </div>
                    );
                },
            },
            {
                title: t('hr:parent_skill_name'),
                render: (text, record) => {
                    let parentSkill = record.skills ? record.skills.parent : {};
                    if (!parentSkill?.id) {
                        return;
                    }
                    return (
                        <div>
                            <Link className={record.children && 'text-bold'} to={`/company/skill/${parentSkill?.id}/edit`}>
                                {parentSkill?.name}
                            </Link>
                        </div>
                    );
                },
            },
            {
                title: t('hr:level'),
                dataIndex: 'level',
                align: 'center',
            },
            {
                title: t('hr:source'),
                render: (text, record) => {
                    let lastestSkillLog = record.lastest_skill_log ? record.lastest_skill_log : {};
                    if (!lastestSkillLog?.source_type) {
                        return;
                    }
                    return skillLogSourceType[lastestSkillLog.source_type];
                },
            },
            {
                title: t('hr:updated_at'),
                dataIndex: 'updated_at',
                align: 'center',
            },
            {
                title: t('hr:updated_by'),
                align: 'center',
                render: (t, record) => {
                    let user = record?.staff?.user || {};
                    let updatedUser = record?.updated_by_user || {};
                    return (record.updated_by && (record.updated_by == user.id)) ? 'Hệ Thống' : (updatedUser.name || '');
                }
            },
            {
                title: t('hr:action'),
                align: 'center',
                width: 120,
                render: (text, record) => {
                    let level = record.level;
                    return (
                        <div>
                            {
                                level === null ? (
                                    <Button type="primary" size='small' style={{ marginLeft: 8 }} onClick={() => this.onCreateStaffSkill([record.skill_id])}
                                        icon={<FontAwesomeIcon icon={faPlus} />}>
                                        &nbsp;{t('hr:add_new')}
                                    </Button>
                                ) : (
                                    <div>
                                        {
                                            checkPermission('hr-staff-detail-skill-preview') ?
                                                <Button type="primary" size='small' className='mr-1' icon={<FontAwesomeIcon icon={faEye} />} onClick={() => this.onViewStaffSkillLog(record.id)} />
                                            : ''
                                        }
                                        {
                                            checkPermission('hr-staff-detail-skill-update') ?
                                                <Button type="primary" size='small' className='mr-1' icon={<FontAwesomeIcon icon={faPen} />} onClick={() => this.onEditStaffSkill(record.id)} />
                                            : ''
                                        }
                                        {
                                            checkPermission('hr-staff-detail-skill-delete') ?
                                                <Button type="primary" size='small' danger onClick={() => this.onDeleteStaffSkill(record.id)}
                                                    icon={<FontAwesomeIcon icon={faTrashAlt} />}>
                                                </Button>
                                            : ''
                                        }
                                    </div>
                                )
                            }
                        </div>
                    );
                }
            }
        ];
        return (
            <div>
                <PageHeader title={t("hr:list_staff_skill")} extra={[]} />
                <Row className="card p-3 pt-0 mb-3">
                    <Tab tabs={constTablist} />
                </Row>

                <Row className='mb-3'>
                    <Col span={24} >
                        {window.innerWidth < screenResponsive ?
                            <div className='block_scroll_data_table'>
                                <div className='main_scroll_table'>
                                    <Table
                                        rowSelection={{
                                            // hideSelectAll: true,
                                            selectedRowKeys: this.state.skillRowKeysSelected,
                                            onChange: (selectedRowKeys, selectedRows) => {
                                                let staffSkillRowKeysSelected = [];
                                                if (selectedRows.length) {
                                                    selectedRows.map(s => {
                                                        staffSkillRowKeysSelected.push(s.skills ? s.skills.id : s.id);
                                                        if (s.children) {
                                                            s.children.map(child => {
                                                                staffSkillRowKeysSelected.push(child.skills ? child.skills.id : child.id);
                                                                selectedRowKeys.push(child.skills ? child.skills.id : child.id)
                                                            })
                                                        }
                                                    });
                                                }
                                                this.setState({ skillRowKeysSelected: selectedRowKeys, staffSkillRowKeysSelected })
                                            },
                                            columnWidth: '50px'
                                        }}
                                        dataSource={currentStaffSkillsNew}
                                        columns={columns}
                                        loading={this.state.loading}
                                        pagination={{ pageSize: 1000, hideOnSinglePage: true }}
                                        rowKey={(staffSkill) => staffSkill.skill_id}
                                        footer={() =>
                                            <>
                                                {/* <Button type='primary' onClick={() => this.onCreateStaffSkill(this.state.skillRowKeysSelected)} className='mr-2'
                                                    icon={<FontAwesomeIcon icon={faPlus} />}>&nbsp;Add selected skill</Button> */}
                                                {
                                                    checkPermission('hr-staff-detail-skill-delete') ?
                                                <Button type='primary' onClick={() => this.onMassDeleteStaffSkill({ staff_skill_ids: this.state.staffSkillRowKeysSelected })}
                                                    icon={<FontAwesomeIcon icon={faTrashAlt} />} >&nbsp;{t('hr:remove_selected_skill')}</Button> : ''
                                                }
                                            </>
                                        }
                                    />
                                </div>
                            </div>
                            :
                            <Table
                                rowSelection={{
                                    // hideSelectAll: true,
                                    selectedRowKeys: this.state.skillRowKeysSelected,
                                    onChange: (selectedRowKeys, selectedRows) => {
                                        let staffSkillRowKeysSelected = [];
                                        if (selectedRows.length) {
                                            selectedRows.map(s => {
                                                staffSkillRowKeysSelected.push(s.skills ? s.skills.id : s.id);
                                                if (s.children) {
                                                    s.children.map(child => {
                                                        staffSkillRowKeysSelected.push(child.skills ? child.skills.id : child.id);
                                                        selectedRowKeys.push(child.skills ? child.skills.id : child.id)
                                                    })
                                                }
                                            });
                                        }
                                        this.setState({ skillRowKeysSelected: selectedRowKeys, staffSkillRowKeysSelected })
                                    },
                                    columnWidth: '50px'
                                }}
                                dataSource={currentStaffSkillsNew}
                                columns={columns}
                                loading={this.state.loading}
                                pagination={{ pageSize: 1000, hideOnSinglePage: true }}
                                rowKey={(staffSkill) => staffSkill.skill_id}
                                footer={() =>
                                    <>
                                        {/* <Button type='primary' onClick={() => this.onCreateStaffSkill(this.state.skillRowKeysSelected)} className='mr-2'
                                            icon={<FontAwesomeIcon icon={faPlus} />}>&nbsp;Add selected skill</Button> */}
                                        {
                                            checkPermission('hr-staff-detail-skill-delete') ?
                                        <Button type='primary' onClick={() => this.onMassDeleteStaffSkill({ staff_skill_ids: this.state.staffSkillRowKeysSelected })}
                                                icon={<FontAwesomeIcon icon={faTrashAlt} />} >&nbsp;{t('hr:remove_selected_skill')}</Button>
                                            : ''
                                        }
                                    </>
                                }
                            />
                        }
                    </Col>
                </Row>
                <Row className="card p-3 pt-1 mb-0">
                    <h5>{t('hr:add_skills_for_staff')}</h5>
                    <Form preserve={false} ref={this.formSkillRef}>
                        <Row>
                            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                <Form.Item label={null} name="skill_ids">
                                    <Dropdown datas={this.state.listSkill} mode={'multiple'}
                                        value={this.state.skillsDropdownSelected}
                                        onSearch={this.onSearchSkill.bind(this)} defaultOption="-- Type to search skill --" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                {
                                    checkPermission('hr-staff-detail-skill-create') ?
                                        <Button type='primary' onClick={() => {
                                            let { skill_ids } = this.formSkillRef.current.getFieldsValue();
                                            return this.onCreateStaffSkill(skill_ids);
                                        }} ><FontAwesomeIcon icon={faPlus} />&nbsp;{t('hr:add_selected_skill')}</Button>
                                    : ''
                                }
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <Modal forceRender title={t('hr:update_skill_for_staff')}
                    open={this.state.visible}
                    cancelText={<FontAwesomeIcon icon={faTimes} />}
                    onCancel={() => this.toggleModal(false)}
                    cancelButtonProps={{ danger: true }}
                    okText={<FontAwesomeIcon icon={faCheck} />}
                    onOk={this.handleFormSubmit.bind(this)}>
                    <Form preserve={false} ref={this.formRef}>
                        <Row gutter={24}>
                            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                                <FormItem name="id" hidden >
                                    <Input />
                                </FormItem>
                                <FormItem label={t('hr:name')} name="name">
                                    <Input placeholder="Name" disabled />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                <FormItem label={t('hr:level')} name="level" hasFeedback rules={[{ required: true, message: t('hr:input_relationship') }]}>
                                    <Input placeholder="Level" />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                <FormItem label={t('hr:status')} name="status" hasFeedback rules={[{ required: true, message: t('hr:input_phone_number') }]}>
                                    <Dropdown datas={staffStatus} placeholder="Status" />
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                </Modal>

                <StaffSkillLog
                    visible={this.state.visibleLog}
                    staffSkillId={this.state.staffSkillId}
                    hiddenModal={() => this.toggleModalStaffSkillLog()}
                />
            </div>
        );
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(StaffSkill));
