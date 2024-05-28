import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Table, Row, Col, Input, Popconfirm, Form, Modal, DatePicker, Spin, Upload, Image } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faPen, faPlus, faTrashAlt, faFileExport } from '@fortawesome/free-solid-svg-icons';
import { getSpecialized, create, update, destroy , verify} from '~/apis/company/staff/special_list';
import { InboxOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import Dropdown from '~/components/Base/Dropdown';
import Tab from '~/components/Base/Tab';
import { convertToFormData, showNotify , historyParams ,historyReplace, exportToXLS, checkPermission} from '~/services/helper';
import dayjs from 'dayjs';
import { mineTypeImage } from '~/constants/basic';
import UploadMultiple from '~/components/Base/UploadMultiple';
import { MEDIA_URL_HR } from '~/constants';
import tabListStaff from '~/scenes/Company/config/tabListStaff';
import StaffDropdown from '~/components/Base/StaffDropdown';
import LazyLoad from 'react-lazy-load';
import { formatData, getHeader } from './config/exportStaffSpecialized';
import {screenResponsive} from '~/constants/basic';

const FormItem = Form.Item;
class StaffSpecialList extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        let params = historyParams();
        let page = 1;
        let limit = params.limit ? params.limit : 35;
        if (params.offset) {
            page = params.offset / limit + 1;
        }
        this.state = {
            loading: false,
            visible: false,
            specializeds: [],
            types: [],

            valueType : null,
            file: [],
            imageUrl: null,
            staff_id : null,

            limit,
            page , 
            total: 0,
            
        };
        this.formRef = React.createRef();
        this.UploadRef = null;
    }


    /**
     * @lifecycle 
     */
    componentDidMount() {
        let params = historyParams();
        this.formRef.current.setFieldsValue(params);
        let values = this.formRef.current.getFieldsValue();
        this.getData(values);
    }

    /**
     * Get list specialized for staff
     * @param {} params 
     */
    async getData(params = {}) {
        params = {
            ...params,
            offset: (this.state.page - 1) * this.state.limit ,
            limit: this.state.limit,
        }
        historyReplace(params);
        // this.setState({ loading: true });
        /**
         * @fetch API
         */
        let specializedXhr = await getSpecialized(params);
        let specializeds = (specializedXhr.status == 1) ? specializedXhr.data.rows : {};
        let types = specializedXhr.data.types
        this.setState({ specializeds, types , total : specializedXhr.data.total}, () => this.setState({ loading: false }));
    }

    /**
     * @event toggle modal
     * @param {*} visible 
     */
    toggleModal(visible) {
        this.UploadRef.resetForm()
        this.setState({ visible, file: [], imageUrl: null });
    }

    /**
     * @event delete specialized
     * @param {*} e 
     * @param {*} id 
     */
    async onDeleteSpecialized(e, id) {
        this.setState({ loading: true });
        let xhr = await destroy(id);
        let result = (xhr.status == 1) ? xhr.data : {};
        if (result) {
            let specializeds = [...this.state.specializeds];
            let index = specializeds.indexOf(specializeds.find(s => s.id == id));

            /**
             * Update new list
             */
            specializeds.splice(index, 1);
            this.setState({ specializeds });

            let { t } = this.props;
            showNotify(t('notification'), t('Data has been deleted!'));
        }
        this.setState({ loading: false });
    }

    /**
     * @event before show modal edit specialized
     * @param {*} id 
     */
    onEditSpecialized(id = null) {
        this.toggleModal(true);
        if (!id) {
            this.formRef.current.resetFields();
        } else {
            let { specializeds } = this.state;
            let data = specializeds.find(r => r.id == id);
            data.expire_date = data.expire_date ?  dayjs(data.expire_date) : null
            data.date = data.date ?  dayjs(data.date) : null
            if(data.images) {
                let img = [];
                data.images.map((i, index) => {
                  let name = i.split('\\');
                  img.push({
                    uid: 'history_specialized_image_' + index,
                    name: name[name.length - 1],
                    status: 'done',
                    url: MEDIA_URL_HR + i,
                    fileRaw: i
                  })
                  this.UploadRef.setValues({historyFileList: img })
                })
              }
            this.setState({staff_id : data.staff_id})
            this.formRef.current.setFieldsValue(data);
        }
    }

    /**
     * @event before submit form
     * Validate before submit
     */
    handleFormSubmit() {
        this.formRef.current.validateFields()
            .then((values) => {
                console.log(values)
                let dataUpload = this.UploadRef.getValues();
                if ((Array.isArray(dataUpload.fileList) && (dataUpload.fileList?.length) ) ||
                ( Array.isArray(dataUpload.historyFileList) && (dataUpload.historyFileList?.length))) 
                {
                    values.date = dayjs(values?.date).format('YYYY-MM-DD')
                    values.expire_date = values?.expire_date ? dayjs(values.expire_date).format('YYYY-MM-DD') : null 
                    for (let key in values) {
                        if (values[key] == null) {
                          delete values[key];
                        }
                      }
                    this.submitForm(values);
                } else {
                    showNotify('Thông báo', 'Vui lòng chọn file ảnh !', 'error')
                }
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    }

    /**
     * @event submit form
     * @param {Object} values 
     */
    async submitForm(values) {
        let xhr;
        this.setState({ loading: true });
        let { t } = this.props;
        let submitData = {
            ...values,
            staff_id : this.state.staff_id
        }
        let formData
        let dataUpload = this.UploadRef.getValues();
        delete (submitData.id);
        if (values.id) {
            formData = convertToFormData(submitData)
            if (dataUpload.fileList && Array.isArray(dataUpload.fileList)) {
                dataUpload.fileList.map((f) => formData.append("files[]", f));
            }
            if (dataUpload.removeFileList && Array.isArray(dataUpload.removeFileList)) {
                dataUpload.removeFileList.map((f) => formData.append("del_img[]", f));
            }
            formData.append("_method", 'PUT')
            xhr = await update(values.id, formData);
        } else {
            formData = convertToFormData(submitData)
            if (dataUpload.fileList && Array.isArray(dataUpload.fileList)) {
                dataUpload.fileList.map((f) => formData.append("files[]", f));
            }
            xhr = await create(formData);
        }
        let specialized = (xhr.status == 1) ? xhr.data.staff_specialized : {};
        let specializeds = [...this.state.specializeds];

        /**
         * Update new list
         */
        if (!values.id) {
            specializeds.push(specialized);
        } else {
            let index = specializeds.indexOf(specializeds.find(r => r.id == specialized.id));
            specializeds[index] = specialized;
        }
        this.setState({ specializeds }, () => {
            this.setState({ loading: false });
            this.toggleModal(false);
            showNotify(t('notification'), t('Data has been updated!'));
        });
    }
    async onVerifySpecialized(id, index) {
        this.setState({ loading: true });
        let xhr = await verify(id);
        let result = (xhr.status == 1) ? xhr.data?.staff_specialized : {};
        let specializeds = [...this.state.specializeds];

        specializeds[index] = result
        this.setState({ specializeds });

        let { t } = this.props;
        showNotify(t('notification'), t('Data has been verify !'));
        this.setState({ loading: false });
    }
    searchType(value) {
        this.setState({valueType : value} ,()=>  this.getData({type : value }))
    }
    
    /**
     * @event submit form
     * @param {Object} values 
     */
    submitFormSearch = (values) => {
        this.setState({ page: 1 }, () => this.getData(values));
    }
    /**
     * @event change page
     * 
     * @param {*} page 
     */
    onChangePage(page) {
        let values = this.formRef.current.getFieldsValue();
        this.setState({ page }, () => this.getData({ ...values }));
    }
    async exportData(){
        let values = this.formRef.current.getFieldsValue();
        this.setState({ loading: true })
        let params = {
            ...values,
            offset: 0 ,
            limit: -1,
        }
        let response = await getSpecialized(params)
        let { t } = this.props;
        if (response.status) {
            let header = getHeader();
            let data = formatData(response.data.rows, this.state.types)
            let fileName = `Staff-Specialized-${dayjs().format('YYYY-MM-DD')}`;
            let datasExcel = [...header, ...data];
            this.setState({ loading: false })
            exportToXLS(fileName, datasExcel, [{ width: 5 }, { width: 25 }, { width: 25 }, { width: 20 }, { width: 20 }, { width: 15 }, { width: 20 },{ width: 12 },{ width: 12 },{ width: 12 },{ width: 10 }])
        } else {
            showNotify(t('hr:notification'), response.message, 'error')
        }
    }
    /**
     * @render
     */
    render() {
        let { t,baseData: { cities } } = this.props;

        const columns = [
            {
                title: t('No.'),
                render: r => this.state.specializeds.indexOf(r) + 1
            },
            {
                title: t('hr:name'),
                width : '15%',
                render: r => <div>
                            <span>{r?.created_by_user?.name}</span><br/>
                            <small>{r?.created_by_user?.email}</small>
                        </div> 
            },
            {
              title : t('hr:name') + '/' + t('hr:code') + '/' + t('hr:place'),  
              render : r => {
                return <div>
                    <strong>{r.name}</strong> - <span>Code : {r.code}</span><br/>
                    {/* <span>{r.specialized}</span><br/> */}
                    <span>{r.place && cities[r.place] ? cities[r.place] : ''}</span>
                </div>
              }
            },
            {
                title: t('hr:type'),
                render: r => this.state.types[r.type]
            },
            {
                title: t('hr:image'),
                width : '25%',
                render: r => {
                    let result = []
                    if(r.images && (r?.images.length)){
                        (r.images).map((img, index) => {
                            result.push(<LazyLoad key={index} height={50} width={50} className='mr-2'>
                                <Image src={MEDIA_URL_HR + img} className='mr-2' key={index} style={{ width: '50px', height: '50px' }} />
                            </LazyLoad>)
                        })
                    }
                    return <div className='d-flex'>{result}</div>
                }
            },
            // {
            //     title: t('Supply Date'),
            //     width:'8%',
            //     render: r =>r.date ? dayjs(r.date).format('YYYY-MM-DD') : []
                
            // },
            // {
            //     title: t('Expire  Date'),
            //     width:'8%',
            //     render: r =>r.expire_date ? dayjs(r.expire_date).format('YYYY-MM-DD') : []
                
            // },
            // {
            //     title: t('Created Date'),
            //     width:'8%',
            //     render: r => dayjs(r.created_at).format('YYYY-MM-DD')
                
            // },
            {
                title: t('hr:date'),
                render: r => <div>
                    <small>Supply Date : {r.date ? dayjs(r.date).format('YYYY-MM-DD') : []}</small><br/>
                    <small>Expire  Date : {r.expire_date ? dayjs(r.expire_date).format('YYYY-MM-DD') : []}</small><br/>
                    <small>Created Date : {r.created_at ? dayjs(r.created_at).format('YYYY-MM-DD') : []}</small>
                </div>
            },
            {
                title: t('hr:verify'),
                width:'8%',
                render: r =>
                    r.verify_date
                        ? <>
                            <strong>by #{r.verify_by}</strong><br />
                            <span>{dayjs(r.verify_date).format('YYYY-MM-DD')}</span>
                        </>
                        : ""
                
            },
            {
                title: t('hr:action'),
                width:'10%',
                align: 'center',
                render: (text, r, index) => (
                    <>
                        {
                            !r.verify_date ?
                                <Popconfirm title={t('Confirm verify specialized item?')}
                                    placement="topLeft"
                                    icon={<QuestionCircleOutlined style={{ color: 'green' }} />}
                                    onConfirm={(e) => this.onVerifySpecialized(r.id, index)}
                                >
                                    {
                                        checkPermission('hr-staff-specialized-approv') ? 
                                            <Button
                                                type="primary"
                                                size='small'
                                                onClick={e => e.stopPropagation()}
                                                icon={<FontAwesomeIcon icon={faCheck} />}>
                                            </Button>
                                        : ""
                                    }
                                </Popconfirm>
                                : []
                        }
                        {
                            checkPermission('hr-staff-specialized-update') ?
                                <Button
                                    style={{ marginLeft: 8 }}
                                    type="primary"
                                    size='small'
                                    onClick={() => this.onEditSpecialized(r.id)}
                                    icon={<FontAwesomeIcon icon={faPen} />}>
                                </Button>
                            : ""
                        }
                        
                        {
                            !r.verify_date ?
                                <Popconfirm title={t('Confirm delete selected item?')}
                                    placement="topLeft"
                                    icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                                    onConfirm={(e) => this.onDeleteSpecialized(e, r.id)}
                                >   
                                {
                                    checkPermission('hr-staff-specialized-delete') ? 
                                            <Button
                                                type='danger'
                                                size='small'
                                                style={{ marginLeft: 8 }}
                                                onClick={e => e.stopPropagation()}
                                                icon={<FontAwesomeIcon icon={faTrashAlt} />}>
                                            </Button>
                                        : ""
                                }
                                </Popconfirm>
                                : []
                        }

                    </>
                )
            }
        ];

        return (
            <>
                <PageHeader title={t('hr:staff_specialized')}
                //  tags={
                //   <Button key="create-staff" type="primary" icon={<FontAwesomeIcon icon={faPlus} />} onClick={() => this.onEditSpecialized()}>
                //     &nbsp;{t('Add new')}
                //   </Button>}
                />
                <Row className="card p-2 pt-0 mb-3">
                    <Tab tabs={tabListStaff(this.props)} />
                    <Form className="pt-3"
                        ref={this.formRef}
                        name="searchStaffForm"
                        onFinish={this.submitFormSearch.bind(this)}
                        layout="vertical">
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name='staff_id'>
                                    <StaffDropdown defaultOption={t('-- Search Staff --')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <FormItem name="type">
                                    <Dropdown datas={this.state.types} defaultOption="-- All Types --" />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <FormItem name='verify'>
                                    <Dropdown datas={{ 0: 'Chưa xác nhận', 1: 'Đã xác nhận' }} defaultOption="-- Is Verify --" />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={5} xl={5} key='submit' className=''>
                                <Button type="primary" htmlType="submit">
                                    {t('hr:search')}
                                </Button>
                                {
                                checkPermission('hr-staff-specialized-export') ?
                                    <Button className='ml-2' icon={<FontAwesomeIcon icon={faFileExport} />} type="primary" onClick={() => this.exportData()}>
                                        {t('hr:export')}
                                    </Button>
                                    : ""
                                }
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        {window.innerWidth < screenResponsive  ? 
                            <div className='block_scroll_data_table'>
                                <div className='main_scroll_table'> 
                                    <Table
                                       dataSource={this.state.specializeds.length ? this.state.specializeds : []}
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
                                       rowKey={(specialized) => specialized.id}
                                    />
                                </div>
                            </div>
                            :
                            <Table
                                dataSource={this.state.specializeds.length ? this.state.specializeds : []}
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
                                rowKey={(specialized) => specialized.id}
                            />
                        }
                    </Col>
            </Row>

            <Modal
              afterClose={() => this.setState({staff_id : null})}
              forceRender
              title={t('hr:specialized')}
              open={this.state.visible}
                    okText='Save'
                    onCancel={() => this.toggleModal(false)}
                    onOk={this.handleFormSubmit.bind(this)}
                    width={window.innerWidth < screenResponsive  ? '100%' : '60%'}
                >
                    <Form
                        preserve={false}
                        ref={this.formRef}
                        layout="vertical">
                        <Row gutter={24}>
                            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                <FormItem name="id" hidden >
                                    <Input />
                                </FormItem>
                                <FormItem label={t('hr:code')} name="code" hasFeedback rules={[{ required: true, message: t('Please input code') }]}>
                                    <Input placeholder="Code" />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                <FormItem label={t('hr:name')} name="name" hasFeedback rules={[{ required: true, message: t('Please input name') }]}>
                                    <Input placeholder="Name" />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                <FormItem label={t('hr:specialized')} name="specialized" hasFeedback rules={[{ required: true, message: t('Please input specialized') }]}>
                                    <Input placeholder="Specialized" />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                                <FormItem label={t('hr:place')} name="place" hasFeedback rules={[{ required: true, message: t('Please input phone place') }]}>
                                    <Dropdown datas={cities} defaultOption="-- All Place --" />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <FormItem label={t('hr:type')} name="type" hasFeedback rules={[{ required: true, message: t('Please input type') }]}>
                                    <Dropdown datas={this.state.types} defaultOption="-- All Types --" />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={5} xl={5}>
                                <FormItem label={t('hr:supply_date')} name="date" hasFeedback rules={[{ required: true, message: t('Please input date') }]} >
                                    <DatePicker placeholder={t('hr:supply_date')} style={{ width: '100%' }} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={5} xl={5}>
                                <FormItem label={t('hr:expire_date')} name="expire_date">
                                    <DatePicker placeholder={t('hr:expire_date')} style={{ width: '100%' }} />
                                </FormItem>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    label="Image"
                                    extra="Support upload Image with size max 10MB"
                                >
                                    <UploadMultiple
                                        type={[...mineTypeImage]}
                                        size={10}
                                        onRef={(ref) => {
                                            this.UploadRef = ref;
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Modal>
            </>
        );
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(StaffSpecialList));
