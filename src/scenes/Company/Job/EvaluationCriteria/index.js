import { PageHeader } from '@ant-design/pro-layout'
import { Button, Table, Row, Col, Form, Input, Modal, Space, InputNumber, Dropdown as DropdownAntd, Tag, Badge, Popconfirm, Menu, Upload } from 'antd';
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Tab from '~/components/Base/Tab';
import tabList from '~/scenes/Company/Job/config/jobTabList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen, faSortDown, faDownload, faCaretDown, faPaperclip } from '@fortawesome/free-solid-svg-icons';
import Dropdown from '~/components/Base/Dropdown';
import { MinusCircleOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { getList as apiGetList, detail as apiGetDetail, update as apiUpdate, updateStatus, importJobCriteria, exportJobCriteria, updateListCriteriaJob } from '~/apis/company/job/evaluationcriteria'
import { checkPermission, exportToXLS, showNotify } from '~/services/helper';
import { statusCriteria, typeOnWeb } from '~/constants/basic';
import { uniqueId } from 'lodash';
import { formatData, formatHeader } from './config';
import dayjs from 'dayjs';
import { getList as apiGetListJob } from '~/apis/company/job';
import evaluation_criteria from '~/assets/files/Evaluation_criterias.xlsx';
import { saveAs } from 'file-saver';


const colorStatus = { 1: '#a5e9a5', 0: '#b4bcc1' }
export class EvaluationCriteria extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.formModalRef = React.createRef();
        this.formModalAddJobRef = React.createRef();
        this.state = {
            loading: false,
            datas: [],
            data: {},
            visible: false,
            limit: 20,
            total: 100,
            page: 1,
            arrDatasSubCriteria: [],
            arrSubCriteriaRemove: [],
            selectedRowKeys: [] , 
            visibleAddJob : false ,
            datasJob : [] ,
            valuesJob : [] ,
            file: null,
            fileList: [],
            visibleConfirmUpload: false,
        };
    }
    componentDidMount() {
        this.getListEvaluationCriteria()
        this.getListJobs()
    }
    async getListEvaluationCriteria(params = {}) {
        this.setState({ loading: true });
        params = {
            page: this.state.page,
            ...params
        }
        let response = await apiGetList(params)
        if (response.status) {
            this.setState({ loading: false, datas: response.data.rows, total: response.data.total, selectedRowKeys: [] })

        } else {
            showNotify('Notification', response.message, 'error')
            this.setState({ loading: false })
        }
    }
    getListJobs(){
        let params = {
            limit : 10000 ,
        }
        let xhr = apiGetListJob(params);
        xhr.then((response) => {
            if (response.status) {
                let  datas  = response.data.rows;
                let result = []
                if(datas.length){
                    datas.map(d=> result.push({id : d.id , name : d.title}))
                }
                this.setState({datasJob : result})
            }
        });
    }
    submitForm() {
        let values = this.formRef.current.getFieldsValue()
        this.setState({ page: 1 }, () => this.getListEvaluationCriteria(values));
    }
    /**
     * @event before submit form
     * Validate before submit
     */
    handleFormModal() {
        this.formModalRef.current.validateFields()
            .then((values) => {
                if (values.sub_criterias?.length) {
                    this.submitFormModal(values);
                } else {
                    showNotify('Notification', 'Please input values sub criterias !', 'error')
                }
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    }
    submitFormModal(values = {}) {
        Object.keys(values).forEach(key => {
            if (values[key] == null || values[key] == undefined) {
                delete values[key];
            }
        });
        values = {
            id: this.state.data?.id ? this.state.data.id : 0,
            ...values
        }
        if (values.sub_criterias?.length) {
            values.sub_criterias.map(s => {
                if (!s?.id) {
                    s.id = 0
                }
            })
        }
        if (this.state.arrSubCriteriaRemove.length) {
            values['sub_criteria_remove'] = this.state.arrSubCriteriaRemove
        }
        let xhr = apiUpdate([values])
            .then(res => {
                if (res.status) {
                    showNotify('Notification', 'Success!')
                    this.setState({ visible: false, arrSubCriteriaRemove: [], arrDatasSubCriteria: [] })
                    this.getListEvaluationCriteria()
                } else {
                    showNotify('Notification', res.message, 'error')
                }
            })
            .catch(err => console.log(err))
    }
    popupModal(data) {
        let params = {
            criteria_id: data.id,
        }
        let xhr = apiGetDetail(params)
            .then(res => {
                if (res.status) {
                    this.setState({ visible: true, data: res.data.rows[0], arrDatasSubCriteria: res.data.rows[0]?.sub_criterias }
                        , () => this.formModalRef.current.setFieldsValue(res.data.rows[0]))

                } else {
                    showNotify('Notification', res.message, 'error')
                }
            })
            .catch(err => console.log(err))
    }
    onChangeStatus(status, id) {
        let params = {
            status: status,
            criteria_id: typeof id == 'number' ? id : this.state.selectedRowKeys.toString()
        }
        let xhr = updateStatus(params)
        xhr.then(res => {
            if (res.status) {
                showNotify('Notification', 'Success!')
                this.getListEvaluationCriteria()
            } else {
                showNotify('notification', res.message, 'error')
            }
        })
        xhr.catch(err => console.log(err))
    }
    /**
 * @event change page
 * 
 * @param {*} page 
 */
    onChangePage(page) {
        let values = this.formRef.current.getFieldsValue();
        //remove value undefined
        // window.scrollTo(0,0)
        this.setState({ page }, () => this.getListEvaluationCriteria({ ...values }));
    }
    onSelectChange = (newSelectedRowKeys) => {
        this.setState({ selectedRowKeys: newSelectedRowKeys });
    };

    exportJobCriteria() {
        const { t, baseData: { majors } } = this.props;
        exportJobCriteria()
            .then(res => {
                const { data } = res;
                let header = formatHeader();
                let rows = formatData(data, majors);
                let fileName = `Evaluation-criteria-${dayjs().format('YYYY-MM-DD')}`;
                let datas = [...header, ...rows];
                exportToXLS(fileName, datas);
            })
            .catch(err => console.log(err))
    }

    importJobCriteria(e) {
        let file = e.target.files[0]
        let formData = new FormData();
        formData.append('Upload[excel_file]', file);
        importJobCriteria(formData)
            .then(res => {
                if (res.status) {
                    showNotify('Notification', 'Success!')
                    this.getListEvaluationCriteria()
                } else {
                    showNotify('Notification', res.message, 'error')
                }
            })
            .catch(err => console.log(err))
    }
    async submitAddJobs(){
        this.setState({loading : true})
        if(this.state.valuesJob.length){
            let strJob_id = this.state.valuesJob.join(',')
            let params = {
                job_id : strJob_id,
                type: 'add'
            }
            let response = await updateListCriteriaJob(params , this.state.selectedRowKeys)
            if(response.status){
                showNotify('Notification','Success!')
                this.setState({ loading : false , visibleAddJob : false})
            }
        }else{
            showNotify('Notification', 'Please input jobs', 'error')
            this.setState({loading : false})
        }
    }
    downloadImportTemplate(){
        saveAs(evaluation_criteria, 'Evaluation-Criteria-TEMPLATE.xlsx');
    }
    render() {
        let { t, baseData: { departments, divisions, majors } } = this.props;
        let { datas, selectedRowKeys } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: (key) => this.onSelectChange(key)
        };
        const hasSelected = selectedRowKeys.length > 0;

        const columns = [
            {
                title: 'No.',
                render: r => datas.indexOf(r) + 1
            },
            {
                title: t('hr:criteria'),
                dataIndex: 'name'
            },
            {
                title: t('hr:major'),
                render: r => {
                    let result = []
                    if (Array.isArray(r.major_id) && r.major_id.length) {
                        let arrMajors = r.major_id
                        arrMajors.map((majorId, index) => {
                            let majorFind = majors.find(m => m.id == majorId)
                            if (majorFind) {
                                result.push(<span key={index}>{index == 0 ? '' : ','} {majorFind.name}</span>)
                            }
                        })
                    }
                    return <div style={{ maxWidth: '500px' }}>{result}</div>
                }
            },
            {
                title: t('hr:on_web'),
                render: r => typeOnWeb[r.on_web]
            },
            {
                title: t('hr:status'),
                render: r => {
                    let items = []
                    Object.keys(statusCriteria).map((key, i) => {
                        let color = colorStatus[key];
                        items.push(
                            // <Menu.Item key={key}>
                            //     <a onClick={(e) => this.onChangeStatus(e , key, r.id)}>
                            //         <Badge color={color} text={statusSkillRequest[key]} />
                            //     </a>
                            // </Menu.Item>
                            {
                                key,
                                label:
                                    <a className='badge-dropdown-status' onClick={(e) => this.onChangeStatus(key, r.id)}>
                                        <Badge color={color} text={statusCriteria[key]} />
                                    </a>
                            }
                        );
                    })
                    return (
                        <DropdownAntd
                            menu={{ items }}
                            className="pl-2"
                            disabled={checkPermission('hr-job-evaluation-criteria-update') ? false : true}
                        >
                            <Tag className='text-center' color={colorStatus[r.status]} style={{ cursor: 'pointer' }}>
                                {statusCriteria[r.status]}
                            </Tag>
                        </DropdownAntd>
                    )

                }
            },
            {
                title: t('hr:subcriteria'),
                render: r => {
                    let result = [];
                    if (Array.isArray(r.sub_criterias) && r.sub_criterias.length) {
                        r.sub_criterias.map(s =>
                            result.push(<Row gutter={12}>
                                <Col span={12}>
                                    <ul><li> {s?.sub_criteria_name}</li></ul>
                                </Col>
                                <Col span={12}>
                                    <ul><li> {s?.point}</li></ul>
                                </Col>
                            </Row>)
                        )
                    }
                    return result.length ? <>
                        {result}
                    </>
                        : []
                }
            },
            {
                title: t('hr:action'),
                render:
                    // r => (
                    //     <>
                    //         <Button icon={<FontAwesomeIcon icon={faPen} />} type='primary' size='small' onClick={() => this.popupModal(r)} />
                    //     </>
                    // )
                    r => (
                        <>
                            {
                                checkPermission('hr-job-evaluation-criteria-update') ? <Button icon={<FontAwesomeIcon icon={faPen} />} type='primary' size='small' onClick={() => this.popupModal(r)} />
                                    : ''
                            }
                        </>
                    )
            }
        ]
        let itemsDropdownActive = [
            {
                key: "1",
                label: (
                    <Popconfirm
                        title="Active multiple criteria"
                        description="Are you sure to active multiple criteria ?"
                        onConfirm={() => this.onChangeStatus(1, this.state.selectedRowKeys)}
                        onCancel={() => { }}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="primary" onClick={() => { }} disabled={!hasSelected} loading={this.state.loading}>
                            {t('hr:approve')}
                        </Button>
                    </Popconfirm>
                ),
            },
            {
                key: "2",
                label: (
                    <Button type='primary' onClick={() => this.setState({visibleAddJob : true})}>
                        {t('hr:add_jobs')}
                    </Button>
                ),
            }
        ]
        const items = [
            {
                key: '1',
                label: 
                <Menu.Item key={uniqueId('_dropdown')} icon={<FontAwesomeIcon icon={faDownload} />} onClick={this.downloadImportTemplate.bind(this)}>
                    &nbsp;&nbsp;&nbsp;{t('hr:download_template')}
                </Menu.Item>
            }
        ];
        return (
            <div>
                <PageHeader
                    title={t('hr:evaluation_criteria')}
                    tags={
                        checkPermission('hr-job-evaluation-criteria-create') ? <Button key="create-staff" type="primary" onClick={() => this.setState({ visible: true, data: {} })} icon={<FontAwesomeIcon icon={faPlus} />}>
                            &nbsp;{t('hr:add_new')}
                        </Button> : ''
                    }
                    extra={[
                        <div style={{ textAlign: 'right', display: 'inline' }} key="import-training-question">
                            <DropdownAntd key={uniqueId('_dropdown')} menu={{ items }} type="primary" placement="bottomLeft" icon={<FontAwesomeIcon icon={faPlus} />}>
                                <Button key={uniqueId('_dropdown_btn')} className="mr-1"
                                    icon={<FontAwesomeIcon icon={faCaretDown} />}
                                />
                            </DropdownAntd>
                        </div>
                    ]}
                />
                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={tabList(this.props)} />
                    <Form
                        className="pt-3"
                        ref={this.formRef}
                        name="searchStaffForm"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical"
                    >
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name="keyword">
                                    <Input placeholder={t('hr:title')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name="status" >
                                    <Dropdown datas={statusCriteria} defaultOption="-- All Status --" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={6}>
                                <Form.Item name="major_id" >
                                    <Dropdown datas={majors} defaultOption="-- All Major --" mode={'multiple'} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} key='submit'>
                                <Form.Item>
                                    <Space size={10}>
                                        <Button type="primary" htmlType="submit">
                                            {t('hr:search')}
                                        </Button>
                                        <Button type="primary" onClick={() => document.getElementById('file').click()}>
                                            {t('hr:import')}
                                        </Button>
                                        <Button type="primary" onClick={() => this.exportJobCriteria()}>
                                            {t('hr:export')}
                                        </Button>
                                    </Space>
                                    <input type="file" id="file" style={{ display: 'none' }} onChange={(e) => this.importJobCriteria(e)} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <div className='ml-2 mb-2'>
                    <DropdownAntd
                        menu={{items : itemsDropdownActive}}
                        className="pl-2"
                        disabled={!hasSelected}
                    >
                        <Button type="primary" onClick={() => { }} disabled={!hasSelected} loading={this.state.loading}>
                            {t('hr:option')}&nbsp;<FontAwesomeIcon icon={faSortDown}/>
                        </Button>
                    </DropdownAntd>
                </div>
                <Table
                    dataSource={datas}
                    columns={columns}
                    pagination={{
                        total: this.state.total,
                        pageSize: this.state.limit,
                        showSizeChanger: false,
                        onChange: (page) => this.onChangePage(page),
                        current: this.state.page
                    }}
                    rowKey='id'
                    rowSelection={rowSelection}
                />
                <Modal
                    title=''
                    open={this.state.visible}
                    onCancel={() => this.setState({ visible: false, arrSubCriteriaRemove: [], arrDatasSubCriteria: [] })}
                    width='70%'
                    onOk={this.handleFormModal.bind(this)}
                    afterClose={() => this.formModalRef.current.resetFields()}
                >
                    <Row gutter={[12, 24]}>
                        <Col span={24}>
                            <Row gutter={6}>
                                <Col span={5}>
                                    <span>Criteria <span style={{ color: 'red' }}>*</span></span>
                                </Col>
                                <Col span={8}>
                                    <span>Group major <span style={{ color: 'red' }}>*</span></span>
                                </Col>
                                <Col span={2}>
                                    <span>On Web <span style={{ color: 'red' }}>*</span></span>
                                </Col>
                                <Col span={5}>
                                    <span>SubCriteria <span style={{ color: 'red' }}>*</span></span>
                                </Col>
                                <Col span={4}>
                                    <span>Point <span style={{ color: 'red' }}>*</span></span>
                                </Col>
                            </Row>
                        </Col>
                        <Col span={24}>
                            <Form ref={this.formModalRef}
                                name="addForm"
                                // onFinish={this.submitForm.bind(this)}
                                layout="vertical">
                                <Row gutter={12}>
                                    <Col span={5}>
                                        <Form.Item
                                            name={'name'}
                                            rules={[{ required: true, message: 'Missing Criteria' }]}
                                        >
                                            <Input className='w-100' placeholder="Criteria" />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item
                                            name={'major_id'}
                                            rules={[{ required: true, message: 'Missing Group major', }]}
                                        >
                                            <Dropdown datas={majors} mode={'multiple'} defaultOption='-- All Majors --' />
                                        </Form.Item>
                                    </Col>
                                    <Col span={2}>
                                        <Form.Item
                                            name={'on_web'}
                                            rules={[{ required: true, message: 'Missing On Web', }]}
                                        >
                                            <Dropdown datas={typeOnWeb} defaultOption='-- On Web --' />
                                        </Form.Item>
                                    </Col>
                                    <Col span={9}>
                                        <Form.List name={'sub_criterias'} >
                                            {(fields, { add, remove }) => (
                                                <>
                                                    {fields.map(({ key, name, ...restField }, index) => (
                                                        <Row key={uniqueId('id')} gutter={12}>
                                                            <Col span={11}>
                                                                <Form.Item
                                                                    {...restField}
                                                                    name={[name, 'sub_criteria_name']}
                                                                    fieldKey={[key, 'sub_criteria_name']}
                                                                    rules={[{ required: true, message: 'Missing SubCriteria' }]}
                                                                >
                                                                    <Input placeholder='Sub criteria name' />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={9}>
                                                                <Form.Item
                                                                    {...restField}
                                                                    name={[name, 'point']}
                                                                    fieldKey={[key, 'point']}
                                                                    rules={[{ required: true, message: 'Missing Point' }]}
                                                                >
                                                                    <InputNumber className='w-100' placeholder='Point' max={99} min={0} />
                                                                </Form.Item>
                                                            </Col>
                                                            <Col span={1}>
                                                                <MinusCircleOutlined className='mt-2' onClick={() => {
                                                                    remove(name)
                                                                    let newArr = this.state.arrDatasSubCriteria.slice();
                                                                    let dataFind = newArr[index];
                                                                    let newArrRemove = this.state.arrSubCriteriaRemove.slice()
                                                                    if (dataFind?.id) {
                                                                        newArrRemove.push(dataFind.id)
                                                                    }
                                                                    newArr.splice(index, 1);
                                                                    this.setState({ arrDatasSubCriteria: newArr, arrSubCriteriaRemove: newArrRemove })
                                                                }} />
                                                            </Col>
                                                        </Row>
                                                    ))}
                                                    <div>
                                                        <Form.Item>
                                                            <Button
                                                                type="dashed"
                                                                onClick={() => {
                                                                    add();
                                                                    let newArr = this.state.arrDatasSubCriteria.slice();
                                                                    let newData = {
                                                                        id: 0,
                                                                        sub_criteria_name: null,
                                                                        point: null
                                                                    }
                                                                    newArr.push(newData)
                                                                    this.setState({ arrDatasSubCriteria: newArr })
                                                                }}
                                                                icon={<PlusOutlined />}
                                                            >
                                                                {t('add_subcriteria_and_point')}
                                                            </Button>
                                                        </Form.Item>
                                                    </div>
                                                </>
                                            )}
                                        </Form.List>
                                    </Col>
                                </Row>
                            </Form>
                        </Col>
                    </Row>
                </Modal>
                <Modal
                    title={t('hr:add_jobs')}
                    open={this.state.visibleAddJob}
                    onCancel={() => this.setState({ visibleAddJob: false})}
                    width='50%'
                    onOk={() => this.submitAddJobs()}
                    afterClose={() => this.setState({valuesJob : []})}
                >
                    <Dropdown 
                        datas={this.state.datasJob} 
                        defaultOption={t('-- All Jobs --')} 
                        mode='multiple'
                        value={this.state.valuesJob}
                        onChange={(v) => this.setState({valuesJob : v})}
                    />
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
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(EvaluationCriteria)