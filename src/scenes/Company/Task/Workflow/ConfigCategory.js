import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Row, Col, Form, Table, Input, Button, Modal} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen } from '@fortawesome/free-solid-svg-icons';
import {  showNotify } from '~/services/helper';
import DeleteButton from '~/components/Base/DeleteButton';
import {getListCategory , destroyCategory , detailCategory , updateCategory, createCategory} from '~/apis/company/workflow/ConfigCategory';
import { projectTaskPriority } from '~/constants/basic';
import { getList as getListWorkflow} from '~/apis/company/workflow';
import Dropdown from '~/components/Base/Dropdown';

import {screenResponsive} from '~/constants/basic';
const dateTimeFormat = 'YYYY-MM-DD HH:mm'
export class ConfigCategory extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            datas: [],
            visible: false,
            loading: false,
            data: {},
            // workflows: []
        }
    }
    componentDidMount() {
        this.getListCategory()
        this.getWorkflow()
    }
    /**
     * Get list workflows
     * @param {} params 
     */
    getWorkflow = (params = {}) => {
        // this.setState({ loading: true });
        params = {
            ...params,
            type: 2,
            // limit: 1000
        }
        let xhr = getListWorkflow(params);
        xhr.then((response) => {
            if (response.status) {
                let { data } = response;
                this.setState({
                    workflows: data.rows,
                    // loading: false,
                });
            }
        });
    }
    async getListCategory() {
        this.setState({loading : true})
        let response = await getListCategory()
        if(response.status){
            this.setState({datas : response.data , loading : false})
        }else{
            showNotify('Notification' , response.message , 'error')
        }
    }
    async onDeleteCategory (e, id, index) {
        e.stopPropagation();
        let response = await destroyCategory(id)
        if (response.data) {
            showNotify(('Notification'), ('Deleted successfully!'));
            const newdatas = this.state.datas.slice()
            newdatas.splice(index, 1)
            this.setState({ datas: newdatas })
        }
    }
    openModal (r) {
        let values = {
            name : r.name ,
            priority : r.priority ,
            wf_ids : r.wf_ids
        }
        this.setState({data : r , visible : true} , () => this.formRef.current.setFieldsValue(values))
    }
    submitForm(values){
        let {data } = this.state
        let xhr;
        let message = '';
        if(data.id){
            xhr = updateCategory(data.id , values)
            message = 'Cập nhật thành công'
        }else{
            xhr = createCategory(values)
           message = 'Tạo thành công !'
        }
        xhr.then(response => {
            if(response.status) {
                showNotify(('Notification'), message);
                this.getListCategory()
                this.setState({visible : false})
            }else {
                showNotify(('Notification'), response.message , 'error');
            }
        });
        xhr.catch(err => {
            console.log(err)
        })
    }
    /**
     * @event before submit form
     * Validate before submit
     */
    handleSubmit() {
        this.formRef.current.validateFields()
            .then((values) => {
                this.submitForm(values)
            }
             )
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    }
    render() {
        const columns = [
            {
                title: 'ID',
                width : '5%',
                dataIndex: 'id',
            },
            {
                title: 'Name',
                width : '25%',
                dataIndex: 'name',
            },
            {
                title: 'Priority',
                width : '5%',
                render : r => projectTaskPriority[r.priority]
            },
            // {
            //     title: 'Wf Ids',
            //     width : '5%',
            //     render : r=> <span>{(r?.wf_ids).toString()}</span>
            // },
            {
                title : 'Workflows',
                width : '20%',
                render : r => {
                    let result = []
                    if(Array.isArray(r.workflows) && (r.workflows).length ){
                        (r.workflows).map( w =>
                            result.push(<div key={w.id}>{w?.name}</div>) )
                    }
                    return result
                }
            },
            {
                title : 'Date',
                width : '25%',
                render : r => <>
                { 
                    <small> 
                        Created:&nbsp;
                        {
                           r?.created_at
                        }
                    </small>
                }
                { 
                    r.created_by > 0 &&
                    <small> 
                        &nbsp;By { r.created_by_user ? r.created_by_user.name : ''} #<strong>{r.created_by}</strong>
                    </small> 
                }
                { 
                    <small> 
                        <br/> 
                        Modified:&nbsp;
                        {
                            r?.updated_at
                        }
                    </small>
                }
            </>
            },
            {
                title: 'Action',
                width : '10%' ,
                render: (r, text, index) => <>
                    <Button className='mr-2' type="primary" size='small'
                        icon={<FontAwesomeIcon icon={faPen} />} onClick={() => this.openModal(r)}
                    >
                    </Button>
                    <DeleteButton onConfirm={(e) => this.onDeleteCategory(e, r.id, index)} />
                </>
            }
        ]
        let { t } = this.props
        let title =  Object.keys(this.state.data).length === 0 ? 'Thêm' : 'Chỉnh sửa'
        return (
            <div><PageHeader
                title={t('Config Category')}
                tags={
                    <Button key="create-category" type="primary" icon={<FontAwesomeIcon icon={faPlus} />} onClick={() => this.setState({ visible : true , data :{}})}>
                        &nbsp;{t('Add new')}
                    </Button>
                }
            />
                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        {window.innerWidth < screenResponsive  ? 
                            <div className='block_scroll_data_table'>
                                <div className='main_scroll_table'> 
                                    <Table
                                        dataSource={this.state.datas ? this.state.datas : []}
                                        columns={columns}
                                        loading={this.state.loading}
                                        pagination={false}
                                        rowKey={'id'}
                                    />
                                </div>
                            </div>
                            :
                            <Table
                                dataSource={this.state.datas ? this.state.datas : []}
                                columns={columns}
                                loading={this.state.loading}
                                pagination={false}
                                rowKey={'id'}
                            />
                        }
                    </Col>
                </Row>
                <Modal
                    title={title}
                    open={this.state.visible}
                    onCancel={() => this.setState({ visible: false })}
                    onOk={() => this.handleSubmit()}
                    afterClose={() => {
                        this.formRef.current.resetFields()
                        this.setState({ data : {} })
                    }}
                    width= {window.innerWidth < screenResponsive  ? '100%' :'50%'}
                >
                    <Form
                        ref={this.formRef}
                        name="Form"
                        // onFinish={this.submitFormEdit.bind(this)}
                        layout="vertical"
                    >
                        <Row>
                            <Col span={24}>
                                <Form.Item label='Name' name='name' rules={[{ required: true, message: 'Please input title' }]}>
                                    <Input placeholder='Name' />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Form.Item name={'wf_ids'} label='Workflows' rules={[{ required: true, message: 'Please choose Workflows' }]}>
                                    <Dropdown datas={this.state.workflows} mode='multiple' />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Form.Item label='Priority' name='priority' rules={[{ required: true, message: 'Please choose priority' }]}>
                                    <Dropdown datas={projectTaskPriority} />
                                </Form.Item>
                            </Col>
                        </Row>


                    </Form>
                </Modal>
            </div>
        )
    }
}
const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    };
}
const mapDispatchToProps = (dispatch) => {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(ConfigCategory)