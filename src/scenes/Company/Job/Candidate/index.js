import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Col, Row, Table, Button, Rate, Form, Input, Select , Dropdown as DropdownAnt , Menu, DatePicker} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { getList as apiGetList } from '~/apis/company/job/candidate';
import { dateTimeFormat, jobCandidateStatus, skillStatus as arrStatus, typeReasonReject, dateFormat, typeInterviewResult } from '~/constants/basic';
import { Link } from 'react-router-dom';
import Tab from '~/components/Base/Tab';
import TabList from '~/scenes/Company/Job/config/jobTabList'
import { parseIntegertoTime ,exportToXLS, showNotify, checkPermission, timeFormatStandard, historyParams, historyReplace } from '~/services/helper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen ,faEllipsisV , faFileExport} from '@fortawesome/free-solid-svg-icons';
import CandidateForm from '~/scenes/Company/Job/Candidate/CandidateForm';
import { getList as apiGetListBasic } from '~/apis/company/job/basic';
import Dropdown from '~/components/Base/Dropdown';
import { StarTwoTone } from '@ant-design/icons';
import './config/candidates.css';
import { uniqueId } from 'lodash';
import {formatHeader , formatData} from './config/exportCandidates';
import dayjs from 'dayjs';
import {screenResponsive} from '~/constants/basic';
class Candidate extends Component {

    /**
     * @lifecycle
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef()
        let params = historyParams();
        this.state = {
            loading: false,
            candidates: [],
            jobs: [],
            visiblePopup: false,
            candidateIDPopup: 0,
            workflows: {},

            page: params.page ? Number(params.page) : 1,
            limit: params.limit ? Number(params.limit) : 20,
            total: 0
        }
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        let params = historyParams();
        this.formRef.current.setFieldsValue(params);
        let values = this.formRef.current.getFieldsValue();
        values = {
            ...values,
            sort: 'job_id'
        }
        this.getBasic();
        this.getListCandidates(values);
        this.getJobs();
    }

    /**
     * Call api get list basic
     */
    async getBasic() {
        let response = await apiGetListBasic();
        if(response.status) {
            let { data } = response;
            this.setState({ workflows: data.workflows })
        }
    }

    /**
     * Get list job
     * @param {} params 
     */
    getJobs = (params = {}) => {
        this.setState({ loading: true });
        let xhr = apiGetList(params);
        xhr.then((response) => {
            if (response.status) {
                let datas = response.data.rows;
                let result = [];
                const jobIds = {};
                if(Array.isArray(datas)) {
                    datas.map(d => {
                        if (!jobIds[d.job_id]) {
                            result.push({ id: d.job_id, name: d.job_title })
                            jobIds[d.job_id] = true; // Đánh dấu job_id đã xuất hiện
                        }
                    })
                }
                this.setState({ 
                    loading: false,
                    jobs: result,
                });
            }
        });
    }

    /**
     * Call api get candidates
     * @param {*} params 
     */
    async getListCandidates( params = {} ) {
        this.setState({ loading: true })
        if (params.date) {
            params.apply_from = timeFormatStandard(params.date[0], dateFormat);
            params.apply_to = timeFormatStandard(params.date[1], dateFormat);
            delete (params.date)
        }
        params = {
            ...params,
            page: this.state.page,
            limit: this.state.limit,
        }
        historyReplace(params);
        let response = await apiGetList(params);
        if(response.status) {
            this.setState({ loading: false, candidates: response.data.rows, total: response.data.total })
        }
    }

    /**
     * Toggle Popup
     * @param {*} visible 
     * @param {*} idCandidate 
     */
    togglePopup ( visible, idCandidate = 0 ) {
        this.setState( { visiblePopup: visible, candidateIDPopup: idCandidate})

        // Refresh table
        if(!visible) {
            this.getListCandidates();
        }
    }

    /**
     * Submit form search get list
     * @param {*} values 
     */
    submitForm = (values) => {
        this.getListCandidates(values);
    }

