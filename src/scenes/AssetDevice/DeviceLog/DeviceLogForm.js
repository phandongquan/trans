import { connect } from "react-redux";
import React, { Component } from "react";
import { withTranslation } from 'react-i18next';
import { Form, Row, Col, Input, Button, Divider, List, Modal, DatePicker, Spin } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import Tab from "~/components/Base/Tab";
import tabList from "../config/tabList";
import Dropdown from "~/components/Base/Dropdown";
import UploadMultiple from "~/components/Base/UploadMultiple";
import { dateFormat, mineTypeImage, mineTypeVideo } from "~/constants/basic";
import AssetDropdown from "../config/AssetDropdown";
import { getMaintenaceByAsset } from "~/apis/assetDevice/group";
import { RollbackOutlined } from "@ant-design/icons";
import { saveLog, list as apiCriterionLog } from "~/apis/assetDevice/criterion_log";
import { convertToFormData, cleanObject, showNotify, timeFormatStandard, historyParams } from "~/services/helper";
import { ExclamationCircleOutlined } from '@ant-design/icons'
import "./config/deviceLogForm.scss";
import { resultDeviceLog } from './config/deviceLogForm'
import dayjs from "dayjs";
import { MEDIA_URL_HR } from "~/constants";
import { typeAsset, typeAssetDevice, typeAssetLocation } from '../config'

