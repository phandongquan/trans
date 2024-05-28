import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setExcelIoCount } from '~/redux/actions/layout';
import classnames from 'classnames'
import { Badge } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { getList } from '~/apis/excelIOLogs';

class ExcelIoLogs extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        getList({ not_count: true }).then(res => {
            if (res.status && res.data && res.data.not_download_logs) {
                this.props.setExcelIoCount(res.data.not_download_logs);
            }
        });
    }
    render() {
        const { classBtn, staff_info = {}, ui } = this.props;
        return (
            <Link className={classnames("btn mr-2", classBtn)} to={'/excel-io-logs'}>
                <Badge count={ui.excel_io_count} size="small">
                    <AppstoreOutlined style={{ fontSize: '22px' }} />
                </Badge>
            </Link>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        permission: state.auth.info.permission,
        staff_info: state.auth.info.staff_info,
        profile: state.auth.info.profile,
        ui: state.ui
    };
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        setExcelIoCount,
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(ExcelIoLogs);