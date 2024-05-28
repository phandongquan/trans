import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Table, Row, Col, Form, Input, Progress } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { getListMembers as apiGetList } from '~/apis/company/job/member';
import Tab from '~/components/Base/Tab';
import { genders, staffStatus as arrStatus, jobUnit, screenResponsive } from '~/constants/basic';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPen, faPlus } from '@fortawesome/free-solid-svg-icons';
import tabList from '~/scenes/Company/Job/config/jobTabList';
import { checkPermission, parseIntegertoTime } from '~/services/helper';
import Dropdown from '~/components/Base/Dropdown';
import { getList as apiGetListBasic } from '~/apis/company/job/basic';

class Member extends Component {

    /**
     * @lifecycle
     */
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            members: [],
            cities: {},

            total: 0,
            page: 1,
            limit: 20
        }
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        this.getListMembers();
        this.getBasic();
    }

    /**
     * Call api get list Members
     * @param {*} params 
     */
    async getListMembers( params = {} ) {
        this.setState({ loading: true })

        params = {
            ...params,
            page: this.state.page,
            limit: this.state.limit,
        }
        let response  = await apiGetList(params);
        if(response.status) {
            this.setState({ loading: false, members: response.data.rows, total: response.data?.total })
        } 
    }

    async getBasic() {
        let response = await apiGetListBasic();
        if(response.status) {
            let { data } = response;
            this.setState({ cities: data.locations})
        }
    }
    
    /**
     * Submit form search
     * @param {*} values 
     */
    submitForm = (values) => {
        this.getListMembers(values)
    }

    /**
     * On change page
     */
    onChangePage = (page) => {
        let values = this.formRef.current.getFieldsValue();
        this.setState({ page }, () => this.getListMembers({ ...values }));
    }

    /**
     * @lifecycle
     */
    render() {
        let { t, baseData: { majors } } = this.props;
        let { cities } = this.state;
        const columns = [
            {
                title: 'No.',
                render: r => this.state.members.indexOf(r) + 1 
            },
            {
                title: t('hr:name'),
                render: r => {
                    return (
                        <>
                            <Link to={`/company/job/members/${r.id}/detail`} target='_blank'>{r.fullname}</Link> 
                            { r.gender ? <small> - { genders[r.gender] }</small> : ''}
                            {r.phone ? <><br /><small>{r.phone}</small></> : []}
                            {r.email ? <><br /><small>{r.email}</small></> : []}
                            {r.address ? <><br /><small>{r.address}</small></> : ''}
                        </>
                    )
                },
            },
            {
                title: t('hr:description'),
                render: r => {
                    let arrIndustries = [];
                    if(Array.isArray(r.industries)) {
                        r.industries.map(i => {
                            let industryFound = majors.find(m => m.id == i);
                            if(industryFound) {
                                arrIndustries.push(industryFound.name)
                            }
                        })
                    }

                    let arrCities = [];
                    if(Array.isArray(r.locations)) {
                        r.locations.map(l => {
                            if(typeof cities[l] != 'undefined') {
                                arrCities.push(cities[l])
                            } 
                        })
                    }
                    return (
                        <>
                            { r.resume_title && <span>{r.resume_title}</span>}
                            { r.yearofexperience > 0 && <span><br/><small>Experience: </small>{r.yearofexperience} years </span>}
                            { arrIndustries.length ? <span><br/><small>Industries: </small>{ arrIndustries.join(' , ') }</span> : [] }
                            { arrCities.length ? <span><br/><small>Locations: </small>{ arrCities.join(' , ') }</span> : [] }
                            { r.salary_unit ?
                                <>
                                    <small><br />Salary: </small>
                                    {
                                        r.salary_unit == 'vnd' ?
                                            <>
                                                {Intl.NumberFormat('en-US').format(r.salary_from)} -
                                                {Intl.NumberFormat('en-US').format(r.salary_to)} {r.salary_unit}
                                            </>
                                            : <> { Object.keys(jobUnit).map(key => key == r.salary_unit && jobUnit[key])} </>
                                    }
                                </>
                            : [] }
                        </>
                    )
                }
            },
            {
                title: t('hr:status'),
                render: r => r.status && r.status > 0 ? arrStatus[r.status] : ''
            },
            {
                title: t('hr:created_date'),
                render: r => r.created && r.created > 0 ? parseIntegertoTime(r.created) : ''
            },
            {
                title: t('hr:modified_at'),
                render: r => r.modified && r.modified > 0 ? parseIntegertoTime(r.modified) : ''
            },
            {
                title: t('hr:action'),
                width:'10%',
                render: r => {
                    return (
                        <>
                            <Link to={`/company/job/members/${r.id}/detail`} style={{ marginRight: 8 }} >
                                <Button type="primary" size='small' icon={<FontAwesomeIcon icon={faEye} />} />
                            </Link>
                        {checkPermission("hr-job-member-update") ? 
                             <Link to={`/company/job/members/${r.id}/edit`} style={{ marginRight: 8 }} >
                                <Button type="primary" size='small' icon={<FontAwesomeIcon icon={faPen} />} />
                            </Link> : ""
                        }
                        </>
                    )
                },
                align: 'center'
            }
        ]
        return (
            <div id='page_member_job'>
                <PageHeader
                    title={t('hr:member')}
                    tags={<Link to='/company/job/members/create'>
                        {checkPermission("hr-job-member-create") ? 
                            <Button key="create-staff" type="primary" icon={<FontAwesomeIcon icon={faPlus} />}>
                                &nbsp;{t('Add new')}
                            </Button> : ""
                    }
                    </Link>}
                />
                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={tabList(this.props)}></Tab>

                    <Form
                        className="pt-3"
                        ref={this.formRef}
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical"
                    >
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <Form.Item name="code">
                                    <Input placeholder={t('Name, email, phone, expected job title')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name="location_id">
                                    <Dropdown datas={this.state.cities} defaultOption={t('-- All Locations --')}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name="major_id">
                                    <Dropdown datas={majors} defaultOption={t('-- All Industries --')}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name="status">
                                    <Dropdown datas={arrStatus} defaultOption={t('-- All Status --')}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} key='submit'>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit">
                                        {t('hr:search')}
                                    </Button>
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
                                <Table className='table_in_block'
                                    dataSource={this.state.members}
                                    columns={columns}
                                    loading={this.state.loading}
                                    pagination={{
                                        total: this.state.total,
                                        pageSize: this.state.limit,
                                        hideOnSinglePage: true,
                                        showSizeChanger: false,
                                        current: this.state.page,
                                        onChange: page => this.onChangePage(page)
                                    }}
                                    rowKey={(candidate) => candidate.id}
                                />
                            </div>
                        </div>
                        :
                        <Table className='table_in_block'
                            dataSource={this.state.members}
                            columns={columns}
                            loading={this.state.loading}
                            pagination={{
                                total: this.state.total,
                                pageSize: this.state.limit,
                                hideOnSinglePage: true,
                                showSizeChanger: false,
                                current: this.state.page,
                                onChange: page => this.onChangePage(page)
                            }}
                            rowKey={(candidate) => candidate.id}
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
const mapDispatchToProps = (dispatch) => {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Member));