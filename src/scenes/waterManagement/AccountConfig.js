import React, { useEffect, useRef, useMemo } from "react";
import { PageHeader } from '@ant-design/pro-layout';
import { Row, Col, Spin, Divider, Table, Form, Input, Button, Modal, DatePicker } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faPlus } from '@fortawesome/free-solid-svg-icons';
import tabList from './config/tabList';
import Tab from '~/components/Base/Tab';
import Dropdown from '~/components/Base/Dropdown';
import { getList, deleteAccountConfig, updateAccountConfig, createAccountConfig } from "~/apis/waterManagement";
import { checkPermission, showNotify } from "~/services/helper";
import { statusElectricLocations, basicStatus, dateFormat } from '~/constants/basic';
import { useSelector, useDispatch } from 'react-redux';
import DeleteButton from '~/components/Base/DeleteButton';
import dayjs from 'dayjs';

export default function AccountConfigWater(props) {
    const [datas, setDatas] = React.useState([]);
    const [data, setData] = React.useState({});
    const [loading, setLoading] = React.useState(false);
    const [visible, setVisible] = React.useState(false);
    const formRef = useRef();
    const formModalRef = useRef();
    let titleModal = datas.id ? 'Update' : 'Create';
    const locations = useSelector(state => state.baseData.locations);
    useEffect(() => {
        getListData();
    }, []);
    useEffect(() => {
        if (visible && data != {}) {
            data.opening_day = data.opening_day ? dayjs(data.opening_day) : null
            formModalRef.current.setFieldsValue(data);
        }
    }, [visible]);

    const getListData = async (params = {}) => {
        setLoading(true);
        let res = await getList(params);
        if (res.status) {
            setDatas(res.data.rows.rows);
            setLoading(false);
        } else {
            setLoading(false);
            showNotify('Notification', res.message, 'error');
        }
    }
    const deleteData = async (id) => {
        let res = await deleteAccountConfig(id);
        if (res.status) {
            showNotify('Notification', res.message, 'success');
            let values = formRef.current.getFieldsValue()
            getListData(values);
        } else {
            showNotify('Notification', res.message, 'error');
        }
    }
    const handleOpenCreate = () => {
        setVisible(true);
        setData({});
    }
    const submitForm = () => {
        let values = formRef.current.getFieldsValue()
        getListData(values)
    }
    const popupModal = (editData) => {
        setVisible(true);
        setData(editData);
    }
    const cancelModal = () => {
        setVisible(false);
        setData({});
    }
    const submitModal = async () => {
        let values = formModalRef.current.getFieldsValue()
        if (!values.makh || !values.location_id) {
            showNotify('Notification', 'Please fill in all required fields', 'error');
            return;
        }
        if(values.opening_day){
            values = {
                ...values,
                opening_day: dayjs(values.opening_day).format(dateFormat)
            }
        }
        let xhr
        let message = ''
        if (data.id) {
            values = {
                ...values,
                id: data.id
            }
            xhr = updateAccountConfig(values)
            message = 'Updated success!'
        } else {
            values = {
                ...values,
                id: 0
            }
            xhr = createAccountConfig(values)
            message = 'Created Success!'
        }
        xhr.then(res => {
            if(res.data == -1){
                showNotify('Notification', 'PE code already exists', 'error')
                return
            }
            if (res.status) {
                showNotify('Notification', message)
                let valuesSearch = formRef.current.getFieldsValue()
                getListData(valuesSearch)
                setVisible(false)
            } else {
                showNotify('Notification', res.message, 'error')
            }
        })
        xhr.catch(err => showNotify('Notification', err, 'error'))

    }

    const columns = [
        {
            title: 'No.',
            width: 60,
            render: r => datas.indexOf(r) + 1
        },
        {
            title: 'Mã danh bộ',
            width: 150,
            render: r => r.makh
        },
        {
            title: 'Location',
            fixed: 'left',
            width: 300,
            render: r => locations.find(l => l.id == r.location_id)?.name
        },
        {
            title: 'Status',
            render: r => statusElectricLocations[r.status]
        },
        {
            title: 'Department code',
            width: 150,
            render: r => r.department_code
        }
        ,
        {
            title: 'Opening day',
            width: 150,
            render: r => r.opening_day ? dayjs(r.opening_day).format(dateFormat) : ''
        },
        {
            title: 'Division',
            width: 150,
            render: r => basicStatus[r.division]
        }
        ,
        {
            title: 'Headcount (m2)',
            width: 150,
            render: r => r.useable_area
        },
        {
            title: 'Vendor code',
            width: 150,
            render: r => r.vender_code
        },
        {
            title: 'Note',
            dataIndex: 'note',
            width: 200
        },

        {
            title: 'Action',
            width: 150,
            render: r => (
                <>
                    {checkPermission('hr-tool-water-management-update') ? (
                        <Button
                            icon={<FontAwesomeIcon icon={faPen} />}
                            className='mr-2'
                            type='primary'
                            size='small'
                            onClick={() => popupModal(r)}
                        />
                    ) : null}
                    {
                        checkPermission('hr-tool-water-management-delete') ? (
                            <DeleteButton
                                onConfirm={() => deleteData(r.id)}
                            />
                        ) : null
                    }
                </>
            )
        },
    ];
    return (
        <div>
            <PageHeader title='Water Account Config'
                tags={
                    checkPermission('hr-tool-water-management-create') ?
                <Button icon={<FontAwesomeIcon icon={faPlus} />} type='primary' onClick={handleOpenCreate} >&nbsp;Add new</Button>
                : null}
            />
            <Row className='card pl-3 pr-3 mb-3'>
                <Tab tabs={tabList()} />
                <Form
                    className="mt-2 form_Electricity"
                    ref={formRef}
                    name="searchForm"
                    onFinish={submitForm}
                >
                    <Row gutter={24}>
                        <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                            <Form.Item name={'makh'} >
                                <Input placeholder='code' />
                            </Form.Item>
                        </Col>
                        <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                            <Form.Item name={'location_id'} >
                                <Dropdown datas={locations} defaultOption='-- All locations --' />
                            </Form.Item>
                        </Col>
                        <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                            <Form.Item name={'status'}>
                                <Dropdown datas={statusElectricLocations} defaultOption='All status' />
                            </Form.Item>
                        </Col>
                        <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                            <Button type="primary" htmlType="submit">Search</Button>
                        </Col>
                    </Row>
                </Form>
            </Row>
            <Table
                rowKey='id'
                loading={loading}
                columns={columns}
                dataSource={datas}
                pagination={{ pageSize: 30, showSizeChanger: false }} />
            <Modal title={data.id ? 'Update' : 'Create'}
                width='60%'
                open={visible}
                onCancel={cancelModal}
                onOk={submitModal}
                afterClose={() => {
                    formModalRef.current.resetFields()
                    setData({})
                }}
            >
                <Form requiredMark={true} layout="vertical" ref={formModalRef}>
                    <Row gutter={12}>
                        <Col span={8}>
                            <Form.Item name={'makh'} label='Mã danh bộ' rules={[{
                                required: true,
                                message: 'Please input empty field'
                            }]} >
                                <Input placeholder='Mã danh bộ' />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name={'location_id'} label='Location' rules={[{
                                required: true,
                                message: 'Please input location'
                            }]}>
                                <Dropdown datas={locations} defaultOption='-- All locations --' />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name={'pass_tracking'} label='Password' >
                                <Input placeholder='Password' />
                            </Form.Item>
                        </Col>
                        <Col span={20}>
                            <Form.Item name={'link_tracking'} label='Link tracking'>
                                <Input placeholder='Link tracking' />
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item name={'status'} label='Status' initialValue={1}>
                                <Dropdown datas={statusElectricLocations} defaultOption='All status' />
                            </Form.Item>
                        </Col>
                        <Col span={10}>
                            <Form.Item name={'department_code'} label='Department code' >
                                <Input placeholder='Department code' />
                            </Form.Item>
                        </Col>
                        <Col span={10}>
                            <Form.Item name={'division'} label='Division' >
                                <Dropdown datas={basicStatus} defaultOption='All status' />
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Form.Item name={'opening_day'} label='Opening Day'>
                                <DatePicker />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name={'useable_area'} label='Useable area (m2)' >
                                <Input placeholder='Useable area (m2)' />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name={'vender_code'} label='Vendor code' >
                                <Input placeholder='Vendor code' />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name={'link_invoice'} label='Link Invoice' >
                                <Input placeholder='Link Invoice' />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name={'note'} label='Note' >
                                <Input placeholder='Note' />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    )
}