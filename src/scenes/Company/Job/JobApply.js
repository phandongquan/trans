import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Row, Col, Table, Rate } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { getList as apiGetList } from '~/apis/company/job/candidate';
import { parseIntegertoTime } from '~/services/helper';
import { Link } from 'react-router-dom';
import { dateTimeFormat, screenResponsive } from '~/constants/basic'
import Tab from '~/components/Base/Tab';
import tabList from '~/scenes/Company/Job/config/tab';
import { getList as apiGetListBasic } from '~/apis/company/job/basic';

class JobApply extends Component {

    /**
     *
     */
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            candidates: []
        }
    }
    /**
     * @lifecycle
     */
    componentDidMount() {
        let { id } = this.props.match.params;
        this.getBasic();
        if (id) {
            this.getListCandidate(id)
        }
    }

    /**
     * Call api get list basic
     */
    async getBasic() {
        let response = await apiGetListBasic();
        if(response.status) {
            let { data } = response;
            this.setState({ workflows: data.workflows })
        }
    }

    /**
     * Call api get list cadidates by job
     * @param {*} id 
     */
    async getListCandidate(id) {
        let response = await apiGetList({ job_id: id , limit : 200 });
        if (response.status) this.setState({ candidates: response.data.rows })
    }

    /**
     * @render
     */
    render() {
        let { t } = this.props;
        let { id } = this.props.match.params; 

        const columnCandidates = [
            {
                title: 'No.',
                render: r => this.state.candidates.indexOf(r) + 1 
            },
            {
                title: t('Candidate name'),
                render: r => {
                    return (
                        <>
                            <Link to={{
                                pathname: `/company/job/members/${r.member_id}/detail/${r.id}`,
                                params: {
                                    job_apply_id: r.id
                                }
                            }}>{r.member_name}</Link> - 
                            {r.member_phone ? <small> {r.member_phone}</small> : ''}
                            {r.member_email ? <small><br/>{r.member_email}</small> : ''}
                            {r.resume_title ? <small><br/><strong>Desired Job Title:</strong> {r.resume_title}<br/></small> : ''}
                        </>
                    )
                },
            },
            {
                title: t('Workflow'),
                render: r => r.wfid && this.state.workflows[r.wfid]
            },
            {
                title: t('Rating'),
                render: r => <Rate value={r.rating} />
            },
            {
                title: 'Score' ,
                width: '10%',
                render : r=> Number(r.interview_score) > 0 ?<span>Interview score: {r.interview_score}</span>  : <span>Self scrore: {r.self_score}</span>
            },
            {
                title: t('Note'),
                dataIndex: 'note'
            },
            {
                title: t('Applied date'),
                render: r => r.created && parseIntegertoTime(r.created, dateTimeFormat) 
            }
        ]

        return (
            <div id=''>
                <PageHeader 
                    title={t('Job')} 
                />

                <Row className={window.innerWidth < screenResponsive  ? "card pl-3 pr-3 mb-3 pb-3" : "card pl-3 pr-3 mb-3"}>
                    <Tab tabs={tabList(id)}></Tab>
                </Row>

                <Row gutter={24}>
                    <Col span={24}>
                        {window.innerWidth < screenResponsive  ? 
                            <div className='block_scroll_data_table'>
                                <div className='main_scroll_table'> 
                                    <Table
                                        dataSource={this.state.candidates}
                                        columns={columnCandidates}
                                        loading={this.state.loading}
                                        pagination={{ pageSize: 9, showSizeChanger: false }}
                                        rowKey={(candidate) => candidate.id}
                                    />
                                </div>
                            </div>
                            :
                            <Table className=''
                                dataSource={this.state.candidates}
                                columns={columnCandidates}
                                loading={this.state.loading}
                                pagination={{ pageSize: 9, showSizeChanger: false }}
                                rowKey={(candidate) => candidate.id}
                            />
                        }
                    </Col>
                </Row>
            </div>
        );
    }
}
/**
 * Map redux state to component props
 * @param {Object} state 
 */
const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    }
}
export default connect(mapStateToProps)(withTranslation()(JobApply));