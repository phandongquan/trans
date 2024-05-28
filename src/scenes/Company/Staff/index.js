import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Table, Row, Col, Input, Form, Upload, Avatar, Image, Menu, Modal, Dropdown as DropdownAnt,Popconfirm } from "antd";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faFileImport, faPrint, faPen, faPlus, faPaperclip, faEllipsisV, faUserPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import { UserOutlined, ExclamationCircleOutlined, SearchOutlined, TeamOutlined,ReloadOutlined } from '@ant-design/icons';
import staffApi from '~/apis/report/staff';

import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { uniqueId } from 'lodash';

import { getList as getListStaff, importStaff, resetPass, clearUp as apiClearUp } from '~/apis/company/staff';
import * as apiMobile from '~/apis/company/mobile';

import Tab from '~/components/Base/Tab';
import Dropdown from '~/components/Base/Dropdown';

import { timeFormatStandard, showNotify, exportToXLS, autofitColumnXLS, historyReplace, historyParams, checkManagerHigher, checkPermission } from '~/services/helper';
import ExcelService from '~/services/ExcelService';
// import { header, formatStaff } from './config/exportStaff';
import { formatHeader, formatData, styles } from './config/exportStaffWithStyle';

import CreateUpdateDate from '~/components/Base/CreateUpdateDate';
import tabListStaff from '../config/tabListStaff'

import { staffStatus , WorkType, screenResponsive} from '~/constants/basic';
import './config/staff.css';
import { URL_HR } from '~/constants';


