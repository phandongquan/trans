import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next';
import { Row, Col, Form, Table, Select, Input, Button, Dropdown as DropdownAnt } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { getListAdvertisement, destroy } from '~/apis/music/songs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen, faFolder, faTrash, faEllipsisV, faList, faMusic, faMinusCircle, faCheck, faCheckCircle, faMinusSquare, faPlayCircle, faPauseCircle } from '@fortawesome/free-solid-svg-icons';
import { checkPermission, showNotify } from '~/services/helper';
import DeleteButton from '~/components/Base/DeleteButton';
import { sortableContainer, sortableElement, sortableHandle } from 'react-sortable-hoc';
import { QuestionCircleOutlined, MenuOutlined } from '@ant-design/icons';
// import './config/song.css';
import dayjs from 'dayjs';
// import FolderForm from './folderForm';
import { uniqueId } from 'lodash';
// import { SongFolderForm } from './SongFolderForm';
import Dropdown from '~/components/Base/Dropdown';
// import { PlayFolderForm } from './PlayFolderForm';
import Tab from '~/components/Base/Tab';
import TabsMucsic from './config/TabsMucsic';
import AdvertisementForm from './AdvertisementForm';
import Audio from './Audio';

const URL_MUSIC = 'https://wshr.hasaki.vn/production/music/';
// const URL_MUSIC = 'http://ws.hasaki.local/production/music/'
export class Advertisement extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            songs: [],
            visible: false,
            loading: false,
            song: {},
        }
    }
    componentDidMount() {
        this.getList()
    }
    async getList(params = {}) {
        let { t } = this.props;
        this.setState({ loading: true })
        let values = this.formRef.current.getFieldsValue();
        if (Object.keys(params).length !== 0) {
            values = {
                ...values,
            }
        }
        let response = await getListAdvertisement(values);
        if (response.status) {
            this.setState({ loading: false })
            this.setState({ songs: response.data.rows })
        } else {
            this.setState({ loading: false })
            showNotify('Notification', t('hr:network_error'))
        }
    }
    /**
 * Delete song
 * @param {*} e 
 * @param {*} id 
 */
    onDeleteSong = (e, id) => {
        let { t } = this.props;
        e.stopPropagation();
        let xhr = destroy(id);
        xhr.then((response) => {
            if (response.status) {
                let values = this.formRef.current.getFieldsValue();
                this.getList(values);
                showNotify(t('Notification'), t('hr:song') + t(' ') +t('hr:has_been_remove'));
            } else {
                showNotify(t('Notification'), response.message);
            }
        }).catch(error => {
            showNotify(t('Notification'), t('hr:server_error'));
        });
    }
    /**
     * @event submit form
     * @param {Object} values 
     */
    submitForm = (values) => {
        this.getList();
    }

    render() {
        const { t } = this.props;
        const columns = [
            {
                title: t('No.'),
                width: 30,
                render: r => this.state.songs.indexOf(r) + 1,
                align: 'center'
            },
            {
                title: t('name'),
                dataIndex: 'name',
            },
            {
                title: t('file'),
                // width: '7%',
                // render: r => <audio src={URL_MUSIC + r.file} controls />,
                render : r => <Audio source={URL_MUSIC + r.file} />,
                aling: 'center'
            },
            {
                title: t('duration'),
                render: r => {
                    let duration = dayjs.duration(r.duration, "seconds");
                    var time = "";
                    var hours = duration.hours();
                    if (hours > 0) { time = hours + ":"; }

                    return time + duration.minutes() + ":" + duration.seconds();
                },
                align: 'center',
            },
            {
                title: t('category'),
                render: r => r.category_id == 1 ? 'SHOP' : r.category_id == 2 ? 'Clinic' : ''
            },
            {
                title: t('hr:start_time'),
                width: '36%',
                // render: r => <span>{console.log(JSON.parse("[" + r.times_frame  + "]")[0])}</span>
                render: r => r.times_frame.length ?   <div  style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>{r.times_frame.map((v,i)=> <span  className='mr-2' key={i}>{v}</span>)}</div> : []
            },
            {
                title: t('action'),
                width: this.state.folder_id ? '20%' : '15%',
                render: r => {
                    return (<>
                        {
                            checkPermission('hr-log-music-advertisement-update') ?
                            <Button type="primary" size='small' icon={<FontAwesomeIcon icon={faPen} />} className='mr-2' onClick={() => this.setState({ visible: true, song: r })} />
                            : ''
                        }
                        {
                            checkPermission('hr-log-music-advertisement-delete') ?
                            <DeleteButton onConfirm={(e) => this.onDeleteSong(e, r.id)} />
                            : ''
                        }
                    </>)
                },
                align: 'center',
            }
        ];
        return (
            <>
                <PageHeader
                    title={t('hr:advertisement')}
                    tags={
                    checkPermission('hr-log-music-advertisement-create') ?
                    <Button key="create-advertisement" type="primary" icon={<FontAwesomeIcon icon={faPlus} />} onClick={() => this.setState({ visible: true, song: {} })}>
                        &nbsp;{t('Add new')}
                    </Button> : ''
                    }
                />
                <Row className="card pl-3 pr-3 mb-1">
                    <Tab tabs={TabsMucsic(this.props)} />
                    <Form
                        layout="vertical"
                        className="pt-3"
                        ref={this.formRef}
                        onFinish={this.submitForm.bind(this)}
                    >
                        <Row gutter={[12, 0]}>
                            <Col span={4}>
                                <Form.Item name='name'>
                                    <Input placeholder={t('name')} />
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item name='category_id'>
                                    <Select allowClear placeholder={t('category')}>
                                        <Select.Option value={1}>{t('shop')}</Select.Option>
                                        <Select.Option value={2}>{t('clinic')}</Select.Option>
                                    </Select>
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
                <Row>
                    <Col span={24}>
                        <Table
                            rowKey='id'
                            dataSource={this.state.songs}
                            columns={columns}
                            // pagination={{ pageSize: 20, showSizeChanger: false }}
                            pagination={false}
                            loading={this.state.loading}
                        />
                    </Col>

                </Row>
                <AdvertisementForm
                    visible={this.state.visible}
                    hidePopup={() => this.setState({ visible: false })}
                    refreshTable={() => this.getList()}
                    song={this.state.song}
                />

            </>
        )
    }
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(Advertisement)