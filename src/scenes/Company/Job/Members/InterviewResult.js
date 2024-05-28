import { faEye, faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Col, DatePicker, Form, Input, Modal, Row, Table } from 'antd'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getDetailInterview, getListInterview, getResultDetailInterview, updateDetailInterview } from '~/apis/company/job/candidate';
import Dropdown from '~/components/Base/Dropdown';
import { showNotify } from '~/services/helper';
import dayjs from 'dayjs';
import { typeInterviewResult } from '~/constants/basic';
import StaffDropdown from '~/components/Base/StaffDropdown';


const arrKeysDefault = ['interview_date','interview_note', 'interview_result','interviewer_name' , 'interviewer_id']
export class InterviewResult extends Component {
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = { 
            datas: [],
            data : {},
            visible : false,
            loading: false,
            visibleView : false,
            datasDetail : [] ,
            exam_id : null,
            datasView : {}
        }
    }
    componentDidMount(){
    this.getList()
    }
    async getList(params = {}){
        let { candidate_id , job_id } = this.props
        params = {
            candidate_id : candidate_id ,
            job_id : job_id
        }
        this.setState({loading : true})
        let response = await getListInterview(params)
        if(response.status){
            this.setState({loading : false , datas : response.data.rows})
        }else{
            showNotify('Notifications', response.message , 'error')
        }
    }
    formatDatasDetail (datas){
        let result = [
            ...datas.candidate_criteria,
            ...datas.interviewer_criteria,
        ]
        return result
    }
    async openView(exam_id){
        let params = {
            exam_id : exam_id
        }
        let response = await getResultDetailInterview(params)
        if(response.status){
            this.setState({datasView : response.data , visibleView: true})
        }else{
            showNotify('Notifications', response.message , 'error')
        }
    }
    async openEdit(exam_id){
        let params = {
            exam_id : exam_id
        }
        let response = await getDetailInterview(params)
        if(response.status){
            let datasFormat = this.formatDatasDetail(response.data.rows) 
            this.setState({datasDetail : datasFormat , visible : true , exam_id : exam_id})
        }
        let responseResult = await getResultDetailInterview(params)
        if(responseResult.status){
            let dataResult =  responseResult.data
            let criteriasResult = responseResult.data.rows
            if(criteriasResult?.length){
                criteriasResult.map(c => dataResult[c.criteria_id] = c.id)
            }
            if(dataResult['interview_date']){
                dataResult['interview_date'] = dayjs(dataResult['interview_date'], 'DD/MM/YYYY HH:mm:ss')
            }
            if(dataResult['interview_result'] == 0 ){
                dataResult['interview_result'] = null
            }
            this.formRef.current.setFieldsValue(dataResult)
        } 
    }
    async submitModal () {
        let values = this.formRef.current.getFieldsValue()
        let data = {}
        let arrCriteria = []
        Object.keys(values).map((key, i) => {
            if(arrKeysDefault.includes(key)){
                data[key] = values[key]
            }else{
                arrCriteria.push({ criteria_id : key , sub_criterias_id : values[key] })

            }
        })
        data.sub_criterias = JSON.stringify(arrCriteria)
        if(data.interview_date){
            data.interview_date = dayjs(data.interview_date).format('YYYY-MM-DD HH:mm:ss')
        }
        let params = {
            exam_id : this.state.exam_id
        }
        let response = await updateDetailInterview(params , data)
        if(response.status){
            this.getList()
            showNotify('Notification', response.message)
            this.setState({visible: false })
        }else{
            showNotify('Notification', response.message , 'error')
        }
    }
    renderEdit(){
        let result = []
        let { datasDetail } = this.state
        if (datasDetail.length) {
            datasDetail.map(d =>{
                (d.sub_criterias).map(sub => sub.name = sub.sub_criteria_name)
                result.push(<Col key={d.id} span={6}>
                    <Form.Item label={d.criteria_name} name={d.id}>
                        <Dropdown datas={d.sub_criterias}/> 
                    </Form.Item>
                </Col>)
            })
        }
        return <Form ref={this.formRef} layout='vertical'>
            <Row gutter={[24,12]}>
                {result}
                <Col span={6}>
                    <Form.Item name={'interview_date'} label='Date interview'>
                        <DatePicker
                            format="YYYY-MM-DD HH:mm:ss"
                            showTime={{
                                defaultValue: dayjs('00:00:00', 'HH:mm:ss'),
                            }} />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    {/* <Form.Item name={'interviewer_name'} label='Interviewer'>
                        <Input />
                    </Form.Item> */}
                    <Form.Item name={'interviewer_id'} label = 'Interviewer'>
                        <StaffDropdown defaultOption={'-- All staffs --'} />
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name={'interview_result'} label='Interview result'>
                        <Dropdown datas ={typeInterviewResult} />
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Form.Item name={'interview_note'} label='Ghi chú' >
                        <Input.TextArea minLength={3} />
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    }
    renderView(){
        let {datasView} = this.state 
        let result = []
        let datasCriteria = datasView?.rows ? datasView.rows : []
        datasCriteria.map((d, i) => {
            result.push(<Col span={6} key={i}>
                <div>
                    <strong>{d?.criteria_name}</strong><br/>
                    <span>{d?.sub_criteria_name}</span>
                </div>
            </Col>)
        })
        return <Row gutter={[24,12]}>
            {result}
            <Col span={6}>
                <div>
                    <strong>Date apply</strong><br/>
                    <span>{datasView?.apply_date}</span>
                </div>
            </Col>
            <Col span={6}>
                <div>
                    <strong>Date interview</strong><br/>
                    <span>{datasView?.interview_date}</span>
                </div>
            </Col>
            <Col span={6}>
                <div>
                    <strong>Interview note</strong><br/>
                    <span>{datasView?.interview_note}</span>
                </div>
            </Col>
            <Col span={6}>
                <div>
                    <strong>Test result</strong><br/>
                    <span>{typeInterviewResult[datasView?.test_result]}</span>
                </div>
            </Col>
            <Col span={6}>
                <div>
                    <strong>Interview result</strong><br/>
                    <span>{typeInterviewResult[datasView?.interview_result]}</span>
                </div>
            </Col>
            <Col span={6}>
                <div>
                    <strong>Interviewer</strong><br/>
                    <span>{datasView?.interviewer_name}</span>
                </div>
            </Col>
        </Row>
    }
    render() {
        const columns = [
            {
                title: 'No.',
                render : r=> this.state.datas.indexOf(r) + 1
            },
            {
                title: 'Job title',
                dataIndex: 'job_title'
            },
            {
                title: 'Point',
                // dataIndex: 'interview_score'
                render: r => <><span>{r.interview_score}/{r.point}</span></>
            },
            {
                title: 'Interview note',
                dataIndex : 'interview_note',
            },
            {
                title: 'Test result',
                // dataIndex : 'test_result',
                render:  r => typeInterviewResult[r.test_result]
            },
            {
                title: 'Interview result',
                // dataIndex : 'interview_result',
                render:  r => typeInterviewResult[r.interview_result]
            },
            {
                title: 'Date apply',
                dataIndex : 'apply_date',

            },
            {
                title: 'Date interview',
                dataIndex : 'interview_date'
            },
            {
                title: 'Interviewer',
                dataIndex : 'interviewer_name'
            },
            {
                title: 'Action',
                width: '7%',
                render : r=> <>
                        <Button size='small' className='mr-2' icon={<FontAwesomeIcon icon={faEye} />} onClick={()=> this.openView(r.exam_id)} />
                        <Button  size='small' className='mr-2' icon={<FontAwesomeIcon icon={faPen}/>}onClick={()=> this.openEdit(r.exam_id)} type='primary'/>
                    </>
                
            },
        ]
        return (
            <div>
                <Table
                    dataSource={this.state.datas}
                    columns={columns}
                    pagination={false}
                    loading={this.state.loading}
                    rowKey='exam_id'
                />
                <Modal 
                    title='View'
                    open={this.state.visibleView} 
                    onCancel={()=> this.setState({visibleView: false})}
                    footer={false}
                    width={'70%'}
                >
                    {this.renderView()}
                </Modal>
                <Modal 
                    title='Edit'
                    open={this.state.visible} 
                    onCancel={()=> this.setState({visible: false})}
                    // footer={false}
                    onOk={()=> this.submitModal()}
                    width={'70%'}
                    afterClose={() => this.setState({datasDetail : [] , exam_id : null})}
                >
                   {this.renderEdit()}
                </Modal>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(InterviewResult)