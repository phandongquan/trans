import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { Row, Col, Form, Button, Input, Spin, Modal, Space } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import Dropdown from "~/components/Base/Dropdown";
import kpiConfigApi from "~/apis/company/task/kpiConfig";
import { Link } from "react-router-dom";
import { showNotify } from "~/services/helper";
import {screenResponsive} from '~/constants/basic';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
export const KpiConfigModal = (props) => {
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);

  // Props
  const {
    config,
    setConfig,
    visible,
    setVisible,
    refreshRecord,
    addRecord,
    type,
    standardType,
    timingUnit,
    status,
    group,
    baseData: { departments, divisions, majors, locations },
  } = props;

  useEffect(() => {
    if (props.config) {
      let configs = props.config;
      configs.department_id = String(configs.department_id);
      formRef.current.setFieldsValue(configs);
    }
  }, [props.config]);

  useEffect(() => {
    if (!props.visible) {
      if (formRef.current) {
        formRef.current.resetFields();
      }
    }
  }, [props.visible]);

  /**
   * Handle submit form
   */
  const handleSumbitForm = () => {
    formRef.current
      .validateFields()
      .then((values) => {
        onSubmit(values);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  /**
   * OnSubmit form
   */
  const onSubmit = (values) => {
    setLoading(true);
    let xhr;
    let message;
  

    // Format data
    values["department_id"] = values["department_id"] || 0;
    values["timing_unit"] = values["timing_unit"] || "";
    if (config?.id) {
      xhr = kpiConfigApi.update(config.id, values);
      message = "Cập nhật thành công!";
    } else {
      xhr = kpiConfigApi.insert(values);
      message = "Thêm thành công!";
    }
    xhr.then((res) => {
      setLoading(false);
      if (res.status) {
        setVisible(false);
        showNotify("Notify", message);

        if (config?.id) {
          refreshRecord(res.data);
        } else {
          addRecord(res.data);
        }
      } else {
        showNotify("Notify", res.message, "error");
      }
    });
  };
  const {t} = props.translang
  return (
    <Modal
      open={visible}
      width={window.innerWidth < screenResponsive ? "100%" : "60%"}
      title={t('hr:kpi_config')}
      onCancel={() => {
        setVisible(false);
        setConfig(null);
      }}
      onOk={() => handleSumbitForm()}
    >
      <Spin spinning={loading}>
        <Form
          layout="vertical"
          ref={formRef}
          onFinish={(values) => onSubmit(values)}
        >
          <Row gutter={24}>
            <Col xs={24} sm={24} md={24} lg={18} xl={18}>
              <Form.Item
                name="criterion"
                label={t('hr:criterion')}
                rules={[{ required: true, message: t('please_input') +(' ') + t('hr:criterion')}]}
              >
                <Input placeholder={t('hr:criterion')} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
              <Form.Item
                name="code"
                label= {t('code')}
                rules={[{ required: true, message: t('please_input') +(' ') + t('hr:code') }]}
              >
                <Input placeholder="Code" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
              <Form.Item
                name="type"
                label={t('type')}
                rules={[{ required: true, message: t('please_select') +(' ') + t('type')}]}
              >
                <Dropdown datas={type} defaultOption={t('type')} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
              <Form.Item
                name="group_id"
                label={t('group')}
                rules={[{ required: true, message: t('please_select') +(' ') + t('group') }]}
              >
                <Dropdown datas={group} defaultOption={t('group')} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
              <Form.Item
                name="standard_type"
                label={t('hr:standard_type')}
                rules={[
                  { required: true, message: t('please_select') +(' ') + t('hr:standard_type')  },
                ]}
              >
                <Dropdown
                  datas={standardType}
                  defaultOption={t('hr:standard_type')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
              <Form.Item
                name="status"
                label={t('hr:status')}
                initialValue={0}
                rules={[{ required: true, message: t('please_select') +(' ') + t('hr:status')  }]}
              >
                <Dropdown datas={status} defaultOption={t('hr:status') } />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <Form.Item name="timing_unit" label={t("hr:timing_unit")}>
                <Dropdown
                  datas={timingUnit}
                  defaultOption={t("hr:timing_unit")}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="timing_target"
                label={t("hr:target") + ('(') +  t("hr:muntes_unit") + (')')}
              >
                <Input
                  placeholder={t("hr:target") + ('(') +  t("hr:muntes_unit") + (')')}
                  suffix="Minutes or %"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <Form.Item name="timing_target_money" label={ t("hr:target") + ('(') + t("hr:vnd_unit") + (')')}>
                <Input placeholder={ t("hr:target") + ('(') + t("hr:vnd_unit") + (')')} suffix="VNĐ" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <Form.Item name="department_id" label={t('dept')}>
                <Dropdown
                  datas={departments}
                  defaultOption={t('dept')}
                  takeZero={false}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <Form.Item name="division_id" label={t('division')}>
                <Dropdown
                  mode="multiple"
                  datas={divisions}
                  defaultOption={t('division')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <Form.Item name="major_id" label={t('major')}>
                <Dropdown
                  mode="multiple"
                  datas={majors}
                  defaultOption={t('hr:all_major')}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.List name="data">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                    <Row gutter={24}>
                      <Col span={11}>
                        <Form.Item 
                        {...restField} 
                        name={[name, "location_id"]}
                        label={t('location')}>
                          <Dropdown
                            // mode="multiple"
                            datas={locations}
                            defaultOption={t('location')}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={11}>
                        <Form.Item
                          {...restField} 
                          name={[name, 'timing_target_day']}
                          label="Target (VNĐ/Day)"
                        >
                          <Input placeholder={t('hr:target_vnd_day')} suffix="Day" />
                        </Form.Item>
                      </Col>
                      <Col span={2} >
                        <MinusCircleOutlined style={ {marginTop: "37px", color:"#f5222d"}} onClick={() => remove(name)} />
                      </Col>
                    </Row>
                ))}
                <Form.Item>
                  <Button
                   type="primary"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    {t('add_new')}
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </Spin>
    </Modal>
  );
};

const mapStateToProps = (state) => ({
  baseData: state.baseData,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(KpiConfigModal);
