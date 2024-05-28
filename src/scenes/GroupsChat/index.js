import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next';
import { Row, Col, Form, Table, Button } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import axios from 'axios';
import { showNotify , historyReplace, historyParams  , parseIntegertoTime , exportToXLS} from '~/services/helper'
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport } from '@fortawesome/free-solid-svg-icons';
import {formatHeader , formatData} from './config/exportGroupsChat'

const urlChat = 'https://apichat.hasaki.vn/api/partner/stats/grouplist'

class groupsChat extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        let params = historyParams();
        this.state = {
            datas : [],
            loading: false,
            limit: 100,
            total: 0,
            page: params.page ? Number(params.page) : 1,
        }
    }
    componentDidMount(){
        let params = historyParams();
        this.getList(params)
    }
    getList = async (params = {}) => {
        this.setState({loading : true})
        params = { 
            page: this.state.page,
            limit : this.state.limit
        }
        historyReplace(params);
        const bearer_token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjQ2OTY0NDE2fQ.bkY5TwmI9Xk6_Z6jOhE51o1hGRsMeeOgZEVY4siEyPo`;
        const config = {
            headers: { Authorization: `Bearer ${bearer_token}` },
            params: params
        };
        await axios.get(urlChat, config)
            .then(res => {
                if (res.status) {
                    this.setState({ datas: res.data.data.list , loading : false , total : res.data.data.total})
                }
            })
            .catch(error => console.log(error));
    }
    /**
     * @event change page
     * 
     * @param {*} page 
     */
     onChangePage(page) {
        this.setState({ page }, () => this.getList({}));
        window.scrollTo(0, 0)
    }
    /**
     * Export groups chat
     */
    exportGroupsChat = async () =>{
        let params = {
            // page: 1,
            limit : 0
        }
        const bearer_token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjQ2OTY0NDE2fQ.bkY5TwmI9Xk6_Z6jOhE51o1hGRsMeeOgZEVY4siEyPo`;
        const config = {
            headers: { Authorization: `Bearer ${bearer_token}` },
            params: params
        };

        await axios.get(urlChat, config)
            .then(res => {
                if (res.status) {
                    let header = formatHeader();
                    let data = formatData(res.data.data);
                    let fileName = `Groups-chat-${dayjs().format('YYYY-MM-DD')}`;
                    let datas = [...header, ...data];
                    exportToXLS(fileName, datas, [{width : 40},{width : 15},{width : 15},{width : 30},{width : 40}]);
                } else {
                    showNotify('Notify', res.statusText, 'error')
                }
            })
            .catch(error => console.log(error));
    }
    render() {
        const {t} =  this.props
        let {datas} = this.state
        const columns = [
            {
                title : 'No',
                width: '3%',
                render : r => datas.indexOf(r) + 1
            },
            {
                title : t('hr:group_name'),
                width: '15%',
                render : r => r.name
            },
            {
                title : t('hr:member_count'),
                width: '3%',
                align:'center',
                render : r => r.member_count
            },
            // {
            //     title : 'Status',
            //     render : r => console.log(r)
            // },
            {
                title : t('created_at'),
                width: '10%',
                 align:'center',
                render : r => parseIntegertoTime(r.created_at , 'DD-MM-YYYY')
            },
            {
                title : t('created_by'),
                width: '10%',
                render : r => r.created_by_name
            },
            {
                title : t('description'),
                width: '30%',
                render : r => r.description
            }
            
        ]
        return (
            <>
                <PageHeader title={t('hr:group_chat')}
                tags={[
                    // checkPermission('hr-tool-chat-export') ? 
                    <Button key={'export'} type="primary" icon={<FontAwesomeIcon icon={faFileExport}/>} onClick={() => this.exportGroupsChat()}>
                        {t('export_file')}
                    </Button>
                    // : ""
                ]}
                />
                <Row >
                    <Col span={24}>
                        <Table
                            dataSource={datas}
                            rowKey={r => r.id}
                            columns={columns}
                            pagination={{
                                total: this.state.total,
                                pageSize: this.state.limit,
                                // hideOnSinglePage: true,
                                showSizeChanger: false,
                                current: this.state.page,
                                onChange: page => this.onChangePage(page)
                            }}
                            loading={this.state.loading}
                        />
                    </Col>

                </Row>
            </>
        )
    }
}

const mapStateToProps = (state) => ({

})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(groupsChat))

