import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal, Table, Form, Row, Col, Button, Popconfirm } from 'antd';
import StaffDropdown from '~/components/Base/StaffDropdown';
import { SendOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { getList, create, destroy } from '~/apis/company/workflowAssign'
import { showNotify } from '~/services/helper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import {screenResponsive} from '~/constants/basic';

export class AssignStaff extends Component {

    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            visible: false,
            workflow: null,
            assignStaffs: [],
        }
    }

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    /**
     * Toggle modal
     * @param {*} visible 
     */
    toggleModal = (visible = false, workflow = null) => {
        if(visible && workflow) {
            this.getStaffAssignByWorkflow(workflow);
        }
        this.setState({ visible, workflow })
    }

    /**
     * Get list staff by workflow
     * @param {*} workflow 
     */
    getStaffAssignByWorkflow = async workflow => {
        this.setState({ loading: true })
        let response = await getList({ workflow_id: workflow.id })
        this.setState({ loading: false })
        if(response.status) {
            const { rows } = response.data;
            this.setState({ assignStaffs: rows })
        }
    }

    /**
     * Handle add staff
     */
    handleAddStaff = async () => {
        this.setState({ loading: true })
        const { workflow } = this.state;
        let values = this.formRef.current.getFieldsValue();
        values.workflow_id = workflow.id
        let response = await create(values);
        this.setState({ loading: false })
        if(response.status) {
            this.getStaffAssignByWorkflow(workflow)
            this.formRef.current.resetFields()
        } else {
            showNotify('Notify', response.data.message, 'error')
        }
    }

    /**
     * Delete item
     * @param {*} event 
     * @param {*} item 
     */
    onDeleteStaff = async (event, id) => {
        this.setState({ loading: true })
        event.stopPropagation();
        const { workflow } = this.state;
        let response = await destroy(id);
        this.setState({ loading: false })
        if (response.status) {
            this.getStaffAssignByWorkflow(workflow);
            showNotify('Notification', 'Successful delete!');
        } else {
            showNotify('Notification', response.message, 'error');
        }
    }

    render() {
        const { visible, assignStaffs, loading } = this.state;
        const { baseData: { departments, majors, locations, positions } } = this.props

        let columns = [
            {
                title: 'No.',
                render: r => assignStaffs.indexOf(r) + 1,
                width: 60
            },
            {
                title: 'Staff',
                render: r => {
                    if(!r.staff) {
                        return ''
                    }

                    let deptFinded = departments.find(d => d.id == r.staff.staff_dept_id)
                    let majorFinded = majors.find(m => m.id == r.staff.major_id)
                    let locFinded = locations.find(l => l.id == r.staff.staff_loc_id)
                    return <div>{r.staff?.staff_name} <small><strong>({deptFinded?.name} / {majorFinded?.name} / {locFinded?.name})</strong></small></div>
                }
            },
            {
                title: 'Position',
                render: r => {
                    if(!r.staff) {
                        return ''
                    }

                    let positionFinded = positions.find(p => p.id == r.staff.position_id)
                    return positionFinded?.name
                }
            },
            {
                title: '',
                render: r => <Popconfirm title='Confirm delete selected item?'
                    placement="topLeft"
                    icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                    onConfirm={(e) => this.onDeleteStaff(e, r.id)}
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
        ]
        
        return <Modal
            open={visible}
            onCancel={() => this.toggleModal()}
            title='Assign Staff'
            width= {window.innerWidth < screenResponsive  ? '100%' :'60%'}
            footer={false}
        >
            <Form
                ref={this.formRef}
            >
                <Row gutter={12}>
                    <Col xs={24} sm={24} md={24} lg={20} xl={20}>
                        <Form.Item name='staff_id'>
                            <StaffDropdown mode='multiple' defaultOption='--- All Staffs ---' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                        <Button type='primary' icon={<SendOutlined />} onClick={() => this.handleAddStaff()}>
                            Add
                        </Button>
                    </Col>
                </Row>
            </Form>
            {window.innerWidth < screenResponsive  ? 
                    <div className='block_scroll_data_table'>
                        <div className='main_scroll_table'> 
                            <Table
                                  loading={loading}
                                  columns={columns}
                                  dataSource={assignStaffs}
                                  rowKey='id'
                                  pagination={{ pageSize: 30 }}
                            />
                        </div>
                    </div>
                    :
                    <Table
                        loading={loading}
                        columns={columns}
                        dataSource={assignStaffs}
                        rowKey='id'
                        pagination={{ pageSize: 30 }}
                    />
            }
        </Modal>;
    }
}

const mapStateToProps = (state) => ({
    baseData: state.baseData
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(AssignStaff);

