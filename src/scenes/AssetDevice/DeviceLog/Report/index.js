import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Row, Table } from 'antd'
import { PageHeader } from '@ant-design/pro-layout';
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import Tab from '~/components/Base/Tab'
import tabList from '../../config/tabList'
import { report as apiReport } from '~/apis/assetDevice/device_log'
import { showNotify } from '~/services/helper'
import dayjs from 'dayjs'
import { typeAssetDevice } from '../../config'

export class index extends Component {

    constructor(props) {
        super(props)
        this.state = {
            datas: []
        }
    }

    componentDidMount() {
        this.getListReport()
    }

    /**
     * Get list report
     */
    getListReport = () => {
        let xhr = apiReport()
        xhr.then(res => {
            if(res.status) {
                this.setState({ datas: res.data })
            } else {
                showNotify('Notify', res.message, 'error')
            }
        })
    }

    render() {
        const {t} = this.props
        const { datas } = this.state;

        const columns = [
            {
                title: 'No.',
                render: r => datas.indexOf(r) + 1
            },
            {
                title: t('device'),
                render: r => {
                    if(!r.asset && !r.location) return;
                    return r.type == typeAssetDevice ? r.asset?.product_name : r.location?.name
                }
            },
            {
                title: t('hr:mainternance_time'),
                render: r => <Link to={`/asset-device/log?asset_id=${r.asset_id}&from_date=1&to_date=1&type=${r.type}`}>{r.total_maintenance}</Link>
            }
        ]
        
        return (
            <>
                <PageHeader title={t('statistic')}/>
                <Row className="card mb-3 p-3">
                    <Tab tabs={tabList(this.props)} />
                </Row>
                <Table
                    columns={columns}
                    dataSource={datas}
                    rowKey='asset_id'
                />
            </>
        )
    }
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(index)