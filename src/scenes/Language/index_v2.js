import { PageHeader } from '@ant-design/pro-layout'
import { Button, Col, Form, Input, Table, Row, Modal, Upload, Popconfirm } from 'antd'
import React, { Component, useContext, useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'
import { list as apiList, update as apiUpdate, importFile as apiImportFile, destroy, combine as apiCombine } from '~/apis/language/index_v2'
import { checkPermission, exportToXLS, historyParams, showNotify } from '~/services/helper';

import flagVn from '~/assets/images/flag_vn.svg';
import flagEn from '~/assets/images/flag_en.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperclip, faPlus } from '@fortawesome/free-solid-svg-icons'
import DeleteButton from '~/components/Base/DeleteButton'
import { formatHeader , formatData } from './config/exportLanguage'
import dayjs from 'dayjs';

const EditableContext = React.createContext(null);
const EditableRow = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
};
const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    dataParent,
    ...restProps
}) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);
    const form = useContext(EditableContext);
    useEffect(() => {
        if (editing) {
            inputRef.current.focus();
        }
    }, [editing]);
    const toggleEdit = () => {
        setEditing(!editing);
        form.setFieldsValue({
            [dataIndex]: record[dataIndex],
        });
    };
    const save = async () => {
        try {
            const values = await form.validateFields();
            if (record.label != values.label) {
                toggleEdit();
                handleSave({
                    dataParent,
                    ...record,
                    ...values,
                });
            } else {
                setEditing(!editing);
            }
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    };
    let childNode = children;
    if (editable) {
        childNode = editing ? (
            <Form.Item
                style={{
                    margin: 0,
                }}
                name={dataIndex}
                rules={[
                    {
                        required: true,
                        message: `${title} is required.`,
                    },
                ]}
            >
                <Input ref={inputRef} onPressEnter={save} onBlur={save} />
            </Form.Item>
        ) : (
            <div
                className="editable-cell-value-wrap"
                style={{
                    paddingRight: 24,
                }}
                onClick={toggleEdit}
            >
                {children}
            </div>
        );
    }
    return <td {...restProps}>{childNode}</td>;
};

export class languageV2 extends Component {
    /**
    * 
    * @param {*} props 
    */
    constructor(props) {
        super(props);
        let params = historyParams();
        this.state = {
            loading: false,
            limit: 30,
            offset: params.offset ? Number(params.offset) : 0,
            total: 0,
            datas: [],
            data: {},
            visible: false,
            visibleUpload: false,
            fileList: [],
            file: null,
            visibleConfirmUpload: false
        };
        this.formRef = React.createRef();
        this.formModalRef = React.createRef()

    }
    componentDidMount() {
        let params = historyParams();
        this.formRef.current.setFieldsValue(params);
        let values = this.formRef.current.getFieldsValue();
        this.getList()
    }
    async getList(params = {}) {
        params = {
            ...params,
            offset: this.state.offset,
            limit: this.state.limit,
        }
        this.setState({ loading: true });
        let response = await apiList(params)
        if (response.status) {
            this.setState({ loading: false, datas: response.data.rows, total: response.data.total });
        } else {
            showNotify('Notification', response.message, 'error')
            this.setState({ loading: false });
        }
    }
    getFLag = locale => {
        switch (locale) {
            case 'vi':
                return flagVn;
            case 'en':
                return flagEn;
        }
    }
    submitForm(values) {
        this.getList(values)
    }
    handleSave = async (row) => {
        let formData = new FormData();
        formData.append('module', row.module);
        formData.append('key', row.key);
        if (Array.isArray(row.labels) && row.labels.lenght) {
            (row.labels).map((l, index) => {
                formData.append(`labels[${index}][locale]`, l.locale);
                formData.append(`labels[${index}][label]`, l.label)
            })
        }
        let response = await apiUpdate(row.id, formData)
        if (response.status) {
            showNotify('notification', response.message)
            this.getList()
        } else {
            showNotify('notification', response.message, 'error')
        }
    }
    handleSaveLabels = async (row) => {
        let dataParent = row.dataParent
        let dataParentLabels = dataParent.labels.slice()
        let formData = new FormData();
        formData.append('module', dataParent.module);
        formData.append('key', dataParent.key);
        if (Array.isArray(dataParentLabels) && dataParentLabels.length) {
            let indexRow = dataParent.labels.findIndex(l => l.id == row.id);
            dataParentLabels[indexRow] = row;
            console.log(dataParentLabels);
            (dataParentLabels).map((l, index) => {
                formData.append(`labels[${index}][locale]`, l.locale);
                formData.append(`labels[${index}][label]`, l.label);
                formData.append(`labels[${index}][id]`, l.id)
            })
        }
        let response = await apiUpdate(dataParent.id, formData)
        if (response.status) {
            showNotify('notification', response.message)
            this.getList()
        } else {
            showNotify('notification', response.message, 'error')
        }

    }

