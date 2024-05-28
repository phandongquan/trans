import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Table } from 'antd'
import { isEqual, uniqueId } from 'lodash';
import { groupStock } from '~/apis/assetDevice';
import { showNotify } from '~/services/helper';
import './configs/stockTable.css'

export class PoTable extends Component {

    constructor(props) {
        super(props);
        this.state = {
            datas: [],
            page: 1,
            limit: 20,
            total: -1
        };
    }

    /**
     * 
     */
    componentDidMount() {
        this.getGroupStock(this.props.params);
    }

    /**
     * 
     * @param {*} prevProps 
     */
    componentDidUpdate(prevProps) {
        if (!isEqual(prevProps.params, this.props.params)) {
            this.getGroupStock(this.props.params);
        }
    }

    getGroupStock = (params) => {
        const { limit, page } = this.state;
        params = {
            ...params,
            offset: (page - 1) * limit,
            limit
        }
        let xhr = groupStock(params);
        xhr.then(res => {
            if (res.status) {
                this.setState({ datas: res.data, total: res.total })
            } else {
                showNotify('Notification', res.message, 'error')
            }
        })
    }

    onChangePage = (page) => {
        const { params } = this.props;
        this.setState({ page }, () => {
            this.getGroupStock(params);
        })
    }

    render() {
        const { baseData: { stocks, locations }} = this.props;
        const { page, limit, datas, total } = this.state;
        const columns = [
            {
                title: 'No.',
                render: r => this.state.datas.indexOf(r) + 1,
                width: '5%'
            },
            {
                title: 'Stock',
                render: r => <a href={`/asset-device?location_id=${r.location_id}&stock_id=${r.stock_id}`} target='_blank'>{stocks.find(s => s.stock_id == r.stock_id)?.stock_name}</a>
            },
            {
                title: 'Mã PO',
                render: r => {
                    if(!r.po_code) {
                        return 'Chưa có PO'
                    }
                    return <a href={`/asset-device?keyword=${r.po_code}&stock_id=${r.stock_id}&location_id=${r.location_id}`} target='_blank'>{r.po_code}</a>
                }
            },
            {
                title: 'Total Label Code',
                dataIndex: 'total_asset',
                align: 'center'
            },
            {
                title: 'Total QR Code',
                dataIndex: 'total_qr',
                align: 'center'
            },
            {
                title: 'Diff',
                render: r => r.total_asset - r.total_qr,
                align: 'center'
            },
            {
                title: 'Percent',
                render: r => Number((r.total_qr * 100)/r.total_asset).toFixed(1),
                align: 'center'
            }
        ]
        return (
            <Table
                columns={columns}
                size='small'
                dataSource={datas}
                rowKey={uniqueId('__po_table')}
                pagination={
                    {
                        page,
                        pageSize: limit,
                        showSizeChanger: false,
                        onChange: page => this.onChangePage(page),
                        total
                    }
                }
                rowClassName={r => r.total_asset - r.total_qr > 0 ? 'bg-light-orange' : ''}
            />
        )
    }
}

const mapStateToProps = (state) => ({
    baseData: state.baseData
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(PoTable)