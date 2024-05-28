import { PageHeader } from '@ant-design/pro-layout'
import { faPen, faPlus, faSave } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, Col, Divider, Form, Input, Modal, Row, Table } from 'antd'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Tab from '~/components/Base/Tab';
import tabConfig from './config/tab';
import { getListDetailStaff , create , detail , update ,destroy } from '~/apis/company/staff/externalAccount'
import { showNotify, timeFormatStandard } from '~/services/helper'
import DeleteButton from '~/components/Base/DeleteButton'
import { dataTypeExternal, typeStatusExternal } from '~/constants/basic'
import Dropdown from '~/components/Base/Dropdown'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
export class ExternalAccount extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef()
        this.state = {
            loading: false,
            datas : [],
            data : {},
            visible : false
        }
    }
    componentDidMount(){
        this.getList()
    }
    async getList(params = {}){
        this.setState({loading: true})
        let id = this.props.match.params.id;
        let response = await getListDetailStaff(id)
        if(response.status){
            this.formRef.current.setFieldsValue({datas : response.data.rows })
            this.setState({loading : false , datas : response.data.rows})
        }else{
            showNotify('Notification' , response.message , 'error')
            this.setState({loading: false})
        }
    }
    // submitModal(values){
    //     let id = this.props.match.params.id;
    //     let xhr 
    //     let message 
    //     values = {
    //         ...values,
    //         staff_id : id
    //     }
    //     if(this.state.data?.id){
    //         values = {
    //             ...values,
    //             id : this.state.data.id
    //         }
    //         xhr = update(values)
    //         message = 'Updated success!'
    //     }else{
    //         xhr = create(values)
    //         message = 'Created success!'
    //     }
    //     xhr.then(res => {
    //         if(res.status){
    //             showNotify('Notification', message)
    //             this.getList()
    //             this.setState({visible : false})
    //         }
    //     })
    //     xhr.catch(err => console.log(err))
    // }
    // handleSubmitModal(){
    //     this.formRef.current.validateFields()
    //         .then((values) => {
    //             this.submitModal(values);
    //         })
    //         .catch((info) => {
    //             console.log('Validate Failed:', info);
    //         });
    // }
    // popupModal(data){
    //     // let xhr = detail(data.id)
    //     // xhr.then(res=> {
    //     //     console.log(res)
    //     // })
    //     // xhr.catch((error) => console.log(error))
    //     this.setState({visible : true , data } , () => this.formRef.current.setFieldsValue(data))
    // }
    // onRemove(data){
    //     let xhr = destroy(data.id)
    //     xhr.then(res => {
    //         if(res.status){
    //             this.getList()
    //             showNotify('Notification', 'Deleted success!')
    //         }else{
    //             showNotify('Notification', res.message , 'error')
    //         }
    //     })
    //     xhr.catch(err => console.log(err))
    // }
    submitForm(values) {
        const { t } = this.props;
        let id = this.props.match.params.id;
        if(values.datas.length){
            values.datas.map(d => d['staff_id'] = id )
        }
        let dataFormart = {
            data : values.datas
        }
        let xhr = create(dataFormart)
        xhr.then(res => {
            if (res.status) {
                showNotify(t('hr:notification'), 'Success!')
                this.getList()
            }
        })
        xhr.catch(err => console.log(err))
    }
    render() {
        let { t, match } = this.props;
        let id = match.params.id;
        const columns = [
            // {
            //     title : 'Staff',
            //     render : r => <span>{r?.staff?.staff_name}</span>
            // },   
            {
                title : t('hr:business_partner'),
                render : r => dataTypeExternal[r.type]
            },
            {
                title: t('hr:account_name'),
                render : r => r.title
            },
            {
                title : t('hr:note'),
                render : r => r.note
            },
            {
                title : t('last_modified'),
                render : r => <small>{timeFormatStandard(r.updated_at, 'HH:mm DD/MM/YY')} <strong> by# {r.created_by_user.name}</strong></small>
            },
            {
                title : t('hr:status'),
                render : r=> typeStatusExternal[r.status]
            },
            {
                title : t('hr:action'),
                render: r=> <>
                    <Button className='mr-2' type='primary' icon={<FontAwesomeIcon icon={faPen} />} size='small' onClick={() => this.popupModal(r)}/>
                    <DeleteButton onConfirm={() => this.onRemove(r)} />
                </>
            }
        ]
        const constTablist = tabConfig(id,this.props);     
        return (
            <div>
                <PageHeader
                    title={t('hr:external_account')}
                    // tags={<Button type='primary' icon={<FontAwesomeIcon icon={faPlus}/>}
                    // onClick={() => this.setState({visible: true , data : {}})}
                    // >Add new</Button>}
                />
                <Row className="card p-3 mb-3 pt-0 tab_common">
                    <Tab tabs={constTablist} />
                </Row>
                {/* <Table
                    columns={columns}
                    dataSource={this.state.datas}
                    loading={this.state.loading}
                    pagination={false}
                    rowKey={'id'}
                />
                <Modal 
                    title={this.state.data?.id ? 'Edit' : 'Add new'}
                    open={this.state.visible}
                    width={'50%'}
                    onCancel={() => this.setState({visible: false})}
                    onOk={() => this.handleSubmitModal()}
                    afterClose={()=> this.setState({data: {}})}
                >
                    <Form ref={this.formRef} layout='vertical' >
                        <Row gutter={[24,12]}>
                            <Col span={12}>
                                <Form.Item name={'type'} label={'Business partners'} >
                                    <Dropdown datas={dataTypeExternal} defaultOption={'-- All Business --'} />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name={'title'} label={'Account name'} >
                                    <Input placeholder='Account name'/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name={'status'} label={'Status'} >
                                    <Dropdown datas={typeStatusExternal} defaultOption={'-- All Status --'} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name={'note'} label={'Note'} >
                                    <Input.TextArea autoSize={{minRows : 3}} placeholder='Note'/>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Modal> */}
                <Form ref={this.formRef} name="upsertForm" className="ant-advanced-search-form " layout="vertical"
                    onFinish={this.submitForm.bind(this)}>
                    <Row gutter={12} className='card p-3 mb-3'>
                        <Col span={24}>
                            <Row gutter={6}>
                                <Col span={4} className='text-center'>
                                    <span >{t('hr:business_partner')}</span>
                                </Col>
                                <Col span={4} className='text-center'>
                                    <span >{t('hr:account_name')}</span>
                                </Col>
                                <Col span={5} className='text-center'>
                                    <span >{t('hr:note')}</span>
                                </Col>
                                <Col span={4} className='text-center'>
                                    <span >{t('hr:status')}</span>
                                </Col>
                                <Col span={4} className='text-center'>
                                    <span >{t('hr:last_modified')}</span>
                                </Col>
                            </Row>
                        </Col>
                        <Col span={24}>
                            <Form.List name="datas">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name, fieldKey, ...restField }, index) => {
                                            return (
                                                <Row gutter={12} key={key}>
                                                    <Col span={4}>
                                                        <Form.Item
                                                            {...restField}
                                                            name={[name, "type"]}
                                                            fieldKey={[fieldKey, "type"]}
                                                            rules={[{ required: true, message: t('input_business_partner') }]}
                                                        >
                                                            {/* <Dropdown datas={dataTypeExternal} defaultOption='-- All Business --' /> */}
                                                            <Input placeholder={t('hr:business_partner')}/>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={4}>
                                                        <Form.Item
                                                            {...restField}
                                                            name={[name, "title"]}
                                                            fieldKey={[fieldKey, "title"]}
                                                            rules={[{ required: true, message: t('input_account_name') }]}
                                                        >
                                                            <Input placeholder={t('hr:account_name')} />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={6}>
                                                        <Form.Item  {...restField}
                                                            name={[name, "note"]}
                                                            fieldKey={[fieldKey, "note"]}>
                                                            <Input placeholder={t('hr:note')} />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={3}>
                                                        <Form.Item
                                                            {...restField}
                                                            name={[name, "status"]}
                                                            fieldKey={[fieldKey, "status"]}
                                                        >
                                                            <Dropdown datas={typeStatusExternal} defaultOption={t('hr:all_status')} />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={4}>
                                                        <Form.Item>
                                                            <div className='text-center'>{this.state.datas[index]?.updated_at}</div>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={1}>
                                                        <MinusCircleOutlined
                                                            className="mt-2"
                                                            onClick={() => {
                                                                remove(name);
                                                                // this.updateMassDelete(key);
                                                            }}
                                                        />
                                                    </Col>
                                                </Row>
                                            )
                                        })}
                                        <Form.Item>
                                            <Button
                                                className='mt-2'
                                                type="dashed"
                                                onClick={() => add()}
                                                block
                                                icon={<PlusOutlined />}
                                            >
                                                  {t("add")} 
                                            </Button>
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>
                        </Col>
                    </Row>
                    <Divider className="m-0" />
                    <Row gutter={12} className="pt-3 pb-3">
                        <Col span={24} key="bnt-submit" style={{ textAlign: "right" }}>
                            <Button
                                type="primary"
                                icon={<FontAwesomeIcon icon={faSave} />}
                                htmlType="submit"
                                loading={this.state.loading}
                            >
                                &nbsp;{t("hr:save")}
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(ExternalAccount)