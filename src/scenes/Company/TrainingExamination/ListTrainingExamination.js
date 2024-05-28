import React, { Component } from 'react'
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Button, Row, Table, Col, Form, DatePicker, Menu, Modal, Dropdown as DropdownBasic } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faEye } from '@fortawesome/free-solid-svg-icons';
import './config/TrainingExaminationForm.css';
import {getListExam as getList} from '~/apis/company/trainingExamination/index'
import { levels, trainingExamStatus, trainingExamResults,screenResponsive } from '~/constants/basic';
import { Link } from 'react-router-dom';
import DeleteButton from '~/components/Base/DeleteButton';
import TooltipButton from '~/components/Base/TooltipButton';
import tabListTraining from '~/scenes/Company/config/tabListTraining';
import Tab from '~/components/Base/Tab';
import { showNotify, redirect } from '~/services/helper';
import {updateStatus as apiUpdateStatusTrainingExam , removeStaffExam} from '~/apis/company/trainingExamination';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { updateLevel as apiUpdateLevel } from '~/apis/company/staff/skill';
import { historyParams, historyReplace } from '~/services/helper'
// list skill
import { searchForDropdown as getSkillList } from '~/apis/company/skill';
import Dropdown from '~/components/Base/Dropdown';
const FormatDate = 'YYYY-MM-DD';
const { RangePicker } = DatePicker;
const { confirm } = Modal;

