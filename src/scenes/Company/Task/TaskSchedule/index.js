
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  getList as apiGetListTask,
  deleteTask,
  detail as apiGetDetailTask,
  getListExport
} from "~/apis/company/task/taskSchedule";
import { Button, Table, Row, Col, Form, Tag, Input, Tabs } from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import { uniqueId } from "lodash";
import Tab from "~/components/Base/Tab";
import Dropdown from "~/components/Base/Dropdown";
import StaffDropdown from "~/components/Base/StaffDropdown";
import tabList from "~/scenes/Company/config/tabListTask";
import {
  checkManager,
  checkPermission,
  showNotify,
  timeFormatStandard,
  historyParams,
  historyReplace,
  exportToXLS
} from "~/services/helper";
import {
  dateFormat,
  optionsSequences,
  scheduleStatus,
  screenResponsive,
  colorScheduleStatus,
  typeTaskSchedule,
} from "~/constants/basic";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faPlus, faFileExport } from "@fortawesome/free-solid-svg-icons";
import DeleteButton from "~/components/Base/DeleteButton";
import TaskScheduleForm from "./TaskScheduleForm";
import { formatHeaderTaskSchedule, formatDataTaskSchedule } from "./config/exportTaskSchedule";
import dayjs from 'dayjs';
import { withTranslation } from "react-i18next";

