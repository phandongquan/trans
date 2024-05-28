import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next';
import { PageHeader } from '@ant-design/pro-layout';
import { Button, Input, Modal, Row, Table } from 'antd';
import { getList, updateSolution } from '~/apis/powerOutageSchedule';
import { showNotify } from '~/services/helper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink, faPen } from '@fortawesome/free-solid-svg-icons';
import Tab from '~/components/Base/Tab';
import tabList from '~/scenes/ElectricityManagement/config/tabList'
const urlWorkTask = 'https://work.hasaki.vn/tasks?task_id='



export class PowerOutageSchedule extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            datas: [],
            loading: false,
            data : {} ,
            visible : false ,
            textSolution : '',
        }
    }
    componentDidMount(){
        this.getListSchedule()
    }
    async getListSchedule(params = {}){
        this.setState({loading : true})
        params = {
            ...params
        }
        let response = await getList(params)
        if(response.status){
            this.setState({datas : response.data.rows , loading : false})
        }else{
            showNotify('Notification', response.message , 'error')
            this.setState({loading : false})
        }
    }
    async submitModal () {
        let values = {
            solution : this.state.textSolution,
        }
        let response = await updateSolution(this.state.data.id , values)
        if(response.status){
            showNotify('Notification', 'success!')
            this.getListSchedule()
            this.setState({visible : false })
        }else{
            showNotify('Notification', response.message , 'error')
        }
    }
    render() {
        let { t } = this.props;
        const columns = [
            {
                title: 'No.',
                width : '5%',
                render : r => this.state.datas.indexOf(r) + 1
            },
            {
                title : t('location'),
                render :r=> r.name
            },
            {
                title : t('makh'),
                render :r=> r.makh
            },
            {
                title: t('Date power outage'),
                width: '15%',
                render: r => <><span>From: {r.from_date}</span><br />
                    <span>To: {r.to_date}</span><br />
                </>
            },
            {
                title: t('content'),
                width : '25%',
                render : r=> <div dangerouslySetInnerHTML={{ __html: r.content }} />
            },
            {
                title: t('solution'),
                render : r => r.solution
            },
            {
                title : t('date'),
                render : r => <>
                    <small>
                        <span>created: {r.created_at}</span> 
                    </small><br/>
                    <small>
                        <span>updated: {r.updated_at}# <strong>By {r.update_by}</strong></span> 
                    </small>
                </>
            },
            {
                title: t('action'),
                render: r => <>
                    <Button
                        type='primary'
                        size='small'
                        icon={<FontAwesomeIcon icon={faPen} />}
                        onClick={() => this.setState({ visible: true, textSolution: r.solution, data: r })} />
                    <a className='ml-2' href={urlWorkTask + r.task_id} target="_blank">
                        <Button type="primary" size='small' icon={<FontAwesomeIcon icon={faLink} />}/>
                    </a>
                </>
            }

        ]
        return (
            <div>
                <PageHeader title={t('Power Outage Schedule')} />
                <Row className='card pl-3 pr-3 mb-3'>
                    <Tab tabs={tabList()} />
                </Row>
                <Table
                    dataSource={this.state.datas}
                    columns={columns}
                    pagination={{
                        pageSize : 20,
                        showSizeChanger : false
                    }}
                    loading ={this.state.loading}
                 />
                 <Modal
                    open={this.state.visible}
                    title={t('Edit solution')}
                    onCancel={() => this.setState({ visible: false })}
                    onOk={() => this.submitModal()}
                 >
                    <Input.TextArea value={this.state.textSolution} onChange={e => this.setState({textSolution : e.target.value})} placeholder='Solution' />

                 </Modal>
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
  
  export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(PowerOutageSchedule))