import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Table, Row, Col, Form, Input, Popconfirm, Dropdown as DropdownAnt, Menu } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { getListES as apiGetList, deleteCommunication } from '~/apis/company/communicationV1';
import { Link } from 'react-router-dom';
import Tab from '~/components/Base/Tab';
import Dropdown from '~/components/Base/Dropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen, faFileExport } from '@fortawesome/free-solid-svg-icons';
import { showNotify, historyReplace, historyParams, exportToXLS, checkPermission } from '~/services/helper'
import DeleteButton from '~/components/Base/DeleteButton';
import CreateUpdateDate from '~/components/Base/CreateUpdateDate';
import { getHeader, formatData } from './config/CommunicationExport';
import dayjs from 'dayjs';
import { screenResponsive } from '~/constants/basic';
import { update as apiUpdate } from '~/apis/company/communicationV1';
import { update } from 'lodash';


const FormItem = Form.Item;
const FormatDate = 'HH:mm DD/MM/YY ';

class Communication extends Component {
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
      communications: [],
      categories: [],
      status: {},
      limit: 20,
      total: 0,
      page: params.page ? Number(params.page) : 1,
    };
  }

  /**
   * @lifecycle
   */
  componentDidMount() {
    let params = historyParams();
    this.formRef.current.setFieldsValue(params);
    let values = this.formRef.current.getFieldsValue();
    this.getCommunications(values);
  }

  /**
   * Get list communication
   * @param {} params
   */
  getCommunications = (params = {}) => {
    params = {
      ...params,
      page: this.state.page,
      limit: this.state.limit,
    };
    this.setState({ loading: true });
    historyReplace(params);
    let xhr = apiGetList(params);
    xhr.then((response) => {
      if (response.status) {
        let { data } = response;
        this.setState({
          loading: false,
          status: data.status,
          communications: data.rows,
          categories: data.categories,
          total: response.data.total,
        });
      }
    });
  };
  /**
   * @event change page
   *
   * @param {*} page
   */
  onChangePage(page) {
    let values = this.formRef.current.getFieldsValue();
    this.setState({ page }, () => this.getCommunications({ ...values }));
  }
  /**
   * @event submit form
   * @param {Object} values
   */
  submitForm = (values) => {
    this.getCommunications(values);
  };

  /**
   * Event delete communication
   */
  //   onDeleteCommunition = (e, id) => {
  //     e.stopPropagation();
  //     let { t } = this.props;
  //     let xhr = deleteCommunication(id);
  //     xhr.then((response) => {
  //       if (response.status) {
  //         showNotify(t("Notification"), t("Deleted successfully!"));
  //         let values = this.formRef.current.getFieldsValue();
  //         this.getCommunications(values);
  //       }
  //     });
  //   };
  onDeleteCommunition = (id, title) => {
    let formData = new FormData();
    let value = this.formRef.current.getFieldsValue(["title"]);
    formData.append("_method", "PUT");
    formData.append("title", title);
    formData.append("status", 0);
    let xhr = apiUpdate(id, formData);
    xhr.then((response) => {
      if (response.status) {
        showNotify("Notification", "Deleted successfully!");
        let values = this.formRef.current.getFieldsValue();
        this.getCommunications(values);
      }
    });
  };

  async exportCommunication() {
    let { baseData } = this.props;
    let values = this.formRef.current.getFieldsValue();
    values.limit = 5000;
    values.page = 1;
    let response = await apiGetList(values);
    if (response.status) {
      let categories = response.data.categories;
      let header = getHeader();
      let data = formatData(response.data.rows, baseData);
      let datas = [...header, ...data];
      let fileName = `Communication-${dayjs().format("YYYY-MM-DD")}`;
      return exportToXLS(fileName, datas, [
        { width: 120 },
        { width: 25 },
        { width: 120 },
        { width: 18 },
        { width: 12 },
        { width: 10 },
        { width: 10 },
        { width: 10 },
        { width: 10 },
        { width: 20 },
        { width: 27 },
        { width: 20 },
        { width: 25 },
      ]);
    }
  }
  /**
   * @render
   */
  render() {
    let {
      t,
      auth: { profile },
      baseData: { departments, divisions },
    } = this.props;
    let { communications, status, categories } = this.state;
    const tabList = [
      {
        title: "List",
        route: "/company/communication",
      },
      {
        title: "Categories",
        route: "/company/communication/categories",
      },
    ];

    let renderTabList = () => {
      let result = [];
      if (checkPermission("hr-communication-list")) {
        result.push({
          title: "List",
          route: "/company/communication",
        });
      }
      if (checkPermission("hr-communication-categories-list")) {
        result.push({
          title: "Categories",
          route: "/company/communication/categories",
        });
      }
      return result;
    };

    const columns = [
      {
        title: t("Title"),
        dataIndex: "title",
        render: (text, record) => {
          let result = "";
          categories.map((i) => {
            if (i.id == record.category_id) return (result = i.name);
          });
          return (
            <>
              <Link to={"/company/communication/" + record.id + "/edit"}>
                {" "}
                {text}{" "}
              </Link>
              <br></br>
              <small>Category: {result}</small>
            </>
          );
        },
      },
      {
        title: t("Department/Section"),
        render: (r) => {
          let arrDepIds = r.department_id
            ? String(r.department_id).split(",")
            : [];
          let result = [];
          arrDepIds.map((id) => {
            departments.map((d) => {
              if (id == d.id) {
                return result.push(d.name);
              }
            });

            divisions.map((di) => {
              if (id == di.id) {
                return result.push(di.name);
              }
            });
          });
          return result.join(", ");
        },
      },
      {
        title: t("Category"),
        dataIndex: "category",
        render: (category) => (category != null ? category.name : ""),
      },
      {
        title: t("Date"),
        render: (r) => <CreateUpdateDate record={r} />,
      },
      {
        title: t("Status"),
        dataIndex: "status",
        render: (status_id) => status[status_id],
      },
      {
        title: t("Views"),
        render: (r) => (
          <Link to={`/company/communication/${r.id}/view-confirm`}>
            {r.views.length}
          </Link>
        ),
        align: "right",
      },
      {
        title: t("Confirms"),
        render: (r) => (
          <Link to={`/company/communication/${r.id}/view-confirm`}>
            {r?.confirms.length}
          </Link>
        ),
        align: "right",
      },
      {
        title: t("Not clears"),
        render: (r) => (
          <Link to={`/company/communication/${r.id}/view-confirm`}>
            {r?.not_clears.length}
          </Link>
        ),
        align: "right",
      },
      {
        title: "Total staffs",
        dataIndex: "total_staffs",
        align: "center",
      },
      // {
      //   title: t("Action"),
      //   render: (r) => {
      //     return (
      //       <>
      //         {checkPermission("hr-communication-update") ? (
      //           <Link
      //             to={"/company/communication/" + r.id + "/edit"}
      //             style={{ marginRight: 8 }}
      //           >
      //             <Button
      //               type="primary"
      //               size="small"
      //               icon={<FontAwesomeIcon icon={faPen} />}
      //             ></Button>
      //           </Link>
      //         ) : (
      //           ""
      //         )}
      //         {/* { r.created_by == profile.id && r.status == 1 ?
      //                           <DeleteButton onConfirm={(e) => this.onDeleteCommunition(e, r.id)} />
      //                           : []} */}
      //         {checkPermission("hr-communication-delete") ? (
      //           <DeleteButton
      //             onConfirm={(e) => this.onDeleteCommunition(r.id, r.title)}
      //           />
      //         ) : (
      //           ""
      //         )}
      //       </>
      //     );
      //   },
      //   align: "center",
      //   width: "10%",
      // },
    ];

    return (
      <div>
        <PageHeader
          title={
            <div>{t("Communications")} <span style={{ color: "#FF0000" }} >(phiên bản cũ)</span></div>
          }
          tags={
            <>
              {/* <Link to="/company/communication/create">
                {checkPermission("hr-communication-create") ? (
                  <Button
                    key="create-staff"
                    type="primary"
                    icon={<FontAwesomeIcon icon={faPlus} />}
                  >
                    &nbsp;{t("Add new")}
                  </Button>
                ) : (
                  ""
                )}
              </Link> */}
            </>
          }
        />
        <Row className="card pl-3 pr-3 mb-3">
          <Tab tabs={renderTabList()}></Tab>
          <Form
            className="pt-3"
            ref={this.formRef}
            name="searchStaffForm"
            onFinish={this.submitForm.bind(this)}
            layout="vertical"
          >
            <Row gutter={24}>
              <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                <FormItem name="limit" hidden>
                  <Input />
                </FormItem>
                <FormItem name="sort" hidden>
                  <Input />
                </FormItem>
                <FormItem name="offset" hidden>
                  <Input />
                </FormItem>
                <FormItem name="keywords">
                  <Input placeholder={t("Keywords")} />
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                <FormItem name="department_id">
                  <Dropdown
                    datas={departments}
                    defaultOption="-- All Departments --"
                  />
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                <FormItem name="category_id">
                  <Dropdown
                    datas={categories}
                    defaultOption="-- All Categories --"
                  />
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                <FormItem name="status">
                  <Dropdown datas={status} defaultOption="-- All Status --" />
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={8} xl={8} key="submit">
                <FormItem>
                  <Button type="primary" htmlType="submit">
                    {t("Search")}
                  </Button>
                  {checkPermission("hr-communication-export") ? (
                    <Button
                      className="ml-1"
                      type="primary"
                      icon={<FontAwesomeIcon icon={faFileExport} />}
                      onClick={() => this.exportCommunication()}
                    >
                      &nbsp;{t("Export")}
                    </Button>
                  ) : (
                    ""
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Row>
        <Row gutter={[16, 24]}>
          <Col span={24}>
            <div className="block_scroll_data_table">
              <div className="main_scroll_table">
                <Table
                  dataSource={communications}
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
                  rowKey={(communication) => communication.id}
                />
              </div>
            </div>
          </Col>
        </Row>
      </div>
    );
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Communication));
