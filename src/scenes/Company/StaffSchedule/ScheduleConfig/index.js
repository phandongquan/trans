import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Table, Row, Col, Form, Input, Button} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen } from '@fortawesome/free-solid-svg-icons';
import Tab from '~/components/Base/Tab';
import tabList from '../config/tabList';
import Dropdown from '~/components/Base/Dropdown';
import TooltipButton from '~/components/Base/TooltipButton';
import DeleteButton from '~/components/Base/DeleteButton';
import { Link } from 'react-router-dom';
import {  historyReplace, historyParams ,  showNotify } from '~/services/helper';
import { deleteConfig, getListConfig } from '~/apis/company/staffSchedule/ConfigSchedule';

export class ConfigSchedule extends Component {
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
        this.getList(values);
    }
    async getList(params ={}){
        this.setState({ loading: true })
        params = {
            ...params,
            limit: this.state.limit,
            offset: (this.state.page - 1) * this.state.limit,
        }

        historyReplace(params);

        let response = await getListConfig(params)
        if(response.status){
            this.setState({datas :response.data.rows , loading: false , total : response.data.total })
        }else{
            showNotify('Notification', response.message , 'error')
        }

    }
    /**
     * @event delete 
     * @param {} e 
     */
     onDeleteConfig = (e, id) => {
        let { t } = this.props;
        e.stopPropagation();
        let xhr = deleteConfig(id);
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
     * @event submit Form
     * @param {*} values 
     */
     submitForm(values) {
        this.getList(values)
    }
    /**
     * @event change page
     * 
     * @param {*} page 
     */
    onChangePage(page) {
        let values = this.formRef.current.getFieldsValue();
        this.setState({ page }, () => this.getList({ ...values}));
    }
    
    render() {
        let { t, baseData: { departments, locations, divisions, majors } } = this.props;
        let { datas } = this.state
        const columns = [
          {
            title: "No.",
            width: 30,
            render: (r) => datas.indexOf(r) + 1,
          },
          {
            title: "Title",
            // render: r => console.log(r)
            render: (r) => <span>{r.title}</span>,
          },
          {
            title: "Department",
            width: "10%",
            render: (r) => {
              let result = [];
              Array.isArray(r.department_id) &&
                r.department_id.map((id) =>
                  result.push(
                    departments.find((d) => d.id == id)?.name ||
                      divisions.find((div) => div.id == id)?.name
                  )
                );
              return result.join(",");
            },
          },
          {
            title: "Location",
            width: "10%",
            render: (r) => {
              let location = locations.find((d) => r.location_id == d.id);
              return <span>{location?.name}</span>;
            },
          },
          {
            title: "Major",
            width: "15%",
            render: (r) => {
              let major = majors.find((d) => r.major_id == d.id && d.name);
              return <span>{major?.name}</span>;
            },
          },
          {
            title: "Action",
            width: "10%",
            align: "center",
            render: (r) => {
              return (
                <>
                  <Link
                    to={`/company/staff-schedule/config-schedule/${r.id}/edit`}
                    key="edit-config-schedule"
                  >
                    <TooltipButton
                      title={t("Edit")}
                      type="primary"
                      size="small"
                      icon={<FontAwesomeIcon icon={faPen} />}
                      style={{ marginRight: 8 }}
                    />
                  </Link>
                  <DeleteButton
                    onConfirm={(e) => this.onDeleteConfig(e, r.id)}
                  />
                </>
              );
            },
          },
        ];
        return (
            <div id='page_config_schedule'>
                <PageHeader
                    title={t('Config schedule')}
                    tags={
                        <div>
                            <Link to={`/company/staff-schedule/config-schedule/create`} key="create-config">
                                <Button key="create-schedule" type="primary" icon={<FontAwesomeIcon icon={faPlus} />}>
                                    &nbsp;{t('Add config')}
                                </Button>
                            </Link>
                        </div>
                    }
                />
                <Row className='card pl-3 pr-3 mb-3'>
                    <Form
                        className="form_config pt-3"
                        ref={this.formRef}
                        name="searchStaffForm"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical"
                    >
                        <Row className='' gutter={[12, 0]}>
                            <Col span={4}>
                                <Form.Item name="keyword">
                                    <Input placeholder={t('Search')} />
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item name="location_id" >
                                    <Dropdown datas={locations} defaultOption="-- All Location --" />
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item name="department_id" >
                                    <Dropdown datas={departments} defaultOption="-- All Department --" />
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item name="division_id" >
                                    <Dropdown datas={divisions} defaultOption="-- All Division --" />
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
                <Row className='block_config_schedule_table_in_block card pl-3 pr-3 mb-3'>
                        <Tab tabs={tabList} />
                </Row>
                <Table
                    columns={columns}
                    loading={this.state.loading}
                    dataSource={datas}
                    rowKey={d => d.id}
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

export default connect(mapStateToProps, mapDispatchToProps)(ConfigSchedule)