import React, { useRef } from "react";
import { connect } from "react-redux";
import { Modal, Form, Row, Col, Input } from "antd";
import kpiConfigGroupKpi from "~/apis/company/task/kpiConfig/group";
import { showNotify } from "~/services/helper";
import { useEffect } from "react";
import {screenResponsive} from '~/constants/basic';
export const GroupForm = (props) => {
  const formRef = useRef(null);

  /**
   * useEffect
   */
  useEffect(() => {
    if (!props.visible && formRef.current) {
      formRef.current.resetFields();
    }
  }, [props.visible]);

  /**
   * useEffect
   */
  useEffect(() => {
    if (props.group && formRef.current) {
      formRef.current.setFieldsValue(props.group);
    }
  }, [props.group]);

  /**
   * Handle submit form
   */
  const handleSubmitForm = () => {
    formRef.current
      .validateFields()
      .then((values) => {
        submitForm(values);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  /**
   * Submit form
   * @param {*} values
   */
  const submitForm = (values) => {
    let xhr = kpiConfigGroupKpi.update(props.group?.id || 0, values);
    xhr.then((res) => {
      if (res.status) {
        props.setVisible(false);
        props.refreshData();
      } else {
        showNotify("Notify", res.message);
      }
    });
  };
  const {t} = props.translang;
  return (
    <Modal
      open={props.visible}
      width={window.innerWidth < screenResponsive ? "100%" : "40%"}
      title={t("group")}
      onCancel={() => props.setVisible(false)}
      onOk={() => handleSubmitForm()}
    >
      <Form
        ref={formRef}
        layout="vertical"
        onFinish={(values) => submitForm(values)}
      >
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item name="code" label={t("code")}>
              <Input placeholder={t("code")}/>
            </Form.Item>
            <Form.Item
              name="name"
              label={t('name')}
              rules={[{ required: true, message: t('please_input') +(' ') + t('name') }]}
            >
              <Input placeholder={t('name')} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(GroupForm);
