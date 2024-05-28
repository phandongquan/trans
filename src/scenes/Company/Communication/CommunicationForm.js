import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Row, Col, Input, Form, Divider, Spin, TreeSelect, Select, Modal, Checkbox, Tabs } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faBackspace } from '@fortawesome/free-solid-svg-icons';
import { detail as apiDetail, update as apiUpdate, create as apiCreate, sendNotify, resetData } from '~/apis/company/communication';
import { checkPermission as checkPermissionHelper } from '~/services/helper';
import { Link } from 'react-router-dom';
import { showNotify, checkValueToDropdown, showMessage, checkSupervisorHigher, isURL } from '~/services/helper';
import Dropdown from '~/components/Base/Dropdown';
import Upload from '~/components/Base/Upload';
import { ExclamationCircleOutlined, YoutubeOutlined } from '@ant-design/icons'
import { typeExportAttachment } from './config';
import {screenResponsive} from '~/constants/basic';
const { TextArea } = Input;
const { TreeNode } = TreeSelect;
const { Option } = Select;
class TaskFrom extends Component {

    /**
     * @lifecycle
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            communication: {},
            categories: [],
            status: [],
            file: '',
            defaultFile: null
        };
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        this.getCommunication();
        this.setDeaultValueForm();
    }

    /**
     * @set form default value
     */
    setDeaultValueForm = () => {
        this.formRef.current.setFieldsValue({
            status: 1,
            is_comment: 1
        });
    }

