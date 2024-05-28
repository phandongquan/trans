import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { Row, Col, Form, Button, Input, Spin } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { RollbackOutlined } from "@ant-design/icons";
import Dropdown from "~/components/Base/Dropdown";
import kpiConfigApi from "~/apis/company/task/kpiConfig";
import { Link } from "react-router-dom";
import { showNotify } from "~/services/helper";

export const KpiConfigForm = (props) => {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState(null);
  const [type, setType] = useState([]);
  const [standardType, setStandardType] = useState([]);
  const [timingUnit, setTimingUnit] = useState([]);
  const [status, setStatus] = useState([]);
  const [group, setGroup] = useState([]);
  const formRef = useRef(null);

  useEffect(() => {
    const { params } = props.match;
    getDetail(params?.id || 0);
  }, []);

  /**
   * Get detail config
   * @param {*} id
   */
  const getDetail = (id) => {
    setLoading(true);
    let xhr = kpiConfigApi.detail(id);
    xhr.then((res) => {
      setLoading(false);
      if (res.status) {
        // Set constant
        setConfig(res.data.detail);
        setGroup(res.data.group);
        if (Array.isArray(res.data?.type)) {
          let type = [];
          res.data.type.map((t, i) => type.push({ id: i, name: t }));
          setType(type);
        }
        if (Array.isArray(res.data?.standard_type)) {
          let standardTypes = [];
          res.data.standard_type.map((t, i) =>
            standardTypes.push({ id: i, name: t })
          );
          setStandardType(standardTypes);
        }
        if (Array.isArray(res.data?.status)) {
          let status = [];
          res.data.status.map((t, i) => status.push({ id: i, name: t }));
          setStatus(status);
        }
        if (Array.isArray(res.data?.timing_unit)) {
          let timingUnit = [];
          res.data.timing_unit.map((t, i) =>
            timingUnit.push({ id: t, name: t })
          );
          setTimingUnit(timingUnit);
        }

        // Set form
        if (formRef.current) {
          let { detail } = res.data;
          if (detail) {
            detail.timing_unit = detail.timing_unit || null;
            detail.department_id = String(detail.department_id);
            formRef.current.setFieldsValue(detail);
          }
        }
      } else {
        showNotify("Notify", res.message, "error");
      }
    });
  };

  /**
   * OnSubmit form
   */
  const onSubmit = (values) => {
    setLoading(true);
    const { params } = props.match;
    let xhr;
    let message;

    // Format data
    values["department_id"] = values["department_id"] || 0;
    values["timing_unit"] = values["timing_unit"] || "";

    if (params?.id) {
      xhr = kpiConfigApi.update(params.id, values);
      message = "Cập nhật thành công!";
    } else {
      xhr = kpiConfigApi.insert(values);
      message = "Thêm thành công!";
    }
    xhr.then((res) => {
      setLoading(false);
      if (res.status) {
        setConfig(res.data);
        showNotify("Notify", message);
        props.history.push("/company/kpiconfig");
      } else {
        showNotify("Notify", res.message, "error");
      }
    });
  };

  const { departments, divisions, majors } = props.baseData;
  return (
    <>
      <PageHeader title="Kpi Config Add New" />
      <Row className="card p-3">
        <Spin spinning={loading}>
          <Form
            layout="vertical"
            ref={formRef}
            onFinish={(values) => onSubmit(values)}
          >
            <Row gutter={24}>
              <Col span={18}>
                <Form.Item
                  name="criterion"
                  label="Criterion"
                  rules={[
                    { required: true, message: "Please input criterion" },
                  ]}
                >
                  <Input placeholder="Criterion" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="code"
                  label="Code"
                  rules={[{ required: true, message: "Please input code" }]}
                >
                  <Input placeholder="Code" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={6}>
                <Form.Item
                  name="type"
                  label="Type"
                  rules={[{ required: true, message: "Please select type" }]}
                >
                  <Dropdown datas={type} defaultOption="--- Type ---" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="group_id"
                  label="Group"
                  rules={[{ required: true, message: "Please select group" }]}
                >
                  <Dropdown datas={group} defaultOption="--- Group ---" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="standard_type"
                  label="Standard Type"
                  rules={[
                    { required: true, message: "Please select standard type" },
                  ]}
                >
                  <Dropdown
                    datas={standardType}
                    defaultOption="--- Standard Type ---"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  name="status"
                  label="Status"
                  initialValue={0}
                  rules={[{ required: true, message: "Please select status" }]}
                >
                  <Dropdown datas={status} defaultOption="--- Status ---" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item name="timing_unit" label="Timing Unit">
                  <Dropdown
                    datas={timingUnit}
                    defaultOption="--- Timing Unit ---"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="timing_target"
                  label="Target ((Giây hoặc %)/Unit)"
                >
                  <Input
                    placeholder="Target (Giây hoặc %)/Unit"
                    suffix="Giây hoặc %"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="timing_target_money"
                  label="Target (VNĐ/Unit)"
                >
                  <Input placeholder="Target (VNĐ/Unit)" suffix="VNĐ" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item name="department_id" label="Department">
                  <Dropdown
                    datas={departments}
                    defaultOption="--- All Department ---"
                    takeZero={false}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="division_id" label="Division">
                  <Dropdown
                    mode="multiple"
                    datas={divisions}
                    defaultOption="--- All Division ---"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="major_id" label="Major">
                  <Dropdown
                    mode="multiple"
                    datas={majors}
                    defaultOption="--- All Major ---"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24} className="pt-3">
              <Col span={12} key="btn-back">
                <Button type="primary" htmlType="submit">
                  Submit
                </Button>
              </Col>
              <Col span={12} key="bnt-submit" style={{ textAlign: "right" }}>
                <Link to={`/company/kpiconfig`}>
                  <Button type="default" icon={<RollbackOutlined />}>
                    Cancel
                  </Button>
                </Link>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Row>
    </>
  );
};

const mapStateToProps = (state) => ({
  baseData: state.baseData,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(KpiConfigForm);
