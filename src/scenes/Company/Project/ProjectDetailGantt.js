import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Row, Col } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { getList } from '~/apis/company/project/task';

import anychart from 'anychart';
import AnyChart from 'anychart-react/dist/anychart-react.min.js'
import FormModal from '~/components/Company/Project/FormModal';

import dayjs from 'dayjs';

class ProjectDetailGantt extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);

        this.state = {
            id: 0,
            visible: false,
            data: []
        };

    }

    componentDidMount() {
        this.getTasks();
    }

    /**
    * Get project task list
    */
    getTasks() {
        let { id } = this.props.match.params;
        if (id) {
            getList(id, { status: -1, piority: -1 }).then(res => {
                if (res.status == 1) {
                    let data = this.formatChartData(res.data.rows);
                    this.setState({ data });
                }
            });
        }
    }

    /**
     * Refresh
     */
    refreshDetail() {
        this.getTasks();
        this.toggleModal(false);
    }

    /**
     * Format Data chart
     * @param {*} data 
     */
    formatChartData = (data) => {
        if (!data || !data.length) {
            return [];
        }
        let returnArr = [];
        data.map(task => {
            let staffs = [];
            (task.staff && task.staff.length) && task.staff.map(staff => {
                staff.info && staffs.push(staff.info.staff_name);
            });
            returnArr.push({
                id: task['id'],
                name: task['name'],
                actualStart: task['date_start'] && dayjs(task['date_start']).format('YYYY-MM-DD'),
                actualEnd: task['date_end'] && dayjs(task['date_end']).format('YYYY-MM-DD'),
                progressValue: task['finish_per'] + '%',
                parent: task['parent_id'],
                staffs: staffs.join(', '),
                duration: task['duration'] ? task['duration'] : null,
                actual: { 'fill': "#dd2c00 0.3", 'stroke': "0.5 #dd2c00" },
                description: task['note']
            });
        });

        return returnArr;
    }


    /**
     * @render chart
     */
    renderChart = () => {
        if (!this.state.data.length) {
            return [];
        }
        anychart.format.inputDateTimeFormat("yyyy-MM-dd");
        var treeData = anychart.data.tree(this.state.data, "as-table");
        var chart = anychart.ganttProject();
        chart.data(treeData);
        var dataGrid = chart.dataGrid();
        chart.dataGrid().tooltip().useHtml(true);    
        chart.dataGrid().tooltip().format(
            "<b>Complete:</b> {%progress}<br>" +
            "<b>Description:</b> {%description}"
        );
        dataGrid.column(0).title('#').width(30).labels({ hAlign: 'center' });

        // set second column settings
        dataGrid.column(1).title('Task').width(180).labels({ hAlign: 'left' });
        dataGrid.column(1).title().fontSize(11);

        // set third column settings
        dataGrid.column(2).title('Start Time').width(70).labels().hAlign('right')
            .format(function () {
                if (isNaN(this.actualStart)) return '';
                var date = new Date(this.actualStart);
                return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
            });
        dataGrid.column(2).title().fontSize(11);

        // set fourth column settings
        dataGrid.column(3).title('End Time').width(80).labels().hAlign('right').format(function () {
            if (isNaN(this.actualEnd)) return '';
            var date = new Date(this.actualEnd);
            return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
        });
        dataGrid.column(3).title().fontSize(11);

        dataGrid.column(4).title('Duration').width(40).labels().hAlign('left').format(function () {
            return this.getData('duration');
        });
        dataGrid.column(4).title().fontSize(11);

        dataGrid.column(5).title('Assign').width(180).labels().hAlign('left').format(function () {
            return this.getData('staffs');
        });
        dataGrid.column(5).title().fontSize(11);

        chart.contextMenu(false);
        chart.zoomTo('week', 2, 'first-visible-date');

        let ctrl = this;
        chart.listen("rowDblClick", function (e) {
            ctrl.onEditTask(e.item.get('id'));
        });

        return (
            <AnyChart
                instance={chart}
                height={600}
            />
        );
    }
    /**
     * @event clickCreate - Update task
     * @param {*} task 
     */
    onEditTask(id = null) {
        if (id) {
            if (this.state.id === id) {
                this.toggleModal(true);
            } else {
                this.setState({ id });
            }
        }
    }

    /**
    * @event toggle modal
    * @param {*} visible 
    */
    toggleModal(visible) {
        this.setState({ visible });
    }

    /**
     * @render
     */
    render() {
        let projectId = this.props.match.params.id;
        return (
            <>
                <PageHeader title={'Projects'} tags={[]} />
                <Row className="card pl-3 pr-3 mb-3">
                    <Col span={24}>
                        {this.renderChart()}
                    </Col>
                </Row>
                <FormModal visible={this.state.visible} toggleModal={this.toggleModal.bind(this)}
                    projectId={projectId} id={this.state.id}
                    refreshTask={this.refreshDetail.bind(this)}
                />
            </>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    };
}

export default connect(mapStateToProps)(withTranslation()(ProjectDetailGantt));
