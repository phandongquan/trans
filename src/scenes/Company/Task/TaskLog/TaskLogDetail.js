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
                if(Object.keys(data).length > 0){
                    if(Object.keys(data.logs).length > 0){
                        Object.keys(data.logs).map((id) => {
                            data.logs[id]['step'] = data.steps[data.logs[id].step_id] != undefined ? data.steps[data.logs[id].step_id] : null
                            listData.push(data.logs[id])
                        })
                    }
                }
                this.setState({loading: false, logs: listData})
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
                title: t('Time'),
                dataIndex: 'step',
                render: (step) => step ? step.begintime : ''
            },
            {
                title: t('Step'),
                dataIndex: 'step',
                render: (step) => step ? step.name : ''
            },
            {
                title: t('Status'),
                dataIndex: 'status',
                render: (status_id) => status_id == 1 ? 'Finished' : ''
            },
            {
                title: t('Image'),
                dataIndex: 'data',
                render: (data) => {
                    if(data)
                        if(data.images)
                           return data.images.map((item, key) => <Image key={key} width={60} style={{marginLeft: 5}} src={item} />)
                }
            },
            {
                title: t('Note'),
                dataIndex: 'data',
                render: (data) => data ? data.note ? data.note : '' : ''
            }
        ];
        return (
            <div>
                <PageHeader
                    title={t('Task Log Detail')}
                />
                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={tabListTask}></Tab>
                </Row>
                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        <Table
                            dataSource={this.state.logs ? this.state.logs : []}
                            columns={columns}
                            loading={this.state.loading}
                            pagination={{ pageSize: 15 }}
                            rowKey={(log) => log.id}
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
