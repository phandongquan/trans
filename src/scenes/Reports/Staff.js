import React, { Component } from 'react';
import { connect } from 'react-redux';
import dayjs from 'dayjs';
import { withTranslation } from 'react-i18next';
import { Button, DatePicker, Row, Col } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import staffApi from '~/apis/report/staff';
import SummaryChart from '~/components/Reports/SummaryChart';
import DropDown from '~/components/Base/Dropdown';
import ChartPie from '~/components/Reports/ChartPie';
import Tab from '~/components/Base/Tab';
import tabListStaff from '~/scenes/Company/config/tabListStaff';
import Form from '../Company/StaffSchedule/DayOff/form';
const dateFormat = 'YYYY-MM-DD';

class Staff extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.state = {
            start_date: dayjs().subtract(1, 'M').format(dateFormat),
            end_date: dayjs().format(dateFormat),
            staff_loc_id: null,
            staff_dept_id: null,
            division_id: null,
            position_id: null,
            major_id: null,
            reportDatas: {
                summary: {},
                location: {}
            }
        };
        let { start_date, end_date, staff_loc_id, staff_dept_id, division_id, position_id, major_id } = this.state;
        this.getStaffReport({ start_date, end_date, staff_loc_id, staff_dept_id, division_id, position_id, major_id });
    }

    /**
     * @event search report
     */
    onSearch = (e) => {
        e.stopPropagation();
        let { start_date, end_date, staff_loc_id, staff_dept_id, division_id, position_id, major_id } = this.state;
        let params = { start_date, end_date, staff_loc_id, staff_dept_id, division_id , position_id, major_id };
        this.getStaffReport(params);
    }

    /**
     * @param {Object} params 
     */
    getStaffReport(params = {}) {
        let xhr = staffApi.getStaffReport(params);
        xhr.then((response) => {
            if (response.status) {
                this.setState({ reportDatas: response.data });
            }
        });
    }
    /**
     * stopPropagation
     * @param {Object} e 
     */
    onMouseEnter(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    /**
     * Render data location for chart
     */
    renderLocationChart = () => {
        let datas = this.state.reportDatas.location;
        let result = [];
        let { locations } = this.props.baseData
        if (Array.isArray(datas)) {
            datas.map((location) => {
                let locationFinded = locations.find(({ id }) => id === location.staff_loc_id)
                if (locationFinded !== undefined) {
                    result.push({ name: locationFinded.name, y: location.counter })
                }
            });
        }
        return result;
    }

    /**
     * Render data department for chart
     */
    renderDepartmentChart = () => {
        let datas = this.state.reportDatas.department;
        let { departments } = this.props.baseData
        let result = [];
        if (Array.isArray(datas)) {
            datas.map((department) => {
                let departmentFinded = departments.find(({ id }) => id === department.staff_dept_id)
                if (departmentFinded !== undefined) {
                    result.push({ name: departmentFinded.name, y: department.counter })
                }
            });
        }
        return result;
    }

    /**
     * Render data division for chart
     */
    renderDivisionChart = () => {
        let datas = this.state.reportDatas.division;
        let { divisions } = this.props.baseData
        let result = [];
        if(datas) {
            datas.map((division) => {
                let divisionFinded = divisions.find(({ id }) => id === division.division_id)
                if (divisionFinded !== undefined) {
                    result.push({ name: divisionFinded.name, y: division.counter })
                }
            });
        }
        return result;
    }

    /**
     * Render data position for chart
     */
    renderPositionChart = () => {
        let datas = this.state.reportDatas.position;
        let { positions } = this.props.baseData
        let result = [];
        if(datas) {
            datas.map((position) => {
                let positionFinded = positions.find(({ id }) => id === position.position_id)
                if (positionFinded !== undefined) 
                    result.push({ name: positionFinded.name, y: position.counter })
            });
        }
        return result;
    }

    /**
     * @render
     */
    render() {
        const { t, baseData: { locations, divisions, departments, positions, majors } } = this.props;
        const { reportDatas, staff_loc_id, staff_dept_id, division_id, position_id, major_id } = this.state;
        return (
            <div>
                <PageHeader
                    className="site-page-header"
                    title={t('hr:staff_chart')}
                    breadcrumb={[{ breadcrumbName: 'Reports', }, { breadcrumbName: 'Staff' }]}
                    subTitle={t('hr:report_for_staff')}
                />
                
                <div className="card mb-3 p-3 mb-0">
                    <Tab tabs={tabListStaff(this.props)}/>                   
                    <Row className='mt-3'>
                        <Col xs={24} sm={24} md={24} lg={3} xl={3} className='pl-2 pr-2 item_report_staff'>
                            <DatePicker 
                                defaultValue={dayjs(this.state.start_date, dateFormat)} 
                                format={dateFormat}
                                onSelect={(value) => {
                                    this.setState({ start_date: dayjs(value).format(dateFormat) })
                                }} 
                                style={{ width: '100%' }}
                        />
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={3} xl={3} className='pl-2 pr-2 item_report_staff'>
                            <DatePicker 
                                defaultValue={dayjs(this.state.end_date, dateFormat)} 
                                format={dateFormat}
                                onSelect={(value) => this.setState({ end_date: dayjs(value).format(dateFormat) })} 
                                style={{width: '100%' }} />    
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={3} xl={3} className='pl-2 pr-2 item_report_staff'>
                            <DropDown
                                datas={locations}
                                defaultOption={t('hr:all_location')}
                                onSelect={(value) => this.setState({ staff_loc_id: value })}
                                value={staff_loc_id}
                                onClear={() => this.setState({staff_loc_id: null})}
                                />
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={3} xl={3} className='pl-2 pr-2 item_report_staff'>
                            <DropDown
                                datas={departments}
                                defaultOption={t('hr:all_department')}
                                onSelect={(value) => this.setState({ staff_dept_id: value })}
                                value={staff_dept_id}
                                onClear={() => this.setState({staff_dept_id: null})}
                                />
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={3} xl={3} className='pl-2 pr-2 item_report_staff'>
                            <DropDown
                                datas={divisions}
                                defaultOption={t('hr:all_division')}
                                onSelect={(value) => this.setState({ division_id: value })}
                                value={division_id}
                                onClear={() => this.setState({division_id: null})}
                                />
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={3} xl={3} className='pl-2 pr-2 item_report_staff'>
                            <DropDown
                                datas={positions}
                                defaultOption={t('hr:all_position')}
                                onSelect={(value) => this.setState({ position_id: value })}
                                value={position_id}
                                onClear={() => this.setState({position_id: null})}
                                />
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={3} xl={3} className='pl-2 pr-2 item_report_staff'>
                            <DropDown
                                datas={majors}
                                defaultOption={t('hr:all_major')}
                                onSelect={(value) => this.setState({ major_id: value })}
                                value={major_id}
                                onClear={() => this.setState({major_id: null})}
                                />
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={3} xl={3} className='pl-2 pr-2 '>
                            <Button type="primary"
                                onClick={e => this.onSearch(e)} icon={<FontAwesomeIcon icon={faSearch} />}>
                                {t('hr:search')}
                            </Button>
                        </Col>
                    </Row>
                  
                </div>
                <Row gutter={[24, 12]}> 
                    <Col xs={24} sm={24} md={24} lg={12} xl={12} className='mb-3'>
                        <SummaryChart summaryData={reportDatas.summary} />
                    </Col>
                    <Col  xs={24} sm={24} md={24} lg={12} xl={12} className='mb-3'>
                        <ChartPie 
                            datas={this.renderLocationChart()}
                            title={t('hr:location')}
                            subTitle={t('hr:statistics_for_staff_by_location')} />
                    </Col>
                    <Col  xs={24} sm={24} md={24} lg={12} xl={12} className='mb-3'>
                        <ChartPie 
                            datas={this.renderDepartmentChart()}
                            title={t('hr:department')}
                            subTitle={t('statistics_for_staff_by_department')} />
                    </Col>
                    <Col  xs={24} sm={24} md={24} lg={12} xl={12} className='mb-3'>
                        <ChartPie 
                            datas={this.renderDivisionChart()}
                            title={t('hr:sec')}
                            subTitle={t('hr:statistics_for_staff_by_section')} />
                    </Col>
                    <Col  xs={24} sm={24} md={24} lg={12} xl={12} className='mb-3'>
                        <ChartPie 
                            datas={this.renderPositionChart()}
                            title={t('hr:position')}
                            subTitle={t('staff_by_position')} />
                    </Col>
                </Row>
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
const mapDispatchToProps = (dispatch) => {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Staff));
