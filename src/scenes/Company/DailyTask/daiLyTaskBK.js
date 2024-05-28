import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Table, Form, Row, Col, DatePicker, Select, Tag, Space, Spin } from 'antd'
import { PageHeader } from '@ant-design/pro-layout';
import Dropdown from '~/components/Base/Dropdown'
import { dateFormat } from '~/constants/basic'
import { getList, getListById } from '~/apis/company/dailyTask'
import dayjs from 'dayjs'
import { timeFormatStandard } from '~/services/helper'
import { getList as apiGetListStaff } from '~/apis/company/staff'
import axios from 'axios'
import './config/dailyTask.css'
import { uniqueId } from 'lodash'

const mapLocs = {
    10: "71-HHT",
    11: "37-NMH",
    12: "555-BTH",
    13: "43-TH",
    14: "176-PDL",
    15: "94-LVV",
    16: "119-NGT",
    17: "657-QT",
    18: "468-NTT",
    19: "447-PVT",
    20: "6-NAT",
    21: "304-LVQ",
    22: "104-LTT",
    23: "48-XT",
    24: "141-NT",
    26: "81-HTM",
    28: "48-LVS",
    30: "15-VVN",
    32: "182-CG",
    34: "94-HG",
    36: "223-KH",
    38: "169-TH",
    40: "50-PVC",
    42: "220-TH",
    44: "109-NDT",
    46: "28-PHI",
    48: "A30 QL50",
    50: "56-NTT",
    52: "256-ĐXH",
    54: "631-TL10",
    56: "36 NAT",
    58: "36 PVH",
    60: "420 HTP",
    62: "1261 PH",
    64: "1519 PVT",
    66: "133 HB",
    68: "694 AC",
}

const mapDepts = {
    0: 'All Department',
    100: 'BOD',
    101: 'F&A',
    102: 'KAIZEN',
    103: 'LOGISTICS',
    104: 'ADM',
    106: 'SUPPLY CHAIN',
    108: 'SPA',
    110: 'TECH',
    112: 'MARKETING',
    113: 'PG',
    117: 'INS-OPE',
    121: 'COSMETICS',
    133: 'R&D',
    135: 'MD'
}

const url_Inside = 'http://ws.inshasaki.com/api/'
const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjYyMTksImlzcyI6Imh0dHBzOi8vd3MuaW5zaGFzYWtpLmNvbS9hcGkvYXV0aC9sb2dpbiIsImlhdCI6MTYyNjg1NjEwMSwiZXhwIjoxNjUzMTM2MTAxLCJuYmYiOjE2MjY4NTYxMDEsImp0aSI6IjFwY2xCOVlwbE1IRDgxaGcifQ.2XkrpVW0L4yLTPgSvrscvuTs1OkPo0qO7MjnHX3vBDs"

