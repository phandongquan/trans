import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Table, Row, Col, Form, Input, DatePicker } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { getListES as apiGetList } from '~/apis/company/communication';
import { Link } from 'react-router-dom';
import Dropdown from '~/components/Base/Dropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport } from '@fortawesome/free-solid-svg-icons';
import { historyReplace, historyParams, exportToXLS, checkPermission, timeFormatStandard } from '~/services/helper'
import CreateUpdateDate from '~/components/Base/CreateUpdateDate';
import { getHeader, formatData } from './config/CommunicationExport';
import dayjs from 'dayjs';
import { getListManagementCommunication } from '~/apis/company/document/communication';
import tabList from '../config/tabListDocument';
import Tab from '~/components/Base/Tab';
import { dateFormat, dateTimeFormat } from '~/constants/basic';

const FormItem = Form.Item;

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
    let values = {
      ...this.formRef.current.getFieldsValue(),
      status: params.status ? params.status : 1,
    };
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
    let xhr = getListManagementCommunication(params);
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
        this.formRef.current.setFieldsValue(params);
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
    this.setState({ page: 1 }, () => this.getCommunications(values));
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

    const columns = [
      {
        title: t("hr:title"),
        dataIndex: "title",
        render: (text, record) => {
          return (
            <Link to={"/company/document/" + record.id + "/edit"}>
              {text}{" "}
            </Link>
          );
        },
      },
      {
        title: t("hr:category"),
        dataIndex: "category",
        render: (category) => (category != null ? category.name : ""),
      },
      {
        title: t("hr:date"),
        render: (r) => <CreateUpdateDate record={r} />,
      },
      {
        title: t("hr:from"),
        render: (r) => {
          return r.from_date ? timeFormatStandard(r.from_date, dateTimeFormat) : ''
        },
      },
      {
        title: t("hr:to"),
        render: (r) => {
          return r.to_date ? timeFormatStandard(r.to_date, dateTimeFormat) : ''
        },
      },
      {
        title: t("hr:status"),
        dataIndex: "status",
        render: (status_id) => status[status_id],
      },
      {
        title: t("hr:views"),
        render: (r) => (
          <Link to={`/company/document/communication/${r.id}/view-confirm`}>
            {r.views.length}
          </Link>
        ),
        align: "right",
      },
      {
        title: t("hr:confirm"),
        render: (r) => (
          <Link to={`/company/document/communication/${r.id}/view-confirm`}>
            {r?.confirms.length}
          </Link>
        ),
        align: "right",
      },
      {
        title: t("hr:unclear"),
        render: (r) => (
          <Link to={`/company/document/communication/${r.id}/view-confirm`}>
            {r?.not_clears.length}
          </Link>
        ),
        align: "right",
      },
      {
        title: t('hr:total'),
        dataIndex: "total_staffs",
        align: "center",
      },
    ];

    return (
      <div>
        <PageHeader
          title={t("hr:communication")}
        />
        <Row className="card pl-3 pr-3 mb-3">
          <Tab tabs={tabList(this.props)} />
          <Form
            className="pt-3"
            ref={this.formRef}
            name="searchStaffForm"
            onFinish={this.submitForm.bind(this)}
            layout="vertical"
          >
            <Row gutter={[8, 8]}>
              <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                <FormItem name="keywords">
                  <Input placeholder={t("keywords")} />
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={4} xl={3}>
                <FormItem name="department_id">
                  <Dropdown
                    datas={departments}
                    defaultOption={t("all_department")}
                  />
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={4} xl={3}>
                <FormItem name="category_id">
                  <Dropdown
                    datas={categories}
                    defaultOption={t("all_category")}
                  />
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={4} xl={3}>
                <FormItem name="status">
                  <Dropdown
                    datas={status}
                    defaultOption={t("all_status")}
                  />
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={4} xl={3}>
                <FormItem name="from_date">
                  <DatePicker.RangePicker style={{ width: '100%' }} format={dateFormat} />
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={8} xl={8} key="submit">
                <FormItem>
                  <Button type="primary" htmlType="submit">
                    {t("hr:search")}
                  </Button>
                  {checkPermission("hr-communication-export") ? (
                    <Button
                      className="ml-1"
                      type="primary"
                      icon={<FontAwesomeIcon icon={faFileExport} />}
                      onClick={() => this.exportCommunication()}
                    >
                      &nbsp;{t("hr:export")}
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
