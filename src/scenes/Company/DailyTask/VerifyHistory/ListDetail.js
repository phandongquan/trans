import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Form, Row, Col, DatePicker, Table, Image as ImageAnt, Button, Switch, Modal, Tag, Input } from 'antd'
import { PageHeader } from '@ant-design/pro-layout';
import { dateFormat, screenResponsive } from '~/constants/basic'
import Tab from '~/components/Base/Tab';
import tabList from '../config/tabList'
import Dropdown from '~/components/Base/Dropdown'
import StaffDropdown from '~/components/Base/StaffDropdown'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFileExport, faPen, faBackspace, faReply } from '@fortawesome/free-solid-svg-icons';
import { apiListReport, apiListVerify, getDetailVerify, updateValid2 } from '~/apis/company/dailyTask';
import { checkPermission, exportToXLS, getThumbnailHR, getURLHR, historyParams, historyReplace, showNotify, timeFormatStandard } from '~/services/helper';
import Lighbox from '~/components/Base/Lighbox';
import dayjs from 'dayjs';
import { getList as apiGetListTask } from '~/apis/company/task'
import { formatData, getHeader } from './config/VerifyHistoryExport';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';

const typeIs_valid = {
    1: 'Hợp lệ',
    2: 'Không hợp lệ'
}
export class ListDetail extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.assginStaffRef = null;
        this.formRef = React.createRef();
        this.formModalRef = React.createRef()
        this.formSubmitRef = React.createRef()
        this.state = {
            loading: false,

            listTasks: [],
            datasVerify: [],
            dataVerify: {},
            visible: false,
            page: 1,
            total: 0,
            datasReport : []
        };
    }
    componentDidMount() {
        let params = historyParams()
        let page = params?.page ? params.page : this.state.page
        let from_date = params?.from_date
        let to_date = params?.to_date
        let valuesSetField = {
            date: [dayjs(from_date), dayjs(to_date)],
        }
        if(params?.step_id > 0){
            valuesSetField.step_id = params?.step_id
        }
        if(params?.verify_by > 0){
            valuesSetField.verify_by = params?.verify_by
        }
        this.formRef.current.setFieldsValue(valuesSetField)
        
        let values = this.formRef.current.getFieldsValue();
        this.setState({page},() => this.getListVerify(values) )
        
        this.getListReport(values)
        // this.getListTasks();
    }
    componentDidUpdate(prevProps, prevState) {
    }
    async getListReport(params = {}) {
        this.setState({ loading: true })
        if (params.date) {
            params.from_date = timeFormatStandard(params.date[0], dateFormat);
            params.to_date = timeFormatStandard(params.date[1], dateFormat);
            delete (params.date)
        }
        let response = await apiListReport(params)
        if (response.status) {
            this.setState({ datasReport: response.data, loading: false })
        } else {
            showNotify('Notification', response.message, 'error')
            this.setState({ loading: false })
        }
    }
