import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Row, Col, Input, Checkbox, Select, Table, Tooltip, } from "antd";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTrashAlt, faPlus } from '@fortawesome/free-solid-svg-icons';
import { configWorkflow } from '~/constants/basic';
import { showNotify } from '~/services/helper';
import Dropdown from '~/components/Base/Dropdown';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { save as apiSave, getList as apiGetList, destroy as apiDestroy, updatePriorityFormConfig } from '~/apis/company/workflowConfig';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { MenuOutlined} from "@ant-design/icons";
import { CSS } from "@dnd-kit/utilities";
import index from '~/layouts';
import { DndContext } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

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

class FormConfig extends Component {
  /**
   *
   */
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.state = {
      loading: false,
      massDelete: [],
      datas: [],
    };
  }

  componentDidMount() {
    this.getDetail();
  }

  /**
   * @lifecycle
   */
  componentDidUpdate(prevProps) {
    if (
      this.props.workflowStepId != prevProps.workflowStepId &&
      this.props.workflowStepId
    ) {
      this.getDetail();
    }
  }

  /**
   * Get detail
   */
  getDetail = () => {
    let { workflowId, workflowStepId } = this.props;
    if (workflowStepId) {
      let params = { id: workflowStepId, is_step: 1 };
      this.getWorkflowConfig(params);
    } else if (workflowId) {
      let params = { id: workflowId };
      this.getWorkflowConfig(params);
    }
  };

  /**
   * Get workflow config
   */
  getWorkflowConfig = async (params = {}) => {
    let response = await apiGetList(params);
    if (response.status) {
      let { rows } = response.data;
      this.setState({ datas: rows, loading: false });
    }
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

  /**
   * @event submit form config
   */
  submitFormWorkflow = async () => {
    this.setState({ loading: true });
    let data = {
      data: this.state.datas.slice(),
    };
    data.data.map((d) => {
      d.is_required = d.is_required == true ? 1 : 0;
      d.key = d.key.trim()
      if (this.checkTypeOptionCheckList(d.type)) {
        d.value = Array.isArray(d.value) ? d.value.toString() : "";
      } else {
        d.value = "";
      }
    });
    let { t } = this.props;
    const { massDelete } = this.state;
    try {
      if (massDelete.length) {
        let responseDelete = await apiDestroy({ id: massDelete });
      }
      if (data.data.length) {
        let response = await apiSave(data);
        let arrDataStep = response.data.rows;
        let arrDataStepPriority = new FormData();
        arrDataStep.map((d, index) =>
          arrDataStepPriority.append(`data[${d.id}]`, index + 1)
        );
        arrDataStepPriority.append("_method", "PUT");
        let responseUpdatePriority = await updatePriorityFormConfig(
          arrDataStepPriority
        );
      }
      this.getDetail();
      this.setState({ loading: false });
      showNotify(t("Notification"), t("wf_config_update"));
      this.props.refreshConstraints();
    } catch (error) {
      this.setState({ loading: false });
      showNotify(t("Notification"), t("error"), "error");
    }
  };

  /**
   * add new round
   *
   */
  onClick = () => {
    let { workflowId, workflowStepId } = this.props;
    let { datas } = this.state;
    let result = datas.slice();
    let dataStepNew = {
      key: "",
      id: 0,
      workflow_id: workflowId,
      workflow_step_id: workflowStepId,
      value: [],
      auto: 0,
      is_required: false,
      label: "",
      type: "location",
    };
    result.push(dataStepNew);
    this.setState({ datas: result });
  };

  /**
   *
   * @param {*} type
   */
  checkTypeOptionCheckList = (type) => {
    return type == "check_list" || type == "option";
  };

  setStateData(event, index, field) {
    let { datas } = this.state;
    let datasNew = datas.slice();
    const arrFieldEvent = ["key", "label"];
    const arrFieldEventCheckbox = ["auto", "is_required"];
    let val = null;
    if (arrFieldEvent.includes(field)) {
      val = event?.target?.value;
    } else if (arrFieldEventCheckbox.includes(field)) {
      val = event.target.checked;
    } else {
      val = event;
    }
    if (typeof datasNew[index] != "undefined") {
      datas[index][field] = val;
    }
    this.setState({ datas: datasNew });
  }

  /**
   * delete round
   *
   */
  handleDelete(index) {
    let { datas } = this.state;
    let result = datas.slice();
    result.splice(index, 1);
    this.setState({datas : result });
  }

  /**
   * update round
   */
  updateMassDelete = (index) => {
    const { datas } = this.state;
    if (typeof datas[index] != "undefined") {
      this.setState((state) => {
        return { massDelete: [...state.massDelete, datas[index].id] };
      });
    }
  };

  /**
   * ondragend
   */
  onDragEnd({ active, over }) {
    let { datas } = this.state;
    if (active?.id !== over?.id) {
      const activeIndex = datas.findIndex(
        (item) => datas.indexOf(item) + 1 === active?.id
      );
      const overIndex = datas.findIndex(
        (item) => datas.indexOf(item) + 1 === over?.id
      );
      let datasNew = arrayMove(datas, activeIndex, overIndex);
      datasNew.map((d, i) => {
        d["prority"] = i + 1;
      });
      this.setState({ datas: datasNew });
    }
  }

  /**
   * @render
   */
  render() {
    let { t, workflowId, workflowStepId } = this.props;
    const columns = [
      {
        title: " ",
        key: "sort",
      },
      {
        title: (
          <Tooltip className="cursor-pointer text-muted" title="Require">
            <QuestionCircleOutlined />
          </Tooltip>
        ),
        render: (t, r, i) => (
          <Checkbox
            checked={r.is_required}
            // value="is_required"
            onChange={(e) => this.setStateData(e, i, "is_required")}
          ></Checkbox>
        ),
      },
      {
        title: t("auto"),
        render: (t, r, i) => (
          <Checkbox
            checked={r.auto}
            value="auto"
            onChange={(e) => this.setStateData(e, i, "auto")}
          ></Checkbox>
        ),
      },
      {
        title: t("key"),
        width: "25%",
        render: (t, r, i) => (
          <Input
            placeholder="Key"
            onKeyDown={(event) => {
              if (/[^a-zA-Z0-9]/.test(event.key)) {
                event.preventDefault();
              }
            }}
            onChange={(e) => this.setStateData(e, i, "key")}
            disabled={r?.id ? true : false}
            value={r.key}
          />
        ),
      },
      {
        title: t("label"),
        width: "25%",
        render: (t, r, i) => (
          <Input
            value={r.label}
            placeholder="Label"
            onChange={(e) => this.setStateData(e, i, "label")}
          />
        ),
      },
      {
        title: t("type"),
        render: (t, r, i) => (
          <Dropdown
            datas={configWorkflow}
            value={r.type}
            defaultOption={"Type"}
            onChange={(v) => {
              this.setStateData(v, i, "type");
            }}
          />
        ),
      },
      {
        title: t("value"),
        width: "30%",
        render: (t, r, i) =>
          this.checkTypeOptionCheckList(r.type) ? (
            <Select
              value={r.value}
              mode="tags"
              style={{ width: "100%" }}
              placeholder="Value"
              onChange={(e) => this.setStateData(e, i, "value")}
            />
          ) : (
            ""
          ),
      },
      {
        title: t("action"),
        render: (t, r, i) => 
          <Button
            danger
            size="small"
            icon={<FontAwesomeIcon icon={faTrashAlt} />}
            onClick={() => {
              this.handleDelete(i);
              this.updateMassDelete(i);
            }}
          />
      },
    ];
    return (
      <>
        <Row>
          <Col span={24}>
            <DndContext
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={(event) => this.onDragEnd(event)}
            >
              <SortableContext
                items={this.state.datas.map((d, i) => i + 1)}
                strategy={verticalListSortingStrategy}
              >
                <Table
                  components={{
                    body: {
                      row: Rows,
                    },
                  }}
                  dataSource={[...this.state.datas]}
                  columns={columns}
                  rowKey={(r, i) => i + 1}
                  pagination={false}
                  loading={this.state.loading}
                />
              </SortableContext>
            </DndContext>
            <Button
              type="primary"
              className="mt-3"
              key="create-staff"
              icon={<FontAwesomeIcon icon={faPlus} />}
              block
              onClick={() => {
                this.onClick();
              }}
            >
              {t("add_new")}
            </Button>
          </Col>
        </Row>
        {
          <Row gutter={12} className="pt-3 pb-3">
            <Col span={24} key="bnt-submit" style={{ textAlign: "right" }}>
              <Button
                type="primary"
                icon={<FontAwesomeIcon icon={faSave} />}
                loading={this.state.loading}
                onClick={() => {
                  this.submitFormWorkflow();
                }}
              >
                {t("save")}
              </Button>
            </Col>
          </Row>
        }
        <></>
      </>
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

export default connect(mapStateToProps)(withTranslation()(FormConfig));