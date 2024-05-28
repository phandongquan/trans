import React, { Component  } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Modal, Form, Col, Row, Input, Upload, Button, Select, DatePicker } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Dropdown from '~/components/Base/Dropdown';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { staffHistoryCategories, staffHistoryViphamTypes,staffHistoryQuyetdinhTypes, staffHistoryLuanchuyenTypes, staffHistoryLevel, staffHistoryReason, staffHistoryTreatmentMethod, staffHistoryGoodat, staffHistoryWeakness, reasonInActive} from '~/constants/basic';
import StaffDropdown from '~/components/Base/StaffDropdown';
import SkillDropdown from '~/components/Base/SkillDropdown';
import { MEDIA_URL_HR } from '~/constants';
import { showNotify, convertToFormData, cleanObject, timeFormatStandard } from '~/services/helper';
import dayjs from 'dayjs';
import { save as saveHistory } from '~/apis/company/staff/history';
import QRCode from 'qrcode.react';

import {screenResponsive} from '~/constants/basic';
const FormItem = Form.Item;
const FormatDate = 'YYYY-MM-DD'
class StaffHistoryForm extends Component {
    
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            fileList: [], // File upload
            historyFileList: [], // File from history model
            removeFileList: [] ,// File will be remove
            categoryHistory : 0,
            isExplanation : null , 
            loading : false
        }
    }
    
    componentDidUpdate(prevProps) {
        let { data } = this.props;
        if (prevProps.data != data && Object.keys(data).length == 0) {
            this.formRef.current.resetFields();
            this.setState({
                fileList: [],
                historyFileList: [],
                removeFileList: []
            });
            
            this.formRef.current.getFieldValue('staff_id')
        }

        if (prevProps.data != data && Object.keys(data).length) {
            this.setState({
                fileList: [],
                historyFileList: [],
                removeFileList: [],
                categoryHistory : data.type,
                isExplanation : data.type == 1 ? data.explanation_required : null // nếu vi phạm setState isExplanation
            });
            if (data.files.length) {
                let historyFileList = [];
                data.files.map((f, i) => historyFileList.push({
                    uid: `history-${i}`,
                    name: f.split("/").pop(),
                    fileRaw: f,
                    status: 'done',
                    url: `${MEDIA_URL_HR}/${f}`,
                }));
                this.setState({ historyFileList });
            }

            if(data.reviews?.pros == undefined){
                data.pros = ''
            }
            else{
                data.pros = JSON.parse("[" + data.reviews.pros + "]");    
            }

            if(data.reviews?.cons == undefined){
                data.cons = ''
            }
            else{
                data.cons = JSON.parse("[" + data.reviews.cons + "]");    
            }

            if(data.reviews?.comments_and_suggestions == undefined){
                data.comments_and_suggestions = ''
            }
            else{
                data.comments_and_suggestions = data.reviews.comments_and_suggestions;    
            }
            data.date = data?.date ? dayjs(data.date) : null
            
            this.formRef.current.setFieldsValue(data);
        } else {
            let { staffId } = this.props;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
            if (staffId) {
                this.formRef.current.setFieldsValue({ staff_id: staffId });
            }
        }


    }
  
    /**
     * @event before submit form
     * Validate before submit
     */
    handleFormSubmit(e) {
        let { fileList , historyFileList , isExplanation } = this.state
        e.preventDefault();
        const Staff_Id = this.formRef.current.getFieldValue("staff_id")
        this.formRef.current.validateFields()
            .then((values) => {
                if(this.state.categoryHistory == 1){ //1 Vi phạm
                    if((isExplanation == 0 && (fileList.length > 0 || historyFileList.length > 0)) || isExplanation == 1){
                        //Nhân viên giải trình?: option Yes/No
                        // Chọn yes: Field file: không required
                        // Chọn No: Field file: is required
                        this.submitForm(values,Staff_Id);
                    }else{
                        showNotify('Notification', 'Please input files !', 'error')
                        return
                    }
                }else{
                    this.submitForm(values,Staff_Id);
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
    async submitForm(values , Staff_Id) {
        let { t, data, staffId } = this.props;
        this.setState({loading : true})
        let formData;
        // If edit one staffHistory then get staff_id from props.dada, opposite get from url
        let staff_id = Object.keys(data).length > 0 ? data.staff_id : Staff_Id;
        values = cleanObject(values);
        values['staff_id'] = staff_id;
        if (values) {
            if (values.id) {
                values['_method'] = 'PUT';
            }
            // if(!values.staff_id){
            //     values.staff_id = 0
            // }
            values.date = values.date != undefined ? timeFormatStandard(values.date , FormatDate) : null

            //console.log({values})

            let pros =  values.pros;
            let cons =  values.cons;
            let comments_and_suggestions = values.comments_and_suggestions;

            delete(values.pros);
            delete(values.cons);
            delete(values.comments_and_suggestions);

            formData = convertToFormData(values);
            this.state.fileList.map(f => formData.append('files[]', f));
            this.state.removeFileList.map(f => formData.append('remove_files[]', f));
            //console.log(pros,cons)

            if(pros){
                formData.append('reviews[pros]' ,pros.toString())
            }
            if(cons){
                formData.append('reviews[cons]' ,cons.toString())
            }
            if(comments_and_suggestions){
                formData.append('reviews[comments_and_suggestions]' ,comments_and_suggestions)
            }

            let response = await saveHistory(formData);
            if (response.status == 1) {
                showNotify(t('Notification'), t('Data has been updated!'));
                this.props.onCancel();
                this.props.refreshTable();
            } else {
                showNotify(t('Notification'), response.message, 'error');
            }
            
        }
        this.setState({loading: false})
    }

    /**
     * @handle before upload
     * 
     * @return false will default upload to url
     * @param {BinaryType} file 
     */
    beforeUpload = file => {
        this.setState(state => ({
            fileList: [...state.fileList, file],
        }));
        return false;
    }

    /**
     * @event remove file
     * @param {BinaryType} file 
     */
    onRemove = file => {
        if (file.uid.includes('history')) {
            this.setState(state => {
                const index = state.historyFileList.indexOf(file);
                const newHistoryFileList = state.historyFileList.slice();
                newHistoryFileList.splice(index, 1);
                let newRemoveFileList = state.removeFileList.slice();
                newRemoveFileList.push(file.fileRaw);
                return {
                    historyFileList: newHistoryFileList,
                    removeFileList: newRemoveFileList
                };
            });
        } else {
            this.setState(state => {
                const index = state.fileList.indexOf(file);
                const newFileList = state.fileList.slice();
                newFileList.splice(index, 1);
                return {
                    fileList: newFileList,
                };
            });
        }
    }

    /**
     * Download QR
     */
    downloadQR = () => {
        const canvas = document.getElementById("qrStaffHistory");
        const pngUrl = canvas
            .toDataURL("image/png")
            .replace("image/png", "image/octet-stream");
        let downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `qr_code_staff_history.png`;

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    handleChangeType(value){
        this.setState({categoryHistory : value})
        if(value != 1 || value != 5) {
            this.setState({ isExplanation : null })
        }
    }
    render() {
        let { t, data , baseData : {locations} } = this.props;

       
        return (
            <Modal
            
                forceRender
                title={t('hr:history')}
                open={this.props.visible}
                onCancel={() => this.props.onCancel()}
                okText={t("submit")}
                cancelText={t("cancel")}
                onOk={this.handleFormSubmit.bind(this)}
                width={window.innerWidth < screenResponsive  ?'100%' :'40%'}
                confirmLoading = {this.state.loading}
                >
                <Form
                    preserve={false}
                    ref={this.formRef}
                    layout="vertical">
                    <Row gutter={24}>
                        <Col xs={24} sm={24} md={24} lg={16} xl={16} className='p-0'>
                                <Col span={24}>
                                    <FormItem name="id" hidden>
                                        <Input />
                                    </FormItem>
                                    <FormItem  label={t('hr:title')} name="title" hasFeedback rules={[{ required: true, message: t('input_title') }]}>
                                        <Input placeholder={t('hr:title')} />
                                    </FormItem>
                                </Col>
                                <Col span={24}>
                                    <FormItem label={t('hr:category')} name="type" hasFeedback rules={[{ required: true, message: t('please_select_category') }]}>
                                        <Dropdown datas={staffHistoryCategories} defaultOption={t('all_category')} onChange={v => this.handleChangeType(v)} /> 
                                    </FormItem>
                                </Col>
                            {
                                this.state.categoryHistory == 5 ?
                                    <Col span={24}>
                                        <FormItem label={t('hr:expected_date_of_leave')} name="date" hasFeedback rules={[{ required: true, message: t('please_select_date') }]}>
                                            <DatePicker style={{ width: '100%' }} format={FormatDate} />
                                        </FormItem>
                                    </Col>
                                    : []
                            }
                            <Col hidden={(this.state.categoryHistory == 1 || this.state.categoryHistory == 5)? false : true} span={24}>
                                <FormItem label={t('hr:reason')} name="reason" hasFeedback
                                    rules={[{ required: (this.state.categoryHistory == 1 || this.state.categoryHistory == 5) ? true : false, message: t('select_reason') }]}>
                                    <Dropdown datas={this.state.categoryHistory != 5 ? staffHistoryReason : reasonInActive} defaultOption={t('all_reason')} />
                                </FormItem>
                            </Col>
                            <div hidden={this.state.categoryHistory == 1 ? false : true}>
                                    <Col span={24}>
                                        <FormItem label={t('hr:type')} name="sub_type" hasFeedback rules={[
                                            { required: this.state.categoryHistory == 1? true :false, message: t('select_types') }]}
                                        >
                                            <Dropdown datas={staffHistoryViphamTypes} defaultOption={t('hr:all_type')}  /> 
                                        </FormItem>
                                    </Col>
                                    <Col span={24}>
                                        <FormItem label={t('hr:level')} name="level" hasFeedback rules={[{ required: this.state.categoryHistory == 1? true :false, message: t('Please select Level') }]}>
                                            <Dropdown datas={staffHistoryLevel} defaultOption={t('hr:all_level')} /> 
                                        </FormItem>
                                    </Col>
                                    <Col span={24}>
                                        <FormItem label={t('treatment_method')} name="treatment_method" hasFeedback rules={[{ required: this.state.categoryHistory == 1? true :false, message: t('Please select treatment method') }]}>
                                            <Dropdown  datas={staffHistoryTreatmentMethod} defaultOption={t('all_treatment_method')} /> 
                                        </FormItem>
                                    </Col>
                                    <Col span={24}>
                                        <FormItem label={t('hr:skill')} name="skill_id" hasFeedback rules={[{ required: this.state.categoryHistory == 1? true :false, message: t('Please Input skill') }]}>
                                            <SkillDropdown defaultOption="-- All Kill --"  /> 
                                        </FormItem>
                                    </Col>
                                    <Col span={24}>
                                        <FormItem label={t('hr:location')} name="location_id" hasFeedback rules={[{ required: this.state.categoryHistory == 1? true :false, message: t('Please select location') }]}>
                                            <Dropdown datas= {locations} defaultOption={t('hr:all_location')}  /> 
                                        </FormItem>
                                    </Col>
                                    <Col span={24}>
                                    <Form.Item name="date" label={t('hr:duration_of_violation')} hasFeedback rules={[{ required: this.state.categoryHistory == 1? true :false, message: t('Please select day') }]}>
                                            <DatePicker style={{ width: '100%' }} format={FormatDate}/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item name="explanation_required" label={t('Nhân viên giải trình?')} hasFeedback rules={[{ required: this.state.categoryHistory == 1 ? true :false, message: t('Please select option') }]}>
                                            <Dropdown datas={{1 : 'Yes' , 0 : 'No'}} defaultOption={'-- Yes or No --'} onSelect={v => this.setState({isExplanation : v})} />
                                        </Form.Item>
                                    </Col> 
                                    <Col span={24}>
                                        <div className='text_block_supervise'>
                                            Quản lý chi nhánh nhận xét
                                        </div>
                                    </Col>                                   

                                    <Col span={24}>
                                    <FormItem name="pros" label={t('hr:advantage')} hasFeedback> 
                                            <Dropdown mode = "multiple"  datas={staffHistoryGoodat} defaultOption="-- All Pros --"  /> 
                                        </FormItem>
                                    </Col>
                                    <Col span={24}>
                                    <FormItem name="cons" label={t('hr:defect')}  hasFeedback>  
                                            <Dropdown mode = "multiple"  datas={staffHistoryWeakness} defaultOption="-- All Pros --"  /> 
                                        </FormItem>
                                    </Col>
                                    <Col span={24}>
                                    <FormItem label={t('hr:comments_and_recommendations')} name="comments_and_suggestions" >
                                            <Input.TextArea rows={3} placeholder="Content and Suggestion" />
                                        </FormItem>
                                    </Col>               
                               </div>

                               <div  hidden={this.state.categoryHistory == 2 ? false : true}>
                                    { <Col span={24}>
                                        <FormItem label={t('hr:type')} name="sub_type" hasFeedback rules={[{ required: this.state.categoryHistory == 2? true :false, message: t('Please select Types') }]}>
                                            <Dropdown datas={staffHistoryQuyetdinhTypes} defaultOption="-- All types --"  /> 
                                        </FormItem>
                                    </Col> }
                               </div>

                               <div  hidden={this.state.categoryHistory == 4 ? false : true}>
                                    <Col span={24}>
                                        <FormItem label={t('hr:type')} name="sub_type" hasFeedback rules={[{ required: this.state.categoryHistory == 4? true :false, message: t('Please select Types') }]}>
                                            <Dropdown datas={staffHistoryLuanchuyenTypes} defaultOption="-- All types --"  /> 
                                        </FormItem>
                                    </Col>
                               </div>

                                < Col span={24}>
                                    <Form.Item label={t('hr:staff')} name='staff_id'  hasFeedback rules={[{ required: true, message: t('Please select staff') }]}>
                                        <StaffDropdown defaultOption={t('-- Search Staff --')}
                                        />
                                    </Form.Item>
                                </Col>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={8} xl={8} >
                            { data?.id ? 
                                <div className='text-center mt-3'>
                                <QRCode id="qrStaffHistory" value={`{"action":"staff_history","id":${data?.id || 0}}`} style={{ marginTop: 20, marginBottom: 20 }} />
                                <br />
                                <Button type='link' onClick={() => this.downloadQR()} className='txt_color_1'> Download QR Code</Button>
                            </div>
                            : ''}
                        </Col>
                        <Col span={24}>
                            <FormItem label={t('hr:content')} name="content" >
                                <Input.TextArea rows={3} placeholder={t('hr:content')} />
                            </FormItem>
                        </Col>
                        <Col span={24}>
                            <FormItem label={t('hr:note')} name="note" >
                                <Input.TextArea rows={2} placeholder={t('hr:note')}/>
                            </FormItem>
                        </Col>
                        <Col span={24}>
                            <FormItem label={t('hr:file')}>
                                <Upload key="upload" listType="picture" beforeUpload={this.beforeUpload} onRemove={this.onRemove} fileList={[...this.state.historyFileList, ...this.state.fileList]} multiple>
                                    <Button key="upload" icon={<FontAwesomeIcon icon={faPaperclip} />}>
                                        &nbsp;{t('hr:upload')}
                                    </Button>
                                </Upload>
                            </FormItem>
                        </Col>
                    </Row>
                </Form>
            </Modal>
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(StaffHistoryForm));
