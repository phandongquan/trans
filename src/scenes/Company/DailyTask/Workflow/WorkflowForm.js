import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Form, Row, Col, Input, Button, Divider, Spin, Table } from 'antd'
import { PageHeader } from '@ant-design/pro-layout';
import { detail as apiDetail, insert as apiInsert, update as apiUpdate } from '~/apis/company/dailyTask/workflow'
import Dropdown from '~/components/Base/Dropdown'
import { skillStatus, workflowStatus, screenResponsive, checklistStatus } from '~/constants/basic'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faBackspace } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { searchForDropdown as getSkillList } from '~/apis/company/skill';
import debounce from 'lodash/debounce';
import { showNotify, checkPermission } from '~/services/helper'
import WorkflowStep from './WorkflowSteps'
import workflow from '~/apis/company/workflow';

export class WorkflowForm extends Component {
         constructor(props) {
           super(props);
           this.formRef = React.createRef();
           this.state = {
             loading: false,
             workflow: null,
             listSkill: [],
             status: null,
           };
           this.getListSkill = debounce(this.getListSkill, 500);
         }

         componentDidMount() {
           let { id } = this.props.match.params;
           if (id) {
             this.getDetailWorkflow(id);
           } else {
             this.formRef.current.setFieldsValue({
               status: 3,
             });
           }
         }

         /**
          * Get datail workflow
          * @param {*} id
          */
         getDetailWorkflow = async (id) => {
           this.setState({ loading: true });
           let response = await apiDetail(id);
           this.setState({ loading: false });
           if (response.status) {
             let { workflow } = response.data;
             let keyFormat = [
               "department_id",
               "division_id",
               "major_id",
               "position_id",
             ];
             Object.keys(workflow).map((key) => {
               if (~keyFormat.indexOf(key)) {
                 workflow[key] = workflow[key] ? workflow[key] : null;
               } else if (key == "skills") {
                 workflow[key] = workflow[key] ? workflow[key].split(",") : [];
               }
             });
             this.setState({ workflow });
             this.formRef.current.setFieldsValue(workflow);

             if (workflow.skills.length) {
               this.getListSkill({ id: workflow.skills });
             }
           }
         };

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
          * List skill for dropdown
          */
         async getListSkill(params = {}) {
           let skillResponse = await getSkillList(params);
           if (skillResponse && skillResponse.data) {
             let listSkill = skillResponse.data.results;
             this.setState({ listSkill });
           }
         }

         /**
          * Submit form workflow
          * @param {*} values
          */
         submitForm = (values) => {
            const {t} =  this.props
           this.setState({ loading: true });
           let { id } = this.props.match.params;
           let xhr;
           let message;
           if (id) {
             xhr = apiUpdate(id, values);
             message = t('hr:update_checklist');
           } else {
             xhr = apiInsert(values);
             message = t('hr:create_checklist');
           }

           xhr
             .then((response) => {
               this.setState({ loading: false });
               if (response.status) {
                 showNotify("Notify", message);
                 if (!id) {
                   this.props.history.push(
                     `/company/daily-task/workflow/${response.data.id}/edit`
                   );
                   //  this.getDetailWorkflow(response.data.id);
                 }
               } else {
                 showNotify("Notify", response.message, "error");
               }
             })
             .catch((error) => {
               this.setState({ loading: false });
               showNotify("Notify", error, "error");
             });
         };
         /**
          * Loading Button
          */
         enterLoading = () => {
           this.setState({ loading: true });
           setTimeout(() => {
             this.setState({ loading: false });
           }, 1000);
         };

         saveButton() {
           const {t} = this.props
           const { id } = this.props.match.params;
           const { workflow, loading } = this.state;
           if (
             (checkPermission("hr-daily-task-checklist-approve") && [1, 2, 3].includes(this.state.workflow?.status)) ||
             !id ||
             this.state.workflow?.status === 3 ||
             (checkPermission("hr-daily-task-checklist-verify") && this.state.workflow?.status === 1)
           ) {
             return (
               <Button
                 type="primary"
                 icon={<FontAwesomeIcon icon={faSave} />}
                 htmlType="submit"
                 loading={loading}
                 onClick={this.enterLoading.bind(this)}
               >
                {t("save")}
               </Button>
             );
           }}
         async upStatus(status) {
           this.setState({ loading: true });
           let { id } = this.props.match.params;
           let value = this.formRef.current.getFieldsValue();
           let data = { code: value.code, status: status, name: value.name };
           let response = await apiUpdate(id, data);
           if (response.status) {
             showNotify("Notification", response.message);
             this.getDetailWorkflow(id);
             this.setState({ loading: false });
           } else {
             showNotify("Notification", response.message, "error");
             this.setState({ loading: false });
           }
         }