const FormItem = Form.Item;
export class TaskSchedule extends Component {                       
  /**
   *
   * @param {*} props
   */
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    let params = historyParams();
    this.state = {
      loading: false,
      datas: [],
      visible: false,
      dataTask: {},
      arrSequences: [],
      limit: 30,
      offset: params.offset ? params.offset : 0,
      total: 0,
      type : params.type ? params.type.toString() : '1' // HR
    };
  }

  componentDidMount() {
    let arrSequences = [];
    optionsSequences.map((option) =>
      arrSequences[option.value] = option.label
    );
    this.setState({ arrSequences });
    let params = historyParams();
    this.formRef.current.setFieldsValue(params);
    let values = this.formRef.current.getFieldsValue();
    params = {
      ...params,
      ...values,
    };
    this.getListTask(params);
  }

  async getListTask(params = {}) {
    this.setState({ loading: true });
    params = {
      ...params,
      isHr: 1,
      type: this.state.type,
      offset:this.state.offset,
      limit: this.state.limit
    };
    historyReplace(params);
    let response = await apiGetListTask(params);
    if (response.status) {
      this.setState({
        datas: response.data.taskSchedules,
        loading: false,
        total : response.data.total
      });
    }
  }

  /**
   * @event delete Document
   * @param {} e
   */
  confirmDelete(e, id) {
    e.stopPropagation();
    let { t } = this.props;
    let xhr = deleteTask(id);
    xhr.then((response) => {
      if (response.status) {
        showNotify(t("Notification"), t("Deleted successfully!"));
        this.getListTask();
      } else {
        showNotify("Notification", response.message, "error");
      }
    });
  }

  getDetailSchedule(param = {}) {
    let xhr = apiGetDetailTask(param?.id);
    xhr.then((response) => {
      if (response.status) {
        this.setState({ dataTask: response.data }, () =>
          this.setState({ visible: true })
        );
      } else {
        showNotify("Notification", response.message, "error");
      }
    });
  }

  submitForm = (e) => {
    this.setState({ offset : 0  }, () => {
      let values = this.formRef.current.getFieldsValue();
      //  this.getDetailSchedule(values);
      this.getListTask(values);
    });
  };

    async exportFile() {
        this.setState({ loading: true });
        let { baseData } = this.props;
        let values = this.formRef.current.getFieldsValue();
        let params = {
            ...values,
            isHr : 1,
            type: 1,
            is_export : 1,
            limit : -1
        };
        let response = await apiGetListTask(params);
        if (response.status) {
            let header = formatHeaderTaskSchedule();
            let data = formatDataTaskSchedule(response.data.taskSchedules , response.data.exportData );
            let fileName = `tasks-schedule-${dayjs().format('YYYY-MM')}`;
            let dataFormat = [...header, ...data];
            exportToXLS(fileName, dataFormat, [
                  { width: 10},
                  { width: 15 },
                  { width: 20 },
                  { width: 15 },
                  { width: 20 },
                  { width: 15 },
                  { width: 20 },
                  { width: 20 },
                  { width: 20 },
                  { width: 15 },
                  { width: 15 },
                  { width: 15 },
                  { width: 15 },
                  { width: 25 },
                  { width: 20 },
                  { width: 15 },
                  { width: 30 },
                  { width: 20 },
                  { width: 25 },
                  { width: 30 },
                  { width: 30 },
                  { width: 30 },
                  { width: 25 },
                  { width: 30 },
                  { width: 30 },
                  { width: 25 },
                  { width: 15 },
                  { width: 15 },
                  { width: 15 },
            ]);
        } else {
            showNotify('notification', response.message, 'error')
        }
        this.setState({ loading: false });
    }

  /**
   * On change page
   * @param {*} page 
   */
  onChangePage = page => {
    let values = this.formRef.current.getFieldsValue();
    this.setState({ offset: (page - 1) * this.state.limit }, () => this.getListTask({ ...values }));
  }
  render() {
    let {
      t,
      baseData: { departments, majors },
      auth: { staff_info },
    } = this.props;
    let { datas } = this.state;
    const columns = [
      {
        title: "No.",
        width: 100,
        align: "center",
        render: (r) => datas.indexOf(r) + 1,
      },
      {
        title: t("hr:task_name"),
        width: 200,
        render: (r) => r.data?.name,
      },
      {
        title: t("hr:sequence"),
        width: 200,
        render: (r) => {
          let foundIndex = optionsSequences.findIndex(
            (s) => s.value == r.sequences
          );
          return ~foundIndex != -1 ? optionsSequences[foundIndex].label : "";
        },
      },
      {
        title: t("hr:time"),
        width: 150,
        align: "center",
        render: (r) => r.time,
      },
      {
        title: t("hr:status"),
        width: 150,
        align: "center",
        sorter: (a, b) => a.status - b.status,
        render: (r) => (
          <Tag color={colorScheduleStatus[r.status]}>
            {scheduleStatus[r.status]}
          </Tag>
        ),
      },
      {
        title: t('hr:created_date'),
        width: 150,
        align: "center",
        render: (r) => timeFormatStandard(r.created_at, dateFormat),
      },
      {
        title: t('hr:update_date'),
        width: 200,
        align: "center",
        render: (r) => timeFormatStandard(r.updated_at, dateFormat),
      },
      {
        title: t("hr:type"),
        width: 200,
        render: (r) => typeTaskSchedule[r.type],
      },
      {
        title: t("hr:assign_by"),
        width: 200,
        align: "center",
        render: (r) => r.created_by_user?.name,
      },
      {
        title: t("hr:action"),
        width: 100,
        align: "center",
        render: (r) => {
          return (
            <>
              {checkPermission("hr-task-schedule-update") ? (
                <Button
                  type="primary"
                  size="small"
                  style={{ marginRight: 8 }}
                  onClick={() => this.getDetailSchedule(r)}
                  icon={<FontAwesomeIcon icon={faPen} />}
                ></Button>
              ) : (
                ""
              )}
              {/* <DeleteButton onConfirm={(e) => this.confirmDelete(e, r.id)} /> */}
            </>
          );
        },
      },
    ];
    return (
      <div>
        <PageHeader
          title={t("hr:tasks_schedule")}
          tags={
            checkPermission("hr-task-schedule-create") ? (
              <Button
                key="create-task-schedule"
                type="primary"
                icon={<FontAwesomeIcon icon={faPlus} />}
                onClick={() => this.setState({ visible: true, dataTask: {} })}
              >
                {t("hr:add_new")}
              </Button>
            ) : (
              ""
            )
          }
        />
        <Row
          className={
            window.innerWidth < screenResponsive
              ? "card pl-3 pr-3 mb-3 pb-3"
              : "card pl-3 pr-3 mb-3"
          }
        >
          {/* <Tab tabs={tabList(staff_info?.major_id,checkManager(staff_info?.position_id))}></Tab> */}
          <div id="tab_responsive">
            <div className='tab_content_mantenance_device'>
              <Tab tabs={tabList(this.props)} />
            </div>
          </div>
          <Form
            className="pt-3"
            layout="vertical"
            ref={this.formRef}
            onFinish={this.submitForm.bind(this)}
          >
            <Row gutter={12}>
            <Col xs={24} sm={24} md={24} lg={6} xl={4}>
                <FormItem name="keyword">
                  <Input 
                    placeholder={t('hr:task_name')}
                  />
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={6} xl={3}>
                <FormItem name="sequences">
                  <Dropdown 
                    datas={this.state.arrSequences}
                    defaultOption={t('hr:sequence')}
                  />
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={6} xl={3}>
                <FormItem name="status">
                  <Dropdown
                    datas={scheduleStatus}
                    defaultOption={t('hr:status')}
                  />
                </FormItem>
              </Col>
              
              <Col xs={24} sm={24} md={24} lg={6} xl={3}>
                <FormItem name="department_id">
                  <Dropdown 
                    datas={departments}
                    defaultOption={t('hr:all_department')}
                  />
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={6} xl={3}>
                <FormItem name="major_id">
                  <Dropdown 
                    datas={majors}
                    defaultOption={t('hr:all_major')}
                  />
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={6} xl={4}>
                <Button type="primary" htmlType="submit">
                  {t("hr:search")}
                </Button>
                <Button
                  type="primary"
                  className="ml-2"
                  icon={<FontAwesomeIcon icon={faFileExport} />
                  
                }
                onClick={() => this.exportFile()}
                >
                  {t("hr:export_file")}
                </Button>
              </Col>
            </Row>
          </Form>
        </Row>
        <div className="ml-2">
          <Tabs activeKey={this.state.type} onChange={v => this.setState({type : v , offset : 0 } , () => {
            let values = this.formRef.current.getFieldsValue();
            this.getListTask(values)
          })}>
            <Tabs.TabPane tab="HR" key={1} className="pt-3" >

            </Tabs.TabPane>
            <Tabs.TabPane tab="Workplace" key={0} className="pt-3" >

            </Tabs.TabPane>
          </Tabs>
        </div>  
        <Row gutter={[16, 24]}>
          <Col span={24}>
            {window.innerWidth < screenResponsive ? (
              <div className="block_scroll_data_table">
                <div className="main_scroll_table">
                  <Table
                    dataSource={this.state.datas}
                    columns={columns}
                    loading={this.state.loading}
                    pagination={{
                      pageSize: this.state.limit,
                      showSizeChanger: false,
                      onChange: page => this.onChangePage(page),
                      current: (this.state.offset / this.state.limit) + 1,
                      total: this.state.total
                  }}
                    // size={'small'}
                    rowKey={(r) => r.id}
                  />
                </div>
              </div>
            ) : (
              <Table
                dataSource={this.state.datas}
                columns={columns}
                loading={this.state.loading}
                pagination={{
                  pageSize: this.state.limit,
                  showSizeChanger: false,
                  onChange: page => this.onChangePage(page),
                  current: (this.state.offset / this.state.limit) + 1,
                  total: this.state.total
              }}
                // size={'small'}
                rowKey={(r) => r.id}
              />
            )}
          </Col>
        </Row>
        {this.state.visible ? (
          <TaskScheduleForm
            translang = {this.props}
            visible={this.state.visible}
            hidePopup={() => this.setState({ visible: false })}
            dataTask={this.state.dataTask}
            getListTask={() => this.getListTask()}
            resetData={() => this.setState({ dataTask: {} })}
          />
        ) : null}
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
const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(TaskSchedule));
