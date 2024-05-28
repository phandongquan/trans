import React, { Component } from "react";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import {
  Row,
  Col,
  Table,
  Button,
  Input,
  Form,
  Upload,
  Modal,
  Menu,
  Dropdown as DropdownAnt,
} from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import Tab from "~/components/Base/Tab";
import tabListTask from "../../config/tabListTask";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPen,
  faPaperclip,
  faEllipsisV,
  faFileExport,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { taskStatus, taskRequireOptions } from "~/constants/basic";
import {
  getListTaskSuggest as apiGetList,
  deleteTaskSuggest,
  importProjectTaskSuggest,
} from "~/apis/company/project";
import DeleteButton from "~/components/Base/DeleteButton";
import Dropdown from "~/components/Base/Dropdown";
import {
  showNotify,
  historyReplace,
  historyParams,
  exportToXLS,
  autofitColumnXLS,
  checkManager,
  exportToXLSMultipleSheet,
  checkPermission,
} from "~/services/helper";
import { ExclamationCircleOutlined } from "@ant-design/icons";

import { uniqueId } from "lodash";
import { header, formatTask } from "./config/exportTask";
import dayjs from "dayjs";
import { screenResponsive } from "~/constants/basic";
const FormItem = Form.Item;
class TaskSuggestName extends Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    let params = historyParams();
    this.state = {
      loading: false,
      groups: [],
      limit: 20,
      page: params.page ? Number(params.page) : 1,
      total: 0,

      file: null,
      fileList: [],
    };
  }
  componentDidMount() {
    let params = historyParams();
    this.formRef.current.setFieldsValue(params);
    let values = this.formRef.current.getFieldsValue();
    this.getListTaskSuggest(values);
  }
  /**
   * Get list project import
   */
  async getListTaskSuggest(params = {}) {
    this.setState({ loading: true });
    params = {
      ...params,
      page: this.state.page,
      limit: this.state.limit,
    };
    historyReplace(params);
    let response = await apiGetList(params);
    if (response.status) {
      this.setState({
        sort: "id",
        groups: response.data.rows,
        loading: false,
        total: response.data.total,
      });
    }
  }
  /**
   * @event change page
   *
   * @param {*} page
   */
  onChangePage(page) {
    let values = this.formRef.current.getFieldsValue();
    this.setState({ page }, () => this.getListTaskSuggest({ ...values }));
  }
  /**
   * @event submit form
   * @param {Object} values
   */
  submitForm = (values) => {
    this.setState({ page: 1 }, () => this.getListTaskSuggest(values));
  };
  /**
   * Event delete task suggest
   */
  onDeleteTaskSuggest = (e, id) => {
    e.stopPropagation();
    let { t } = this.props;
    let xhr = deleteTaskSuggest(id);
    xhr.then((response) => {
      if (response.status) {
        showNotify(t("Notification"), t("Deleted successfully!"));
        this.getListTaskSuggest();
      }
    });
  };
  /**
   * @event submit file import
   */
  async handleImportUpload() {
    const { file } = this.state;
    const formData = new FormData();
    formData.append("file", file);
    let xhr = await importProjectTaskSuggest(formData);
    console.log(xhr);
    if (xhr.status == 1) {
      let { t, history } = this.props;
      showNotify(t("Notification"), t("hr:import_done"), "success", 1, () =>
        history.go(0)
      );
    } else {
      let { t } = this.props;
      showNotify(t("Notification"), t("hr:import_error"), "error", 2);
    }
    return false;
  }
  /**
   * @handle before upload
   *
   * @return false will default upload to url
   * @param {BinaryType} file
   */
  beforeUpload = (file) => {
    this.onRemove(file); // just take 1 file
    this.setState((state) => ({
      fileList: [...state.fileList, file],
    }));

    this.setState({ file });
    return false;
  };
  /**
   * @event remove file
   * @param {BinaryType} file
   */
  onRemove = (file) => {
    this.setState((state) => {
      const index = state.fileList.indexOf(file);
      const newFileList = state.fileList.slice();
      newFileList.splice(index, 1);
      return {
        fileList: newFileList,
      };
    });
    this.setState({ file: null });
  };
  /**
   * Export staff
   */
  exportTaskSuggest = () => {
    this.setState({ loading: true });
    let params = this.formRef.current.getFieldsValue();
    params.limit = -1;
    params.offset = 0;

    let xhr = apiGetList(params);
    xhr.then((response) => {
      this.setState({ loading: false });
      if (response.status) {
        const taskList = response.data.rows;
        let headerExcel = [];
        Object.keys(header).map((key) => {
          headerExcel.push(header[key]);
        });

        /**
         * Take data format form header
         */
        let dataFormat = formatTask(taskList);
        let datas = [...[headerExcel], ...dataFormat];
        let fileName = `Task-list-${dayjs().format("YYYY-MM-DD")}`;
        // exportToXLS(fileName, datas, autofitColumnXLS(headerExcel));

        let dataRequireds = [["Yêu cầu kết quả công việc"]];
        taskRequireOptions.map((r) => dataRequireds.push([r.value, r.label]));

        let dataXls = {
          List: {
            datas: datas,
            autofit: [
              { width: 40 },
              { width: 20 },
              { width: 20 },
              { width: 20 },
              { width: 20 },
              { width: 50 },
              { width: 20 },
              { width: 20 },
              { width: 20 },
            ],
          },
          "Yc kq công việc": {
            datas: dataRequireds,
            autofit: [{ width: 10 }, { width: 20 }],
          },
        };
        exportToXLSMultipleSheet(fileName, dataXls);
      }
    });
  };

  /**
   * Export teamplate file
   */
  exportFileTemplate = () => {
    this.setState({ loading: true });
    let params = this.formRef.current.getFieldsValue();
    params.limit = -1;
    params.offset = 0;

    let xhr = apiGetList(params);
    xhr.then((response) => {
      this.setState({ loading: false });
      if (response.status) {
        let headerExcel = [];
        Object.keys(header).map((key) => {
          headerExcel.push(header[key]);
        });

        /**
         * Take data format form header
         */
        let datas = [...[headerExcel]];
        let fileName = `Task-list-${dayjs().format("YYYY-MM-DD")}`;
        // exportToXLS(fileName, datas, autofitColumnXLS(headerExcel));

        let dataRequireds = [["Yêu cầu kết quả công việc"]];
        let dataXls = {
          List: {
            datas: datas,
            autofit: [
              { width: 40 },
              { width: 20 },
              { width: 20 },
              { width: 20 },
              { width: 20 },
              { width: 50 },
              { width: 20 },
              { width: 20 },
              { width: 20 },
            ],
          },
          "Yc kq công việc": {
            datas: dataRequireds,
            autofit: [{ width: 10 }, { width: 20 }],
          },
        };
        exportToXLSMultipleSheet(fileName, dataXls);
      }
    });
  };

  render() {
    let {
      t,
      baseData: { departments, majors },
      auth: { staff_info },
    } = this.props;
    let { fileList } = this.state;

    const columns = [
      {
        title: t("No."),
        render: (r) => this.state.groups.indexOf(r) + 1,
      },
      {
        title: t("hr:group"),
        render: (r) => r?.group_name,
      },
      {
        title: t("hr:department"),
        render: (r) => departments.find((d) => d.id == r.department_id)?.name,
      },
      {
        title: t("hr:major"),
        render: (r) => majors.find((m) => m.id == r.major_id)?.name,
      },
      {
        title: t("Sub Major"),
        render: (r) => {
          if (r.major_id == 0) {
            return majors.find((m) => m.id == r.sub_major_id)?.name;
          } else {
            return "";
          }
        },
      },
      {
        title: t("hr:name"),
        render: (r) => (
          <div>
            <Link to={"/company/tasks/suggest/" + r.id + "/edit"}>
              {r?.name}
            </Link>{" "}
            <small>({r?.code})</small>
          </div>
        ),
      },
      {
        title: t("hr:planned_hours"),
        align: "center",
        width: 150,
        render: (r) => {
          if (r?.planned_hours == 0) {
            return "";
          } else {
            return r?.planned_hours;
          }
        },
      },
      {
        title: t("hr:cost"),
        render: (r) => r?.cost,
      },
      {
        title: t("hr:status"),
        render: (r) =>
          typeof taskStatus[r.status] !== "undefined"
            ? taskStatus[r.status]
            : "",
        align: "center",
      },
      {
        title: t("hr:action"),
        width: 150,
        align: "center",
        render: (r) => (
          <div>
            {checkPermission("hr-task-suggest-update") ? (
              <Link to={"/company/tasks/suggest/" + r.id + "/edit"}>
                <Button
                  type="primary"
                  size="small"
                  icon={<FontAwesomeIcon icon={faPen} />}
                  style={{ marginRight: 8 }}
                ></Button>
              </Link>
            ) : (
              ""
            )}
            {checkPermission("hr-task-suggest-delete") ? (
              <DeleteButton
                onConfirm={(e) => this.onDeleteTaskSuggest(e, r.id)}
              />
            ) : (
              ""
            )}
          </div>
        ),
      },
    ];
    const itemsAction = ({ key }) => {
      if (key == "1") {
        this.exportTaskSuggest();
      } else if (key == "3") {
        this.exportFileTemplate();
      }
    };

    const items = [
      {
        key: "1",
        label: checkPermission("hr-task-suggest-export") ? (
          <Button
            key="export-staff"
            type="text"
            size="small"
            icon={<FontAwesomeIcon icon={faFileExport} />}
          >
            {t("hr:export_file")}
          </Button>
        ) : (
          ""
        ),
      },
      {
        key: "2",
        label: checkPermission("hr-task-suggest-import") ? (
          <Upload
            key="import-upload"
            accept=".csv, .xls, .xlsx"
            onChange={() =>
              Modal.confirm({
                title: t("hr:confirm"),
                icon: <ExclamationCircleOutlined />,
                content: t("hr:are_want_this_import_data"),
                onOk: () => this.handleImportUpload(),
                onCancel: () => this.setState({ file: null, fileList: [] }),
              })
            }
            beforeUpload={this.beforeUpload.bind(this)}
            onRemove={this.onRemove}
            fileList={fileList}
          >
            <Button
              key="import-upload-action"
              icon={<FontAwesomeIcon icon={faPaperclip} />}
              type="text"
              size="small"
              style={{ paddingLeft: "8px" }}
            >
              {t("hr:select_import_file")}
            </Button>
          </Upload>
        ) : (
          ""
        ),
      },
      {
        key: "3",
        label: checkPermission("hr-task-suggest-export") ? (
          <Button
            key="export-file-template"
            type="text"
            size="small"
            icon={<FontAwesomeIcon icon={faDownload} />}
          >
            {t("Download file template")}
          </Button>
        ) : (
          ""
        ),
      },
      // <Menu onClick={() => { }} >
      //     {

      //     }
      //     {
      //         checkPermission('hr-task-suggest-import') ?
      //             <Menu.Item key={uniqueId('_dropdown')} >
      //                 <Upload key="import-upload" accept=".csv, .xls, .xlsx"
      //                     onChange={() => Modal.confirm({
      //                         title: 'Xác nhận',
      //                         icon: <ExclamationCircleOutlined />,
      //                         content: 'Bạn chắc muốn import dữ liệu file này?',
      //                         onOk: () => this.handleImportUpload(),
      //                         onCancel: () => this.setState({ file: null, fileList: [] })
      //                     })}
      //                     beforeUpload={this.beforeUpload.bind(this)}
      //                     onRemove={this.onRemove} fileList={fileList}
      //                 >
      //                     <Button key="import-upload-action" icon={<FontAwesomeIcon icon={faPaperclip} />} type="text" size="small" style={{ paddingLeft: '8px' }}>
      //                         &nbsp;&nbsp;{t('Select Import File')}
      //                     </Button>
      //                 </Upload>
      //             </Menu.Item>
      //         : ''
      //     }
      // </Menu>
      ,
    ];
    return (
      <>
        <PageHeader
          title={t("hr:task_suggest")}
          tags={[
            checkPermission("hr-task-suggest-create") ? (
              <Link
                to={`/company/tasks/suggest-create`}
                key="create-task"
                className="mr-2"
              >
                <Button
                  key="create-task"
                  type="primary"
                  icon={<FontAwesomeIcon icon={faPlus} />}
                >
                  &nbsp;{t("add_new")}
                </Button>
              </Link>
            ) : (
              ""
            ),
          ]}
          extra={[
            checkPermission("hr-task-suggest-export") ||
            checkPermission("hr-") ? (
              <DropdownAnt
                trigger={["click"]}
                key={uniqueId("_dropdown")}
                menu={{ items, onClick: itemsAction }}
                type="primary"
                placement="bottomLeft"
              >
                <Button
                  key={uniqueId("_dropdown_btn")}
                  type="primary"
                  icon={<FontAwesomeIcon icon={faEllipsisV} />}
                />
              </DropdownAnt>
            ) : (
              ""
            ),
          ]}
        >
          <Row className="card pl-3 pr-3 mb-3">
            {/* <Tab tabs={tabListTask(staff_info?.major_id,checkManager(staff_info?.position_id))}></Tab> */}
            <div id="tab_responsive">
              <div className="tab_content_mantenance_device">
                <Tab tabs={tabListTask(this.props)}></Tab>
              </div>
            </div>
            <Form
              ref={this.formRef}
              className="pt-3"
              name="searchTaskForm"
              onFinish={this.submitForm.bind(this)}
            >
              <Row gutter={12}>
                <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                  <Form.Item name="department_id">
                    <Dropdown
                      datas={departments}
                      defaultOption={t("hr:all_department")}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                  <Form.Item name="major_id">
                    <Dropdown
                      datas={majors}
                      defaultOption={t("hr:all_major")}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                  <FormItem name="name">
                    <Input placeholder={t("hr:input_name")} />
                  </FormItem>
                </Col>
                <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                  <FormItem>
                    <Button type="primary" htmlType="submit">
                      {t("hr:search")}
                    </Button>
                  </FormItem>
                </Col>
              </Row>
            </Form>
          </Row>
          <Row gutter={[16, 24]}>
            <Col span={24}>
              {window.innerWidth < screenResponsive ? (
                <div className="block_scroll_data_table">
                  <div className="main_scroll_table">
                    <Table
                      dataSource={this.state.groups}
                      rowKey={(r) => r.id}
                      columns={columns}
                      loading={this.state.loading}
                      pagination={{
                        total: this.state.total,
                        pageSize: this.state.limit,
                        hideOnSinglePage: true,
                        showSizeChanger: false,
                        current: this.state.page,
                        onChange: (page) => this.onChangePage(page),
                      }}
                    />
                  </div>
                </div>
              ) : (
                <Table
                  dataSource={this.state.groups}
                  rowKey={(r) => r.id}
                  columns={columns}
                  loading={this.state.loading}
                  pagination={{
                    total: this.state.total,
                    pageSize: this.state.limit,
                    hideOnSinglePage: true,
                    showSizeChanger: false,
                    current: this.state.page,
                    onChange: (page) => this.onChangePage(page),
                  }}
                />
              )}
            </Col>
          </Row>
        </PageHeader>
      </>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    auth: state.auth.info,
    baseData: state.baseData,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(TaskSuggestName));
