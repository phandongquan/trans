import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Table, Row, Col } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen } from '@fortawesome/free-solid-svg-icons';
import { getList as apiGetList, destroy as apiDelete } from '~/apis/company/new/categories';
import { Link } from 'react-router-dom';
import Tab from '~/components/Base/Tab';
import { dateTimeFormat, staffStatus as arrStatus, screenResponsive } from '~/constants/basic';
import DeleteButton from '~/components/Base/DeleteButton';
import { checkPermission, parseIntegertoTime, showNotify, timeFormatStandard } from '~/services/helper';
import tabList from '~/scenes/Company/New/config/tab';
import CategoryForm from '~/scenes/Company/New/Category/CategoryForm';

class Categories extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            categories: [],
            visibleAddNew: false,
            category_id: ''
        };
    }

    /**
     * @lifecycle 
     */
    componentDidMount() {
        this.getCategories();
    }

    /**
     * Get list categories
     * @param {} params 
     */
    getCategories = (params = {}) => {
        this.setState({ loading: true });
        let xhr = apiGetList(params);
        xhr.then((response) => {
            if (response.status) {
                let { data } = response;
                this.setState({ 
                    loading: false,
                    categories: data.rows,
                });
            }
        });
    }

    /**
     * Delete 
     * @param {*} e 
     * @param {*} id 
     */
    onDelete = (e, id) => {
        let { t } = this.props;
        e.stopPropagation();
        let xhr = apiDelete(id);
        xhr.then((response) => {
            if (response.status) {
                this.getCategories();
                showNotify(t('Notification'), t('Category has been removed!'));
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
        let { visibleAddNew, category_id } = this.state;
        const columns = [
            {
                title: t('No.'),
                render: r => this.state.categories.indexOf(r) + 1 
            },
            {
                title: t('hr:name'),
                dataIndex: 'name'
            },
            {
                title: t('hr:priority'),
                dataIndex: 'priority'
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
                        checkPermission('hr-job-new-categories-update') ? 
                            <Link
                                to=""
                                onClick={(e) => {
                                    e.preventDefault();
                                    this.setState({ visibleAddNew: true, category_id: r.id })
                                }}
                                style={{ marginRight: 8 }}
                            >
                                <Button type="primary" size='small' icon={<FontAwesomeIcon icon={faPen} />} />
                            </Link> : ""
                    }
                    {
                        checkPermission("hr-job-new-categories-delete") ? 
                                <DeleteButton onConfirm={(e) => this.onDelete(e, r.id)} /> : ""
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
                    title={t('hr:category')}
                    tags=
                    {checkPermission('hr-job-new-categories-create') ?<Button
                        onClick={() => this.setState({visibleAddNew: true})}
                        type="primary" 
                        icon={<FontAwesomeIcon icon={faPlus} />}
                    >
                        &nbsp;{t('hr:add_new')}
                    </Button> : ""
                    }
                />
                <Row className={window.innerWidth < screenResponsive  ? "card pl-3 pr-3 mb-3 pb-3" : "card pl-3 pr-3 mb-3"}>
                    <Tab tabs={tabList(this.props)}></Tab>
                </Row>
                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        {window.innerWidth < screenResponsive  ? 
                            <div className='block_scroll_data_table'>
                                <div className='main_scroll_table'> 
                                    <Table
                                        dataSource={this.state.categories}
                                        columns={columns}
                                        loading={this.state.loading}
                                        pagination={{ pageSize: 15 }}
                                        rowKey={(job) => job.id}
                                    />
                                </div>
                            </div>
                            :
                            <Table
                                dataSource={this.state.categories}
                                columns={columns}
                                loading={this.state.loading}
                                pagination={{ pageSize: 15 }}
                                rowKey={(job) => job.id}
                            />
                        }
                    </Col>
                </Row>

                { visibleAddNew ? 
                    <CategoryForm 
                        visible={visibleAddNew}
                        id={category_id}
                        resetTable={this.getCategories}
                        hidePopup={() => this.setState({ visibleAddNew: false})}
                    />
                : [] }
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Categories));
