import React, { Component } from "react";
import { PageHeader } from "@ant-design/pro-layout";
import { Link } from "react-router-dom";
import {
	Button,
	Table,
	Row,
	Col,
	Form,
	Input,
	Space,
	InputNumber,
	Modal,
  Spin
} from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt, faPlus, faPen, faTrash } from "@fortawesome/free-solid-svg-icons";
import Dropdown from "~/components/Base/Dropdown";
import { MenuOutlined, DeleteOutlined } from "@ant-design/icons";
import { DndContext } from "@dnd-kit/core";
import {
	SortableContext,
	verticalListSortingStrategy,
	useSortable,
	arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
	insert as insertPlan,
	detailPlan,
	updateTrainingPlan,
	detailChild,
	updateDetailChild,
} from "~/apis/company/TrainingPlan";
import { showNotify, redirect, checkPermission } from "~/services/helper";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { statusApproved, statusPending, statusTrainingPlan,statusVerify,subTypeRangeUsers, typeTrainingPlan,statusInactive } from "./config";
import DeleteButton from "~/components/Base/DeleteButton";
import SkillDropdown from "~/components/Base/SkillDropdown";
import TooltipButton from "~/components/Base/TooltipButton";

const FormItem = Form.Item;
const dateFormat = "YYYY-MM-DD HH:mm";
const { TextArea } = Input;
const Rows = ({ children, ...props }) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id: props["data-row-key"],
	});
	const style = {
		...props.style,
		transform: CSS.Transform.toString(
			transform && {
				...transform,
				scaleY: 1,
			}
		),
	};
	return (
		<tr {...props} ref={setNodeRef} style={style} {...attributes}>
			{React.Children.map(children, (child) => {
				if (child.key === "sort") {
					return React.cloneElement(child, {
						children: (
							<MenuOutlined
								ref={setActivatorNodeRef}
								style={{
									touchAction: "none",
									cursor: "move",
								}}
								{...listeners}
							/>
						),
					});
				}
				return child;
			})}
		</tr>
	);
};

