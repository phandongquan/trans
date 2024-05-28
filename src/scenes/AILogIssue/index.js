import React, { Component } from 'react'
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { getList as apiGetList, create as apiCreate, update as apiUpdate, deleteLog as apiDeleteLog, deleteMul } from '~/apis/aiLogIssue'
import { Button, Table, Row, Col, Form , Image as ImageAnt, Modal , DatePicker} from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { faPlus, faPen, faPaperclip, faEllipsisV, faFileExport } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import CreateUpdateDate from '~/components/Base/CreateUpdateDate';
import DeleteButton from '~/components/Base/DeleteButton';
import {checkPermission, showNotify ,timeFormatStandard} from '~/services/helper';
import { imageDefault, LogIssueType } from '~/constants/basic';
import Dropdown from '~/components/Base/Dropdown';
import { uniqueId } from 'lodash'
import { getURLHR } from '~/services/helper'
import { ExclamationCircleOutlined } from '@ant-design/icons';
import Lighbox from '~/components/Base/Lighbox';
import './config/ailogissuse.css'


const FormatDate = 'YYYY-MM-DD';
const { RangePicker } = DatePicker;

class AiLogIssue extends Component {
    constructor(props) {
        super(props);
        this.formRef = React.createRef()
        this.state = {
            page : 1,
            total : 0,
            loading: false,
            datas: [],
            selectedRowKeys: [],

            dataSource : [] , 
            toggler: false,
            slide: 1,
            photoIndex : 0 ,
            dataImage : []
        }
    }
    componentDidMount() {
        this.getListImages()
    }
    async getListImages(params = {}) {
        // let params = this.formRef.current.getFieldsValue();
        params.page = this.state.page
        if (params.date) {
            params.from_date = typeof params.date !== undefined && params.date ? timeFormatStandard(params.date[0], FormatDate + ' 00:00:00') : undefined;
            params.to_date = typeof params.date !== undefined && params.date ? timeFormatStandard(params.date[1], FormatDate + ' 23:59:59') : undefined;
            delete (params.date);
        }

        this.setState({ loading: true });
        let response = await apiGetList(params);
        if (response.status) {
            this.setState({ datas: response.data.LogIssues, loading: false  , total : response.data.total})
        }
    }
    onDeleteLogIssue(e, id , index){
        e.stopPropagation();
        let { t } = this.props;
        let xhr = apiDeleteLog(id);
        xhr.then((response) => {
            if (response.status) {
                showNotify(t('Notification'), t('Deleted successfully!'));
                const newdatas = this.state.datas.slice()
                newdatas.splice(index,1) 
                this.setState({datas : newdatas})
            }
        });
    }
    /**
     * @event submit form
     * @param {Object} values 
     */
     submitForm = () => {
        let values = this.formRef.current.getFieldsValue()
        this.setState({page : 1} , () => this.getListImages(values) )
    }

    /**
     * OnSelect change
     * @param {*} selectedRowKeys 
     */
    onSelectChange = (selectedRowKeys) => {
        this.setState({ selectedRowKeys })
    }

    /**
     * On Start
     */
    onStart = () => {
        this.setState({ selectedRowKeys: [] })
        let values = this.formRef.current.getFieldsValue()
        this.getListImages(values)
    }

