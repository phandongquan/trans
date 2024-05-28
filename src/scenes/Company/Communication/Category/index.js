import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { Table, Row, Col, Button } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { getList as apiList, destroyCategory as apiDestroy } from '~/apis/company/communication/category';
import { FormOutlined } from '@ant-design/icons';
import Tab from '~/components/Base/Tab';
import { timeFormatStandard, showNotify, checkPermission } from '~/services/helper'
import { faPlus, faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CategoryForm from '~/scenes/Company/Communication/Category/CategoryForm';
import { Link } from 'react-router-dom';
import DeleteButton from '~/components/Base/DeleteButton';
import TooltipButton from '~/components/Base/TooltipButton';
import {screenResponsive} from '~/constants/basic';
class Category extends Component {

    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.state = {
            categories: [],
            visibleAddNew: false,
            category_id: '',
        };
    }

    componentDidMount() {
        this.getCategories();
    }

    /**
     * Get list category
     */
    getCategories = () => {
        let xhr = apiList();
        xhr.then((response) => {
            if (response.status) {
                this.setState({ categories: response.data });
            }
        });
    }

    /**
     * Delete category
     */
    onDeleteCategory = (event, id) => {
        let { t } = this.props;
        event.stopPropagation();
        let xhr = apiDestroy(id);
        xhr.then((response) => {
            if (response.status) {
                this.getCategories();
                showNotify(t('Notification'), t('Category has been removed!'));
            } else {
                showNotify(t('Notification'), response.message, 'error');
            }
        }).catch(error => {
            showNotify(t('Notification'), t('Server has error!'), 'error');
        });;
    }

    /**
     * @render
     */
    render() {
        const { categories, visibleAddNew, category_id } =  this.state;
        const { t } = this.props;

        const tabList = [
            {
                title: 'List',
                route: '/company/communication',
            },
            {
                title: 'Categories',
                route: '/company/communication/categories',
            }
        ]
        let renderTabList = () => {
            let result = [];
            if (checkPermission('hr-communication-list')) {
                result.push({
                    title: 'List',
                    route: '/company/communication',
                })
            }
            if (checkPermission('hr-communication-categories-list')) {
                result.push({
                    title: 'Categories',
                    route: '/company/communication/categories',
                })
            }
            return result;
        }

        const columns = [
        {
            key: 'id',
            title: 'ID',
            dataIndex: 'id',
        }, {
            key: 'name',
            title: t('Name'),
            dataIndex: 'name'
        }, {
            key: 'created_at',
            title: t('Created At'),
            dataIndex: 'created_at',
            render: (text) => { return text ? timeFormatStandard(text, 'DD/MM/YY HH:mm') : ''}
        }, {
            key: 'updated_at',
            title: t('Updated At'),
            dataIndex: 'updated_at',
            render: (text) => { return text ? timeFormatStandard(text, 'DD/MM/YY HH:mm') : ''},
        },
        {
            key: 'action',
            title: 'Action',
            dataIndex: 'id',
            width: 100,
            render: (id, record) => {
                return <>
                {
                    checkPermission('hr-communication-categories-update') ? 
                        <Link to="" onClick={(e) => { e.preventDefault(); this.setState({ visibleAddNew: true, category_id: id }) }}>
                            <TooltipButton title={t('Edit')} type="primary" size='small' icon={<FontAwesomeIcon icon={faPen} />} style={{ marginRight: 8 }} />
                        </Link>
                        : ''
                }
                {
                    checkPermission('hr-communication-categories-delete') ?
                        <DeleteButton onConfirm={(e) => this.onDeleteCategory(e, record.id)} />
                        : ''
                }
                </>
            }
        }];
        return (
            <div>
                <PageHeader
                    className="site-page-header"
                    title={t('Categories')}
                    tags={[
                        checkPermission('hr-communication-categories-create') ?
                            <Button 
                                key="create-category" 
                                type="primary" 
                                icon={<FontAwesomeIcon icon={faPlus} />}
                                onClick={() => this.setState({visibleAddNew: true})}
                            >
                                &nbsp;{t('Add new')}
                            </Button>
                            : ''
                    ]}
                />
                <Row className={window.innerWidth < screenResponsive  ? "card pl-3 pr-3 mb-3 pb-3" : "card pl-3 pr-3 mb-3"}>
                    <Tab tabs={renderTabList()} />
                </Row>
                <Row gutter={[16, 24]}>
                    <Col span={24}>                     
                        <div className='block_scroll_data_table'>
                            <div className='main_scroll_table'> 
                                <Table
                                    dataSource={categories}
                                    columns={columns}
                                    loading={false}
                                    rowKey={(categories) => categories.id}
                                    pagination={false} />   
                            </div>
                        </div>
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

export default (withTranslation()(Category));