export class DeviceLogForm extends Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.formAssetRef = React.createRef();
    this.state = {
      loading: false,
      criterions: [],
      parts: [],

      assetId: null,
      part: null,
      criterion: null,
      showSolutionNext: false,

      type: typeAssetDevice
    };

    this.aUploadRef = null;
    this.bUploadRef = null;
  }

  async componentDidMount() {
    if(this.formAssetRef.current) {
      this.formAssetRef.current.setFieldsValue({type: this.state.type})
    }

    let params = historyParams()
    if(params) {
      if(params.date) {
        params.date = dayjs(params.date)
      }
      if(params.type) {
        await this.setState({ type: params.type })
      }

      this.formAssetRef.current.setFieldsValue(params)
      if(params.asset_id) {
        this.onChangeAsset(params.asset_id)
      }
    }
  }

  /**
   * On change asset
   * @param {*} id
   */
  onChangeAsset = (id) => {
    const { type } = this.state;
    this.setState({ parts: [], criterions: [], assetId: id });
    let xhr = getMaintenaceByAsset(id, { type });
    xhr.then((res) => {
      let { data } = res;
      if (data && data.asset_device_part) {
        this.setState({ parts: data.asset_device_part });
      }
    });
  };

  /**
   * OnChange part
   * @param {*} partId
   */
  onChangePart = (part) => {
    this.setState({ part, criterions: part.criterions, criterion: null });
  };

  /**
   * Render parts
   * @returns
   */
  renderParts = () => {
    const { parts, part } = this.state;
    return (
      <List
        className="card"
        size="small"
        header={<strong>Bộ phận</strong>}
        bordered
        dataSource={parts}
        renderItem={(item) => (
          <List.Item
            className={`cursor-pointer ${part == item ? "active" : ""}`}
            onClick={() => this.onChangePart(item)}
          >
            {item.name}
          </List.Item>
        )}
      />
    );
  };

  /**
   * Render criterions
   */
  renderCriterions = () => {
    const { criterions, criterion } = this.state;
    return (
      <List
        className="card"
        size="small"
        header={<strong>Tiêu chuẩn</strong>}
        bordered
        dataSource={criterions}
        renderItem={(crt) => (
          <List.Item
            className={`cursor-pointer ${criterion == crt ? "active" : ""}`}
            onClick={() => this.onChangeCriterion(crt)}
          >
            {crt.name}
          </List.Item>
        )}
      />
    );
  };

  /**
   * OnChange criterion
   */
  onChangeCriterion = (item) => {

    // Reset form and upload
    if(this.formRef && this.formRef.current) {
        this.formRef.current.resetFields()
    }
    this.setState({ criterion: item })

    if(this.aUploadRef) {
      this.aUploadRef.resetForm()
    }

    if(this.bUploadRef) {
      this.bUploadRef.resetForm()
    }

    // Load criterion log
    if(this.formAssetRef.current) {
      let values = this.formAssetRef.current.getFieldsValue();
      if(values.date) {
        const { assetId } = this.state;
        let date = timeFormatStandard(values.date, dateFormat)
        this.getCriterionLogDetail({ date, asset_id: assetId, crit_id: item.id })
      }
    }
  };

  /**
   * Get criterion log detail
   * @param {*} params 
   */
  getCriterionLogDetail = params => {
    let xhr = apiCriterionLog(params)
    xhr.then(res => {
      if(res.status) {
        if(typeof res.data.rows[0] != 'undefined') {
          if(this.formRef.current) {
            let data = res.data.rows[0]
            this.formRef.current.setFieldsValue(data)

            if(data.images_after) {
              let imgA = [];
              data.images_after.map((i, index) => {
                let name = i.split('\\');
                imgA.push({
                  uid: 'history_image_after_' + index,
                  name: name[name.length - 1],
                  status: 'done',
                  url: MEDIA_URL_HR + i,
                  fileRaw: i
                })
                this.aUploadRef.setValues({historyFileList: imgA })
              })
            }

            if(data.images_before) {
              let imgB = [];
              data.images_before.map((i, index) => {
                let name = i.split('\\');
                imgB.push({
                  uid: 'history_image_before_' + index,
                  name: name[name.length - 1],
                  status: 'done',
                  url: MEDIA_URL_HR + i,
                  fileRaw: i
                })
                this.bUploadRef.setValues({historyFileList: imgB })
              })
            }
          }
        }
      }
    })
  }

  /**
   * Submit form
   * @param {*} values
   */
  submitForm = (values) => {
    this.setState({ loading: true });
    const { criterion, showSolutionNext, assetId } = this.state;
    let id = criterion.id;

    let valueAssetForm = this.formAssetRef.current.getFieldsValue();
    values = {
      ...values,
      ...valueAssetForm,
    }

    if(values.date) {
      values.date = timeFormatStandard(values.date, dateFormat)
    }

    if(!showSolutionNext) {
      delete(values.solution_next);
    }

    values = cleanObject(values);
    let formData = convertToFormData(values);

    let bdataUpload = this.bUploadRef.getValues();
    if (bdataUpload.fileList && Array.isArray(bdataUpload.fileList)) {
      bdataUpload.fileList.map((f) => formData.append("images_before[]", f));
    }

    if (bdataUpload.removeFileList && Array.isArray(bdataUpload.removeFileList)) {
      bdataUpload.removeFileList.map((f) => formData.append("remove_file_b[]", f));
    }

    let adataUpload = this.aUploadRef.getValues();
    if (adataUpload.fileList && Array.isArray(adataUpload.fileList)) {
      adataUpload.fileList.map((f) => formData.append("images_after[]", f));
    }

    if (adataUpload.removeFileList && Array.isArray(adataUpload.removeFileList)) {
      adataUpload.removeFileList.map((f) => formData.append("remove_file_a[]", f));
    }

    let xhr = saveLog(id, formData);
    xhr.then((res) => {
      this.setState({ loading: false });
      if (res.status) {
        showNotify('Thêm thành công!');
        this.props.history.push(`/asset-device/criterion-log?asset_id=${assetId}&date=${values.date ? values.date : Date('Y-m-d')}&type=${values.type}`);
      } else {
        showNotify("Notify", res.message, "error");
      }
    });
  };

  /**
   * Onchange type
   * @param {*} type 
   */
  onChangeType = type => {
    if(this.formAssetRef.current) {
      this.formAssetRef.current.setFieldsValue({
        asset_id: null
      })
    }
    this.setState({ type })
  }

  render() {
    const {t, baseData: { locations }} = this.props;
    const { part, criterion, assetId, showSolutionNext, type } = this.state;
    return (
      <div className="device-log">
        <PageHeader title={t('add_new') + t(' ') + t('maintenance_history')} />
        <Row className="card mb-3 p-3">
          <Tab tabs={tabList(this.props)} />
        </Row>

        <Row gutter={12}>
          <Col span={12}>
            <Form ref={this.formAssetRef} className="mb-1">
              <Row gutter={1}>
                <Col span={24}>
                  <Row gutter={12}>
                    <Col span={4}>
                      <Form.Item name="type"> 
                        <Dropdown
                          datas={typeAsset}
                          defaultOption={t('type')}
                          allowClear={false}
                          onChange={type => this.onChangeType(type)}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="asset_id">
                        {type == typeAssetDevice ? (
                          <AssetDropdown
                            onChange={(assetId) => this.onChangeAsset(assetId)}
                            defaultOption={t('device')}
                            value={assetId}
                          />
                        ) : (
                          <Dropdown datas={locations} defaultOption={t('hr:branch')} onChange={(assetId) => this.onChangeAsset(assetId)} />
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="date">
                        <DatePicker className="w-100" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Form>
            <Row gutter={12}>
              <Col span={12}>{this.renderParts()}</Col>
              <Col span={12}>{this.renderCriterions()}</Col>
            </Row>
          </Col>
          <Col span={12}>
            {part && criterion ? (
              <Form
                ref={this.formRef}
                layout="vertical"
                onFinish={(values) => this.submitForm(values)}
              >
                <Spin spinning={this.state.loading}>
                  <Row className="card p-3">
                    <h5>{criterion.name}</h5>
                    <Divider className="m-0 mb-2" />
                    <Row gutter={12}>
                      <Col span={24}>
                        <Form.Item
                          name="current_status"
                          label={t('hr:device_status')}
                          rules={[
                            {
                              required: true,
                              message:t('hr:please_inut')+ t('hr:device_status'),
                            },
                          ]}
                        >
                          <Input.TextArea
                            rows={3}
                            placeholder={t('hr:device_status')}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item name="solution" label={t('hr:treatment_measures')}>
                          <Input.TextArea
                            rows={3}
                            placeholder={t('hr:treatment_measures')}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={12}>
                      <Col span={24}>
                        <Form.Item name="status" label={t('result')}>
                          <Dropdown
                            datas={resultDeviceLog}
                            defaultOption={t('result')}
                            onChange={(value) =>
                              this.setState({ showSolutionNext: value != "OK" })
                            }
                          />
                        </Form.Item>
                      </Col>
                      {showSolutionNext ? (
                        <Col span={24}>
                          <Form.Item
                            name="solution_next"
                            label={t('hr:solution_next_step')}
                          >
                            <Input.TextArea
                              rows={3}
                              placeholder={t('hr:solution_next_step')}
                            />
                          </Form.Item>
                        </Col>
                      ) : (
                        ""
                      )}
                    </Row>
                    <Row gutter={12}>
                      <Col span={24}>
                        <Form.Item
                          label=  {t('hr:image_before_maintenance')}
                          extra="Support upload Image/Video with size max 30MB"
                        >
                          <UploadMultiple
                            type={[...mineTypeVideo, ...mineTypeImage]}
                            size={30}
                            onRef={(ref) => {
                              this.aUploadRef = ref;
                            }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={12}>
                      <Col span={24}>
                        <Form.Item
                          label={t('hr:image_after_maintenance')}
                          extra="Support upload Image/Video with size max 30MB"
                        >
                          <UploadMultiple
                            type={[...mineTypeVideo, ...mineTypeImage]}
                            size={30}
                            onRef={(ref) => {
                              this.bUploadRef = ref;
                            }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={12}>
                      <Col span={24}>
                        <Form.Item label={t('note')} name="note">
                          <Input.TextArea rows={4} placeholder={t('note')}/>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Divider className="m-0" />
                    <Row gutter={24} className="pt-3">
                      <Col span={12} key="btn-back">
                        <Button type="primary" htmlType="submit">
                        {t('submit')}
                        </Button>
                      </Col>
                      <Col
                        span={12}
                        key="bnt-submit"
                        style={{ textAlign: "right" }}
                      >
                        <Button
                          type="default"
                          icon={<RollbackOutlined />}
                          onClick={() => this.props.history.goBack()}
                        >
                          {t('cancel')}
                        </Button>
                      </Col>
                    </Row>
                  </Row>
                </Spin>
              </Form>
            ) : (
              ""
            )}
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  baseData: state.baseData
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(DeviceLogForm));
