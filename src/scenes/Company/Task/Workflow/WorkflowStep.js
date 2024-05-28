import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Row, Divider, Table, Col, Button, Popconfirm } from "antd";
import { getList as getListWorkFlowStep, detail as getDetailWorkflowStep, destroy as deleteWorkflowStep, getListCondition as apiGetListCondition } from '~/apis/company/workflowStep';
import { timeFormatStandard, showNotify, checkPermission } from '~/services/helper';
import { Link } from 'react-router-dom';
import { faPen, faTrash, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { QuestionCircleOutlined, MenuOutlined } from '@ant-design/icons';
import WorkflowStepForm from './WorkflowStepForm';
import dayjs from 'dayjs';
import { sortableContainer, sortableElement, sortableHandle } from 'react-sortable-hoc';
import arrayMove from 'array-move';
import './config/workflowStep.css';
import { update as apiUpdateWorkflowStep, updatePriority } from '~/apis/company/workflowStep';
import CreateUpdateDate from '~/components/Base/CreateUpdateDate';
import { screenResponsive } from '~/constants/basic';

const SortableItem = sortableElement(props => <tr {...props} />);
const SortableContainer = sortableContainer(props => <tbody {...props} />);
class WorkflowStep extends Component {
    /**
     * Constructor
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            workflowSteps: [],
            paramsWorkflowStep: {
                visible: false,
                wfstep: {},
                conditions: []
            },
        };
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        this.getWorkFlowSteps();
        this.getListCondition();
    }

    /**
     * Get list conditions
     */
    getListCondition = async () => {
        let response = await apiGetListCondition();
        if (response.status) {
            this.setState({ conditions: response.data });
        }
    }

    /**
     * Get list workflow steps
     * @param {*} params 
     */
    getWorkFlowSteps = (params) => {
        this.setState({ loading: true });
        let xhr = getListWorkFlowStep({ wfid: this.props.wfid, limit: -1, offset: 0 });
        xhr.then((response) => {
            if (response.status) {
                let { data } = response;
                this.setState({
                    workflowSteps: data.rows,
                    loading: false,
                });
            }
        });
    }

    /**
     * Event on click button show modal form workflow step
     * @param {*} e 
     */
    onClickWorkflowStep = (e, id = 0) => {
        e.stopPropagation();
        e.preventDefault();
        if (id) {
            let xhr = getDetailWorkflowStep(id);
            xhr.then((response) => {
                if (response.status)
                    this.setState({ paramsWorkflowStep: { visible: true, wfstep: response.data.workflow_step } })
            });
        } else {
            this.setState({ paramsWorkflowStep: { visible: true, wfstep: {} } })
        }
    }

    /**
     * Event delete click button
     * @param {*} e 
     * @param {*} id 
     */
    onDeleteWorkflowStep = (e, id) => {
        let { t } = this.props;
        e.stopPropagation();
        let xhr = deleteWorkflowStep(id);
        xhr.then((response) => {
            if (response.status) {
                this.getWorkFlowSteps();
                showNotify(t('Notification'), t('Workflow step  has been removed!'));
            } else {
                showNotify(t('Notification'), response.message);
            }
        }).catch(error => {
            console.log(error.response);
            showNotify(t('Notification'), t('Server has error!'));
        });;
    }

    /**
     * Event after sort table
     * @param {*} param
     */
    onSortEnd = ({ oldIndex, newIndex }) => {
        if (oldIndex !== newIndex) {
            this.updateWfS(oldIndex, newIndex)
        }
    };

    /**
     * update workflow step
     * @param {*} oldIndex 
     * @param {*} newIndex 
     */
    async updateWfS(oldIndex, newIndex) {
        this.setState({ loading: true })
        const { workflowSteps } = this.state;

        let arrUpdate = {};
        if (oldIndex < newIndex) {
            arrUpdate[workflowSteps[oldIndex]?.id] = newIndex;
            for (let i = oldIndex + 1; i <= newIndex; i++) {
                arrUpdate[workflowSteps[i]?.id] = i - 1;
            }
        } else {
            arrUpdate[workflowSteps[oldIndex]?.id] = newIndex;
            for (let i = newIndex; i < oldIndex; i++) {
                arrUpdate[workflowSteps[i]?.id] = i + 1;
            }
        }

        let response = await updatePriority({ data: arrUpdate });
        if (response.status) {
            this.getWorkFlowSteps();
            this.setState({ loading: false })
        }
    }

    /**
     * Sort table
     * @param {*} props 
     * @returns 
     */
    DraggableContainer = props => (
        <SortableContainer
            useDragHandle
            disableAutoscroll
            helperClass="row-dragging"
            onSortEnd={this.onSortEnd}
            {...props}
        />
    );

    /**
     * Sort table
     * @param {*} param0 
     * @returns 
     */
    DraggableBodyRow = ({ className, style, ...restProps }) => {
        const { workflowSteps } = this.state;
        const index = workflowSteps.findIndex(x => x.id === restProps['data-row-key']);
        return <SortableItem index={index} {...restProps} />;
    };

    /**
     * @render
     */
    render() {
        let { t, wfid, checkPermissionEdit, isCreated, workflow } = this.props;
        let { paramsWorkflowStep, workflowSteps, conditions, paramsWorkflowStep: { visible } } = this.state;

        const isDisplayButton = isCreated && workflow?.status == 2;
        const DragHandle = sortableHandle(() => <MenuOutlined style={{ cursor: 'pointer', color: '#999' }} />);
        const columns = [
            {
                title: ' ',
                dataIndex: 'priority',
                width: 30,
                className: 'drag-visible',
                render: () => <DragHandle />,
            },
            {
                title: t('step_number'),
                dataIndex: 'step_number',
                className: 'drag-visible',
                width: '5%'
            },
            {
                title: t('name'),
                dataIndex: 'name',
                className: 'drag-visible'
            },
            {
                title: t('time') + t('(hour)'),
                align: 'center',
                width: 150,
                render: r => r.duration ? r.duration : '',
                className: 'drag-visible'
            },
            {
                title: t('group_id'),
                width: 80,
                align: 'center',
                render: r => r.group_id
            },
            // {
            //     title: t('Repeat'),
            //     width: 80,
            //     align: 'center',
            //     render: r =>  r.repeat
            // },
            {
                title: t('date'),
                render: r => <CreateUpdateDate record={r} />
            },
            {
                title: t('action'),
                dataIndex: 'id',
                width: 100,
                render: (id) => {
                    return (
                        <div className='d-flex'>
                            <Link to="" onClick={(e) => this.onClickWorkflowStep(e, id)}>
                                <Button type="primary" size='small'
                                    icon={<FontAwesomeIcon icon={faPen} />}>
                                </Button>

                            </Link>
                            {
                                (this.props.checkPermissionEdit || !isDisplayButton) ?
                                    <Popconfirm title={t('Confirm delete selected item?')}
                                        placement="topLeft"
                                        icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                                        onConfirm={(e) => this.onDeleteWorkflowStep(e, id)}
                                    >
                                        {
                                            checkPermission('hr-workflow-update') ?
                                                <Button
                                                    type="primary"
                                                    size='small'
                                                    style={{ marginLeft: 8 }}
                                                    onClick={e => e.stopPropagation()}
                                                    icon={<FontAwesomeIcon icon={faTrash} />}>
                                                </Button>
                                                : []
                                        }
                                    </Popconfirm>
                                    :
                                    []
                            }

                        </div>
                    )
                },
                align: 'center'
            },
        ]

        return (
            <div id='block_workflow_step' className='mt-3'>
                <Row>
                    <Col span={24}>
                        {window.innerWidth < screenResponsive ?
                            <div className='block_scroll_data_table'>
                                <div className='main_scroll_table'>
                                    <Table
                                        dataSource={this.state.workflowSteps ? this.state.workflowSteps : []}
                                        columns={columns}
                                        loading={this.state.loading}
                                        pagination={false}
                                        rowKey='id'
                                        components={{
                                            body: {
                                                wrapper: this.DraggableContainer,
                                                row: this.DraggableBodyRow,
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                            :
                            <Table
                                dataSource={this.state.workflowSteps ? this.state.workflowSteps : []}
                                columns={columns}
                                loading={this.state.loading}
                                pagination={false}
                                rowKey='id'
                                components={{
                                    body: {
                                        wrapper: this.DraggableContainer,
                                        row: this.DraggableBodyRow,
                                    },
                                }}
                            />
                        }
                        {
                            (checkPermission('hr-workflow-update') || !isDisplayButton) ?
                                <Button type="primary" key="create-staff" block onClick={(e) => this.onClickWorkflowStep(e)} icon={<FontAwesomeIcon icon={faPlus} />}>
                                    &nbsp;{t('Add new')}
                                </Button>
                                : []
                        }
                    </Col>
                </Row>

                <WorkflowStepForm
                    title={<strong style={{ fontSize: 20 }}>Workflow step</strong>}
                    paramsWorkflowStep={paramsWorkflowStep}
                    hidePopup={() => this.setState({ paramsWorkflowStep: { visible: false, wfstep: {} } })}
                    resetTable={() => this.getWorkFlowSteps()}
                    wfid={wfid}
                    workflowSteps={workflowSteps}
                    conditions={conditions}
                    checkPermissionEdit={this.props.checkPermissionEdit}
                />
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
export default connect(mapStateToProps)(withTranslation()(WorkflowStep));