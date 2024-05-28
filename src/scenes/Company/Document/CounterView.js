import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Table } from 'antd'
import { timeFormatStandard } from '~/services/helper';
import { dateTimeFormat } from '~/constants/basic';
import { getCounterView as apiGetCounterView } from '~/apis/company/document/index'

class CounterView extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            counterViews: []
        }
    }
    
    /**
     * 
     */
    componentDidMount() {
        let params = {
            document_id: this.props.documentId,
            chapter_id: this.props.chapterId
        }
        this.getListCounterViews(params);
    }

    /**
     * Call api get list counter of document and chapter 
     */
    async getListCounterViews( params ) {
        let response = await apiGetCounterView(params);
        if(response.status) this.setState({ counterViews: response.data.rows })
    }

    /**
     * 
     */
    render() {
        let { t } = this.props;
        const columns = [
            {
                title: t('No.'),
                render: r => this.state.counterViews.indexOf(r) + 1
            },
            {
                title: t('hr:name'),
                render: r => r.user && r.user.name
            },
            {
                title: t('hr:total_view'),
                render: r => r.view_counter,
                align: 'center'
            },
            {
                title: t('hr:latest_view'),
                render: r => r.updated_at && timeFormatStandard(r.updated_at, dateTimeFormat),
            }
        ]
        return (
            <Table dataSource={this.state.counterViews}
                loading={this.state.loading}
                columns={columns} 
                rowKey={(item) => item.id}
                pagination={{pageSize: 20, showSizeChanger: false}} 
            />
        )
    }
}

const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    };
}

export default connect(mapStateToProps, null)(withTranslation()(CounterView));