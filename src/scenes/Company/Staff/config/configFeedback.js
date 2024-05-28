import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Row, Col, Form, Table, Select, Input, Button, Modal, TimePicker, Spin } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen, faPlusCircle, faMinusCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { showNotify, checkAssistantManagerHigher, checkPermission } from '~/services/helper';
import DeleteButton from '~/components/Base/DeleteButton';
import dayjs from 'dayjs';
import { apiAddType, apiDeleteType, apiListType , apiDetailType, apiUpdateType} from '~/apis/company/staff/feedbacks';
import Tab from '~/components/Base/Tab';
import tabListFeedbacks from '../../config/tabListFeedbacks';
import StaffDropdownConfig from './StaffDropdownConfig';
export class ConfigFeedback extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            datas: [],
            visible: false,
            loading: false,
            data: {},
            arrSubType : [],
            loadingUpdate : false,
        }
    }
    componentDidMount() {
        this.getListType()
    }
    async getListType() {
        this.setState({ loading: true })
        let response = await apiListType()
        if (response.status) {
            this.setState({ datas: response.data, loading: false })
        }
    }
    onDelete(e, id) {
        let { t } = this.props;
        e.stopPropagation();
        let xhr = apiDeleteType(id);
        xhr.then((response) => {
            if (response.status) {
                this.getListType();
                showNotify(t('Notification'), t('hr:type_removed'));
            } else {
                showNotify(t('Notification'), response.message);
            }
        }).catch(error => {
            showNotify(t('Notification'), t('hr:server_error'));
        });
    }
    handleFormSubmit() {
        this.formRef.current.validateFields()
            .then((values) => {
                delete values.sub
                this.submitForm(values)
            }
             )
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    }
    submitForm(values) {
        let { arrSubType } = this.state;
        let formData = new FormData();
        formData.append('title', values.type);
        arrSubType.map(v => {
            formData.append('subtitle[]', v.title)
        })
        if (values?.manager_user_ids && (values?.manager_user_ids).length) {
            values.manager_user_ids.map(v => {
                formData.append('manager_user_ids[]', v);
            })
        }
        let xhr = apiAddType(formData);
        xhr.then(res => {
            if (res.status) {
                this.setState({ visible: false })
                this.getListType()
            }
        })
            .catch(err => console.log(err))
    }
    addSubType(value){
        let subType ={
            title :  value
        }
        if(value.length){
            let newArrSubType = this.state.arrSubType
            if (newArrSubType.length) {
                newArrSubType = [...newArrSubType, subType]
            } else {
                newArrSubType = [subType]
            }
            this.setState({ arrSubType: newArrSubType })
            this.formRef.current.setFieldsValue({sub :''})
        }
    }
    updateRemoveSubType(value, index) {
        let { t } = this.props;
        let newArrSubType = this.state.arrSubType.slice()
        newArrSubType.splice(index, 1)
        let xhr = apiDeleteType(value.id);
        xhr.then((response) => {
            if (response.status) {
                this.setState({ arrSubType: newArrSubType })
                this.getListType();
                showNotify(('Notification'), t('hr:sub_type_removed'));
            } else {
                showNotify(('Notification'), response.message);
            }
        }).catch(error => {
            showNotify(('Notification'), t('hr:server_error'));
        });
    }
    updateAddSubType(value) {
        let { t } = this.props;
        let subType = {
            title: value
        }
        if (value.length) {
            let newArrSubType = this.state.arrSubType
            if (newArrSubType.length) {
                newArrSubType = [...newArrSubType, subType]
            } else {
                newArrSubType = [subType]
            }
            let formData = new FormData();
            formData.append('title' , value)
            formData.append('parent_id', this.state.data.id)
            let xhr = apiAddType(formData);
            xhr.then(res => {
                if (res.status) {
                    this.setState({ arrSubType: newArrSubType })
                    this.getListType()
                    this.formRef.current.setFieldsValue({ sub: '' })
                    showNotify(('Notification'), t('hr:sub_type_add'));
                }else{
                    showNotify(('Notification'), res.message);
                }
            })
                .catch(err =>  showNotify(('Notification'), t('hr:server_error')))
        }
    }
    async editType(r) {
        this.setState({loadingUpdate : true})
        let response = await apiDetailType(r.id)
        if (response.status) {
            this.setState({ visible: true, data: response.data, arrSubType: response.data.subtitle ,loadingUpdate: false })
            this.formRef.current.setFieldsValue({ type: response.data.title  , manager_user_ids : response.data.manager_user_ids })
        }else{
            console.log(response.message)
        }
    }
    async updateTextType(value){
        let { t } = this.props;
        this.setState({loadingUpdate : true})
        let formData = new FormData()
        formData.append('title' , value )
        formData.append('_method', 'PUT')
        let response = await apiUpdateType(this.state.data.id , formData )
        if(response.status){
            this.setState({loadingUpdate : false })
            this.getListType()
            showNotify('Notification' , t('hr:edit_title'))
        }
    }
    async updateAssignStaff(values){
        let { t } = this.props;
        this.setState({loadingUpdate : true})
        let formData = new FormData()
        if(values.length){
            values.map(v => {
                formData.append('manager_user_ids[]' , v )
            })
        }else{
            formData.append('manager_user_ids[]' , [] )
        }
        formData.append('_method', 'PUT')
        let response = await apiUpdateType(this.state.data.id , formData )
        if(response.status){
            this.setState({loadingUpdate : false })
            this.getListType()
            showNotify('Notification' , t('hr:staff_editt'))
        }
    }
    render() {
        const {t, auth :{staff_info}} = this.props;
        const columns = [
            {
                title: 'No.',
                width: '5%',
                render: r => this.state.datas.indexOf(r) + 1
            },
            {
                title: t('hr:title'),
                render: r => <span>{r.title}</span>
            },
            {
                title: t('hr:sub_title'),
                render: r => {
                    let result = [] ;
                    (r.subtitle).map((s,index) => {
                        result.push(<div key={index}>{index+1}/ {s.title}</div>) 
                    })
                    return result
                }
            },
            {
                title: t('created_at'),
                width: '7%',
                render: r => <span>{dayjs(r.created_at).format('YYYY-MM-DD')}</span>
            },
            {
                title: t('created_by'),
                width: '10%',
                render: r => r.create_by
            },
            {
                title: t('action'),
                width: '10%',
                render: r => {
                    return (<>
                        {
                            checkPermission('hr-feedback-config-update') ? 
                                <Button type="primary" size='small' icon={<FontAwesomeIcon icon={faPen} />} className='mr-2' onClick={() => this.editType(r)} /> 
                            : ''
                        }
                        {
                            checkPermission('hr-feedback-config-delete') ?
                                <DeleteButton onConfirm={(e) => this.onDelete(e, r.id)} />
                            : ''
                        }
                    </>)
                },
                align: 'center',
            }
        ]
        return (
            <>
                <PageHeader title={t('hr:config_type')}
                    tags={
                    checkPermission('hr-feedback-config-create') ?
                    <Button key="create-type" type="primary" icon={<FontAwesomeIcon icon={faPlus} />} onClick={() => this.setState({ visible: true, data: {} })}>
                        &nbsp;{t('add_new')}
                    </Button> : ''
                    }
                />
                <Row className='card p-3 mb-3'>
                    {/* <Tab tabs={tabListFeedbacks(checkAssistantManagerHigher(staff_info?.position_id))} /> */}
                    <Tab tabs={tabListFeedbacks(this.props)} />
                </Row>
                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        <Table
                            rowKey='id'
                            dataSource={this.state.datas}
                            columns={columns}
                            pagination={false}
                            loading={this.state.loading}
                        />
                    </Col>
                </Row>
                <Modal
                    open={this.state.visible}
                    title={''}
                    forceRender
                    width='40%'
                    onCancel={() => this.setState({ visible: false })}
                    afterClose={() => {
                        this.formRef.current.resetFields()
                        this.setState({ arrSubType: [] })
                    }
                    }
                    footer = {Object.keys(this.state.data).length != 0 ? null 
                        : [
                            <>
                                <Button key="back" onClick={() => this.setState({ visible: false })}>
                                    {t('cancel')}
                                </Button>
                                <Button key="submit" type="primary"  onClick={this.handleFormSubmit.bind(this)}>
                                    {t('ok')}
                                </Button>
                            </>
                        ]
                        }
                    // onOk={this.handleFormSubmit.bind(this)}
                >  
                
                    <Form
                        preserve={false}
                        ref={this.formRef}
                        layout='vertical'
                    // onFinish={() => this.SubmitForm()}
                    >
                        <Spin spinning={this.state.loadingUpdate}>
                            <Row gutter={24}>
                                <Col span={22}>
                                    <Form.Item label={t('type')} name='type' hasFeedback rules={[{ required: true, message: t('hr:input_type') }]}>
                                        <Input onPressEnter={v =>  Object.keys(this.state.data).length == 0 ? {} : this.updateTextType(v.target.value)}/>
                                    </Form.Item>
                                </Col>
                                <Col span={2} className='align-self-center' style={{marginTop : 15}}>
                                    {
                                        Object.keys(this.state.data).length == 0 ?
                                        []
                                        :
                                        <FontAwesomeIcon className='cursor-pointer' icon={faPen} onClick={() => {
                                            let values = this.formRef.current.getFieldsValue()
                                            this.updateTextType(values.type)
                                        }} />
                                    }
                                </Col>
                                <Col span={Object.keys(this.state.data).length == 0 ? 24 : 22}>
                                    <Form.Item name='manager_user_ids' label={t('hr:manager_confirm')}>
                                        <StaffDropdownConfig 
                                            defaultOption={t('hr:assign_staff')} 
                                            mode='multiple' 
                                        />
                                    </Form.Item>
                                </Col>
                                {
                                    Object.keys(this.state.data).length == 0 ?
                                        []
                                        :

                                        <Col span={2} className='align-self-center' style={{ marginTop: 15 }}>

                                            <FontAwesomeIcon className='cursor-pointer' icon={faPen} onClick={() => {
                                                let values = this.formRef.current.getFieldsValue()
                                                this.updateAssignStaff(values.manager_user_ids)
                                            }} />
                                        </Col>
                                }

                                <Col span={22}>
                                    <Form.Item name='sub' label={t('sub_type')}>
                                        <Input onPressEnter={v => Object.keys(this.state.data).length == 0 ? this.addSubType(v.target.value)  : this.updateAddSubType(v.target.value)} />
                                    </Form.Item>
                                </Col>
                                <Col span={2} className='align-self-center' style={{marginTop : 15}}>
                                    <FontAwesomeIcon icon={faPlusCircle} onClick={() => {
                                            let values = this.formRef.current.getFieldsValue()
                                            Object.keys(this.state.data).length === 0 ? this.addSubType(values.sub) :  this.updateAddSubType(values.sub) 
                                        }} />
                                </Col>
                                <Col span={24}>
                                    {
                                        this.state.arrSubType?.length ?
                                            <div>
                                                <span style={{ fontSize: 15, marginBottom: 5 }}>{t('list')+ t(' ') + t('sub_type')}:</span>
                                                {this.state.arrSubType.map((s, index) => {
                                                    return <div className='ml-2' key={index}>
                                                        <span>{index+1}/ {s.title}</span>
                                                        <FontAwesomeIcon icon={faMinusCircle} className='ml-2 mt-1 cursor-pointer' onClick={async () => { this.updateRemoveSubType(s, index) }} />
                                                    </div>
                                                })}
                                            </div>
                                            :
                                            []
                                    }
                                </Col>
                            </Row>
                        </Spin>
                    </Form>
                </Modal>

            </>
        )
    }
}

const mapStateToProps = (state) => {
    return {
      auth: state.auth.info,
      baseData: state.baseData
    };
  }
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(ConfigFeedback)