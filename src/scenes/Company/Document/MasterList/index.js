import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Form, Table, Row, Col, Input } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import documentApi from '~/apis/company/document';
import { Link } from 'react-router-dom';
import { parseIntegertoTime, timeFormatStandard, exportToXLS, checkPermission } from '~/services/helper';
import { dateFormat,screenResponsive } from '~/constants/basic';
import Dropdown from '~/components/Base/Dropdown';
import Tab from '~/components/Base/Tab';
import constTablist from '~/scenes/Company/config/tabListDocument';
import { getHeader, formatData } from '../config/MasterListExcel';
import dayjs from 'dayjs';
class MasterListDocument extends Component {

    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            documents: [],
            types: {},
            categories: {}
        };
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        this.formRef.current.setFieldsValue({ department_id: 108 })
        let params = this.formRef.current.getFieldsValue();
        this.getDocument(params);
    }

    /**
     * event click btn search
     * @param {*} e 
     */
    submitForm = (values) => {
        this.getDocument(values);
    }

    /**
     * Get list document
     * @param {Object} params 
     */
    getDocument = (values) => {
        this.setState({ loading: true });
        values = {
            ...values,
            with_chapter: true,
            status: 3, // Document has status = published,
            limit: -1,
            offset: 0
        }

        let xhr = documentApi.getDocument(values);
        xhr.then((response) => {
            if (response.status) {
                let { data } = response;
                let arrTypes = [];
                this.setState({
                    loading: false,
                    documents: this.sortDataByType(data.rows),
                    types: data.document_type,
                    categories: data.categories
                });
            }
        });
    }

    /**
     * Sort data by type before format excel
     */
     sortDataByType = (datas) => {
        let arrSort = [4,3,5,6,1]; // Id document_type
        let result = []
        arrSort.map(s => {
            let dataFilter = datas.filter(d => d.type == s)
            result = [...result, ...dataFilter]
        })
        return result;
    }

    /**
     * Format export excel
     */
    formatExportExcel = async () => {
        this.setState({ loading: true });
        let { documents, types, categories } = this.state;
        let header = getHeader();
        let data = formatData(documents, { types, categories });
        let datas = [...header, ...data];
        let fileName = `Master-list-document-${dayjs().format('YYYY-MM-DD')}`
        exportToXLS(fileName, datas, [{width: 5}, {width: 20}, {width: 35}, null, {width: 60}])
        this.setState({ loading: false });
    }

    /**
     * @render
     */
    render() {
        const { t, baseData: { departments , users } } = this.props;
        let { types } = this.state;
        const columns = [
            {
                title: t('No.'),
                render: r => this.state.documents.indexOf(r) + 1
            },
            {
                title: t('hr:type'),
                render: r => types[r.type]
            },
            {
                title: t('hr:code'),
                dataIndex: 'document_code',
                align: 'center'
            },
            {
                title: t('hr:title'),
                render: r => <Link to={`/company/document/${r.id}/edit`} >{r.title}</Link>,
            },
            {
                title: t('hr:dept'),
                dataIndex: 'department_id',
                render: dep_id => departments.map(d => dep_id == d.id && d.name),
                align: 'center'
            },
            {
                title: t('hr:date'),
                width: '20%',
                render: r => <>
                    {
                        <small>
                            {
                                typeof r.created_at == 'string' && r.created_at != '-0001-11-30 00:00:00' ?
                                    `Created: ${timeFormatStandard(r.created_at, dateFormat)}` :
                                    r.created_at && (r.created_at > 0) ?
                                        `Created: ${parseIntegertoTime(r.created_at, dateFormat)}` : ''
                            }
                        </small>
                    }
                    {
                        r.user_id > 0 &&
                        <small>
                            &nbsp;By {r.user?.name}
                        </small>
                    }
                    {
                        <small>
                            <br />
                            {
                                typeof r.updated_at == 'string' && r.updated_at != '-0001-11-30 00:00:00' ?
                                    `Updated: ${timeFormatStandard(r.updated_at, dateFormat)}` :
                                    r.updated_at && (r.updated_at > 0) ?
                                        `Updated: ${parseIntegertoTime(r.updated_at, dateFormat)}` : ''
                            }
                        </small>
                    }
                    {
                        r.updated_by > 0 &&
                        <small>
                            &nbsp;By {r.updated_by_user?.name}
                        </small>
                    }
                    {
                        <small>
                            <br />
                            {
                                typeof r.published_at == 'string' && r.published_at != '-0001-11-30 00:00:00' ?
                                    `Published: ${timeFormatStandard(r.published_at, dateFormat)}` :
                                    r.published_at && (r.published_at > 0) ?
                                        `Published: ${parseIntegertoTime(r.published_at, dateFormat)}` : ''
                            }
                        </small>
                    }
                    {
                        r.published_by > 0 &&
                        <small>
                            &nbsp;By {r.published_by_user?.name}
                        </small>
                    }
                </>
            },
            // {
            //     title: 'Updated At',
            //     width: '10%',
            //     render: r => 
            //         r.updated_at && 
            //         <>
            //             {timeFormatStandard(r.updated_at, dateFormat)} 
            //             { r.updated_by && <small> By {r.updated_by_user.name} # {r.updated_by_user.id}</small>}
            //         </>
            // },
            {
                title: t('hr:revised_no'),
                render: r => r.revised_number,
                align: 'center'
            },
            // {
            //     title: 'Published At',
            //     width: '10%',
            //     render: r => 
            //         r.published_at &&
            //             <>
            //                 {parseIntegertoTime(r.published_at, dateFormat)}
            //                 { r.published_by && <small> By {r.published_by.name} # {r.published_by.id} </small> }
            //             </>
            // },
            {
                title: t('hr:distributed_dept'),
                render: r => {
                    if(r.distributed) {
                        let result = []
                        departments.map(d => {
                            if(r.distributed.includes(d.id)) {
                                result.push(d.name)
                            } 
                        })
    
                        return result.join(' , ')
                    }
                }
            }
        ];

        return (
            <div>
                <PageHeader
                    title={t('hr:document')}
                    tags={[
                        <Link to={`/company/document/create`} key="create-staff">
                            <Button key="create-document" type="primary" icon={<FontAwesomeIcon icon={faPlus} />}>
                                &nbsp;{t('hr:add_new')}
                            </Button>
                        </Link>
                    ]}
                />

                <Row className="card pr-1 mb-3 pl-3 pr-3">
                    <Tab tabs={constTablist(this.props)} />
                    <Form layout="vertical" className="pt-3"
                        name="searchDocumentForm"
                        ref={this.formRef}
                        onFinish={this.submitForm.bind(this)}>
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} key='type'>
                                <Form.Item name="type">
                                    <Dropdown datas={this.state.types} defaultOption={t('hr:all_type')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} key='department_id'>
                                <Form.Item name="department_id">
                                    <Dropdown datas={departments} defaultOption={t('hr:all_department')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" icon={<FontAwesomeIcon icon={faSearch} />}>
                                        &nbsp;{t('hr:search')}
                                    </Button>
                                    {
                                        checkPermission('hr-document-master-export') ? 
                                            <Button type='primary' icon={<FontAwesomeIcon icon={faFileExport} />} className='ml-2'
                                                onClick={() => this.formatExportExcel()}
                                            >
                                                &nbsp;{t('hr:export')}
                                            </Button>
                                        : ''
                                    }
                                </Form.Item>
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
                                        dataSource={this.state.documents}
                                        columns={columns} 
                                        loading={this.state.loading}
                                        rowKey={(document) => document.id}
                                        pagination={{ pageSize: 20, showSizeChanger: false }} 
                                    />
                                </div>
                            </div>
                            :
                            <Table 
                                dataSource={this.state.documents}
                                columns={columns} 
                                loading={this.state.loading}
                                rowKey={(document) => document.id}
                                pagination={{ pageSize: 20, showSizeChanger: false }} 
                            />
                        }
                    </Col>
                </Row>
            </div >
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(MasterListDocument));
