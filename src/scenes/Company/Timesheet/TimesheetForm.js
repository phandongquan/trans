import React, { Component } from 'react';
import { Modal, Table, Row, Col } from 'antd';
import { withTranslation } from 'react-i18next';
import { getTimesheetLog as apiGetTimesheetLog } from '~/apis/company/timesheet';
import { parseIntegertoTime } from '~/services/helper';
import { timeFormat } from '~/constants/basic';
import {connect} from "react-redux";
import {screenResponsive} from '~/constants/basic';
class TimesheetForm extends Component{
    constructor(props){
        super(props)
        this.state = {
            data: []
        }
    }

    componentDidMount() {
        let { timesheet } = this.props;
        if(timesheet) 
            this.getTimesheetLog({
                date: timesheet.date,
                staff_code: timesheet.staff_code
            });
    }

    /**
     * Get timesheet log
     * @param {} params 
     */
    async getTimesheetLog(params = {}) {
        let response = await apiGetTimesheetLog(params);
        if(response.status) this.setState({data: response.data.rows})
    }



    render() {
        let { t, baseData: { locations } } = this.props;
        const columns = [
            {
                title: '#',
                render: r => this.state.data.indexOf(r) + 1
            },
            {
                title: t('Time'),
                render: r => parseIntegertoTime(r.date, timeFormat)
            },
            {
                title: t('Location'),
                render: r => locations.map(l => l.id == r.location_id && l.name)
            },
            {
                title: t('Source'),
                render: r => r.source
            },
            {
                title: t('Device Id'),
                render: r => r?.device_id
            },
            {
                title: t('Created At'),
                dataIndex: 'created_at'
            }
        ]
        return (
            <Modal
                forceRender
                title="Timesheet Detail"
                open={this.props.visible}
                onCancel={this.props.hidePopup}
                onOk={this.props.hidePopup}
                width={window.innerWidth < screenResponsive  ? "100%" : "60%"}
            >
                <Row gutter={24}>
                    <Col span={24} className='table_in_block'>
                        <Table 
                            dataSource={this.state.data}
                            columns={columns}
                            pagination={false}
                            rowKey={(timesheetLog => timesheetLog.id)}
                        />
                    </Col>
                </Row>
            </Modal>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        baseData: state.baseData
    };
}
export default connect(mapStateToProps)(withTranslation()(TimesheetForm));