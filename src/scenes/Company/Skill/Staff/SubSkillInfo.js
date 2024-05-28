import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { getByStaff as apiGetSkillByStaff } from '~/apis/company/staff/skill';
import { Table } from 'antd';
import { Link } from 'react-router-dom';
import { skillStatus } from '~/constants/basic';

class SubSkillInfo extends Component {

    /**
     *
     */
    constructor(props) {
        super(props)
        this.state = {
            datas: []
        }
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        this.getSkillByStaff();
    }

    async getSkillByStaff () {
        let { staff_skill } = this.props;
        let response = await apiGetSkillByStaff( staff_skill.staff_id, { parent_id: staff_skill.skill_id })
        if(response.status) {
            let { data } = response;
            this.setState({ datas: data.rows })
        }
    }

    render() {
        let { t, staff_skill } = this.props;
        const columns = [
            {
                title: 'No.',
                render: (text, record, index) => index +1
            },
            {
                title: t('Skill'),
                render: r => <Link to={`/company/skill/${r.skill_id}/staff/${r.id}/edit`}>{r.skills && r.skills.name}</Link>
            },
            {
                title: t('Level'),
                dataIndex: 'level'
            },
            {
                title: t('Status'),
                dataIndex: 'status',
                render: status_id => status_id && skillStatus[status_id]
            }
        ]
        return (
            <Table
                dataSource={this.state.datas && this.state.datas}
                columns={columns}
                pagination={{ pageSize: 15, hideOnSinglePage: true, showSizeChanger: false }}
                rowKey={(skillStaff) => skillStaff.id}
            />
        )
    }
}

export default (withTranslation()(SubSkillInfo))