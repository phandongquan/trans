import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next';
import {getList , destroy} from '~/apis/roomMeeting/index'
import { Row, Col, Table, Button } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen } from '@fortawesome/free-solid-svg-icons';
import { showNotify , checkPermission } from '~/services/helper';
import DeleteButton from '~/components/Base/DeleteButton';
import dayjs from 'dayjs';
import RoomMeetingForm from './RoomMeetingForm';

class RoomMeeting extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            datas : [],
            visible: false,
            loading: false,
            data : {}
        }
    }
    
    componentDidMount() {
        this.getListLocation()
    }
    async getListLocation(){
        this.setState({loading : true})
        let response = await getList()
        if(response.status){
            this.setState({loading : false ,datas : response.data})
        }
    }
    onDelete(e, id) {
        let { t } = this.props;
        e.stopPropagation();
        let xhr = destroy(id);
        xhr.then((response) => {
            if (response.status) {
                this.getListLocation();
                showNotify(t('Notification'), t('hr:room_meeting') + t('hr:has_been_remove'));
            } else {
                showNotify(t('Notification'), response.message);
            }
        }).catch(error => {
            showNotify(t('Notification'), t('hr:server_error!'));
        });
    }

    render() {
        const {t} =  this.props;
        const columns = [
            {
                title : 'No.',
                render : r => this.state.datas.indexOf(r) + 1
            },
            {
                title : t('hr:name_room'),
                render : r => <span>{r.name}</span>
            },
            {
                title : t('location'),
                render : r => <span>{r.location?.name}</span>
            },
            {
                title: t('address'),
                render : r => <span>{r.location?.address}</span>
            },
            {
                title : t('created_at'),
                width: '7%',
                render : r => <span>{dayjs(r.created_at).format('YYYY-MM-DD')}</span>
            },
            // {
            //     title : 'Created by',
            //     width: '10%',
            //     render : r => r.created_by_name
            // },
            {
                title :t('action'),
                render: r => {
                    return (<>
                        {
                            checkPermission('hr-setting-room-meeting-update') ? 
                            <Button type="primary" size='small' icon={<FontAwesomeIcon icon={faPen} />} className='mr-2' onClick={() => this.setState({ visible: true, data: r })} />
                        : ''
                        }
                        {
                        checkPermission('hr-tool-room-meeting-delete') ?
                            <DeleteButton onConfirm={(e) => this.onDelete(e, r.id)} />
                        : ''
                        }            
                    </>)
                },
                align: 'center',
            }
        ]
        return (
            <>
                <PageHeader title={t('room_meeting')}
                    tags={
                        checkPermission('hr-setting-room-meeting-create') ?<Button key="create-room" type="primary" icon={<FontAwesomeIcon icon={faPlus} />} onClick={() => this.setState({ visible: true, data: {} })}>
                       {t('add_new')}
                    </Button> : ''
                    }
                />
                {/* <Row className="card pl-3 pr-3 mb-3">
                    <Form
                        layout="vertical"
                        className="pt-3"
                        ref={this.formRef}
                        // onFinish={this.submitForm.bind(this)}
                    >
                    </Form>
                </Row> */}
                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        <Table
                            rowKey='id'
                            dataSource={this.state.datas}
                            columns={columns}
                            pagination={false}
                            loading={this.state.loading}
                        />
                    </Col>
                </Row>
                <RoomMeetingForm visible={this.state.visible}
                    hidePopup={() => this.setState({ visible: false })}
                    refreshTable={() => this.getListLocation()}
                    room = {this.state.data}
                />
                
            </>
        )
    }
}
const mapStateToProps = (state) => ({
    
})

const mapDispatchToProps = {
    
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(RoomMeeting))