         comboButtonChangeStatus() {
           const {
            t, auth: { staff_info, profile },
           } = this.props;
           switch (this.state.workflow?.status) {
             case 1:
               return [
                 <>
                  {
                    checkPermission("hr-daily-task-checklist-approve") ||
                    checkPermission("hr-daily-task-checklist-verify") ? (

                   <Button
                     className="ml-2"
                     type="primary"
                     loading={this.state.loading}
                     onClick={() => this.upStatus(3)}
                   >
                     {t("hr:draft")}
                   </Button>
                    ) : ([])
                   }
                   {checkPermission("hr-daily-task-checklist-approve") ? (
                     <Button
                       className="ml-2"
                       type="primary"
                       loading={this.state.loading}
                       onClick={() => this.upStatus(2)}
                     >
                       {t("hr:approved")}
                     </Button>
                   ) : (
                     []
                   )}
                  
                 </>,
               ];
             case 2:
               return [
                 <>
                   {checkPermission("hr-daily-task-checklist-approve")? (
                     <Button
                       className="ml-2"
                       type="primary"
                       loading={this.state.loading}
                       onClick={() => this.upStatus(3)}
                     >
                       {t("hr:draft")}
                     </Button>
                   ) : (
                     []
                   )}
                 </>,
               ];
             case 3:
               return [
                 <>
                   {checkPermission("hr-daily-task-checklist-approve") ||
                   checkPermission("hr-daily-task-checklist-verify") ? (
                     <Button
                       className="ml-2"
                       type="primary"
                       loading={this.state.loading}
                       onClick={() => this.upStatus(1)}
                     >
                       {t("hr:verify")}
                     </Button>
                   ) : (
                     []
                   )}
                 </>,
               ];
             default:
               return [];
           }
         }

         cancelButton() {
           const { t } = this.props;
           const { workflow } = this.state;
           if (
             (checkPermission("hr-daily-task-checklist-verify") &&
               [1, 3].includes(this.state.workflow?.status)) ||
             (checkPermission("hr-daily-task-checklist-approve") &&
               [1, 2, 3].includes(this.state.workflow?.status)) ||
             (checkPermission("hr-daily-task-checklist-update") &&
               [3].includes(this.state.workflow?.status)) 
              //  ||
              //  this.state.workflow?.status === 1
           ) {
             return (
               <Button
                 className="ml-2"
                 type="primary"
                 loading={this.state.loading}
                 onClick={() => this.upStatus(4)}
               >
                 {t("cancel")}
               </Button>
             );
           }
           //  if (
           //   this.state.workflow?.status === 1 ||
           //    (this.state.workflow?.status === 3 && checkPermission("hr-daily-task-checklist-approve")) ||
           //    checkPermission("hr-daily-task-checklist-verify")
           //  ) {
           //    return [Cancel];
           //  }

           //  if (this.state.workflow?.status === 2 && checkPermission("hr-daily-task-checklist-approve")) {
           //    return [Cancel];
           //  }
           //  return [];
         }

