import React, { Component } from 'react'
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Button, Row, Col, Image, Form, DatePicker, Table } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import DeleteButton from '~/components/Base/DeleteButton';
import Tab from '~/components/Base/Tab';
import DropDown from '~/components/Base/Dropdown';
import { getList, destroy } from '~/apis/faceRegconite/person'
import tabListFaceRegconite from '../Company/config/tabListFaceRegconite';
import { checkPermission, exportToXLS, historyParams, showNotify } from '~/services/helper';
import './config/listbadface.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport } from '@fortawesome/free-solid-svg-icons';
import { formatData, getHeader } from './config/ListPersonExport';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;



class ListPerson extends Component {
    constructor(props) {
        super(props)
        let params = historyParams();
        this.state = {
            datas: [],
            loading: false,
            limit: 30,
            page: params.page ? Number(params.page) : 1,
            loadingTable: false
        }
        this.formRef = React.createRef();

        const {t} = this.props
        this.typeStatus = { 0: t('hr:notfound_receipt'), 1: t('hr:found_receipt') }
    }
    /**
     * @lifecycle 
     */
    componentDidMount() {
        this.getListPerson();
    }
    getListPerson = async (params = {}) => {
        this.setState({ loading: true })
        params = {
            ...params,
            page: this.state.page,
            limit: this.state.limit
        }
        let response = await getList(params)
        this.setState({ datas: response.data?.rows, loading: false, total: response.data?.total })
    }
    /**
     * @event change page
     * 
     * @param {*} page 
     */
    onChangePage(page) {
        let values = this.formRef.current.getFieldsValue();
        this.setState({ page }, () => this.getListPerson(values));
    }

    submitForm = (values) => {
        this.setState({ page: 1 }, () => this.getListPerson(values));
    }

    // delete image
    onDeleteImage = (e, id) => {
        let { t } = this.props;
        e.stopPropagation();
        let xhr = destroy(id);
        xhr.then((response) => {
            if (response.status) {
                let values = this.formRef.current.getFieldsValue();
                this.getListPerson(values);
                showNotify(t('Notification'), (t('image') + ('') + t('has_been_remove')));
            } else {
                showNotify(t('Notification'), response.message);
            }
        }).catch(error => {
            showNotify(t('Notification'), t('hr:server_error'));
        });
    }
    async exportData() {
        let values = this.formRef.current.getFieldsValue();
        this.setState({ loading: true })
        let params = {
            ...values,
            page: 1,
            limit: 10000
        }
        let response = await getList(params)
        if (response.status) {
            let header = getHeader();
            let data = formatData(response.data.rows, this.typeStatus)
            let fileName
            if (values.date) {
                fileName = `List-Cashier-${dayjs(values?.date[0]).format('YYYY-MM-DD')}-${dayjs(values?.date[1]).format('YYYY-MM-DD')}`;
            } else {
                fileName = `List-Cashier-${dayjs().format('YYYY-MM-DD')}`;
            }
            let datasExcel = [...header, ...data];
            this.setState({ loading: false })
            exportToXLS(fileName, datasExcel, [{ width: 10 }, { width: 20 }, { width: 35 }, { width: 25 }, { width: 25 }, { width: 15 }, { width: 15 }])
        } else {
            showNotify('Notification', response.message, 'error')
        }
    }
    render() {
        let { t, baseData: { locations }, auth: { staff_info } } = this.props;
        const columns = [
            {
                title: 'ID',
                dataIndex: 'id'
            },
            {
                title: t('store'),
                render: r => {
                    let location = locations.find(l => r.store_id == l.id)
                    let locName = location ? location.name : 'NA';
                    return (
                        <div>
                            <div><strong>{locName}</strong></div>
                            <div><small>Cam {r.channel} - {r.ip}:{r.port}</small></div>
                        </div>
                    )
                }
            },
            {
                title: t('hr:time_start'),
                dataIndex: 'ctime_start'
            },
            {
                title: t('hr:time_end'),
                dataIndex: 'ctime_end'
            },
            {
                title: t('image'),
                render: r => r.image ? <Image style={{ width: 320, height: 100 }} src={r.image} /> : ''
            },
            {
                title: t('hr:receipts'),
                dataIndex: 'order_id'
            },
            {
                title: t('status'),
                render: r => typeof this.typeStatus[r.status] !== 'undefined' ? this.typeStatus[r.status] : '',
            },
            {
                title: '',
                render: r => (staff_info.staff_dept_id == 133 ?
                    <>
                        <DeleteButton onConfirm={(e) => this.onDeleteImage(e, r.id)} />
                    </>
                    : []
                ),
                width: '20px'
            }
        ]

        return (
            <div>
                <PageHeader title={t('cashier')} />
                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={tabListFaceRegconite(this.props)} />
                    <Form
                        className="pt-3"
                        ref={this.formRef}
                        name="searchForm"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical">
                        <Row gutter={12}>
                            <Col span={3}>
                                <Form.Item name='store_id'>
                                    <DropDown datas={locations} defaultOption={t('hr:all_location')} />
                                </Form.Item>
                            </Col>
                            <Col span={5}>
                                <Form.Item name='date'>
                                    <RangePicker className='w-100' />
                                </Form.Item>
                            </Col>
                            <Col span={3}>
                                <Form.Item name="status" >
                                    <DropDown datas={this.typeStatus} defaultOption={t('hr:all_status')} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Button type="primary" style={{ marginLeft: 8 }} htmlType="submit">
                                    {t('search')}
                                </Button>
                                { checkPermission('hr-tool-face-regconite-cashier-export') ?  
                                    <Button className='ml-2' key="export-staff" type='primary' onClick={() => this.exportData()}
                                        icon={<FontAwesomeIcon icon={faFileExport} />}>{t('export_file')}
                                    </Button> 
                                    : ''
                                }
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        <Table
                            dataSource={this.state.datas}
                            columns={columns}
                            loading={this.state.loading}
                            pagination={{
                                total: this.state.total,
                                pageSize: this.state.limit,
                                hideOnSinglePage: true,
                                showSizeChanger: false,
                                current: this.state.page,
                                onChange: page => this.onChangePage(page),
                                showQuickJumper: true
                            }}
                            rowKey={(row, index) => row.id}
                            rowClassName={(r) => r?.checked ? 'bg-checked' : ''}

                        />
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

export default connect(mapStateToProps, mapDispatchToProps)((ListPerson));
