import React, { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'
import { PageHeader } from '@ant-design/pro-layout';
import { Form, Col, Row, Input, Button, Table, Checkbox } from 'antd'
import { list as apiList } from '~/apis/language'
import { types, apps } from './config'

import flagVn from '~/assets/images/flag_vn.svg';
import flagEn from '~/assets/images/flag_en.svg';
import flagCn from '~/assets/images/flag_cn.svg';

export const Language = (props) => {

    const formRef = useRef(null);
    const [datas, setDatas] = useState([]);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        getList();
    }, [])

    const getList = (params) => {
        let xhr = apiList(params)
        xhr.then(res => {
            if (res.status) {
                setDatas(res.data.rows);
                setTotal(res.data.total);
            }
        })
    }

    const getFLag = locale => {
        switch (locale) {
            case 'vi':
                return flagVn;
            case 'en':
                return flagEn;
        }
    }

    const getCheckboxType = (typeId) => {
        if(typeof types[typeId] == 'undefined') {
            return;
        }
        return <Checkbox checked={true}>{types[typeId]}</Checkbox>
    }

    /**
     * Handle sumbmit form
     * @param {*} values 
     */
    const submitForm = (values) => {
        getList(values);
    }

    const columns = [
        {
            title: 'No.',
            render: r => datas.indexOf(r) + 1,
            width: '5%'
        },
        {
            title: 'Key',
            render: r => r.key,
            width: '20%'
        },
        {
            title: 'label',
            render: r => {
                if (!r.labels) {
                    return;
                }
                let result = [];
                r.labels.map(l => result.push(<div key={l.id}>
                    {getCheckboxType(l.type)}
                    
                    <span className='ml-2'>{l.label}</span>
                </div>))

                return <Table 
                    columns={[
                        {
                            title: 'Type',
                            render: r => {
                                let result = [];
                                Object.keys(types).map(t => result.push(<Checkbox checked={r.type == t}>{types[t]}</Checkbox>))
                                return result;
                            },
                            align: 'center',
                            width: '15%'
                        },
                        {
                            title: 'App',
                            render: r => {
                                let result = [];
                                Object.keys(apps).map(a => result.push(<Checkbox checked={r.app_id == a}>{apps[a]}</Checkbox>))
                                return result;
                            },
                            align: 'center',
                            width: '30%'
                        },
                        {
                            title: 'Locale',
                            render: r => <img width={18} src={getFLag(r.locale)} /> ,
                            align: 'center',
                            width: '10%'
                        },
                        {
                            title: 'label',
                            dataIndex: 'label'
                        },
                    ]}
                    dataSource={r.labels}
                    size='small'
                    pagination={false}
                />
            }
        }
    ]

    const expandedRowRender = () => {
        const expandedColumns = [
            {
                title: 'Date',
                dataIndex: 'date',
                key: 'date',
            },
            {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
            },

            {
                title: 'Upgrade Status',
                dataIndex: 'upgradeNum',
                key: 'upgradeNum',
            },
        ];
        const data = [];
        for (let i = 0; i < 3; ++i) {
            data.push({
                key: i.toString(),
                date: '2014-12-24 23:12:00',
                name: 'This is production name',
                upgradeNum: 'Upgraded: 56',
            });
        }
        return <Table columns={expandedColumns} dataSource={data} pagination={false} />;
    };

    return (
        <>
            <PageHeader title='Language' />
            <div className='card pl-3 pr-3 mb-3'>
                <Form
                    className="pt-3"
                    ref={formRef}
                    name="searchStaffForm"
                    onFinish={v => submitForm(v)}
                    layout="vertical"
                >
                    <Row gutter={12}>
                        <Col span={6}>
                            <Form.Item name='key'>
                                <Input placeholder='Key' />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name='label'>
                                <Input placeholder='Label' />
                            </Form.Item>
                        </Col>
                        <Col span={4}>
                            <Button type="primary" htmlType="submit">
                                Search
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </div>
            <Table
                columns={columns}
                dataSource={datas}
            // expandable={{
            //     expandedRowRender,
            //     defaultExpandedRowKeys: ['0'],
            // }}

            />
        </>
    )
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(Language)