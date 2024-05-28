import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Row, Col, Input, Form, Divider, Table, InputNumber, Switch, Modal, DatePicker, Avatar,  Collapse, Space } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faBackspace, faPlus, faMinus, faSearch, faFileExport, faFileImport } from '@fortawesome/free-solid-svg-icons';
import { dateFormat, skillStatus, skillType, typeFileExcel } from '~/constants/basic';
import { detail as detailSkill, getList as getParentSkill, update as updateSkill, create as createSkill, updateCostConfig, upraisePushNotify } from '~/apis/company/skill';
import { getDocument as getDocumentBySkill } from '~/apis/company/document';
import { searchForDropdown , searchForDropdownSkill } from '~/apis/company/staffSearchDropDown';
import { Link } from 'react-router-dom';
import { convertToFormData, showNotify, timeFormatStandard, showInfoStaff, exportToXLS, checkAssistantManager, checkAssistantManagerHigher, getThumbnailHR, checkPermission, checkBod, convertToFormDataV2 } from '~/services/helper';
import Tab from '~/components/Base/Tab';
import Dropdown from '~/components/Base/Dropdown';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import tabConfig from './config/tab';
import { MinusCircleOutlined, PlusOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { screenResponsive, typeRangeUsers, subTypeRangeUsers } from '~/constants/basic';
import TextArea from 'antd/lib/input/TextArea';
import Upload from '~/components/Base/Upload';
import dayjs from 'dayjs';
import { formatHeader ,formatData } from './config/exportModalSkillRequest';
import SkillDropdown from '~/components/Base/SkillDropdown';
import StaffDropdown from '~/components/Base/StaffDropdown';
import ModalSkillRequest from '~/components/Company/Skill/ModalSkillRequest';

const valuesLevel = {
    1: 1,
    2: 2
}
class SkillFrom extends Component {
  /**
   *
   */
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.formCostConfigRef = React.createRef();
    this.formModalRef = React.createRef();
    this.formFilterStaff = React.createRef();
    this.state = {
      loading: false,
      description: "",
      parentSkill: [],
      documentList: [],
      visible: false,
      data: {},
      rangeUser: null,
      dataRangeUsers: [],
      selectedRowKeys: [],
      deadline: null,
      sub_type: null,
      paramSearchSkill: {},
      // file: "",
      // loadingExport: false,
      paramSearchSkill: {},
      // approvedBy: null,
      // parentId: null,
      // status: null,
      // offsetStaff:  0 ,
      // limitStaff : 50,
      // totalStaff: 0,
      // staffTypes : {},
      // typeAllMultipleStaffs : null ,
      // visibleViewsStaff : false ,
      // AllStaffSelected : []
    };
  }
  /**
   * @lifecycle
   */
  componentDidMount() {
    /**
     * @set form default value
     */
    this.formRef.current.setFieldsValue({
      staus: 1,
      type: 0,
    });

    let { id } = this.props.match.params;
    if (id) {
      this.getSkillDetail(id);
    } else {
      this.formRef.current.setFieldsValue({
        status: 1,
      });
    }
  }

  /**
   * Get skill detail
   * @param {*} id
   */
  async getSkillDetail(id) {
    let response = await detailSkill(id);

    if (response.status) {
      let skill = response.data;
      this.setState({
        status: skill.status,
        parentId: skill.parent_id,
        approvedBy: skill.approved_by,
        description: skill.description,
        documentList: skill.documents ? skill.documents : [],
        paramSearchSkill: {
          department_id: skill.department_id || null,
          major_id:
            skill.major_id.length &&
            (!skill.major_id.includes("0") || !skill.major_id.includes(""))
              ? skill.major_id
              : null,
        },
      });

      let formData = {};
      Object.keys(skill).map((key) => {
        formData[key] = skill[key] ? skill[key] : null;
        if (key == "type") {
          formData[key] = String(skill[key]);
        }
        if (key == "major_id") {
          formData[key] =
            skill[key].length &&
            (!skill[key].includes("0") || !skill[key].includes(""))
              ? skill[key]
              : null;
        }
      });
      this.formRef.current.setFieldsValue(formData);
      this.formCostConfigRef.current.setFieldsValue({
        cost_configs: skill.cost_configs ? skill.cost_configs : [],
      });
      this.setState({ data: skill });
    }
  }
  async updateSkillStatus(status) {
    const { t } = this.props;
    this.setState({ loading: true });
    let { id } = this.props.match.params;
    let value = this.formRef.current.getFieldsValue();
    let data = { code: value.code, status: status, name: value.name };
    let response = await updateSkill(id, data);
    if (response.status) {
      showNotify(t("hr:notification"), response.message);
      this.getSkillDetail(id);
      this.setState({ loading: false });
    } else {
      showNotify(t("hr:notification"), response.message, "error");
      this.setState({ loading: false });
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
  };

  /**
   * @event submitForm
   */
  submitForm(values) {
    let { t } = this.props;
    let data = {
      description: this.state.description,
    };

    let keyDropdown = [
      "parent_id",
      "department_id",
      "division_id",
      "major_id",
      "position_id",
      "location_id",
      "priority",
      'staff_id'
    ];
    keyDropdown.map((key) => {
      values[key] = typeof values[key] != "undefined" ? values[key] : 0;
    });

    data = { ...data, ...values };
    let { id } = this.props.match.params;
    let xhr;
    let message = "";
    if (id) {
      xhr = updateSkill(id, data);
      message = t("hr:updated");
    } else {
      xhr = createSkill(data);
      message = t("hr:created!");
    }
    xhr.then((response) => {
      if (response.status != 0) {
        showNotify(t("hr:notification"), message);
        let newData = this.state.data
        newData.major_id = values.major_id
        this.setState({ data: newData });
        if (!id) {
          let idCreated = response.data.skill.id;
          this.props.history.push(`/company/skill/${idCreated}/edit`);
        }
      } else {
        showNotify(t("hr:notification"), response.message, "error");
      }
    });
  }
  async submitCostConfig(datasCostConfig) {
    let datas = datasCostConfig.cost_configs;
    let { id } = this.props.match.params;
    let formData = new FormData();
    let response;
    // let checkValuesAllConfig = true
    if (datas.length) {
      datas.map((v, index) => {
        // if (!v.department_id && !v.major_id && !v.position_id) {
        //     checkValuesAllConfig = false
        // } else {
        // formData.append(`cost_configs[${index}][department_id]`, v.department_id ? v.department_id : 0);
        formData.append(
          `cost_configs[${index}][major_id]`,
          v.major_id ? v.major_id : 0
        );
        // formData.append(`cost_configs[${index}][position_id]`, v.position_id ? v.position_id : 0);
        formData.append(`cost_configs[${index}][level]`, v.level);
        formData.append(`cost_configs[${index}][cost]`, v.cost);
        formData.append(`cost_configs[${index}][score]`, v.score);
        // }
      });
      formData.append("_method", "PUT");
      // if (checkValuesAllConfig) {
      response = await updateCostConfig(id, formData);
      // } else {
      //     showNotify('Notification', 'Bạn phải chọn department , major hoặc position !', 'error')
      //     return false;
      // }
    } else {
      formData.append(`cost_configs`, {});
      formData.append("_method", "PUT");
      response = await updateCostConfig(id, formData);
    }
    if (response?.status) {
      showNotify("hr:notification", response.message);
    } else {
      showNotify("hr:notification", response?.message, "error");
    }
  }
  popupAddDeadline() {
    this.setState({ visible: true });
  }
  addConfigCostNew() {
    const dataConfigDefaults = [
      { major_id: "9", level: 1, score: 1, cost: "0.00" },
      { major_id: "74", level: 1, score: 1, cost: "0.00" },
      { major_id: "4", level: 1, score: 1, cost: "0.00" },
      { major_id: "71", level: 1, score: 1, cost: "0.00" },
      { major_id: "26", level: 1, score: 1, cost: "0.00" },
      { major_id: "11", level: 1, score: 1, cost: "0.00" },
      { major_id: "27", level: 1, score: 1, cost: "0.00" },
      { major_id: "65", level: 1, score: 1, cost: "0.00" },
    ];
    this.formCostConfigRef.current.setFieldsValue({
      cost_configs: dataConfigDefaults,
    });
    const newData = { ...this.state.data };
    newData.cost_configs = dataConfigDefaults;
    this.setState({ data: newData });
  }
  comboButtonChangeStatus() {
    const {
      auth: { staff_info, profile }, t
    } = this.props;
    switch (this.state.status) {
      case 1:
        return [
          <>
            <Button
              className="ml-2"
              type="primary"
              loading={this.state.loading}
              onClick={() => this.updateSkillStatus(5)}
            >
              &nbsp;{"Draft"}
            </Button>
            {checkPermission("hr-skill-verify") ||
            checkPermission("hr-skill-approve") ? (
              <Button
                className="ml-2"
                type="primary"
                loading={this.state.loading}
                onClick={() => this.updateSkillStatus(4)}
              >
                &nbsp;{t("hr:verify")}
              </Button>
            ) : (
              []
            )}
          </>,
        ];
      case 2:
        return [
          <>
            {checkPermission("hr-skill-approve") ? (
              <Button
                className="ml-2"
                type="primary"
                loading={this.state.loading}
                onClick={() => this.updateSkillStatus(5)}
              >
                &nbsp;{t("hr:draft")}
              </Button>
            ) : (
              []
            )}
          </>,
        ];
      case 4:
        return [
          <>
            {checkPermission("hr-skill-verify") ? (
              <Button
                className="ml-2"
                type="primary"
                loading={this.state.loading}
                onClick={() => this.updateSkillStatus(1)}
              >
                &nbsp;{t("hr:pending")}
              </Button>
            ) : (
              []
            )}
            {/* {console.log(this.state.parentId)}
            {this.state.parentId == 0 ? (
              <Button
                className="ml-2"
                type="primary"
                loading={this.state.loading}
                onClick={() => this.updateSkillStatus(2)}
                // disabled={checkBod(staff_info.position_id) ? false : true}
              >
                &nbsp;{"Approve"}
              </Button>
            ) : checkPermission("hr-skill-approve") ? (
              <Button
                className="ml-2"
                type="primary"
                loading={this.state.loading}
                onClick={() => this.updateSkillStatus(2)}
              >
                &nbsp;{"Approve"}
              </Button>
            ) */}
            {checkPermission("hr-skill-approve") ? (
              <Button
                className="ml-2"
                type="primary"
                loading={this.state.loading}
                onClick={() => this.updateSkillStatus(2)}
              >
                &nbsp;{t("hr:approve")}
              </Button>
            ) : (
              []
            )}
          </>,
        ];
      case 5:
        return [
          <>
            {checkPermission("hr-skill-update") ? (
              <Button
                className="ml-2"
                type="primary"
                loading={this.state.loading}
                onClick={() => this.updateSkillStatus(1)}
              >
                &nbsp;{t("hr:pending")}
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
    const { status } = this.state;
    const { t } = this.props;
    // const Cancel = (
    //     <Button
    //     className="ml-2"
    //     type="primary"
    //     loading={this.state.loading}
    //     onClick={this.enterLoading.bind(this)}
    //   >
    //     {t("Cancel")}
    //   </Button>
    // );
    // if (status === 4 || status === 5 &&  (checkPermission("hr-skill-approve") || checkPermission("hr-skill-verify")) ) {
    //   return [Cancel];
    // }

    // if (status === 1 || status === 2 || status ===  3 && checkPermission("hr-skill-approve")) {
    //   return [Cancel];
    // }

    if (
      (checkPermission("hr-skill-approve") && [1, 2, 4, 5].includes(status)) ||
      (checkPermission("hr-skill-verify") && [4, 5].includes(status)) ||
      status === 5 ||
      (checkPermission("hr-skill-update") && [1].includes(status))
    ) {
      return (
        <Button
          className="ml-2"
          type="primary"
          loading={this.state.loading}
          onClick={() => this.updateSkillStatus(3)}
        >
          {t("hr:cancel")}
        </Button>
      );
    }
    return;
  }
  
  saveButton() {
    const { t } = this.props;
    const { id } = this.props.match.params;
    const { status, loading, parentId } = this.state;
    if (
      (checkPermission("hr-skill-approve") && [1, 2, 4, 5].includes(status)) ||
      !id ||
      status === 5 ||
      // checkPermission("hr-skill-approve") ||
      (checkPermission("hr-skill-update") && status === 1) ||
      (checkPermission("hr-skill-verify") && status === 4)
    ) {
      return (
        <Button
          type="primary"
          icon={<FontAwesomeIcon icon={faSave} />}
          htmlType="submit"
          loading={loading}
          onClick={this.enterLoading.bind(this)}
        >
          &nbsp;{t("hr:save")}
        </Button>
      );
    }
    return [];
  }
  // return [];
  // }
  /**
   * @render
   */
  render() {
    let {
      t,
      match,
      baseData: { departments, divisions, majors, positions, locations },
      auth: { staff_info, profile },
    } = this.props;
    let { dataRangeUsers, selectedRowKeys, paramSearchSkill } = this.state;
    let { id } = match.params;
    let subTitle = false;
    let majorsAddNone = [{ id: 'all', name: 'All majors' }, { id: 999999999, name: "None" }, ...majors];
    if (id) {
      subTitle = t("hr:update_skill");
    } else {
      subTitle = t("hr:add_new");
    }
    const columns = [
      {
        title: "No.",
        align: "center",
        render: (r) => this.state.documentList.indexOf(r) + 1,
      },
      {
        title: t("hr:title"),
        render: (r) => (
          <Link to={`/company/document/${r.id}/edit`}>{r.title}</Link>
        ),
      },
    ];

    return (
      <div id="page_edit_kill">
        <PageHeader title={t("hr:skill")} subTitle={subTitle} />
        {id ? (
          <Row className="card p-3 mb-3 pt-0">
            <Tab tabs={tabConfig(id, this.props)} />
          </Row>
        ) : (
          []
        )}
        <Row>
          <Col xs={24} sm={24} md={24} lg={16} xl={16}>
            <div className="card p-3">
              <Form
                ref={this.formRef}
                name="upsertForm"
                className="ant-advanced-search-form "
                layout="vertical"
                onFinish={this.submitForm.bind(this)}
              >
                <Row gutter={12}>
                  <Col xs={24} sm={24} md={24} lg={12} xl={12} key="name">
                    <Form.Item
                      name="name"
                      label={t("hr:skill_name")}
                      hasFeedback
                      rules={[
                        {
                          required: true,
                          message: t("hr:input_skill_name"),
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6} xl={6} key="parent_skill">
                    <Form.Item name="parent_id" label={t("hr:parent_skill")}>
                      {/* <SkillDropdown defaultOption="-- All Parent Skill --" paramSearch={paramSearchSkill}  /> */}
                      <SkillDropdown defaultOption={t("hr:all_parent_skill")} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6} xl={6} key="code">
                    <Form.Item name="code" label={t("hr:skill_code")}>
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={12}>
                  <Col xs={24} sm={24} md={24} lg={6} xl={6} key="deparment">
                    <Form.Item name="department_id" label={t("hr:dept")}>
                      <Dropdown
                        datas={departments}
                        onSelect={(value) => {
                          this.formRef.current.setFieldsValue({
                            parent_id: null,
                          });
                          this.setState((state) => {
                            let paramState = state.paramSearchSkill;
                            paramState.department_id = value;
                            return { paramSearchSkill: paramState };
                          });
                        }}
                        defaultOption={t("hr:all_department")}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6} xl={6} key="section">
                    <Form.Item name="division_id" label={t("sec")}>
                      <Dropdown
                        datas={divisions}
                        defaultOption={t("hr:all_division")}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6} xl={6} key="status">
                    <Form.Item
                      name="status"
                      label={t("hr:status")}
                      hasFeedback
                      rules={[
                        {
                          required: true,
                          message: t("Please choose status!"),
                        },
                      ]}
                    >
                      <Dropdown
                        datas={skillStatus}
                        disabled
                        defaultOption={t("hr:all_status")}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={12}>
                  <Col xs={24} sm={24} md={24} lg={24} xl={24} key="major">
                    <Form.Item name="major_id" label={t("hr:major")}>
                      <Dropdown
                        datas={majorsAddNone}
                        onSelect={(value) => {
                          this.formRef.current.setFieldsValue({
                            parent_id: null,
                          });
                          this.setState((state) => {
                            let paramState = state.paramSearchSkill;
                            paramState.major_id = value;
                            return { paramSearchSkill: paramState };
                          });
                          if (value == "all") {
                            let arrMajors = [];
                            Object.keys(majors).map((m) =>
                              arrMajors.push(majors[m]["id"])
                            );
                            this.formRef.current.setFieldsValue({
                              major_id: arrMajors,
                            });
                            return;
                          }
                        }}
                        defaultOption={t("hr:all_major")}
                        mode="multiple"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Space direction="vertical">
                  <Collapse
                    collapsible="header"
                    defaultActiveKey={["1"]}
                    items={[
                      {
                        key: "1",
                        label:
                          "Detail",
                        children: <p>{
                   <Row>
                    <Col xs={24} sm={24} md={24} lg={6} xl={6} key="posision">
                    <Form.Item name="position_id" label={t("hr:position")}>
                      <Dropdown
                        datas={positions}
                        defaultOption={t("hr:all_position")}
                        mode="multiple"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6} xl={6} key="location">
                    <Form.Item name="location_id" label={t("hr:location")}>
                      <Dropdown
                        datas={locations}
                        defaultOption={t("hr:all_location")}
                        mode="multiple"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6} xl={6} key="staff">
                    <Form.Item name="staff_id" label={t("hr:staff")}>
                      <StaffDropdown
                        defaultOption={t("hr:all_staff")}
                        mode="multiple"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={4} xl={4} key="priority">
                    <Form.Item name="priority" label={t("hr:priority")}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={4} xl={4} key="weight">
                    <Form.Item name="score" label={t("hr:weight")}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={4} xl={4} key="sku_service">
                    <Form.Item name="sku_service" label={t("SKU Service")}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={12} md={12} lg={6} xl={6} key="type">
                    <Form.Item
                      name="type"
                      label={t("hr:type")}
                      hasFeedback
                      rules={[
                        {
                          required: true,
                          message: t("Please choose type!"),
                        },
                      ]}
                    >
                      <Dropdown
                        datas={skillType}
                        defaultOption="-- All Type --"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6} xl={6} key="cost">
                    <Form.Item name="cost" label={t("hr:cost")}>
                      <InputNumber className="w-100" min={0} />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                    <Form.Item name="kpi_code" label={t("Kpi Code")}>
                      <Input className="w-100" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                    <Form.Item
                      name="required"
                      label={t("hr:required")}
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  </Row>}</p>,
                      },
                    ]}
                  />
                </Space>
                {/* <Row gutter={12}>
                  <Col xs={24} sm={24} md={24} lg={6} xl={6} key="posision">
                    <Form.Item name="position_id" label={t("hr:position")}>
                      <Dropdown
                        datas={positions}
                        defaultOption={t("hr:all_position")}
                        mode="multiple"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6} xl={6} key="location">
                    <Form.Item name="location_id" label={t("hr:location")}>
                      <Dropdown
                        datas={locations}
                        defaultOption={t("hr:all_location")}
                        mode="multiple"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6} xl={6} key="staff">
                    <Form.Item name="staff_id" label={t("hr:staff")}>
                      <StaffDropdown
                        defaultOption={t("hr:all_staff")}
                        mode="multiple"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6} xl={6} key="location">
                    <Form.Item name="location_id" label={t("hr:location")}>
                      <Dropdown
                        datas={locations}
                        defaultOption={t("hr:all_location")}
                        mode="multiple"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6} xl={6} key="staff">
                    <Form.Item name="staff_id" label={t("hr:staff")}>
                      <StaffDropdown
                        defaultOption={t("hr:all_staff")}
                        mode="multiple"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={4} xl={4} key="priority">
                    <Form.Item name="priority" label={t("hr:priority")}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={4} xl={4} key="weight">
                    <Form.Item name="score" label={t("hr:weight")}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={4} xl={4} key="sku_service">
                    <Form.Item name="sku_service" label={t("SKU Service")}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={12} md={12} lg={6} xl={6} key="type">
                    <Form.Item
                      name="type"
                      label={t("hr:type")}
                      hasFeedback
                      rules={[
                        {
                          required: true,
                          message: t("Please choose type!"),
                        },
                      ]}
                    >
                      <Dropdown
                        datas={skillType}
                        defaultOption="-- All Type --"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={12}>
                  <Col xs={24} sm={24} md={24} lg={6} xl={6} key="cost">
                    <Form.Item name="cost" label={t("hr:cost")}>
                      <InputNumber className="w-100" min={0} />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                    <Form.Item name="kpi_code" label={t("Kpi Code")}>
                      <Input className="w-100" />
                    </Form.Item>
                  </Col>
                  <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                    <Form.Item
                      name="required"
                      label={t("hr:required")}
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col> */}
                  {/* <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                  <Form.Item name="major" label={t("Major of exam scoring ")}>
                  </Form.Item>
                  </Col> */}
                {/* </Row> */}
                {id ? (
                  <Row gutter={12}>
                    <Col span={24}>
                      <span className="ant-form-item-label">
                        {t("hr:cost_config")}
                      </span>
                    </Col>
                    <Col span={24} className="card p-2">
                      <Form
                        className="p-1"
                        ref={this.formCostConfigRef}
                        layout="vertical"
                        onFinish={this.submitCostConfig.bind(this)}
                        onKeyPress={(e) => {
                          e.key === "Enter" && e.preventDefault();
                        }}
                      >
                        <Row gutter={12}>
                          <Col span={24}>
                            <Row gutter={6}>
                              {/* <Col span={4} className='text-center'>
                                                                    <span className="text-muted">Department</span>
                                                                </Col>
                                                                <Col span={4} className='text-center'>
                                                                    <span className="text-muted">Position</span>
                                                                </Col> */}
                              <Col span={6} className="text-center">
                                <span className="text-muted">
                                  {" "}
                                  {t("hr:major")}{" "}
                                </span>
                              </Col>
                              <Col span={6} className="text-center">
                                <span className="text-muted">
                                  {t("hr:level")}
                                </span>
                              </Col>
                              <Col span={6} className="text-center">
                                <span className="text-muted">
                                  {t("hr:weight")}
                                </span>
                              </Col>
                              <Col span={6} className="text-center">
                                <span className="text-muted">
                                  {t("hr:cost")}
                                </span>
                              </Col>
                            </Row>
                          </Col>
                          <Col span={24}>
                            <Form.List
                              name="cost_configs"
                              label={t("hr:cost_config")}
                            >
                              {(fields, { add, remove }) => (
                                <>
                                  {fields.map(
                                    ({ key, name, fieldKey, ...restField }) => {
                                      let arrDatasForm = this.formCostConfigRef.current.getFieldsValue()
                                        .cost_configs;
                                      let valueCheck = arrDatasForm.find(
                                        (v, index) => index == key
                                      );
                                      return (
                                        <Row gutter={12} key={key}>
                                          {/* <Col span={4}>
                                                                                        <Form.Item
                                                                                            {...restField}
                                                                                            name={[name, "department_id"]}
                                                                                            fieldKey={[fieldKey, "department_id"]}
                                                                                        >
                                                                                            <Dropdown datas={departments} defaultOption='-- Department --' />
                                                                                        </Form.Item>
                                                                                    </Col>
                                                                                    <Col span={4}>
                                                                                        <Form.Item
                                                                                            {...restField}
                                                                                            name={[name, "position_id"]}
                                                                                            fieldKey={[fieldKey, "position_id"]}
                                                                                        >
                                                                                            <Dropdown datas={positions} defaultOption='-- Positions --' />
                                                                                        </Form.Item>
                                                                                    </Col> */}
                                          <Col span={6}>
                                            <Form.Item
                                              {...restField}
                                              name={[name, "major_id"]}
                                              fieldKey={[fieldKey, "major_id"]}
                                              rules={[
                                                {
                                                  required: true,
                                                  message: "Please input major",
                                                },
                                              ]}
                                            >
                                              <Dropdown
                                                datas={majors}
                                                defaultOption="-- Majors --"
                                              />
                                            </Form.Item>
                                          </Col>
                                          <Col span={6}>
                                            <Form.Item
                                              {...restField}
                                              name={[name, "level"]}
                                              fieldKey={[fieldKey, "level"]}
                                              // rules={[
                                              //     {
                                              //         required: true,
                                              //         message: "Please input level",
                                              //     },
                                              // ]}
                                            >
                                              {/* <InputNumber className='w-100' placeholder='Level'/> */}
                                              <Dropdown
                                                datas={valuesLevel}
                                                defaultOption="-- Level --"
                                              />
                                            </Form.Item>
                                          </Col>
                                          <Col span={6}>
                                            <Form.Item
                                              {...restField}
                                              name={[name, "score"]}
                                              fieldKey={[fieldKey, "score"]}
                                              // rules={[
                                              //     {
                                              //         required: true,
                                              //         message: "Please input Score",
                                              //     },
                                              // ]}
                                            >
                                              {/* <InputNumber className='w-100' placeholder='Level'/> */}
                                              <Input placeholder="Score" />
                                            </Form.Item>
                                          </Col>
                                          <Col span={5}>
                                            <Form.Item
                                              {...restField}
                                              name={[name, "cost"]}
                                              fieldKey={[fieldKey, "cost"]}
                                              // rules={[
                                              //     {
                                              //         required: true,
                                              //         message: "Please input cost",
                                              //     },
                                              // ]}
                                            >
                                              <InputNumber
                                                className="w-100"
                                                placeholder="Cost"
                                                min={0}
                                              />
                                            </Form.Item>
                                          </Col>
                                          <Col span={1}>
                                            <MinusCircleOutlined
                                              className="mt-2"
                                              onClick={() => {
                                                remove(name);
                                                // this.updateMassDelete(key);
                                              }}
                                            />
                                          </Col>
                                        </Row>
                                      );
                                    }
                                  )}
                                  <Form.Item>
                                    <Button
                                      className="mt-2"
                                      type="dashed"
                                      onClick={() => {
                                        if (
                                          this.state.data?.cost_configs?.length
                                        ) {
                                          add();
                                        } else {
                                          this.addConfigCostNew();
                                        }
                                      }}
                                      block
                                      icon={<PlusOutlined />}
                                    >
                                      {t("hr:add_cost")}
                                    </Button>
                                  </Form.Item>
                                </>
                              )}
                            </Form.List>
                          </Col>
                        </Row>
                        <Divider className="m-0" />
                        <Row gutter={12} className="pt-3 pb-3">
                          <Col
                            span={24}
                            key="bnt-submit"
                            style={{ textAlign: "right" }}
                          >
                            {checkPermission("hr-skill-update") ? (
                              <Button
                                type="primary"
                                icon={<FontAwesomeIcon icon={faSave} />}
                                htmlType="submit"
                                loading={this.state.loading}
                              >
                                &nbsp;{t("hr:save")}
                              </Button>
                            ) : (
                              ""
                            )}
                          </Col>
                        </Row>
                      </Form>
                    </Col>
                  </Row>
                ) : (
                  []
                )}

                <Row gutter={12} className="mt-1">
                  <Col span={24} key="note">
                    <Form.Item label={t("hr:note")}>
                      <ReactQuill
                        value={this.state.description || ""}
                        onChange={(value) =>
                          this.setState({ description: value })
                        }
                        style={
                          window.innerWidth < screenResponsive
                            ? { marginBottom: "0px" }
                            : { height: "200px", marginBottom: "20px" }
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider className="m-0" />
                <Row gutter={24} className="pt-3">
                  <Col span={18} key="bnt-submit">
                    {this.saveButton()}
                    {/* {checkPermission('hr-skill-update') &&
                                            (!id ||
                                                (id &&
                                                    ((this.state.data?.status == 1) ||
                                                        (this.state.data?.status == 2 && (checkBod(staff_info.position_id) || (this.state.data?.updated_by == profile.id))))))
                                            ?
                                            <Button type="primary" icon={<FontAwesomeIcon icon={faSave} />} htmlType="submit"
                                                loading={this.state.loading}
                                                onClick={this.enterLoading.bind(this)}
                                            >
                                                &nbsp;{t('Save')}
                                            </Button>
                                            : ""
                                        } */}

                    {/* {
                                            id && checkAssistantManagerHigher(staff_info.position_id) ?
                                                <Button className='ml-2' type="primary"
                                                    loading={this.state.loading}
                                                    onClick={() => this.popupAddDeadline()}
                                                >
                                                    {t('Request Skill')}
                                                </Button>
                                                : []
                                        } */}
                    {checkPermission("hr-skill-update") &&
                    this.state.status == 2 ? (
                      <Button
                        className="ml-2"
                        type="primary"
                        loading={this.state.loading}
                        onClick={() => this.popupAddDeadline()}
                      >
                        {t("hr:request_skill")}
                      </Button>
                    ) : (
                      ""
                    )}

                    {/* {
                                            id && this.state.status == 4 ?
                                                <Button className='ml-2' type="primary"
                                                    loading={this.state.loading}
                                                    onClick={() => this.updateSkillStatus(2)}
                                                >
                                                    &nbsp;{t('Approved')}
                                                </Button>
                                            : []
                                        } */}

                    {this.comboButtonChangeStatus()}
                    {this.cancelButton()}
                  </Col>
                  <Col span={6} key="btn-back" style={{ textAlign: "right" }}>
                    <Link to={`/company/skill`}>
                      <Button
                        type="default"
                        icon={<FontAwesomeIcon icon={faBackspace} />}
                      >
                        &nbsp;{t("hr:back")}
                      </Button>
                    </Link>
                  </Col>
                </Row>
              </Form>
            </div>
          </Col>
          {id ? (
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <div
                id="box_document_page_edit_kill"
                className={
                  window.innerWidth < screenResponsive
                    ? "card mt-3 pl-3 pr-3 pb-3 table_in_block"
                    : "card ml-3 pl-3 pr-3 pb-3 table_in_block"
                }
              >
                <PageHeader title={t("hr:document")} className="pt-1 pb-0" />
                <Table
                  dataSource={
                    this.state.documentList ? this.state.documentList : []
                  }
                  columns={columns}
                  loading={this.state.loading}
                  pagination={{ pageSize: 1000, hideOnSinglePage: true }}
                  rowKey={(r) => r.id}
                />
              </div>
            </Col>
          ) : (
            []
          )}
        </Row>
        <ModalSkillRequest
          data={this.state.data}
          visible={this.state.visible}
          onCancel={() => this.setState({ visible: false })}
          enterLoading={() => this.enterLoading()}
        />
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
export default connect(mapStateToProps)(withTranslation()(SkillFrom));