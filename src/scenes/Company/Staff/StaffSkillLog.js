import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal, Table } from 'antd';
import { getList as apiGetList } from '~/apis/company/staff/skill-log';
import { staffStatus } from '~/constants/basic'

export class StaffSkillLog extends Component {
    constructor(props) {
        super(props)
        this.state = {
            datas: []
        }
    }

    componentDidUpdate(prevProps, prevState) {
        let { staffSkillId } = this.props
        if(staffSkillId && prevProps.staffSkillId != staffSkillId) {
            this.getListSkillLog({ skill_staff_id: staffSkillId })
        }
    }

    /**
     * Get list skill log
     * @param {*} params 
     */
    getListSkillLog = async (params = {}) => {
        let response = await apiGetList(params)
        if(response.status) {
            this.setState({ datas: response.data.rows })
        }
    }

    render() {
        const { visible } = this.props;
        const { datas  } = this.state;

        const columns = [
            {
                title: 'No.',
                render: r => datas.indexOf(r) + 1
            },
            {
                title: 'Skill',
                render: r => r.skill?.name
            },
            {
                title: 'Staff',
                render: r => r.staff?.staff_name
            },
            {
                title: 'Old level',
                align: 'center',
                dataIndex: 'old_level'
            },
            {
                title: 'New level',
                align: 'center',
                dataIndex: 'new_level'
            },
            // {
            //     title: 'Old Status',
            //     align: 'center',
            //     render: r => staffStatus[r.old_status]
            // },
            // {
            //     title: 'New Status',
            //     align: 'center',
            //     render: r => staffStatus[r.new_status]
            // },
            {
                title: 'Date',
                dataIndex: 'created_at'
            },
            {
                title: 'Created By',
                render: r => r.user?.name
            }
        ]

        return (
            <Modal
                forceRender
                width='60%'
                open={visible}
                title='Staff Skill Log'
                onCancel={() => this.props.hiddenModal()}
                footer={false}
            >
                <Table
                    columns={columns}
                    dataSource={datas}
                    pagination={false}
                    rowKey='id'
                />
            </Modal>
        )
    }
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(StaffSkillLog)