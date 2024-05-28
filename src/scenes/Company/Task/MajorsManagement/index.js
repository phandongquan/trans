import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Button, Table, Row, Col, Form, Modal, Image, Avatar, Input } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tab from '~/components/Base/Tab';
import { showNotify, historyReplace, historyParams, checkManager, checkPermission } from '~/services/helper';
import { getList as getListStaff, saveArea } from '~/apis/company/staff';
import { UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { WorkType } from '~/constants/basic';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import DropdownLocations from '~/components/Base/DropdownLocations';
import tabList from '~/scenes/Company/config/tabListTask';
import { screenResponsive } from '~/constants/basic';
import Dropdown from '~/components/Base/Dropdown';
import StaffDropdown from '~/components/Base/StaffDropdown';
import { getList as apiGetList , create as apiCreate , update as apiUpdate } from '~/apis/company/task/MajorsManagement'
import CreateUpdateDate from '~/components/Base/CreateUpdateDate';
import dayjs from 'dayjs';
import { MEDIA_URL_HR, URL_HR } from '~/constants';
import { withTranslation } from 'react-i18next';

export class MajorsManagerment extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.formModalRef = React.createRef();
        let params = historyParams();
        let page = 1;
        let limit = params.limit ? params.limit : 35;
        this.state = {
            loading: false,
            visible: false,
            datas: [],
            data: {},
            total: 10000,
            page,
            limit,
            visible : false
        }
    }
    componentDidMount() {
        let values = this.formRef.current.getFieldsValue();
        this.getListStaff(values)
    }
    async getListStaff(params = {}) {
        this.setState({ loading: true });
        params = {
            ...params,
            limit: this.state.limit,
            offset: (this.state.page - 1) * this.state.limit
        }
        historyReplace(params);
        let response = await apiGetList(params)
        if (response.status) {
            this.setState({ loading: false, datas: response.data.rows , total : response.data.total })
        } else {
            showNotify('Notification', response.message, 'error')
            this.setState({ loading: false })
        }
    }
    submitForm() {
        let values = this.formRef.current.getFieldsValue()
        this.setState({page : 1}, () => this.getListStaff(values))
    }
    openModal(data){
        this.setState({data , visible : true }, () => this.formModalRef.current.setFieldsValue(data))
    }
    onChangePage(page){
        let values = this.formRef.current.getFieldsValue();
        this.setState({ page }, () => this.getListStaff({ ...values }));
    }
    submitModal(){
        let values = this.formModalRef.current.getFieldsValue()
        let xhr 
        let message = ''
        if(this.state.data?.id){
            xhr = apiUpdate(this.state.data?.id ,values)
            message = 'Updated success!'
        }else{
            xhr = apiCreate(values)
            message = 'Created success!'
        }
        xhr.then(res => {
            if(res.status){
                showNotify('Notification', message)
                this.setState({visible : false , data : {}})
                let valuesSearch = this.formRef.current.getFieldsValue()
                this.getListStaff(valuesSearch)
            }
        })
        xhr.catch(err => showNotify('Notification', err ,'error'))
    }
    render() {
        let { t, baseData: { majors ,departments }, auth: { staff_info } } = this.props;
        console.log(t)
        const columns = [
            {
                title: t('hr:avatar'),
                align: 'center',
                render: r => {
                    if (r.staff && r.staff.avatar) {
                        return <Image className='staff_image' width={64} height={64} preview={true} src={MEDIA_URL_HR + '/' +r.staff.avatar} />
                    } else {
                        return <Avatar size={64} icon={<UserOutlined />} />
                    }
                },
                width: '5%'
            
            },
            {
                title: t('hr:staff_name'),
                render: r => (

                    <div>
                        <Link to={`/company/staff/${r.staff.staff_id}/edit`}>{r.staff.staff_name}</Link> #<strong>{r.staff.code}</strong><br />
                    </div>
                ),
                width: '15%'
            },
            {
                title : t('hr:title'),
                render : r => r.title
            },
            {
                title : t('hr:major'),
                render : r => {
                    let result = []
                    if(Array.isArray(r.majors) && r.majors.length){
                        let arrMajors = r.majors
                        arrMajors.map((majorId,index) => {
                            let majorFind = majors.find(m => m.id == majorId)
                            if(majorFind){
                                result.push(<span key={index}>{index == 0 ? '' : ','} {majorFind.name}</span>)
                            }
                        })
                    }
                    return <div style={{maxWidth:'500px'}}>{result}</div>
                }
            },
            {
                title : t('hr:department'),
                render : r =>  departments.find(d => d.id == r.department_id)?.name
            },
            {
                title: t('hr:date'),
                render: r => {
                    let formatDate = 'YYYY-MM-DD HH:mm'
                    return (
                        <>
                            <small>
                                Created  : {dayjs(r.created).format(formatDate)}
                            </small>
                            {
                                r.created_by > 0 &&
                                <small>
                                    &nbsp;By {r.created_by_user ? r.created_by_user.staff_name : ''} #<strong>{r.created_by}</strong>
                                </small>
                            }
                            <br/>
                            <small>
                                Modified : {dayjs(r.updated_at).format(formatDate)}
                            </small>
                        </>
                    )
                }
            },
            {
                title : t('hr:action'),
                render : r => <>
                    {
                        checkPermission('hr-majors-management-update') ? 
                            <Button icon={<FontAwesomeIcon icon={faPen} />} onClick={() => this.openModal(r)} type='primary' size='small' />
                        : ''
                    }
                </>
            }
            

        ]
    return (
        <div>
            <PageHeader
                title={t('hr:management_major')}
                subTitle={
                checkPermission('hr-majors-management-create') ?
                <Button type='primary' onClick={() => this.setState({ visible: true, data: {} })}>{t('hr:add_new')}</Button>
                : ''
            }
            />
            <Row className={window.innerWidth < screenResponsive ? "card pl-3 pr-3 mb-3 pb-3" : "card pl-3 pr-3 mb-3"}>
                <div id="tab_responsive">
                    <div className='tab_content_mantenance_device'>
                        <Tab tabs={tabList(this.props)}></Tab>
                    </div>
                </div>
                <Form className="form_majors_management"
                    ref={this.formRef}
                    name="searchForm"
                    onFinish={this.submitForm.bind(this)} >
                    <Row gutter={12}>
                        <Col xs={12} sm={12} md={12} lg={4} xl={4} >
                            <Form.Item name="title">
                                <Input placeholder={t('hr:title')} />
                            </Form.Item>
                        </Col>
                        <Col xs={12} sm={12} md={12} lg={4} xl={4} >
                            <Form.Item name="majors">
                                <Dropdown datas={majors} defaultOption={t('hr:all_major')} mode='multiple' />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={4} xl={4} >
                            <Form.Item name="staff_id" >
                                <StaffDropdown defaultOption={t('hr:all_staff')} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={4} xl={4} >
                            <Button htmlType="submit" type='primary'>{t('hr:search')}</Button>
                        </Col>
                    </Row>
                </Form>
            </Row>
            <Row gutter={[16, 24]}>
                <Col span={24}>
                    {window.innerWidth < screenResponsive ?
                        <div className='block_scroll_data_table'>
                            <div className='main_scroll_table'>
                                <Table
                                    dataSource={this.state.datas}
                                    columns={columns}
                                    loading={this.state.loading}
                                    pagination={{
                                        total: this.state.total,
                                        pageSize: this.state.limit,
                                        hideOnSinglePage: true,
                                        showSizeChanger: false,
                                        current: this.state.page,
                                        onChange: page => this.onChangePage(page)
                                    }}
                                    rowKey={'id'}
                                />
                            </div>
                        </div>
                        :
                        <Table
                            dataSource={this.state.datas}
                            columns={columns}
                            loading={this.state.loading}
                            pagination={{
                                total: this.state.total,
                                pageSize: this.state.limit,
                                hideOnSinglePage: true,
                                showSizeChanger: false,
                                current: this.state.page,
                                onChange: page => this.onChangePage(page)
                            }} rowKey={'id'}
                        />}
                </Col>
                <Modal
                    title={this.state.data.id ? t('hr:edit') : t('hr:add_new')}
                    open={this.state.visible}
                    onCancel={() => this.setState({ visible: false, data: {} })}
                    onOk={() => this.submitModal()}
                    okText={t('submit')}
                    width={'60%'}
                >
                    <Form
                        className="form_modal_majors_management"
                        ref={this.formModalRef}
                        name="ModalForm"
                        layout="vertical">
                        <Row gutter={24}>
                            <Col span={24}>
                                <Form.Item name='title' label={t('hr:title')}>
                                    <Input placeholder={t('hr:title')} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name='staff_id' label={t('hr:staff')}>
                                    <StaffDropdown defaultOption={t('hr:all_staff')} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name='majors' label={t('hr:major')} >
                                    <Dropdown datas={majors} defaultOption={t('hr:all_major')}  mode='multiple' />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name='department_id' label={t('hr:dept')} >
                                    <Dropdown datas={departments} defaultOption={t('hr:department')} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Modal>
            </Row>
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
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(MajorsManagerment))