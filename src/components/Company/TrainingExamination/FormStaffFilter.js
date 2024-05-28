import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Row, Table, Col, Input, Form, Modal, Tabs } from "antd";
import Dropdown from '~/components/Base/Dropdown';
import { debounce, uniqueId } from 'lodash';
import { showNotify, parseIntegertoTime } from '~/services/helper';
import { addStaffExam, detail as detailExam, getStaffBySkill as apiGetStaffBySkill } from '~/apis/company/trainingExamination';
const { TabPane } = Tabs;

const dateFormat = 'YYYY-MM-DD HH:mm';

class TrainingExaminationForm extends Component {

    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.formStaffFilter = React.createRef();
        this.state = {
            loading: false,
            loadingBtn: false,
            // staff in popup
            staffFails: [],
            staffs: [],
            haveSkills: [],
            noSkills: [],
            visible: false,
            staffPopupSelectedRowKeys: [],
        };

        this.appliedPopup = debounce(this.appliedPopup, 500);
    }


    componentDidUpdate(prevProps, prevState) {
        if (this.props.visible != prevProps.visible && this.props.visible) {
            this.getStaffBySkill();
        }
    }


    /**
     * @event submit form search staff fliter on popup
     * @param {} values 
     */
    async submitForm(values) {
        this.getStaffBySkill(values);
    }

    async getStaffBySkill(params) {
        params = {
            ...params,
            skill_id: this.props.skillId
        }

        let response = await apiGetStaffBySkill(params)
        if (response.status) {
            this.setState({
                staffFails: response.data.failed,
                staffs: response.data.rows,
                haveSkills: response.data.have_skills,
                noSkills: response.data.no_skills,
            })
        }
    }

    /**
     * @event on selected on popup staff filter
     * @param {} staffPopupSelectedRowKeys 
     */
    onSelectPopupStaffChange = staffPopupSelectedRowKeys => {
        this.setState({ staffPopupSelectedRowKeys })
    }

    /**
     * @event addStaff multiple from popup
     */
    async appliedPopup() {
        this.setState({ loadingBtn: true });
        let { t, exam } = this.props;
        let { staffPopupSelectedRowKeys, staffFails, staffs } = this.state;
        let id = this.props.examId;
        if (staffPopupSelectedRowKeys.length) {
            let values = this.props.formStaffRef.current.getFieldsValue();

            let data = {
                start_from: typeof values.start_from != 'undefined' ? values.start_from.format(dateFormat) : parseIntegertoTime(exam.start_from, dateFormat),
                staff_id: staffPopupSelectedRowKeys
            };

            let response = await addStaffExam(id, data);
            if (response.status == 1) {
                showNotify(t('Notification'), t('Staff has been added!'), 'success');
                this.setState({
                    loading: false,
                    staffFails: staffFails.filter(staff => !staffPopupSelectedRowKeys.includes(staff.staff_id)),
                    staffs: staffs.filter(staff => !staffPopupSelectedRowKeys.includes(staff.staff_id))
                })

                let xhr = detailExam(id);
                xhr.then(response => {
                    if (response.status == 1 && response.data) {
                        this.props.callback(response.data.staff);
                    }
                });
            }
        } else {
            showNotify(t('Error'), 'Please select staff!', 'error');
        }
        this.setState({ loadingBtn: false })
    }


    render() {
        let { t, baseData: { locations, departments, majors } } = this.props;

        const columnStaffPopup = [
            {
                title: t('Staff Name'),
                render: r => <> <strong>{r.code}</strong> - {r.staff_name}</>
            },
            {
                title: t('Location/Dept/Major'),
                render: r => {
                    let locationFound = locations.find(l => l.id == r.staff_loc_id);
                    let deptFound = departments.find(d => d.id == r.staff_dept_id)
                    let majorFound = majors.find(m => m.id == r.major_id)
                    return ` ${locationFound ? locationFound.name : 'NA'} / ${deptFound ? deptFound.name : 'NA'} / ${majorFound ? majorFound.name : 'NA'}`
                }
            }
        ]

        const rowSelection = {
            selectedRowKeys: this.state.staffPopupSelectedRowKeys,
            onChange: this.onSelectPopupStaffChange,
        };

        return (
            <Modal
                forceRender
                title={t('Staff filter')}
                open={this.props.visible}
                onOk={this.appliedPopup.bind(this)}
                confirmLoading={this.state.loadingBtn}
                onCancel={() => this.props.toggleModal(false)}
                width='60%'
                okText='Apply'
                cancelText='Close'
            >
                <Form
                    ref={this.formStaffFilter}
                    name="skillFilter"
                    className="ant-advanced-search-form"
                    layout="vertical"
                    onFinish={this.submitForm.bind(this)}
                >
                    <Row gutter={24}>
                        <Col span={6}>
                            <Form.Item name='keywords'>
                                <Input placeholder={t('Staff code, name')} />
                            </Form.Item>
                        </Col>
                        <Col span={5}>
                            <Form.Item name='staff_loc_id'>
                                <Dropdown datas={locations} defaultOption={t('--- All Location ---')} />
                            </Form.Item>
                        </Col>
                        <Col span={5}>
                            <Form.Item name='staff_dept_id'>
                                <Dropdown datas={departments} defaultOption={t('--- All Department ---')} />
                            </Form.Item>
                        </Col>
                        <Col span={5}>
                            <Form.Item name='major_id'>
                                <Dropdown datas={majors} defaultOption={t('--- All Major ---')} />
                            </Form.Item>
                        </Col>
                        <Col span={3}>
                            <Button type="primary"
                                style={{ marginLeft: 2 }}
                                htmlType="submit">
                                {t('Search')}
                            </Button>
                        </Col>
                    </Row>

                    <Tabs defaultActiveKey="staff">
                        <TabPane tab="Staff" key="staff">
                            <Table
                                loading={this.state.loading}
                                columns={columnStaffPopup}
                                dataSource={this.state.staffs}
                                rowKey={r => r.staff_id}
                                pagination={{ pageSize: 30, showSizeChanger: false }}
                                rowSelection={rowSelection}
                                className="mt-3"
                            />
                        </TabPane>
                        <TabPane tab="Staff Failed" key="staff_failed">
                            <Table
                                loading={this.state.loading}
                                columns={columnStaffPopup}
                                dataSource={this.state.staffFails}
                                rowKey={r => r.staff_id}
                                pagination={{ pageSize: 30, showSizeChanger: false }}
                                rowSelection={rowSelection}
                                className="mt-3"
                            />
                        </TabPane>
                        <TabPane tab="Đã có kỹ năng" key="have_skills">
                            <Table
                                loading={this.state.loading}
                                columns={columnStaffPopup}
                                dataSource={this.state.haveSkills}
                                rowKey={r => r.staff_id}
                                pagination={{ pageSize: 30, showSizeChanger: false }}
                                rowSelection={rowSelection}
                                className="mt-3"
                            />
                        </TabPane>
                        <TabPane tab="Chưa có kỹ năng" key="no_skills">
                            <Table
                                loading={this.state.loading}
                                columns={columnStaffPopup}
                                dataSource={this.state.noSkills}
                                rowKey={r => r.staff_id}
                                pagination={{ pageSize: 30, showSizeChanger: false }}
                                rowSelection={rowSelection}
                                className="mt-3"
                            />
                        </TabPane>
                    </Tabs>
                </Form>
            </Modal>
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

export default connect(mapStateToProps)(withTranslation()(TrainingExaminationForm));