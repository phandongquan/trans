import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next';
import { PageHeader, Row, Col, Form, Table, Select, Input, Button, DatePicker } from 'antd';
import { dateFormat } from '~/constants/basic';
import dayjs from 'dayjs';
import Dropdown from '~/components/Base/Dropdown';

const { RangePicker } = DatePicker;
class Food extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            datas: {},
            dataFormat: [],
        }
    }
    componentDidMount() {
        this.formRef.current.setFieldsValue({
            date: [dayjs().startOf('hour'), dayjs()],
        })
        this.getListFood()
    }

    /**
     * @returns get list food
     */
    getListFood = async (values) => {
        this.setState({ loading: true })
        let data = {
            department_id: 0,
            meal_type: 0,
            from_date: dayjs().format('YYYY-MM-DD'),
            to_date: dayjs().format('YYYY-MM-DD')
        }
        if (values) {
            data = {
                ...data,
                department_id: String(values.department_id) , 
                meal_type: String(values.meal_type || 0),
                from_date: values.date ? values.date[0].format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
                to_date: values.date ? values.date[1].format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
                location_id: String(values.location_id || 0),
                status : String(values.status || 0)
            }
        }
        await fetch('https://apiwork.hasaki.vn/api/staffs/meal/listNotCheckIn', {
            method: 'POST',
            headers: {
                'Authorization': 'x0yYUSORXidZfZIxDq6936eZK-VLyzj5',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => this.setState({ datas: data.data, loading: false }));
        this.formatListFood();
    }
    /**
     * format list food
     */
    formatListFood() {
        let { datas } = this.state;
        let dataList = datas.list;
        let dataUser = datas.user;
        let arrDataUser = [];
        if (datas) {
            dataUser.forEach(e => {
                let listFood = dataList.find(d => d._id == e._id)
                arrDataUser.push({
                    id: e._id,
                    user: e,
                    list: listFood
                })
            });
            this.setState({ dataFormat: arrDataUser })
        }
    }
    /**
     * @event submit form
     * @param {Object} values 
     */
    submitForm = (values) => {
        this.getListFood(values);
    }
    render() {
        const { t, baseData: { locations, departments } } = this.props;
        const { dataFormat } = this.state
        const columns = [
            {
                title: 'No',
                width: '3%',
                render: r => dataFormat.indexOf(r) + 1
            },
            {
                title: 'Staff name',
                width: '30%',
                render: r => {
                    let deparment = departments.find(d => r.user.department_id == d.id);
                    let deptName = deparment ? deparment.name : 'NA';
                    let location = locations.find(l => r.user.location_id == l.id)
                    let locName = location ? location.name : 'NA';
                    return (
                        <>
                            <strong>{r.user.name}</strong>&nbsp;(<small>{deptName} / {locName}</small>)
                        </>
                    )
                }
            },
            {
                title: t('Location'),
                width: '30%',
                render: r => {
                    if (r.list.count == 1) {
                        let location = locations.find(d => r.list.location_id == d.id);
                        let locName = location ? location.name : 'NA';
                        return (
                            <>
                                <strong>{locName}</strong>
                            </>
                        )
                    }
                    else {
                        let location1 = locations.find(d => r.list.location_id[0] == d.id);
                        let locName1 = location1 ? location1.name : 'NA';
                        let location2 = locations.find(d => r.list.location_id[1] == d.id);
                        let locName2 = location2 ? location2.name : 'NA';
                        return (
                            <>
                                <strong>{locName1} | {locName2}</strong>
                            </>
                        )
                    }

                }
            },
            {
                title: 'Meal',
                render: r => {
                    if (r.list.count == 1) {
                        return (
                            <>
                                <p>{r.list.meal_type == 0 ? 'Tất cả' : r.list.meal_type == 1 ? 'Món mặn' : r.list.meal_type == 2 ? 'Món chay' : ''}</p>
                            </>
                        )
                    }
                    else {
                        return (
                            <>
                                <p>
                                    {r.list.meal_type[0] == 0 ? 'Tất cả' : r.list.meal_type[0] == 1 ? 'Món mặn' : r.list.meal_type[0] == 2 ? 'Món chay' : ''}
                                    &nbsp;|&nbsp;
                                    {r.list.meal_type[1] == 0 ? 'Tất cả' : r.list.meal_type[1] == 1 ? 'Món mặn' : r.list.meal_type[1] == 2 ? 'Món chay' : ''}
                                </p>
                            </>
                        )
                    }
                }
            },
            // {
            //     title: 'Status',
            //     render : r =>  r.user.status == 0 ? 'Tất cả' : r.user.status == 1 ? 'Not check' : r.user.status == 2 ? 'Checked' : ''
            // },
            {
                title: 'Count',
                render: r => r.list.count
            }
        ]
        return (
            <>
                <PageHeader title={t('Food')} />
                <Row className="card pl-3 pr-3 mb-3">
                    <Form
                        layout="vertical"
                        className="pt-3"
                        ref={this.formRef}
                        onFinish={this.submitForm.bind(this)}
                    >
                        <Row gutter={[12, 0]}>
                            <Col span={6}>
                                <Form.Item name="date">
                                    <RangePicker format={dateFormat} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item name='department_id'>
                                    <Select allowClear placeholder={t('--- Choose department ---')}>
                                        <Select.Option value={0}>{t('Tất cả')}</Select.Option>
                                        <Select.Option value={1}>{t('Shop')}</Select.Option>
                                        <Select.Option value={2}>{t('SPA')}</Select.Option>
                                        <Select.Option value={3}>{t('Phòng khác')}</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item name="location_id" >
                                    <Dropdown datas={locations} defaultOption="-- All Location --" />
                                </Form.Item>
                            </Col>
                            <Col span={3}>
                                <Form.Item name='meal_type'>
                                    <Select allowClear placeholder={t('--- Choose meal ---')}>
                                        <Select.Option value={0}>{t('Tất cả')}</Select.Option>
                                        <Select.Option value={1}>{t('Món mặn')}</Select.Option>
                                        <Select.Option value={2}>{t('Món chay')}</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={3}>
                                <Form.Item name='status'>
                                    <Select allowClear placeholder={t('--- Choose status ---')}>
                                        <Select.Option value={0}>{t('Tất cả')}</Select.Option>
                                        <Select.Option value={1}>{t('Not check')}</Select.Option>
                                        <Select.Option value={2}>{t('Checked')}</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={4} key='submit'>
                                <Button type="primary" htmlType="submit">
                                    {t('Search')}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        <Table
                            rowKey={r => r.id}
                            dataSource={this.state.dataFormat}
                            columns={columns}
                            pagination={{ pageSize: 30, showSizeChanger: false }}
                            loading={this.state.loading}
                        />
                    </Col>
                </Row>
            </>
        )
    }
}

const mapStateToProps = (state) => ({
    auth: state.auth.info,
    baseData: state.baseData
})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Food))