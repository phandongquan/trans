import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Row, Col, Table } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import Tab from '~/components/Base/Tab';
import tabList from '../../config/tabListDocument';
import { getList as apiGetList } from '~/apis/company/document/report';

import {screenResponsive} from '~/constants/basic';
class Report extends Component {
    constructor(props) {
        super(props)
        this.state = {
            reports: []
        }
    }

    componentDidMount() {
        this.getReportSummary();
    }

    async getReportSummary(params = {}) {
        let response = await apiGetList(params);
        if(response.status) {
            let result = [];
            if(response.data) {
                Object.keys(response.data).map(key => {
                    result.push(response.data[key])
                })
            }
            this.setState({reports: result})
        } 
    }

    render() {
        let { t } = this.props;
        
        const columns = [
            {
                title: t('hr:dept'),
                dataIndex: 'name'
            },
            {
                title: t('hr:draft'),
                dataIndex: 'draft'
            },
            {
                title: t('hr:verify'),
                dataIndex: 'verify'
            },
            {
                title: t('hr:cancel'),
                dataIndex: 'cancel'
            },
            {
                title: t('hr:publish'),
                dataIndex: 'publish'
            },
            {
                title: t('hr:total'),
                dataIndex: 'total'
            },
            {
                title: t('hr:question'),
                dataIndex: 'questions'
            }
        ]

        return (
            <>
                <PageHeader 
                    title={t('hr:report')}
                />
                <Row className=   {window.innerWidth < screenResponsive  ? "card pl-3 pr-3 mb-3 pb-3" : "card pl-3 pr-3 mb-3"}>
                    <Tab tabs={tabList(this.props)} />
                </Row>

                <Row gutter={24}>
                    <Col span={24}>
                        {window.innerWidth < screenResponsive  ? 
                            <div className='block_scroll_data_table'>
                                <div className='main_scroll_table'> 
                                    <Table
                                        dataSource={this.state.reports}
                                        columns={columns}
                                        rowKey={item => item.department_id}
                                    />
                                </div>
                            </div>
                            :
                            <Table 
                                dataSource={this.state.reports}
                                columns={columns}
                                rowKey={item => item.department_id}
                            />
                        }
                    </Col>
                </Row>
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
const mapDispatchToProps = (dispatch) => {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Report));