    /**
     * @get detail communication
     */
    getCommunication = () => {
        let { id } = this.props.match.params;
        let xhr;
        if (id) {
            xhr = apiDetail(id);
        } else {
            xhr = apiDetail(0);
        }

        let arrKeys = ['major_id', 'position_id', 'location_id','category_id']

        xhr.then((response) => {
            if (response.status) {
                let { data } = response;
                this.setState({categories: data.categories, status: data.status})
                let communication = data.detail;
                if(communication) {
                    if(!isURL(communication.attachment)){
                        this.setState({
                            defaultFile: communication.attachment ? [{
                                uid: communication.id,
                                name: communication.attachment,
                                status: 'done',
                                url: communication.attachment_link
                            }] : null
                        })
                        communication.attachment = '';
                    }
                    this.setState({ communication: communication })
                    Object.keys(communication).map(key => {
                        if(key == 'department_id' || key == 'major_id'){
                            if(!communication[key]) {
                                return communication[key] = [];
                            }
                            communication[key] = String(communication[key]).split(',').map((item) => {
                                return item !== '0' ? Number(item) : item
                            })
                        }

                        if(~arrKeys.indexOf(key)) {
                            communication[key] = communication[key] == 0 ? null : communication[key];
                        }
                    })
                    this.formRef.current.setFieldsValue(communication);
                }
            }
        });
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
    submitForm(value) {
        this.setState({loading: true})
        let { t } = this.props;

        // append data of form for FormData()
        let formData = new FormData();
        let arrKeyName = ['category_id', 'position_id', 'location_id', 'division_id'];
        Object.keys(value).map((key) => {
            if(key === 'file'){
                formData.append('file', this.state.file[0])
            } else if(key == 'department_id' || key == 'major_id'){
                value[key] = (value[key] != undefined && value[key].length) ? value[key].toString()  : 0
                formData.append(key,value[key])
            } else if (arrKeyName.includes(key)){
                value[key] = value[key] === undefined || value[key] === null ? 0 : value[key];
                formData.append(key,value[key])
            } else if(key == 'is_comment') {
                formData.append(key, value[key] ? 1 : 0)
            } else {
                if(value[key] !== undefined && value[key] !== null){
                    formData.append(key,value[key])
                }
            }
        })

        let { id } = this.props.match.params;
        let xhr;
        let message = '';
        if (id) {
            formData.append('_method', 'PUT')
            xhr = apiUpdate(id, formData);
            message = t('Communication updated!');
        } else {
            xhr = apiCreate(formData);
            message = t('Communication created!');
        }
        xhr.then((response) => {
            if (response.status != 0) {
                this.setState({loading: false})
                showNotify(t('Notification'), message);
                if(!id) this.props.history.push('/company/communication')
            } else {
                showNotify(t('Notification'), response.message, 'error');
            }
        });
    }

    /**
     * @event handle when click btn change status 
     * @param {*} type 
     */
    handleChangeStatus = (type) => {
        this.setState({loading: true})
        let { t } = this.props; 
        let xhr;
        let message = t('Communication updated!');
        let { id } = this.props.match.params;

        if(type == 'un_approve' || type == 'approve') {
            let formData = new FormData();
            let value = this.formRef.current.getFieldsValue(['title'])
            formData.append('_method', 'PUT')
            formData.append('title', value.title)
            formData.append('status', type == 'un_approve' ? 0 : 1)
            xhr = apiUpdate(id, formData);
        } else if(type == 'notify') {
            let { communication } = this.state;

            if(!communication.title) {
                showNotify('The given data failed to pass validation', 'error');
                return false;
            }

            // let extData = {
            //     route: "Communication",
            //     params: {
            //         id: communication?.id,
            //         category_id: communication.category_id,
            //     }
            // }
            // let info = {
            //     id: communication?.id,
            //     category_id: communication.category_id,
            //     title: communication?.title,
            //     message: communication?.lead,
            //     position_id: communication?.position_id,
            //     major_id: communication?.major_id,
            //     location_id: communication?.location_id,
            //     department_id: String(communication?.department_id),
            //     type: 2,
            //     ext_data: JSON.stringify(extData)
            // }

            let xhr = sendNotify(communication?.id);
            xhr.then(response => {
                this.setState({loading: false});
                if(response.status) {
                    showNotify(t('Notification'), 'Send notification success!')
                }
            })
            .catch(error => {
                this.setState({loading: false});
                showNotify(t('Notification'), t('Server has error!'));
            })
            return false;
        }

        xhr.then((response) => {
            this.setState({loading: false})
            if(response.status) {
                showNotify(t('Notification'),message)
                this.getCommunication()
            } else {
                showNotify(t('Notification'), response.message, 'error');
            }
        })
    }

    /**
     * Handle click reset data
     */
    resetData = () => {
        let { id } = this.props.match.params;
        Modal.confirm({
            title: 'Do you want to reset data ?',
            icon: <ExclamationCircleOutlined />,
            content: '',
            onOk: () => {
                this.setState({ loading: true })
                let xhr = resetData(id)
                xhr.then(response => {
                    this.setState({ loading: false })
                    if(response.status) {
                        showNotify('Notification', 'Reset data success!')
                    } else {
                        showNotify('Notification', response.message, 'error');
                    }
                })
            }
          });
    }

    /**
     * Render option treeSelect Departments & Sections
     */
    renderOptionDeptSection = () => {
        let { t, baseData: { departments, divisions } } = this.props;
        let result = [];
        result.push(<TreeNode key='0' value="0" title='All Section'></TreeNode>)
        departments.map(d => {
            result.push(
                <TreeNode key={d.id} value={d.id} title={d.name}>
                    {
                        divisions.map(div => {
                            if(div.parent_id == d.id)
                                return <TreeNode key={div.id} value={div.id} title={div.name}></TreeNode>
                        })
                    }
                </TreeNode>
            )
        })
        return result;
    }

    /**
     * @render
     */
    render() {
        let { t, match, baseData: { majors, positions, locations }, checkPermission, auth: {staff_info} } = this.props;
        let { categories, status, communication, defaultFile } = this.state;
        let id = match.params.id;
        let subTitle = id ? t('Update') : t('Add new');

        // major (ISO == 64), division (HR = 115)
        // let permission = (communication.status && (checkPermission('setting-notification-push') || staff_info.major_id == 64 || staff_info.division_id == 115 ))
        let permission = communication.status && checkPermissionHelper('hr-communication-approve')
        return (
          <div>
            <PageHeader title={t("Communication")} subTitle={subTitle} />
            <Row gutter={24}>
              <Col xs={24} sm={24} md={24} lg={16} xl={16}>
                <div className='card pl-3 pr-3 mb-3'>
                <Spin spinning={this.state.loading}>
                  <Form
                    ref={this.formRef}
                    name="upsertStaffForm"
                    className="ant-advanced-search-form pt-3"
                    layout="vertical"
                    onFinish={this.submitForm.bind(this)}
                  >
                    <Row gutter={12}>
                      <Col xs={24} sm={24} md={24} lg={18} xl={18}>
                        <Form.Item
                          name="title"
                          label={t("Title")}
                          hasFeedback
                          rules={[
                            {
                              required: true,
                              message: t("Please input title"),
                            },
                          ]}
                        >
                          <Input placeholder="Task name" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={24} md={24} lg={6} xl={6} key="control_no">
                        <Form.Item
                          name="control_no"
                          label={t("Control No")}
                          hasFeedback
                          rules={[
                            {
                              required: true,
                              message: t("Please input control no"),
                            },
                          ]}
                        >
                          <Input placeholder="Control No" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={12}>
                      <Col span={24}>
                        <Form.Item
                          name="department_id"
                          label={t("Department & Section")}
                        >
                          <TreeSelect
                            multiple={true}
                            showSearch
                            style={{ width: "100%" }}
                            placeholder={t("-- Select Department & Section --")}
                            allowClear
                            treeDefaultExpandAll
                          >
                            {this.renderOptionDeptSection()}
                          </TreeSelect>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={12}>
                      <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                        <Form.Item name="category_id" label={t("Category")}>
                          <Dropdown
                            datas={categories}
                            defaultOption="-- All Categories --"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={24} md={24} lg={12} xl={12} key="major">
                        <Form.Item name="major_id" label={t("Major")}>
                          <Dropdown
                            datas={majors}
                            defaultOption="-- All Major --"
                            mode="multiple"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={12}>
                      <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                        <Form.Item name="position_id" label={t("Position")}>
                          <Dropdown
                            datas={positions}
                            defaultOption="-- All Position --"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                        <Form.Item name="location_id" label={t("Location")}>
                          <Dropdown
                            datas={locations}
                            defaultOption="-- All Location --"
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                        <Form.Item name="status" label={t("Status")}>
                          <Dropdown
                            datas={status}
                            defaultOption="-- All Status --"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={12}>
                      <Col span={24}>
                        <Form.Item name="lead" label={t("Lead")}>
                          <TextArea rows={5} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={12}>
                      <Col span={24}>
                        <Form.Item
                          name="is_comment"
                          label={t("")}
                          valuePropName="checked"
                        >
                          <Checkbox>Active Comment</Checkbox>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={12}>
                      <Col span={24}>
                        <Tabs>
                          <Tabs.TabPane tab="Attachment" key="file">
                            <Form.Item
                              name="file"
                              valuePropName="fileList"
                              extra={t(
                                "Support file Pdf, Excel, Image, Video. Maximum file size 25 MB!"
                              )}
                              className="mt-2"
                            >
                              <Upload
                                defaultFileList={defaultFile}
                                onChange={(value) =>
                                  this.setState({ file: value })
                                }
                                onRemove={(value) =>
                                  this.setState({ file: value })
                                }
                                type={typeExportAttachment}
                                size={25}
                              />
                            </Form.Item>
                          </Tabs.TabPane>
                          <Tabs.TabPane tab="Link Youtube" key="youtube">
                            <Form.Item name="attachment" className="mt-2">
                              <Input addonAfter={<YoutubeOutlined />} />
                            </Form.Item>
                          </Tabs.TabPane>
                        </Tabs>
                      </Col>
                    </Row>
                    <Divider className="m-0" />
                    <Row gutter={24} className="pt-3 pb-3">
                      <Col span={12} key="bnt-submit">
                          {
                            checkPermission('hr-communication-update') ? 
                              <Button
                                type="primary"
                                icon={<FontAwesomeIcon icon={faSave} />}
                                htmlType="submit"
                                loading={this.state.loading}
                              // onClick={this.enterLoading.bind(this)}
                              >
                                &nbsp;{t("Save")}
                              </Button>
                            : ''
                          }
                      </Col>
                      <Col
                        span={12}
                        key="btn-back"
                        style={{ textAlign: "right" }}
                      >
                        <Link to={`/company/communication`}>
                          <Button
                            type="default"
                            icon={<FontAwesomeIcon icon={faBackspace} />}
                          >
                            &nbsp;{t("Back")}
                          </Button>
                        </Link>
                      </Col>
                    </Row>
                  </Form>
                </Spin>
                </div>
              </Col>

              {id ? (
                <Col xs={24} sm={24} md={24} lg={8} xl={8} className="p">
                  <div className='card p-3'>
                  <PageHeader title={t("Information")} />
                  <Row
                    gutter={24}
                    className="p-2"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.03)" }}
                  >
                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>{t("Created")}:</Col>
                    <Col xs={24} sm={24} md={24} lg={16} xl={16}>{communication.created_at}</Col>
                  </Row>
                  <Row gutter={24} className="p-2">
                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>{t("by")}</Col>
                    <Col xs={24} sm={24} md={24} lg={16} xl={16}>
                      {communication.created_by_user &&
                        communication.created_by_user.name +
                          " #" +
                          communication.created_by_user.id}
                    </Col>
                  </Row>
                  <Row
                    gutter={24}
                    className="p-2"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.03)" }}
                  >
                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>{t("Modified")}:</Col>
                    <Col xs={24} sm={24} md={24} lg={16} xl={16}>{communication.updated_at}</Col>
                  </Row>
                  <Row gutter={24} className="p-2">
                    <Col xs={24} sm={24} md={24} lg={8} xl={8}>{t("by")}</Col>
                    <Col xs={24} sm={24} md={24} lg={16} xl={16}>
                      {communication.updated_by_user &&
                        communication.updated_by_user.name +
                          " #" +
                          communication.updated_by_user.id}
                    </Col>
                  </Row>

                  <PageHeader title={t("Actions")} />
                  <Row className="block_action_communication">
                    <Col
                      xs={24}
                      sm={24}
                      md={24}
                      lg={24}
                      xl={8}
                      className="mt-2"
                    >
                      {checkSupervisorHigher(staff_info.position_id) ||
                      staff_info.major_id == 64 ? (
                        checkPermission('hr-communication-update') ? 
                        <Button
                          loading={this.state.loading}
                          type="primary"
                          onClick={() => this.resetData()}
                        >
                          {t("Reset Data")}
                        </Button>
                        : ''
                      ) : (
                        ""
                      )}
                    </Col>
                    <Col
                      xs={24}
                      sm={24}
                      md={24}
                      lg={24}
                      xl={8}
                      className="mt-2"
                    >
                      <Button
                        loading={this.state.loading}
                        type="primary"
                        onClick={() =>
                          this.handleChangeStatus(
                            communication.status == 1 ? "un_approve" : "approve"
                          )
                        }
                      >
                        {communication.status == 1
                          ? t("Un Approve")
                          : t("Approve")}
                      </Button>
                    </Col>
                    <Col
                      xs={24}
                      sm={24}
                      md={24}
                      lg={24}
                      xl={8}
                      className="mt-2"
                    >
                      {permission ? (
                        <Button
                          loading={this.state.loading}
                          type="primary"
                          onClick={() => this.handleChangeStatus("notify")}
                        >
                          {t("Send Notify")}
                        </Button>
                      ) : (
                        []
                      )}
                    </Col>
                  </Row>
                  </div>
                </Col>
              ) : (
                []
              )}
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
export default connect(mapStateToProps)(withTranslation()(TaskFrom));