import React, { Component } from "react";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { PageHeader } from "@ant-design/pro-layout";
import { Row, Table, Form, Col, Button } from "antd";
import tabList from "../config/tabList";
import Tab from "~/components/Base/Tab";
import AssetDeviceChart from "~/components/Company/Asset Device/chart";
import { groupPo } from "~/apis/assetDevice";
import { showNotify, exportToXLS, historyParams } from "~/services/helper";
import { uniq } from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExport } from "@fortawesome/free-solid-svg-icons";
import { formatData, formatHeader } from "../config/exportAssetDevice";
import dayjs from "dayjs";

export class AssetDeviceReport extends Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.state = {
      datas: [],
      total: -1,
      page: 1,
      limit: 30,
    };
  }

  componentDidMount() {
    let params = historyParams();
    this.formRef.current.setFieldsValue(params);
    let values = this.formRef.current.getFieldsValue();
    params = {
      ...params,
      ...values,
    };
    this.getGroupPo(params);
  }

  getGroupPo = (params) => {
    const { limit, page } = this.state;
    params = {
      ...params,
      limit,
      offset: (page - 1) * limit,
    };
    let xhr = groupPo();
    xhr.then((res) => {
      if (res.status) {
        this.setState({
          datas: res.data,
          total: res.total,
        });
      } else {
        showNotify("Notification", res.message, "error");
      }
    });
  };

  onChangePage = (page) => {
    this.setState({ page }, () => {
      this.getGroupPo();
    });
  };
  /**
   * submit Form
   */
  submitFormReport = (values) => {
    this.setState({ page: 1 }, () => {
      let values = this.formRef.current.getFieldsValue();
      this.getGroupPo(values);
    });
  };
  async exportReport() {
    this.setState({ loading: true });
    let { baseData } = this.props;
    let values = this.formRef.current.getFieldsValue();
    let params = {
      ...values,
    };
    let response = await groupPo();
    if (response.status) {
      let header = formatHeader();
      let data = formatData(response.data);
      let fileName = `Report ${dayjs().format("YYYY-MM-DD")}`;
      let dataFormat = [...header, ...data];
      exportToXLS(fileName, dataFormat, [
        { width: 35 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
      ]);
    }
    this.setState({ loading: false });
  }
  render() {
    const {
      t,
      baseData: { locations },
    } = this.props;
    const { datas, page, limit, total } = this.state;
    const columns = [
      {
        title: "No.",
        render: (r) => datas.indexOf(r) + 1,
      },
      {
        title:  t('location'),
        render: (r) => {
          if (r.location_id == 0) {
            return "None Location";
          }

          if (r.location_id == 23) {
            return (
              <a
                target="_blank"
                href={`/asset-device?location_id=${r.location_id}`}
              >
                48 Xuân Thủy
              </a>
            );
          }
          if (r.location_id == 23) {
            return (
              <a
                target="_blank"
                href={`/asset-device?location_id=${r.location_id}`}
              >
                48 Xuân Thủy
              </a>
            );
          }

          return (
            <a
              target="_blank"
              href={`/asset-device?location_id=${r.location_id}`}
            >
              {locations.find((l) => l.id === r.location_id)?.name}
            </a>
          );
        },
      },
      {
        title:  t('count_of_purchase_order'),
        align: "center",
        render: (r) => {
          let arrPo = String(r.po).split(",");
          return uniq(arrPo).length;
        },
      },
      {
        title:  t('count_of_label_code'),
        dataIndex: "total_label_code",
        align: "center",
      },
      {
        title:  t('count_of_qr_code'),
        dataIndex: "total_qr",
        align: "center",
      },
      {
        title: t('completion_rate'),
        algin: "center",
        render: (r) =>
          Number((r.total_qr * 100) / r.total_label_code).toFixed(1),
        align: "center",
      },
      {
        title: t('qr_unlinked_device'),
        align: "center",
        render: (r) => (
          <a
            target="_blank"
            href={`/qrcode/list?location_id=${r.location_id}&is_has_asset=0`}
          >
            {r.none_asset}
          </a>
        ),
      },
      {
        title: t('diff_location'),
        align: "center",
        render: (r) => (
          <a
            target="_blank"
            href={`/qrcode/list?location_id=${r.location_id}&is_diff_loc=1`}
          >
            {r.diff_loc}
          </a>
        ),
      },
    ];
    return (
      <>
        <PageHeader title={t("Thống kê thiết bị tài sản")} />
        <Row className="card pl-3 pr-3 mb-3">
          <div id="tab_responsive">
            <div className="tab_content_mantenance_device">
              <Tab tabs={tabList(this.props)} />
            </div>
          </div>
        </Row>
        <AssetDeviceChart params={{}} isReport={true} />
        <Row className="card pl-3 pr-3 mb-3 mt-3">
          <Form
            className="pt-3 pr-3 mb-3"
            ref={this.formRef}
            layout="vertical"
            onFinish={this.submitFormReport.bind(this)}
          >
            <Row gutter={12}>
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <Button
                  type="primary"
                  className="ml-2"
                  icon={<FontAwesomeIcon icon={faFileExport} />}
                  onClick={() => this.exportReport()}
                >
                  &nbsp;{t("hr:export")}
                </Button>
              </Col>
            </Row>
          </Form>
        </Row>
        <Table
          columns={columns}
          dataSource={datas}
          rowKey="location_id"
          pagination={{
            page,
            pageSize: limit,
            total,
            onChange: (page) => this.onChangePage(page),
            showSizeChanger: false,
          }}
        />
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  baseData: state.baseData,
});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(AssetDeviceReport));