         render() {
           let { workflow, loading } = this.state;
           const {
            t,
             baseData: { departments, divisions, majors, positions },
             auth: { staff_info, profile },
           } = this.props;
           return (
             <>
               <PageHeader title={workflow ? workflow.name : "Create Checklist"}/>
               <Row>
                 <Col xs={24} sm={24} md={24} lg={14} xl={14} className="card p-3">
                   <Spin spinning={loading}>
                     <Form
                       layout="vertical"
                       ref={this.formRef}
                       onFinish={this.submitForm.bind(this)}
                     >
                       <Row gutter={12}>
                         <Col xs={24} sm={24} md={24} lg={18} xl={18}>
                           <Form.Item
                             name="name"
                             label={t("name")}
                             hasFeedback
                             rules={[
                               { required: true, message: t("hr:input_name") },
                             ]}
                           >
                             <Input placeholder={t("name")} />
                           </Form.Item>
                         </Col>
                         <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                           <Form.Item
                             name="code"
                             label={t('control_no')}
                             hasFeedback
                             rules={[
                               {
                                 required: true,
                                 message: t("hr:input_control_no"),
                               },
                             ]}
                           >
                             <Input placeholder={t("code")} />
                           </Form.Item>
                         </Col>
                       </Row>
                       <Row gutter={12}>
                         <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                           <Form.Item name="department_id" label={t("dept")}>
                             <Dropdown
                               datas={departments}
                               defaultOption={t("hr:all_department")}
                             />
                           </Form.Item>
                         </Col>
                         <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                           <Form.Item name="division_id" label={t("division")}>
                             <Dropdown
                               datas={divisions}
                               defaultOption={t("hr:all_division")}
                             />
                           </Form.Item>
                         </Col>
                         <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                           <Form.Item name="major_id" label={t("major")}>
                             <Dropdown
                               datas={majors}
                               defaultOption={t("hr:all_major")}
                             />
                           </Form.Item>
                         </Col>
                       </Row>
                       <Row gutter={12}>
                         <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                           <Form.Item name="position_id" label={t('position')}>
                             <Dropdown
                               datas={positions}
                               defaultOption={t('hr:all_position')}
                             />
                           </Form.Item>
                         </Col>
                         <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                           <Form.Item name="status" label={t('status')}>
                             <Dropdown
                               datas={checklistStatus}
                               disabled
                               defaultOption={t('hr:all_status')}
                             />
                           </Form.Item>
                         </Col>
                       </Row>
                       <Row gutter={12}>
                         <Col span={24}>
                           <Form.Item name="skills" label={t('skill')}>
                             <Dropdown
                               datas={this.state.listSkill}
                               defaultOption={t('hr:all_skill')}
                               onSearch={this.onSearchSkill.bind(this)}
                               mode="multiple"
                             />
                           </Form.Item>
                         </Col>
                       </Row>
                       <Row gutter={12}>
                         <Col span={24}>
                           <Form.Item name="note" label={t('note')}>
                             <Input.TextArea rows={4} />
                           </Form.Item>
                         </Col>
                       </Row>
                       <Divider className="mt-2 mb-2" />
                       <Row>
                         <Col span={18}>
                           {/* <Form.Item>
                             <Button
                               type="primary"
                               icon={<FontAwesomeIcon icon={faSave} />}
                               htmlType="submit"
                               loading={this.state.loading}
                             >
                               &nbsp; Save
                             </Button>
                           </Form.Item> */}
                           {this.saveButton()}
                           {this.comboButtonChangeStatus()}
                           {this.cancelButton()}
                         </Col>
                         <Col
                           span={6}
                           key="btn-back"
                           style={{ textAlign: "right" }}
                         >
                           <Form.Item>
                             <Link to={`/company/daily-task/workflow`}>
                               <Button
                                 type="default"
                                 icon={<FontAwesomeIcon icon={faBackspace} />}
                               >
                                 {t('back')}
                               </Button>
                             </Link>
                           </Form.Item>
                         </Col>
                       </Row>
                     </Form>
                   </Spin>
                 </Col>
                 {workflow ? (
                   <Col xs={24} sm={24} md={24} lg={10} xl={10}>
                     <div
                       className={
                         window.innerWidth < screenResponsive ? "mt-3" : "ml-2"
                       }
                     >
                       <WorkflowStep  wfId={workflow.id} translang ={this.props} />
                     </div>
                   </Col>
                 ) : (
                   ""
                 )}
               </Row>
             </>
           );
         }
       }

// const mapStateToProps = (state) => ({
//     baseData: state.baseData
// })
const mapStateToProps = (state) => {
  return {
      auth: state.auth.info,
      baseData: state.baseData
  }
}

const mapDispatchToProps = {
    
}

export default connect(mapStateToProps, mapDispatchToProps)(WorkflowForm)