const { Option, OptGroup } = Select;
export class DailyTask extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef()
        this.state = {
            loading: false,
            result: [],
            workflowSteps: []
        }
    }

    componentDidMount() {
        this.formRef.current.setFieldsValue({
            date: dayjs().subtract(6, 'days'),
            task_id: "58",
        })

        let params = this.formRef.current.getFieldsValue();
        this.getDatas(params);
    }

    /**
     * Get datas
     */
    getDatas = async (params = {}) => {
        this.setState({ loading: true })

        if(params.date) {
            params.from_date = timeFormatStandard(params.date, dateFormat);
            params.to_date = timeFormatStandard(params.date, dateFormat);
            delete(params.date)
        }
        params = {...params, limit: 10000}

        let result = []
        let tasks = []

        let urlTaskList = 'hr/task/taskdetaillist'
        const resTaskList = await axios.get(url_Inside + urlTaskList, { params, headers: { Authorization: 'Bearer ' + token }})
        let taskList = resTaskList.data.data
        taskList.map(t => {
            let index = tasks.findIndex(s => s.staff_id == t.staff.staff_id)
            if(index == -1) {
                let staff = { ...t.staff, task_detail_id: t.id}
                tasks.push(staff)
            }
        })

        let resStaffs = await apiGetListStaff({ limit: 3000, staff_status: 1 })
        let staffs = resStaffs.data.rows;

        tasks.map(t => {
            let staffFind = staffs.find(s => s.staff_id == t.staff_id)
            if(staffFind) {
                if(typeof result[staffFind.staff_loc_id] == 'undefined') {
                    result[staffFind.staff_loc_id] = [t]
                } else {
                    result[staffFind.staff_loc_id] = [...result[staffFind.staff_loc_id], t]
                }
            }
        })

        let urlTaskLog = 'hr/task/logdetail'
        result.map((item, index) => {
            item.map(async(i, indexStaff) => {
                const resTaskLog = await axios.get(url_Inside + urlTaskLog + '/' + i.task_detail_id, { headers: { Authorization: 'Bearer ' + token }})
                if(indexStaff == 0) {
                    let workflowSteps = resTaskLog.data.data.steps;
                    this.setState({ workflowSteps })
                }
                result[index][indexStaff]['logs'] = resTaskLog.data.data.logs;
            })
        })

        this.setState({ loading: false, result })
    }

    submitForm = () => {

    }

    renderBodyTable = () => {
        let { result, workflowSteps } = this.state;

        let body = [];
        if(result) {
            result.map((item, indexResult) => {
                item.map((r, index) => {
                    Object.keys(workflowSteps).map(key => {
                        console.log(workflowSteps[key])
                    }) 
                })
            })
        }

        return <tbody>
            <tr>
                <td>{}</td>
            </tr>
        </tbody>
    }

    render() {
        let { result } = this.state;
        return (
            <Spin spinning={this.state.loading}>
                <PageHeader title='Daily Task Report' />
                <Row className="card pl-3 pr-3 mb-3">
                    <Form
                        className="pt-3"
                        ref={this.formRef}
                        name="searchStaffForm"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical"
                    >
                        <Row gutter={[12,24]}>
                            <Col span={4}>
                                <Form.Item name='date'>
                                    <DatePicker format={dateFormat} className='w-100' />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name='task_id'>
                                    <Select placeholder='-- Major --'>
                                        <OptGroup label="HÀNH CHÍNH">
                                            <Option value="56">BẢO VỆ CN 555</Option>
                                            <Option value="58">BẢO VỆ CÁC CN</Option>
                                        </OptGroup>
                                        <OptGroup label="KHỐI COSMETIC">
                                            <Option value="38">Ca trưởng</Option>
                                            <Option value="12">CHT</Option>
                                            <Option value="8">Cashier</Option>
                                            <Option value="10">Đóng gói</Option>
                                            <Option value="141">KHO</Option>
                                            <Option value="155">NHÂN VIÊN BÁN HÀNG</Option>
                                        </OptGroup>
                                        <OptGroup label="KHỐI LOGISTIC">
                                            <Option value="169">SHIPPER</Option>
                                            <Option value="171">Shipper nội bộ</Option>
                                        </OptGroup>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={6}>
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        <table className='table-daily-task'>
                            <thead>
                                <tr>
                                    <th rowSpan={2}>Begin</th>
                                    <th rowSpan={2}>Name</th>
                                    <th rowSpan={2}>Repeat</th>
                                    {result.map((item, key) => <th colSpan={item.length} key={uniqueId('loc_id')}>{mapLocs[key]}</th>)}
                                </tr>
                                <tr>
                                    {result.map(item => {
                                        return item.map(staff => <th key={uniqueId('loc_id')}>{staff.staff_name}</th>)}
                                    )}
                                </tr>
                            </thead>
                            {this.renderBodyTable()}
                        </table>
                    </Col>
                </Row>
            </Spin>
        )
    }
}

const mapStateToProps = (state) => ({
    
})

const mapDispatchToProps = {
    
}

export default connect(mapStateToProps, mapDispatchToProps)(DailyTask)
