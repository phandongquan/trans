import { PageHeader } from '@ant-design/pro-layout'
import { Button, Table, Row, Col, Form, Dropdown as DropdownAntd, Tag, Badge, Popconfirm} from 'antd';
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Tab from '~/components/Base/Tab';
import tabList from '~/scenes/Company/Job/config/tab';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import Dropdown from '~/components/Base/Dropdown';
import { getList as apiGetListCriteria , getListCriteriaJob, updateListCriteriaJob } from '~/apis/company/job/evaluationcriteria'
import { checkPermission, showNotify } from '~/services/helper';
import { screenResponsive, statusCriteria, typeOnWeb } from '~/constants/basic';
import { uniqueId } from 'lodash';
import debounce from 'lodash/debounce';
import DeleteButton from '~/components/Base/DeleteButton';
import { QuestionCircleOutlined } from '@ant-design/icons';


const colorStatus = {1 :'#a5e9a5' , 0 :'#b4bcc1'  }
export class EvaluationCriteria extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.formCriteriaRef = React.createRef();
        this.state = {
            loading: false,
            datas: [],
            data: {},
            visible: false,
            datasModal : [],
            listCriteria : [],
            selectedRowKeys : []
        };
        this.getListCriteria = debounce(this.getListCriteria, 500);
    }
    componentDidMount(){
        this.getListEvaluationCriteriaJob()
        // this.getListCriteria()
    }
    async getListEvaluationCriteriaJob(params = {}){
        let { match } = this.props ; 
        let { id } = match.params;
        params = {
            ...params,
            job_id : id
        }
        this.setState({loading: true});
        let response = await getListCriteriaJob(params)
        if(response.status){
            this.setState({loading : false , datas : response.data.rows})
            
        }else{
            showNotify('Notification',response.message , 'error')
            this.setState({loading : false})
        }
    }
    /**
     * List Criteria for dropdown
     */
    async getListCriteria(params = {}){
        params = {
            ...params,
            limit : 20 ,
            status : 1 //active
        }
        let response = await apiGetListCriteria(params)
        if(response.status){
            this.setState({ listCriteria : response.data.rows})
            
        }else{
            showNotify('Notification',response.message , 'error')
        }
    }
    /**
     * @event Search Criteria
     * @param {*} value 
     */
    onSearchCriteria(value){
        if (!value) {
            return;
        }
        this.getListCriteria({keyword : value });
    }
    async onCreateJobCriteria(arrId){
        let { match } = this.props ; 
        let { id } = match.params;
        let params = {
            job_id : id ,
            type : 'add'
        }
        if(arrId.length){
            let response = await updateListCriteriaJob(params , arrId)
            if(response.status){
                showNotify('Notification',response.message )
                this.getListEvaluationCriteriaJob()
                this.formCriteriaRef.current.resetFields()
            }
        }else{
            showNotify('Notification','Please choose criteria!', 'error')
        }
    }
    async onMassDeleteJobCriteria(arrId){
        let { match } = this.props ; 
        let { id } = match.params;
        let params = {
            job_id : id ,
            type : 'delete'
        }
        if(arrId.length){
            let response = await updateListCriteriaJob(params , arrId)
            if(response.status){
                showNotify('Notification',response.message )
                this.getListEvaluationCriteriaJob()
            }
        }else{
            showNotify('Notification','Please choose criteria!', 'error')
        }
    }
    onSelectChange = (newSelectedRowKeys) => {
        this.setState({selectedRowKeys:  newSelectedRowKeys});
      };
    render() {
        let { t, match , baseData : {majors} } = this.props;
        let { id } = match.params;
        let { datas } = this.state;
        let {selectedRowKeys} = this.state
        const rowSelection = {
            selectedRowKeys,
            onChange: value => this.onSelectChange(value),
        };

        const hasSelected = selectedRowKeys.length > 0;

        const columns = [
            {
                title: 'No.',
                render : r => datas.indexOf(r) + 1
            },
            Table.EXPAND_COLUMN,
            {
                title: 'Criteria',
                dataIndex: 'criteria_name'
            },
            {
                title : 'Majors',
                render : r => {
                    let result = []
                    if(Array.isArray(r.major_id) && r.major_id.length){
                        let arrMajors = r.major_id
                        arrMajors.map((majorId,index) => {
                            let majorFind = majors.find(m => m.id == majorId)
                            if(majorFind){
                                result.push(<span key={index}>{index == 0 ? '' : ','} {majorFind.name}</span>)
                            }
                        })
                    }
                    return <div style={{maxWidth:'500px'}}>{result}</div>
                }
            },
            {
                title : 'On web',
                render : r => typeOnWeb[r.on_web]
            },
            {
                title: 'Status',
                render: r =><Tag className='text-center' color={colorStatus[r.status]}>
                                {statusCriteria[r.status]}
                            </Tag>
            },
            // {
            //     title : 'SubCriteria',
            //     render :r => {
            //         let result = [];
            //         if(Array.isArray(r.sub_criterias) && r.sub_criterias.length){
            //             r.sub_criterias.map(s => 
            //                 result.push(<div>{s?.sub_criteria_name}</div>)
            //             )
            //         }
            //         return result
            //     }
            // },
            // {
            //     title : 'Point',
            //     render :r => {
            //         let result = [];
            //         if(Array.isArray(r.sub_criterias) && r.sub_criterias.length){
            //             r.sub_criterias.map(s => 
            //                 result.push(<div className='mt-2'>{s?.point}</div>)
            //             )
            //         }
            //         return result
            //     }
            // },
            {
                title: 'SubCriteria',
                render: r => {
                    let result = [];
                    if (Array.isArray(r.sub_criterias) && r.sub_criterias.length) {
                        r.sub_criterias.map(s =>
                            result.push(<Row gutter={12}>
                                <Col span={12}>
                                    <ul><li> {s?.sub_criteria_name}</li></ul>
                                </Col>
                                <Col span={12}>
                                    <ul><li> {s?.point}</li></ul>
                                </Col>
                            </Row>)
                        )
                    }
                    return result.length ? <>
                        {result}
                    </>
                    :[]
                }
            },
            {
                title: 'Actions',
                render: r=> (
                checkPermission('hr-job-detail-evalution-criteria-delete') ? 
                <DeleteButton onConfirm={() => this.onMassDeleteJobCriteria([r.id])} />
                : ''
                )
            }
        ]
        return (
            <div>
                <PageHeader
                    title={t('Job Evaluation Criteria')}
                />
                <Row className={window.innerWidth < screenResponsive ? "card pl-3 pr-3 mb-3 pb-3" : "card pl-3 pr-3 mb-3"}>
                    <Tab tabs={tabList(id)}></Tab>
                    {/* <Form
                        className="pt-3"
                        ref={this.formRef}
                        name="searchStaffForm"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical"
                    >
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <Form.Item name="major_id">
                                    <Dropdown datas={majors} defaultOption={'-- All Majors --'} mode={'multiple'}/>
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} key='submit'>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit">
                                        {t('Search')}
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form> */}
                </Row>
                <Table
                    rowSelection={rowSelection}
                    dataSource={this.state.datas}
                    columns={columns}
                    pagination={{
                        pageSize: 30
                    }}
                    rowKey='id'
                    footer={() => <Popconfirm title={('Confirm delete selected criteria?')}
                        placement="topLeft"
                        icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                        onConfirm={() => this.onMassDeleteJobCriteria(this.state.selectedRowKeys)}
                    >
                    {
                    checkPermission('hr-job-detail-evalution-criteria-delete') ? 
                        <Button type='primary' disabled={hasSelected ? false : true}
                            icon={<FontAwesomeIcon icon={faTrashAlt} />} >
                            &nbsp;Remove selected criteria
                        </Button>
                    : ''
                    } 
                    </Popconfirm>}
                />
                <Row className="card p-3 pt-1 mb-0">
                    <h5>Add Criteria for job</h5>
                    <Form preserve={false} ref={this.formCriteriaRef}>
                        <Row gutter={12}>
                            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                <Form.Item label={null} name="criteria_id">
                                    <Dropdown datas={this.state.listCriteria} mode={'multiple'}
                                        // value={this.state.CriteriaDropdownSelected}
                                        onSearch={this.onSearchCriteria.bind(this)} defaultOption="-- Type to search Criteria --" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                {
                                    checkPermission('hr-job-detail-evalution-criteria-create') ? 
                                        <Button type='primary' onClick={() => {
                                            let { criteria_id } = this.formCriteriaRef.current.getFieldsValue();
                                            return this.onCreateJobCriteria(criteria_id);
                                        }} >
                                            <FontAwesomeIcon icon={faPlus} />&nbsp;Add
                                        </Button>
                                    : ''
                                }
                            </Col>
                        </Row>
                    </Form>
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
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(EvaluationCriteria)