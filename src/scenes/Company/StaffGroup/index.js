import React, { Component } from 'react'
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Table, Row, Col, Form ,Input } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { uniqueId } from 'lodash';
import Tab from '~/components/Base/Tab';
import tabList from '~/scenes/Company/config/tabListTask';
import { faPlus, faPen, faPaperclip, faEllipsisV, faFileExport } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import {getList as apiGetList ,deleteStaffGroup} from '~/apis/company/staffGroup';
import CreateUpdateDate from '~/components/Base/CreateUpdateDate';
import DeleteButton from '~/components/Base/DeleteButton';
import {showNotify ,checkManager, checkPermission } from '~/services/helper';
import Dropdown from '~/components/Base/Dropdown';
import {screenResponsive} from '~/constants/basic';

const staffRole = {0 : 'Public' , 1 : 'Staff' , 10 : 'Manager' }

class StaffGroup extends Component {
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            datas : [] ,
        }
    }
    componentDidMount () {
        this.getListStaff()
    }
    async getListStaff(params = {}){
        this.setState({ loading: true });
        let response = await apiGetList(params);
        if (response.status) {
            this.setState({datas : response.data.staffGroups , loading : false})
        }

    }
    onDeleteStaffGroups(e, id){
        e.stopPropagation();
        let { t } = this.props;
        let xhr = deleteStaffGroup(id);
        xhr.then((response) => {
            if (response.status) {
                showNotify(t('Notification'), t('hr:delete_complete'));
                this.getListStaff();
            }
        });
    }
    // /**
    //  * @event submit form
    //  * @param {Object} values 
    //  */
    // submitForm = (values) => {
    //     this.getListStaff(values)
    // }
    render() {
        let { t, baseData: { departments,  positions, majors } ,auth :{staff_info}} = this.props;
        let {datas , loading} = this.state;
        const columns = [ 
            {
                title:t('No.'),
                render: r => this.state.datas.indexOf(r)+ 1
            },
            {
                title:t('hr:code'),
                render: r => <strong>{r?.code}</strong>
            },
            {
                title:t('hr:title'),
                width: '25%',
                render : r => <div>{r?.title}</div>
            },
            {
                title:t('hr:role'),
                render: r => typeof staffRole[r.role] !== 'undefined' ? staffRole[r.role] : '',
            },
            {
                title: t('hr:dept') + (' / ') + t('hr:position') + (' / ') + t('hr:major'),
                render: r => (
                    <div>
                        {departments.map(d => r.department_id == d.id && d.name)} /&nbsp;
                        {positions.map(m => m.id == r.position_id && m.name)}  /&nbsp;
                        {majors.map(m => m.id == r.major_id && m.name)}
                    </div>
                )
            },
            {
                title: t('hr:date'),
                render: r => <CreateUpdateDate record={r} />
            },
            {
                title: t('hr:created_by'),
                render: r => {
                    let created_by_user = r.created_by_user;
                    return created_by_user ? `${created_by_user.name} # ${created_by_user.id}` : r.created_by;
                }
            },
            {
                title: t('hr:action'),
                width: '10%',
                align: 'center',
                render: r => (
                    <div>
                        {
                            checkPermission('hr-staff-group-update') ?
                            <Link to={`/company/staff-group/${r.id}/edit`}>
                                <Button type="primary" size='small'
                                    icon={<FontAwesomeIcon icon={faPen} />} style={{ marginRight: 8 }}>
                                </Button>
                            </Link>
                            : ''
                        }
                        {
                            checkPermission('hr-staff-group-delete') ?
                                <DeleteButton onConfirm={(e) => this.onDeleteStaffGroups(e, r.id)} />
                            : ''
                        }
                    </div>
                )
            }
        ]
        return (
            <div id='page_staff_group'>
                <PageHeader title={t('hr:staff_group')}
                    tags={[
                        checkPermission('hr-staff-group-create') ?
                        <Link to={`/company/staff-group/create`} key="create-staff-group" className='mr-2' >
                            <Button key="createe-staff-group" type="primary" icon={<FontAwesomeIcon icon={faPlus} />}>
                                {t('hr:add_new')}
                            </Button>
                        </Link>
                        : ''
                    ]}
                />
                <Row className={window.innerWidth < screenResponsive  ? "card pl-3 pr-3 mb-3 pb-3" : "card pl-3 pr-3 mb-3"}>
                    <div id="tab_responsive">
                        <div className='tab_content_mantenance_device'>
                            <Tab tabs={tabList(this.props) }></Tab>
                        </div>
                    </div>
                    {/* <Form ref={this.formRef} className="pt-3" name="searchStaffForm"
                        onFinish={this.submitForm.bind(this)}
                    >
                        <Row gutter={12}>
                            <Col span={6}>
                                <Form.Item name='keywords'>
                                    <Input placeholder={t('Code , Title')} />
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item name='department_id'>
                                    <Dropdown datas={departments} defaultOption={t('-- All Departments --')}/>
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item name='role'>
                                    <Dropdown datas={{0 : 'Public' , 1 : 'Staff' , 10 : 'Manager' }}
                                    defaultOption={t('-- All Role --')}/>
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Button type="primary" htmlType="submit">
                                    {t('Search')}
                                </Button>
                            </Col>
                        </Row>
                    </Form> */}
                </Row>
                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        {window.innerWidth < screenResponsive  ? 
                                <div className='block_scroll_data_table'>
                                    <div className='main_scroll_table'> 
                                        <Table
                                           dataSource={datas}
                                           rowKey={r => r.id}
                                           columns={columns}
                                           loading={loading}
                                           pagination={{
                                               showSizeChanger: false,
                                           }}
                                        />
                                    </div>
                                </div>
                                :
                            <Table
                                dataSource={datas}
                                rowKey={r => r.id}
                                columns={columns}
                                loading={loading}
                                pagination={{
                                    showSizeChanger: false,
                                }}
                            />
                        }
                    </Col>
                </Row>
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

export default connect(mapStateToProps)(withTranslation()(StaffGroup));
