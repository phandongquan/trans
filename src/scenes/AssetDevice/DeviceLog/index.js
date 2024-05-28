import React, { Component } from "react";
import { connect } from "react-redux";
import { Button, Row, Form, Col, DatePicker, Table, Tooltip, Input } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import Tab from "~/components/Base/Tab";
import tabList from "../config/tabList";
import StaffDropdown from "~/components/Base/StaffDropdown";
import AssetDropdown from "../config/AssetDropdown";
import { list as apiGetList } from "~/apis/assetDevice/device_log";
import { timeFormatStandard, historyReplace, historyParams, checkPermission } from "~/services/helper";
import { dateFormat } from "~/constants/basic";
import dayjs from "dayjs";
import { EditOutlined } from "@ant-design/icons";
import { typeAsset, typeAssetDevice } from "../config";
import Dropdown from "~/components/Base/Dropdown";

export class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      datas: [],
      total: 0,
    };
    this.formRef = React.createRef();
  }

  componentDidMount() {
    let params = historyParams();
    if(params.from_date && params.to_date) {
      if(params.from_date == 1 && params.to_date == 1) {
        delete(params.date);
        delete(params.from_date)
        delete(params.to_date)
      } else {
        params.date = [dayjs(params.from_date), dayjs(params.to_date)]
      }
    } else {
      params.date = [dayjs().subtract(1, 'weeks'), dayjs()]
    }
    this.formRef.current.setFieldsValue(params);
    let values = this.formRef.current.getFieldsValue();
    this.getListDeviceLog(values);
  }

  /**
   * Get list device logs
   * @param {*} params
   */
  getListDeviceLog = (params = {}) => {
    if (params.date) {
      params.from_date = timeFormatStandard(params.date[0], dateFormat);
      params.to_date = timeFormatStandard(params.date[1], dateFormat);
      delete params.date;
    }
    historyReplace(params);
    let xhr = apiGetList(params);
    xhr.then((response) => {
      if (response.status) {
        this.setState({
          datas: response.data.rows,
          total: response.data.total,
        });
      }
    });
  };

  /**
   * OnSearch
   * @param {*} values
   */
  onSearch = (values) => {
    this.getListDeviceLog(values);
  };

  render() {
    const { datas, total } = this.state;
    const {t, baseData: { locations } } = this.props;
    const columns = [
      {
        title: "No.",
        render: (r) => datas.indexOf(r) + 1,
      },
      {
        title: t('device'),
        width: 500,
        render: (r) => {
          let date = "";
          if (r.date) {
            date = timeFormatStandard(r.date, dateFormat);
          }

          let name = r.type == typeAssetDevice ? r.asset?.product_name : r.location?.name
          let code = r.type == typeAssetDevice ? r.asset?.code : r.location?.alias
          return (
            <>
              <Link
                to={`/asset-device/criterion-log?asset_id=${r.asset_id}&date=${date}&type=${r.type}`}
              >
                {name}
              </Link>
              <small>
                <strong> ({code}) </strong>
              </small>
            </>
          );
        },
      },
      {
        title: t('type'),
        width:200,
        render: r => r.type == typeAssetDevice ? t('device') : t('hr:branch')
      },
      {
        title: t('date') + (' ') + t('hr:maintenance'),
        width: 250,
        dataIndex: "date",
        render: (date) => timeFormatStandard(date, dateFormat),
      },
      {
        title: t('staff') + (' ') + t('hr:maintenance'),
        width: 500,
        render: (r) => {
          let result = [];
          if (Array.isArray(r.assgin_to_staff)) {
            r.assgin_to_staff.map((staff) =>
              result.push(
                <div key={staff.staff_id}>
                  {staff.staff_name} <strong>#{staff.code}</strong>
                </div>
              )
            );
          }
          return result;
        },
      },
      {
        title: t('action'),
        render: (r) => (
          <>
            {checkPermission('hr-asset-device-log-update')?
              <Tooltip title={t('edit')}>
                <Button
                  type="primary"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => {
                    let date = timeFormatStandard(r.date, dateFormat);
                    this.props.history.push(
                      `/asset-device/log/edit?date=${date}&asset_id=${r.asset_id}&type=${r.type}`
                    );
                  }}
                />
              </Tooltip> : ''
            }
          </>
        ),
      },
    ];

    return (
      <>
        <PageHeader
          title={t('maintenance_history')}
          tags={[
            <Link to="/asset-device/log/edit" key="create">
              {checkPermission('hr-asset-device-log-create') ?
                <Button
                  type="primary"
                  icon={<FontAwesomeIcon icon={faPlus} />}
                  onClick={() => this.setState({ visible: true })}
                >
                  &nbsp; Tạo mới
                </Button> : ''
              }
            </Link>,
          ]}
        />
        <Row className="card mb-3 p-3">
          <div id="tab_responsive">
            <div className='tab_content_mantenance_device'>
              <Tab tabs={tabList(this.props)} />
            </div>
          </div>
          <Form
            className="mt-3"
            ref={this.formRef}
            onFinish={(values) => this.onSearch(values)}
          >
            <Row gutter={12}>
              <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                <Form.Item name="type" hidden>
                  <Input />
                </Form.Item>
                <Form.Item name="date">
                  <DatePicker.RangePicker
                    className="w-100"
                    allowClear={false}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={3} xl={3}>
                <Form.Item name="type">
                  <Dropdown datas={typeAsset} defaultOption={t('type')} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                <Form.Item name="location_id">
                  <Dropdown datas={locations} defaultOption={t('location')} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                <Form.Item name="asset_id">
                  <AssetDropdown defaultOption={t('asset')} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                <Form.Item name="staff_id">
                  <StaffDropdown defaultOption={t('staff')} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                
                  <Button type="primary" htmlType="submit">
                    {t('search')}
                  </Button>
              
              </Col>
            </Row>
          </Form>
        </Row>
        <Table
          columns={columns}
          dataSource={datas}
          rowKey="id"
          pagination={{ pageSize: 30, showSizeChanger: false, total }}
        />
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  baseData: state.baseData
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(index);
