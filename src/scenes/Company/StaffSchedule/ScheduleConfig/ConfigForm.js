import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next';
import { Row, Col, Form, DatePicker, Button, Divider, Spin, Card, Calendar, TreeSelect, Input, Modal } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import Dropdown from '~/components/Base/Dropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';
import BackButton from '~/components/Base/BackButton';
import '../config/configschedule.css'
import { createConfig, detailConfig  ,updateConfig} from '~/apis/company/staffSchedule/ConfigSchedule';
import { showNotify } from '~/services/helper';
import { daySchedule , leaveTypes } from '~/constants/basic';
import { getShifts } from '~/apis/company/timesheet'
import { uniqueId } from 'lodash';

import {screenResponsive} from '~/constants/basic';

const { TreeNode } = TreeSelect;
export class ConfigScheduleForm extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.formTypeRef = React.createRef();
        this.state = {
            loading: false,
            data: {},
            schedule : ['' ,'' , '' ,'' ,'' ,'',''],
            breakTimes : {},
            shifts: [],
            visible : false,
            indexShiftCode : -1,
        }
    }
    async componentDidMount(){
        await this.getArrayShifts();
        this.renderBreakTime();

        let { id } = this.props.match.params;
        if (id) {
            this.getDetail(id);
        }
    }
    /**
     * get array shift
     */
     getArrayShifts = async () => {
        let response = await getShifts();
        if (response.status) {
            this.setState({ shifts: response.data })
        }
    }
    /**
     * render break time from shift to dropdown
     */
     async renderBreakTime() {
        let { shifts } = this.state;
        let arrShifts = [];
        Object.keys(shifts).map((i, index) => {
            arrShifts[i] = `${i} (${shifts[i]})`;
        })
        this.setState({ breakTimes: { ...arrShifts, ...leaveTypes } })
        return false;
    }
    async getDetail(id){
        let response = await detailConfig(id);
        if (response.status) {
            this.setState({data : response.data , schedule : response.data.schedule})
            this.formRef.current.setFieldsValue(response.data)

        }else{
            showNotify('Notification' , response.message , 'error')
        }
    }
    onChangeShift_code(value){
        let { indexShiftCode} = this.state
        let newSchedule = this.state.schedule.slice()
        newSchedule[indexShiftCode] = value
        this.setState({schedule : newSchedule , visible : false})
    }
    submitForm(){
        this.setState({loading: true})
        let { id } = this.props.match.params;
        let {schedule} = this.state
        let values = this.formRef.current.getFieldsValue()
        let data = {
            ...values,
            schedule : schedule
        }
        let xhr;
        if (id) {
            xhr = updateConfig(id, data);
        }
        else
            xhr = createConfig(data);

        xhr.then(response => {
            this.setState({ loading: false })
            if (response.status) {
                showNotify('Notification', 'Save Success!')
            } else {
                showNotify('Notification', response.message, 'error')
            }
        })
    }

    /**
     * Render option treeSelect Departments & Sections
     */
     renderOptionDeptSection = () => {
        let { t, baseData: { departments, divisions } } = this.props;
        let result = [];
        result.push(<TreeNode key='0' value="0" title='All Section'></TreeNode>)
        departments.map(d => {
            result.push(
                <TreeNode key={d.id} value={String(d.id)} title={d.name}>
                    {
                        divisions.map(div => {
                            if(div.parent_id == d.id)
                                return <TreeNode key={div.id} value={String(div.id)} title={div.name}></TreeNode>
                        })
                    }
                </TreeNode>
            )
        })
        return result;
    }

    render() {
        let { t, baseData: { departments, locations, divisions, positions, majors } } = this.props;
        let {schedule} = this.state
        let { id } = this.props.match.params;
        let title = id ? 'Edit' : 'Add new'
        return (
          <div>
            <PageHeader title={title} />
            <Row
              className="pl-3 pr-3 mb-3"
              style={{
                boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
                background: "#fff",
              }}
            >
              <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                <Form
                  ref={this.formRef}
                  name="config-search-form"
                  className="p-3"
                  layout="vertical"
                  // onFinish={this.submitForm.bind(this)}
                >
                  <Row className="" gutter={[12, 0]}>
                    <Col span={24}>
                      <Form.Item name="title" label={<strong>Title</strong>}>
                        <Input placeholder="Name" />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        name="department_id"
                        label={t("Department & Section")}
                      >
                        <TreeSelect
                          multiple={true}
                          showSearch
                          style={{ width: "100%" }}
                          placeholder={t("-- Select Department & Section --")}
                          allowClear
                          treeDefaultExpandAll
                        >
                          {this.renderOptionDeptSection()}
                        </TreeSelect>
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                      <Form.Item
                        name="location_id"
                        label={<strong>Location</strong>}
                      >
                        <Dropdown
                          datas={locations}
                          defaultOption="-- All Location --"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                      <Form.Item name="major_id" label={<strong>Major</strong>}>
                        <Dropdown
                          datas={majors}
                          defaultOption="-- All Major --"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item name="note" label={<strong>Note</strong>}>
                        <Input.TextArea autoSize={{ minRows: 5 }} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Col>
              <Col xs={24} sm={24} md={24} lg={16} xl={16} >
                <div className="calendar-config-schedule p-3">
                  <strong>Schedule</strong>
                  {window.innerWidth < screenResponsive  ?                       
                      <div className='block_scroll_data_table'>
                          <div className='main_scroll_table'>
                            
                            <table className="table-calendar-config-schedule w-100">
                              <tbody>
                                <tr>
                                  {schedule.map((v, index) => {
                                    return (
                                      <th key={uniqueId('__schedule')} style={{ width: "14%" }}>
                                        <strong
                                          className="ml-2"
                                          style={{ color: !index ? "red" : "" }}
                                        >
                                          {daySchedule[index]}
                                        </strong>
                                      </th>
                                    );
                                  })}
                                </tr>
                                <tr>
                                  {schedule.map((v, index) => {
                                    return (
                                      <td
                                      key={uniqueId('__schedule')}
                                        className="body-calendar border"
                                        style={{ width: "14%" }}
                                        onClick={() =>
                                          this.setState({
                                            visible: true,
                                            indexShiftCode: index,
                                          })
                                        }
                                      >
                                        <strong>{v}</strong>
                                      </td>
                                    );
                                  })}
                                </tr>
                              </tbody>
                            </table>
                          </div>
                      </div>                  
                  :
                    <table className="table-calendar-config-schedule w-100">
                      <tbody>
                        <tr>
                          {schedule.map((v, index) => {
                            return (
                              <th key={uniqueId('__schedule')} style={{ width: "14%" }}>
                                <strong
                                  className="ml-2"
                                  style={{ color: !index ? "red" : "" }}
                                >
                                  {daySchedule[index]}
                                </strong>
                              </th>
                            );
                          })}
                        </tr>
                        <tr>
                          {schedule.map((v, index) => {
                            return (
                              <td
                              key={uniqueId('__schedule')}
                                className="body-calendar border"
                                style={{ width: "14%" }}
                                onClick={() =>
                                  this.setState({
                                    visible: true,
                                    indexShiftCode: index,
                                  })
                                }
                              >
                                <strong>{v}</strong>
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  }
                </div>
              </Col>
              <Divider className="mt-0" />
              <Row className=" mb-3 w-100">
                <Col span={12}>
                  <Button
                    type="primary"
                    icon={<FontAwesomeIcon icon={faSave} />}
                    htmlType="submit"
                    loading={this.state.loading}
                    onClick={() => this.submitForm()}
                  >
                    &nbsp;{t("Save")}
                  </Button>
                </Col>

                <Col span={12} key="btn-back" style={{ textAlign: "right" }}>
                  <BackButton url={`/company/staff-schedule/config-schedule`} />
                </Col>
              </Row>
            </Row>
            <Modal
              open={this.state.visible}
              title="Choose time"
              forceRender
              width="30%"
              onCancel={() => this.setState({ visible: false })}
              // onOk={this.onChangeShift_code.bind(this)}
              footer={false}
            >
              <Dropdown
                datas={this.state.breakTimes}
                onChange={(v) => this.onChangeShift_code(v)}
                value={schedule[this.state.indexShiftCode]}
                defaultOption={"-- All time --"}
              />
            </Modal>
          </div>
        );
  }
}

const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    };
}
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(ConfigScheduleForm)