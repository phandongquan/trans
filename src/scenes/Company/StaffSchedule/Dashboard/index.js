import React, { Component } from "react";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { DatePicker, Table, Row, Col, Form, Button, Divider, Tooltip, Popover, Spin } from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faPen } from "@fortawesome/free-solid-svg-icons";
import Dropdown from "~/components/Base/Dropdown";
import StaffDropdown from "~/components/Base/StaffDropdown";

import Tab from "~/components/Base/Tab";
import tabList from "../config/tabList";
import { dateFormat, timeInfoDashboardSchedule, typeDashboardStaffSchedule } from "~/constants/basic";
import dayjs from "dayjs";
import { getListDataDashboard as apiGetListDashboard, getDetailDataDashboard } from "~/apis/company/staffSchedule";
import { screenResponsive } from "~/constants/basic";
import "../config/dashboard.css";
import queryString from 'query-string';
import debounce from 'lodash/debounce';
import { showNotify } from "~/services/helper";
class StaffScheduleDrashboard extends Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.state = {
      AllDatas : [],
      datas : [],
      loading : false,
      loadingDetail : false,
      datasDetailStaff : []
    };
    this.handleMouseGetDetail = debounce(this.handleMouseGetDetail, 1000);
  }

  /**
   * @lifecycle
   */
  componentDidMount() {
    this.formRef.current.setFieldsValue({
      date: [dayjs(), dayjs()]
    });
    let values = this.formRef.current.getFieldsValue();
    this.getListDashBoard(values);
  }

  /**
   * Get List Dashboard
   * @param {*} params
   */
  async getListDashBoard(params) {
    this.setState({loading : true })
    let location_id = params.location_id ? params.location_id : null;
    params = {
      ...params,
      group_by_location_id: true,
      location_id

    };
    if(typeof params.date !== undefined && params.date){
      params = {
        ...params,
        from_date: params.date[0].startOf('day').unix(),
        to_date: params.date[1].endOf('day').unix(),
      }
      delete(params.date);
    }
    let response = await apiGetListDashboard(params);
    if (response.status){
      this.setState({ AllDatas: response.data , loading : false });
    } 
  }

  /**
   * @event submit Form
   * @param {*} values
   */
  submitForm(values) {
    this.getListDashBoard(values);
  }
  openLinkTimeSheet(key = '' ,type = 0){
    // type 64 status Late timesheet
    // type 1 is_diff_loc timesheet
    let values = this.formRef.current.getFieldsValue()
    delete values.type
    if(key == 'late'){
      if(typeof values.date !== undefined && values.date){
        values.from_date = dayjs(values.date[0]).format('YYYY-MM-DD')
        values.to_date = dayjs(values.date[1]).format('YYYY-MM-DD')
      }
      delete values.date
      delete values.type
      values.status = type
      let stringURL = queryString.stringify(values)
      window.open(`/company/timesheet?&location_id=${values.location_id}&${stringURL}`, '_blank');
    }
    if(key == 'diff'){
      if(typeof values.date !== undefined && values.date){
        values.from_date = dayjs(values.date[0]).format('YYYY-MM-DD')
        values.to_date = dayjs(values.date[1]).format('YYYY-MM-DD')
      }
      delete values.date
      delete values.type
      values.is_diff_loc = type
      let stringURL = queryString.stringify(values)
      window.open(`/company/timesheet?${stringURL}`, '_blank');
    }
    if(key == 'sm' || key == 'none'){
      if(typeof values.date !== undefined && values.date){
        values.month = dayjs(values.date[0]).format('MM')
        values.year = dayjs(values.date[0]).format('YYYY')
      }
      delete values.date
      delete values.type
      let stringURL = queryString.stringify(values)
      window.open(`/company/staff-schedule/monthly?${stringURL}`, '_blank');
    }
  }
  
  async handleMouseGetDetail(event, key = '', data = {}, row = {}) {
    this.setState({loadingDetail : true})
    let values = this.formRef.current.getFieldsValue()
    let params = {
      // from_date : dayjs(values.date[0].unix())
      // to_date : 
      location_id: data.location_id,
      shift: row.name,
      type: key
    }
    if (typeof values.date != 'undefined' && values.date) {
      params = {
        ...params,
        from_date: dayjs(values.date[0]).unix(),
        to_date: dayjs(values.date[1]).unix()
      }
    }
    let response = await getDetailDataDashboard(params)
    if(response.status){
      this.setState({loadingDetail : false , datasDetailStaff : response.data })
    }else{
      this.setState({loadingDetail : false})
      showNotify('Notification', response.message, 'error')
    }
  }
  renderPopverDetail(key = '') {
    let result = []
    // console.log(this.state.datasDetailStaff)
    if (this.state.datasDetailStaff.length) {
      switch (key) {
        case 'Off':
          result.push(
            <Row gutter={24}>
              {
                this.state.datasDetailStaff.map(d => {
                  return <Col span={24}>
                    <span>- {d.staff_name} : {d.leave_shift}</span>
                  </Col>
                })
              }
            </Row>
          )
          break;
        case 'Late':
          result.push(
            <Row gutter={24}>
               {
                this.state.datasDetailStaff.map(d => {
                  return <Col span={24}>
                    <span>- {d.staff_name} </span>
                  </Col>
                })
              }
            </Row>
          )
          break;
        case 'None':
          result.push(
            <Row gutter={24}>
               {
                this.state.datasDetailStaff.map(d => {
                  return <Col span={24}>
                    <span>- {d.staff_name} </span>
                  </Col>
                })
              }
            </Row>
          )
          break;
        case 'Diff':
          result.push(
            <Row gutter={24}>
               {
                this.state.datasDetailStaff.map(d => {
                  return <Col span={24}>
                    <span>- {d.staff_name} </span>
                  </Col>
                })
              }
            </Row>
          )
          break;
        case 'SM':
          result.push(
            <Row gutter={24}>
               {
                this.state.datasDetailStaff.map(d => {
                  return <Col span={24}>
                    <span>- {d.staff_name} </span>
                  </Col>
                })
              }
            </Row>
          )
          break;
        default:
          break;
      }
    }
    return <Spin spinning={this.state.loadingDetail}>
      <strong>{key}</strong>
      {result}
    </Spin>
  }
  renderTable(data) {
    let {
      t,
      baseData: { departments, locations, majors },
    } = this.props;
    let locFind = locations.find(l => l.id == data.location_id)

    const columns = [
      {
        title: t("hr:time"),
        render: (r) => r.name
      },
      {
        title: <Tooltip title={'Tổng nhân sự theo lịch làm việc'}><span className="cursor-pointer">{'Total'}</span></Tooltip>,
        align : 'center',
        render: (r) => <span>{r.total}</span>
      },
      {
        title: <Tooltip title={'Số nhân sự nghỉ tuần và các loại phép khác'}><span className="cursor-pointer">{'Off'}</span></Tooltip>,
        align : 'center',
        render: (r) => {
          let isDangerous = false
          let values = this.formRef.current.getFieldsValue()
          if (typeof values.date != 'undefined' && values.date) {
            let startDate = dayjs(values.date[0]);
            let endDate = dayjs(values.date[1]);
            let daysDiff = endDate.diff(startDate, 'day') + 1
            if((r.off * daysDiff) > ( (data.staff / 5) * daysDiff)){
              isDangerous = true
            }
          }
          // return <span style={{ color : isDangerous ? 'red' : ''}}>{r.off}</span>
          return {
            props: {
              style: { background:  isDangerous > 0? '#ff5c5c' :'', color:isDangerous > 0 ? 'white' : ''  }
            },
            children: <Popover
              // content={this.renderPopverDetail('Off')}
              mouseEnterDelay={1.5}>
                <span className="cursor-pointer"
                  onMouseEnter={(e) => this.handleMouseGetDetail(e ,'off',data , r)}
                >
                {r.off}
              </span>
            </Popover>
          };
        }
      },
      {
        title: <Tooltip title={'Số nhân sự đi trễ/về sớm'}><span className="cursor-pointer">{'Late'}</span></Tooltip>,
        align : 'center',
        render: r => {
          return {
            props: {
              style: { background: r.late> 0? '#ff5c5c' :'', color:r.late > 0 ? 'white' : ''  }
            },
            children: <Popover 
              // content={this.renderPopverDetail('Late')}
              mouseEnterDelay={1.5}>
              <span onMouseEnter={(e) => this.handleMouseGetDetail(e ,'late',data , r)}
                className="cursor-pointer"
                onClick={() => this.openLinkTimeSheet('late', 64)}>
                {r.late}
              </span>
            </Popover>
          };
        }
      },
      {
        title: <Tooltip title={'Có lịch làm việc nhưng không điểm danh'}><span className="cursor-pointer">{'None'}</span></Tooltip>,
        align : 'center',
        render: r => {
          return {
            props: {
              style: { background: r.none > 0 ? '#ff5c5c' : '', color: r.none > 0 ? 'white' : '' }
            },
            children: <Popover
              // content={this.renderPopverDetail('None')}
              mouseEnterDelay={1.5}>
              <span className="cursor-pointer"
                onMouseEnter={(e) => this.handleMouseGetDetail(e, 'none', data, r)}
                onClick={() => this.openLinkTimeSheet('none')}>
                {r.none}
              </span>
            </Popover>
          };
        }
      },
      {
        title: <Tooltip title={'Lịch diểm danh khác chi nhánh xếp làm việc'}><span className="cursor-pointer">{'Diff'}</span></Tooltip>,
        align: 'center',
        render: r => {
          return {
            props: {
              style: { background: r.diff > 0 ? '#ff5c5c' : '', color: r.diff > 0 ? 'white' : '' }
            },
            children: <Popover
              // content={this.renderPopverDetail('Diff')}
              mouseEnterDelay={1.5}>
              <span className="cursor-pointer"
                onMouseEnter={(e) => this.handleMouseGetDetail(e, 'diff', data, r)}
                onClick={() => this.openLinkTimeSheet('diff', 1)}>
                {r.diff}
              </span>
            </Popover>
          };
        }
      },
      {
        title: <Tooltip title={'Số lần T7,CN không có QLCH tại chi nhánh'}><span className="cursor-pointer">{'SM'}</span></Tooltip>,
        align: 'center',
        render: r => {
          return {
            props: {
              style: { background: r.sm > 0 ? '#ff5c5c' : '', color: r.sm > 0 ? 'white' : '' }
            },
            children: <Popover
              // content={this.renderPopverDetail('SM')}
              mouseEnterDelay={1.5}>
              <span className="cursor-pointer"
                onMouseEnter={(e) => this.handleMouseGetDetail(e, 'sm', data, r)}
                onClick={() => this.openLinkTimeSheet('sm')}>
                {r.sm}
              </span>
            </Popover>
          };
        }
      },
    ];

    return <Col span={12} key={data.location_id}>
      <Table
        tableLayout='fixed'
        loading={this.state.loading}
        className="p-1"
        title={() => <strong>{`${locFind?.name} - ${data.staff} staffs`}</strong>}
        columns={columns}
        pagination={false}
        dataSource={data.result}
        rowKey={r => r.name}
      />
    </Col>
  }
  render() {
    let {
      t,
      baseData: { departments, locations, majors },
    } = this.props;

    return (
      <>
        <PageHeader title={t("hr:dashboard")} />

        <Row className="card pl-3 pr-3 mb-4">
          <Form
            className="pt-3"
            ref={this.formRef}
            name="searchStaffForm"
            onFinish={this.submitForm.bind(this)}
            layout="vertical"
          >
            <Row gutter={12}>
              <Col xs={24} sm={24} md={24} lg={4} xl={6}>
                <Form.Item name="date">
                  <DatePicker.RangePicker format={dateFormat} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={12} sm={12} md={12} lg={4} xl={3}>
                <Form.Item name="location_id">
                  <Dropdown
                    datas={locations}
                    defaultOption={t("hr:all_location")}
                  />
                </Form.Item>
              </Col>
              <Col xs={12} sm={12} md={12} lg={4} xl={3}>
                <Form.Item name="department_id">
                  <Dropdown
                    datas={departments}
                    defaultOption={t("hr:all_department")}
                  />
                </Form.Item>
              </Col>
              <Col xs={12} sm={12} md={12} lg={4} xl={3}>
                <Form.Item name="major_id">
                  <Dropdown mode='multiple' datas={majors} defaultOption={t("hr:all_major")} />
                </Form.Item>
              </Col>
              <Col xs={12} sm={12} md={12} lg={4} xl={3}>
                <Form.Item name="type">
                  <Dropdown datas={typeDashboardStaffSchedule} defaultOption={t("hr:all_type")} />
                </Form.Item>
              </Col>
              <Col xs={12} sm={12} md={12} lg={4} xl={4} key="submit">
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    {t("hr:search")}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Row>

        <Row className="card pl-3 pr-3 mb-3 pb-3">
          <Col span={24}>
            <Tab tabs={tabList(this.props)} />
            <Divider className="mt-0" />
            {/* {window.innerWidth < screenResponsive ? (
              <div className="block_scroll_data_table">
                <div className="main_scroll_table">
                  <Table
                    dataSource={this.state.dashboardSchedules}
                    columns={columns}
                    rowKey={(schedule) => schedule.staffsche_id}
                  />
                </div>
              </div>
            ) : (
              <Table
                // dataSource={this.stdashboard}
                columns={columns}
                rowKey={(schedule) => schedule.staffsche_id}
              />
            )} */}
            <Spin spinning={this.state.loading} >
              <Row gutter={24}>
                {
                  this.state.AllDatas.length ?
                    this.state.AllDatas.map((d, index) => this.renderTable(d))
                    :
                    ''
                }
              </Row>
            </Spin>
          </Col>
        </Row>
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
)(withTranslation()(StaffScheduleDrashboard));
