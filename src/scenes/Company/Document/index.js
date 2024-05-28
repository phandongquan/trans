import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Form, Image, Table, Row, Col, Input } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faPen, faPlus, faSearch, faFileExport } from '@fortawesome/free-solid-svg-icons';
import documentApi, { deleteDocument } from '~/apis/company/document';
import { Link } from 'react-router-dom';
import { checkPermission, exportToXLS, historyParams, historyReplace, parseIntegertoTime, showNotify, timeFormatStandard } from '~/services/helper';
import DeleteButton from '~/components/Base/DeleteButton';
import { imageDefault, screenResponsive } from '~/constants/basic';
import Dropdown from '~/components/Base/Dropdown';
import Tab from '~/components/Base/Tab';
import constTablist from '../config/tabListDocument';
import ExportXLSButton from '~/components/Base/ExportXLSButton';
import dayjs from 'dayjs';
import { getHeader, formatData } from '~/scenes/Company/Document/config/DocumentExcel';
import CreateUpdateDate from '~/components/Base/CreateUpdateDate';
import SkillDropdown from '~/components/Base/SkillDropdown';
import { mainTypeDocument } from "./config";

const FormItem = Form.Item;
const dateFormat = 'HH:mm DD/MM/YY';

class Documents extends Component {

    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        let params = historyParams();
        this.state = {
            loading: false,
            documents: [],
            categories: {},
            status: {},
            types: {},
            limit: params.limit ? Number(params.limit) : 30 ,
            page: params.offset ? ((Number(params.offset)/Number(params.limit)) + 1)  : 1,
            total: 0
        };
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        let params = historyParams();
        this.formRef.current.setFieldsValue(params)
        let values = this.formRef.current.getFieldsValue();
        if(this.props.location.search) {
            let skillId = this.props.location.search.split('?skill_id=')[1];
            params = {
                ...params,
                skill_id: skillId
            }
        }
        params = {
            ...params,
            ...values
        }
        this.getDocument(params);
    }

    /**
     * event click btn search
     * @param {*} e 
     */
    submitForm = (values) => {
        this.setState({ page: 1}, () => this.getDocument(values))
    }

    /**
     * Get list document
     * @param {Object} params 
     */
    getDocument = (values) => {
        this.setState({ loading: true });
        values.limit = this.state.limit;
        values.offset = this.state.limit * (this.state.page - 1)
        historyReplace(values);
        let xhr = documentApi.getDocument(values);
        xhr.then((response) => {
            if (response.status) {
                let { data } = response;
                this.setState({
                    loading: false,
                    documents: data.rows,
                    categories: data.categories,
                    types: data.document_type,
                    status: data.document_status,
                    total: data.total
                });
                
            }
        });
    }
    /**
     * @event delete Document
     * @param {} e 
    */
    confirmDelete(e, id) {
        e.stopPropagation();
        let { t } = this.props;
        let xhr = deleteDocument(id);
        xhr.then((response) => {
            if (response.status) {
                showNotify(t('hr:notification'), t('Deleted successfully!'));
                let values = this.formRef.current.getFieldsValue();
                this.getDocument(values);
            }
        });
    }
    
    /**
     * Format data to excel
    */
   formatExportCell() {
       let { baseData } = this.props;
       let { status } = this.state;
       let header = getHeader();
        let data = formatData(this.state.documents, {...baseData, status});
        return [...header, ...data];
    }
    
    /**
     * Export document
    */
   exportDocument = async () => {
        let { baseData } = this.props;
        let { status } = this.state;
        let values = this.formRef.current.getFieldsValue();
        values.limit = 0;
        values.offset = 0;
        this.setState({ loading: true });
        let response = await documentApi.getDocument(values);
        if(response.status) {
            this.setState({ loading: false });
            let header = getHeader();
            let data = formatData(response.data.rows, {...baseData, status});
            let datas = [...header, ...data];
            let fileName=`Document-${dayjs().format('YYYY-MM-DD')}`
            return exportToXLS(fileName, datas)
        }
    }

    /**
     * On change page
     * @param {*} page 
    */
   onChangePage = page => {
        this.setState({ page }, () => {
            let values = this.formRef.current.getFieldsValue();
            this.getDocument(values)
        })
    }
    
    /**
     * @render
    */
   render() {
       const { t, auth: { profile }, baseData: { departments, users } } = this.props;
       let { categories, types, status } = this.state;
    //    console.log(types)
       const columns = [
            {
                title: t('hr:title'),
                render: r => {
                    return (
                        <>
                            <Link to={`/company/document/${r.id}/edit`} >{r.title}</Link>
                            <small>({r.document_code})</small> <br />
                            {
                                r.category_id ?
                                    <small>Category: {Object.keys(categories).map(key => key == r.category_id && categories[key])}</small>
                                    : []
                            }
                        </>
                    )
                },
            },
            {
                title: t('hr:thumbnail'),
                render: r => <Image
                    src={typeof r.image_full != 'undefined' ? r.image_full : r.image}
                    width={100}
                    height={70}
                    fallback={imageDefault}
                />
            },
            {
                title: t('hr:dept'),
                dataIndex: 'department_id',
                render: dep_id => departments.map(d => dep_id == d.id && d.name),
                align: 'center'
            },
            {
                title: t('hr:skill'),
                render: r => <Link to={`/company/skill/${r.skill?.id}/edit`} target='_blank'>{r.skill?.name}</Link> 
                // {
                //     let skill = r.skill;
                //     if (typeof skill == 'undefined' || skill.length <= 0) return [];
                //     let result = [];
                //     skill.map(obj => result.push(obj.name));
                //     return result.join(',');
                // }
            },
            {
                title: t('hr:rating'),
                dataIndex: 'rating_avg',
                align: 'center'
            },
            {
                title: t('hr:view_counter'),
                dataIndex: 'view_counter',
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
                                typeof r.verify_at == 'string' && r.verify_at != '-0001-11-30 00:00:00' ?
                                    `Verify: ${timeFormatStandard(r.verify_at, dateFormat)}` :
                                    r.verify_at && (r.verify_at > 0) ?
                                        `Verify: ${parseIntegertoTime(r.verify_at, dateFormat)}` : ''
                            }
                        </small>
                    }
                    {
                        r.verify_by > 0 &&
                        <small>
                            &nbsp;By {r.verify_by_user?.staff_name}
                        </small>
                    }
                    {
                        <small>
                            <br />
                            {
                                typeof r.published_at == 'string' && r.published_at != '-0001-11-30 00:00:00' ?
                                    `Approved: ${timeFormatStandard(r.published_at, dateFormat)}` :
                                    r.published_at && (r.published_at > 0) ?
                                        `Approved: ${parseIntegertoTime(r.published_at, dateFormat)}` : ''
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
            {
                title: t('hr:status'),
                dataIndex: 'status',
                render: status_id => status[status_id]
            },
            {
                title: t('hr:action'),
                render: r => {
                    return (
                        <>
                            <Link to={`/company/document/` + r.id + `/edit`} style={{ marginRight: 8 }}>
                                {
                                    checkPermission('hr-document-update')  ?
                                    <Button type="primary" size='small'
                                    icon={<FontAwesomeIcon icon={faPen} />}>
                                    </Button>
                                    : ""
                                }

                            </Link>
                            { r.user_id == profile.id && r.status == 1 ?
                                <DeleteButton onConfirm={(e) => this.confirmDelete(e, r.id)} />
                            : []} 
                        </>
                    );
                }
            }
        ];

        return (
          <div>
            <PageHeader
              title={t("hr:document")}
              tags={[
                <Link to={`/company/document/create`} key="create-staff">
                  {checkPermission("hr-document-create") ? (
                    <Button
                      key="create-document"
                      type="primary"
                      icon={<FontAwesomeIcon icon={faPlus} />}
                    >
                      &nbsp;{t("hr:add_new")}
                    </Button>
                  ) : (
                    ""
                  )}
                </Link>,
              ]}
            />

            <Row className="card mb-3 pl-3 pr-3">
              <Tab tabs={constTablist(this.props)} />
              <Form
                className="pt-3"
                name="searchDocumentForm"
                ref={this.formRef}
                onFinish={this.submitForm.bind(this)}
              >
                <Row gutter={12}>
                  <Col xs={24} sm={24} md={24} lg={6} xl={6} key="q">
                    <FormItem name="q">
                      <Input placeholder={t("Document Code, Title")}></Input>
                    </FormItem>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6} xl={6} >
                    <FormItem name="main_type">
                    <Dropdown
                       datas={mainTypeDocument}
                       defaultOption="-- All Main Type --"
                      />
                    </FormItem>
                  </Col>
                  <Col
                    xs={24}
                    sm={24}
                    md={24}
                    lg={6}
                    xl={6}
                    key="department_id"
                  >
                    <FormItem name="department_id">
                      <Dropdown
                        datas={departments}
                        defaultOption="-- All Departments --"
                      />
                    </FormItem>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                    <FormItem name="skill_id">
                      <SkillDropdown defaultOption="-- All Skills --" />
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={12}>
                  <Col xs={24} sm={24} md={24} lg={4} xl={4} key="category_id">
                    <FormItem name="category_id">
                      <Dropdown
                        datas={categories}
                        defaultOption="-- All Categories --"
                      />
                    </FormItem>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                    <FormItem name="type_id">
                      <Dropdown datas={types} defaultOption="-- All Types --" />
                    </FormItem>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                    <FormItem name="status">
                      <Dropdown
                        datas={status}
                        defaultOption="-- All Status --"
                      />
                    </FormItem>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                    <FormItem>
                      <Button
                        type="primary"
                        htmlType="submit"
                        className="mr-2"
                        icon={<FontAwesomeIcon icon={faSearch} />}
                      >
                        &nbsp;{t("hr:search")}
                      </Button>
                      {checkPermission("hr-document-export") ? (
                        <Button
                          type="primary"
                          icon={<FontAwesomeIcon icon={faFileExport} />}
                          onClick={() => this.exportDocument()}
                        >
                          &nbsp;{t("hr:export")}
                        </Button>
                      ) : (
                        ""
                      )}
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            </Row>
            <Row gutter={[16, 24]}>
              <Col span={24}>
                {window.innerWidth < screenResponsive ? (
                  <div className="block_scroll_data_table">
                    <div className="main_scroll_table">
                      <Table
                        dataSource={this.state.documents}
                        columns={columns}
                        loading={this.state.loading}
                        rowKey={(document) => document.id}
                        pagination={{
                          current: this.state.page,
                          pageSize: this.state.limit,
                          total: this.state.total,
                          onChange: (page) => this.onChangePage(page),
                          showSizeChanger: false,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <Table
                    dataSource={this.state.documents}
                    columns={columns}
                    loading={this.state.loading}
                    rowKey={(document) => document.id}
                    pagination={{
                      current: this.state.page,
                      pageSize: this.state.limit,
                      total: this.state.total,
                      onChange: (page) => this.onChangePage(page),
                      showSizeChanger: false,
                    }}
                  />
                )}
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Documents));
