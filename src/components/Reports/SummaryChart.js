import React, { Component } from 'react';
import dayjs from 'dayjs';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import {
    Chart,
    Geom,
    Axis,
    Tooltip,
    View,
    Interval,
    Legend,
    Coord
} from "bizcharts";

class SummaryChart extends Component {
    constructor(props) {
        super(props);
    }
    /**
     * Helper format data for chart
     * @param {Object} datas 
     */
    formatData = (datas) => {
        let columnData = [];
        let lineData = []
        let { counter, start_date, report_data } = datas;
        start_date = dayjs(start_date).format('MM/DD/YYYY');
        /**
         * @sort by date
         */
        report_data.sort((a, b) => {
            var da = dayjs(a.date);
            var db = dayjs(b.date);
            return (da > db) ? 1 : -1;
        });
        /**
         * Init first data
         */
        if (start_date) {
            columnData.push({ date: start_date, total: counter, totalV: counter, location_name: 'Tất cả' });
            lineData.push({ date: start_date, type: 'leave', total: counter, count: 0, location_name: 'Hasaki' });
            lineData.push({ date: start_date, type: 'new', total: counter, count: 0, location_name: 'Hasaki' });
        }

        /**
         * Loop and format
         */
        report_data.map((data) => {
            data.date = dayjs(data.date).format('MM/DD/YYYY');
            /**
             * @check date exist
             */
            let objColumnExistIndex = this.checkDate(columnData, data.date);

            /**
             * @init lineData
             */
            let objLineIndex;
            let objLineExistIndex = this.checkDate(lineData, data.date);
            if (objLineExistIndex == null) {
                lineData.push({ date: data.date, type: 'leave', total: counter, count: 0, location_name: 'Hasaki' });
                lineData.push({ date: data.date, type: 'new', total: counter, count: 0, location_name: 'Hasaki' });
            }

            if (data.status == 1) {
                // ColumnData
                if (objColumnExistIndex == null) {
                    columnData.push({ date: data.date, total: ++counter, totalV: counter, location_name: 'Tất cả' });
                } else {
                    columnData[objColumnExistIndex] = {
                        ...columnData[objColumnExistIndex],
                        total: ++counter
                    }
                }
                // LineData
                objLineIndex = this.checkDate(lineData, data.date, 'new');
            } else {
                // ColumnData
                if (objColumnExistIndex == null) {
                    columnData.push({ date: data.date, total: --counter, totalV: counter, location_name: 'Tất cả' });
                } else {
                    columnData[objColumnExistIndex] = {
                        ...columnData[objColumnExistIndex],
                        total: --counter,
                    }
                }
                // LineData
                objLineIndex = this.checkDate(lineData, data.date, 'leave');
            }
            lineData[objLineIndex] = {
                ...lineData[objLineIndex],
                count: lineData[objLineIndex].count + 1,
                total: (objColumnExistIndex == null) ? counter : columnData[objColumnExistIndex].total
            }
        });

        return { lineData, columnData };
    }
    /**
     * 
     * @param {Object} data 
     * @param {String} date 
     */
    checkDate = (data, date, type) => {
        let index = null;
        if (type) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].date === date && data[i].type === type) {
                    index = i;
                    break;
                }
            }
        } else {
            for (var i = 0; i < data.length; i++) {
                if (data[i].date === date) {
                    index = i;
                    break;
                }
            }
        }

        return index;
    }
    /**
     * @render
     */
    render() {
        if (!this.props.summaryData || Object.keys(this.props.summaryData).length === 0) {
            return [];
        }
        const { t } = this.props; 
        let summaryDatas = this.formatData(this.props.summaryData);
        let { counter } = this.props.summaryData;
        let { lineData, columnData } = summaryDatas;
        const scale = {
            totalV: {
                min: 0,
                max: counter + 200,
            },
            total: {
                min: 0,
                max: counter + 100,
            },
            count: {
                min: 0,
            }
        };
        return (
            <div className="card">
                <h4 style={{ padding: '10px', paddingBottom: '0' }}>{t('hr:statistics_for_staff')}</h4>
                <div className="card-body" style={{ overflowX: 'auto' }}>
                    <Chart height={400}
                        autoFit
                        scale={scale}
                        padding={[30, 30, 30, 50]}
                        >
                        <Tooltip shared />
                        <View data={columnData}>
                            <Axis name="count" position="right" grid={false} />
                            <Geom
                                type="line"
                                position="date*totalV"
                                tooltip={["totalV*total", (totalV, total) => {
                                    return {
                                        name: 'Tất cả',
                                        value: `${total}`,
                                    }
                                }]}
                                size={3}
                                color="#1E90FF"
                                shape={"smooth"}
                            />
                        </View>
                        <View data={lineData}>
                            <Axis name="count" position="right" grid={false} />
                            <Interval
                                adjust={[
                                    {
                                        type: 'stack',
                                    },
                                ]}
                                position="date*count"
                                tooltip={["count*type", (count, type) => {
                                    return {
                                        name: type == 'leave' ? 'Nghỉ' : 'Mới',
                                        value: `${count}`,
                                    }
                                }]}
                                size={15}
                                color={['type', (xVal) => {
                                    if (xVal === 'new') {
                                        return 'green';
                                    }
                                    return '#f95d5d';
                                }]}
                            />
                        </View>
                    </Chart>
                </div>
            </div>
        );
    }
}

export default withTranslation()(SummaryChart);