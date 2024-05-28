import React, { useState, useEffect, useRef, useMemo } from 'react'
import { PageHeader } from '@ant-design/pro-layout';
import { Row, Col, Table, Form, Button, DatePicker } from 'antd'
import Dropdown from '~/components/Base/Dropdown';
import { useSelector } from 'react-redux';
import { getListTrackingWifi } from '~/apis/trackingwifi';
import { showNotify } from '~/services/helper';
import StaffDropdown from '~/components/Base/StaffDropdown';
import { useTranslation } from 'react-i18next';

export default function TrackingWifi() {
   
    const formRef = useRef();
    const [loading, setLoading] = React.useState(false);
    const [datas, setDatas] = React.useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const { t, i18n } = useTranslation();

    const locations = useSelector(state => state.baseData.locations);
    useEffect(() => {
        getReportWifi();
    }, [])

    const getReportWifi = async (params = {}) => {
        setLoading(true);
        let res = await getListTrackingWifi(params);
        if (res.status) {
            setDatas(res.data.rows);
            setLoading(false);
        } else {
            setLoading(false);
            showNotify('Notification', res.message, 'error');
        }
    }
    const submitForm = () => {
        let values = formRef.current.getFieldsValue()
        if (values.logged_at) {
            values.logged_at = values.logged_at.format('YYYY-MM-DD');
        }
        getReportWifi(values);
        
    }

    const columns = [
        {
            title: t('hr:all_staff'),
            dataIndex: 'staff',
            key: 'staff',
            width: 250,
            render: (text, record) => {
                return (
                    <div>
                        {record.staff.staff_name} #<strong>{record.staff.code}</strong> <br />
                        <small>{record.staff.staff_phone ? `${record.staff.staff_email} - ${record.staff.staff_phone}` : ''}</small><br />
                    </div>
                )
            }
        },
        {
            title: t('hr:all_location'),
            dataIndex: 'location',
            key: 'location',
            width: 400,
            render: (text, record) => {
                return (
                    <div>
                        <div>{locations.map(d => record.staff.staff_loc_id == d.id && d.name)}</div>
                    </div>
                )
            }
        },
        // {
        //     title: 'Loss time',
        //     dataIndex: 'lossTime',
        //     key: 'lossTime',
        //     width: 200,

        // },
        {
            title:t('hr:connect_time'),
            dataIndex: 'connectTime',
            key: 'connectTime',
            width: 200,
            render: (text, record) => {
                let connectTime = record.logged_at;
                // slpit string ' ' to get time
                // let time = connectTime.split(' ')[1];
                return (
                    <div>
                        <div>{record.logged_at}</div>
                    </div>
                )
            }
        },
    ];
    return (
        <div>
            <PageHeader title={t('hr:report_wifi') }/>
            <Row className='card pl-3 pr-3 mb-3'>
                <Form
                    className="mt-2 form_tracking_wifi"
                    ref={formRef}
                    name="searchForm"
                    onFinish={submitForm}
                >
                    <Row gutter={24}>
                        <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                            <Form.Item name={'location_id'}>
                                <Dropdown datas={locations} defaultOption={t('hr:all_location')} />
                            </Form.Item>
                        </Col>
                        <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                            <Form.Item name={'staff_id'}>
                                <StaffDropdown defaultOption={t('hr:all_staff')} />
                            </Form.Item>
                        </Col>
                        <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                            <Form.Item name={'logged_at'}>
                                <DatePicker  />
                            </Form.Item>
                        </Col>
                        <Col xs={12} sm={12} md={12} lg={4} xl={4}>
                            <Button type="primary" htmlType="submit">{t('search')}</Button>
                        </Col>
                    </Row>
                </Form>
            </Row>
            <Table
                dataSource={datas}
                loading={loading}
                className='pb-3'
                columns={columns}
                scroll={{ x: 900 }}
                bordered
                size="small"
                rowKey='id'
                pagination={true}
            />
        </div>

    )
}