import React, { useEffect } from "react";
import { PageHeader } from '@ant-design/pro-layout';
import { Row, Col, Spin, Divider, Table, Form, Input, Button } from 'antd'
import { Chart, Interval, Tooltip } from 'bizcharts';
import Dropdown from '~/components/Base/Dropdown';
import tabList from './config/tabList';
import Tab from '~/components/Base/Tab';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { getListMonthlyWater } from '~/apis/waterManagement';
import { exportToXLS, historyParams, showNotify } from "~/services/helper";
import moment from "moment";
import { uniqueId } from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { formatHeader , formatData } from "./config/exportWaterMonthly";

export default function WaterManagementMonthly(props) {
    const formRef = React.createRef();
    const [loading, setLoading] = React.useState(false);
    const [arrTotalMonth, setArrTotalMonth] = React.useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    const [year, setYear] = React.useState(dayjs().format('YYYY'));
    const [datas, setDatas] = React.useState([]);
    const [data, setData] = React.useState({});
    const [datasChart, setDatasChart] = React.useState([]);
    const locations = useSelector(state => state.baseData.locations);
    const { t } = props;

    useEffect(() => {
        let params = historyParams();
        let year = params.year ? params.year : moment().format('Y');
        formRef.current.setFieldsValue({
            ...params,
            year,
        })
        let values = formRef.current.getFieldsValue()
        getListMonthly(values)
    }, []);
    const getListMonthly = async (params = {}) => {
        setLoading(true);
        historyParams(params)
        let response = await getListMonthlyWater(params)
        if (response.status) {
            setLoading(false);
            setDatasChart(response.data.summary);
            setDatas(response.data.rows);
        } else {
            showNotify('Notification', response.message, 'error')
            setLoading(false);
        }
    }
    const submitForm = () => {
        let values = formRef.current.getFieldsValue()
        setYear(values.year)
        getListMonthly(values)
    }
    const exportDatas = async () => {
        setLoading(true)
        let values = formRef.current.getFieldsValue()
        let response = await getListMonthlyWater(values)
        if (response.status) {
            let header = formatHeader();
            let data = formatData(response.data.rows);
            let fileName = `Water-Management-Monthly-${dayjs().format('YYYY')}`;
            let dataFormat = [...header, ...data]
            exportToXLS(fileName, dataFormat, [null, { width: 30 }, { width: 30 },])
        } else {
            showNotify('Notification', response.message, 'error')
        }
        setLoading(false)
    }
    let currentYear = Number(moment().format('Y'));
    let optionYears = [];
    for (let i = currentYear - 2; i <= currentYear + 1; i++)
        optionYears.push({ id: i, name: i });
    const columns = [
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
        ...arrTotalMonth.map((item, index) => ({
            title: item,
            width: 120,
            render: r => {
                let datasMonth = r.records
                let dataWater = {}
                let waterHigher = false
                if (datasMonth.length) {
                    datasMonth.map((data, i) => {
                        if (index == i) {
                            waterHigher = data.percent > 0
                            dataWater = data
                        }
                    })
                }
                return <span>
                    {dataWater?.total ?
                        dataWater?.total?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : Number(0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    }
                    {
                        waterHigher && <small style={{ fontSize: 12, color: waterHigher ? 'red' : '' }}>({dataWater?.percent}%)</small>
                    }
                </span>
            }
        }))
    ];


    return (
        <div>
            <PageHeader title='Report Water Monthly' 
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
                            <Form.Item name={'location_id'} >
                                <Dropdown datas={locations} defaultOption="-- All locations --" />
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
                        <Interval position="months*total" />
                        <Tooltip shared />
                    </Chart>
                </Row>
            }
            <Table
                pagination={false}
                loading={loading}
                columns={columns}
                dataSource={datas}
                rowKey={r=> uniqueId(r.id)}
                scroll={{ x: 900 , y :300}}
            />
        </div>

    )
}