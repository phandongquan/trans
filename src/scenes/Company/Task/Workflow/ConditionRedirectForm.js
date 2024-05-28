import React, { useState, useRef, useEffect } from "react";
import { connect } from "react-redux";
import { Spin, Form, Row, Col, Input, Button, Divider, Popconfirm } from "antd";
import {
  EditOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import Dropdown from "~/components/Base/Dropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { getList as getListWorkFlowStep } from "~/apis/company/workflowStep";
import { getList as apiListWorkflowConfig } from "~/apis/company/workflowConfig";
import { update as updateWorkflow } from "~/apis/company/workflow";
import { update as updateWorkflowStep } from "~/apis/company/workflowStep";
import { workflowStepStop, workflowStepDoNothing } from '~/constants/basic';
import { conditions } from "./config";
import { checkPermission, showNotify } from "~/services/helper";
import "./config/conditionRedirect.scss";
import { uniqueId } from "lodash";
import {screenResponsive} from '~/constants/basic';

export const ConditionRedirectForm = (props) => {
  const [loading, setLoading] = useState(false);
  const [wfsteps, setWfSteps] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [datas, setDatas] = useState([]);
  const formRef = useRef(null);

  useEffect(() => {
    getListStep();
    const { wfid, wfstep_id } = props;
    // let params = {id: wfid};
    let params = {};
    if (typeof wfstep_id != "undefined" && wfstep_id) {
      params = { id: wfstep_id, is_step: 1 };
    } else {
      params = { id: wfid };
    }
    getWorkflowConfig(params);
  }, []);

  useEffect(() => {
    setDatas(props.workflow?.flow_configs || []);
  }, [props.wfid]);

  useEffect(() => {
    if (props.wfstep_id) {
      setDatas(props.workflowStep?.flow_configs || []);
    }
  }, [props.wfstep_id]);

  /**
   * Get list step
   */
  const getListStep = () => {
    let xhr = getListWorkFlowStep({ wfid: props.wfid, limit: -1, offset: 0 });
    xhr.then((response) => {
      if (response.status) {
        let { data: { rows = [] } } = response;
        rows.push(workflowStepStop);
        rows.push(workflowStepDoNothing);
        setWfSteps(rows);
      }
    });
  };

  /**
   * Get workflow config
   */
  const getWorkflowConfig = async (params = {}) => {
    let response = await apiListWorkflowConfig(params);
    if (response.status) {
      let { rows } = response.data;
      let result = [];
      rows.map((r) => result.push({ id: r.key, name: r.key }));
      setConfigs(result);
    }
  };

  /**
   * Check form empty
   * @param {*} values
   */
  const checkFormEmpty = (values) => {
    if (
      values.move_to == undefined &&
      values.conditions.length == 1 &&
      values.conditions[0]["when"] == null &&
      values.conditions[0]["cond"] == null &&
      values.conditions[0]["value"] == ""
    ) {
      return true;
    }
    return false;
  };

  /**
   * Submit form
   * @param {*} values
   */
  const submitForm = (values) => {
    const { wfid, wfstep_id, workflowStep, workflow } = props;
    setLoading(true);
    let data;
    let datasCopy = datas.slice();
    if (typeof values.index_edit != "undefined" && values.index_edit > -1) {
      if (typeof datasCopy[values.index_edit] != "undefined") {
        datasCopy[values.index_edit] = values;
        delete values.index_edit;
        data = { flow_configs: datasCopy };
      }
    } else {
      datasCopy = !checkFormEmpty(values) ? datas.concat([values]) : datas;
      data = { flow_configs: datasCopy };
    }

    let xhr;
    if (typeof wfstep_id != "undefined" && wfstep_id) {
      data.name = workflowStep?.name;
      xhr = updateWorkflowStep(wfstep_id, data);
    } else {
      data.name = workflow?.name;
      xhr = updateWorkflow(wfid, data);
    }
    xhr.then((res) => {
      setDatas(datasCopy);
      formRef.current.resetFields();
      setLoading(false);
      if (res.status) {
        showNotify("Notify", "Thành công!");
      } else {
        showNotify("Notify", res.message, "error");
      }
    });
  };

  /**
   * Delete condition
   * @param {*} cond
   */
  const deleteCond = (cond) => {
    let dataCopy = datas.slice();
    let index = dataCopy.findIndex((d) => d == cond);
    delete dataCopy[index];
    let dataFilter = dataCopy.filter(function (item) {
      return item !== null;
    });
    setDatas(dataFilter);
  };

  /**
   * Render conditions
   */
  const renderConditions = () => {
    let result = [];
    if (Array.isArray(datas)) {
      datas.map((d, index) => {
        let arrCond = [];
        if (typeof d.conditions != "undefined" && Array.isArray(d.conditions)) {
          d.conditions.map((cond) => {
            arrCond.push(
              <Row gutter={12} key={uniqueId("__cond")}>
                <Col span={7}>{cond.when}</Col>
                <Col span={7}>{cond.cond}</Col>
                <Col span={10}>{cond.value}</Col>
              </Row>
            );
          });
        }

        result.push(
          <Row className="flow_config_group" key={uniqueId("__group_cond")}>
            <Col span={12}>{arrCond}</Col>
            <Col span={12}>
              <Row gutter={12}>
                <Col span={8}>
                  {wfsteps.find((wfs) => wfs.id == d.move_to)?.name}
                </Col>
                <Col span={12}>{d.note}</Col>
                <Col span={4} className='d-flex justify-content-center'>
                  <div>
                    <Button
                      icon={<EditOutlined />}
                      type="primary"
                      size="small"
                      onClick={() => {
                        formRef.current.setFieldsValue({
                          ...d,
                          index_edit: index,
                        });
                        window.scrollTo({
                          left: 0,
                          top: document.body.scrollHeight,
                          behavior: "smooth",
                        });
                      }}
                    />
                    <Button
                      icon={<DeleteOutlined />}
                      danger
                      size="small"
                      className="ml-2"
                      onClick={() => deleteCond(d)}
                    />
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        );
      });
    }
    const {t} = props.translang
    return (
      <>
        <Row>
          <Col span={12}>
            <Row gutter={12}>
              <Col span={7} className="col_header">
                {t('when')}
              </Col>
              <Col span={7} className="col_header">
              {t('condition')}
              </Col>
              <Col span={10} className="col_header">
              {t('value')}
              </Col>
            </Row>
          </Col>
          <Col span={12}>
            <Row gutter={12}>
              <Col span={8} className="col_header">
                {t('move_to')}
              </Col>
              <Col span={12} className="col_header">
                {t('note')}
              </Col>
              <Col span={4} className="col_header"></Col>
            </Row>
          </Col>
        </Row>
        {result}
      </>
    );
  };
  const cloneListItem = (index) => {
    const values = formRef.current.getFieldValue('conditions'); 
    if (values) {
      const clonedItem = { ...values[index] };
      values.splice(index + 1, 0, clonedItem);
      formRef.current.setFieldsValue({ conditions: values });
    }
  };
  const {t} = props.translang
  return (
    <Spin spinning={loading}>
      <div className="table_cond_redirect">{renderConditions()}</div>
      <Divider className="mt-3 mb-0" />
      <Form
        ref={formRef}
        name="upsertStaffForm"
        className="ant-advanced-search-form pt-3"
        layout="vertical"
        onFinish={(values) => submitForm(values)}
        onKeyPress={(e) => {
          e.key === "Enter" && e.preventDefault();
        }}
      >
         <div className={window.innerWidth < screenResponsive  ? "block_scroll_data_table" : ""}>
            <div className=   {window.innerWidth < screenResponsive  ? "main_scroll_table" : ""}>
                <Row gutter={12}>
                  <Col span={14}>
                    <Row gutter={12}>
                      <Col span={19}>
                        <Row gutter={12}>
                            <Col span={8}>
                            <span className="text-muted"> {t('when')}</span>
                          </Col>
                          <Col span={5}>
                            <span className="text-muted"> {t('condition')}</span>
                          </Col>
                          <Col span={8}>
                            <span className="text-muted">{t('value')}</span>
                          </Col>    
                        </Row>
                      </Col>
                      
                    </Row>
                  
                      <Form.List
                        name="conditions"
                        label="Config"
                        initialValue={[{ when: null, cond: null, value: "" }]}
                      >
                        {(fields, { add, remove }) => (
                          <Row gutter={12}>
                            <Col span={19}>
                              {fields.map(({ key, name, fieldKey, ...restField }, index) => (
                                <Row gutter={12} key={key}>
                                  <Col span={8}>
                                    <Form.Item
                                      {...restField}
                                      name={[name, "when"]}
                                      fieldKey={[fieldKey, "when"]}
                                    >
                                      <Dropdown
                                        datas={configs}
                                        defaultOption="--- Key ----"
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={5}>
                                    <Form.Item
                                      {...restField}
                                      name={[name, "cond"]}
                                      fieldKey={[fieldKey, "cond"]}
                                    >
                                      <Dropdown
                                        datas={conditions}
                                        defaultOption="- Condition -"
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span={5}>
                                    <Form.Item
                                      {...restField}
                                      name={[name, "value"]}
                                      fieldKey={[fieldKey, "value"]}
                                    >
                                      <Input placeholder="Value" />
                                    </Form.Item>
                                  </Col>
                                  <Col span={4}>
                                    <div className="d-flex">
                                    <MinusCircleOutlined
                                      className="mt-2"
                                      onClick={() => {
                                        remove(name);
                                      }}
                                    />
                                    <Button
                                      className='ml-2'
                                      type="dashed"
                                      block
                                      onClick={() => cloneListItem(index)}
                                    >Clone</Button>
                                    </div>
                                  </Col>
                                </Row>
                              ))}
                            </Col>
                            <Col span={5} className="d-flex align-items-end">
                              <Form.Item>
                                <Button
                                  type="dashed"
                                  onClick={() => add()}
                                  block
                                  icon={<PlusOutlined />}
                                >
                                  {t('and')}
                                </Button>
                              </Form.Item>
                            </Col>
                          </Row>
                        )}
                      </Form.List>
                  
                  </Col>
                  <Col span={10}>
                    <Row gutter={12}>
                      <Col span={12}> <span className="text-muted">{t('move_to')}</span></Col>
                      <Col span={12}> <span className="text-muted">{t('note')}</span></Col>
                    </Row>

                    <Row gutter={12}>
                      <Form.Item name="index_edit" hidden>
                          <Input hidden />
                      </Form.Item>     
                      <Col span={12}>
                        <Form.Item name="move_to">
                          <Dropdown
                            datas={wfsteps}
                            defaultOption={t('wl_step')}
                          />
                        </Form.Item>     
                      </Col>
                      <Col span={12}>                
                        <Form.Item name="note">
                          <Input placeholder={t('note')} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                </Row>
            </div>
        </div>
        {
          props.checkPermissionEdit ?
            <Row gutter={12} className="">
              <Col span={24} key="bnt-submit" style={{ textAlign: "right" }}>
                {
                  checkPermission('hr-workflow-update') ? 
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                  >
                   {t('save')}
                  </Button>
                  : []
                }                
              </Col>
            </Row>
            : []
        }
      </Form>
    </Spin>
  );
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConditionRedirectForm);