class ListTrainingExamination extends Component {
    /**
     *
     */
    constructor(props) {
        super(props);
        let params = historyParams();
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            loadingTableStaff: false,
            staffsThroughSkill: [],
            listStaffExam: [],
            hideSuperVisor: true,
            skills : [],
            selectedRowKeys : [],
            exam: {},
            listSkill: [], 


            limit: 25, 
            page: params.page ? Number(params.page) : 1,
            total: 0
        }
    }
    componentDidMount(){
        let params = historyParams();

        this.formRef.current.setFieldsValue(
            // date: [dayjs(dayjs().startOf('month'), FormatDate), dayjs(dayjs(), FormatDate)]
            params
        )
        let values = this.formRef.current.getFieldsValue();
        this.getListExam(values)
        this.getListSkill()
    }
    
    /**
     * get list exam
     */
    getListExam = async (params) =>{
        this.setState({loadingTableStaff : true})

        params = {
            ...params,
            limit: this.state.limit,
            offset: (this.state.page - 1) * this.state.limit,
        }

        historyReplace(params);

        // if(values?.date) {
        //     values.from_date = timeFormatStandard(values.date[0], FormatDate)
        //     values.to_date = timeFormatStandard(values.date[1], FormatDate)
        //     delete(values.date)
        // }

        let response = await getList(params);
        if (response.status) {
            let List = response.data.rows;
            this.setState({ 
                listStaffExam: List , 
                loadingTableStaff : false,
                total: response.data.total
            })
        }
    }

    /**
     * @event change page
     * 
     * @param {*} page 
     */
     onChangePage(page) {
        let values = this.formRef.current.getFieldsValue();
        this.setState({ page }, () => this.getListExam({ ...values }));
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
     * Request detail and set form value
     * @param {integer} id 
     */
    // async getDetail(id) {
    //     let response = await detailExam(id);
    //     if (response.status == 1 && response.data) {
    //         let { data } = response;
    //         let skillId = data.skill_id;

    //         this.setState({
    //             skillId,
    //             exam: data,
    //             listStaffExam: data.staff,
    //             hideSuperVisor: data.type == 2 ? false : true,
    //         }, () => this.getListSkill({ id: skillId }));

    //         if (data.staff.length) {
    //             checkStaffThroughSkill({
    //                 skill_id: skillId,
    //                 list_staff: data.staff.map(s => s.staff_id)
    //             }).then(res => res.status == 1 && this.setState({ staffsThroughSkill: res.data }))
    //         }

    //         let formData = {};
    //         Object.keys(data).map(key => {
    //             if (['start_from'].includes(key)) {
    //                 formData[key] = data[key] ? dayjs(data[key] * 1000) : null;
    //             } else {
    //                 formData[key] = data[key] ? data[key] : null;
    //             }
    //         });

    //         this.formRef.current.setFieldsValue(formData);
    //     } else {
    //         this.backToExamList('Model not found!');
    //     }
    // }
    /**
     * @event remove staff exam
     * @param {*} e 
     * @param {*} itemId 
     */
     async onDeleteStaffExam(e,r) {
        e.stopPropagation();
        let response = await removeStaffExam(r.examination_id, r.id);

        if (response.status == 1) {
            let listStaffExam = [...this.state.listStaffExam];
            /**
             * Update list staff exam
             */
            let index = listStaffExam.indexOf(listStaffExam.find(se => se.id == r.id));
            listStaffExam.splice(index, 1);
            this.setState({ listStaffExam });

            let { t } = this.props;
            showNotify(t('Notification'), t('Data has been deleted!'));
        }
    }
    /**
     * @event submit Form
     * @param {} values 
     */
    submitForm(){
        this.setState({ page: 0 })
        let values = this.formRef.current.getFieldsValue()
        this.getListExam(values)
    }
    /**
     * Update status & result when click dropdown slected table
     * @param {*} e 
     */
     updateStaffs = (field, e) => {
        this.setState({loading: true})
        let data = { id: this.state.selectedRowKeys}
        data[field] = e.key;
        let { t } = this.props;
        let xhr = apiUpdateStatusTrainingExam(data)
        xhr.then(response => {
            if (response.status) {
                showNotify(t('Notification'), t('Data has been updated!'));
                this.setState({ selectedRowKeys: [] })
                this.getListExam()
            }else {
                showNotify(t('Notification'), t('Server error!'), 'error');
            }
            this.setState({ loading: false })
        })
    }
    /**
     * Update staff_skill level
     * @param {integer} level 
     */
     updateLevel = (level) => {
        let {t} = this.props
        let { selectedRowKeys, listStaffExam  } = this.state;
        let staff_ids = [];
        let skill_id = []
        selectedRowKeys.map(id => {
            let row = listStaffExam.find(se =>  se.id == id);
            staff_ids.push(row?.staff_id);
            skill_id.push(row?.skill_id)
        })
        confirm({
            title: 'Confirm?',
            icon: <ExclamationCircleOutlined />,
            maskStyle: { background: 'rgba(0, 0, 0, 0.1)' },
            content: `Update staff list with level = ${level}?`,
            onOk: async () => {
                this.setState({ loading: true });
                let data = {
                    skill_id: skill_id,
                    staff_ids,
                    level,
                    _method: 'PUT'
                };
                let response = await apiUpdateLevel(data);

                if (response.status == 1) {
                    showNotify('Notification', 'Data has been updated!');
                    this.setState({ staffSelectedRowKeys: [] })
                    // if (skill_id) this.getDetail(skill_id);
                } else {
                    showNotify(t('Notification'), t('Server error!'), 'error');
                }
                this.setState({ loading: false })
            },
            onCancel: () => { },
        });

    }
    render() {

        let { t, baseData: { locations } } = this.props;
        let { exam, listStaffExam, selectedRowKeys } = this.state;
        const staffHasSelected = selectedRowKeys.length > 0;

        const menuDropDownStatus = (
            <Menu onClick={(e) => this.updateStaffs('status', e)} >
                { Object.keys(trainingExamStatus).map(key => <Menu.Item key={key} >{trainingExamStatus[key]}</Menu.Item>)}
            </Menu>
        );

        const menuDropDownResult = (
            <Menu onClick={(e) => this.updateStaffs('examination_result' , e)}>
                { Object.keys(trainingExamResults).map(key => <Menu.Item key={key} >{trainingExamResults[key]}</Menu.Item>)}
            </Menu>
        );

        const menuDropDownLevel = (
            <Menu onClick={(e) => this.updateLevel(e.key)}>
                { Object.keys(levels).map(key => <Menu.Item key={key} >{levels[key]}</Menu.Item>)}
            </Menu>
        );
        const columns = [
            {
                title: 'No.',
                render: r => this.state.listStaffExam.indexOf(r) + 1
            },
            {
                title: 'Skill name',
                render: r => r.skill?.name
            },
            {
                title: 'Name',
                render: (r) => {
                    let staff = r.staff, renderText = '';
                    let locationFound = locations.find(l => l.id == staff.staff_loc_id && l.name);

                    let previewIcon = (
                        <Link to={`/company/staff/${r.staff_id}/skill`} target='_blank'>
                            <FontAwesomeIcon icon={faSearch} />
                        </Link>
                    );
                    if (staff) {
                        renderText = (
                            <>
                                <div>
                                    {previewIcon} {`${staff.staff_name}`} #<small>{staff.code}</small>
                                    <small> ({locationFound && locationFound.name})</small>
                                </div>
                                {
                                    r.status == 3 ? (
                                        <>
                                            <small>{`Started at: ${r.start_at}`}</small>
                                            <br />
                                            <small>{`End at: ${r.end_at}`}</small>
                                        </>
                                    ) : []
                                }
                            </>
                        );
                    }
                    return renderText;
                },
            },
            {
                title: 'Start From',
                dataIndex: 'start_from'
            },
            {
                title: 'Status',
                render: r => typeof trainingExamStatus[r.status] !== 'undefined' ? trainingExamStatus[r.status] : ''
            },
            {
                title: 'Result',
                render: r => {
                    let returnText = '';
                    if (!r.examination_result) {
                        returnText = 'Waiting approval"';
                    } else {
                        let resultText = '';
                        if (r.examination_result == 1) {
                            resultText = 'Fail';
                        } else {
                            resultText = 'Pass';
                        }
                        if (r.examination_data) {
                            let examData = r.examination_data ? JSON.parse(r.examination_data) : {};
                            // let totalQuestion = examData?.totalQuestion || exam?.number_of_questions;
                            returnText = (
                                <>
                                    <span>{resultText}</span><br />
                                    {/* <strong>{`${examData.totalCorrectAnswer}/${totalQuestion}`}</strong> */}
                                </>
                            );
                        } else {
                            returnText = resultText;
                        }
                    }
                    return returnText;
                }
            },
            {
                title: 'Action',
                align: 'center',
                render: (r) => {
                    let btnArr = [];
                    if (r.status !== 3) {
                        btnArr.push(
                            <DeleteButton key={`delete-staff-exam-${r.id}`} onConfirm={(e) => this.onDeleteStaffExam(e, r)} />
                        );
                    } else {
                        btnArr.push(
                            <Link to={`/company/training-examination/${r.id}/history`} key="history-link" target="_blank">
                                <TooltipButton title={t('View')} type="primary" size='small' icon={<FontAwesomeIcon icon={faEye} />} />
                            </Link>
                        );
                    }
                    return btnArr;
                },
            },
        ];
        
        return (
            <>
                <PageHeader title={t('List Examination')}/>
                    <Row className="card pl-3 pr-3 mb-3">
                        <Tab tabs={tabListTraining()} />
                        <Form
                        className="pt-3"
                        ref={this.formRef}
                        name="searchForm"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical">
                            <Row gutter={12}>
                                    {/* <Col span={8}>
                                        <Form.Item name='date'>
                                            <RangePicker style={{ width: '100%' }} format={FormatDate} />
                                        </Form.Item>
                                    </Col> */}
                                    <Col xs={24} sm={24} md={24} lg={5} xl={5}>
                                        <Form.Item name="skill_id">
                                            <Dropdown datas={this.state.listSkill}
                                                onSearch={this.onSearchSkill.bind(this)} defaultOption="-- Search skill --" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={2} xl={2}>
                                        <Button type="primary" htmlType="submit">
                                            {t('Search')}
                                        </Button>
                                    </Col>
                            </Row>
                        </Form>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <div style={{ marginBottom: 16 }}>
                                <DropdownBasic.Button menu={menuDropDownStatus} disabled={!staffHasSelected}>
                                    Status
                                </DropdownBasic.Button>
                                <DropdownBasic.Button menu={menuDropDownResult} disabled={!staffHasSelected} style={{ marginLeft: 8 }}>
                                    Result
                                </DropdownBasic.Button>
                                <DropdownBasic.Button menu={menuDropDownLevel} disabled={!staffHasSelected} style={{ marginLeft: 8 }}>
                                    Level
                                </DropdownBasic.Button>
                                <span style={{ marginLeft: 8 }}>
                                    {staffHasSelected ? `Selected ${selectedRowKeys.length} items` : ''}
                                </span>
                            </div>
                        </Col>
                        <Col span={24}>
                            {window.innerWidth < screenResponsive  ? 
                                <div className='block_scroll_data_table'>
                                    <div className='main_scroll_table'> 
                                        <Table
                                           rowClassName={(r) => this.state.staffsThroughSkill.includes(r.staff_id) ? 'through-skill' : ""}
                                           pagination={{
                                               pageSize: this.state.limit,
                                               total: this.state.total,
                                               showSizeChanger: false,
                                               onChange: page => this.onChangePage(page)
                                           }}
                                           loading={this.state.loadingTableStaff}
                                           rowSelection={{
                                               selectedRowKeys: selectedRowKeys,
                                               onChange: (e) => this.setState({ selectedRowKeys: e }),
                                           }}
                                           dataSource={this.state.listStaffExam}
                                           columns={columns}
                                           rowKey={(r) => r.id}
                                        />
                                    </div>
                                </div>
                                :
                                <Table
                                    rowClassName={(r) => this.state.staffsThroughSkill.includes(r.staff_id) ? 'through-skill' : ""}
                                    pagination={{
                                        pageSize: this.state.limit,
                                        total: this.state.total,
                                        showSizeChanger: false,
                                        onChange: page => this.onChangePage(page)
                                    }}
                                    loading={this.state.loadingTableStaff}
                                    rowSelection={{
                                        selectedRowKeys: selectedRowKeys,
                                        onChange: (e) => this.setState({ selectedRowKeys: e }),
                                    }}
                                    dataSource={this.state.listStaffExam}
                                    columns={columns}
                                    rowKey={(r) => r.id}
                                />
                            }
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
export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ListTrainingExamination))
