import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Col, Row, Tooltip } from 'antd';
import dayjs from 'dayjs';
import { InfoCircleOutlined, FileDoneOutlined, CalendarOutlined, HomeOutlined   } from '@ant-design/icons';
import { getList, getMyTasks } from '~/apis/company/project';
import { getList as getListSchedule } from '~/apis/company/staffSchedule';
import { timeStartOfDay, timeEndOfDay, timeFormatStandard } from '~/services/helper';

import ChartCard from '~/components/Base/ChartCard';
const topColResponsiveProps = {
    xs: 24,
    sm: 12,
    md: 12,
    lg: 12,
    xl: 6,
    style: {
        marginBottom: 24
    },
};

class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loadingProject: true,
            projectCount: 0,
            dailyTaskCount: 0,
            loadingTimesheet: true,
            timeSheet: {},
            schedule: {}
        }
    }

    componentDidMount() {
        this.getProjects();
        this.getTimeSheet();
    }
    /**
     * Get project and daily task
     */
    getProjects() {
        let myTasksXhr = getMyTasks();
        let projectsXhr = getList();
        Promise
            .all([projectsXhr, myTasksXhr]).then(([projectsRes, myTaskRes]) => {
                if (myTaskRes.status == 1) {
                    this.setState({ dailyTaskCount: Array.isArray(myTaskRes.data.today) ? myTaskRes.data.today.length : 0 });
                }
                if (projectsRes.status == 1) {
                    this.setState({ projectCount: Array.isArray(projectsRes.data.rows) ? projectsRes.data.rows.length : 0 });
                }
            }).catch(err => console.log(err))
            .finally(() => this.setState({ loadingProject: false }));
    }

    /**
     * Get schedule and timesheet
     */
    getTimeSheet() {
        let from_date = timeStartOfDay(null, true);
        let to_date = timeEndOfDay(null, true);
        let scheduleXhr = getListSchedule({ from_date, to_date });
        Promise
            .all([scheduleXhr]).then(([scheduleRes]) => {
                if (scheduleRes.status == 1) {
                    this.setState({ schedule: Array.isArray(scheduleRes.data.rows) ? scheduleRes.data.rows[0] : {} });
                }
            })
            .catch(err => console.log(err))
            .finally(() => this.setState({ loadingTimesheet: false }));
    }

    /**
     * @render
     */
    render() {
        const { t, baseData: { locations } } = this.props;
        let { schedule = {}} = this.state;
        return (
            <div id='page_drashbroad'>
                <div className='block_page_header'>
                    <HomeOutlined className='icon_page_header'/> Dashboard
                </div>
                <Row gutter={[0, 12]} className="">
                    <Col {...topColResponsiveProps} className="mr-4">
                        <div className='drashbox style_drashbox_1'>
                            <FileDoneOutlined className='icon_drashbox' />
                        <ChartCard
                            title={"Project Task"}
                            action={
                                <Tooltip title={"Project task summary"}>
                                    <InfoCircleOutlined style={{ color: '#fff', opacity: .8 }} />
                                </Tooltip>
                            }
                            loading={this.state.loadingProject}
                            // total={() => 'TEXT'}
                            // footer={<span className={""}>{'Footer text'}</span>}
                           
                        >
                            <>
                                <p className={"mb-0"}>{'Projects: '}&nbsp;{this.state.projectCount}</p>
                                <p className={"mb-0"}>{'Daily Task:'}&nbsp;{this.state.dailyTaskCount}</p>
                            </>
                        </ChartCard>

                            <svg className='image_demo_line' width='100%' height="50"><g><path d="M 0 25 Q 28.0222 19.2917 32.3333 19.375 C 38.8 19.5 58.2 25.0625 64.6667 26.25 S 90.5333 30.875 97 31.25 S 122.8667 30.625 129.3333 30 S 155.2 24.25 161.6667 25 S 187.5333 35.625 194 37.5 S 219.8667 43.75 226.3333 43.75 S 252.2 38.4375 258.6667 37.5 S 284.5333 35.3125 291 34.375 S 316.8667 27.8125 323.3333 28.125 S 349.2 37.8125 373 35 Q 374 35 474 29 L 474 50 Q 359.9778 50 375 50 C 349.2 50 329.8 50 323.3333 50 S 297.4667 50 291 50 S 265.1333 50 258.6667 50 S 232.8 50 226.3333 50 S 200.4667 50 194 50 S 168.1333 50 161.6667 50 S 135.8 50 129.3333 50 S 103.4667 50 97 50 S 71.1333 50 64.6667 50 S 38.8 50 32.3333 50 Q 28.0222 50 0 50 Z" className="area" fill="rgba(255,255,255,0.5)"></path></g></svg>

                        </div>
                    </Col>
                    <Col {...topColResponsiveProps}>
                        <div className='drashbox style_drashbox_2'>
                            <CalendarOutlined className='icon_drashbox' />
                            <ChartCard
                                title={"Schedule"}
                                action={
                                    <Tooltip title={"Location and schedule's today"}>
                                        <InfoCircleOutlined style={{ color: 'fff', opacity: .8 }} />
                                    </Tooltip>
                                }
                                loading={this.state.loadingTimesheet}
                               
                            >
                                <>
                                    <p className={"mb-0"}>
                                        {'Schedule: '}&nbsp;{schedule.staffsche_shift ? `[${schedule.staffsche_shift}]` : ''}
                                        {schedule.staffsche_time_in ? timeFormatStandard(schedule.staffsche_time_in, 'HH:mm', true) : ''} {`-`}
                                        {schedule.staffsche_time_out ? timeFormatStandard(schedule.staffsche_time_out, 'HH:mm', true) : ''}
                                    </p>
                                    <p className={"mb-0"}>{'Location:'}&nbsp;{
                                        schedule.staffsche_location_id ? locations.find(l => l.id == schedule.staffsche_location_id)?.name : ' '
                                    }</p>
                                </>
                            </ChartCard>
                            <svg className='image_demo_line' width='100%' height="50"><g><path d="M 0 25 Q 28.0222 19.2917 32.3333 19.375 C 38.8 19.5 58.2 25.0625 64.6667 26.25 S 90.5333 30.875 97 31.25 S 122.8667 30.625 129.3333 30 S 155.2 24.25 161.6667 25 S 187.5333 35.625 194 37.5 S 219.8667 43.75 226.3333 43.75 S 252.2 38.4375 258.6667 37.5 S 284.5333 35.3125 291 34.375 S 316.8667 27.8125 323.3333 28.125 S 349.2 37.8125 373 35 Q 374 35 474 29 L 474 50 Q 359.9778 50 375 50 C 349.2 50 329.8 50 323.3333 50 S 297.4667 50 291 50 S 265.1333 50 258.6667 50 S 232.8 50 226.3333 50 S 200.4667 50 194 50 S 168.1333 50 161.6667 50 S 135.8 50 129.3333 50 S 103.4667 50 97 50 S 71.1333 50 64.6667 50 S 38.8 50 32.3333 50 Q 28.0222 50 0 50 Z" className="area" fill="rgba(255,255,255,0.5)"></path></g></svg>
                        </div>
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
    return {
        dispatch
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Dashboard));