    async submitFormModal() {
        let values = this.formModalRef.current.getFieldsValue();
        const { t } = this.props;
        let formData = new FormData();
        formData.append('module', values.module);
        formData.append('key', values.key);
        //locale vi
        formData.append(`labels[0][locale]`, 'en');
        formData.append(`labels[0][label]`, values.label1)
        //locale en
        formData.append(`labels[1][locale]`, 'vi');
        formData.append(`labels[1][label]`, values.label2)
        let response = await apiUpdate(0, formData)
        if (response.status) {
            showNotify(t('notification'), response.message)
            this.getList()
            this.setState({ visible: false })
        } else {
            showNotify(t('notification'), response.message, 'error')
        }
    }
    async handleCombine() {
        const { t } = this.props;
        try {
            this.setState({ loading: true });
            let response = await apiCombine();
            if (response.message) {
                showNotify(t('notification'), response.message);
                this.getList();
                this.setState({ loading: false });
            } else {
                showNotify(t('notification'), response.message, 'error');
            }
        } catch (error) {
            this.setState({ loading: false });
            showNotify(t('notification'), 'An error occurred while combining', 'error');
        }
    }
    /**
   * On change page
   * @param {*} page 
   */
    onChangePage = page => {
        let values = this.formRef.current.getFieldsValue();
        this.setState({ offset: (page - 1) * this.state.limit }, () => this.getList({ ...values }));
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
     * @event submit file import
     */
    async handleImportUpload() {
        this.setState({ loading: true });
        let { t, history } = this.props;
        const { file } = this.state;
        const formData = new FormData();
        formData.append('file', file);
        let xhr = await apiImportFile(formData);
        if (xhr.status == 1) {
            showNotify(t('notification'), t('Import Done!'), 'success', 1, () => history.go(0));
        } else {
            showNotify(t('notification'),
                <>
                    <span>{xhr.message}</span><br />
                    <span>success rows : {xhr.data.success_rows}</span><br />
                    <span>fail rows : {xhr.data.fail_rows}</span>
                </>
                , 'error',);
        }
        this.setState({ visibleConfirmUpload: false, loading: false });
        return false;
    }
    handleSubmitModal() {
        this.formModalRef.current
            .validateFields()
            .then((values) => {
                this.submitFormModal(values);
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });

    }
    onDelete(data) {
        let { t } = this.props;
        let xhr = destroy(data.id)
            .then(res => {
                if (res.status) {
                    showNotify(t('notification'), 'Deleted success!')
                    let values = this.formRef.current.getFieldsValue()
                    this.getList(values)
                } else {
                    showNotify(t('notification'), res.message, 'error')
                }
            })
            .catch(err => console.log(err))
    }
    async exportDatas(){
        let { t } = this.props;
        let values = this.formRef.current.getFieldsValue();
        let params = {
            ...values,
            limit : -1 
        }
        this.setState({ loading: true });
        let response = await apiList(params)
        if(response.status){
            let header = formatHeader()
            let data = formatData(response.data.rows);
            let fileName = `Language-${dayjs().format('YYYY-MM-DD')}`;
            let datas = [...header, ...data];
            exportToXLS(fileName, datas,[{width: 10} ,{width: 10} ,{width: 20} ,{width: 25} ,{width: 25}]);
            this.setState({ loading: false });

        }else{
            showNotify(t('notification'),response.message, 'error')
            this.setState({ loading: false });
        }

    }
    render() {
        const { t } = this.props
        const columns = [
            {
                title: 'No.',
                render: r => this.state.datas.indexOf(r) + 1,
                width: '5%'
            },
            {
                title: t('module'),
                dataIndex: 'module',
                width: '10%',
                // editable: true,
            },
            {
                title: t('key'),
                dataIndex: 'key',
                width: '20%',
                // editable: true,
            },
            {
                title: t('hr:tool_language_label'),
                render: r => {
                    if (!r.labels) {
                        return;
                    }
                    const columnsLabel = [
                        {
                            title: t('location'),
                            render: r => <img width={18} src={this.getFLag(r.locale)} />,
                            align: 'center',
                            width: '20%'
                        },
                        {
                            title: 'tool_language_label',
                            dataIndex: 'label',
                            editable: true,
                        },
                    ]
                    const componentsLabels = {
                        body: {
                            row: EditableRow,
                            cell: EditableCell,
                        },
                    };
                    const myColumnsLabels = columnsLabel.map((col) => {
                        if (!col.editable) {
                            return col;
                        }

                        return {
                            ...col,
                            onCell: (record) => ({
                                dataParent: r,
                                record,
                                editable: col.editable,
                                dataIndex: col.dataIndex,
                                title: col.title,
                                handleSave: this.handleSaveLabels,
                            }),
                        };
                    });
                    return <div className=''>
                        <Table
                            loading={this.state.loading}
                            columns={myColumnsLabels}
                            dataSource={r.labels}
                            size='small'
                            pagination={false}
                            components={componentsLabels}
                        /> </div>
                }
            },
            {
                title: t('action'),
                align: 'center',
                render: r => (
                    <>
                        {checkPermission('hr-setting-language-import') && (
                            <DeleteButton onConfirm={() => this.onDelete(r)} />
                        )}
                    </>
                )
            }
        ]

        const components = {
            body: {
                row: EditableRow,
                cell: EditableCell,
            },
        };
        const myColumns = columns.map((col) => {
            if (!col.editable) {
                return col;
            }

            return {
                ...col,
                onCell: (record) => ({
                    record,
                    editable: col.editable,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    handleSave: this.handleSave,
                }),
            };
        });
        return (
            <div>
                <PageHeader title={t('languages')}
                    tags={
                        checkPermission('hr-setting-language-create') ?
                            <Button type='primary' icon={<FontAwesomeIcon icon={faPlus} />} onClick={() => {
                                this.setState({ visible: true }, () => this.formModalRef.current.resetFields())
                            }}>&nbsp;{t('add_new')}</Button> : null
                    }
                    extra={
                        <Popconfirm
                            title="Confirm import skill?"
                            open={this.state.visibleConfirmUpload}
                            onConfirm={() => this.handleImportUpload()}
                            onCancel={() => this.setState({ visibleConfirmUpload: false, file: null, fileList: [] })}
                            okText="Yes"
                            cancelText="No"
                            placement="bottomRight"
                        ><Upload key="import-upload" accept=".csv, .xls, .xlsx"
                            beforeUpload={this.beforeUpload.bind(this)}
                            onRemove={this.onRemove} fileList={this.state.fileList}>
                                {
                                    checkPermission('hr-setting-language-import') ?
                                        <Button key="import-upload" type="danger" style={{ marginRight: 'auto' }}
                                            icon={<FontAwesomeIcon icon={faPaperclip} />}>
                                            &nbsp;{t('import_file')}
                                        </Button>
                                        : null
                                }

                            </Upload >
                        </Popconfirm >}
                />
                < div className='card pl-3 pr-3 mb-3' >
                    <Form
                        className="pt-3"
                        ref={this.formRef}
                        name="searchStaffForm"
                        onFinish={v => this.submitForm(v)}
                        layout="vertical"
                    >
                        <Row gutter={12}>
                            <Col span={6}>
                                <Form.Item name='module'>
                                    <Input placeholder='module' />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name='key'>
                                    <Input placeholder='Key' />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name='label'>
                                    <Input placeholder='Label' />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Button type="primary" htmlType="submit">
                                    {t('search')}
                                </Button>
                                <Button style={{ marginLeft: 6 }} type="primary" onClick={()=>this.handleCombine()}>
                                    {t('hr:tool_language_combine')}
                                </Button>
                                <Button className='ml-2' type="primary" onClick={() => this.exportDatas()} >
                                    {t('export')}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </div >
                <Table
                    rowKey={'id'}
                    columns={myColumns}
                    dataSource={this.state.datas}
                    components={components}
                    pagination={{
                        pageSize: this.state.limit,
                        showSizeChanger: false,
                        onChange: page => this.onChangePage(page),
                        current: (this.state.offset / this.state.limit) + 1,
                        total: this.state.total
                    }}
                />
                <Modal
                    title={t('add_new')}
                    open={this.state.visible}
                    onCancel={() => this.setState({ visible: false })}
                    onOk={() => this.handleSubmitModal()}
                    width={'60%'}
                >
                    <Form ref={this.formModalRef} layout='vertical'>
                        <Row gutter={24}>
                            <Col span={6}>
                                <Form.Item label={t('hr:module')} name={'module'}
                                    hasFeedback 
                                    rules={[{ required: true, message: t('hr:form_input_module') }]}>
                                    <Input placeholder={t('hr:module')} />
                                </Form.Item>
                            </Col>
                            <Col span={6} >
                                <Form.Item label={t('key')} name={'key'} hasFeedback
                                    rules={[{ required: true, message: t('hr:form_input_key') }]}>
                                    <Input placeholder='key' />
                                </Form.Item>

                            </Col>
                            <Col span={12}>
                                <Row gutter={24}>
                                    <Col span={12}>
                                        <div>
                                            <Form.Item>
                                                <img width={18} src={this.getFLag('en')} />
                                            </Form.Item>
                                        </div>
                                        <div>
                                            <Form.Item label={t('location')} >
                                                <img width={18} src={this.getFLag('vi')} />
                                            </Form.Item>
                                        </div>

                                    </Col>
                                    <Col span={12}>
                                        <div>
                                            <Form.Item label={t('tool_language_label')} name={'label1'} hasFeedback
                                                rules={[{ required: true, message: t('hr:form_input_label_en') }]} >
                                                <Input placeholder='label EN' />
                                            </Form.Item>
                                        </div>
                                        <div>
                                            <Form.Item name={'label2'} hasFeedback
                                                rules={[{ required: true, message: t('hr:form_input_label_vi') }]} >
                                                <Input placeholder='label VI' />
                                            </Form.Item>
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Form>
                </Modal >
            </div >
        )
    }
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(languageV2)