import { PageHeader } from '@ant-design/pro-layout';
import { faFileExport } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Col, Form, Row, Table, DatePicker } from 'antd';
import React, { Component } from 'react'
import tabConfig from '~/scenes/Company/Staff/config/tab'
import { connect } from 'react-redux';
import { getPerformanceStaff } from '~/apis/company/staff';
import Dropdown from '~/components/Base/Dropdown';
import StaffDropdown from '~/components/Base/StaffDropdown';
import { dateFormat } from '~/constants/basic';
import { checkPermission } from '~/services/helper';
import Tab from '~/components/Base/Tab';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
export class EmployeePerformance extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data: [],
            loading: false,
        };
        this.formRef = React.createRef();
    }

    componentDidMount() {
        let { id } = this.props.match.params;
        if (id) {
            const params = {
                from_date: dayjs().subtract(1, 'months').format(dateFormat),
                to_date: dayjs().format(dateFormat)
            }
            this.formRef.current.setFieldsValue({
                date: [dayjs().subtract(1, 'months'), dayjs()]
            })
            this.getStaffList(id, params)
        }
    }

    getStaffList(id, params = {}) {
        this.setState({ loading: true })
        getPerformanceStaff(id, params).then(res => {
            const { data = [] } = res;
            this.setState({
                data,
                loading: false
            })
        })
    }

    submitFormSearch(values) {
        const params = this.formRef.current.getFieldsValue();
        const { id } = this.props.match.params;
        if (params.date) {
            params.from_date = params.date[0].format(dateFormat);
            params.to_date = params.date[1].format(dateFormat);
            delete params.date;
        }
        this.getStaffList(id, params);
    }

    render() {
        const { t, match } = this.props;
        const { data, loading } = this.state;
        let id = match.params.id;
        const constTablist = tabConfig(id, this.props);
        const columns = [
            {
                title: t('Nhân Viên'),
                render: (r) => {
                    return r.staff_name
                }
            },
            {
                title: t('Tổng số task'),
                render: (r) => {
                    return r.total_task
                }
            },
            {
                title: t('Hoàn thành'),
                render: (r) => {
                    return r.total_task_finish
                }
            },
            {
                title: t('Thời gian (h)'),
                render: (r) => {
                    return r.total_time_task_finish
                }
            },
            {
                title: t('Đang thực hiện'),
                render: (r) => {
                    return r.total_task_processing
                }
            },
            {
                title: t('Thời gian (h)'),
                render: (r) => {
                    return r.total_time_task_processing
                }
            },
            {
                title: t('Hiệu suất thực hiện (%)'),
                render: (r) => {
                    return r.total_task_processing
                }
            },
            {
                title: t('Trễ (Finished)'),
                render: (r) => {
                    return r.total_lated
                }
            },
            {
                title: t('Đang bị trễ'),
                render: (r) => {
                    return r.total_process_lated
                }
            },
            {
                title: t('Thời gian (h)'),
                render: (r) => {
                    return r.total_time_process_lated
                }
            },
        ];

        return (
            <>
                <PageHeader title={t('hr:employee_performance')} />
                <Row className="card p-3 mb-3 pt-0">
                    <Tab tabs={constTablist} />
                </Row>
                <Row className="card p-2 pt-0 mb-3">
                    <Form className="pt-3"
                        ref={this.formRef}
                        name="searchStaffForm"
                        onFinish={this.submitFormSearch.bind(this)}
                        layout="vertical">
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name='date'>
                                    <RangePicker style={{ width: "100%" }} format={dateFormat} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={5} xl={5} key='submit' className=''>
                                <Button type="primary" htmlType="submit">
                                    {t('hr:search')}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        <div className='block_scroll_data_table'>
                            <div className='main_scroll_table'>
                                <Table
                                    dataSource={data}
                                    columns={columns}
                                    loading={loading}
                                    rowKey='table_employee_performance'
                                />
                            </div>
                        </div>
                    </Col>
                </Row>
            </>
        )
    }
}
const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    };
}
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(EmployeePerformance)