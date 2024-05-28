import React, { Component } from "react";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import {
  Button,
  Table,
  Row,
  Col,
  Form,
  Modal,
  Input,
  InputNumber,
} from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  getList,
  getConfig,
  saveConfig,
  saveDefaultConfig,
} from "~/apis/company/task/LocationkpiConfig";
import { showNotify, checkManager } from "~/services/helper";
import Tab from "~/components/Base/Tab";
import tabList from "~/scenes/Company/config/tabListTask";
import dayjs from "dayjs";
import { faWrench } from "@fortawesome/free-solid-svg-icons";
import Dropdown from "~/components/Base/Dropdown";
import {screenResponsive} from '~/constants/basic';
//key_Submit = 0 config default , = 1 config

class KpiConfig extends Component {
  /**
   *
   * @param {*} props
   */
  constructor(props) {
    super(props);
    this.formConfigRef = React.createRef();
    this.formRef = React.createRef();
    this.state = {
      loading: false,
      datas: [],
      config: {},
      visible: false,
      idLocation: "",
      key_Submit: "",
    };
  }
  componentDidMount() {
    this.getListLocation();
  }
  async getListLocation(params = {}) {
    let { t } = this.props;
    this.setState({ loading: true });
    let response = await getList(params);
    if (response.status) {
      this.setState({
        datas: response.data.rows,
        loading: false,
        config: response.data.configs_label,
      });
    } else {
      showNotify(t("Notification"), t("hr:server_error"), "error");
    }
  }
  popupConfig(values) {
    let { t } = this.props;
    this.setState({ visible: true, idLocation: values.id, key_Submit: 1 });
    let params = { location_id: values.id };
    let xhr = getConfig(params);
    xhr.then((res) => {
      if (res.status) {
        if (!Array.isArray(res.data) && res.data.length != 0) {
          this.formConfigRef.current.setFieldsValue(res.data);
        }
      } else {
        showNotify("Notification", t("hr:server_error"), "error");
      }
    });
  }
  submitFormConfig() {
    let { t } = this.props;
    let values = this.formConfigRef.current.getFieldsValue();
    let formData = new FormData();
    Object.keys(values).forEach((k) => !values[k] && delete values[k]);
    if (this.state.key_Submit) {
      formData.append("location_id", this.state.idLocation);
      Object.keys(values).map((k) => {
        formData.append(`configs[${k}]`, values[k]);
      });

      let xhr = saveConfig(formData);
      xhr.then((res) => {
        if (res.status) {
          showNotify("Notification", t("hr:update_sucess"));
        } else {
          showNotify("Notification", t("hr:server_error"), "error");
        }
      });
    } else {
      Object.keys(values).map((k) => {
        formData.append(k, values[k]);
      });
      let xhr = saveDefaultConfig(formData);
      xhr.then((res) => {
        if (res.status) {
          showNotify("Notification", t("hr:update_defaul_susscess"));
        } else {
          showNotify("Notification", t("hr:server_error"), "error");
        }
      });
    }

    this.setState({ visible: false });
    this.getListLocation();
  }
  submitForm() {
    let values = this.formRef.current.getFieldsValue();
    this.getListLocation(values);
  }
  setDefaultConfig() {
    this.setState({ visible: true, key_Submit: 0 }, () => {
      let valuesDefault = {
        box_compose_order: 0.3,
        box_packed_order: 1,
        export_it: 0.5,
        offline_pay_order: 0.1,
        receiving_id: 0.3,
        receiving_po: 0.1,
        soft_compose_order: 0.7,
      };
      this.formConfigRef.current.setFieldsValue(valuesDefault);
    });
  }
  render() {
    let {
      t,
      baseData: { locations },
      auth: { staff_info },
    } = this.props;
    let { config } = this.state;
    const columns = [
      {
        title: t("No."),
        align: "center",
        render: (r) => this.state.datas.indexOf(r) + 1,
        width: "3%",
      },
      {
        title: t("hr:alias"),
        render: (r) => <span>{r.alias}</span>,
      },
      {
        title: t("hr:shop"),
        render: (r) => <span>{r.name}</span>,
      },
      {
        title: t("hr:created_at"),
        width: "10%",
        render: (r) => (
          <span>
            {r.created_at
              ? dayjs(r.created_at).format("HH:mm DD-MM-YYYY")
              : "N/A"}
          </span>
        ),
      },
      {
        title: t("hr:updated_at"),
        width: "10%",
        render: (r) => (
          <span>
            {r.updated_at
              ? dayjs(r.updated_at).format("HH:mm DD-MM-YYYY")
              : "N/A"}
          </span>
        ),
      },
      {
        title: t("hr:config"),
        align: "center",
        width: "5%",
        render: (r) => (
          <Button
            type="primary"
            size="small"
            icon={<FontAwesomeIcon icon={faWrench} />}
            onClick={() => this.popupConfig(r)}
          />
        ),
      },
    ];
    return (
      <>
        <PageHeader
          title={t("hr:location_kpi_config")}
          extra={[
            <Button
              key={"submit-default"}
              type="primary"
              onClick={() => this.setDefaultConfig()}
            >
              {t("hr:default_config")}
            </Button>,
          ]}
        />
        <Row className="card pl-3 pr-3 mb-3">
          <div id="tab_responsive">
            <div className='tab_content_mantenance_device'>
            <Tab
              // tabs={tabList(
              //   staff_info?.major_id,
              //   checkManager(staff_info?.position_id)
              // )}
              tabs={tabList(this.props)}
            ></Tab>
            </div>
          </div>
          <Form
            ref={this.formRef}
            className="pt-3"
            name="searchStaffForm"
            onFinish={this.submitForm.bind(this)}
          >
            <Row gutter={12}>
              <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                <Form.Item name="location_id">
                  <Dropdown
                    datas={locations}
                    defaultOption={t('hr:all_location')}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={2} xl={2} key="submit">
                <Form.Item >
                  <Button type="primary" htmlType="submit">
                    {t("hr:search")}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Row>
        <Row gutter={[16, 24]}>
          <Col span={24}>
          {window.innerWidth < screenResponsive  ? 
                            <div className='block_scroll_data_table'>
                                <div className='main_scroll_table'> 
                                    <Table
                                       dataSource={this.state.datas}
                                       columns={columns}
                                       loading={this.state.loading}
                                       pagination={{
                                         hideOnSinglePage: true,
                                         showSizeChanger: false,
                                       }}
                                       rowKey={(r) => r.id}
                                    />
                                </div>
                            </div>
                            :
                <Table
                  dataSource={this.state.datas}
                  columns={columns}
                  loading={this.state.loading}
                  pagination={{
                    hideOnSinglePage: true,
                    showSizeChanger: false,
                  }}
                  rowKey={(r) => r.id}
                />
              }
          </Col>
        </Row>
        <Modal
          open={this.state.visible}
          title={t("hr:config")}
          width= {window.innerWidth < screenResponsive  ? "100%": "40%"}
          onCancel={() => this.setState({ visible: false })}
          okText="Submit"
          onOk={() => this.submitFormConfig()}
          afterClose={() => this.formConfigRef.current.resetFields()}
        >
          <Form ref={this.formConfigRef} layout="vertical">
            <Row gutter={24}>
              {Object.keys(config).map((key) => {
                return (
                  <Col span={12} key={key}>
                    <Form.Item
                      label={config[key]}
                      name={key}
                      rules={[{ required: true }]}
                    >
                      <InputNumber style={{ width: "50%" }} />
                    </Form.Item>
                  </Col>
                );
              })}
            </Row>
          </Form>
        </Modal>
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

export default connect(mapStateToProps)(withTranslation()(KpiConfig));
