import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Table, Row, Col, Button, Form, Modal, Input } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { getTypes , updateType,  deleteType} from '~/apis/company/document/type';
import { FormOutlined } from '@ant-design/icons';
import Tab from '~/components/Base/Tab';
import { checkPermission, timeFormatStandard } from '~/services/helper';
import constTablist from '~/scenes/Company/config/tabListDocument';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { showNotify } from '~/services/helper';
import DeleteButton from '~/components/Base/DeleteButton';
import {screenResponsive} from '~/constants/basic';

class DocumentType extends Component {

    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.state = {
            types: [],
            visible: false,
            id: 0,
            name: '',
        };
    }

    getTypes = (params) => {
        let xhr = getTypes({fetch: 'full'});
        xhr.then((response) => {
            if (response.status) { 
                this.setState({types: response.data})
            } 
        });
    }

    componentDidMount() {
        this.getTypes()
    }

    /**
     * Handle submit popup
     */
    handleSubmitPopup = () => {
        let { t } = this.props;
        let { id, name } = this.state;
        let message = '';
        let xhr = updateType(id, { 'name': name })
        if (id) {
            message = t('hr:type')+ ' ' + t('hr:updated');
        } else {
            message = t('hr:type')+ ' ' + t('hr:created');
        }
        xhr.then((response) => {
            if (response.status != 0) {
                this.togglePopup();
                this.getTypes();
                showNotify(t('hr:notification'), message);
            } else {
                showNotify(t('hr:notification'), response.message, 'error');
            }
        });
    }

    togglePopup = (visible = false, id = 0, name = '') => {
        this.setState({ visible, id, name })
    }

    /**
     * @event delete DocumentType
     * @param {} e 
     */
    confirmDelete(e, id) {
        e.stopPropagation();
        let { t } = this.props;
        let xhr = deleteType(id);
        xhr.then((response) => {
            if (response.status) {
                showNotify(t('hr:notification'), t('hr:delete_complete'));
                this.getTypes();
            }
        });
    }

    /**
     * @render
     */
    render() {
        const { t } = this.props;
        const { types, visible, name } =  this.state;

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
            width: 100,
            render: r => {
                return (
                    <>
                        {
                            checkPermission('hr-document-type-update') ?
                                <Button type='primary' size='small' className='mr-1 btn_edit_type' onClick={() => this.togglePopup(true, r.id, r.name)}>
                                    <FormOutlined />
                                </Button>
                            : ''
                        }
                        {
                            checkPermission('hr-document-type-delete') ?
                                <DeleteButton onConfirm={(e) => this.confirmDelete(e, r.id)} />
                            : ''
                        }
                    </>
                )
            }
        }];
        return (
            <div>
                <PageHeader 
                        className="site-page-header" 
                        title={t('hr:type')} 
                        tags={[
                            checkPermission('hr-document-type-create') ?
                            <Button 
                                key="create-category" 
                                type="primary" 
                                icon={<FontAwesomeIcon icon={faPlus} />}
                                onClick={() => this.togglePopup(true)}
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
                                        dataSource={types}
                                        columns={columns}
                                        loading={false}
                                        rowKey={(types) => types.id}
                                        pagination={{ pageSize: 30}}>
                                    </Table>
                                </div>
                            </div>
                            :
                            <Table
                                dataSource={types}
                                columns={columns}
                                loading={false}
                                rowKey={(types) => types.id}
                                pagination={{ pageSize: 30}}>
                            </Table>
                        }
                    </Col>
                </Row>
                <Modal 
                    forceRender
                    title={t('hr:reply')}
                    open={visible}
                    onOk={this.handleSubmitPopup}
                    okText={t("submit")}
                    onCancel={() => this.togglePopup()}
                    cancelText={t("cancel")}
                    width=  {window.innerWidth < screenResponsive  ? '100%' : '40%'}
                >
                    <Form layout='vertical'>
                        <Form.Item label={t('hr:name')}>
                            <Input value={name} onChange={ e => this.setState({ name: e.target.value })} />
                        </Form.Item>
                    </Form>
                </Modal>
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(DocumentType));
