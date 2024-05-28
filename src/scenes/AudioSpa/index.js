import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next';
import { Row, Col, Form, Table, Button, Dropdown as DropdownAnt, Modal , DatePicker} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import axios from 'axios';
import Dropdown from '~/components/Base/Dropdown';
import dayjs from 'dayjs';
import Audio from './Audio';
import { showNotify } from '~/services/helper';

export class AudioSpa extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef()
        this.state = {
            datas: [],
            data: {},
            token: '',
            datasShop : [],
            datasDevice : [],
            nameShop : '',
            ip : ''
        }
    }
    componentDidMount() {
        this.getToken()
    }
    async getToken() {
        await axios.get(`https://audio-apis.run.app.rdhasaki.com/api/v1/auth/all`)
            .then(res => {
                this.setState({ token: res.data.Data }, () => this.getListShop())
            })
            .catch(err => {
                console.log(err)
            })
    }
    async getListShop(params ={}) {
        const { baseData: { locations } } = this.props;
        await axios.get(`https://audio-apis.run.app.rdhasaki.com/api/v1/audio/ip`,{ headers: {"Authorization" : `Bearer ${this.state.token}`} })
            .then(res => {
                let datas = res.data
                let result = []
                // let newDatas = res.data.reduce((a, v) => ({ ...a, [v]: v}), {})
                // this.setState({datasShop : newDatas})
                datas.map(d => {
                    let nameIp = locations.find(l => {
                        if(l.ip && l.ip.length){
                            let arrIP = l.ip
                            if(arrIP.includes(d)){
                                return l
                            } else{
                                return
                            }
                        }
                    } )
                    result.push({
                        id : d,
                        name : nameIp ? nameIp.name : d
                    })
                })
                this.setState({datasShop : result})

            })
            .catch(err => {
                console.log(err)
            })
    }

    async getListDevice (date){
        let {ip} = this.state
        await axios.get(`https://audio-apis.run.app.rdhasaki.com/api/v1/audio/device?ip=${ip}&date=${date}`, { headers: { "Authorization": `Bearer ${this.state.token}` } })
        // await axios.get(`https://audio-apis.run.app.rdhasaki.com/api/v1/audio/list?ip=${ip}&year=${year}&month=${month}&day=${day}`, { headers: { "Authorization": `Bearer ${this.state.token}` } })
            .then(res => {
                if (res.data.length) {
                    let newDatas = res.data.reduce((a, v) => ({ ...a, [v]: v }), {})
                    this.setState({ datasDevice: newDatas })
                } else {
                    showNotify('Notification', 'Không có dữ liệu thiết bị', 'error')
                    this.setState({datasDevice : []})
                }

            })
            .catch(err => {
                console.log(err)
            })
    }
    async submitForm (values) {
        await axios.get(`https://audio-apis.run.app.rdhasaki.com/api/v1/audio/list`, 
            { headers: { "Authorization": `Bearer ${this.state.token}` } ,
                params : values
            } , 
            ) 
            .then(res => {
                let newDatas = res.data
                let datasFormat = []
                if(newDatas.length){
                    newDatas.map(d => {
                        datasFormat.push({
                            ...d,
                            src : `https://audio-apis.run.app.rdhasaki.com/api/v1/audio/play?token=${this.state.token}&fileName=${d.file_path}${d.file_name}`,
                            // name : 
                        })
                    })
                    this.setState({datas : datasFormat})
                }
            })
            .catch(err => {
                console.log(err)
            })
    }
    /**
     * @event before submit form
     * Validate before submit
     */
     handleFormSubmit() {
        this.formRef.current.validateFields()
            .then((values) => {
                values = {
                    ...values, 
                    date : dayjs(values.date).format('YYYY/MM/DD')
                }
                this.submitForm(values)
            }
             )
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    }
    //  formatBytes(bytes, decimals = 2) {
    //     if (!+bytes) return '0 Bytes'
    
    //     const k = 1024
    //     const dm = decimals < 0 ? 0 : decimals
    //     const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    
    //     const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    //     return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
    // }
    render() {
        const { t } = this.props;
        const {datasShop , datasDevice , datas } = this.state
        const columns = [
            {
                title: 'No.',
                render : r => datas.indexOf(r) + 1,
                width: '5%'
            },
            {
                title: t('file'),
                render : r => <span>{r.file_name}</span>
            },
            {
                title: t('hr:size'),
                render : r => <span>{r.size} MB</span>
            },
            {
                title: t('last_update'),
                render : r => <span>{dayjs(r.last_updated * 1000).format('YYYY-MM-DD HH:mm')}</span>
            },
            {
                title : t('hr:play'),
                render: r => <Audio source={r.src}/>,
                width: '10%'
            }
        ]
        return (
            <>
                <PageHeader title={t('hr:audio_spa')} />
                <Row className="card pl-3 pr-3 mb-1">
                    <Form ref={this.formRef} className="pt-3" name="searchForm" onFinish={this.handleFormSubmit.bind(this)}>
                        <Row gutter={12}>
                            <Col span={4}>
                                <Form.Item name={'ip'}   rules={[{ required: true, message: t('hr:choose_location') }]}>
                                    <Dropdown datas={datasShop} defaultOption={t('hr:all_location')} onChange={v => {
                                        // this.getListDevice( v)
                                        this.setState({ip : v})
                                        this.formRef.current.setFieldsValue({deviceName : null})
                                        }}/>
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item name={'date'}  rules={[{ required: true, message: t('hr:choose_date') }]}>
                                    <DatePicker  className='w-100'
                                    onChange={e => {
                                        this.getListDevice(dayjs(e).format('YYYY/MM/DD'))
                                        this.formRef.current.setFieldsValue({deviceName : null})
                                    }}
                                     />
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item name={'deviceName'}>
                                    <Dropdown datas={datasDevice} defaultOption={t('hr:all_device')}/>
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
                <Table dataSource={datas}
                    columns={columns}
                    rowKey={'file_name'}
                    pagination={{
                        pageSize : 50
                    }}
                />
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
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(AudioSpa)