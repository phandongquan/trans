import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { Table, Row, Col, Button } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import documentCategoryApi from '~/apis/company/document/category';
import { FormOutlined } from '@ant-design/icons';
import Tab from '~/components/Base/Tab';
import { checkPermission, timeFormatStandard } from '~/services/helper'
import constTablist from '~/scenes/Company/config/tabListDocument';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CategoryModal from '~/components/Company/Document/DocumentModal';
import { showNotify } from '~/services/helper';
import { Link } from 'react-router-dom';
import {screenResponsive} from '~/constants/basic';
class DocumentCategory extends Component {

    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.state = {
            categories: [],
            visibleAddNew: false,
            category_id: 0,
            category_name: '',
        };
    }

    getCategories = (params) => {
        let xhr = documentCategoryApi.getCategories(params);
        xhr.then((response) => {
            if (response.status) {
                if(typeof response.data == 'object'){
                    let result = [];
                    Object.keys(response.data).map((key) => {
                        result.push(response.data[key])
                    })
                    this.setState({ categories: result });
                } else {
                    this.setState({ categories: response.data });
                }
            }
        });
    }

    componentDidMount() {
        this.getCategories();
    }

    /**
     * Handle submit popup
     */
    handleSubmitPopup = () => {
        let { t } = this.props;
        let { category_id, category_name } = this.state;
        let message = '';
        let xhr = documentCategoryApi.updateCategory(category_id, { 'name': category_name })
        if (category_id) {
            message = t('hr:category') + ' ' + t('hr:updated');
        } else {
            message = t('hr:category')  + ' ' + t('hr:created');
        }
        xhr.then((response) => {
            if (response.status != 0) {
                this.setState({ visibleAddNew: false, category_name: '' })
                this.getCategories();
                showNotify(t('hr:notification'), message);
            } else {
                showNotify(t('hr:notification'), response.message, 'error');
            }
        });
    }

    /**
     * @render
     */
    render() {
        const { categories, visibleAddNew, category_name } =  this.state;
        const { t } = this.props;

        const columns = [
        {
            key: 'id',
            title: 'ID',
            dataIndex: 'id',
        }, {
            key: 'name',
            title: t('hr:name'),
            dataIndex: 'name'
        }, {
            key: 'created_at',
            title: t('hr:created_at'),
            dataIndex: 'created_at',
            render: (text) => { return text ? timeFormatStandard(text, 'DD/MM/YY HH:mm') : ''}
        }, {
            key: 'updated_at',
            title: t('hr:update_at'),
            dataIndex: 'updated_at',
            render: (text) => { return text ? timeFormatStandard(text, 'DD/MM/YY HH:mm') : ''},
        },
        {
            key: 'action',
            title: t('hr:action'),
            dataIndex: 'id',
            width: 100,
            render: (id, record) => {
                return <Link to="" onClick={(e) => {
                            e.preventDefault();
                            this.setState({ visibleAddNew: true, category_id: id, category_name: record.name})}}>
                            {
                                checkPermission('hr-document-categories-update') ? 
                                 <FormOutlined />
                                : ''
                            }
                        </Link>
            }
        }];
        return (
            <div>
                <PageHeader
                    className="site-page-header"
                    title={t('hr:category')}
                    tags={[
                        checkPermission('hr-document-categories-create') ? 
                            <Button 
                                key="create-category" 
                                type="primary" 
                                icon={<FontAwesomeIcon icon={faPlus} />}
                                onClick={() => this.setState({visibleAddNew: true, category_id: 0, category_name: ''})}
                            >
                                &nbsp;{t('hr:add_new')}
                            </Button>
                        : ''
                    ]}
                />
                <Row className= {window.innerWidth < screenResponsive  ? "card pl-3 pr-3 mb-3 pb-3" : "card pl-3 pr-3 mb-3"}>
                    <Tab tabs={constTablist(this.props)} />
                </Row>
                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        {window.innerWidth < screenResponsive  ? 
                            <div className='block_scroll_data_table'>
                                <div className='main_scroll_table'> 
                                    <Table
                                        dataSource={categories}
                                        columns={columns}
                                        loading={false}
                                        rowKey={(categories) => categories.id}
                                        pagination={false}>
                                    </Table>
                                </div>
                            </div>
                            :
                            <Table
                                dataSource={categories}
                                columns={columns}
                                loading={false}
                                rowKey={(categories) => categories.id}
                                pagination={false}>
                            </Table>
                        }
                    </Col>
                </Row>

                <CategoryModal 
                    title={t("hr:category")}
                    inputType="Input"
                    visible={visibleAddNew}
                    hidePopup={() => this.setState({ visibleAddNew: false})}
                    content={category_name}
                    onChange={(e) => this.setState({ category_name: e.target.value })}
                    submitPopup={this.handleSubmitPopup}
                />
            </div>
        );
    }
}

export default (withTranslation()(DocumentCategory));
