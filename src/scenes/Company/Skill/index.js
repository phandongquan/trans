import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { PageHeader } from '@ant-design/pro-layout';
import { Button, Table, Row, Col,  Input, Upload, Form, Dropdown as DropdownTheme, Popconfirm, Menu } from "antd";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faFileImport, faPen, faPlus, faPaperclip, faDownload, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';
import { skillStatus } from '~/constants/basic';
import { getList as getListSkill, destroy as deleteSkill, importSkill } from '~/apis/company/skill';
import { header, formatSkill } from './config/exportSkill';
import { uniqueId } from 'lodash';
import { Link } from 'react-router-dom';
import Dropdown from '~/components/Base/Dropdown';
import TooltipButton from '~/components/Base/TooltipButton';
import DeleteButton from '~/components/Base/DeleteButton';
import ExportXLSButton from '~/components/Base/ExportXLSButton';
import { showNotify, historyParams, historyReplace, exportToXLS, autofitColumnXLS, checkPermission, } from '~/services/helper';
import skillTemplate from '~/assets/files/Skill-List-TEMPLATE.xlsx';
import { saveAs } from 'file-saver';
import Tab from '~/components/Base/Tab';
import tabList from '~/scenes/Company/config/tabListSkill';
import CreateUpdateDate from '~/components/Base/CreateUpdateDate';
import {screenResponsive} from '~/constants/basic';

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
            visibleConfirmUpload: false,
            loading: false,
            skillList: [],
            fileList: [],
            file: null,

            limit: 25, 
            page: params.page ? Number(params.page) : 1,
            total: 0
        };
        this.formRef = React.createRef();
    }

    /**
     * @lifecycle 
     */
    componentDidMount() {
        let params = historyParams();
        this.formRef.current.setFieldsValue(params);
        let values = this.formRef.current.getFieldsValue();
        this.getSkill(values);
    }
    /**
     * @event search report
     */
    submitForm = (e) => {
        this.setState({page: 1}, () => {
            let values = this.formRef.current.getFieldsValue();
            this.getSkill({ ...values});
        })
    }

    /**
     * Get list skill
     * @param {} params 
     */
    getSkill = (params = {}) => {
        this.setState({ loading: true });

        params = {
            ...params,
            limit: this.state.limit,
            offset: (this.state.page - 1) * this.state.limit,
        }

        historyReplace(params);
        let xhr = getListSkill(params);
        xhr.then((response) => {
            if (response.status) {
                let { data } = response;

                // Format rows to array object
                let listData = [];
                if (data.rows) {
                    Object.keys(data.rows).map(id => {
                        delete(data.rows[id].children)
                        listData.push(data.rows[id]);
                    })
                }

                this.setState({
                    skillList: listData,
                    loading: false,
                    total: data.total
                });
            }
        });
    }

    /**
     * @event change page
     * 
     * @param {*} page 
     */
     onChangePage(page) {
        let values = this.formRef.current.getFieldsValue();
        this.setState({ page }, () => this.getSkill({ ...values }));
    }

    /**
     * @event delete skill
     * @param {} e 
     */
    onDeleteSkill = (e, id) => {
        let { t } = this.props;
        e.stopPropagation();
        let xhr = deleteSkill(id);
        xhr.then((response) => {
            if (response.status) {
                let values = this.formRef.current.getFieldsValue();
                this.getSkill(values);
                showNotify(t('hr:notification'), t('Skill has been removed!'));
            } else {
                showNotify(t('hr:notification'), response.message);
            }
        }).catch(error => {
            showNotify(t('hr:notification'), t('Server has error!'));
        });;
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
        this.setState({ loading: true });
        const { file } = this.state;
        const formData = new FormData();
        formData.append('file', file);
        let xhr = await importSkill(formData);
        if (xhr.status == 1) {
            let { t, history } = this.props;
            showNotify(t('hr:notification'), t('Import Done!'), 'success', 1, () => history.go(0));
        }
        this.setState({ visibleConfirmUpload: false, loading: false });
        return false;
    }

    /**
    * Export skill
    */
    exportSkill = () => {
        this.setState({ loading: true })
        let params = this.formRef.current.getFieldsValue();
        params.limit = 10000;
        params.offset = 0;
        params.document_count = 1;
        
        let xhr = getListSkill(params);
        xhr.then(response => {
            this.setState({ loading: false })
            if (response.status) {
                let headerFormat = [], fileHeader = [];
                /**
                 * Set default header
                 */
                Object.keys(header).map((key, i) => {
                    fileHeader.push(header[key]);
                });
                headerFormat.push(['SKILL LIST', 'Date:', dayjs().format('YYYY-MM-DD')], fileHeader);

                /**
                 * Take data format form header
                 */

                let dataFormat = formatSkill(response.data.rows);

                let datas = [...headerFormat, ...dataFormat];
                let fileName = `Skill-list-${dayjs().format('YYYY-MM-DD')}`;

                exportToXLS(fileName, datas, autofitColumnXLS(fileHeader))
            }
        })
    }

    /**
     * @event Download import skill template
     */
    downloadImportTemplate() {
        saveAs(skillTemplate, 'Skill-List-TEMPLATE.xlsx');
    }
    /**
     * @render
     */
    render() {
        let { t, baseData: { departments, divisions, positions, majors } } = this.props;
        const { file, fileList } = this.state;
        const columns = [
            {
                title: t('skill_name'),
                render: (r) => {
                    return (
                        <div>
                            <strong>{r.code}</strong>
                            <br></br>
                            <Link to={`/company/skill/${r.id}/edit`}>{r.name}</Link>
                        </div>
                    );
                },
            },
            {
                title : t('hr:parent_skill_name'),
                render : r => r?.parent?.name
            },
            // {
            //     title: 'Dept/Division/Major',
            //     render: (r) => {
            //         let deparment = departments.find(d => r.department_id == d.id);
            //         let deptName = deparment ? deparment.name : 'NA';
            //         let division = divisions.find(d => r.division_id == d.id)
            //         let divName = division ? division.name : 'NA';
            //         let major = majors.find(m => r.major_id == m.id)
            //         let majorName = major ? major.name : 'NA';
            //         return `${deptName} / ${divName} / ${majorName}`;
            //     }
            // },
            {
                title: t('hr:major'),
                dataIndex: "major_id",
                render: (major_id) => {
                    if (Array.isArray(major_id)) {
                        let arrMajors = [];
                        major_id.map((mId) =>
                            arrMajors.push(majors.find((major) => major.id == mId)?.name)
                        );
                        return <div style={{maxWidth: 200}}>{arrMajors.join(", ")}</div>
                    } else {
                        return majors.find((m) => m.id == major_id)?.name;
                    }
                },
            },
            {
                title: t('hr:weight'),
                align: 'right',
                dataIndex: 'score'
            },
            {
                title: t('hr:cost'),
                align: 'right',
                render: r => r.cost? Number(r.cost).toLocaleString('it-IT', {style : 'currency', currency : 'VND'}) : ''
            },
            {
                title: t('hr:status'),
                render: (r) => r.status && skillStatus[r.status],
                align: 'center'
            },
            {
                title: t('hr:date'),
                render: r => <CreateUpdateDate record={r} />
            },
            {
                title: t('hr:action'),
                align: 'center',
                width: '10%',
                render: (r) => {
                    return (
                        <>
                            {checkPermission('hr-skill-update') ?
                                <Link to={`/company/skill/${r.id}/edit`} key="edit-training-examination">
                                    <TooltipButton title={t('hr:edit')} type="primary" size='small' icon={<FontAwesomeIcon icon={faPen} />} style={{ marginRight: 8 }} />
                                </Link> : ''
                            }
                            {
                                checkPermission('hr-skill-delete') ? 
                                    <DeleteButton onConfirm={(e) => this.onDeleteSkill(e, r.id)} />
                                : ''
                            }
                        </>
                    );
                }
            }
        ];
        const actionClick = ({key}) => {
            if(key == '1'){
                this.exportSkill()
            }
            if(key == '2'){
                this.downloadImportTemplate()
            }
        }
        const items = [
            {
                key: '1',
                label: 
                checkPermission('hr-skill-export') ?
                <div style={{ textAlign: 'center' }}> <FontAwesomeIcon icon={faFileExport}  /> &nbsp;&nbsp;{t('hr:export')} </div>
                        // <Button key="export-staff" type="text" size="small" icon={<FontAwesomeIcon icon={faFileExport} />}>
                        //     &nbsp;{t('Export')}
                        // </Button>
                    : ''
            },
            {
                key: '2',
                label:
                    checkPermission('hr-skill-import') ?
                        <div style={{ textAlign: 'center' }}> <FontAwesomeIcon icon={faDownload} /> &nbsp;&nbsp;{t('hr:download_template')} </div>
                        // <Button key={uniqueId('_dropdown')} icon={<FontAwesomeIcon icon={faDownload} />}>
                        //     &nbsp;&nbsp;&nbsp;{t('Download import template')}
                        // </Button>
                        : ''
            }
            // <Menu onClick={() => { }}>
            //     {
            //         checkPermission('hr-skill-export') ?
            //             <Menu.Item key={uniqueId('_dropdown')} icon={<FontAwesomeIcon icon={faFileExport} />} onClick={() => this.exportSkill()} >
            //                 <Button key="export-staff" type="text" size="small">
            //                     &nbsp;{t('Export')}
            //                 </Button>
            //             </Menu.Item>
            //             : ''
            //     }
            //     {
            //         checkPermission('hr-skill-import') ?

            //             <Menu.Item key={uniqueId('_dropdown')} icon={<FontAwesomeIcon icon={faDownload} />} onClick={this.downloadImportTemplate.bind(this)}>
            //                 &nbsp;&nbsp;&nbsp;{t('Download import template')}
            //             </Menu.Item>
            //             : ''
            //     }
            // </Menu>
        ];

        return (
            <div id='page_staff_skill'>
                <PageHeader
                    title={t('hr:skill')}
                    tags={[
                        <Link to={`/company/skill/create`} key="create-skill">
                            {
                                checkPermission('hr-skill-create') ? 
                                    <Button key="create-skill" type="primary" icon={<FontAwesomeIcon icon={faPlus} />}>
                                        &nbsp;{t('hr:add_new')}
                                    </Button>
                                : ''
                            }
                        </Link>,
                        checkPermission('hr-skill-import') || checkPermission('hr-skill-export') ?
                            <DropdownTheme key={uniqueId('_dropdown')} menu={{ items, onClick: actionClick }} type="primary" placement="bottomLeft" icon={<FontAwesomeIcon icon={faPlus} />}>
                            <Button key={uniqueId('_dropdown_btn')} type="primary" className="ml-2"
                                icon={<FontAwesomeIcon icon={faCaretDown} />}
                            />
                        </DropdownTheme>
                        : '',
                    ]}
                    extra={[

                        <div style={{ textAlign: 'right' }} key="import-training-question">
                            <Popconfirm
                                title="Confirm import skill?"
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
                                        checkPermission('hr-skill-import') ? 
                                            <Button key="import-upload" type="danger" style={{ marginRight: 'auto' }}
                                            icon={<FontAwesomeIcon icon={faPaperclip} />}>
                                            &nbsp;{t('hr:import_file')}
                                            </Button> 
                                            
                                            : ''
                                    }
                                   
                                </Upload>
                            </Popconfirm>
                        </div>
                    ]}
                />

                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={tabList(this.props)} />
                    <Form
                        className="pt-3"
                        ref={this.formRef}
                        name="searchSkillForm"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical"
                    >
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} >
                                <FormItem name='name'>
                                    <Input placeholder={t('hr:skill_name')} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} >
                                <FormItem name='department_id'>
                                    <Dropdown datas={departments} defaultOption={t("hr:all_department")} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <FormItem name='position_id'>
                                    <Dropdown datas={positions} defaultOption={t("hr:all_position")} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <FormItem name='major_id'>
                                    <Dropdown datas={majors} defaultOption={t("hr:all_major")}  />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <FormItem name='status'>
                                    <Dropdown datas={skillStatus} defaultOption={t("hr:all_status")} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Button type="primary" htmlType="submit" className='mb-3'>
                                    {t('hr:search')}
                                </Button>
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
                                    dataSource={this.state.skillList ? this.state.skillList : []}
                                    columns={columns}
                                    loading={this.state.loading}
                                    pagination={{
                                        pageSize: this.state.limit,
                                        total: this.state.total,
                                        showSizeChanger: false,
                                        onChange: page => this.onChangePage(page)
                                    }}
                                    rowKey={(skill) => skill.id}
                                />
                            </div>
                        </div>    
                            :
                        <Table
                            dataSource={this.state.skillList ? this.state.skillList : []}
                            columns={columns}
                            loading={this.state.loading}
                            pagination={{
                                pageSize: this.state.limit,
                                total: this.state.total,
                                showSizeChanger: false,
                                onChange: page => this.onChangePage(page)
                            }}
                            rowKey={(skill) => skill.id}
                        />
                        }
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
