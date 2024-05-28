import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Table, Row, Col, Form, Input, Button, Divider } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen} from '@fortawesome/free-solid-svg-icons';
import Tab from '~/components/Base/Tab';
import tabList from '../config/tabList';
import Dropdown from '~/components/Base/Dropdown';
import TooltipButton from '~/components/Base/TooltipButton';
import DeleteButton from '~/components/Base/DeleteButton';
import { Link } from 'react-router-dom';
import { historyReplace, historyParams, showNotify } from '~/services/helper';
import { deleteDayOff, getListDayOff } from '~/apis/company/staffSchedule/DayOff';
import dayjs from 'dayjs';
import { withTranslation } from 'react-i18next';

export class DayOff extends Component {
    constructor(props) {
        let params = historyParams();
        super(props)
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            datas: [],
            limit: 25, 
            page: params.page ? Number(params.page) : 1,
            total: 0
        }
    }
    componentDidMount(){
        let params = historyParams();
        this.formRef.current.setFieldsValue(params);
        let values = this.formRef.current.getFieldsValue();

        this.getList(values)
    }
    async getList(params ={}){
        this.setState({ loading: true })
        params = {
            ...params,
            limit: this.state.limit,
            offset: (this.state.page - 1) * this.state.limit,
        }
        historyReplace(params);
        let response = await getListDayOff(params)
        if(response.status){
            this.setState({datas :response.data.rows , loading: false , total : response.data.total })
        }else{
            showNotify('Notification', response.message , 'error')
        }
    }
    onDeleteDayOff= (e, id) => {
        let { t } = this.props;
        e.stopPropagation();
        let xhr = deleteDayOff(id);
        xhr.then((response) => {
            if (response.status) {
                let values = this.formRef.current.getFieldsValue();
                this.getList(values);
                showNotify(t('Notification'), t('Config has been removed!'));
            } else {
                showNotify(t('Notification'), response.message);
            }
        }).catch(error => {
            showNotify(t('Notification'), t('Server has error!'));
        });;
    }
    /**
     * @event change page
     *
     * @param {*} page
     */
    onChangePage(page) {
        let values = this.formRef.current.getFieldsValue();
        this.setState({ page }, () => this.getList({ ...values }));
    }
    /**
     * @event submit Form
     * @param {*} values 
     */
     submitForm(values) {
        this.getList(values)
    }
    render() {
        let { t, baseData: { departments , majors , positions } } = this.props;
        let { datas } = this.state
        const columns = [
            {
                title: 'No.',
                width: 30,
                render: r => datas.indexOf(r) + 1
            },
            {
                title: 'Name',
                dataIndex : 'name'
            },
            {
                title: 'Start',
                render: r => dayjs(r.start).format('YYYY-MM-DD')
            },
            {
                title: 'End',
                render: r => dayjs(r.end).format('YYYY-MM-DD')
            },
            {
                title: 'Departments',
                render: r => {
                    let result = []
                    if(r.department_id?.length){
                        (r.department_id).map((dept_id , index)=>{
                            departments.find((department) => {
                                if (dept_id == department.id)
                                    result.push(<span key={index}> { index > 0  ? ',' : [] } &nbsp; {department.name}</span>)
                            })
                        })
                    }
                    return result;
                }
            },
            {
                title: 'Majors',
                render: r => {
                    let result = []
                    if(r.major_id?.length){
                        (r.major_id).map((mar_id , index) =>{
                            majors.find((marjor) => {
                                if (mar_id == marjor.id)
                                    result.push(<span key={index}> { index > 0  ? ',' : [] } &nbsp; {marjor.name}  </span>)
                            })
                        })
                    }
                    return result;
                }
            },
            {
                title: 'Positions',
                render: r => {
                    let result = []
                    if(r.position_id?.length){
                        (r.position_id).map((pos_id , index) =>{
                            positions.find((position) => {
                                if (pos_id == position.id)
                                    result.push(<span key={index}> { index > 0  ? ',' : [] } &nbsp; {position.name}  </span>)
                            })
                        })
                    }
                    return result;
                }
            },
            {
                title: 'Action',
                align: 'center',
                render: (r) => {
                    return (
                        <>
                            <Link to={`/company/staff-schedule/day-off/${r.id}/edit`} key="edit-day-off">
                                <TooltipButton title={t('Edit')} type="primary" size='small' icon={<FontAwesomeIcon icon={faPen} />} style={{ marginRight: 8 }} />
                            </Link>
                            <DeleteButton onConfirm={(e) => this.onDeleteDayOff(e, r.id)} />
                        </>
                    );
                }
            }

        ]
        return (
            <div id='page_config_schedule'>
                <PageHeader
                    title={t('Day Off')}
                    tags={
                        <div>
                            <Link to={`/company/staff-schedule/day-off/create`} key="create-day-off">
                                <Button key="create-schedule" type="primary" icon={<FontAwesomeIcon icon={faPlus} />}>
                                    &nbsp;{t('Add day off')}
                                </Button>
                            </Link>
                        </div>
                    }
                />
                <Row className='card pl-3 pr-3 mb-3'>
                    <Form
                        className="form_day_off pt-3"
                        ref={this.formRef}
                        name="searchStaffForm"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical"
                    >
                        <Row className='' gutter={[12, 0]}>
                            <Col span={4}>
                                <Form.Item name="q">
                                    <Input placeholder={t('Search')} />
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item name="department_id" >
                                    <Dropdown datas={departments} defaultOption="-- All Department --" />
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item name="major_id" >
                                    <Dropdown datas={majors} defaultOption="-- All Major --" />
                                </Form.Item>
                            </Col>
                            <Col span={4} key='submit'>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" className='mr-2'>
                                        {t('Search')}
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <Row className='block_day_off_schedule_table_in_block card pl-3 pr-3 mb-3'>
                    <Col span={24}>
                        <Tab tabs={tabList(this.props)} />
                        <Divider className='mt-0' />
                        
                    </Col>
                </Row>
                <Table
                    rowKey={'id'}
                    dataSource={this.state.datas}
                    className='mb-3'
                    columns={columns}
                    loading={this.state.loading}
                    pagination={{
                        pageSize: this.state.limit,
                        total: this.state.total,
                        showSizeChanger: false,
                        onChange: page => this.onChangePage(page)
                    }}
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
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(DayOff))