class TrainingPlanForm extends Component {
  /**
   *
   * @param {*} props
   */
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.state = {
      details: [],
      dataChild: {},
      visible: false,
      plan: null,
      loading: false,
    };
  }

  componentDidMount() {
    /**
     * @set form default value
     */
    this.formRef.current.setFieldsValue({
      type: 0,
      status: 0,
    });
    this.getDetailPlan();
  }

  /**
   *
   *  get details
   */
  async getDetailPlan() {
    let { id } = this.props.match.params;
    if (id) {
      let response = await detailPlan(id);
      if (response.status) {
        let { data } = response;
        data.department_id =
          data.department_id != 0 ? data.department_id : null;
        this.formRef.current.setFieldsValue(data);
        let { details } = data;
        this.setState({ details, plan: data });
      }
    }
  }

  /**
   *
   * handle add new round
   */
  onClickNewRound() {
    let { details } = this.state;
    let dataNew = {
      id: 0,
      name: null,
      priority: details.length + 1,
      during_time: null,
      departments: "",
    };

    details.push(dataNew);
    this.setState({ details });
  }

  /**
   *  handle delete round
   */
  handleDelete(index) {
    let { details } = this.state;
    details.splice(index, 1);
    this.setState(details);
  }

  /**
   *
   */
  onDragEnd({ active, over }) {
    let { details } = this.state;
    if (active?.id !== over?.id) {
      const activeIndex = details.findIndex(
        (item) => item.priority === active?.id
      );
      const overIndex = details.findIndex((item) => item.priority === over?.id);

      let detailsNew = arrayMove(details, activeIndex, overIndex);
      detailsNew.map((d, i) => {
        d["priority"] = i + 1;
      });
      this.setState({ details: detailsNew });
    }
  }

  /**
   * handle submit form
   */
  async handleSubmitForm(values) {
    const { t } = this.props;
    let { details } = this.state;
    if (!details.length) {
      showNotify(t("notification"), "Please add new round!", "error");
      return false;
    }

    let flagValidate = false;
    details.map((d, i) => {
      if (!d.during_time) {
        d[i] = 0;
      }
      if (!d.name) {
        flagValidate = true;
      }
    });

    if (flagValidate) {
      showNotify(t("notification"),  t("hr:input_title"), "error");
      return false;
    }

    let flag = false;
    details.map((d, i) => {
      if (!d.name) {
        d[i] = 0;
      }
      if (!d.during_time) {
        flag = true;
      }
    });

    if (flag) {
      showNotify(t("notification"),  t("hr:input_title"), "error");
      return false;
    }

    this.setState({ loading: true });
    values.details = details;
    let { id } = this.props.match.params;
    let response, message;
    if (id) {
      response = await updateTrainingPlan(id, values);
      message = "Training plan" + ' ' + t('update');
    } else {
      response = await insertPlan(values);
      message = "Training plan" + ' ' + t('create');
    }
    this.setState({ loading: false });
    if (response.status) {
      showNotify(t("notification"), message);
      if (id) {
        this.setState({ details: response.data?.details || [] });
      }
      return redirect(`/company/training-plan/${response.data.id}/edit`);
    } else {
      showNotify(t("notification"), response.message, "error");
    }
  }

  /**
   *
   * @param {*} event
   * @param {*} index
   * @param {*} field
   */
  setStateTitle(event, index, field) {
    let val = null;
    if (field == "name") {
      val = event.target.value;
    } else {
      val = event;
    }
    let detailNews = this.state.details;
    if (typeof detailNews[index] != "undefined") {
      detailNews[index][field] = val;
    }
    this.setState({ details: detailNews });
  }

  /**
   *  handle delete round
   */
  handleDeleteChild(index) {
    let { dataChild } = this.state;
    let arrPlanSkills = dataChild.plan_skills.length
      ? dataChild.plan_skills
      : [];
    let newArrPlanSkills = arrPlanSkills.slice();
    newArrPlanSkills.splice(index, 1);
    dataChild = {
      ...dataChild,
      plan_skills: newArrPlanSkills,
    };
    this.setState({ dataChild });
  }
  onClickNewRoundChild() {
    let { dataChild } = this.state;
    let arrPlanSkills = dataChild.plan_skills.length
      ? dataChild.plan_skills
      : [];

    let dataNew = {
      id: 0,
      skill_id: "",
      priority: arrPlanSkills.length + 1,
      during_time: null,
      sub_type: null,
      status: 1,
    };
    arrPlanSkills.push(dataNew);
    let dataChildNew = {
      ...dataChild,
      plan_skills: arrPlanSkills,
    };
    this.setState({ dataChild: dataChildNew });
  }
  /***
   *
   */

  onDragEndChild({ active, over }) {
    let { dataChild } = this.state;
    let arrPlanSkills = dataChild.plan_skills?.length
      ? dataChild.plan_skills
      : [];
    let arrPlanSkillsNew = arrPlanSkills.slice();
    if (active?.id !== over?.id) {
      const activeIndex = arrPlanSkillsNew.findIndex(
        (item) => item.priority === active?.id
      );
      const overIndex = arrPlanSkillsNew.findIndex(
        (item) => item.priority === over?.id
      );
      let arrNew = arrayMove(arrPlanSkillsNew, activeIndex, overIndex);
      arrNew.map((d, i) => {
        d["priority"] = i + 1;
      });
      dataChild = {
        ...dataChild,
        plan_skills: arrNew,
      };
      this.setState({ dataChild });
    }
  }
  setStateTitlePlanSkill(value, index, field) {
    const { t } = this.props;
    let { dataChild } = this.state;
    let arrPlanSkills = dataChild.plan_skills?.length
      ? dataChild.plan_skills
      : [];
    let newArrPlanSkills = arrPlanSkills.slice();
    if (typeof newArrPlanSkills[index] != "undefined") {
      newArrPlanSkills[index][field] = value;
    }
    dataChild = {
      ...dataChild,
      plan_skills: newArrPlanSkills,
    };
    this.setState({ dataChild });
  }
  async popupModal(data) {
    const { t } = this.props;
    let response = await detailChild(data.id);
    if (response.status) {
      this.setState({ visible: true, dataChild: response.data });
    } else {
      showNotify(t("notification"), response.message, "error");
    }
  }

  async submitModal() {
    const { t } = this.props;
    let { dataChild } = this.state;
    let arrPlanSkills = dataChild.plan_skills?.length
      ? dataChild.plan_skills
      : [];
    if (!arrPlanSkills.length) {
      showNotify(t("notification"),  t("hr:add_new_skill"), "error");
      return false;
    }
    let flags = false;
    let isEmptyDuringtime = true;
    arrPlanSkills.map((d, i) => {
      if (!d.during_time) {
        d[i] = 0;
      }
      if (d.during_time == undefined) {
        isEmptyDuringtime = false;
      }
      if (d.sub_type == undefined) {
        flags = true;
      }
      if (!d.skill_id) {
        flags = true;
      }
    });
    if (flags) {
      showNotify(
        t("notification"),
        t("hr:input_name_type"),
        "error"
      );
      return false;
    }

    let totalDuringTime = arrPlanSkills.reduce((total, item) => {
      return total + Math.round(item.during_time);
    }, 0);

    if (!isEmptyDuringtime && totalDuringTime) {
      showNotify(t("notification"), t("hr:during_time"), "error");
      return false;
    }

    if (totalDuringTime != dataChild.during_time && totalDuringTime) {
      showNotify(
        t("notification"),
        t("hr:total_time_=_round"),
        "error"
      );
      return false;
    }
    let data = {
      data: arrPlanSkills,
    };
    let response = await updateDetailChild(dataChild.id, data);
    if (response.status) {
      showNotify(t("notification"), "Success!");
      this.setState({ visible: false, dataChild: {} });
    } else {
      showNotify(t("notification"), response.message, "error");
    }
  }

  /**
   * Approve training plan
   */
  appoveTrainingPlan = (value) => {
    const { t } = this.props;
    let { id } = this.props.match.params;
    if (!id) {
      return false;
    }
    this.setState({ loading: true });
    let xhr = updateTrainingPlan(id, {
      is_approved: true,
      value,
    });

    xhr.then((res) => {
      this.setState({ loading: false });
      if (res.status) {
        showNotify(t("notification"), "Successfully");
        this.getDetailPlan();
      } else {
        showNotify(t("notification"), res.message, "error");
      }
    });
  };

  /**
   *
   * @returns
   */
  renderAction() {
    let { plan } = this.state;
    let {
    t, auth: { profile },
    } = this.props;
    let isCreated = profile.id;
    if (!plan) return false;
    switch (plan.status) {
      case statusPending:
        return [
          <>
            {checkPermission("hr-training-plan-verify") ||
            checkPermission("hr-training-plan-approve") ? (
              <Button
                className="ml-2"
                type="primary"
                loading={this.state.loading}
                onClick={() => this.appoveTrainingPlan(statusVerify)}
              >
                &nbsp;{t("hr:verify")}
              </Button>
            ) : (
              []
            )}
          </>,
        ];
      case statusVerify:
        return [
          <>
            {checkPermission("hr-training-plan-approve") ? (
              <Button
                className="ml-2"
                type="primary"
                loading={this.state.loading}
                onClick={() => this.appoveTrainingPlan(statusApproved)}
              >
                &nbsp;{t("hr:approved")}
              </Button>
            ) : (
              []
            )}
          </>,
        ];
      case statusApproved:
        return [
          <>
            {checkPermission("hr-training-plan-approve") ? (
              <Button
                className="ml-2"
                type="primary"
                loading={this.state.loading}
                onClick={() => this.appoveTrainingPlan(statusPending)}
              >
                &nbsp;{t("hr:unapproved")}
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

  submitButton() {
    const  { t} = this.props;
    const { plan } = this.state;
    if (
      (checkPermission("hr-training-plan-approve") &&
        [0, 1, 3].includes(plan?.status)) ||
      (checkPermission("hr-training-plan-verify") &&
        [0, 3].includes(plan?.status)) ||
      !plan ||
      plan?.status === 0
    ) {
      return (
        <Button type="primary" htmlType="submit">
          &nbsp;{t("hr:submit")}
        </Button>
      );
    }
    return [];
  }

  render() {
    const { t } = this.props;
    let { departments, majors, locations, positions } = this.props.baseData;
    let { details, loading, plan } = this.state;
    const columns = [
      {
        title: " ",
        key: "sort",
      },
      {
        title: t("hr:title"),
        render: (text, r, index) => {
          return (
            <Input
              value={r.name}
              onChange={(event) => this.setStateTitle(event, index, "name")}
            ></Input>
          );
        },
      },
      {
        title: t("hr:during_times_time"),
        render: (text, r, index) => {
          return (
            <InputNumber
              min={0}
              value={r.during_time}
              onChange={(event) =>
                this.setStateTitle(event, index, "during_time")
              }
            ></InputNumber>
          );
        },
        align: "center",
      },
      {
        title: t("hr:action"),
        align: "center",
        render: (text, r, index) => {
          return (
            <>
              {r.id ? (
                <TooltipButton
                  type="primary"
                  size="small"
                  icon={<FontAwesomeIcon icon={faPen} className="ml-1" />}
                  onClick={() => this.popupModal(r)}
                />
              ) : (
                []
              )}
              <Button
                danger
                className="ml-2 "
                size="small"
                icon={<FontAwesomeIcon icon={faTrashAlt} className="ml-1" />}
                onClick={() => this.handleDelete(index)}
              />
            </>
          );
        },
      },
    ];
    const columnsModal = [
      {
        title: " ",
        width: "5%",
        key: "sort",
      },
      {
        title: t("hr:name"),
        width: "50%",
        render: (t, r, i) => (
          <SkillDropdown
            value={r.skill_id}
            initial
            onChange={(value) =>
              this.setStateTitlePlanSkill(value, i, "skill_id")
            }
            paramSearch={{ status: 2 }}
          />
        ),
      },
      {
        title: t("hr:during_times_time"),
        width: "15%",
        render: (text, record, index) => (
          <InputNumber
            min={0}
            value={record.during_time}
            onChange={(value) =>
              this.setStateTitlePlanSkill(value, index, "during_time")
            }
          />
        ),
      },
      {
        title: t('hr:sub_type'),
        width: "10%",
        render: (t, r, i) => (
          <Dropdown
            value={r.sub_type}
            datas={subTypeRangeUsers}
            onChange={(value) =>
              this.setStateTitlePlanSkill(value, i, "sub_type")
            }
          />
        ),
      },
      {
        title: "PIC",
        render: (text, record, index) => (
          <Dropdown
            mode="multiple"
            value={record.major_pic}
            datas={majors}
            onChange={(value) =>
              this.setStateTitlePlanSkill(value, index, "major_pic")
            }
          />
        ),
      },

      {
        title: " ",
        width: "5%",
        render: (t, r, i) => (
          <Button
            danger
            className="ml-2"
            size="small"
            icon={<FontAwesomeIcon icon={faTrashAlt} al />}
            onClick={() => this.handleDeleteChild(i)}
          />
        ),
      },
    ];
    let arrPlanSkills = this.state.dataChild?.plan_skills?.length
      ? this.state.dataChild.plan_skills
      : [];
    return (
      <div>
        <PageHeader title={t("training_plan_form")} />
        <Row className="card pl-3 pr-3 mb-3">
          <Spin spinning={loading}>
            <Form
              ref={this.formRef}
              name="detailForm"
              layout="vertical"
              className="pt-3 ant-advanced-create-form"
              onFinish={this.handleSubmitForm.bind(this)}
            >
              <Row gutter={24}>
                <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                  <Form.Item
                    name="name"
                    label={t("hr:name")}
                    rules={[
                      { required: true, message: t("hr:input_title") },
                    ]}
                    hasFeedback
                  >
                    <Input className="w-70" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                  <Form.Item name="department_id" label={t("hr:dept")}>
                    <Dropdown
                      datas={departments}
                      defaultOption={t("hr:all_department")}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                  <Form.Item name="position_id" label={t("hr:position")}>
                    <Dropdown
                      datas={positions}
                      defaultOption={t("hr:all_position")}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                  <Form.Item name="major_id" label={t("hr:major")}>
                    <Dropdown
                      defaultOption={t("hr:all_major")}
                      datas={majors}
                      mode="multiple"
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                  <Form.Item name="location_id" label={t("hr:location")}>
                    <Dropdown
                      defaultOption={t("hr:all_location")}
                      datas={locations}
                      mode="multiple"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                  <FormItem name="type" label={t("hr:range_user")}>
                    <Dropdown
                      datas={typeTrainingPlan}
                      defaultOption="-- All Ranger User --"
                      disabled
                    />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                  <FormItem name="status" label={t("hr:status")}>
                    <Dropdown
                      datas={statusTrainingPlan}
                      defaultOption={t("hr:all_status")}
                      disabled
                    />
                  </FormItem>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item name="note" label={t("hr:note")}>
                    <TextArea />
                  </Form.Item>
                </Col>
              </Row>
              <Space>
                <Button
                  type="link"
                  style={{ color: "#135200" }}
                  onClick={() => this.onClickNewRound()}
                >
                  <strong> {t('add_new_round')} + </strong>
                </Button>
              </Space>
              <DndContext
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={(event) => this.onDragEnd(event)}
              >
                <SortableContext
                  items={details.map((i) => i.priority)}
                  strategy={verticalListSortingStrategy}
                >
                  <Table
                    components={{
                      body: {
                        row: Rows,
                      },
                    }}
                    dataSource={[...details]}
                    columns={columns}
                    pagination={false}
                    rowKey="priority"
                  ></Table>
                </SortableContext>
              </DndContext>
              <Row className="mt-3 mb-2">
                <Col span={12}>
                  <Link to={`/company/training-plan`}>
                    <Button className=" mr-5" htmlType="back">
                      {t("hr:back")}
                    </Button>
                  </Link>
                </Col>
                <Col span={12}>
                  <div className="float-right">
                    {/* {!plan || plan.status != statusInactive ? (
                      <Button type="primary" htmlType="submit">
                        {"Submit"}
                      </Button>
                    ) : null} */}
                    {this.submitButton()}
                    {this.renderAction()}
                  </div>
                </Col>
              </Row>
            </Form>
          </Spin>
        </Row>
        <Modal
          open={this.state.visible}
          title={t("hr:round_title") + ":" + this.state.dataChild.name}
          onCancel={() => this.setState({ visible: false })}
          onOk={() => this.submitModal()}
          okText={t("submit")}
          cancelText={t("cancel")}
          width={"90%"}
        >
          <DndContext
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={(event) => this.onDragEndChild(event)}
          >
            <SortableContext
              items={arrPlanSkills?.map((i) => i.priority)}
              strategy={verticalListSortingStrategy}
            >
              <Table
                components={{
                  body: {
                    row: Rows,
                  },
                }}
                dataSource={[...arrPlanSkills]}
                columns={columnsModal}
                pagination={false}
                rowKey="priority"
              ></Table>
            </SortableContext>
          </DndContext>
          <div style={{ height: "35px" }}>
            <Button
              type="link"
              style={{ color: "#135200" }}
              className="float-right"
              onClick={() => this.onClickNewRoundChild()}
            >
              <strong> {t("hr:add_skill")} + </strong>
            </Button>
          </div>
        </Modal>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
	return {
		auth: state.auth.info,
		baseData: state.baseData,
	};
};

export default connect(mapStateToProps)(withTranslation()(TrainingPlanForm));
