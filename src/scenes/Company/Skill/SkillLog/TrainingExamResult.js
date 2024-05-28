import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal, Table } from 'antd'
import { Link } from 'react-router-dom';
import { getResultList } from '~/apis/company/trainingExamination';
import { trainingExamTypes, trainingExamStatus, trainingExamResults } from '~/constants/basic';

import {screenResponsive} from '~/constants/basic';
import { withTranslation } from 'react-i18next';
export class TrainingExamResult extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            datas: [],
        }
    }

    componentDidMount() {
        if(this.props.skillLog) {
            this.getListTrainingExam();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if(this.props.skillLog != prevProps.skillLog && this.props.skillLog) {
            this.getListTrainingExam();
        }
    }

    /**
     * Get list training exam
     */
    getListTrainingExam = async () => {
        const { skillLog } = this.props;
        let params = {
            with_staff: true,
            check_permission: true,
            limit: 30,
            offset: 0,
            check_iso: true,
            is_exam_skill: true,
            staff_id: skillLog?.staff_id,
            skill_id: skillLog?.skill_id,
            result: 2
        }
        let response = await getResultList(params)
        if(response.status) {
            this.setState({ datas: response.data.rows })
        }
    }

    render() {
        let { t, visible, baseData: { positions, majors, departments } } = this.props;

        let columns = [
            {
                title: 'No.',
                render: r => this.state.datas.indexOf(r) + 1
            },
            {
                title: t('hr:skill'),
                render: r => {
                    if(r.skill) {
                        return <Link to={`/company/skill/${r.skill.id}/edit`}>{r.skill.name}</Link>
                    } else if(r.examination) {
                        if(r.examination.skill) {
                            return <Link to={`/company/skill/${r.examination.skill.id}/edit`}>{r.examination.skill.name}</Link>
                        }
                        
                    }
                } 
            },
            {
                title: t('hr:staff'),
                render: r => {
                    if(!r.staff) return '';
                    let positionFound = positions.find(p => p.id == r.staff.position_id)
                    let majorFound = majors.find(m => m.id == r.staff.major_id)
                    let deparmentFound = departments.find(d => d.id == r.staff.staff_dept_id)
                    return <span>
                        <Link to={`/company/staff/${r.staff.staff_id}/edit`}>{r.staff.staff_name}</Link>  
                    <small> <strong>#{r.staff.code}</strong> ({deparmentFound?.name} / {positionFound?.name} / {majorFound?.name})</small></span>
                }
            },
            {
                title: t('hr:start_at'),
                render: r => r.start_at
            },
            {
                title: t('hr:type'),
                render: r => r.examination ? trainingExamTypes[r.examination.type] : trainingExamTypes[r.type] 
            },
            {
                title: t('hr:status'),
                render: r => r.status && trainingExamStatus[r.status]
            },
            {
                title: t('hr:result'),
                render: r => r.examination_result ? <Link target='_blank' to={`/company/training-examination/${r.id}/history`}>{trainingExamResults[r.examination_result]}</Link> : ''
            }
        ];

        return (
            <Modal
                title={t('hr:training_exam_result')}
                open={visible}
                onCancel={() => this.props.hidePopup()}
                footer={false}
                width={window.innerWidth < screenResponsive  ? '100%' :'60%'}
                forceRender
            >
                  {window.innerWidth < screenResponsive  ? 
                        <div className='block_scroll_data_table'>
                            <div className='main_scroll_table'>
                                <Table 
                                    loading={this.state.loading}
                                    columns={columns}
                                    dataSource={this.state.datas}
                                    rowKey='id'
                                    pagination={false}
                                />
                            </div>
                        </div>
                        :

                        <Table 
                            loading={this.state.loading}
                            columns={columns}
                            dataSource={this.state.datas}
                            rowKey='id'
                            pagination={false}
                        />
                    }
            </Modal>
        )
    }
}

const mapStateToProps = (state) => ({
    baseData: state.baseData
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(TrainingExamResult))