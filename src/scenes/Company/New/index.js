import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Table, Row, Col, Form, Input, Image } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen } from '@fortawesome/free-solid-svg-icons';
import { getList as apiGetList, destroy as apiDelete } from '~/apis/company/new';
import { Link } from 'react-router-dom';
import Tab from '~/components/Base/Tab';
import Dropdown from '~/components/Base/Dropdown';
import { dateTimeFormat, staffStatus as arrStatus } from '~/constants/basic';
import DeleteButton from '~/components/Base/DeleteButton';
import { showNotify, parseIntegertoTime, checkPermission } from '~/services/helper';
import tabList from '~/scenes/Company/New/config/tab';
import { imageDefault, screenResponsive } from '~/constants/basic';

const FormItem = Form.Item;
const FormatDate = 'HH:mm DD/MM/YY ';

class New extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            news: []
        };
    }

    /**
     * @lifecycle 
     */
    componentDidMount() {
        this.getNews();
    }

    /**
     * Get list new
     * @param {} params 
     */
    getNews = (params = {}) => {
        this.setState({ loading: true });
        let xhr = apiGetList(params);
        xhr.then((response) => {
            if (response.status) {
                let { data } = response;
                this.setState({ 
                    loading: false,
                    news: data.rows,
                });
            }
        });
    }

    /**
     * @event submit form
     * @param {Object} values 
     */
    submitForm = (values) => {
        this.getNews(values);
    }

    /**
     * Delete new
     * @param {*} e 
     * @param {*} id 
     */
    onDeleteNew = (e, id) => {
        let { t } = this.props;
        e.stopPropagation();
        let xhr = apiDelete(id);
        xhr.then((response) => {
            if (response.status) {
                let values = this.formRef.current.getFieldsValue();
                this.getNews(values);
                showNotify(t('Notification'), t('New has been removed!'));
            } else {
                showNotify(t('Notification'), response.message);
            }
        }).catch(error => {
            showNotify(t('Notification'), t('Server has error!'));
        });
    }

    /**
     * @render
     */
    render() {
        let { t } = this.props;
        const columns = [
            {
                title: t('No.'),
                render: r => this.state.news.indexOf(r) + 1 
            },
            {
                title: t('hr:title'),
                dataIndex: 'title'
            },
            {
                title: t('hr:image'),
                render: r => 
                    <Image
                        src={typeof r.image != 'undefined' ? r.image : r.image}
                        width={100}
                        height={70}
                        fallback={imageDefault}
                    /> 
            },
            {
                title: t('hr:status'),
                render: r => r.status && arrStatus[r.status]
            },
            {
                title: t('hr:created_at'),
                render: r => parseIntegertoTime( r.created, dateTimeFormat )
            },
            {
                title: t('hr:action'),
                render: r => {
                    return (<>
                            {
                            checkPermission("hr-job-new-update") ? 
                            <Link to={`/company/news/${r.id}/edit`} style={{ marginRight: 8 }} >
                                <Button type="primary" size='small' icon={<FontAwesomeIcon icon={faPen}/>} />
                            </Link> : ""
                            }
                            {
                            checkPermission("hr-job-new-delete") ?
                             <DeleteButton onConfirm={(e) => this.onDeleteNew(e, r.id)}/> : ""
                            }
                        </>)
                },
                align: 'center',
                width: '10%'
            }
        ]

        return (
            <div>
                <PageHeader
                    title={t('news')}
                    tags={<Link to="/company/news/create">
                        {checkPermission("hr-job-new-create") ? 
                            <Button key="create-staff" type="primary" icon={<FontAwesomeIcon icon={faPlus} />}>
                                &nbsp;{t('hr:add_new')}
                            </Button> : ""
                        }
                    </Link>}
                />
                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={tabList(this.props)}></Tab>
                    <Form
                        className="pt-3"
                        ref={this.formRef}
                        name="searchStaffForm"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical"
                    >
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <FormItem name="title">
                                    <Input placeholder={t('Title')} />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <FormItem name="status" >
                                    <Dropdown datas={arrStatus} defaultOption="-- All Status --" />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} key='submit'>
                                <FormItem>
                                    <Button type="primary" htmlType="submit">
                                        {t('hr:search')}
                                    </Button>
                                </FormItem>
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
                                        dataSource={this.state.news}
                                        columns={columns}
                                        loading={this.state.loading}
                                        pagination={{ pageSize: 15 }}
                                        rowKey={r => r.id}
                                    />
                                </div>
                            </div>
                            :
                            <Table
                                dataSource={this.state.news}
                                columns={columns}
                                loading={this.state.loading}
                                pagination={{ pageSize: 15 }}
                                rowKey={r => r.id}
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(New));
