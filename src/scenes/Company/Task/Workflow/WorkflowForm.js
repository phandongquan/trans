import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Row, Col, Input, Form, Divider, Checkbox, Tabs, Switch, Popconfirm  } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faBackspace, faCheck, faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import { workflowOption, configWorkflow, workflowStatus, typesTaskWorkflows, workflowOptionStaff } from '~/constants/basic';
import { detail as detailWorkflow, update as updateWorkflow, create as createWorkflow } from '~/apis/company/workflow';
import { getList as getListSkill } from '~/apis/company/skill';
import { Link } from 'react-router-dom';
import { showNotify, checkValueToDropdown, checkManager, checkBod, checkPermission } from '~/services/helper';
import Dropdown from '~/components/Base/Dropdown';
import WorkflowStepForm from './WorkflowStep';
import EditableTag from '~/components/Base/EditableTag';
import { MinusCircleOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import StaffDropdown from '~/components/Base/StaffDropdown';
import FormConfig from './FormConfig';
import ConditionRedirectForm from './ConditionRedirectForm';
import {getListCategory } from '~/apis/company/workflow/ConfigCategory';
import AssignStaff_new from './AssignStaff_new';
import Editor from '~/components/Base/Editor';
import FormConfigTable from './FormConfigTable';

const dateFormat = 'YYYY-MM-DD';
const timeFormat = 'HH:mm';
const { TextArea } = Input;
const { TabPane } = Tabs;

class WorkflowForm extends Component {

    /**
     *
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            failReasons: [],
            disableEditCode: false,
            workflow: {},
            datasCategory : [],
            checkPermissionEdit : true, 
        };
    }
    /**
     * @lifecycle
     */
    componentDidMount() {
        let {auth :{staff_info, profile}} = this.props
        this.getListCategory()
        /**
         * @set form default value
         */
        this.formRef.current.setFieldsValue({
            status: 1,
            option: 1
        });

        let { id } = this.props.match.params;
        if (id) {
            let xhr = detailWorkflow(id);
            xhr.then((response) => {
                if (response.status) {
                    let { workflow } = response.data;

                    let checkPermissionEdit = true;
                    this.setState({ workflow ,  checkPermissionEdit})
                    this.formRef.current.setFieldsValue({
                        name: workflow.name,
                        code: workflow.code,
                        department_id: workflow.department_id && workflow.department_id != "0" ? workflow.department_id.split(",") : [],
                        position_id: checkValueToDropdown(workflow.position_id),
                        division_id: checkValueToDropdown(workflow.division_id),
                        major_id: checkValueToDropdown(workflow.major_id),
                        status: workflow.status,
                        option_staff: workflow.option_staff,
                        staff_id: workflow.staff_id,
                        task_report_to: workflow.task_report_to,
                        note: workflow.note,
                        option: workflow.option ? Number(workflow.option) : null,
                        is_public: workflow.is_public ? true : false,
                        callback: workflow.callback , 
                        setting : workflow?.setting ? workflow?.setting : null,
                        category_id : workflow?.category_id,
                        privacy_option : workflow?.privacy_option ? true : false,
                    });

                    if(workflow.status == 2) {
                        this.setState({ disableEditCode: true })
                    }

                    if (workflow.fail_reasons) {
                        let failReasons = JSON.parse(workflow.fail_reasons);
                        if (Array.isArray(failReasons)) {
                            this.setState({ failReasons })
                        }
                    }
                }
            });
        }
    }
    async getListCategory() {
      let response = await getListCategory()
      if(response.status){
          this.setState({datasCategory : response.data})
      }else{
          showNotify('Notification' , response.message , 'error')
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
     * @event submit Form workflow
     */
    submitFormWorkflow(data) {
        const { failReasons } = this.state;
        let { t } = this.props;
        let { id } = this.props.match.params;

        let arrNameSelect = ['division_id', 'major_id', 'position_id', 'task_report_to'];
        Object.keys(data).map((key) => {
            if (arrNameSelect.includes(key) && data[key] == undefined) {
                data[key] = 0
            }
        });

        data.fail_reasons = failReasons ? JSON.stringify(failReasons) : '';
        data.department_id = data.department_id ? data.department_id.toString() : '';
        data.is_public = data.is_public ? 1 : 0;
        data.privacy_option = data.privacy_option ? 1 : 0;

        let xhr;
        let message = '';
        if (id) {
            xhr = updateWorkflow(id, data);
            message = t('workflow') + (' ') + t('hr:updated') + ('!');
        } else {
            xhr = createWorkflow(data);
            message = t('workflow') +(' ') + t('hr:created') + ('!');
        }
        xhr.then((response) => {
            if (response.status != 0) {
              // this.props.history.push("/company/workflows");
              showNotify(t('hr:notification'), message);
              if (!id) {
                this.props.history.push(`/company/workflows/${response?.data?.task?.id}/edit`);
              }
            } else {
                showNotify(t('hr:notification'), response.message, 'error');
            }
        });
    }
  submitStatus(typeStatus) {
    let { t } = this.props;
    let { id } = this.props.match.params;
    let values = this.formRef.current.getFieldsValue()
    let data = {
      name: values?.name,
      status: typeStatus, //2 approve , 1 // unapprove
    }
    let xhr = updateWorkflow(id, data);
    xhr.then((response) => {
      if (response.status != 0) {
        // this.props.history.push("/company/workflows");
        showNotify(('Notification'), t('workflow') +(' ') + t('updated') + ('!'));
      } else {
        showNotify(('Notification'), response.message, 'error');
      }
    })
  }
    /**
     * @render
     */
    render() {
        let { t, match, baseData: { departments, divisions, majors, positions } , auth :{staff_info, profile}  } = this.props;
        let { workflow } = this.state
        let id = match.params.id;
        let subTitle = '';
        if (id) {
            subTitle = this.state.workflow?.name;
        } else {
            subTitle = t('add_new') + (' ') + t('workflow');
        }
        const {created_by} = workflow;
        const isCreated = profile?.id === created_by;
        
        return (
          <div id="page_update_workflow">
            <PageHeader title={t("workflow")} subTitle={subTitle} />
            <Row>
              <Col span={24}>
                <Tabs className="card p-3">
                  <TabPane tab={t("form")} key="form">
                    <Form
                      ref={this.formRef}
                      name="upsertStaffForm"
                      className="ant-advanced-search-form pt-3"
                      layout="vertical"
                      onFinish={this.submitFormWorkflow.bind(this)}
                      onKeyPress={(e) => {
                        e.key === "Enter" && e.preventDefault();
                      }}
                    >
                      <Row gutter={12}>
                        <Col xs={24} sm={24} md={24} lg={16} xl={16}>
                          <Form.Item
                            name="name"
                            label={t("workflow_name")}
                            hasFeedback
                            rules={[
                              {
                                required: true,
                                message: t("please_input") + (' ') + t("workflow_name"),
                              },
                            ]}
                          >
                            <Input placeholder={t("workflow_name")} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                          <Form.Item name="code" label={t('control_no')}
                            hasFeedback
                            rules={[{ required: true, message: t('input_control_no') }]}
                          >
                            <Input placeholder="Code" disabled={!checkManager(staff_info.position_id) && id }/>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={12}>
                        <Col xs={24} sm={24} md={24} lg={8} xl={8} key="department">
                          <Form.Item
                            name="department_id"
                            label={t("department")}
                          >
                            <Dropdown
                              datas={departments}
                              defaultOption={t("all_department")}
                              mode="multiple"
                            />
                          </Form.Item>
                        </Col>
                        <Col sxs={24} sm={24} md={24} lg={8} xl={8} key="section">
                          <Form.Item name="division_id" label={t("section")}>
                            <Dropdown
                              datas={divisions}
                              defaultOption={t("all_division")}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={8} xl={8} key="major">
                          <Form.Item name="major_id" label={t("major")}>
                            <Dropdown
                              datas={majors}
                              defaultOption={t("all_major")}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={12}>
                        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                          <Form.Item name="position_id" label={t("position")}>
                            <Dropdown
                              datas={positions}
                              defaultOption={t("all_position")}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                          <Form.Item
                            name="option"
                            tooltip={
                             t('auto_check_finishtask')
                            }
                            label={t("option")}
                          >
                            <Dropdown
                              datas={workflowOption}
                              defaultOption={t("all_option")}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                          <Form.Item name="status" label={t('status')}>
                            <Dropdown
                              datas={workflowStatus}
                              hideDefaultOption={true}
                              disabled
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={12}>
                        <Col xs={24} sm={24} md={24} lg={10} xl={8}>
                          <Form.Item label={t("option_staff")} name="option_staff"
                            tooltip={
                              "Tùy chọn giao task cho `Phân công nhân viên thực hiện`" +
                              " hoặc Quản lý trực tiếp của nhân viên được khai báo theo dữ liệu đầu vào!"
                            }
                          >
                            <Dropdown datas={workflowOptionStaff} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={10} xl={8}>
                          <Form.Item
                            label={t("assign_staff")}
                            name="staff_id"
                          >
                            <StaffDropdown mode="multiple" defaultOption={t("assign_staff")} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={10} xl={8}>
                          <Form.Item
                            label={t("task_report_to")}
                            name="task_report_to"
                          >
                            <StaffDropdown
                              defaultOption={t("task_report_to")}
                              mode='multiple'
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={12}>
                        <Col xs={24} sm={24} md={24} lg={6} xl={5}>
                          <Form.Item name='category_id'  label={t("category")}>
                            <Dropdown datas={this.state.datasCategory} defaultOption={t('all_category')} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={4} xl={3}>
                          <Form.Item label={t("type")} name="setting">
                            <Dropdown datas={typesTaskWorkflows} defaultOption={t('all_type')} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={4} xl={3}>
                          <Form.Item label={t("public_menu")} name="is_public" valuePropName="checked">
                            <Switch />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={4} xl={3}>
                          <Form.Item label={t("privacy_option")} name="privacy_option" valuePropName="checked">
                            <Switch
                              disabled={checkPermission('hr-workflow-approve') ? false : true}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={12}>
                        <Col span={24}>
                          <Form.Item name="note" label={t("description")}>
                            <Editor 
                            path = 'workflow_form'
                            prefix = 'hr'
                            style={{ height: 200 }} />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={12}>
                        <Col span={24}>
                          <Form.Item
                            name="fail_reasons"
                            label={t("fail_reason")}
                          >
                            <EditableTag
                              values={this.state.failReasons}
                              onChange={(value) =>
                                this.setState({ failReasons: value })
                              }
                              placeholder={t("fail_reason")}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                        <Row gutter={12}>
                            <Col span={24}>
                                <Form.Item name="callback" label={t("Callback URL")}>
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>
                      <Divider className="m-0" />
                      <Row gutter={12} className="pt-3 pb-3">
                        <Col xs={4} sm={4} md={12} lg={12} xl={12} key="btn-back">
                          <Link to={`/company/workflows`}>
                            <Button
                              className='mr-2'
                              type="default"
                              icon={<FontAwesomeIcon icon={faBackspace} />}
                            >
                              {t("back")}
                            </Button>
                          </Link>
                          {
                             id ?
                              this.state.workflow?.status != 2 ?
                                (
                                  checkPermission('hr-workflow-approve') ?
                                    <Button type='primary' onClick={() => this.submitStatus(5)}>
                                      {t('archived')}
                                    </Button>
                                    : []
                                )
                                : []
                              : []
                          }
                        </Col>
                        <Col
                          xs={20} sm={20} md={12} lg={12} xl={12}
                          key="bnt-submit"
                          style={{ textAlign: "right" }}
                        >
                          {
                            this.state.workflow?.status == 2 ?
                              []
                              :
                              (checkPermission('hr-workflow-update') ?
                                <Button
                                  type="primary"
                                  icon={<FontAwesomeIcon icon={faSave} />}
                                  htmlType="submit"
                                  loading={this.state.loading}
                                >
                                  {t("save")}
                                </Button>
                                : ""
                              )
                          }
                          {
                            id ?
                              this.state.workflow?.status != 2 ?
                                <Popconfirm
                                  title={t('you_approve')}
                                  onConfirm={(e) => {
                                    this.submitStatus(2)// approve
                              }}
                              // onCancel={cancel}
                              okText="Có"
                              cancelText="Không"
                              placement="topLeft"
                              icon={<QuestionCircleOutlined />}
                          >
                            {
                                checkPermission('hr-workflow-approve') ? 
                                      <Button
                                        className='ml-2'
                                        type="primary"
                                        icon={<FontAwesomeIcon icon={faCheck} />}
                                        loading={this.state.loading}
                                      // onClick={() => this.submitStatus(2)} // approve
                                      >
                                        &nbsp;{t("approve")}
                                      </Button>
                                    : ""
                            }            
                                </Popconfirm>
                                :
                                  (this.state.checkPermissionEdit) ?
                                    <>
                                    {
                                      isCreated ?  checkPermission('hr-workflow-update') ? 
                                      <Button className='mb-2'
                                        type="primary"
                                        icon={<FontAwesomeIcon icon={faSave} />}
                                        htmlType="submit"
                                        loading={this.state.loading}
                                      >
                                        {t("save")}
                                      </Button> : null
                                      : ""
                                    }
                                      {
                                        checkPermission('hr-workflow-approve') ?  (
                                            <Popconfirm
                                          title={t('you_un_approve')}
                                          onConfirm={(e) => {
                                            this.submitStatus(1)// un approve
                                          }}
                                          // onCancel={cancel}
                                          okText="Có"
                                          cancelText="Không"
                                          placement="topLeft"
                                          icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                                        >
                                          <Button
                                            type='danger'
                                            className='ml-2'
                                            icon={<FontAwesomeIcon icon={faMinusCircle} />}
                                            loading={this.state.loading}
                                          // onClick={() => this.submitStatus(1)}
                                          >
                                            &nbsp;{t("un_approve")}
                                          </Button>
                                        </Popconfirm>
                                        ) : null
                                      }
                                    </>
                                    : []
                              : []
                          }
                        </Col>
                      </Row>
                    </Form>
                  </TabPane>
                  {id && (
                    <>
                      <TabPane tab={t("steps")} key="steps">
                        <WorkflowStepForm wfid={id} checkPermissionEdit={this.state.checkPermissionEdit} isCreated={isCreated} workflow={workflow} />
                      </TabPane>
                      <TabPane tab={t('input_data')} key="config">
                        {/* <FormConfig workflowId={id} checkPermissionEdit={this.state.checkPermissionEdit} /> */}
                        <FormConfigTable workflowId={id} checkPermissionEdit={this.state.checkPermissionEdit} refreshConstraints={() => {}}/>
                      </TabPane>
                      <TabPane tab={t("condition_redirect")} key="condition_redirect">
                        <ConditionRedirectForm wfid={id} workflow={this.state.workflow} checkPermissionEdit={this.state.checkPermissionEdit} translang= {this.props}/>
                      </TabPane>
                      <TabPane tab={t('responsible')}>
                        <AssignStaff_new workflow={this.state.workflow} checkPermissionEdit={this.state.checkPermissionEdit} translang= {this.props}/>
                      </TabPane>
                    </>
                  )}
                </Tabs>
              </Col>
            </Row>
          </div>
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
export default connect(mapStateToProps)(withTranslation()(WorkflowForm));