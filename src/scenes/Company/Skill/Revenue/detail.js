import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal, Table } from 'antd';
import { getDetail } from '~/apis/company/sheetSummary'
import { formatVND } from '~/services/helper'

export class SkillRevenueDetail extends Component {

    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            visible: false,
            datas: [],
        }
    }
    /**
     * @lifecycle
     */
    componentDidMount() {
    }
    /**
     * @lifecycle
     */
    componentDidUpdate(prevProps, prevState) {
        let id = this.props.sheetSummary.id;
        let prevId = prevProps.sheetSummary.id;
        if (id != prevId && id) {
            this.setDatas(this.props.sheetSummary);
        }
    }

    /**
     * Toggle modal
     * @param {*} visible 
     */
    toggleModal = (visible = false, workflow = null) => {
        this.setState({ visible, workflow })
    }

    /**
     * Get skill staff revenue by sheetSummaryId
     * @param {number} sheetSummaryId 
     */
    setDatas = (sheetSummary = {}) => {
        this.setState({ datas: [] });
        let { skill_revenue_logs } = sheetSummary;

        let datas = [];
        Object.keys(skill_revenue_logs).map(skillId => {
            let data = skill_revenue_logs[skillId];
            data.skill_id = skillId;
            datas.push(data)
        })
        this.setState({ datas })
    }

    /**
     * Render footer
     */
    renderFooter = () => {
        const { datas } = this.state;
        let total = 0;
        datas.map(d => total += d.cost_bonus);
        return <div className='d-flex justify-content-end text-danger' style={{ marginRight: '-6px' }}>Total (VND): {formatVND(total, '')}</div>
    }

    render() {
        const { datas, loading } = this.state;
        const { visible } = this.props

        let columns = [
            {
                title: 'No.',
                render: r => datas.indexOf(r) + 1,
                width: 60
            },
            {
                title: 'Skill Name',
                render: r => r.name
            },
            {
                title: 'Cost (VND)',
                render: r => formatVND(Math.round(r.cost), ''),
                align: 'right'
            },
            {
                title: 'Level',
                render: r => r.lv,
                align: 'right'
            },
            {
                title: 'Bonus (VND)',
                render: r => formatVND(r.cost_bonus, ''),
                align: 'right'
            },
            {
                title: 'Date',
                render: r => r.date,
                width: 190
            }
        ]

        return <Modal
            open={visible}
            onCancel={() => this.props.setModalVisible(false)}
            title='Staff Skills'
            width='60%'
            footer={false}
        >
            <Table
                loading={loading}
                columns={columns}
                dataSource={datas}
                rowKey='skill_id' pagination={false}
                footer={() => this.renderFooter()}
            />
        </Modal>;
    }
}

const mapStateToProps = (state) => ({
    baseData: state.baseData
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(SkillRevenueDetail);