    /**
     * Delete multiple rows
     */
    deleteMultipleRows = () => {
        let { t } = this.props;
        let { selectedRowKeys } = this.state;
        Modal.confirm({
            title: t('hr:confirm'),
            icon: <ExclamationCircleOutlined />,
            content: t('hr:want_to_delete'),
            onOk: () => {
                let xhr = deleteMul({ ids: selectedRowKeys });
                xhr.then(res => {
                    if(res.status) {
                        showNotify('Notification', t('hr:delete_complete'));
                        this.setState({ selectedRowKeys: []})
                        let values = this.formRef.current.getFieldsValue()
                        this.getListImages(values);
                    } else {
                        showNotify('Notification', res?.message, 'error')
                    }
                })
            }
        });
    }
    onChangePage(page){
        let values = this.formRef.current.getFieldsValue()
        this.setState({ page } , () => this.getListImages(values))
        window.scrollTo(0, 0)
    }
    render() {
        let { t, baseData: { locations }} = this.props;
        let {datas , loading, selectedRowKeys} = this.state; 
        const columns = [ 
            {
                title:t('No.'),
                render: r => this.state.datas.indexOf(r)+ 1
            },
            {
                title:t('hr:title'),
                width: '10%',
                render: r => <p>{r.title}</p>
            },
            {
                title:t('camera'),
                render: r => <p>{r.cam}</p>
            },
            {
                title:t('image'),
                width: '35%',
                render : r =>{
                   
                    let result = []
                    let arrPhotos = [];
                    r.images.map((img , index) => {
                        arrPhotos.push(img)
                    })
                    return  <div className='lightbox-log-issuse'><Lighbox datas={arrPhotos} width={100} height={55} isImgAI = {true}/></div>
                }
            },
            {
                title:t('type'),
                render: r => <p>{LogIssueType[r.type]}</p>
            },
            {
                title: t('location'),
                render: r => (
                    <div>
                        {locations.map(d => r.location_id == d.id && d.name)}
                    </div>
                )
            },
            {
                title: t('date'),
                render: r => <CreateUpdateDate record={r} />
            },
            {
                title: t('created_by'),
                render: r => {
                    let created_by_user = r.created_by_user;
                    return created_by_user ? `${created_by_user.name} # ${created_by_user.id}` : r.created_by;
                }
            },
            {
                title:t('action'),
                width: '5%',
                align: 'center',
                render: (text , r ,index)  => (
                    <div>
                        {/* {
                        checkPermission('hr-tool-ai-log-issue-update') ?  */}
                            <Link to={`/ai-log-issue/${r.id}/edit`}>
                                <Button type="primary" size='small'
                                    icon={<FontAwesomeIcon icon={faPen} />} style={{ marginRight: 8 }}>
                                </Button>
                            </Link> 
                            {/* : ''
                        } */}
                        {/* {
                            checkPermission('hr-tool-ai-log-issue-delete') ? */}
                                <DeleteButton onConfirm={(e) => this.onDeleteLogIssue(e, r.id, index)} /> 
                                {/* : '' */}
                        {/* } */}
                    </div>
                )
            }
        ]

        const rowSelection = {
            selectedRowKeys,
            onChange: value => this.onSelectChange(value),
        };

        const hasSelected = selectedRowKeys.length > 0;

        return (
            <div id='page_log_issue'>
                <PageHeader title={t('hr:ai_log_issue')}
                    tags={[
                        <Link to={`/ai-log-issue/create`} key="create-log-issue" className='mr-2' >
                            {
                                checkPermission('hr-tool-ai-log-issue-create') ? 
                                    <Button key="create-log-issue" type="primary" icon={<FontAwesomeIcon icon={faPlus} />}>
                                        &nbsp;{t('add_new')}
                                    </Button> 
                                     : ''
                            }
                        </Link>
                    ]}
                />
                <Row className="card pl-3 pr-3 mb-3">
                    <Form ref={this.formRef} className="pt-3" name="searchStaffForm"
                        onFinish={this.submitForm.bind(this)}
                    >
                        <Row gutter={12}>
                            <Col span={4}>
                                <Form.Item name='location_id'>
                                    <Dropdown datas={locations} defaultOption={t('hr:all_location')} />
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item name='type'>
                                    <Dropdown datas={LogIssueType} defaultOption={t('hr:all_type')} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name='date'>
                                    <RangePicker style={{ width: '100%' }} format={FormatDate} />
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Button type="primary" htmlType="submit">
                                    {t('search')}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        <div className='mb-2'>
                            <Button type="primary" onClick={() => this.onStart()} loading={loading}>
                                {t('reload')}
                            </Button>
                            <span style={{ marginLeft: 8 }}>
                                {hasSelected ? 
                                    <Button onClick={() => this.deleteMultipleRows()} type='primary'>{t('delete')} {selectedRowKeys.length} {t('item')}</Button>
                                : ''}
                            </span>
                        </div>
                        <Table
                            dataSource={datas}
                            rowKey={r => r.id}
                            columns={columns}
                            loading={loading}
                            pagination={{
                                pageSize: 50,
                                onChange: page => this.onChangePage(page),
                                current: this.state.page,
                                total: this.state.total ,
                                showSizeChanger : false,
                                showQuickJumper : true
                            }}
                            rowSelection={rowSelection}
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(AiLogIssue));

