import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Row, Table, Button, Modal, Form, Input, Popconfirm, InputNumber, Col } from 'antd'
import { PageHeader } from '@ant-design/pro-layout';
import Tab from '~/components/Base/Tab'
import tabList from '../config/tabList'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPen, faList, faTrashAlt, faEye } from '@fortawesome/free-solid-svg-icons';
import { save as apiSave, list as apiList, destroy } from '~/apis/assetDevice/group'
import { checkPermission, showNotify } from '~/services/helper'
import { QuestionCircleOutlined } from '@ant-design/icons'
import {screenResponsive, status_assetDevices} from '~/constants/basic';
import DeleteButton from '~/components/Base/DeleteButton';
import SkuDeviceDropdown from '../config/SkuDeviceDropdown';
import TooltipButton from "~/components/Base/TooltipButton";

export class index extends Component {

    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            datas: [],
            visible: false,
            group: null
        }
        this.formAddRef = React.createRef();
        this.formRef = React.createRef();
    }

    componentDidMount() {
        this.getList();
    }

    getList = (params = {}) => {
        let xhr = apiList(params)
        xhr.then(res => {
            if(res.status) {
                this.setState({ datas: res.data.rows })
            }
        })
    }

    /**
     * @event before submit form
     * Validate before submit
     */
     handleFormSubmit() {
        this.formAddRef.current.validateFields()
            .then((values) => {
                this.submitForm(values);
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    }

    /**
     * Click edit group
     * @param {*} group 
     */
    clickEdit = group => {
        this.setState({ group, visible: true }, () => {
            if(this.formAddRef.current) {
                this.formAddRef.current.setFieldsValue(group)
            }
        })
    }

    /**
     * Submit form
     * @param {*} values 
     */
    submitForm = values => {
        this.setState({ loading: true })
        const { group } = this.state;
        let xhr = apiSave(group ? group.id : 0, values)
        xhr.then(res => {
            this.setState({ loading: false })
            if(res.status) {
                this.getList();
                this.onCancelModal();
            } else {
                showNotify('Notify', res.message, 'error')
            }
        })
    }

    /**
     * On cancel modal
     */
    onCancelModal = () => {
        if(this.formAddRef.current) {
            this.formAddRef.current.resetFields();
        }
        this.setState({ visible: false, group: null })
    }

    /**
     * Delete group
     * @param {*} id 
     */
    deleteGroup = async id => {
        let res = await destroy(id)
        if(res.status) {
            this.getList();
        }
    }
    updateStatus = async (id,data) => {
        this.setState({ loading: true })
        let status = 3;
        data.status = status;
        let res = await apiSave(id, data)
        if(res.status) {
            this.getList();
            showNotify('Notify', res.message, 'success')
            this.setState({ loading: false })
        }else{
            showNotify('Notify', res.message, 'error')
            this.setState({ loading: false })
        }
    }
    onSearch(values) {
        this.getList(values)
    }
    render() {
        const { visible, datas, loading, group } = this.state;
        const {t} = this.props
        const columns = [
            {
                title: 'No',
                render: r => datas.indexOf(r) + 1
            },
            {
                title: t('name'),
                // render: r => <Button type='link' onClick={() => this.clickEdit(r)}>{r.name}</Button>
                render: r =>r.name

            },
            {
                title: 'SKU',
                render: r => {
                    let sku = ''
                    if(Array.isArray(r.sku) && (r.sku).length){
                        sku = r.sku.join(', ')
                    }
                    return <span>{sku}</span>
                }
            },
            {
                title: t('maintenance') + (' ') + t('month'),
                render: r => r.maintenance_month
            },
            {
                title: t('status'),
                render: r => (r.status !== undefined && r.status !== null) ? status_assetDevices[r.status] : ''

            },
            {
                title: t('date'),
                render: r => (
                    <>
                        {r.created_by_user ? (
                            <small>
                                Created: {r.created_at} by {r.created_by_user.name}
                            </small>
                        ) : ''
                    }
                        <br></br>
                        {r.verified_by_user ? (
                            <small>
                                Verify: {r.verified_at} by {r.verified_by_user.name}
                            </small>
                        )   : ''
                    }
                        <br></br>
                        {r.approved_by_user ? (
                            <small>
                                Approved: {r.approved_at} by {r.approved_by_user.name}
                            </small>
                        )   : ''
                    }
                    </>
                )
            },
            {
                title: t('action'),
                render: r => {
                    return (
                      <>
                        <Link to={`/asset-device/group/edit/${r.id}`}>
                            {checkPermission('hr-asset-device-group-update') ? 
                            <Button className='btn_icon_image' type="primary" size="small">
                                <FontAwesomeIcon icon={faPen} />
                            </Button>
                            : '' }
                        </Link>

                        <Link to={`/asset-device/part/${r.id}`}>
                                <Button className='btn_icon_image ml-2' type="primary" size="small">
                                    <FontAwesomeIcon icon={faEye} />
                                </Button> 
                        </Link>
                        {/* <Popconfirm
                          title="Bạn có muốn xóa nhóm bảo dưỡng/bảo trì phận này ?"
                          placement="topLeft"
                          icon={
                            <QuestionCircleOutlined style={{ color: "red" }} />
                          }
                          onConfirm={(e) => this.deleteGroup(r.id)}
                          className='ml-2'
                        >
                            {
                                checkPermission('hr-asset-device-group-delete') ? 
                                    <Button
                                        type="primary"
                                        size="small"
                                        icon={<FontAwesomeIcon icon={faTrashAlt} />}
                                    />
                                : ''
                            }
                        </Popconfirm> */}
                         <DeleteButton className='ml-2' onConfirm={() => this.updateStatus(r.id, r)}/>
                      </>
                    );
                }
            }
        ]
        return (
            <>
                <PageHeader title={ t('group') + (' ') + t('hr:maintenance')}
                    tags={[
                        checkPermission('hr-asset-device-group-create') ?
                            <Link
                                to={"/asset-device/group/create"}
                                key="create-training-plan"
                            >
                                <Button type="primary" key='create' icon={<FontAwesomeIcon icon={faPlus} />}
                                >
                                    {t('add_new')}
                                </Button>
                            </Link> : ''

                            // <Button type="primary" key='create' icon={<FontAwesomeIcon icon={faPlus} />}
                            //     onClick={() => this.setState({ visible: true })}
                            // >
                            //     &nbsp; Add new
                            // </Button> : ''
                    ]}
                />
                <Row className="card mb-3 p-3">
                    <div id="tab_responsive">
                        <div className='tab_content_mantenance_device'>
                            <Tab tabs={tabList(this.props)} />
                        </div>
                    </div>
                    <Form
                        className="mt-3"
                        ref={this.formRef}
                        onFinish={(values) => this.onSearch(values)}
                        layout='vertical'
                    >
                        <Row gutter={12}>
                            <Col span={4}>
                                <Form.Item name="keyword">
                                    <Input placeholder={ t('name') + (' ') + t('SKU')}/>
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Button type="primary" htmlType="submit">
                                   {t('search')}
                                </Button>

                            </Col>
                        </Row>
                    </Form>
                </Row>
                <Table
                    loading={loading}
                    columns={columns}
                    rowKey='id'
                    dataSource={datas}
                    pagination={{pageSize: 30}}
                    className='asset-device-criterions'
                />
                <Modal
                    forceRender
                    open={visible}
                    onCancel={() => this.onCancelModal()}
                    width=  {window.innerWidth < screenResponsive  ? '100%' : '40%'}
                    onOk={() => this.handleFormSubmit()}
                    title={group ? group.name :  t('add_new') + (' ') + t('group')}
                >
                    <Form
                        ref={this.formAddRef}
                        layout='vertical'
                    >
                        <Form.Item label='Name' name='name' rules={[{ required: true, message: t('hr:input_title') }]}>
                            <Input placeholder={ t('name')} />
                        </Form.Item>
                        <Form.Item label='SKU' name='sku'>
                            <SkuDeviceDropdown defaultOption={ t('SKU') + (' ') + t('hr:device')}
                                mode="multiple" />
                        </Form.Item>
                        <Form.Item label={t('hr:maintenance') + (' ') + t('month')} name='maintenance_month'>
                            <InputNumber placeholder={t('hr:maintenance') + (' ') + t('month')} />
                        </Form.Item>
                    </Form>
                </Modal>
            </>
        )
    }
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(index)