const FormItem = Form.Item;
class Staff extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        let params = historyParams();      
        this.state = {
            loading: false,
            staffList: [],
            fileList: [],
            file: null,
            limit: 20,
            page: params.page ? Number(params.page) : 1,
            total: 0,
            districts: [],
            wards: [],
            // visibleForm : true , 
            reportStaff: [],
            listGroup: [],
            staff: null
        };
        this.formRef = React.createRef();
      
    }

    /**
     * @lifecycle 
     */
    componentDidMount() {
        let { baseData: { departments } } = this.props
        this.setState({ listGroup: departments })
        let params = historyParams();
        if(params.department_id && !Array.isArray(params.department_id)) {
            params.department_id = params.department_id.split(",");
        }
        if(params.major_id && !Array.isArray(params.major_id)) {
            params.major_id = params.major_id.split(",");
        }
        this.formRef.current.setFieldsValue(params);
        let values = this.formRef.current.getFieldsValue();
        this.getStaff(values);
        this.getReportStaff()
    }

    /**
     * @event submit form
     * @param {Object} values 
     */
    submitForm = (values) => {
        this.setState({ page: 1 }, () => this.getStaff(values));
    }

    /**
     * Get list staff
     * @param {} params 
     */
    async getStaff(params = {}) {
        this.setState({ loading: true });
        params = {
            ...params,
            page: this.state.page,
            limit: this.state.limit,
        }
        historyReplace(params);
        let response = await getListStaff(params);

        if (response.status) {
            let { data } = response;
            // Format rows to array object
            let listData = [];
            if (data.rows) {
                Object.keys(data.rows).map(id => {
                    listData.push(data.rows[id]);
                })
            }
            this.setState({
                staffList: listData,
                loading: false,
                total: data.total
            });
        }
    }
    async getReportStaff() {
        let params = {
            end_date: dayjs().format('YYYY-MM-DD')
        }
        let response = await staffApi.getStaffReport(params);
        if (response.status) {
            this.setState({ reportStaff: response.data.department })
        }
    }
    /**
     * @event change page
     * 
     * @param {*} page 
     */
    onChangePage(page) {
        let values = this.formRef.current.getFieldsValue();
        this.setState({ page }, () => this.getStaff({ ...values }));
    }

    /**
     * @event submit file import
     */
    async handleImportUpload() {
        const { file } = this.state;
        const formData = new FormData();
        formData.append('file', file);
        let xhr = await importStaff(formData);
        if (xhr.status == 1) {
            let { t, history } = this.props;
            showNotify(t('hr:notification'), t('hr:import_done'), 'success', 1, () => history.go(0));
        }
        return false;
    }

    /**
     * @event remove file
     * @param {BinaryType} file 
     */
    onRemove = file => {
        this.setState(state => {
            const index = state.fileList.indexOf(file);
            const newFileList = state.fileList.slice();
            newFileList.splice(index, 1);
            return {
                fileList: newFileList,
            };
        });
        this.setState({ file: null });
    }

    /**
     * @handle before upload
     * 
     * @return false will default upload to url
     * @param {BinaryType} file 
     */
    beforeUpload = file => {
        this.onRemove(file); // just take 1 file
        this.setState(state => ({
            fileList: [...state.fileList, file],
        }));
        this.setState({ file });
        return false;
    }

    /**
     * Export staff
     */
    exportStaff = () => {
        this.setState({ loading: true })
        let staffList = [];

        let params = this.formRef.current.getFieldsValue();
        params.limit = -1;
        params.offset = 0;

        let xhr = getListStaff(params);
        xhr.then(response => {
            this.setState({ loading: false })
            if (response.status) {
                staffList = response.data.rows;

                let header = formatHeader();
                let data = formatData(staffList);
                let fileName = `Staff-list-${dayjs().format('YYYY-MM-DD')}`;
                let datas = [...header.headers, ...data]

                let excelService = new ExcelService(['Main Sheet']);
                excelService.addWorksheetDatas(datas)
                    .addWorksheetStyles(styles)
                    .mergeCells(header.merges)
                    .forceDownload(fileName);
            }
        })
    }

    /**
     * Get district by city
     * @param {*} city_id 
     */
    async getDistrictByCity(city_id) {
        let response = await apiMobile.getDistrictByCity({ city_id });
        if (response.status) {
            this.setState({ districts: response.data })
        }
    }

    /**
     * Get ward by districtId
     * @param {*} district_id 
     */
    async getWardsByDistrict(district_id) {
        let response = await apiMobile.getWardByDistrict({ district_id });
        if (response.status) {
            this.setState({ wards: response.data })
        }
    }
    /**
     * 
     * @returns list group
     */
    renderListGroup = () => {
        let { t, baseData: { departments } } = this.props;
        let { reportStaff, listGroup } = this.state;
        let result = []
        if (listGroup.length) {
            listGroup.map(r => {
                if (r.id != 113) {
                    if (reportStaff.length) {
                        let counterStaff = reportStaff.find(v => v.staff_dept_id == r.id)
                        result.push(
                            <div className='d-flex ml-1 mb-2' key={r.id}>
                                <Avatar size={48} icon={<TeamOutlined />} />
                                <div className='cursor-pointer align-items-start flex-column'
                                    onClick={() => {
                                        let params = {
                                            department_id: [r.id],
                                            status: 1
                                        }
                                        this.formRef.current.setFieldsValue(params)
                                        this.setState({ page: 1 }, () => this.getStaff(params))
                                    }}>
                                    <strong>&nbsp;&nbsp;{r.name}</strong>
                                    <br />
                                    <span style={{ color: '#009aff' }}>&nbsp;&nbsp;{typeof counterStaff != 'undefined' ? counterStaff.counter : 0}&nbsp;Thành viên</span>
                                </div>
                            </div>
                        )
                    }
                }
            })
        }

        return result;
    }
    /**
    * filter list group
    * @returns list group
    */
    filterGroup(e) {
        let { baseData: { departments } } = this.props
        let resultList = departments.filter(v => v.name.match(new RegExp(e.target.value, "i")))
        this.setState({ listGroup: resultList })
    }


    /**
     * Clear up staff
     * @param {*} staff_id 
     */
    clearUpStaff = async (staff_id) => {
        this.setState({ loading: true })
        let response = await apiClearUp(staff_id);
        this.setState({ loading: false });
        if(response.status) {
            showNotify('Notify', 'Success');
        } else {
            showNotify('Notify', response.message, 'error')
        }
    }
    async resetPassword (email){
        let params = {
            staff_email : email , 
            new_password : 'hasaki123@'
        }
       
        let response = await resetPass(params)
        if(response.status){
            showNotify('Notification', 'Bạn đã thay đổi mật khẩu hasaki123@ thành công !')
        }else{
            showNotify('Notification' , response.message , 'error')
        }
    }
    getThumbnailAvartarStaff(url=''){
        let formatUrl =  url.replace('https://media.inshasaki.com/', 'https://wshr.hasaki.vn/')
        let newUrl = formatUrl.split('hr/')[1]
        let path = URL_HR + '/thumbnail/'
        return path + '40x40' + '/production/hr/' + newUrl;
    }
    /**
     * @render
     */
    render() {
        let { t, baseData: { locations, departments, divisions, positions, majors, pendingSkills, cities, brands = [] }, auth:{staff_info} } = this.props;
        const { file, fileList } = this.state;
        this.permitEditStaff = checkManagerHigher(staff_info.position_id) || staff_info.division_id == 115;
        let brandsFormat = []
        brands.map(b => {
            brandsFormat.push({ id: b.brand_id, name: b.brand_name })
        })
        
        const columns = [
            {
                title: t('hr:avatar'),
                align: 'center',
                render: r => {
                    if (r.user && r.user.avatar) {
                        return <Image 
                        className='staff_image' 
                        width={64} 
                        height={64} 
                        preview={{ src: r.user.avatar.replace('https://media.inshasaki.com/', 'https://wshr.hasaki.vn/') }} 
                        src={this.getThumbnailAvartarStaff(r.user.avatar)} />
                    } else {
                        return <Avatar size={64} icon={<UserOutlined />} />
                    }
                }
            },
            {
                title: t('hr:name'),
                render: r => (

                    <div>                        
                        {this.permitEditStaff ? <Link to={`/company/staff/${r.staff_id}/edit`}>{r.staff_name}</Link> : r.staff_name} #<strong>{r.code}</strong><br />
                        <small>{r.staff_phone ? `${r.staff_email} - ${r.staff_phone}` : ''}</small><br />
                        

                        {this.permitEditStaff ?
                            <div>                            
                                <small> CMND: {r.cmnd}</small><br />
                                <small>{r.temporary_residence_address ? ` ${r.temporary_residence_address}` : ''}</small>
                            </div> :''}
                        
                    </div>
                )
            },
            {
                title: t('hr:position') + '/'  + t('hr:major') + '/'  + t('hr:work_type'),
                render: r => (
                    <div>
                        {positions.map(m => m.id == r.position_id && m.name)}  / <br />
                        {majors.map(m => m.id == r.major_id && m.name)} 
                        / { r.major_id == 61 ? //PG  
                            brandsFormat.map(b =>  {
                                let titleBrands = ''
                                let arrBrands = r.staff_title.split(',')
                                if(arrBrands.length && b.id == arrBrands[0]){
                                    titleBrands = b.name + (arrBrands.length > 1 ? ',...' : '') ;
                                }
                                return <span>{titleBrands}</span>
                            })
                            : ''
                         }<br />
                        {WorkType[r.work_type]}
                    </div>
                )
            },
            {
                title: t('hr:dept') + '/' + t('hr:sec') + '/' + t('hr:location'),
                render: r => {
                    let deparment = departments.find(d => r.staff_dept_id == d.id);
                    let deptName = deparment ? deparment.name : 'NA';
                    let division = divisions.find(d => r.division_id == d.id)
                    let divName = division ? division.name : 'NA';
                    let location = locations.find(l => r.staff_loc_id == l.id)
                    let locName = location ? location.name : 'NA';
                    return (
                        <>
                            <strong>{deptName}</strong> / <br />
                            {divName} / <br />
                            {locName}
                        </>
                    )
                }
            },
            {
                title: t('hr:date'),
                render: r => {
                    return (
                        <>
                            {r.staff_hire_date ? <>
                                <span>{t('hr:working_months')}:
                                    <strong> {r.staff_hire_date ? dayjs().diff(dayjs(r.staff_hire_date * 1000), 'months', true).toFixed(1) : ''}</strong>
                                </span>
                                <br />
                            </> : ''}

                            <CreateUpdateDate record={r} />
                        </>
                    )
                }
            },
            {
                title: t('hr:status'),
                render: r => typeof staffStatus[r.staff_status] !== 'undefined' ? staffStatus[r.staff_status] : '',
                align: 'center'
            },
            {
                title: t('hr:action'),
                align: 'center',
                render: r => {
                    const items = [
                            {
                                key: '1',
                                label: checkPermission('hr-staff-update') ? <Link to={`/company/staff/${r.staff_id}/edit`}>{t('edit')}</Link>: ''
                            },
                            {
                                key: '2',
                                label: checkPermission('hr-staff-print') ?
                                    (window.innerWidth < screenResponsive ? '' :
                                        <Link to={`/company/staff/${r.staff_id}/print`}>
                                            {t('hr:print')}
                                        </Link>
                                    )
                                : ''
                            },
                            {
                                key: '3',
                                label: <Popconfirm
                                    title= {t('are_reset_password')}
                                    onConfirm={() => this.resetPassword(r.staff_email)}
                                    // onCancel={cancel}
                                    okText= {t('hr:yes')}
                                    cancelText= {t('hr:no')}
                                >
                                    {
                                        checkPermission('hr-staff-preview') ?
                                            <div
                                                loading={this.state.loading}
                                                className='btn_reset_pass'>
                                                {t('hr:reset_password')}
                                            </div>
                                            : ''
                                    }
                                </Popconfirm>
                            },
                            {
                                key: '4',
                                label: <Popconfirm
                                    title={t('clean_up')}
                                    onConfirm={() => this.clearUpStaff(r.staff_id)}
                                    // onCancel={cancel}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    {
                                        checkPermission('hr-staff-preview') ?
                                            <div
                                                loading={this.state.loading}
                                                className='btn_reset_pass'>
                                                {t('clear_up')}
                                            </div>
                                            : ''
                                    }
                                </Popconfirm>
                            }
                    ];
                    return (
                        <div>
                            {
                                checkPermission('hr-staff-update') || checkPermission('hr-staff-print') ?
                                    <DropdownAnt trigger={['click']} key={uniqueId('_dropdown')} menu={{items}} placement="bottomLeft">
                                        <Button key={uniqueId('_dropdown_btn')} type='text' icon={<FontAwesomeIcon icon={faEllipsisV} />} />
                                    </DropdownAnt>
                                : ''
                            }
                            {/* <Link to={`/company/staff/${r.staff_id}/edit`}>
                            <Button type="primary" size='small'
                                icon={<FontAwesomeIcon icon={faPen} />}>
                            </Button>
                        </Link>
                        <Link to={`/company/staff/${r.staff_id}/print`}>
                            <Button type="primary" size='small' style={{ marginLeft: 8 }}
                                icon={<FontAwesomeIcon icon={faPrint} />}>
                            </Button>
                        </Link> */}
                        </div>
                    )
                }
            }
        ];

        // let headerMenu = (
        //     /<Menu onClick={() => { }} >
        //         <Menu.Item key={uniqueId('_dropdown')} >
        //             {
        //                 checkPermission('hr-staff-create') ?
        //                     <Link to={`/company/staff/create`} key="create-staff" >
        //                         <Button size="small" type="text" icon={<FontAwesomeIcon icon={faUserPlus} />}>
        //                             &nbsp;Thêm nhân viên
        //                         </Button>
        //                     </Link>
        //                 : ''
        //             }
        //         </Menu.Item>
        //         <Menu.Item key={uniqueId('_dropdown')} onClick={() => this.exportStaff()}>
        //             {
        //                 checkPermission('hr-staff-export') ? 
        //                     <Button key="export-staff" type="text" size="small" icon={<FontAwesomeIcon icon={faFileExport} />}>
        //                         &nbsp;{t('Export')}
        //                     </Button>
        //                 : ''
        //             }
                    
        //         </Menu.Item>
        //         <Menu.Item key={uniqueId('_dropdown')} >
        //             <Upload key="import-upload" accept=".csv, .xls, .xlsx"
        //                 onChange={() => Modal.confirm({
        //                     title: 'Xác nhận',
        //                     icon: <ExclamationCircleOutlined />,
        //                     content: 'Bạn chắc muốn import dữ liệu file này?',
        //                     onOk: () => this.handleImportUpload(),
        //                     onCancel: () => this.setState({ file: null, fileList: [] })
        //                 })}
        //                 beforeUpload={this.beforeUpload}
        //                 onRemove={this.onRemove} fileList={fileList}>
        //                 {
        //                     checkPermission('hr-staff-import') ?
        //                         <Button key="import-upload-action" icon={<FontAwesomeIcon icon={faPaperclip} />} type="text" size="small" style={{ paddingLeft: '8px' }}>
        //                             &nbsp;&nbsp;{t('Select Import File')}
        //                         </Button>
        //                     : ''
        //                 }
        //             </Upload>
        //         </Menu.Item>
        //     </Menu>
        // );

        const headerMenuClick = ({ key }) => {
            if (key == '1') return;
            if (key == '2') {
                this.exportStaff();
            }
            if (key == '3') {
                this.handleImportUpload();
            }
        };
        const items = [
            // {
            //     key: '1',
            //     label:(
            //             checkPermission('hr-staff-create') ?
            //                 <Link to={`/company/staff/create`} key="create-staff" >
            //                     <Button size="small" type="text" icon={<FontAwesomeIcon icon={faUserPlus} />}>
            //                         &nbsp;Thêm nhân viên
            //                     </Button>
            //                 </Link>
            //             : ''
            //     )
            // },
            {
                key: '2',
                label: (
                    checkPermission('hr-staff-export') ?
                        <Button 
                        onClick={() => this.exportStaff()}
                         key="export-staff" 
                         type="text" 
                         size="small" 
                         icon={<FontAwesomeIcon icon={faFileExport} />}>
                            &nbsp;{t('hr:export')}
                        </Button>
                    : ''
                )
            },
            {
                key: '3',
                label: (
                    <Upload key="import-upload" accept=".csv, .xls, .xlsx"
                        onChange={() => Modal.confirm({
                            title: 'Xác nhận',
                            icon: <ExclamationCircleOutlined />,
                            content: 'Bạn chắc muốn import dữ liệu file này?',
                            onOk: () => this.handleImportUpload(),
                            onCancel: () => this.setState({ file: null, fileList: [] })
                        })}
                        beforeUpload={this.beforeUpload}
                        onRemove={this.onRemove} fileList={fileList}>
                        {
                            checkPermission('hr-staff-import') ?
                                <Button key="import-upload-action" icon={<FontAwesomeIcon icon={faPaperclip} />} type="text" size="small" style={{ paddingLeft: '8px' }}>
                                    &nbsp;&nbsp;{t('hr:select_file')}
                                </Button>
                            : ''
                        }
                    </Upload>
                )
            }
        ];

        return (
            <div>
                <Row gutter={ window.innerWidth < screenResponsive  ? '' : [24, 0]} className='mt-3'>
                    {window.innerWidth < screenResponsive  ? ''
                        :
                        <Col xs={24} sm={24} md={24} lg={4} xl={4}  className='col_left relaive' style={{ padding: '0' }}>
                            <Row className="card pl-3 pr-3 mb-3">
                                <strong style={{ fontSize: 17 }} className='text-center mt-1 pb-3'>{t('hr:list_department')}</strong>
                                <div id='box_search_site' className='border-top'>
                                    <Input
                                        className='d-flex align-items-center block_input_search'
                                        prefix={<SearchOutlined className='text-muted' style={{ fontSize: 17 }} />}
                                        placeholder='Tìm bộ phận'
                                        onChange={e => this.filterGroup(e)}
                                    />
                                </div>
                                {this.renderListGroup()}
                            </Row>
                        </Col>
                    }
                    <Col xs={24} sm={24} md={24} lg={20} xl={20} >
                        <Row className="card pl-3 pr-3 mb-3">
                            <div className='d-flex justify-content-between border-bottom pb-2 pt-1'>
                                <strong style={{ fontSize: 17 }} className='justify-content-start mt-1'>{t('hr:staff_list')}</strong>
                                <div className='justify-content-end mt-1'>
                                    {/* <Button style={this.state.visibleForm ? {color:'rgb(126 119 119)'} : {}} 
                                            type={this.state.visibleForm ? {} : 'primary' }
                                            className='mr-2' 
                                            icon={<FontAwesomeIcon icon={faSearch}/>}
                                            onClick={()=> this.setState({visibleForm : !this.state.visibleForm})}
                                        >&nbsp;Tìm kiếm</Button> */}
                                    
                                    
                                   
                                    <DropdownAnt trigger={['click']} key={uniqueId('_dropdown')} menu={{ items, onClick: headerMenuClick }} type="primary" placement="bottomLeft">
                                        <Button key={uniqueId('_dropdown_btn')} type="primary" icon={<FontAwesomeIcon icon={faEllipsisV} />} />
                                    </DropdownAnt>
                                </div>
                            </div>
                            <Tab tabs={tabListStaff(this.props)} />
                            <Form
                                className="pt-3"
                                ref={this.formRef}
                                name="searchStaffForm"
                                onFinish={this.submitForm.bind(this)}
                                layout="vertical"
                            >
                                <Row className='' gutter={[12, 0]}>
                                    <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                        <FormItem name="q">
                                            <Input placeholder={t('hr:name') + '/' + t('hr:phone') + '/' + t('hr:code') + '/' + t('hr:email')} />
                                        </FormItem>
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                                        <FormItem name="location_id" >
                                            <Dropdown datas={locations} defaultOption={t('hr:all_location')} />
                                        </FormItem>
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                                        <FormItem name="department_id" >
                                            <Dropdown datas={departments} defaultOption={t('hr:all_department')} mode="multiple" />
                                        </FormItem>
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                                        <FormItem name="division_id" >
                                            <Dropdown datas={divisions} defaultOption={t('hr:all_division')} />
                                        </FormItem>
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                                        <FormItem name="position_id" >
                                            <Dropdown datas={positions} defaultOption={t('hr:all_position')} />
                                        </FormItem>
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                                        <FormItem name="major_id" >
                                            <Dropdown datas={majors} defaultOption={t('hr:all_major')} mode="multiple" />
                                        </FormItem>
                                    </Col>
                                    {/* <Col span={4}>
                                        <FormItem name="skill_id" >
                                            <Dropdown datas={pendingSkills} defaultOption="-- All Skill --" />
                                        </FormItem>
                                    </Col> */}
                                    <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                                        <FormItem name="work_type" >
                                            <Dropdown datas={WorkType} defaultOption={t('hr:work_type')}/>
                                        </FormItem>
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                                        <FormItem name="city_id" >
                                            <Dropdown
                                                datas={cities}
                                                defaultOption={t('all_city')}
                                            />
                                        </FormItem>
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                                        <FormItem name="miss_info" >
                                            <Dropdown datas={{0:'All', 1:'Thiếu thông tin'}} defaultOption={t('info_status')} />
                                        </FormItem>
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                                        <FormItem name="status" >
                                            <Dropdown datas={staffStatus} defaultOption={t('hr:all_status')} />
                                        </FormItem>
                                    </Col>
                                    <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                                        <FormItem name="avatar" >
                                            <Dropdown datas={{ 1: 'Yes', 2: 'No' }} defaultOption={t('hr:avatar')} />
                                        </FormItem>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={4} xl={4} key='submit' className='mb-2'>
                                        <Button type="primary" htmlType="submit"                            >
                                            {t('hr:search')}
                                        </Button>
                                    </Col>

                                </Row>
                            </Form>
                        </Row>

                        <Row>
                            <Col span={24}>
                            {window.innerWidth < screenResponsive  ? 
                                <div className='block_scroll_data_table'>
                                    <div className='main_scroll_table'>
                                    <Table
                                            dataSource={this.state.staffList ? this.state.staffList : []}
                                            columns={columns}
                                            loading={this.state.loading}
                                            pagination={{
                                                itemBg:'#ffffff',
                                                total: this.state.total,
                                                pageSize: this.state.limit,
                                                hideOnSinglePage: true,
                                                showSizeChanger: false,
                                                current: this.state.page,
                                                onChange: page => this.onChangePage(page)
                                            }}
                                            rowKey={staff => staff.staff_id}    
                                        />
                                    </div>
                                </div>
                                :

                                <Table
                                    dataSource={this.state.staffList ? this.state.staffList : []}
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
                                    rowKey={staff => staff.staff_id}    
                                />
                            }
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Staff));
