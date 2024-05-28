import { Row, Col, Spin, Divider, Table, Form, Input, Button } from 'antd'
import { LinkOutlined } from '@ant-design/icons';
import { PageHeader } from '@ant-design/pro-layout';
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Tab from '~/components/Base/Tab';
import tabList from './config/tabList';
import dayjs from 'dayjs';
import { historyParams, historyReplace, showNotify, currencyFormat, checkPermission } from '~/services/helper';
import Dropdown from '~/components/Base/Dropdown';
import { getListInvoices } from '~/apis/electricMangement/index';
import {  basicStatus } from '~/constants/basic';
import moment from 'moment'
import ExcelJS from 'exceljs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { MEDIA_URL_HR} from '~/constants';

export class ElectricityManagementInvoices extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            // totalDaysInMonthForm: 0,
            arrTotalDays: [],
            month: dayjs().format('MM'),
            year: dayjs().format('YYYY'),
            datas: [],
            data: {},
            datasChart: []
        }
    }
    componentDidMount() {
        let params = historyParams();
        let month = params.month ? params.month : dayjs().format('MM');
        let year = params.year ? params.year : dayjs().format('YYYY');
        let monthFormat = parseInt(month, 10)
        // let { year , month } = this.state
        // this.setState({totalDaysInMonthForm: dayjs([year, month]).daysInMonth()})
        let totalDaysInMonthForm = dayjs(`${year}-${monthFormat.length == 1 ? '0' + monthFormat : monthFormat}-01}-01`, 'YYYY-MM-DD').daysInMonth()
        let arrTotalDays = this.convertArrayTotalDaysMonth(totalDaysInMonthForm)
        this.setState({ arrTotalDays })
        this.formRef.current.setFieldsValue({
            ...params,
            year,
            month: monthFormat,
        })
        let values = this.formRef.current.getFieldsValue()
        this.getDatasInvoices(values)
    }
    async getDatasInvoices(params = {}) {
        this.setState({ loading: true })
        historyReplace(params)
        let response = await getListInvoices(params)
        if (response.status) {
            console.log(response.data.rows)
            this.setState({ loading: false, datas: response.data.rows })
        } else {
            showNotify('Notification', response.message, 'error')
            this.setState({ loading: false })
        }
    }
    convertArrayTotalDaysMonth(total) {
        let result = []
        for (let i = 1; i <= total; i++) {
            result.push(i)
        }
        return result
    }
    submitForm() {
        let values = this.formRef.current.getFieldsValue();
        if (values.month !== undefined) {
            let totalDaysInMonthForm = dayjs(`${values.year}-${values.month.length == 1 ? '0' + values.month : values.month}-01`).daysInMonth();
            let arrTotalDays = this.convertArrayTotalDaysMonth(totalDaysInMonthForm);
            this.setState({ arrTotalDays });
            this.setState({ month: values.month, year: values.year }, () => this.getDatasInvoices(values));
        } else {
            this.setState({ year: values.year }, () => this.getDatasInvoices(values));
        }
    }
    exportFile = async () => {
        try {
            this.setState({ loading: true });
            const { status, data } = await getListInvoices(this.formRef.current.getFieldsValue());
            if (!status) throw new Error('Failed to fetch data');
            const header = ['No.','Zone', 'Location', 'PE code', 'Password', 'Tracking link', 'Opening Day', 'Department code', 'Division', 'Useable area',
                'Vendor code', 'Tax code(The seller)', 'Vendor name(The seller)', 'Tax code(The buyer)', 'Description', 'Quantity(kwh)',
                'Serial', 'No(Invoice)', 'Date', 'Total amount', 'VAT amount', 'Total payment', 'File'];
            const exportData = data.rows.map((rowData, index) => [
                index + 1,
                rowData.properties.city_name,
                rowData.location_name,
                rowData.makh,
                rowData.pass_tracking,
                rowData.link_tracking,
                rowData.opening_day,
                rowData.department_code,
                basicStatus[rowData.division],
                rowData.useable_area,
                rowData.vender_code,
                rowData.seller_tax_code,
                rowData.vendor_name,
                rowData.buyer_tax_code,
                rowData.description,
                rowData.quantity,
                rowData.serial,
                rowData.invoice_no,
                rowData.invoice_date,
                currencyFormat(rowData.total_amount),
                currencyFormat(rowData.tax_amount),
                currencyFormat(rowData.total_payment),
                MEDIA_URL_HR.replace('/hr', '') + '/' + rowData.url_pdf
            ]);

            // Create workbook and worksheet
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Data Sheet');
            worksheet.addRows([header, ...exportData]);
            worksheet.columns.forEach((column) => {
                column.width = 40;
            });
            // Generate Excel file
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `electric_invoices_data-${moment().format('YYYY-MM-DD')}.xlsx`;
            a.click();
            this.setState({ loading: false });
        } catch (error) {
            // Handle errors
            this.setState({ loading: false });
            showNotify('Error', error.message, 'error');
        }
    };



    render() {
        let { t, baseData: { locations } } = this.props;

        let { year, month } = this.state
        const columns = [
            {
                title: 'No.',
                fixed: 'left',
                width: 50,
                render: r => this.state.datas.indexOf(r) + 1
            },
            {
                title: "Customer's Code",
                fixed: 'left',
                width: 100,
                render: r => r.customer_code
            },
            {
                title: 'Location',
                fixed: 'left',
                width: 100,
                render: r => r.location_name    
            },
            {
                title: 'Zone',
                fixed: 'left',
                width: 100,
                render: r => r.properties.city_name
            },
            {
                title: 'Invoice No',
                fixed: 'left',
                width: 90,
                render: r => r.invoice_no
            },
            {
                title: 'Invoice Date',
                fixed: 'left',
                width: 150,
                render: r =>  moment(r.invoice_date).format('DD/MM/YYYY')
            },
            {
                title: 'Opening Day',
                fixed: 'left',
                width: 150,
                render: r => r.opening_day ? moment(r.opening_day).format('DD/MM/YYYY') : ''
            },
            {
                title: 'Description',
                fixed: 'left',
                width: 150,
                render: r => r.description
            },
            {
                title: 'Useable Area(m2)',
                fixed: 'left',
                width: 100,
                render: r => r.useable_area
            },
            {
                title: 'Quantity(kwh)',
                fixed: 'left',
                width: 100,
                render: r => r.quantity
            },
            {
                title: 'Total Amount',
                fixed: 'left',
                width: 100,
                render: r => currencyFormat(r.total_amount)
            },
            {
                title: 'File',
                fixed: 'left',
                width: 50,  
                render: (text, record) => (
                    <a href={MEDIA_URL_HR.replace('/hr','') + '/' + record.url_pdf} target="_blank" rel="noopener noreferrer">
                        <Button icon={<LinkOutlined />} />
                    </a>
                )
            }
        ]
        let optionYears = [];
        const currentYear = dayjs().format('YYYY');
        for (let i = currentYear - 2; i <= currentYear + 1; i++)
            optionYears.push({ id: i, name: i })

        let optionMonths = [];
        for (let i = 1; i <= 12; i++)
            optionMonths.push({ id: i, name: 'Month ' + i })

        return (
            <div>
                <PageHeader title='Report Electricity Invoices'
                tags=
                {checkPermission('hr-tool-electricity-management-export') ? <Button type='primary' icon={<FontAwesomeIcon icon={faFileExcel} />} onClick={this.exportFile}> Export
                </Button> : ''
                }
                />
                <Row className='card pl-3 pr-3 mb-3'>
                    <Tab tabs={tabList()} />
                    <Form
                        className="mt-2 form_Electricity"
                        ref={this.formRef}
                        name="searchForm"
                        onFinish={this.submitForm.bind(this)}
                    >
                        <Row gutter={24}>
                            <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                                <Form.Item name={'year'} rules={[{ required: true, message: t("Please input year") }]}  >
                                    <Dropdown datas={optionYears} defaultOption="-- All Years --" />
                                </Form.Item>
                            </Col>
                            <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                                <Form.Item name={'month'}>
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
                <Table
                    dataSource={this.state.datas}
                    loading={this.state.loading}
                    className='pb-3'
                    columns={columns}
                    bordered
                    size="small"
                    rowKey='id'
                    pagination={false}
                    scroll={{ y: 500 }}
                />
            </div>
        )
    }
}
/**
 * Map redux state to component props
 * @param {Object} state 
 */
const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    }
}
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(ElectricityManagementInvoices)