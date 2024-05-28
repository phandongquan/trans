import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Table, Row, Col, Form, Input, Button, Divider, Spin, Dropdown as DropdownTheme, Menu, Upload, Modal, TimePicker, InputNumber } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import Tab from '~/components/Base/Tab';
import tabList from '../config/tabList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus ,faPen} from '@fortawesome/free-solid-svg-icons';
import {getList , insert , update , apiDelete } from '~/apis/company/staffSchedule/ManpowerAllocation'
import Dropdown from '~/components/Base/Dropdown';
import { MinusCircleOutlined , PlusOutlined} from '@ant-design/icons';
import { checkPermission, showNotify } from '~/services/helper';
import dayjs from 'dayjs';
import DeleteButton from '~/components/Base/DeleteButton';
import { getShifts } from '~/apis/company/timesheet'
import { type_dates } from '~/constants/basic';


export class ManpowerAllocation extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            datas : [],
            data : {} ,
            visibile : false,
            breakTimes : {} ,
            shifts: [] ,
        }
    }
    /**
     * @lifecycle
     */
    async componentDidMount() {
        this.getListManpowerAllocation();
        await this.getArrayShifts();
        this.renderBreakTime();
    }
    async getListManpowerAllocation(params = {}) {
        this.setState({ loading: true });
        let response = await getList(params)
        if (response.status) {
            this.setState({ loading: false, datas: response.data.rows })
        } else {
            showNotify('Thông báo', response.message, 'error')
        }
    }
    /**
 * get array shift
 */
    getArrayShifts = async () => {
        let response = await getShifts();
        if (response.status) {
            this.setState({ shifts: response.data })
        }
    }

    /**
 * render break time from shift to dropdown
 */
    async renderBreakTime() {
        let { shifts } = this.state;
        let arrShifts = [];
        Object.keys(shifts).map((i, index) => {
            arrShifts[i] = `${i} (${shifts[i]})`;
        })
        this.setState({ breakTimes: { ...arrShifts} })
        return false;
    }

    handleSubmitForm() {
        this.formRef.current.validateFields()
        .then((values) => {
            if(values.config?.length){
                // (values.config).map((c,index)=> {
                //     c['from_time'] = dayjs(c.time[0]).format('HH:mm');
                //     c['to_time'] = dayjs(c.time[1]).format('HH:mm');
                //     delete c.time
                // })
                this.submitForm(values);
            }else{
                showNotify('Thông báo', 'Bạn chưa thêm config' , 'error')
            }
        })
        .catch((info) => {
            console.log('Validate Failed:', info);
        });
    }
    submitForm(values){
        this.setState({loading : true})
        let params = {
            ...values
        }
        let xhr ;
        let message;
        if(this.state.data.id){
            xhr = update(this.state.data.id , params)
            message= 'Cập nhật thành công!'
        }else{
            xhr = insert(params)
            message='Tạo thành công!'
        }
        xhr.then(res => {
            if(res.status){
                this.setState({loading : false , visibile : false , data : {}})
                showNotify('Thông báo' , message)
                this.getListManpowerAllocation()

            }else{
                showNotify('Thông báo' , res.message ,'error')
            }
        })
        xhr.catch(err => console.log(err))
    }
    openModalDetail(data) {
        let dataFormat = {
            ...data
        }
        this.setState({ data, visibile: true }, () => {
                // (dataFormat.config).map((d, index) => {
                //     d['time'] = [dayjs(d.from_time, 'HH:mm'), dayjs(d.to_time, 'HH:mm')]
                // })
            this.formRef.current.setFieldsValue(dataFormat)
        })
    }
    async onRemove(id){
        this.setState({loading : true})
        let response = await apiDelete(id)
        if(response.status){
            let newDatas = this.state.datas.slice()
            let dataFindIndex = newDatas.findIndex(d => d.id == id)
            newDatas.splice(dataFindIndex, 1)
            this.setState({loading : false , datas : newDatas})
            showNotify('Thông báo', 'Đã xoá thành công!')
        }else{
            this.setState({loading : false})
        }
    }
    render() {
        let { t, baseData: { departments, locations, divisions, positions, majors }} = this.props;
        const columns = [
            {
                title: t('hr:dept'),
                render: r=> {
                    let deptFound = departments.find(d => d.id == r.department_id)
                    return <span>{deptFound?.name}</span>
                }
            },
            {
                title: t('hr:location'),
                render: r=> r?.location
            },
            {
                title: t('hr:created_at'),
                render: r=> r.created_at
            },
            {
                title: t('hr:modified_at'),
                render: r=> r.updated_at
            },
            {
                title: t('hr:action'),
                render: r => <>
                {
                checkPermission('hr-staff-schedule-allocation-update') ? 
                    <Button className='mr-2' type="primary" size='small' icon={<FontAwesomeIcon icon={faPen} />} onClick={() => this.openModalDetail(r)} />
                : ''
                }
                {
                checkPermission('hr-staff-schedule-allocation-delete') ?
                        <DeleteButton onConfirm={() => this.onRemove(r.id)} />
                : ''
                }
                </>
            }
        ]
        return (
            <div>
                <PageHeader title={t('hr:manpower_allocation')}
                    tags={
                    checkPermission('hr-staff-schedule-allocation-create') ? 
                    <Button key="create" type="primary" icon={<FontAwesomeIcon icon={faPlus} />} 
                    onClick={()=> {
                        this.setState({visibile: true, data:{}})
                    }}>
                        &nbsp;{t('hr:add_new')}
                    </Button>
                    : ''
                    }
                />
                <Row className='card p-2'>
                    <Tab tabs={tabList(this.props)} />
                </Row>
                <Table pagination={{ pageSize: 30 }}
                    columns={columns}
                    dataSource={this.state.datas}
                />
                <Modal title={this.state.data.id ? t('update') : t('create')}
                    open={this.state.visibile}
                    onCancel={() => {
                        this.formRef.current.resetFields()
                        this.setState({ visibile: false })
                    }}
                    onOk={() => this.handleSubmitForm()}
                    okText={t("submit")}
                    cancelText={t("cancel")}
                    width={'50%'}
                >
                    <Form ref={this.formRef} layout="vertical" >
                        <Row gutter={12}>
                            <Col span={6}>
                                <Form.Item name={'department_id'} label={t('hr:dept')}>
                                    <Dropdown datas={departments} defaultOption={t("hr:all_department")} rules={[{ required: true, message: 'Missing Department' }]}/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name={'location_id'} label={t('hr:location')}>
                                    <Dropdown datas={locations} defaultOption={t("hr:all_location")} rules={[{ required: true, message: 'Missing Location' }]}/>
                                </Form.Item>
                            </Col>

                            <Col span={24}>
                                <Row gutter={6}>
                                    <Col span={8} className='text-center'>
                                        <span className="text-muted">{t('hr:major')}</span>
                                    </Col>
                                    <Col span={6} className='text-center'>
                                        <span className="text-muted">{t('hr:time')}</span>
                                    </Col>
                                    <Col span={6} className='text-center'>
                                        <span className="text-muted">{t('hr:date')}</span>
                                    </Col>
                                    <Col span={3} className='text-center'>
                                        <span className="text-muted">{t('person')}</span>
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={24}>
                                <Form.List name="config" label={t("hr:config")}>
                                    {(fields, { add, remove }) => (
                                        <>
                                            {fields.map(({ key, name, fieldKey, ...restField }) => {
                                                let arrDatasForm = this.formRef.current.getFieldsValue().config
                                                let valueCheck = arrDatasForm.find((v, index) => index == key)
                                                return (
                                                    <Row gutter={12} key={key}>
                                                        <Col span={8}>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, "major_id"]}
                                                                fieldKey={[fieldKey, "major_id"]}
                                                                rules={[{ required: true, message: 'Missing Major' }]}
                                                            >
                                                                <Dropdown datas={majors} defaultOption={t("hr:major")} mode='multiple' />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={6} className='text-center'>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, "shift_code"]}
                                                                fieldKey={[fieldKey, "shift_code"]}
                                                                rules={[{ required: true, message: 'Missing Time' }]}
                                                            >
                                                                <Dropdown datas={this.state.breakTimes} defaultOption={t("hr:all_time")} />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={6} className='text-center'>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, "type_date"]}
                                                                fieldKey={[fieldKey, "type_date"]}
                                                                rules={[{ required: true, message: 'Missing date' }]}
                                                            >
                                                                <Dropdown datas={type_dates} defaultOption={t("hr:all_date")} />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={3} className='text-center'>
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, "person"]} 
                                                                fieldKey={[fieldKey, "person"]}
                                                                rules={[{ required: true, message: 'Missing Person' }]}
                                                            >
                                                                <InputNumber min={1} max={20}/>
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={1}>
                                                            <MinusCircleOutlined
                                                                className="mt-2"
                                                                onClick={() => {
                                                                    remove(name);
                                                                    // this.updateMassDelete(key);
                                                                }}
                                                            />
                                                        </Col>
                                                    </Row>
                                                )
                                            })}
                                            <Form.Item>
                                                <Button
                                                    className='mt-2'
                                                    type="dashed"
                                                    onClick={() => add()}
                                                    block
                                                    icon={<PlusOutlined />}
                                                >
                                                   {t("hr:add")}
                                                </Button>
                                            </Form.Item>
                                        </>
                                    )}
                                </Form.List>
                            </Col>
                        </Row>
                    </Form>
                </Modal>
            </div>
        )
    }
}
/**
 * Map redux state to component props
 * @param {Object} state 
 */
const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    }
}
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(ManpowerAllocation)