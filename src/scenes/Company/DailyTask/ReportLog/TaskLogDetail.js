import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Table, Row, Col, Form, Image } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { detail as getLogDetail } from '~/apis/company/task/taskLog';
import Tab from '~/components/Base/Tab';
import tabListTask from '~/scenes/Company/DailyTask/config/tabList';

const FormItem = Form.Item;

class TaskLog extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            logs: [],
            sumDurations : 0
        };
        this.formRef = React.createRef();
    }

    /**
     * @lifecycle 
     */
    componentDidMount() {
        this.getDetail();
    }

    /**
     * Get detail task logdetail
     * @param {} params 
     */
    getDetail = (params = {}) => {
        this.setState({ loading: true });
        let { task_staff_id } = this.props.match.params;
        let xhr = getLogDetail(task_staff_id);
        xhr.then((response) => {
            if (response.code == 200) {
                let { data } = response;
                let listData = [];
                let sum = 0
                if(Object.keys(data).length > 0){
                    if(Object.keys(data.logs).length > 0){
                        Object.keys(data.logs).map((id) => {
                            data.logs[id]['step'] = data.steps[data.logs[id].step_id] != undefined ? data.steps[data.logs[id].step_id] : null
                            listData.push(data.logs[id])
                        })
                    }
                }
                if(listData.length){
                    listData.map(l => {
                        if(l.status == 1){
                            sum += l?.step?.duration;
                        }
                    })
                }
                this.setState({loading: false, logs: listData , sumDurations : sum})
            }
        });
    }

    /**
     * @render
     */
    render() {
        let { t, match } = this.props;
        const columns = [
            {
                title: t('hr:time'),
                dataIndex: 'step',
                render: (step) => step ? step.begintime + ' - ' + step.endtime : ''
            },
            {
                title: t('hr:duration'),
                dataIndex: 'step',
                render: (step) => step ? step.duration : ''
            },
            {
                title: t('hr:step'),
                dataIndex: 'step',
                render: (step) => step ? step.name : ''
            },
            {
                title: t('hr:status'),
                dataIndex: 'status',
                render: (status_id) => status_id == 1 ? 'Finished' : ''
            },
            {
                title: t('hr:image'),
                dataIndex: 'data',
                render: (data) => {
                    if(data)
                        if(data.images)
                           return data.images.map((item, key) => <Image key={key} width={60} style={{marginLeft: 5}} src={item} />)
                }
            },
            {
                title: t('hr:note'),
                dataIndex: 'data',
                render: (data) => data ? data.note ? data.note : '' : ''
            },
            {
                title: t('Giờ thực tế'),
                dataIndex: 'execution_time',
                align: 'center',
                render: time => (time*60).toFixed()
            }
        ];
        return (
            <div>
                <PageHeader
                    title={t('Task Log Detail')}
                />
                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={tabListTask(this.props)}></Tab>
                </Row>
                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        <Table
                            dataSource={this.state.logs ? this.state.logs : []}
                            columns={columns}
                            loading={this.state.loading}
                            pagination={{ pageSize: 15 }}
                            rowKey={(log) => log.id}
                            summary={() => (
                                <Table.Summary fixed>
                                  <Table.Summary.Row style={{color: 'blue' , background:'#bfbfbf73'}}>
                                    <Table.Summary.Cell index={0}>Summary Duration</Table.Summary.Cell>
                                    <Table.Summary.Cell index={1}>{this.state.sumDurations }</Table.Summary.Cell>
                                    <Table.Summary.Cell index={2} />
                                    <Table.Summary.Cell index={3} />
                                    <Table.Summary.Cell index={4} />
                                    <Table.Summary.Cell index={5} />
                                    <Table.Summary.Cell index={6} />
                                  </Table.Summary.Row>
                                </Table.Summary>
                              )}
                        />
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(TaskLog));
