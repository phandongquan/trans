import React, { Component, useContext, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Button, Table, Row, Col, Space, Form, Input, Modal, Tag, Image } from "antd";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen } from '@fortawesome/free-solid-svg-icons';
import DeleteButton from '~/components/Base/DeleteButton';
import { PageHeader } from '@ant-design/pro-layout';
import { showNotify, timeFormatStandard } from '~/services/helper';
import { dateTimeFormat } from '~/constants/basic';
import Dropdown from '~/components/Base/Dropdown';
import { CameraOutlined } from '@ant-design/icons';
import { Upload } from 'antd';
import { CATEGORIES_SP, MAJORS, formatDataFileXLSX } from './consts';
import { getDocument } from '~/apis/company/document';
import { createAnalysisImage, getListAnalysisImage, deleteAnalysisImage, getOneAnalysisImage, updateAnalysisImage, importFileXLSX, getListAnalysisImageByImage } from '~/apis/aiAnalysisImage';
import XLSX from 'xlsx';
import './styles/style.scss'
export class AnalysisImageComponent extends Component {
    /**
    * 
    * @param {*} props 
    */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.searchFormRef = React.createRef();
        this.fileImportRef = React.createRef();
        this.imageRef = React.createRef();
        this.state = {
            loading: false,
            visiblePopup: false,
            listDocuments: {
                rows: [],
                meta_data: {}
            },
            limit: 10,
            page: 1,
            selectedRowKeys: [],
            detail: null,
            documents: [],
            files: [],
            btnLoading: false,
            removeFile: [],
            previewOpen: false,
            previewTitle: '',
            previewImage: ''
        };
    }

    /**
     * @lifecycle 
     */
    componentDidMount() {
        this.getList();
        this.getDocuments();
    }

    getList = (params = {}) => {
        this.setState({ loading: true });
        const newParams = {
            ...params,
            limit: this.state.limit,
            page: params.page || 1
        }
        let xhr = getListAnalysisImage(newParams);
        xhr.then((response) => {
            if (response.status) {
                let { data } = response;
                this.setState({
                    loading: false,
                    listDocuments: data
                });
            }
        });
    }

    getDocuments = () => {
        const params = { status: 3, limit: 1000, offset: 0 };
        getDocument(params).then((res) => {
            if (res.status) {
                this.setState({
                    documents: res.data.rows
                })
            }
        })
    }

    onImportFileXLSX = () => this.fileImportRef.current.click();
    onImportFileImage = () => this.imageRef.current.click();

    onImportFile = async (e) => {
        this.setState({ btnLoading: true })
        const file = e.target.files[0];
        if (file) {
            const fileReader = await new FileReader()
            fileReader.readAsArrayBuffer(file)

            fileReader.onload = (e) => {
                const bufferArray = e?.target.result
                const wb = XLSX.read(bufferArray, { type: "buffer" })
                const sheetNames = wb.SheetNames
                const datas = {}
                sheetNames.forEach(sheet => {
                    datas[sheet] = XLSX.utils.sheet_to_json(wb.Sheets[sheet])
                })
                const newData = formatDataFileXLSX(datas)
                importFileXLSX(newData).then((res) => {
                    if (res.status) {
                        this.getList();
                        showNotify('success', res.message);
                    }
                    this.fileImportRef.current.value = null;
                    this.setState({ btnLoading: false })
                })
            }
        }
    }

    getDocumentByImage = async (e) => {
        this.setState({ btnLoading: true })
        const file = this.imageRef.current.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            const xhr = await getListAnalysisImageByImage(formData);
            if (xhr.status) {
                const { data } = xhr;
                this.setState({
                    listDocuments: data,
                    btnLoading: false
                })
            }
        }
    }

    onChangePage = page => {
        const { limit } = this.state;
        this.getList({ limit, page });
    }

    onCreateDocument = async params => {
        const { files, detail, removeFile } = this.state;
        const formData = new FormData();

        for (let key in params) {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                formData.append(key, params[key]);
            }
        }

        if (files?.length) {
            files.forEach(file => {
                formData.append('files[]', file);
            })
        }

        let xhr;
        if (detail) {
            if (this.state.removeFile.length) {
                removeFile.forEach(item => {
                    formData.append('remove_files[]', item);
                })
            }
            xhr = await updateAnalysisImage({ id: detail.id, data: formData });
        } else {
            xhr = await createAnalysisImage(formData);
        }

        if (xhr.status) {
            this.getList();
            showNotify('success', xhr.message);
            this.setState({ visiblePopup: false, files: [], detail: null })
            this.formRef.current.resetFields()
        }
    }

    handleCancel = () => {
        this.setState({ previewOpen: false, previewTitle: '', previewImage: '' });
    }

    render() {
        let { t, baseData: { departments } } = this.props;
        let { listDocuments, visiblePopup, limit, documents = [], detail, previewOpen, previewImage } = this.state;
        let { rows = [], meta_data = {} } = listDocuments;
        let { total = 0, page = 1 } = meta_data;

        const columns = [
            {
                title: t('SKU'),
                dataIndex: 'sku',
                width: 150
            },
            {
                title: t('Product name'),
                dataIndex: 'product_name',
                width: 200
            },
            {
                title: t('Image'),
                width: 300,
                render: r => {
                    if (r.image_url) {
                        return <Image
                            width={80}
                            height={80}
                            src={r.image_url[0].url_full}
                            alt='Image'
                        />
                    }
                }
            },
            {
                title: t('Explaining'),
                dataIndex: 'explaining',
                width: 500
            },
            {
                title: t('Suggestion action'),
                dataIndex: 'suggestion_action',
                width: 500
            },
            {
                title: t('Category SP'),
                width: 150,
                render: r => {
                    return r.category_sp ? CATEGORIES_SP[r.category_sp].name : ''
                }
            },
            {
                title: t('Error Code'),
                dataIndex: 'error_code',
                width: 150
            },
            {
                title: t('Document code'),
                render: r => {
                    if (!r.document_code) return null;
                    return r.document_code.map((item, index) => {
                        const { documents } = this.state;
                        const document = documents.find(doc => doc.id.toString() === item);
                        return <Tag key={index} >{document?.title}</Tag>
                    })
                },
                width: 200
            },
            {
                title: t('Department'),
                render: r => {
                    if (!r.department_id) return null;
                    return r.department_id.map((item, index) => {
                        const { departments } = this.props.baseData;
                        const department = departments.find(doc => doc.id.toString() === item);
                        return <Tag key={index} >{department?.name}</Tag>
                    })
                },
                width: 200
            },
            {
                title: t('Last modified'),
                render: r => {
                    const { created_by: { staff_name } } = r;
                    let modified = <div>
                        <span className='d-block' >
                            By: {staff_name}
                        </span>
                        <span className='d-block' >
                            Created: {timeFormatStandard(r.created_at, dateTimeFormat)}
                        </span>
                        <span className='d-block' >
                            Updated: {timeFormatStandard(r.updated_at, dateTimeFormat)}
                        </span>
                    </div>
                    return modified;
                },
                width: 500
            },
            {
                title: t('Action'),
                render: r => {
                    return (<Space size={5}>
                        <Button type="primary" size='small'
                            onClick={() => {
                                const { id } = r;
                                let xhr = getOneAnalysisImage(id);
                                xhr.then((response) => {
                                    if (response.status) {
                                        let { data } = response;
                                        if (data.image_url) {
                                            data.image_url = data.image_url.map(item => {
                                                return {
                                                    uid: item.url_short,
                                                    name: item.url_short,
                                                    status: 'done',
                                                    url: item.url_full
                                                }
                                            })
                                        }
                                        this.setState({
                                            visiblePopup: true,
                                            detail: data,
                                            files: data.image_url ? data.image_url : []
                                        })
                                        this.formRef.current.setFieldsValue(data);
                                    }
                                });
                            }}
                            icon={<FontAwesomeIcon icon={faPen} />}>
                        </Button>
                        <DeleteButton onConfirm={(e) => {
                            const { id } = r;
                            let xhr = deleteAnalysisImage(id);
                            xhr.then((response) => {
                                if (response.status) {
                                    showNotify('success', t('Deleted successfully!'));
                                    this.getList();
                                }
                            });
                        }} />
                    </Space>)
                },
                width: 100,
                align: 'center',
            }
        ].map((item) => {
            return {
                ...item,
                onCell: (record) => ({
                    record,
                    dataIndex: item.dataIndex,
                    title: item.title,
                    handleSave: this.handleSave,
                }),
            }
        })

        return (
            <>
                <PageHeader
                    title={t('AI Image Analysis Training')}
                    tags={<Space size="small">
                        {
                            <Button key="create-question-cb" onClick={() => this.setState({ visiblePopup: true })} type="primary" icon={<FontAwesomeIcon icon={faPlus} />}>
                                &nbsp;{t('add_new')}
                            </Button>
                        }
                    </Space>}
                />
                <Row className="card pl-3 pr-3 mb-3">
                    <Form
                        className="pt-3"
                        ref={this.searchFormRef}
                        name="searchStaffForm"
                        onFinish={(values) => this.getList(values)}
                        layout="vertical"
                    >
                        <Row gutter={[8, 8]}>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name="keyword">
                                    <Input placeholder="Keyword" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name="category_sp">
                                    <Dropdown datas={CATEGORIES_SP} defaultOption="-- All Category SP --" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} key='submit'>
                                <Form.Item>
                                    <Space
                                        size={8}
                                    >
                                        <Button type="primary" htmlType="submit">
                                            {t('Search')}
                                        </Button>
                                        <Button
                                            type="primary"
                                            onClick={() => this.onImportFileXLSX()}
                                            loading={this.state.btnLoading}
                                        >
                                            {t('Import File')}
                                        </Button>
                                        <Button
                                            type="primary"
                                            onClick={() => this.onImportFileImage()}
                                            loading={this.state.btnLoading}
                                            icon={<CameraOutlined />}
                                        >
                                        </Button>
                                    </Space>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        <Table
                            components={{}}
                            dataSource={rows}
                            columns={columns}
                            loading={this.state.loading}
                            rowKey={(row) => row.id}
                            scroll={{
                                x: 1500
                            }}
                            pagination={{
                                total: total,
                                pageSize: limit,
                                hideOnSinglePage: true,
                                showSizeChanger: false,
                                current: page,
                                onChange: page => this.onChangePage(page)
                            }}
                        />
                    </Col>
                </Row>
                <Modal
                    title={detail ? 'Update Analysis Image' : 'Create Analysis Image'}
                    visible={visiblePopup}
                    okText={detail ? 'Update' : 'Create'}
                    cancelText="Cancel"
                    onOk={() => { this.formRef.current.submit() }}
                    onCancel={() => {
                        this.setState({ visiblePopup: false, files: [], detail: null })
                        this.formRef.current.resetFields()
                    }}
                    afterClose={() => {
                        this.setState({ visiblePopup: false, files: [], detail: null })
                        this.formRef.current.resetFields()
                    }}
                    width={'70%'}
                >
                    <Form ref={this.formRef} name="form_in_modal" className="form-in-modal" onFinish={this.onCreateDocument}>
                        <div className='analysis-training' >
                            <div className='top-block' >
                                <div className='left-block' >
                                    <div className='image-block' >
                                        <Upload
                                            listType="picture-card"
                                            fileList={this.state.files}
                                            accept=".jpg,.jpeg,.png"
                                            maxCount={1}
                                            onPreview={async (file) => { this.setState({ previewOpen: true, previewTitle: file.name, previewImage: file.url }) }}
                                            onChange={({ fileList }) => { }}
                                            onDrop={(e) => { }}
                                            onRemove={(file) => {
                                                const { files } = this.state;
                                                const newFiles = files.filter(item => item.uid !== file.uid);
                                                const url = file.url;
                                                this.setState({ files: newFiles, removeFile: [...this.state.removeFile, url] })
                                            }}
                                            beforeUpload={(file) => {
                                                const { files } = this.state;
                                                if (files.length >= 5) {
                                                    showNotify('Thông báo', 'Bạn chỉ được phép tải lên tối đa 5 file', 'error')
                                                    return false;
                                                }
                                                const newFiles = [...files, file];
                                                this.setState({ files: newFiles })
                                                return false;
                                            }}
                                        >
                                            {this.state.files.length < 5 && '+ Upload'}
                                        </Upload>
                                        <Modal
                                            open={previewOpen}
                                            footer={null}
                                            onCancel={this.handleCancel}
                                        >
                                            <img
                                                alt="example"
                                                style={{
                                                    width: '100%',
                                                }}
                                                src={previewImage}
                                            />
                                        </Modal>
                                    </div>
                                </div>
                                <div className='right-block' >
                                    <label className='label' >Error Code</label>
                                    <Form.Item
                                        name="error_code"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Please input your error code!',
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="Error code"
                                        />
                                    </Form.Item>
                                    <label className='label'>Explaining</label>
                                    <Form.Item
                                        name="explaining"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Please input your explaining!',
                                            },
                                        ]}
                                    >
                                        <Input.TextArea
                                            rows={4}
                                        />
                                    </Form.Item>
                                    <label className='label' >Suggestion action</label>
                                    <Form.Item
                                        name="suggestion_action"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Please input your suggestion action!',
                                            },
                                        ]}
                                    >
                                        <Input.TextArea
                                            rows={4}
                                        />
                                    </Form.Item>
                                </div>
                            </div>
                            <div className='center-block' >

                            </div>
                            <div className='center-block' >
                                <div className='left-block' >
                                    <label className='label' >SKU</label>
                                    <Form.Item
                                        name="sku"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Please input your SKU!',
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="SKU"
                                        />
                                    </Form.Item>
                                    <label className='label' >Category SP</label>
                                    <Form.Item
                                        name="category_sp"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Please input your category SP!',
                                            },
                                        ]}
                                    >
                                        <Dropdown
                                            datas={CATEGORIES_SP} defaultOption="-- All Category SP --"
                                        />
                                    </Form.Item>
                                    <label>Responsible staff</label>
                                    <Form.Item
                                        name="major"
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Please input your major!',
                                            },
                                        ]}
                                    >
                                        <Dropdown
                                            datas={MAJORS} defaultOption="-- All Major --"
                                            mode="multiple"
                                        />
                                    </Form.Item>
                                </div>
                                <div className='right-block' >
                                    <label>Document code</label>
                                    <Form.Item
                                        name="document_code"
                                    >
                                        <Dropdown
                                            datas={documents}
                                            defaultOption="-- All Document Code --"
                                            mode="multiple"
                                        />
                                    </Form.Item>
                                    <label>Department</label>
                                    <Form.Item
                                        name="department_id"
                                    >
                                        <Dropdown
                                            datas={departments}
                                            defaultOption="-- All Department --"
                                            mode="multiple"
                                        />
                                    </Form.Item>
                                </div>
                            </div>
                        </div>
                    </Form>
                </Modal>
                <input
                    type="file"
                    ref={this.fileImportRef}
                    style={{ display: 'none' }}
                    onChange={(e) => this.onImportFile(e)}
                />
                <input
                    type="file"
                    ref={this.imageRef}
                    style={{ display: 'none' }}
                    onChange={(e) => this.getDocumentByImage(e)}
                />
            </>
        );
    }
}
/**
 * Map redux state to component props
 * @param {Object} state 
 */
const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    }
}
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(AnalysisImageComponent)