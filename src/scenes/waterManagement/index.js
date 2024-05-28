import React, { useState, useEffect, useRef, useMemo } from 'react'
import { PageHeader } from '@ant-design/pro-layout';
import { Row, Col, Spin, Divider, Table, Form, Input, Button } from 'antd'
import Dropdown from '~/components/Base/Dropdown';
import { Axis, Chart, Interval, Tooltip } from 'bizcharts';
import Tab from '~/components/Base/Tab';
import tabList from './config/tabList';
import dayjs from 'dayjs';
import { useSelector, useDispatch } from 'react-redux';
import { getReportDailyWater } from '~/apis/waterManagement';
import { exportToXLS, historyParams, historyReplace, showNotify } from '~/services/helper';
import moment from 'moment';
import { uniqueId } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel } from '@fortawesome/free-regular-svg-icons';
import { formatHeader , formatData } from './config/exportWaterDaily';

export default function WaterManagement(props) {
    const formRef = useRef();
    const { t, baseData } = props;
    const [loading, setLoading] = useState(false);
    const [arrTotalDays, setArrTotalDays] = useState([]);
    const [month, setMonth] = useState(dayjs().format('MM'));
    const [year, setYear] = useState(dayjs().format('YYYY'));
    const [datas, setDatas] = useState([]);
    const [data, setData] = useState({});
    const [datasChart, setDatasChart] = useState([]);
    const locations = useSelector(state => state.baseData.locations);

    useEffect(() => {
        let params = historyParams();
        let month = params.month ? params.month : dayjs().format('MM');
        let monthFormat = parseInt(month, 10)
        let year = params.year ? params.year : dayjs().format('YYYY');
        let totalDaysInMonthForm = dayjs(`${year}-${monthFormat.length == 1 ? '0' + monthFormat : monthFormat}-01}-01`, 'YYYY-MM-DD').daysInMonth()
        let arrTotalDays = convertArrayTotalDaysMonth(totalDaysInMonthForm)
        setArrTotalDays(arrTotalDays)
        formRef.current.setFieldsValue({
            ...params,
            month: monthFormat,
            year: year,
        })
        let values = formRef.current.getFieldsValue()
        getListData(values);
    }, []);

    const convertArrayTotalDaysMonth = (total) => {
        let result = []
        for (let i = 1; i <= total; i++) {
            result.push(i)
        }
        return result
    }

    const getListData = async (params = {}) => {
        setLoading(true);
        historyReplace(params)
        let response = await getReportDailyWater(params)
        if (response.status) {
            let datasChart = response.data.summary;
            if (datasChart.length) {
                datasChart.map(d => d.date = dayjs(d.date).format('DD'))
            }
            setLoading(false);
            setDatas(response.data.rows)
            setDatasChart(response.data.summary)
        } else {
            showNotify('Notification', response.message, 'error');
            setLoading(false);
        }
    }
    const submitForm = () => {
        let values = formRef.current.getFieldsValue()
        let totalDaysInMonthForm = dayjs(`${values.year}-${values.month.length == 1 ? '0' + values.month : values.month}-01`).daysInMonth()
        let arrTotalDays = convertArrayTotalDaysMonth(totalDaysInMonthForm)
        setArrTotalDays(arrTotalDays)
        setMonth(values.month)
        setYear(values.year)
        getListData(values)
    }
    const exportDatas = async () => {
        setLoading(true)
        let values = formRef.current.getFieldsValue()
        let totalDaysInMonthForm = dayjs(`${values.year}-${values.month.length == 1 ? '0' + values.month : values.month}-01`).daysInMonth()
        let arrTotalDays = convertArrayTotalDaysMonth(totalDaysInMonthForm)
        let response = await getReportDailyWater(values)
        if (response.status) {
            let header = formatHeader(arrTotalDays);
            let data = formatData(response.data.rows , arrTotalDays);
            let fileName = `Water-Management-Daily-${dayjs().format('YYYY-MM')}`;
            let dataFormat = [...header, ...data]
            exportToXLS(fileName, dataFormat,[null,{ width: 30 },{ width: 30 },])
        } else {
            showNotify('Notification', response.message, 'error')
        }
        setLoading(false)
    }
    const columns = useMemo(() => {
        return [
            {
                title: 'No.',
                fixed: 'left',
                width: 60,
                render: r => datas.indexOf(r) + 1
            },
            {
                title: 'Location',
                fixed: 'left',
                width: 200,
                render: r => {
                    if (r.address == null) {
                        return '';
                    }
                    const newAddress = r.address.split(',');
                    const province = newAddress[newAddress.length - 1];
                    const address = r.name + ' - ' + province;
                    return address
                }
            },
            {
                title: 'Mã danh bộ',
                fixed: 'left',
                width: 150,
                render: r => r.makh
            },
            ...arrTotalDays.map(item => ({
                title: `${dayjs([year, month, item]).format('DD(dd)')} `,
                width: 120,
                render: r => {
                    let dataWater = {}
                    let datasDaily = r.records
                    let waterHigher = false
                    if (datasDaily.length) {
                        datasDaily.map((data, i) => {
                            if (dayjs(data.date).format('DD') == item) {
                                // waterHigher = datasDaily[i-1]?.total < data.total ? true : false
                                waterHigher = data.pecent > 0
                                dataWater = data
                            }
                        })
                    }

                    return <span className='cursor-pointer'>
                        {dataWater?.total?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        {
                            waterHigher && <small style={{ fontSize: 10, color: waterHigher ? 'red' : '' }}>({dataWater?.pecent}%)</small>
                        }
                    </span>
                }
            })),
        ]
    });
    let currentYear = Number(moment().format('Y'));
    let optionYears = [];
    for (let i = currentYear - 2; i <= currentYear + 1; i++)
        optionYears.push({ id: i, name: i });

    let optionMonths = [];
    for (let i = 1; i <= 12; i++)
        optionMonths.push({ id: i, name: 'Month ' + i })

    return (
        <div>
            <PageHeader title='Report Water Daily' 
            tags={<Button type='primary' icon={<FontAwesomeIcon icon={faFileExcel} />} onClick={() => exportDatas()}> Export
            </Button>}/>
            <Row className='card pl-3 pr-3 mb-3'>
                <Tab tabs={tabList()} />
                <Form
                    className="mt-2 form_Electricity"
                    ref={formRef}
                    name="searchForm"
                    onFinish={submitForm}
                >
                    <Row gutter={24}>
                        <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                            <Form.Item name={'year'} rules={[{ required: true, message: t("Please input year") }]}  >
                                <Dropdown datas={optionYears} defaultOption="-- All Years --" />
                            </Form.Item>
                        </Col>
                        <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                            <Form.Item name={'month'} rules={[{ required: true, message: t("Please input month") }]}>
                                <Dropdown datas={optionMonths} defaultOption="-- All Month --" />
                            </Form.Item>
                        </Col>
                        <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                            <Form.Item name={'location_id'}>
                                <Dropdown datas={locations} defaultOption="-- All Locations --" />
                            </Form.Item>
                        </Col>
                        <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                            <Button type="primary" htmlType="submit">Search</Button>
                        </Col>
                    </Row>
                </Form>
            </Row>
            {
                datasChart.length > 0 && <Row className='mt-3 mb-3 p-2'>
                    <Chart height={300} autoFit data={datasChart} interactions={['active-region']} padding="auto" >
                        <Interval position="date*total" />
                        <Tooltip shared />
                        <Axis
                            name="date"
                            label={{
                                offset: 20,
                            }}
                            visible={true}
                        />
                    </Chart>
                </Row>
            }
            <Table
                dataSource={datas}
                loading={loading}
                className='pb-3'
                columns={columns}
                scroll={{ x: 900 , y :300}}
                bordered
                size="small"
                rowKey={r=> uniqueId(r.id)}
                pagination={false}
            />
        </div>
    )
}
