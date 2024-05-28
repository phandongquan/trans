import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import {
    Chart,
    Interval,
    Tooltip,
    Axis,
    Coordinate,
    Interaction
} from "bizcharts";

class TaskReportChart extends Component {
    render() {
        const { t, datas, title } = this.props;
        if (!datas || datas.length === 0) {
            return [];
        }

        return (
            <div className="card">
                <h4 style={{ padding: '10px', paddingBottom: '0' }}>{t(title)}</h4>
                <div className="card-body" style={{ overflowX: 'auto' }}>
                    <Chart height={250} data={datas} className="white" autoFit>
                        <Coordinate type="theta" radius={0.75} />
                        <Tooltip showTitle={false} />
                        <Axis visible={false} />
                        <Interval
                            position="count"
                            adjust="stack"
                            color="name"
                            style={{
                                lineWidth: 1,
                                stroke: '#fff',
                            }}
                            label={['count', {
                                content: (data) => {
                                    return `${data.name}: ${data.count}`;
                                },
                            }]}
                        />
                        <Interaction type='element-single-selected' />
                    </Chart>
                </div>
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

export default connect(mapStateToProps, null)(withTranslation()(TaskReportChart));