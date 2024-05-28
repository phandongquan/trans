import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Row, Col, Table, Image, Switch, Form, Dropdown, Button, Select, Input, Tag } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { getList as apiGetListGroup, approved as apiApproved, destroy as apiDelete } from '~/apis/workplace/group';
import { checkPermission, showNotify, timeFormatStandard } from '~/services/helper';
import { dateTimeFormat, imageDefault } from '~/constants/basic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faPen } from '@fortawesome/free-solid-svg-icons';
import dayjs from 'dayjs';
import ButtonDelete from '~/components/Base/DeleteButton';
import ApprovedForm from './ApprovedForm';

const WORKPLACE_MEDIA_URL = 'https://work.hasaki.vn/workplace/';
class GroupApproved extends Component {
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            groups: [],
            visibleForm: false,
            group: {}
        }
    }

    componentDidMount() {
        this.getListGroupApproved();
    }

    /**
     * Get list group approved
     */
    async getListGroupApproved(params = {}) {
        params = {
            ...params,
            list_approved: true
        }
        let response = await apiGetListGroup(params);

        if(response.status) {
            this.setState({ groups: response.data.rows })
        }
    }

    /**
     * @event submit form
     * @param {Object} values 
     */
     submitForm = (values) => {
        this.getListGroupApproved(values);
    }

    /**
     * On approved
     * @param {*} checked 
     * @param {*} id 
     */
    onApproved = ( checked, id ) => {
        if(!checked) {
            return false;
        }
        let { t, auth: { staff_info } } = this.props; 
        let xhr = apiApproved(id);
        xhr.then(response => {
            if(response.status) {
                showNotify(t('Approved group!'))
                this.setState(state => {
                    let groupsCoppy = state.groups.slice();
                    let index = groupsCoppy.findIndex(g => g.id == id)
                    if( typeof groupsCoppy[index] != 'undefined') {
                        groupsCoppy[index]['approved'] = !groupsCoppy[index]['approved']
                        groupsCoppy[index]['approved_at'] = dayjs().format(dateTimeFormat);
                        groupsCoppy[index]['user_approved'] = {staff: staff_info}
                    }

                    return { groups: groupsCoppy }
                })
            }
        })
    }

    /**
     * Delete new
     * @param {*} e 
     * @param {*} id 
     */
     onDelete = (e, id) => {
        let { t } = this.props;
        e.stopPropagation();
        let xhr = apiDelete(id);
        xhr.then((response) => {
            if (response.status) {
                this.onRefreshTable();
                showNotify(t('Notification'), t('Group has been removed!'));
            } else {
                showNotify(t('Notification'), response.message);
            }
        }).catch(error => {
            showNotify(t('Notification'), t('Server has error!'));
        });
    }

    /**
     * On refresh table
     */
    onRefreshTable = () => {
        let values = this.formRef.current.getFieldsValue();
        this.getListGroupApproved(values);
    }
    
    render() {
        const { t } = this.props;

        const columns = [
            {
                title: t('No.'),
                render: r => this.state.groups.indexOf(r) + 1
            },
            {
                title: t('image'),
                render: r => <Image width={100} height={70} src={r.avatar ? WORKPLACE_MEDIA_URL + r.avatar?.url : imageDefault } />
            },
            {
                title: t('name'),
                render: r => (
                    <>
                        <strong>{r.name}</strong><br/>
                        <span>{r.description}</span>
                    </>
                ),
                width: '40%'
            },
            {
                title: t('type'),
                render: r => r.type == 1 ? <Tag color='purple'>{t('Private')}</Tag> : <Tag color='success'>{t('Public')}</Tag>
            },
            {
                title: t('time'),
                width:'15%',
                render: r => (
                    <>
                        {
                            r.created_at ? 
                            <small>
                                Created: {timeFormatStandard(r.created_at, dateTimeFormat)}
                                {r.user.staff ? 
                                    ` By ${r.user.staff.staff_name} #${r.user.staff.code}`
                                : ''}
                            </small>
                            : ''
                        } <br/>
                        <>
                            {
                                checkPermission('hr-setting-workplace-approve') ?
                                    <Switch size='small'
                                        checkedChildren={<FontAwesomeIcon icon={faCheck} />}
                                        unCheckedChildren={<FontAwesomeIcon icon={faTimes} />}
                                        checked={r.approved}
                                        onChange={checked => this.onApproved(checked, r.id)}
                                    />
                                    : ''
                            }
                            <div>
                                {
                                    r.approved_at ? 
                                    <small>
                                        Approved: {timeFormatStandard(r.approved_at, dateTimeFormat)}
                                        {r.user_approved?.staff ? 
                                            ` By ${r.user_approved.staff.staff_name} #${r.user_approved.staff.code}`
                                        : ''}
                                    </small>
                                    : ''
                                }
                            </div>
                        </>
                    </>
                )
            },
            {
                title: t('hr:total_post'),
                render: r => r?.news_count
            },
            {
                title: t('hr:total_member'),
                render: r => Array.isArray(r.members) ? r.members.length : 0
            },
            {
                title: t('action'),
                width: '10%',
                render: r => <>
                    {
                        checkPermission('hr-setting-workplace-update') ?
                            <Button
                                type="primary"
                                size='small'
                                className='mr-1'
                                icon={<FontAwesomeIcon icon={faPen} />}
                                onClick={() => this.setState({ visibleForm: true, group: r })}
                            />
                            : ''
                    }
                    {
                        checkPermission('hr-setting-workplace-delete') ?
                            <ButtonDelete onConfirm={(e) => this.onDelete(e, r.id)} />
                            : ''
                    }
                </>
            }
        ]

        return (
            <div id='page_social_wp'>
                <PageHeader title={t('hr:group_approve')}/>
                <Row className="card pl-3 pr-3 mb-3">
                    <Form
                        layout="vertical"
                        className="pt-3"
                        ref={this.formRef}
                        onFinish={this.submitForm.bind(this)}
                    >
                        <Row gutter={[12, 0]}>
                            <Col span={4}>
                                <Form.Item name='name'>
                                    <Input placeholder={t('name')} />
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item name='type'>
                                    <Select allowClear placeholder={t('hr:choose_privacy')}>
                                        <Select.Option value={0}>{t('public')}</Select.Option>
                                        <Select.Option value={1}>{t('private')}</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item name='approved'>
                                    <Select allowClear placeholder={t('hr:choose_approve')}>
                                        <Select.Option value={0}>{t('unapproved')}</Select.Option>
                                        <Select.Option value={1}>{t('approved')}</Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={4} key='submit'>
                                <Button type="primary" htmlType="submit">
                                    {t('search')}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        <Table 
                            rowKey='id'
                            dataSource={this.state.groups}
                            columns={columns}
                            pagination={{ pageSize: 20, showSizeChanger: false }}
                        />
                    </Col>
                </Row>

                <ApprovedForm 
                    visible={this.state.visibleForm}
                    togglePopup={() => this.setState({visibleForm: false, group: {}})}
                    group={this.state.group}
                    refreshTable={() => this.onRefreshTable()}
                />
            </div>
        )
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(GroupApproved));