//     /**
//  * Get list tasks
//  */
//     getListTasks = async () => {
//         let response = await apiGetListTask({ limit: -1, offset: 0 })
//         if (response.status) {
//             this.setState({ listTasks: response.data.rows })
//         }
//     }
    async getListVerify(params) {       
        this.setState({ loading: true })
        params = {
            ...params,
            page: this.state.page,
            show_staff: 1,
        }
        if (params.date) {
            params.from_date = timeFormatStandard(params.date[0], dateFormat);
            params.to_date = timeFormatStandard(params.date[1], dateFormat);
            delete (params.date)
        }
        historyReplace(params);
        // this.setState({loading : true})
        let response = await apiListVerify(params)
        if (response.status) {
            let datas = response.data
            let dataSource = []
            if (datas.length) {
                datas.map(d => {
                    dataSource.push({
                        ...d,
                        data: d.data ? JSON.parse(d.data) : [],
                    })
                })
                this.setState({ loading: false, datasVerify: dataSource, total: response.total })
            } else {
                this.setState({ loading: false, datasVerify: response.data })
            }
        } else {
            this.setState({ loading: false })
            showNotify('Notification', response.message, 'error')
        }
    }
    async getDetail(id) {
        let response = await getDetailVerify(id)
        if (response.status) {
            let dataForm = {
                verify_note: response.data.verify_note,
                is_valid2: response.data.is_valid2 ? response.data.is_valid2 : null,
                verify2_note: response.data.verify2_note ? response.data.verify2_note : null
            }
            this.setState({ dataVerify: response.data, visible: true },

                () => this.formModalRef.current.setFieldsValue(dataForm))
        } else {
            showNotify('Notification', response.message, 'error')
        }
    }
    openModal(data) {
        // this.setState({visible: true , dataVerify : data} , () => this.formModalRef.current.setFieldsValue({name : data.name}))
        this.getDetail(data.id)
    }
    /**
         * On change page
         * @param {*} page
         */
    onChangePage = page => {
        window.scrollTo(0, 0)
        let values = this.formRef.current.getFieldsValue()
        this.setState({ page }, () => this.getListVerify(values));
    }
    submitForm = () => {
        let params = this.formRef.current.getFieldsValue();
        this.getListVerify(params);
    }
    /**
     * Export data
     */
    exportData = () => {
        let { match } = this.props;
        let { id } = match.params;
        let params = this.formRef.current.getFieldsValue();
        this.setState({ loading: true })
        params = {
            ...params,
            limit: 60000,
            page: this.state.page,
            show_staff: 1,
            // step_id : params
        }
        if (params.date) {
            params.from_date = timeFormatStandard(params.date[0], dateFormat);
            params.to_date = timeFormatStandard(params.date[1], dateFormat);
            delete (params.date)
        }
        let xhr = apiListVerify(params)
        xhr.then(res => {
            this.setState({ loading: false })
            if (res.status) {
                let datas = res.data
                let dataSource = []
                if (datas.length) {
                    datas.map(d => {

                        dataSource.push({
                            ...d,
                            data: d.data ? JSON.parse(d.data) : [],
                        })
                    })
                }
                let header = getHeader();
                let data = formatData(dataSource)
                let fileName = `Verify-History-${dayjs().format('YYYY-MM-DD')}`;
                let datasExcel = [...header, ...data];
                exportToXLS(fileName, datasExcel, [
                    { width: 70 },
                    { width: 25 },
                    { width: 10 },
                    { width: 20 },
                    { width: 25 },
                    { width: 20 },
                    { width: 20 },
                    { width: 20 },
                    { width: 100 },
                    { width: 20 },
                    { width: 20 },
                    { width: 20 },
                    { width: 100 },
                ])
            } else {
                showNotify('Notify', res.message, 'error')
            }
        })
    }
    async submitVerify2(params = {}) {
        params = {
            ...params,
            task_log_id: this.state.dataVerify.id
        }
        let response = await updateValid2(params);
        if (response.status) {
            showNotify('Notify', 'Cập nhật thành công!');
            this.setState({ visible: false })
            let values = this.formRef.current.getFieldsValue()
            this.getListVerify(values)
            // let datasVerifyCopy = this.state.datasVerify;
            // let indexFound = datasVerifyCopy.findIndex(d => d.id == this.state.dataVerify.id);
            // if (indexFound > -1) {
            // datasVerifyCopy[indexFound]['is_valid2'] = value;
            // let dataNew = 
            // console.log(response)
            // this.setState({ datasVerify: datasVerifyCopy })
            // }
        } else {
            showNotify('Notify', response.message, 'error');
        }
    }
    handleFormSubmit() {
        this.formModalRef.current.validateFields()
            .then((values) => {
                this.submitVerify2(values)
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    }
    render() {
        let { dataVerify } = this.state;
        let {t, baseData: { locations } } = this.props;
        const columns = [
            {
                title: "Tên bước",
                render: r => <span>{r.name}</span>,
                width: "20%",
            },
            {
                title: t("hr:image_finished"),

                render: r => {
                    let arrPhotos = [];
                    if (r?.data?.images != undefined) {
                        (r?.data?.images).map((img) => {
                            arrPhotos.push(img)
                        })
                        return <div className='lightbox-list-verify d-flex' style={{ flexWrap: 'wrap' }}>
                            <Lighbox datas={arrPhotos} width={100} height={80} isImgAI={true} />
                        </div>
                    }
                }
            },
            {
                title: t('staff'),
                width: "15%",
                render: r => <div>
                    <small>{r.staff_name} - {r.code}</small><br />
                    <small>{dayjs(r.created_at).format('HH:mm DD-MM-YYYY')}</small>
                </div >
            },
            {
                title: t('checking_info') + t(' 1'),
                width: "28%",
                render: r => <div style={{maxWidth: '250px'}}>
                    <span >{typeIs_valid[r.is_valid]}</span><br />
                    <small>{r.verify_name} - {r.verify_code}</small><br />
                    <small>{dayjs(r.verify_date).format('HH:mm DD-MM-YYYY')}</small><br />
                    {r.verify_note ?<small >note : {r.verify_note}</small>  : '' }
                </div >
            },
            {
                title: t('checking_info') + t(' 2'),
                width: "28%",
                render: r => r.verify2_date ? <div style={{maxWidth: '250px'}}>
                    <span >{typeIs_valid[r.is_valid2]}</span><br />
                    <small>{r.verify_name2} - {r.verify_code2}</small><br />
                    <small>{dayjs(r.verify2_date).format('HH:mm DD-MM-YYYY')}</small><br />
                    {r.verify2_note ? <small>note : {r.verify2_note}</small> : '' }
                </div >
                    : []
            },
            {
                title: t('hr:evaluate'),
                width: '7%',
                render: r => <div key={r.id}>
                    {
                        checkPermission('hr-daily-task-history-verify-update') ? 
                            <Button className='mt-2'
                                title={('Edit')}
                                type="primary"
                                size='small'
                                icon={<FontAwesomeIcon icon={faPen} />}
                                onClick={() => this.openModal(r)}
                            />
                            : ''
                    }
                </div>
            },
            // {
            //     title: "Kết quả đánh giá lần 2",
            //     width: '7%',
            //     render: r => <div key={r.id}>
            //         <span >{typeIs_valid[r.is_valid2]}</span>
            //     </div>
            // },
            // {
            //     title: "Ghi chú",
            //     render: r => {
            //         let resultVerify_note = ((JSON.parse(r?.verify_note))?.filter(Boolean))?.toString()
            //         console.log(resultVerify_note)
            //         return <span>{resultVerify_note}</span>
            //     },
            //     width: "20%"
            // }
        ]
        return (
            <div>
                <PageHeader title={t('hr:list_detail_verify')}
                    extra = { <Link to={`/company/daily-task/history-verify`} >
                    <Button type='primary' icon={<FontAwesomeIcon icon={faReply} />}>
                        {('back')}
                    </Button>
                </Link>}
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
                        <Row gutter={[12, 24]}>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name='date'>
                                    {/* <DatePicker format={dateFormat} className='w-100' /> */}
                                    <Form.Item name='date'>
                                        <DatePicker.RangePicker style={{ width: '100%' }} format={dateFormat} />
                                    </Form.Item>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name='step_id'>
                                    <Dropdown datas={this.state.datasReport} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={3} xl={3}>
                                <Form.Item name='location_id'>
                                    <Dropdown datas={locations} defaultOption={t('hr:all_location')} mode='multiple' />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name='staff_id'>
                                    <StaffDropdown defaultOption={t('hr:all_staff')}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name='verify_by'>
                                    <StaffDropdown defaultOption={t('hr:all_staff') + t(' ') + t('verify')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" className='mr-2'>
                                        {t('search')}
                                    </Button>
                                    <Button key="export-staff" type='primary' onClick={() => this.exportData()}
                                        icon={<FontAwesomeIcon icon={faFileExport} />}>{t('export_file')}
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Row>
                {window.innerWidth < screenResponsive  ? 
                    <div className='block_scroll_data_table'>
                        <div className='main_scroll_table'> 
                            <Table
                                loading={this.state.loading}
                                columns={columns}
                                dataSource={this.state.datasVerify}
                                pagination={{
                                    total: this.state.total,
                                    pageSize: 30,
                                    hideOnSinglePage: true,
                                    showSizeChanger: false,
                                    current: this.state.page,
                                    onChange: page => this.onChangePage(page)
                                }}
                                rowKey='id'
                            />
                        </div>
                    </div>
                    :
                    <Table
                        loading={this.state.loading}
                        columns={columns}
                        dataSource={this.state.datasVerify}
                        pagination={{
                            total: this.state.total,
                            pageSize: 30,
                            hideOnSinglePage: true,
                            showSizeChanger: false,
                            current: this.state.page,
                            onChange: page => this.onChangePage(page)
                        }}
                        rowKey='id' />
                }
                <Modal open={this.state.visible}
                    onCancel={() => this.setState({ visible: false })}
                    width={window.innerWidth < screenResponsive  ? '100%' : '60%'}
                    footer={this.state.dataVerify?.verify2_date != null ? false : <div>
                        <Button onClick={() => this.setState({ visible: false })}>Cancel</Button>
                        <Button type='primary' onClick={this.handleFormSubmit.bind(this)}>Ok</Button>
                    </div>}
                    // onOk={this.handleFormSubmit.bind(this)}
                    afterClose={() => {
                        this.setState({ dataVerify: {} })
                        this.formModalRef.current.resetFields()
                    }}
                // footer={[
                //     <div className='d-flex'>
                //         <Button type='primary' icon={<FontAwesomeIcon />}>Approve</Button>
                //         <Button type='danger' icon={<FontAwesomeIcon />} className='mr-auto'>Failed</Button>
                //         <Button icon={<FontAwesomeIcon icon={faBackspace} />} onClick={() => this.setState({ visible: false })}>&nbsp;Back</Button>

                //     </div>
                // ]}
                >
                    <Form
                        className="pt-3"
                        ref={this.formModalRef}
                        name="detailForm"
                        layout="vertical"
                        autoComplete="off"
                    >

                        {Object.keys(dataVerify).length != 0 ?
                            <>
                                <Row className='mb-2'>
                                    <Col span={24}>
                                        <span className='note-key'>{t('hr:step_name')}</span>
                                        {/* <div className='name-step'> */}
                                        <span>{dataVerify?.workflow_step?.name}</span>
                                        {/* </div> */}
                                    </Col>
                                </Row>
                                <Row className='image-form'>
                                    <Col span={12}>
                                        <span className='note-key'>{t('hr:standard_imge')}</span>
                                        <br />
                                        <div className='mt-1 img-col'>
                                            {
                                                (dataVerify?.workflow_step?.images).map((img, i) =>
                                                    <ImageAnt style={{ marginRight: 5 }} key={i} src={getThumbnailHR(img,'240x360')} preview={{ src: getURLHR(img) }} />
                                                )
                                            }
                                        </div>
                                    </Col>
                                    <Col span={12}>
                                        <span className='note-key'>{t('image') + t(' ') + t('finished')}</span>
                                        <br />
                                        <div className='mt-1 img-col'>
                                            {
                                                (dataVerify?.data?.images)?.map((img, i) =>
                                                    <ImageAnt style={{ marginRight: 5 }} key={i} src={getThumbnailHR(img,'240x360')} preview={{ src: getURLHR(img) }} />
                                                )
                                            }
                                        </div>
                                    </Col>

                                </Row>
                                <Row className='evaluation-form'>
                                    <Col span={24}>
                                        <Form.Item >
                                            <span className='note-key'>{t('hr:result_evaluation')}: </span>
                                            <Tag color={dataVerify?.is_valid == 1 ? 'green' : 'volcano'}>
                                                {typeIs_valid[dataVerify?.is_valid]}
                                            </Tag>
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <span className='note-key'>{t('note')}</span><br/>
                                        <span>{dataVerify.verify_note}</span>
                                    </Col>
                                </Row>
                                <Row className='comment-form'>
                                    <Col className='text-left' xs={24} sm={24} md={24} lg={12} xl={12}>
                                        <span className='note-key'>{t('description')}</span>
                                        <br />
                                        <span className='mt-1' style={{ lineHeight: '1.4', whiteSpace: 'pre-line' }}>{dataVerify?.workflow_step?.description}</span>
                                    </Col>
                                    <Col className='text-right' xs={24} sm={24} md={24} lg={12} xl={12}>
                                        <span className='note-key'>{t('hr:evaluation_criteria')}</span>
                                        <br />
                                        {/* <span className='mt-1 mr-2' style={{ lineHeight: '1.4'}}>
                                            {
                                                arrVerify_note ?
                                                    JSON.parse(arrVerify_note).map(v => {
                                                        return <div>{v}</div>
                                                    })
                                                    :
                                                    'Không có có đánh giá'
                                            }
                                        </span> */}
                                        <span className='mt-1' style={{ lineHeight: '1.4', whiteSpace: 'pre-line' }}>
                                            {dataVerify?.workflow_step?.criterions ?
                                                dataVerify?.workflow_step?.verify_note
                                                :
                                                'Không có có đánh giá'
                                            }
                                        </span>
                                    </Col>
                                </Row>
                                <Row gutter={24} className='comment-form'>
                                    <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                        <span className='note-key'>{t('confirm')+ t(' 2')}:</span>
                                        <Form.Item name={'is_valid2'} hasFeedback rules={[{ required: true, message:t('please_select') + (' ')+ t('valid') }]}>
                                            <Dropdown datas={typeIs_valid} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={20} xl={20}>
                                        <span className='note-key'>{t('note')}</span>
                                        <Form.Item name={'verify2_note'}>
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </>
                            : []
                        }
                    </Form>

                </Modal>

            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    baseData: state.baseData
})

const mapDispatchToProps = {

}
export default connect(mapStateToProps, mapDispatchToProps)(ListDetail)