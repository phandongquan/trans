import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getList as apiGetListWorkflowStep, update as apiUpdate, destroy as apiDelete, updatePriority } from '~/apis/company/dailyTask/workflowStep'
import { Button, Table, Popconfirm } from 'antd'
import WorkflowStep from './WorkflowStepForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { sortableContainer, sortableElement, sortableHandle } from 'react-sortable-hoc';
import { MenuOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { showNotify } from '~/services/helper'

const SortableItem = sortableElement(props => <tr {...props} />);
const SortableContainer = sortableContainer(props => <tbody {...props} />);
export class WorkflowSteps extends Component {

    constructor(props) {
        super(props)
        this.state = {
            loading: false, 
            workflowSteps: [],
            visible: false,
            workflowStep: null
        }
    }

    componentDidMount() {
        this.getListWorkflowSteps(this.props.wfId)
    }

    /**
     * Get list workflow steps
     * @param {*} wfId 
     */
     getListWorkflowSteps = async (wfId = 0) => {
        let response = await apiGetListWorkflowStep({ wfid: wfId})
        if(response.status) {
            this.setState({ workflowSteps: response.data.rows })
        }
    }

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
     * Event after sort table
     * @param {*} param
     */
    onSortEnd = ({ oldIndex, newIndex }) => {
        if (oldIndex !== newIndex) {
            this.updatePriority(oldIndex, newIndex)
        }
    };

    /**
     * Update priority
     * @param {*} oldIndex 
     * @param {*} newIndex 
     */
    updatePriority = async (oldIndex, newIndex) => {
        this.setState({ loading: true })
        const { workflowSteps } = this.state;

        let arrUpdate = {};
        if(oldIndex < newIndex) {
            arrUpdate[workflowSteps[oldIndex]?.id] = newIndex;
            for(let i = oldIndex + 1; i <= newIndex; i++) {
                arrUpdate[workflowSteps[i]?.id] = i - 1;
            }
        } else {
            arrUpdate[workflowSteps[oldIndex]?.id] = newIndex;
            for(let i = newIndex; i < oldIndex; i++) {
                arrUpdate[workflowSteps[i]?.id] = i + 1;
            }
        }

        let response = await updatePriority({data: arrUpdate});
        if(response.status) {
            this.getListWorkflowSteps(this.props.wfId);
            this.setState({ loading: false })
        }
    }

    /**
     * Event delete click button
     * @param {*} e 
     * @param {*} id 
     */
     onDeleteWorkflowStep = (e,id) => {
        const {t} =  this.props.translang;
        e.stopPropagation();
        let xhr = apiDelete(id);
        xhr.then((response) => {
            if (response.status) {
                console.log(1212);
                this.getListWorkflowSteps(this.props.wfId)
                showNotify('Notification', t('wl_step_remove'));
            } else {
                showNotify('Notification', response.message);
            }
        }).catch(error => {
            showNotify('Notification', t('server_error'), 'error');
        });
    }
   
    render() {
        const {t} =  this.props.translang;
    
        let { workflowSteps, loading, visible, workflowStep } = this.state;
        const DragHandle = sortableHandle(() => <MenuOutlined style={{ cursor: 'pointer', color: '#999' }} />);
        const columns = [
            {
                title:" ",
                dataIndex: 'priority',
                width: 30,
                className: 'drag-visible',
                render: () => <DragHandle />,
            },
            {
                title: t('name'),
                render: r => <div className='text-primary cursor-pointer' 
                    onClick={() => this.setState({ visible: true, workflowStep: r })}
                >{r.name}</div>,
                className: 'drag-visible',
            },
            {
                title: t('time'),
                dataIndex: 'duration'
            },
            {
                title: t('start'),
                dataIndex: 'begintime'
            },
            {
                title: " ",
                render: r => {
                    return <Popconfirm title={t('hr:confirm_delete')}
                        placement="topLeft"
                        icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                        onConfirm={(e) => this.onDeleteWorkflowStep(e, r.id)}
                    >
                        <Button
                            type="primary"
                            size='small'
                            style={{ marginLeft: 8 }}
                            onClick={e => e.stopPropagation()}
                            icon={<FontAwesomeIcon icon={faTrash} />}>
                        </Button>
                    </Popconfirm>
                }
            }
        ]

        return (
            <>
             <div className='block_scroll_data_table'>
                <div className='main_scroll_table'> 
                    <Table
                        loading={loading}
                        columns={columns}
                        title={r => <div style={{ fontSize: 18, fontWeight: 'bold' }}>{t('checklist')} 
                            <Button className='ml-2' type="primary" icon={<FontAwesomeIcon icon={faPlus} />}
                                onClick={() => this.setState({ visible: true, workflowStep: null })}
                            >
                               {t('add_new')}
                            </Button>
                        </div>}
                        dataSource={workflowSteps}
                        rowKey='id'
                        pagination={false}
                        components={{
                            body: {
                            wrapper: this.DraggableContainer,
                            row: this.DraggableBodyRow,
                            },
                        }}
                    />
                    </div>
                </div>
                <WorkflowStep 
                    translang = {this.props}
                    visible={visible}
                    id={workflowStep ? workflowStep.id : 0}
                    wfid={this.props.wfId}
                    hidePopup={() => this.setState({ visible: false, workflowStep: null})} 
                    refreshTable={() => {
                        this.setState({ visible: false, workflowStep: null})
                        this.getListWorkflowSteps(this.props.wfId)
                    }}
                />
            </>
        )
    }
}

const mapStateToProps = (state) => ({
    
})

const mapDispatchToProps = {
    
}

export default connect(mapStateToProps, mapDispatchToProps)(WorkflowSteps)