    /**
     * OnChange page
     * @param {*} page 
     */
    onChangePage = (page) => {
        let values = this.formRef.current.getFieldsValue();
        this.setState({ page }, () => this.getListCandidates({ ...values }));
    }
    async exportCandidates(){
        let params = {
            // page: 1,
            limit : -1,
            offset : 0
        }
        let response = await apiGetList(params);
        if(response.status){
            let header = formatHeader();
            let data = formatData(response.data.rows , this.state.workflows);
            let fileName = `Candidates-${dayjs().format('YYYY-MM-DD')}`;
            let datas = [...header, ...data];
            exportToXLS(fileName, datas,[{width : 30},{width : 40},{width : 15},{width : 75},{width : 70},{width : 20},{width : 20},{width : 15},{width : 20},{width : 30}]);
        }else{
            showNotify('Notify', response.message, 'error')
        }
    }
    render() {
        let { t } = this.props;
        const columns = [
            {
                title: 'No.',
                render: r => this.state.candidates.indexOf(r) + 1 
            },
            {
                title: t('hr:candidate'),
                render: r => {
                    return (
                        <>
                            <Link to={`/company/job/members/${r.member_id}/detail/${r.id}`}>{r.member_name}</Link>
                            { r.member_email ? <><br></br><small> {r.member_email} </small></> : ''}
                            { r.member_phone ? <><br></br><small> {r.member_phone} </small></> : ''}
                            { r.member_address ? <><br/><small>{r.member_address}</small></> : [] }
                        </>
                    )
                },
            },
            {
                title: t('hr:location'),
                render: r => {
                    const { baseData: { locations = [] } } = this.props;
                    const { work_locations } = r;
                    if (work_locations && work_locations.length > 0) {
                        const arrayIds = work_locations.split(',');
                        return arrayIds.map(id => {
                            const location = locations.find(l => l.id == id);
                            return location ? <div key={location.id}>{location.address}</div> : '';
                        });
                    }
                    return "";
                }
            },
            {
                title: t('hr:title'),
                render: r => r.job_id && <Link to={`/company/job/${r.job_id}/edit`} >{ r.job_title }</Link>
            },
            {
                title: t('hr:workflow'),
                render: r => r.wfid && this.state.workflows[r.wfid]
                // render: r => {
                //     if (jobCandidateStatus[r.status] == "Reject"){
                //         return ""
                //     }else{
                //         return r.wfid && this.state.workflows[r.wfid]
                //     }
                // }
            },
            {
                title: t('hr:rating'),
                render: r => <Rate value={r.rating} />
            },
            {
                title: t('hr:score') ,
                width: '10%',
                render : r=> Number(r.interview_score) > 0 ?<span>Interview score: {r.interview_score}</span>  : <span>Self scrore: {r.self_score}</span>
            },
            {
                title: t('hr:result') ,
                width: '13%',
                render : r=> <>
                    <span>Interview result: {typeInterviewResult[r.interview_result] }</span>  <br/> 
                    <span>test result: {typeInterviewResult[r.test_result]}</span>
                </>
            },
            {
                title: t('hr:status'),
                render: r =>r.status > 0 ? 
                jobCandidateStatus[r.status]
                : 
                <>
                    <span>{jobCandidateStatus[r.status]}</span> <br/>
                    {r?.reason > 0 ? <small>reason : {typeReasonReject[r?.reason]}</small> : []}
                </>
            },
            {
                title: t('hr:note'),
                dataIndex: 'note'
            },
            {
                title: t('hr:applied_date'),
                render: r => r.created && parseIntegertoTime(r.created, dateTimeFormat)
            },
            {
                title: t('hr:action'),
                render: r => {
                    return checkPermission('hr-job-candidate-update') ? (
                        <Button
                            type="primary"
                            size='small'
                            icon={<FontAwesomeIcon icon={faPen} />}
                            onClick={() => this.togglePopup(true, r.id)}
                        />
                    ) : null; 
                },
                align: 'center'
            }
        ]
        const onClickItems = ({ key }) => {
            if(key == '1') {
                this.exportCandidates();
            }
        }
        const items = [
                {
                    key: '1',
                    label:
                        checkPermission('hr-job-candidate-export') ?
                            <Button key="export-staff" type="text" size="small" icon={<FontAwesomeIcon icon={faFileExport} />}>
                                &nbsp;{t('hr:export')}
                            </Button>
                        : ""

                }
                // <Menu.Item key={uniqueId('_dropdown')} onClick={() => this.exportCandidates()}>
                //     {
                //         checkPermission('hr-job-candidate-export') ?
                //             <Button key="export-staff" type="text" size="small" icon={<FontAwesomeIcon icon={faFileExport} />}>
                //                 &nbsp;{t('Export')}
                //             </Button>
                //         : ""
                //     }
                // </Menu.Item>
        ] ;
        return (
            <>
                <PageHeader 
                    title={t('hr:candidate')} 
                    tags={
                        checkPermission('hr-job-candidate-create') ? 
                        <Button key="create-staff" type="primary" icon={<FontAwesomeIcon icon={faPlus} />} onClick={ () => this.togglePopup( true ) }>
                            &nbsp;{t('hr:add_new')}
                        </Button> : ""
                    }
                    extra={
                        checkPermission('hr-job-candidate-export') ?
                            <DropdownAnt className='ml-2' trigger={['click']} key={uniqueId('_dropdown')} menu={{ items, onClick: onClickItems }} type="primary" placement="bottomLeft">
                            <Button key={uniqueId('_dropdown_btn')} type="primary" icon={<FontAwesomeIcon icon={faEllipsisV} />} />
                        </DropdownAnt> : ""
                    }
                />
                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={TabList(this.props)}></Tab>
                    <Form
                        className="pt-3"
                        ref={this.formRef}
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical"
                    >
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <Form.Item name="code">
                                    <Input placeholder={t('Candidate name, email, phone')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                <Form.Item name="job_id">
                                    <Dropdown datas={this.state.jobs} defaultOption="-- All Jobs --" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name='date'>
                                    <DatePicker.RangePicker format={dateFormat} className='w-100' />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name="wfid">
                                    <Dropdown datas={this.state.workflows} defaultOption="-- All Workflow --" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={3} xl={3}>
                                <Form.Item name="rating">
                                    <Select placeholder='-- Select Star --' allowClear={true}>
                                        <Select.Option value="1">
                                            <StarTwoTone twoToneColor='#faad14'/>
                                        </Select.Option>
                                        <Select.Option value="2">
                                            <StarTwoTone twoToneColor='#faad14'/>
                                            <StarTwoTone twoToneColor='#faad14'/>
                                        </Select.Option>
                                        <Select.Option value="3">
                                            <StarTwoTone twoToneColor='#faad14'/>
                                            <StarTwoTone twoToneColor='#faad14'/>
                                            <StarTwoTone twoToneColor='#faad14'/>
                                        </Select.Option>
                                        <Select.Option value="4">
                                            <StarTwoTone twoToneColor='#faad14'/>
                                            <StarTwoTone twoToneColor='#faad14'/>
                                            <StarTwoTone twoToneColor='#faad14'/>
                                            <StarTwoTone twoToneColor='#faad14'/>
                                        </Select.Option>
                                        <Select.Option value="5">
                                            <StarTwoTone twoToneColor='#faad14'/>
                                            <StarTwoTone twoToneColor='#faad14'/>
                                            <StarTwoTone twoToneColor='#faad14'/>
                                            <StarTwoTone twoToneColor='#faad14'/>
                                            <StarTwoTone twoToneColor='#faad14'/>
                                        </Select.Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={3} xl={3}>
                                <Form.Item name="status">
                                    <Dropdown datas={jobCandidateStatus} defaultOption={t('-- All Status --')}/>
                                </Form.Item>
                            </Col>
                            <Col span={2} key='submit'>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit">
                                        {t('search')}
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
                                    <Table
                                    loading={this.state.loading}
                                    dataSource={this.state.candidates}
                                    columns={columns}
                                    pagination={{
                                        total: this.state.total,
                                        pageSize: this.state.limit,
                                        hideOnSinglePage: true,
                                        showSizeChanger: false,
                                        current: this.state.page,
                                        onChange: page => this.onChangePage(page)
                                    }}
                                    rowKey={r => r.id}
                                    rowClassName={r => { 
                                        if(r.status == 1 ) {
                                            switch(r.wfid) {
                                                case '2':
                                                    return 'col-yellow';
                                                case '3':
                                                    return 'col-green';
                                                case '4':
                                                    return 'col-blue';
                                            }
                                        } else {
                                            if(r.status == 0) {
                                                return 'col-red';
                                            } 
                                            if(r.status == 2){
                                                return 'col-orange';
                                            }
                                        }
                                    }} 
                                />
                                </div>
                            </div>
                            :

                            <Table
                                loading={this.state.loading}
                                dataSource={this.state.candidates}
                                columns={columns}
                                pagination={{
                                    total: this.state.total,
                                    pageSize: this.state.limit,
                                    hideOnSinglePage: true,
                                    showSizeChanger: false,
                                    current: this.state.page,
                                    onChange: page => this.onChangePage(page)
                                }}
                                rowKey={r => r.id}
                                rowClassName={r => { 
                                    if(r.status == 1 ) {
                                        switch(r.wfid) {
                                            case '2':
                                                return 'col-yellow';
                                            case '3':
                                                return 'col-green';
                                            case '4':
                                                return 'col-blue';
                                        }
                                    } else {
                                        if(r.status == 0) {
                                            return 'col-red';
                                        } 
                                        if(r.status == 2){
                                            return 'col-orange';
                                        }
                                    }
                                }} 
                            />
                        }
                    </Col>
                </Row>

                {
                    this.state.visiblePopup ? 
                    <CandidateForm 
                        visible={ this.state.visiblePopup }
                        hidePopup={() => this.togglePopup( false )}
                        candidateID={ this.state.candidateIDPopup }
                    />
                    : []
                }
            </>
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Candidate));

