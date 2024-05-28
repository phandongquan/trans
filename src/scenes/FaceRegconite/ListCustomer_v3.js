import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Button,
  Row,
  Col,
  Image,
  Form,
  DatePicker,
  Input,
  Modal,
  Table,
  Spin,
  Upload,
  Slider,
  Select,
  Checkbox,
  Tabs,
  Avatar,
} from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import Tab from "~/components/Base/Tab";
import tabListFaceRegconite from "../Company/config/tabListFaceRegconite";
import {
  convertToFormData,
  historyParams,
  showNotify,
} from "~/services/helper";
import axios from "axios";
import dayjs from "dayjs";
import { uniqueId } from "lodash";
import {
  faCamera,
  faFilter,
  faPen,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./config/listbadface.css";
import Dropdown from "~/components/Base/Dropdown";
import DeleteButton from "~/components/Base/DeleteButton";
import { InboxOutlined } from "@ant-design/icons";
import { mineTypeImage, typeCustomer } from "~/constants/basic";
import {
  getESLog,
  getCustomerSearch,
  deleteES,
  postSearchByFace,
  postImageRegister,
} from "~/apis/aiFaceLog/index_v3";
import debounce from "lodash/debounce";
import LazyLoad from "react-lazy-load";
import ListCustomerCount_v3 from "./ListCustomerCount_v3";
import HistoryCashierUse_v3 from "./HistoryCashierUse-v3";
import ModalEditCustomer from "./ModalEditCustomer_v3";
const optionDefault = 1;
const optionCount = 2;
const optionCashierUse = 3;

const dateTimeFormat = "YYYY-MM-DD HH:mm:ss";
const { RangePicker } = DatePicker;
const { Dragger } = Upload;
class ListCustomerV3 extends Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.formEditRef = React.createRef();
    this.formAddRef = React.createRef();
    let params = historyParams();
    let page = 1;
    let limit = params.limit ? params.limit : 100;
    if (params.offset) {
      page = params.offset / limit + 1;
    }

    this.state = {
      datas: [],
      loading: false,
      limit,
      page,
      total: 2000,
      dataDetail: {},
      visibleModal: false,
      visibleModalEdit: false,
      visibleModalAdd: false,
      file: [],
      valueSlide: 0.2,
      loadingModalImg: false,
      datasCustomer: [],
      valueCustomer: {},
      imageUrl: null,
      option: optionDefault,
      datasCount: [],
    };
    this.getListCustomer = debounce(this.getListCustomer, 400);
  }
  /**
   * @lifecycle
   */
  componentDidMount() {
    this.formRef.current.setFieldsValue({ view: "not_count" });
    let values = this.formRef.current.getFieldsValue();
    this.getListFaceFilter(values);
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.option != this.state.option) {
      if (this.state.option == optionCount) {
      }
      if (this.state.option == optionDefault) {
      }
    }
  }
  getListFaceFilter = async (params = {}) => {
    this.setState({ loading: true });
    let response = await getESLog({
      ...params,
      limit: this.state.limit,
      offset: (this.state.page - 1) * this.state.limit,
    });
    this.setState({
      datas: response.log_list,
      loading: false,
      total: this.state.limit * response.maxpage,
    });
  };
  async getListCustomer(params = {}) {
    let response = await getCustomerSearch({
      ...params,
    });
    if (response) {
      this.setState({ datasCustomer: response });
    }
  }
  /**
   * @event change page
   *
   * @param {*} page
   */
  onChangePage(page) {
    let values = this.formRef.current.getFieldsValue();
    values = {
      ...values,
      // ip : values.IP ? values.IP : null ,
      starting_date: values.date
        ? values.date[0].startOf("day").format("YYYY-MM-DD")
        : null,
      ending_date: values.date
        ? values.date[1].endOf("day").format("YYYY-MM-DD")
        : null,
    };
    delete (values.date, values.keywords);
    Object.keys(values).forEach(
      (k) => (values[k] == null || values[k] == "") && delete values[k]
    );
    this.setState({ page }, () => this.getListFaceFilter(values));
    window.scrollTo(0, 0);
  }
  /**
   * Chunk array
   * @param {*} arr
   * @param {*} size
   * @returns
   */
  chunk = (arr, size) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );

  submitForm() {
    let values = this.formRef.current.getFieldsValue();
    values = {
      ...values,
      // ip : values.IP ? values.IP : null ,
      starting_date: values.date
        ? values.date[0].startOf("day").format("YYYY-MM-DD")
        : null,
      ending_date: values.date
        ? values.date[1].endOf("day").format("YYYY-MM-DD")
        : null,
    };
    delete values.date;
    Object.keys(values).forEach(
      (k) => (values[k] == null || values[k] == "") && delete values[k]
    );
    this.setState({ page: 1 }, () => this.getListFaceFilter(values));
  }
  async onDeleteImg(e, id, index) {
    e.stopPropagation();
    let response = await deleteES({ id: id });
    if (response) {
      showNotify("Notification", "Deleted successfully!");
      const newdatas = this.state.datas.slice();
      newdatas.splice(index, 1);
      this.setState({ datas: newdatas });
    }
  }
  /**
   * Check size of file
   * @param {*} file
   */
  checkSize(file) {
    return file.size / 1024 / 1024 < 10 ? true : false;
  }
  submitImage() {
    let selfThis = this;
    selfThis.setState({ loadingModalImg: true });
    let formData = new FormData();
    formData.append("threshold", this.state.valueSlide);
    formData.append("image", this.state.file[0]);
    postSearchByFace(formData)
      .then(function(response) {
        //handle success
        if (response.log_list?.length) {
          selfThis.setState({
            loadingModalImg: false,
            datas: response.log_list,
            total: selfThis.state.limit * response.maxpage,
            visibleModalImg: false,
          });
        } else {
          showNotify("Notification", "Không có dữ liệu !");
          selfThis.setState({ loadingModalImg: false, visibleModalImg: false });
        }
      })
      .catch(function(response) {
        //handle error
        console.log(response);
      });
  }
  renderOptionsName() {
    const { Option } = Select;
    let datas = this.state.datasCustomer.length ? this.state.datasCustomer : [];
    let listOptions = [];
    if (Array.isArray(datas) && datas.length) {
      datas.map((data, index) =>
        listOptions.push(
          <Option key={index} value={data.id}>
            <span>{data.name}</span>
          </Option>
        )
      );
    }
    return listOptions;
  }
  /**
   * @event search dropdon
   * @param {*} q
   */
  onSearch(q) {
    this.getListCustomer({ name: q });
  }
  /**
   * @event click
   * @param {Object} e
   */
  onMouseEnter(e) {
    e.stopPropagation();
    e.preventDefault();
  }
  openModalEdit(data) {
    this.setState({ visibleModalEdit: true, dataDetail: data });
  }
  submitFormAdd(values) {
    let valuesSearch = this.formRef.current.getFieldsValue();
    let selfThis = this;
    selfThis.setState({ loadingModalImg: true });
    let formData = convertToFormData(values);
    formData.append("image", this.state.file[0]);
    postImageRegister(formData)
      .then(function(response) {
        //handle success
        if (response) {
          selfThis.getListFaceFilter(valuesSearch);
          selfThis.setState({ loadingModalImg: false, visibleModalAdd: false });
        } else {
          showNotify("Notification", "Tạo không thành công !", "error");
          // selfThis.setState({ visibleModalAdd: false })
        }
      })
      .catch(function(response) {
        //handle error
        console.log(response);
      });
  }
  handleSubmitAdd() {
    this.formAddRef.current
      .validateFields()
      .then((values) => {
        this.submitFormAdd(values);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  }

  getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  };
  renderOptionDefault() {
    let {
      t,
      baseData: { locations },
      auth: { staff_info },
    } = this.props;
    const columns = [
      {
        title: t("customer"),
        render: (r) => (
          <div className="d-flex align-items-center">
            <div>
              <LazyLoad className={"item-image"}>
                <Avatar size={58} src={<Image src={r.crop_image_url} />} />
              </LazyLoad>
            </div>
            <div className="ml-2">
              <div>{r.customer_name}</div>
              <small>Id: {r.id}</small>
              <br />
              <small>Customer Id: {r.customer_id}</small>
            </div>
          </div>
        ),
      },
      {
        title: t("type"),
        render: (r) => typeCustomer[r.is_customer],
      },
      {
        title: t("distance"),
        dataIndex: "distance",
      },
      {
        title: "IP",
        dataIndex: "ip",
      },
      {
        title: t("hr:full_image"),
        render: (r) =>
          r.full_image_url ? (
            <LazyLoad className={"item-image"}>
              <Image
                style={{ width: 180, height: 80, objectFit: "cover" }}
                src={r.full_image_url}
              />
            </LazyLoad>
          ) : (
            ""
          ),
      },
      {
        title: t("appeared_time"),
        render: (r) =>
          dayjs(r.appeared_time)
            .utc(0)
            .format(dateTimeFormat),
      },
      {
        title: t("store"),
        dataIndex: "client_name",
      },
      {
        title: t("action"),
        render: (r, text, index) =>
          staff_info.staff_dept_id == 133 ? (
            <>
              <Button
                className="mr-2"
                type="primary"
                size="small"
                icon={<FontAwesomeIcon icon={faFilter} />}
                onClick={() => {
                  window.scrollTo(0, 0);
                  this.setState({ page: 1, loading: true }, () => {
                    this.formRef.current.setFieldsValue({ id: r.customer_id });
                    this.getListFaceFilter({ id: r.customer_id });
                  });
                }}
              />
              <Button
                className="mr-2"
                type="primary"
                size="small"
                icon={<FontAwesomeIcon icon={faPen} />}
                onClick={() => this.openModalEdit(r)}
              />
              <DeleteButton
                onConfirm={(e) => this.onDeleteImg(e, r.id, index)}
              />
            </>
          ) : (
            []
          ),
      },
    ];
    return (
      <>
        <Form
          className="pt-3"
          ref={this.formRef}
          name="searchForm"
          onFinish={this.submitForm.bind(this)}
          layout="vertical"
        >
          <Row gutter={12}>
            <Col span={5}>
              <Form.Item name="id">
                <Select
                  onClick={this.onMouseEnter}
                  showSearch={true}
                  optionFilterProp="children"
                  filterOption={false}
                  placeholder={t("name")}
                  value={this.state.valueCustomer}
                  allowClear={true}
                  onSelect={(value) => this.setState({ valueCustomer: value })}
                  onChange={(value) => this.setState({ valueCustomer: value })}
                  onClear={(value) => this.setState({ valueCustomer: value })}
                  onSearch={(value) => this.onSearch(value)}
                >
                  {this.renderOptionsName()}
                </Select>
              </Form.Item>
            </Col>
            <Col span={5}>
              <Form.Item name="date">
                <RangePicker className="w-100" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="shop_id">
                <Dropdown datas={locations} defaultOption={t("hr:all_store")} />
              </Form.Item>
            </Col>
            <>
              <Col span={3}>
                <Form.Item name="is_customer">
                  <Dropdown
                    datas={typeCustomer}
                    defaultOption={t("hr:all_type")}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="view">
                  <Dropdown
                    datas={{
                      not_count: "Face success",
                      count_only: "Face fail",
                      all: "All",
                    }}
                    defaultOption={t("views")}
                  />
                </Form.Item>
              </Col>
              <Col span={3}>
                <Form.Item name="site">
                  <Dropdown
                    datas={{ spa: "Spa" }}
                    defaultOption={t("hr:mode_site")}
                  />
                </Form.Item>
              </Col>
              <Col span={3}>
                <Form.Item name="area_type">
                  <Dropdown
                    datas={{ 0: t("normal"), 1: t("hr:cashier") }}
                    defaultOption={t("hr:area_type")}
                  />
                </Form.Item>
              </Col>
            </>
            <Col span={4}>
              <Button
                type="primary"
                style={{ marginLeft: 8 }}
                htmlType="submit"
              >
                {t("search")}
              </Button>
              <Button
                type="primary"
                style={{ marginLeft: 4 }}
                onClick={() => this.setState({ visibleModalImg: true })}
              >
                <FontAwesomeIcon icon={faCamera} />
              </Button>
            </Col>
          </Row>
        </Form>
        <Table
          dataSource={this.state.datas}
          columns={columns}
          loading={this.state.loading}
          pagination={{
            total: this.state.total,
            pageSize: this.state.limit,
            hideOnSinglePage: true,
            showSizeChanger: false,
            current: this.state.page,
            onChange: (page) => this.onChangePage(page),
            showQuickJumper: true,
          }}
          rowKey={(project, index) => project.id}
          rowClassName={(r) => (r?.checked ? "bg-checked" : "")}
        />
      </>
    );
  }
  renderoptionCount() {
    return (
      <ListCustomerCount_v3
        change_language={this.props}
        onSearchCustomer_id={(customer_id, valuesForm = {}) => {
          valuesForm = {
            ...valuesForm,
            id: customer_id,
          };
          window.scrollTo(0, 0);
          this.setState(
            { page: 1, loading: true, option: optionDefault },
            () => {
              this.formRef.current.setFieldsValue(valuesForm);
              let values = this.formRef.current.getFieldsValue();
              values = {
                ...values,
                starting_date: values.date
                  ? values.date[0].startOf("day").format("YYYY-MM-DD")
                  : null,
                ending_date: values.date
                  ? values.date[1].endOf("day").format("YYYY-MM-DD")
                  : null,
              };
              delete values.date;
              this.getListFaceFilter(values);
            }
          );
        }}
      />
    );
  }
  renderoptionCashierUse() {
    return (
      <HistoryCashierUse_v3
        change_language={this.props}
        onSearchCustomer_id={(customer_id, valuesForm = {}) => {
          valuesForm = {
            ...valuesForm,
            id: customer_id,
          };
          window.scrollTo(0, 0);
          this.setState(
            { page: 1, loading: true, option: optionDefault },
            () => {
              this.formRef.current.setFieldsValue(valuesForm);
              let values = this.formRef.current.getFieldsValue();
              values = {
                ...values,
                starting_date: values.date
                  ? values.date[0].startOf("day").format("YYYY-MM-DD")
                  : null,
                ending_date: values.date
                  ? values.date[1].endOf("day").format("YYYY-MM-DD")
                  : null,
              };
              delete values.date;
              this.getListFaceFilter(values);
            }
          );
        }}
      />
    );
  }
  render() {
    let {
      t,
      baseData: { locations },
      auth: { staff_info },
    } = this.props;
    let { imageUrl } = this.state;
    return (
      <div>
        <PageHeader
          title={t("hr:face_log_debug") + "v2"}
          tags={[
            <Button
              key="create-user"
              type="primary"
              icon={<FontAwesomeIcon icon={faPlus} />}
              onClick={() => this.setState({ visibleModalAdd: true })}
            >
              &nbsp;{t("add_new")}
            </Button>,
          ]}
        />
        <Row className="card pl-3 pr-3 mb-3">
          <Tab tabs={tabListFaceRegconite(this.props)} />
        </Row>
        <Row gutter={[16, 24]}>
          <Col span={24} className="card p-3">
            <Tabs
              className="pb-3 pl-3"
              activeKey={String(this.state.option)}
              onChange={(value) => this.setState({ option: value })}
            >
              <Tabs.TabPane
                tab={t("face_log")}
                key={optionDefault}
              ></Tabs.TabPane>
              <Tabs.TabPane
                tab={t("hr:count")}
                key={optionCount}
              ></Tabs.TabPane>
              <Tabs.TabPane
                tab={t("hr:cashier_use")}
                key={optionCashierUse}
              ></Tabs.TabPane>
            </Tabs>
            {this.state.option == optionDefault
              ? this.renderOptionDefault()
              : this.state.option == optionCount
              ? this.renderoptionCount()
              : this.renderoptionCashierUse()}
          </Col>
        </Row>

        <Modal
          title={t("search_buy_image")}
          open={this.state.visibleModalImg}
          onCancel={() => this.setState({ visibleModalImg: false })}
          afterClose={() => this.setState({ file: [], imageUrl: null })}
          onOk={() => this.submitImage()}
        >
          <Spin spinning={this.state.loadingModalImg}>
            <Dragger
              fileList={this.state.file}
              accept={mineTypeImage}
              // size={5}
              // onChange={(e) => console.log(e)}
              onRemove={() => this.setState({ file: [], imageUrl: null })}
              listType="picture"
              beforeUpload={(file, fileList) => {
                if (!this.checkSize(file)) {
                  showNotify("Notification", t("hr:smaller_10mb"), "error");
                  return false;
                } else {
                  this.getBase64(file, (imageUrl) =>
                    this.setState({
                      imageUrl,
                      file: [file],
                    })
                  );
                  // this.setState({ file: [file] })
                }
                return false;
              }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Thumbnail"
                  style={{ width: "160px", height: "140px" }}
                />
              ) : (
                <>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    {t("hr:drap_drop_upload_image")}
                  </p>
                  <p className="ant-upload-hint"> {"hr:search_note"}</p>
                </>
              )}
            </Dragger>
            <Row className="mt-2">
              <span>{t("hr:accuracy")} :</span>
              <Col span={24}>
                <Slider
                  min={0.2}
                  max={1}
                  onAfterChange={(v) => {
                    this.setState({ valueSlide: v });
                  }}
                  step={0.01}
                />
              </Col>
            </Row>
          </Spin>
        </Modal>
        {this.state.visibleModalEdit ? (
          <ModalEditCustomer
            data={this.state.dataDetail}
            visible={this.state.visibleModalEdit}
            onCancel={() =>
              this.setState({ visibleModalEdit: false, dataDetail: {} })
            }
            onSubmitSuccess={() => {
              let values = this.formRef.current.getFieldsValue();
              this.getListFaceFilter(values);
              this.setState({ visibleModalEdit: false, dataDetail: {} });
            }}
          />
        ) : (
          []
        )}

        <Modal
          title={t("add")}
          open={this.state.visibleModalAdd}
          onCancel={() => this.setState({ visibleModalAdd: false })}
          onOk={() => this.handleSubmitAdd()}
          afterClose={() => {
            this.formAddRef.current.resetFields();
            this.setState({ imageUrl: null, file: [] });
          }}
        >
          <Spin spinning={this.state.loadingModalImg}>
            <Form
              ref={this.formAddRef}
              name="addForm"
              layout="vertical"
              autoComplete="off"
            >
              <Dragger
                fileList={this.state.file}
                accept={mineTypeImage}
                onRemove={() => this.setState({ file: [], imageUrl: null })}
                listType="picture"
                beforeUpload={(file, fileList) => {
                  if (!this.checkSize(file)) {
                    showNotify("Notification", t("hr:smaller_10mb"), "error");
                    return false;
                  } else {
                    this.getBase64(file, (imageUrl) =>
                      this.setState({
                        imageUrl,
                        file: [file],
                      })
                    );
                    // this.setState({ file: [file] })
                  }
                  return false;
                }}
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Thumbnail"
                    style={{ width: "160px", height: "140px" }}
                  />
                ) : (
                  <>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">
                      {t("hr:drap_drop_upload_image")}
                    </p>
                    <p className="ant-upload-hint"> {"hr:search_note"}</p>
                  </>
                )}
              </Dragger>
              <Row className="mt-2">
                <span>{t("hr:name")} </span>
                <Col span={24}>
                  <Form.Item name="user_name">
                    <Input placeholder={t("hr:name")} />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <span>{t("hr:user_id")}</span>
                <Col className="mt-2" span={24}>
                  <Form.Item
                    name="user_id"
                    hasFeedback
                    rules={[
                      {
                        required: true,
                        message: t("hr:input_id_number"),
                      },
                      {
                        pattern: new RegExp(/^[0-9]{1,}$/),
                        message: t("hr:invalid_id_number"),
                      },
                    ]}
                  >
                    <Input placeholder={t("hr:user_id")} />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <span>{t("hr:user_type")}</span>
                  <Col className="mt-2" span={24}>
                    <Form.Item
                      name={"user_type"}
                      hasFeedback
                      rules={[
                        {
                          required: true,
                          message: t("hr:input_user_type"),
                        },
                      ]}
                    >
                      <Dropdown datas={typeCustomer} />
                    </Form.Item>
                  </Col>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <span>{t("location")}</span>
                  <Col className="mt-2" span={24}>
                    <Form.Item
                      name={"shop_id"}
                      hasFeedback
                      rules={[
                        {
                          required: true,
                          message: t("hr:choose_location"),
                        },
                      ]}
                    >
                      <Dropdown datas={locations} />
                    </Form.Item>
                  </Col>
                </Col>
              </Row>
            </Form>
          </Spin>
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
const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ListCustomerV3);
