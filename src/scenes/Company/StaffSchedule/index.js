import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Table, Row, Col, Form, Input, Button, Divider, Spin, Dropdown as DropdownTheme, Menu, Upload, Modal } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFileExport, faCaretDown, faDownload } from '@fortawesome/free-solid-svg-icons';
import Dropdown from '~/components/Base/Dropdown';
import dayjs from 'dayjs';
import StaffDropdown from '~/components/Base/StaffDropdown';
import { getList as apiGetListStaffSchedule, uploadTemplate, downloadTemplate } from '~/apis/company/staffSchedule';
import { parseIntegertoTime, historyReplace, historyParams , exportToXLSMultipleSheet, showNotify, checkPermission } from '~/services/helper';
// import './config/detail.css';
import Tab from '~/components/Base/Tab';
import tabList from './config/tabList';
import { getHeader, formatData } from './config/formatDataExcel';
import { getShifts } from '~/apis/company/timesheet';
import staffScheduleTemplate from '~/assets/files/Staff-Schedule-TEMPLATE.xlsx';
import { saveAs } from 'file-saver';
import { leaveTypes } from '~/constants/basic';

import {screenResponsive} from '~/constants/basic';

class StaffSchedule extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            staffSchedules: {},
            shiftKeys: ['HC', 'AM', 'PM', 'C', 'W', 'A', 'H', 'S'],
            arrShifts: [],
            valueShifts: {},
            totalDaysInMonthForm: 0,
            month: dayjs().format('M'),
            year: dayjs().format('Y'),
            marginLeft: 0,

            file: null, 
            fileList: []
        }
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        let params = historyParams();
        this.getArrayShifts();
        let month = params.month ? params.month : dayjs().format('M');
        let year = params.year ? params.year : dayjs().year();
        let { staffInfo } = this.props;
        let department_id = params.department_id?params.department_id:staffInfo.staff_dept_id;
        // let location_id = params.location_id ? params.location_id : 11;
        this.formRef.current.setFieldsValue({
            ...params,
            year,
            month,
            // location_id,
            department_id
        })
        let values = this.formRef.current.getFieldsValue()
        this.getListStaffSchedule(values);
    }

    /**
     * get array shift
     */
    getArrayShifts = async () => {
        let response = await getShifts();
        if(response.status) {
            this.setState({arrShifts: response.data})
        }
    }

    /**
     * @event submit Form
     * @param {*} values 
     */
    submitForm(values) {
        this.getListStaffSchedule(values)
    }

    /**
     * Call api get list staff_schedule
     * @param {*} params 
     */
    async getListStaffSchedule(params = {}) {
        this.setState({ loading: true })
        historyReplace(params);
        params = {
            ...params,
            is_manager: true
        }
        let paddedMonth = params.month.padStart(2, '0'); // Padding month with zero if necessary
        let startDate = dayjs(`${params.year}-${paddedMonth}-01`, 'YYYY-MM-DD');
        let endDate = dayjs(startDate).endOf('month');

        params.from_date = startDate.unix();
        params.to_date = endDate.unix();
        let response = await apiGetListStaffSchedule(params)

        if (response.status) {
            this.setState({ loading: false })
            let arrStaffSchedules = response.data.rows;
            let result = {};
            let arrInfo = {};
            arrStaffSchedules.map(item => {
                if (typeof arrInfo[item.staffsche_staff_id] == 'undefined') arrInfo[item.staffsche_staff_id] = {}

                if (item.staffsche_shift.indexOf('HC') === 0) {
                    arrInfo[item.staffsche_staff_id]['HC'] = typeof arrInfo[item.staffsche_staff_id]['HC'] != 'undefined' ? arrInfo[item.staffsche_staff_id]['HC'] + 1 : 1;
                } else if (item.staffsche_shift.indexOf('AM') === 0) {
                    arrInfo[item.staffsche_staff_id]['AM'] = typeof arrInfo[item.staffsche_staff_id]['AM'] != 'undefined' ? arrInfo[item.staffsche_staff_id]['AM'] + 1 : 1;
                } else if (item.staffsche_shift.indexOf('PM') === 0) {
                    arrInfo[item.staffsche_staff_id]['PM'] = typeof arrInfo[item.staffsche_staff_id]['PM'] != 'undefined' ? arrInfo[item.staffsche_staff_id]['PM'] + 1 : 1;
                } else if (item.staffsche_shift.indexOf('W') === 0) {
                    arrInfo[item.staffsche_staff_id]['W'] = typeof arrInfo[item.staffsche_staff_id]['W'] != 'undefined' ? arrInfo[item.staffsche_staff_id]['W'] + 1 : 1;
                } else if (item.staffsche_shift.indexOf('H') === 0) {
                    arrInfo[item.staffsche_staff_id]['H'] = typeof arrInfo[item.staffsche_staff_id]['H'] != 'undefined' ? arrInfo[item.staffsche_staff_id]['H'] + 1 : 1;
                } else if (item.staffsche_shift.indexOf('S') === 0) {
                    arrInfo[item.staffsche_staff_id]['S'] = typeof arrInfo[item.staffsche_staff_id]['S'] != 'undefined' ? arrInfo[item.staffsche_staff_id]['S'] + 1 : 1;
                } else if (item.staffsche_shift.indexOf('A') === 0) {
                    arrInfo[item.staffsche_staff_id]['A'] = typeof arrInfo[item.staffsche_staff_id]['A'] != 'undefined' ? arrInfo[item.staffsche_staff_id]['A'] + 1 : 1;
                } else if (item.staffsche_shift.indexOf('C') === 0) {
                    arrInfo[item.staffsche_staff_id]['C'] = typeof arrInfo[item.staffsche_staff_id]['C'] != 'undefined' ? arrInfo[item.staffsche_staff_id]['C'] + 1 : 1;
                }

                if (typeof result[item.staffsche_staff_id] == 'undefined') {
                    result[item.staffsche_staff_id] = {};
                }
                result[item.staffsche_staff_id][parseIntegertoTime(item.staffsche_time_in, 'D')] = item;
            })
            this.setState({
                staffSchedules: result,
                valueShifts: arrInfo,
                totalDaysInMonthForm: dayjs([params.year, params.month]).daysInMonth(),
                month: params.month,
                year: params.year
            })
        }
    }

    /**
     * render body table
     */
    renderBodyTable() {
        let result = [];
        let { staffSchedules, valueShifts, totalDaysInMonthForm, arrShifts } = this.state;
        let { baseData: { locations } } = this.props;

        if (staffSchedules) {
            Object.keys(staffSchedules).map((item, index) => {
                item = staffSchedules[item]
                let firstItemChild = item[Object.keys(item)[0]]
                let dataDayInMonth = [];
                for (let i = 1; i <= totalDaysInMonthForm; i++) {
                    let link = [];

                    if (typeof item[i] != 'undefined' && typeof item[i].staffsche_id != 'undefined') {
                        let locationName = '';
                        if (typeof item[i].staffsche_location_id != 'undefined') {
                            locations.map(l => {
                                if (l.id == item[i].staffsche_location_id) return locationName = l.name;
                            })
                        }
                        let shift = typeof item[i] != 'undefined' ? item[i].staffsche_shift : '';
                        if (['C', 'W', 'A', 'H', 'S'].includes(shift)) {
                            if (typeof item[i].staffsche_leave_id != 'undefined' && item[i].staffsche_leave_id)
                                link.push(<Link title={arrShifts[shift] + ' - ' + locationName} key={item[i].staffsche_leave_id} to={`/company/staff-leave/${item[i].staffsche_leave_id}/edit`}>{shift}</Link>)
                            else
                                link.push(<Link title={arrShifts[shift] + ' - ' + locationName} key={item[i].staffsche_leave_id} className="text-danger" to={`/company/staff-schedule/${item[i].staffsche_id}/edit`}>{shift}</Link>)
                        } else {
                            link.push(<Link title={arrShifts[shift] + ' - ' + locationName} key={item[i].staffsche_leave_id} to={`/company/staff-schedule/${item[i].staffsche_id}/edit`}>{shift}</Link>)
                        }
                    }

                    dataDayInMonth.push(<td key={i} className='text-center' style={{ padding: 7, width: 50 }}>{link}</td>)
                }

                let { marginLeft } = this.state;
                result.push(
                    <tr key={index}>
                        <td className='col-left-fixed col-no' key='no'>{index + 1}</td>
                        <td className='col-left-fixed col-staff' key='staff_name'>{firstItemChild.staff_name + ' #' + firstItemChild.code}</td>
                        <td className='col-left-fixed col-hc' key='col-HC'>
                            {typeof valueShifts[firstItemChild.staffsche_staff_id]['HC'] != 'undefined' ?
                                valueShifts[firstItemChild.staffsche_staff_id]['HC'] : 0}
                        </td>
                        {
                            this.state.shiftKeys.map((shift, index) => {
                                if(index) {
                                    marginLeft = marginLeft + 39;
                                    return (
                                        <td key={shift} className='text-center col-2nd' style={{ marginLeft, width: 40 }}>
                                            {typeof valueShifts[firstItemChild.staffsche_staff_id][shift] != 'undefined' ?
                                                valueShifts[firstItemChild.staffsche_staff_id][shift] : 0}
                                        </td>
                                    )
                                }
                            })
                        }
                        {dataDayInMonth}
                    </tr>
                );
            })
        }


        return result;
    }

    /**
     * render header by month
     */
    renderHeaderByMonth() {
        let result = [];
        let { totalDaysInMonthForm, month, year } = this.state;
        for (let i = 1; i <= totalDaysInMonthForm; i++) {
            let d = dayjs([year, month, i]);
            result.push(<th key={i} className='text-center top-fixed text-result'>{i}<br></br>{d.format('dd')}</th>)
        }

        return result;
    }

    // /**
    //  * Format data to excel
    //  */
    // formatExportCell1() {
    //     let header = getHeader(this.state);
    //     let data = formatData(this.state);
    //     return [...header, ...data];
    // }
    async formatExportCell(){
        this.setState({ loading: true })
        let { t, baseData: { locations } } = this.props;
        let { arrShifts } = this.state;
        let header = getHeader(this.state);
        let data = formatData(this.state);

        // Sheet location
        let headerLocation = [['Mã chi nhánh','Tên chi nhánh','Địa chỉ chi nhánh']];
        let dataLocation = [];
        locations.map(n =>{
            dataLocation.push([
                n.alias,
                n.name,
                n.address
            ])
        })

        // Sheet shift
        let headerShift = [['Mã khung giờ', 'Giờ', 'Số giờ làm việc']];
        let dataShifts = [];
        arrShifts ={ ...arrShifts, ...leaveTypes }
        Object.keys(arrShifts).map(key => {
            let shift = arrShifts[key].split("-")
            let minutes = '';
            if(shift.length == 2) {
                minutes = dayjs(shift[1], 'HH:mm:ss').diff(dayjs(shift[0], 'HH:mm:ss'), 'minutes');
            }
            dataShifts.push([key, arrShifts[key], minutes ? Math.abs(minutes/60) : minutes])
        } )

        // Merge data before export
        let dataXls = {
            'List': {
                datas: [...header, ...data],
                autofit: [{ width: 20 }],
                merges :this.mergeColumnExportCell()
            },
            'Location': {
                datas: [...headerLocation, ...dataLocation],
                autofit: [{ width: 15 }, { width: 25 }, { width: 100 }]
            },
            'Time': {
                datas: [...headerShift, ...dataShifts],
                autofit: [{ width: 15 }, { width: 20 }]
            }
        }
        let fileName = `Schedule-${dayjs().format('YYYY-MM-DD')}`;
        exportToXLSMultipleSheet(fileName, dataXls)
        this.setState({ loading: false });
    }

    /**
     * @event Download import training question template
     */
     downloadImportTemplate() {
        saveAs(staffScheduleTemplate, 'Staff-Schedule-TEMPLATE.xlsx');
    }

    /**
     * Merge columns excel file
     * s: start, e: end, r: row, c: col
     */
    mergeColumnExportCell() {
        let merges = [];
        for (let i = 0; i <= 12; i++) {
            merges.push({ s: { r: 2, c: i }, e: { r: 3, c: i } })
        }

        return merges;
    }

    /**
     * @handle before upload
     * 
     * @return false will default upload to url
     * @param {BinaryType} file 
     */
     beforeUpload = file => {
        this.onRemove(file); // just take 1 file
        this.setState(state => ({
            fileList: [...state.fileList, file],
        }));
        this.setState({ file });
        return false;
    }

    /**
     * @event remove file
     * @param {BinaryType} file 
     */
     onRemove = file => {
        this.setState(state => {
            const index = state.fileList.indexOf(file);
            const newFileList = state.fileList.slice();
            newFileList.splice(index, 1);
            return {
                fileList: newFileList,
            };
        });
        this.setState({ file: null });
    }

    /**
     * @event submit file import
     */
     async handleImportUpload() {
        const { file } = this.state;
        const formData = new FormData();
        formData.append('file', file);
        let xhr = await uploadTemplate(formData);
        if (xhr.status == 1) {
            let { t, history } = this.props;
            this.setState({ file: null, fileList: [] })
            showNotify('Notification', 'Upload Done!');
        } else {
            showNotify('Notification', xhr.message, 'error');
        }
        return false;
    }

    /**
     * Download template
     */
    downloadTemplate = async () => {
        let response = await downloadTemplate();
        if(response.status) {
            const link = document.createElement('a');
            link.href = response.data;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    render() {
        let { t, baseData: { departments, locations, divisions, positions, majors , brands = []}} = this.props;
        let { fileList } = this.state;
        let brandsFormat = []
        brands.map(b => {
            brandsFormat.push({ id: b.brand_id, name: b.brand_name })
        })
        let optionYears = [];
        // let currentYear = Number(dayjs().format('Y'));
        const currentYear = dayjs().year();
        for (let i = currentYear - 2; i <= currentYear + 1; i++)
            optionYears.push({ id: i, name: i })

        let optionMonths = [];
        for (let i = 1; i <= 12; i++)
            optionMonths.push({ id: i, name: 'Month ' + i })

        let { marginLeft } = this.state;
        const itemClick = ({key}) => {
            if(key == '1'){
                this.downloadTemplate();
            }
        }

        const items = [
                {
                    key: '1',
                    label: 
                        // <Menu.Item key='dropdown_download_templ' icon={<FontAwesomeIcon icon={faDownload} className='ml-2' />}>
                        //     &nbsp;&nbsp;{t('Download template')}
                        // </Menu.Item>
                        <div style={{ textAlign: 'center' }}> <FontAwesomeIcon icon={faDownload}  />  &nbsp;&nbsp;{t('hr:download_template')} </div>
                }
        ];

        return (
            <div id='page_staff_schedule'>
                {window.innerWidth < screenResponsive  ? 
                    <>
                        <div className='title_page_mobile'>{t('hr:staff_schedule')}</div>
                        <div className='block_btn_action_header'>
                        {
                            checkPermission('hr-staff-schedule-monthly-create') ? 
                            <Link to={`/company/staff-schedule/create`} key="create-staff-schedule">
                                <Button key="create-staff" type="primary" icon={<FontAwesomeIcon icon={faPlus} />}>
                                    &nbsp;{t('add_new')}
                                </Button>
                            </Link> : ''
                        }
                        {
                            checkPermission('hr-staff-schedule-monthly-import') ? 
                                    <Link to={`/company/staff-schedule/import`} className='ml-2'>
                                        <Button type='primary' icon={<FontAwesomeIcon icon={faPlus} />}>
                                            &nbsp;{t('hr:import_data')}
                                        </Button>
                                    </Link>
                                : ''
                        }
                            
                            {/* <DropdownTheme className='ml-2' key='download_temp' menu={menu} type="primary" placement="bottomLeft" icon={<FontAwesomeIcon icon={faPlus} />}>
                                <Button key='download_temp_btn' className="mr-1"
                                    icon={<FontAwesomeIcon icon={faCaretDown} />}
                                />
                            </DropdownTheme> */}
                               
                        </div>
                    </>
                 : 
                    <PageHeader
                        title={t('hr:staff_schedule')}
                        tags={
                            <div>
                                {
                                    checkPermission('hr-staff-schedule-monthly-create') ? 
                                        <Link to={`/company/staff-schedule/create`} key="create-staff-schedule">
                                            <Button key="create-staff" type="primary" icon={<FontAwesomeIcon icon={faPlus} />}>
                                                &nbsp;{t('hr:add_new')}
                                            </Button>
                                        </Link>
                                    : ''
                                }
                                {
                                    checkPermission('hr-staff-schedule-monthly-import') ?
                                        <Link to={`/company/staff-schedule/import`} className='ml-2'>
                                            <Button type='primary' icon={<FontAwesomeIcon icon={faPlus} />}>
                                                &nbsp;{t('hr:import_data')}
                                            </Button>
                                        </Link>
                                    : ''
                                }
                                <DropdownTheme className='ml-2' key='download_temp' menu={{ items, onClick: itemClick }} type="primary" placement="bottomLeft" icon={<FontAwesomeIcon icon={faPlus} />}>
                                    <Button key='download_temp_btn' className="mr-1"
                                        icon={<FontAwesomeIcon icon={faCaretDown} />}
                                    />
                                </DropdownTheme>
                            </div>
                        }
                    />
                }
                <Row className='card pt-3 pl-3 pr-3 mb-4'>
                    <Form
                        className="form_schedule"
                        ref={this.formRef}
                        name="searchStaffForm"
                        onFinish={this.submitForm.bind(this)}
                    >
                        <Row gutter={12}>
                            <Col xs={12} sm={12} md={12} lg={4} xl={4} >
                                <Form.Item name="year">
                                    <Dropdown datas={optionYears} defaultOption={t("hr:all_years")} />
                                </Form.Item>
                            </Col>
                            <Col xs={12} sm={12} md={12} lg={4} xl={4} >
                                <Form.Item name="month">
                                    <Dropdown datas={optionMonths} defaultOption={t("hr:all_month")} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} >
                                <Form.Item name="location_id" >
                                    <Dropdown datas={locations} defaultOption={t("hr:all_location")} mode={'multiple'} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} >
                                <Form.Item name="staff_code">
                                    <StaffDropdown defaultOption={t("hr:all_name/code")} valueIsCode />
                                </Form.Item>
                            </Col>
                            
                        </Row>
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} >
                                <Form.Item name="department_id" >
                                    <Dropdown datas={departments} defaultOption={t("hr:all_department")} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} >
                                <Form.Item name="division_id" >
                                    <Dropdown datas={divisions} defaultOption={t("hr:all_division")} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} >
                                <Form.Item name="position_id" >
                                    <Dropdown datas={positions} defaultOption={t("hr:all_position")}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} >
                                <Form.Item name="major_id" >
                                    <Dropdown mode='multiple' datas={majors} defaultOption={t("hr:all_major")} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} >
                                <Form.Item name="brand" >
                                    <Dropdown datas={brandsFormat} defaultOption={t("hr:all_brands")} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}  key='submit'>
                                <Form.Item className='center_button_mobile'>
                                    <Button type="primary" htmlType="submit" className='mr-2'>
                                        {t('search')}
                                    </Button>
                                    {
                                        checkPermission('hr-staff-schedule-monthly-export') ? 
                                            <Button className='mr-2'
                                                type='primary'
                                                key="export-timesheet"
                                                onClick={() => this.formatExportCell()}

                                                loading={this.state.loading}
                                            >
                                                <FontAwesomeIcon icon={faFileExport} /> 
                                                {t('hr:export')}
                                            </Button>
                                        : ''
                                    }
                                </Form.Item>
                            </Col> 
                        </Row>
                    </Form>
                  
                </Row>
                <Row className='block_table_staff_schedule_monthly table_in_block card pl-3 pr-3 mb-3'>
                    <Col span={24}>
                        <Spin spinning={this.state.loading}>
                            <Tab tabs={tabList(this.props)} />
                            <Divider className='mt-0' />
                            {window.innerWidth < screenResponsive  ? 
                                <div className='block_scroll_data_table'>
                                    <div className='main_scroll_table scrol_table_schedule_month'>
                                        <div className='table-staff-schedule'>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th scope="col" style={{ zIndex: 9 }} className=''>No.</th>
                                                        <th scope="col" style={{ zIndex: 9 }} className=''>Staff</th>
                                                        <th scope="col" style={{ zIndex: 9 }} className=''>HC</th>
                                                        {
                                                            this.state.shiftKeys.map((shift, index) => {
                                                                if(index) {
                                                                    marginLeft = marginLeft + 39;
                                                                    return (
                                                                        <th key={shift}
                                                                            scope="col"
                                                                            className='text-center'
                                                                            style={{ marginLeft, width: 40 }}
                                                                        >
                                                                            {shift} 
                                                                        </th>
                                                                    )
                                                                }
                                                                
                                                            })
                                                        }
                                                        {this.renderHeaderByMonth()}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.renderBodyTable()}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                </div>
                                : 
                                <div className='table-staff-schedule'>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th scope="col" style={{ zIndex: 9 }} className='col-left-fixed top-fixed col-no'>No.</th>
                                                    <th scope="col" style={{ zIndex: 9 }} className='col-left-fixed top-fixed col-staff'>{t('hr:staff')}</th>
                                                    <th scope="col" style={{ zIndex: 9 }} className='col-left-fixed top-fixed col-hc'>HC</th>
                                                    {
                                                        this.state.shiftKeys.map((shift, index) => {
                                                            if(index) {
                                                                marginLeft = marginLeft + 39;
                                                                return (
                                                                    <th key={shift}
                                                                        scope="col"
                                                                        className='text-center top-fixed text-shift'
                                                                        style={{ marginLeft, width: 40 }}
                                                                    >
                                                                        {shift} 
                                                                    </th>
                                                                )
                                                            }
                                                            
                                                        })
                                                    }
                                                    {this.renderHeaderByMonth()}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.renderBodyTable()}
                                            </tbody>
                                        </table>
                                    </div>
                                }                            
                        </Spin>
                    </Col>
                </Row>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    };
}
const mapDispatchToProps = (dispatch) => {
    return {};
}
export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(StaffSchedule));