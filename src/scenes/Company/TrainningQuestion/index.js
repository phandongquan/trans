import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getList as getListTrainningQuestion, importQuestion, massUpdate, destroy as aipDestroy } from '~/apis/company/TrainningQuestion';
import { Link } from 'react-router-dom';
import Dropdown from '~/components/Base/Dropdown';
import { withTranslation } from 'react-i18next';
import { Button, Table, Row, Col, Input, Form, Upload, Dropdown as DropdownTheme, Menu, Popconfirm, Tooltip } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { debounce, uniqueId } from 'lodash';
import { staffStatus, trainingExamTypes, trainingQuestionInputTypes, screenResponsive  } from '~/constants/basic';
import { faPen, faPlus, faFileExport, faFileImport, faPaperclip, faDownload, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TooltipButton from '~/components/Base/TooltipButton';
import { searchForDropdown as getSkillList } from '~/apis/company/skill';
import Tab from '~/components/Base/Tab';
import tabListTraining from '../config/tabListTraining';
import dayjs from 'dayjs';
import { getHeader, formatData } from './config/formatDataExcel';
import trainingQuestionTemplate from '~/assets/files/Training-Question-TEMPLATE.xlsx';
import { saveAs } from 'file-saver';
import { exportToXLS, showNotify, historyParams, historyReplace, checkPermission } from '~/services/helper';
import DeleteButton from '~/components/Base/DeleteButton';
import CreateUpdateDate from '~/components/Base/CreateUpdateDate';
const FormItem = Form.Item;
class TrainningQuest extends Component {

    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            visibleConfirmUpload: false,
            loading: false,
            file: null,
            fileList: [],
            listSkill: [],
            trainningList: [],
            limit: 30,
            total: 0,
            page: 1,
            selectedRowKeys: [],
            loading: false,
        };

        this.getListSkill = debounce(this.getListSkill, 500);
    }

    /**
     * @lifecycle 
     */
    componentDidMount() {
        let params = historyParams(); 

        if(params.offset) {
            this.setState({ page: (params.offset/ this.state.limit) + 1})
        }
        this.formRef.current.setFieldsValue(params)
        this.getTrainningQuestion(params);
        this.getListSkill();
    }
    
     /**
     * get document Approve
     */
    handlMassUpdate = (action='Approve') => {
        const { t } = this.props;
        let data = {
            ids: this.state.selectedRowKeys,
            field: "status",
            value: action == "Approve" ? 1 : 2,
        };

        let xhr = massUpdate(data);
        xhr.then ((response) => {
            if (response.status !== 0) {
                this.setState({selectedRowKeys: []})
                let params = this.formRef.current.getFieldsValue();
                this.getTrainningQuestion(params);
            } else {
                showNotify(t('hr:notification'), response.message, 'error');
            }
        });
    }

    /**
     * @event Download import training question template
     */
    downloadImportTemplate() {
        saveAs(trainingQuestionTemplate, 'Training-Question-TEMPLATE.xlsx');
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
        this.setState({ file, visibleConfirmUpload: true });
        return false;
    }

    /**
     * @event submit file import
     */
    async handleImportUpload() {
        const { file } = this.state;
        let { t, history } = this.props;
        const formData = new FormData();
        formData.append('file', file);
        let res = await importQuestion(formData);
        if (res.status == 1) {          
            showNotify(t('hr:notification'), t('Import Done!'), 'success', 1, () => history.go(0));
            this.setState({ visibleConfirmUpload: false });
        } else {
            showNotify(t('hr:notification'), res?.message, 'error');
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
        this.setState({ file: null, visibleConfirmUpload: false });
    }
    /**
     * List skill for dropdown
     */
    async getListSkill(params = {}) {
        let skillResponse = await getSkillList(params);
        if (skillResponse && skillResponse.data) {
            let listSkill = skillResponse.data.results;
            this.setState({ listSkill });
        }
    }
    /**
     * @event Search skill
     * @param {*} value 
     */
    onSearchSkill(value) {
        if (!value) {
            return;
        }
        this.getListSkill({ value });
    }

    /**
     * @event submit form
     * @param {*} e 
     */
    submitForm = (e) => {
        this.setState({ page: 1 }, () => {
            let values = this.formRef.current.getFieldsValue();
            this.getTrainningQuestion(values);
        })
    }

    /**
     * Get list trainning
     * @param {} params 
     */
    getTrainningQuestion = (params = {}) => {
        this.setState({
            loading: true
        });

        params = {
            ...params,
            limit: this.state.limit,
            offset: params.offset || (this.state.page - 1) * this.state.limit,
            sort: 'updated_at',
            is_admin: 1
        }

        historyReplace(params);
        let xhr = getListTrainningQuestion(params);
        xhr.then((response) => {
            if (response.status) {
                let { data } = response;
                this.setState({
                    trainningList: data.rows,
                    loading: false,
                    total: data.total
                });
            }
        });
    }

    /**
     * OnChange page pagination
     * @param {*} page 
     */
    onChangePage = page => {
        let params = historyParams(); 
        delete params.limit
        delete params.offset
        delete params.sort
        let values = this.formRef.current.getFieldsValue();
        values = {
            ...params , 
            ...values
        }
        this.setState({ page }, () => this.getTrainningQuestion(values));
    }

    // Delete training question
    onDeleteTrainingQuestion = (e, id) => {
        let { t } = this.props;
        e.stopPropagation();
        let xhr = aipDestroy(id);
        xhr.then((response) => {
            if (response.status) {
                let values = this.formRef.current.getFieldsValue();
                this.getTrainningQuestion(values);
                showNotify(t('hr:notification'), t('Training question has been removed!'));
            } else {
                showNotify(t('hr:notification'), response.message);
            }
        }).catch(error => {
            showNotify(t('hr:notification'), t('hr:server_error'));
        });
    }

    /**
     * Format data to excel
     */
    exportCell() {
        this.setState({ loading: true });
        let { baseData } = this.props;

        let params = this.formRef.current.getFieldsValue();
        params = {
            ...params,
            limit: -1,
            offset: 0,
            sort: 'id'
        }
        let xhr = getListTrainningQuestion(params);
        xhr.then((response) => {
            if (response.status) {
                let header = getHeader();
                let data = formatData(response.data.rows, baseData);
                let fileName = `Trainning-question-${dayjs().format('YYYY-MM-DD')}`
                let dataFormat = [...header, ...data];
                exportToXLS(fileName, dataFormat, [{ width: 20 }, { width: 30 }, { width: 30 }, null, null, null, null, {width: 40}])
            }
            this.setState({ loading: false })
        });
    }

     onSelectChange = (newSelectedRowKeys) => {
        this.setState({selectedRowKeys: newSelectedRowKeys})
      };
   
    /**
     * @render
     */
    render() {
        let { t, checkPermission, baseData: { departments, majors, divisions } } = this.props;
        const {selectedRowKeys, setSelectedRowKeys, loading} = this.state;

        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
          };

        const hasSelected = selectedRowKeys ;
        const columns = [
            {
                title: 'No.',
                align: 'center',
                render: r => this.state.trainningList.indexOf(r) + 1
            },
            {
                title: t('hr:code'),
                render: r => (
                    <div className='title-info' >
                        <small> <strong>{r.code}</strong> </small> <br></br>
                        {/* <Tooltip placement="top" title={r.title}>
                        <Link to={`/company/trainning-question/${r.id}/edit`} key="edit-training-question">
                            {r.title}
                        </Link>
                        </Tooltip> */}
                    </div>
                    
                )
            },
            {
                title: t('dept') + '/' +t('division') + '/' + t('major'),
                render: r => {
                    let dept = departments.find(d => d.id == r.department_id);
                    let division = divisions.find(d => d.id == r.division_id);
                    let major = majors.find(m => m.id == r.major_id);
                    return `${dept ? dept.name : 'NA'} / ${division ? division.name : 'NA'} / ${major ? major.name : 'NA'}`
                }
            },
            {
                title: t('hr:question_type'),
                render: r => trainingExamTypes[r.type]
            },
            {
                title: t('hr:input_type'),
                render: r => trainingQuestionInputTypes[r.input_type]
            },
            {
                title: t('hr:status'),
                align: 'center',
                render: r => typeof staffStatus[r.status] !== 'undefined' && staffStatus[r.status]
            },
            {
                title: t('hr:answer'),
                render: r => {
                    let details = r.detail;
                    return (
                        <>
                            {details.map(d => (
                                <div key={d.id}>
                                    <small style={{ color: d.is_correct ? 'green' : '' }}>{d.content}</small><br />
                                </div>
                            ))}
                        </>
                    );
                }
            },
            {
                title: t('hr:date'),
                render: r => <CreateUpdateDate record={r} />
            },
            {
                title: t('hr:action'),
                align: 'center',
                render: r => (
                    <>
                    {
                        checkPermission('hr-trainning-question-update') ? 
                        <Link to={`/company/trainning-question/${r.id}/edit`} key="edit-training-question" className='mr-1'>
                            <TooltipButton title={t('hr:edit')} type="primary" size='small' icon={<FontAwesomeIcon icon={faPen} />} />
                        </Link> : ''
                    }
 
                    {
                        checkPermission('hr-trainning-question-approve') ?
                            <DeleteButton title={t('hr:delete')} onConfirm={(e) => this.onDeleteTrainingQuestion(e, r.id)} size='small' />
                            // who create can delete
                        : (checkPermission('hr-trainning-question-delete') && (r.status == 3 || r.status == 2)) ?
                            <DeleteButton title={t('hr:delete')} onConfirm={(e) => this.onDeleteTrainingQuestion(e, r.id)} size='small' />
                        : ''
                    }
                    </>
                ),
                width: '10%'
            }
        ];
       
        let { file, fileList } = this.state;
        const items = [
            // <Menu onClick={() => { }}>
            //     {/* <Menu.Item key={uniqueId('_dropdown')} icon={<FontAwesomeIcon icon={faFileExport} />}>
            //         <ExportXLSButton key="export-staff"
            //             dataPrepare={() => this.formatExportCell()}
            //             fileName={`Trainning-question-${dayjs().format('YYYY-MM-DD')}`}
            //             type="text"
            //             size="small"
            //         // icon={<FontAwesomeIcon icon={faFileExport} />}
            //         >{t('Export list question')}</ExportXLSButton>
            //         <Button key="export-staff" type="text" size="small" onClick={() => this.exportCell()}>
            //             &nbsp;{t('Export')}
            //         </Button>
            //     </Menu.Item> */}
               
            // </Menu>
            {
                key: '1',
                label: 
                <Menu.Item key={uniqueId('_dropdown')} icon={<FontAwesomeIcon icon={faDownload} />} onClick={this.downloadImportTemplate.bind(this)}>
                    &nbsp;&nbsp;&nbsp;{t('hr:download_template')}
                </Menu.Item>
            }
        ];

        return (
            <div id='page_training_question'>
                <PageHeader
                    title={t('hr:training_question')}
                    tags={[
                        <Link to={`/company/trainning-question/create`} key="create-training-question">
                            {
                                checkPermission('hr-trainning-question-create') ?
                                    <Button key="create-training-question"
                                        type="primary"
                                        icon={<FontAwesomeIcon icon={faPlus} />}
                                    >
                                        &nbsp;{t('hr:add_new')}
                                    </Button>
                                : ''
                            }
                        </Link>,
                    ]}
                    extra={window.innerWidth < screenResponsive  ?'' : [
                        <div style={{ textAlign: 'right', display: 'inline' }} key="import-training-question">
                            <DropdownTheme key={uniqueId('_dropdown')} menu={{ items }} type="primary" placement="bottomLeft" icon={<FontAwesomeIcon icon={faPlus} />}>
                                <Button key={uniqueId('_dropdown_btn')} className="mr-1"
                                    icon={<FontAwesomeIcon icon={faCaretDown} />}
                                />
                            </DropdownTheme>
                            <Popconfirm
                                title="Confirm import question?"
                                open={this.state.visibleConfirmUpload}
                                onConfirm={() => this.handleImportUpload()}
                                onCancel={() => this.setState({ visibleConfirmUpload: false, file: null, fileList: [] })}
                                okText="Yes"
                                cancelText="No"
                                placement="bottomRight"
                            >
                                <Upload key="import-upload" accept=".csv, .xls, .xlsx"
                                    beforeUpload={this.beforeUpload.bind(this)}
                                    onRemove={this.onRemove} fileList={fileList}>
                                    {
                                    checkPermission('hr-trainning-question-import') ? 
                                        <Button key="import-upload" type="danger" style={{ marginRight: 'auto' }} icon={<FontAwesomeIcon icon={faPaperclip} />}>
                                            &nbsp;{t('hr:import_file')}
                                        </Button>
                                    : ''
                                    }
                                </Upload>
                            </Popconfirm>
                            
                        </div>
                    ]}
                />

                <Row className="card pl-3 pr-3 mb-3" >
                    <Tab tabs={tabListTraining(this.props)} />
                    <Form
                        className="pt-3"
                        ref={this.formRef}
                        name="searchTrainingQuestionForm"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical"
                    >
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6} >
                                <FormItem name='keywords'>
                                    <Input placeholder={t('hr:keywords')} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <FormItem name="department_id" >
                                    <Dropdown datas={departments} defaultOption={t('hr:all_department')} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <FormItem name="division_id" >
                                    <Dropdown datas={divisions} defaultOption={t('hr:all_division')} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <FormItem name="major_id" >
                                    <Dropdown datas={majors} defaultOption={t('hr:all_major')} />
                                </FormItem>
                            </Col>
                        </Row>
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <FormItem name="status" >
                                    <Dropdown datas={staffStatus} defaultOption={t('hr:all_status')} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <FormItem name="skill_id" >
                                    <Dropdown datas={this.state.listSkill} onSearch={this.onSearchSkill.bind(this)} defaultOption={t('hr:skill')} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <FormItem name="type" >
                                    <Dropdown datas={trainingExamTypes} defaultOption={t('hr:all_type')} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <FormItem name="input_type" >
                                    <Dropdown datas={trainingQuestionInputTypes} defaultOption={t('hr:all_input_type')} />
                                </FormItem>
                            </Col>
                        </Row>
                        <Row gutter={12}>
                            <Col span={24} key='submit' className='mb-2'>
                                <Button type="primary" htmlType="submit" className='mr-2 mb-1'>
                                    {t('hr:search')}
                                </Button>
                                {
                                    checkPermission('hr-trainning-question-export') ?
                                    <Button type="primary" icon={<FontAwesomeIcon icon={faFileExport} />}
                                    onClick={() => this.exportCell()}
                                >&nbsp;{t('hr:export')}</Button> : ''
                                }
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <Row gutter={[16, 24]} className="">
                    <Col span={24}>
                        {window.innerWidth < screenResponsive  ? 
                            <div className='block_scroll_data_table'>
                                <div className='main_scroll_table'> 
                                    <Table
                                        dataSource={this.state.trainningList ? this.state.trainningList : []}
                                        columns={columns}
                                        loading={this.state.loading}
                                        pagination={{
                                            onChange: page => this.onChangePage(page),
                                            current: this.state.page,
                                            pageSize: this.state.limit,
                                            total: this.state.total,
                                            hideOnSinglePage: true,
                                            showSizeChanger: false,
                                        }}
                                        rowKey={(skill) => skill.id}
                                    />
                                </div>
                            </div>
                            
                            :
                            <div
                    style={{
                        marginBottom: 16,
                    }}
                            >
                                <div className='mb-2'>
                                    {
                                        checkPermission('hr-trainning-question-approve') ?
                                            <Button type="primary" disabled={!hasSelected} loading={loading}
                                                onClick={() => this.handlMassUpdate(t('hr:approve'))}
                                            >
                                                {t('hr:approve')}
                                            </Button>
                                        : ''
                                    }
                                    {
                                        checkPermission('hr-trainning-question-approve') ?
                                            <Button type="default" disabled={!hasSelected} loading={loading} style={{ marginLeft: 8 }}
                                                onClick={() => this.handlMassUpdate(t('hr:reject'))}
                                            >
                                                {t('hr:reject')}
                                            </Button>
                                        : ''
                                    }
                                    <span
                                        style={{
                                            marginLeft: 8,
                                        }}
                                    >
                                        {hasSelected ?  t('hr:select')  + " " + selectedRowKeys.length + " " + t('hr:items') : ''}
                                    </span>

                                </div>     

                            <Table
                                rowSelection={rowSelection}
                                dataSource={this.state.trainningList ? this.state.trainningList : []}
                                columns={columns}
                                loading={this.state.loading}
                                pagination={{
                                    onChange: page => this.onChangePage(page),
                                    current: this.state.page,
                                    pageSize: this.state.limit,
                                    total: this.state.total,
                                    hideOnSinglePage: true,
                                    showSizeChanger: false,
                                }}
                                rowKey={(skill) => skill.id}
                               style={{marginTop:'15'}} >
                            </Table>
                                </div>
                        }
                    </Col>
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

const mapDispatchToProps = (dispatch) => {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(TrainningQuest));
