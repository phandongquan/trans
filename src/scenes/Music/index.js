import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next';
import { Row, Col, Form, Table, Select, Input, Button, Dropdown as DropdownAnt, Menu, Popconfirm, Tooltip, Modal } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { getList, destroy, updatePriority, getListFolder, createFolder, destroyFolder, updateFolder, removeSongFolder , getLogDetail} from '~/apis/music/songs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen, faFolder, faTrash, faEllipsisV, faList, faMusic, faMinusCircle, faDatabase, faPlayCircle, faPauseCircle } from '@fortawesome/free-solid-svg-icons';
import SongForm from './SongForm';
import { checkPermission, showNotify } from '~/services/helper';
import DeleteButton from '~/components/Base/DeleteButton';
import { sortableContainer, sortableElement, sortableHandle } from 'react-sortable-hoc';
import { QuestionCircleOutlined, MenuOutlined } from '@ant-design/icons';
import './config/song.css';
import dayjs from 'dayjs';
import FolderForm from './folderForm';
import { uniqueId } from 'lodash';
import { SongFolderForm } from './SongFolderForm';
import Dropdown from '~/components/Base/Dropdown';
import { PlayFolderForm } from './PlayFolderForm';
import Tab from '~/components/Base/Tab';
import TabsMucsic from './config/TabsMucsic';
import Audio from './Audio';

const SortableItem = sortableElement(props => <tr {...props} />);
const SortableContainer = sortableContainer(props => <tbody {...props} />);
export class Music extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.formPlayRef = React.createRef();
        this.state = {
            songs: [],
            visible: false,
            loading: false,
            song: {},
            datasFolder: [],
            dataFolder: {},
            loadingFolder: false,
            visibleFolder: false,
            visibleSong: false,
            selectedRowKeys: [],
            folder_id: '',
            visiblePlay : false ,
            visibleLog : false ,
            datasLog : [],
            datasLogFull : []
        }
    }

    componentDidMount() {
        this.getListSongs()
        this.getListFolder()
        this.getLogFolder()
    }

    /**
     * Get list music
     */
    async getListSongs(params = {}) {
        const {t} = this.props
        this.setState({ loading: true })
        let values = this.formRef.current.getFieldsValue();
        if (Object.keys(params).length !== 0) {
            values = {
                ...values,
                folder_id: params.folder_id
            }
        }
        let response = await getList(values);
        if (response.status) {
            this.setState({ loading: false })
            this.setState({ songs: response.data.rows })
        } else {
            this.setState({ loading: false })
            showNotify('Notification', t('hr:network_error'))
        }
    }
    async getListFolder() {
        const {t} = this.props
        this.setState({ loadingFolder: true })
        let response = await getListFolder();
        if (response.status) {
            let list_Folder = response.data.list_folder
            let list_All = {
                id : 0 ,
                name : "ALL" ,
            }
            list_Folder = [list_All , ...list_Folder]
            this.setState({ loadingFolder: false, datasFolder: list_Folder })
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
                this.getListSongs(values);
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
        let params = {}
        if (this.state.folder_id.length !== 0) {
            params = {
                folder_id: this.state.folder_id
            }
        }
        this.getListSongs(params);
    }

    /**
     * Sort table
     * @param {*} props 
     * @returns 
     */
    DraggableContainer = props => (
        <SortableContainer
            useDragHandle
            disableAutoscroll
            helperClass="row-dragging"
            onSortEnd={this.onSortEnd}
            {...props}
        />
    );

    /**
     * Event after sort table
     * @param {*} param
     */
    onSortEnd = ({ oldIndex, newIndex }) => {
        if (oldIndex !== newIndex) {
            this.updateWfS(oldIndex, newIndex)
        }
    };

    /**
     * update workflow step
     * @param {*} oldIndex 
     * @param {*} newIndex 
     */
    async updateWfS(oldIndex, newIndex) {
        this.setState({ loading: true })
        let { t } = this.props;
        const { songs } = this.state;
        let data = {};
        data[songs[oldIndex]?.id] = newIndex;
        data[songs[newIndex]?.id] = oldIndex;
        let response = await updatePriority({ data })
        if (response.status) {
            this.setState({ loading: false })
            this.getListSongs();
        } else {
            this.setState({ loading: false })
            showNotify('Notification', t('hr:network_error'))
        }
    }

    /**
     * Sort table
     * @param {*} param0 
     * @returns 
     */
    DraggableBodyRow = ({ className, style, ...restProps }) => {
        const { songs } = this.state;
        const index = songs.findIndex(x => x.id === restProps['data-row-key']);
        return <SortableItem index={index} {...restProps} />;
    };
    onDeleteFolder(id) {
        let { t } = this.props;
        let xhr = destroyFolder(id)
        xhr.then(res => {
            if (res.status) {
                this.getListFolder()
                showNotify('Notification', t('hr:has_been_remove'))
            }
        })
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
    }
    async removeSongFolder(id = 0) {
        // let formatData = new FormData()
        // formatData.append('music_id[]',id)
        let params = {
            'music_id[]': id
        }
        let response = await removeSongFolder(this.state.folder_id, params)
        if (response.status) {
            this.getListSongs({ folder_id: this.state.folder_id })
        }
    }
    async getLogFolder () {
        let response = await getLogDetail()
        if(response.status){
            this.setState({ datasLogFull : response.data.list_folder })
        }
    }
    openModalLogActive (data) {
        let {datasLogFull} = this.state
        let result = []
        datasLogFull.map( d => {
            if(d.folder_id  == data.id ){
                result.push(d)
            }
        }) 
        this.setState({datasLog : result , visibleLog : true})
    }
    render() {
        const { t } = this.props;
        const { datasFolder, selectedRowKeys } = this.state
        const URL_MUSIC = 'https://wshr.hasaki.vn/production/music/';
        // const URL_MUSIC = 'http://ws.hasaki.local/production/music/'
        const DragHandle = sortableHandle(() => <MenuOutlined style={{ cursor: 'pointer', color: '#999' }} />);
        const rowSelection = {
            selectedRowKeys,
            onChange: value => this.onSelectChange(value),
        };
        const hasSelected = selectedRowKeys.length > 0;
        const columns = [
            {
                title: ' ',
                dataIndex: 'priority',
                width: 30,
                className: 'drag-visible',
                render: () => <DragHandle />,
            },
            {
                title: t('No.'),
                width: 30,
                render: r => this.state.songs.indexOf(r)+1,
                aling: 'center'
            },
            {
                title: t('name'),
                dataIndex: 'name',
                className: 'drag-visible'
            },
            {
                title: t('file'),
                width : '7%',
                className: 'drag-visible',
                // render: r => <audio src={URL_MUSIC + r.file} controls />,
                render : r => <Audio source={URL_MUSIC + r.file} />,
                align: 'center'
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
                className: 'drag-visible'
            },
            {
                title: t('category'),
                render: r => r.category_id == 1 ? 'SHOP' : r.category_id == 2 ? 'Clinic' : ''
            },
            {
                title: t('action'),
                width: this.state.folder_id ? '20%' : '15%',
                render: r => {
                    return (<>
                        {   
                            checkPermission('hr-log-music-create') ?
                            <Button type="primary" size='small' icon={<FontAwesomeIcon icon={faPen} />} className='mr-2' onClick={() => this.setState({ visible: true, song: r })} />
                            : ''
                        }
                        {
                            checkPermission('hr-log-music-delete') ?
                            <DeleteButton onConfirm={(e) => this.onDeleteSong(e, r.id)} />
                            : ''
                        }
                       
                        {
                            this.state.folder_id ?
                                <Tooltip title={t('hr:remove_playlist')}>
                                    <Button type='primary' style={{ background: '#ff4d4f', borderColor: '#ff4d4f' }} size='small' icon={<FontAwesomeIcon icon={faMinusCircle} />} onClick={() => this.removeSongFolder(r.id)} className='ml-2' />
                                </Tooltip>
                                : []

                        }
                        {   
                            checkPermission('hr-log-music-update') ? 
                            <Button type='primary' size='small' icon={<FontAwesomeIcon icon={faPlus} />} onClick={() => this.setState({ visibleSong: true, song: r, selectedRowKeys: [] })} className='ml-2'>{t('list')}</Button>
                            : ''
                        }
                    </>)
                },
                align: 'center',
            }
        ];
        const columnsLog = [
            {
                title : 'No.',
                render : r => this.state.datasLog.indexOf(r)+1,
            },
            {
                title : t('playlist'),
                dataIndex : 'playlist',
                width: '30%'
            },
            {
                title : t('staff_name'),
                render : r => r.name
            },
            {
                title : t('status'),
                render : r => r.active ? 'Active' : 'In Active'
            },
            {
                title : t('time'),
                render : r => r.created_at
            }

        ]

        return (
            <>
                <PageHeader
                    title={t('music')}
                    tags={
                    checkPermission('hr-log-music-create') ?
                    <Button key="create-song" type="primary" icon={<FontAwesomeIcon icon={faPlus} />} onClick={() => this.setState({ visible: true, song: {} })}>
                        &nbsp;{t('add_new')}
                    </Button> : ""
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
                                    <Select allowClear placeholder={t('hr:category')}>
                                        <Select.Option value={1}>{t('hr:shop')}</Select.Option>
                                        <Select.Option value={2}>{t('hr:clinic')}</Select.Option>
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
                <Row gutter={[16, 24]}>
                    <Col span={8}>
                        <div className="main block-search pl-2 pr-2 box_shadow">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="header">{t('playlist')} 
                                {checkPermission('hr-log-music-create') ?
                                <Button className='ml-2' key="create-folder" type="primary" icon={<FontAwesomeIcon icon={faPlus} />}
                                    onClick={() => this.setState({ visibleFolder: true, dataFolder: {} })}
                                    size='small'
                                    >
                                    {t('add_new')} 
                                </Button> : ""
                                }
                                </h5>
                            </div>
                            <div className="mt-3 list-folder mb-2">
                                {/* <div key={'block_folder'} className='d-flex mt-1 ml-2 p-1 block_folder' style={{ background: !this.state.folder_id ? 'rgb(241 246 174)' : '' }}
                                    onClick={() => {
                                        this.setState({ folder_id: '' }, () => this.getListSongs())
                                    }}
                                >
                                    <FontAwesomeIcon icon={faMusic} style={{ fontSize: 35 }} />
                                    <span className='align-self-center ml-2' style={{ fontSize: 15 }}>All</span>

                                </div> */}
                                {
                                    datasFolder.length ?
                                        datasFolder.map((d, index) =>
                                            <div key={index} className='position-relative'>
                                                <div key={'block_folder'} className='d-flex mt-1 ml-2 p-1 block_folder'
                                                    style={{ background: d.id == this.state.folder_id ? 'rgb(241 246 174)' : (d.active ? 'rgb(119 213 107)' : '')  }}
                                                    onClick={() => {
                                                        this.setState({ folder_id: d.id }, () => this.getListSongs({ folder_id: d.id }))
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faMusic} style={{ fontSize: 35 }} />
                                                    <span className='align-self-center ml-2' style={{ fontSize: 15 }}>{d.name}</span>
                                                    {d.id ? <>
                                                        <span className='align-self-center ml-2'>{d.active ? '(Active)' : '(in Active)'}</span>
                                                        <span style={{ background: '#326e51', borderRadius: 15, color: '#fff', fontSize: 10 }}
                                                            className='align-self-center ml-auto mr-3 p-1'>
                                                            {d.category_id == 1 ? 'Shop' : 'Clinic'}
                                                        </span>
                                                    </>
                                                        : []}
                                                </div>
                                                 {d.id ?
                                                    <DropdownAnt className='action-folder' trigger={['click']} key={uniqueId('_dropdown')} menu={{
                                                        items: [
                                                            {
                                                                key: '1',
                                                                label:
                                                                    <Popconfirm
                                                                        title={t('hr:del_folder') + d.name + ('?')}
                                                                        onConfirm={() => this.onDeleteFolder(d.id)}
                                                                        // onCancel={cancel}
                                                                        okText="Yes"
                                                                        cancelText="No"
                                                                    >
                                                                        <Menu.Item key={uniqueId('_dropdown')} onClick={() => { }}>
                                                                            <FontAwesomeIcon icon={faTrash} />{t('delete')}
                                                                        </Menu.Item>
                                                                    </Popconfirm>
                                                            },
                                                            {
                                                                key: '2',
                                                                label:
                                                                    <Menu.Item key={uniqueId('_dropdown')} onClick={() => this.setState({ visibleFolder: true, dataFolder: d })}>
                                                                        <FontAwesomeIcon icon={faPen} /> {t('edit')}
                                                                    </Menu.Item>
                                                            },
                                                            {
                                                                key: '3',
                                                                label:
                                                                    d.active ?
                                                                        <Menu.Item key={uniqueId('_dropdown')} onClick={() => this.setState({ visiblePlay: true, dataFolder: d })}>
                                                                            <FontAwesomeIcon icon={faPauseCircle} /> {t('hr:inactive')}
                                                                        </Menu.Item>
                                                                        :
                                                                        <Menu.Item key={uniqueId('_dropdown')} onClick={() => this.setState({ visiblePlay: true, dataFolder: d })}>
                                                                            <FontAwesomeIcon icon={faPlayCircle} /> {t('hr:active')}
                                                                        </Menu.Item>
                                                            },
                                                            {
                                                                key: '4',
                                                                label:
                                                                    <Menu.Item key={uniqueId('_dropdown')} onClick={() => this.openModalLogActive(d)}>
                                                                        <FontAwesomeIcon icon={faDatabase} /> {t('hr:log')}
                                                                    </Menu.Item>
                                                            }
                                                        ]
                                                    }}
                                                        // <Menu onClick={(e) => { }} >
                                                        //     <Popconfirm
                                                        //         title={`Bạn có muốn xoá folder ${d.name} không?`}
                                                        //         onConfirm={() => this.onDeleteFolder(d.id)}
                                                        //         // onCancel={cancel}
                                                        //         okText="Yes"
                                                        //         cancelText="No"
                                                        //     >
                                                        //         <Menu.Item key={uniqueId('_dropdown')} onClick={() => { }}>
                                                        //             <FontAwesomeIcon icon={faTrash} />&nbsp;Xoá
                                                        //         </Menu.Item>
                                                        //     </Popconfirm>
                                                        //     <Menu.Item key={uniqueId('_dropdown')} onClick={() => this.setState({ visibleFolder: true, dataFolder: d })}>
                                                        //         <FontAwesomeIcon icon={faPen} /> &nbsp;Chỉnh sửa
                                                        //     </Menu.Item>
                                                        //     {
                                                        //         d.active ?
                                                        //             <Menu.Item key={uniqueId('_dropdown')} onClick={() => this.setState({ visiblePlay: true, dataFolder: d })}>
                                                        //                 <FontAwesomeIcon icon={faPauseCircle} /> &nbsp;in Active
                                                        //             </Menu.Item>
                                                        //             :
                                                        //             <Menu.Item key={uniqueId('_dropdown')} onClick={() => this.setState({ visiblePlay: true, dataFolder: d })}>
                                                        //                 <FontAwesomeIcon icon={faPlayCircle} /> &nbsp;Active
                                                        //             </Menu.Item>
                                                        //     }
                                                        //      <Menu.Item key={uniqueId('_dropdown')} onClick={() => this.openModalLogActive(d)}>
                                                        //         <FontAwesomeIcon icon={faDatabase} /> &nbsp;Log
                                                        //     </Menu.Item>

                                                        // </Menu> 
                                                    placement="bottomLeft">
                                                        <FontAwesomeIcon icon={faEllipsisV} className='cursor-pointer' />
                                                    </DropdownAnt>
                                                    : []
                                                    }
                                            </div>
                                        )
                                        : []
                                }
                            </div>
                        </div>


                    </Col>

                    <Col span={16}>
                        <div className='mb-2'>
                            {hasSelected ?
                                <Button type='primary' size='medium' icon={<FontAwesomeIcon icon={faPlus} />} onClick={() => this.setState({ visibleSong: true, })}>{t('hr:list')}</Button>
                                : ''}
                        </div>
                        <Table
                            rowKey='id'
                            dataSource={this.state.songs}
                            columns={columns}
                            pagination={{ pageSize: 100, showSizeChanger: false }}
                            // pagination={false}
                            loading={this.state.loading}
                            components={{
                                body: {
                                    wrapper: this.DraggableContainer,
                                    row: this.DraggableBodyRow,
                                },
                            }}
                            rowSelection={rowSelection}
                        />
                    </Col>
                </Row>
                <Modal open={this.state.visibleLog} title={t('hr:log_folder')} onCancel={() => this.setState({ visibleLog: false })} footer={false} width={'70%'}>
                    <Table
                        columns={columnsLog}
                        dataSource={this.state.datasLog}
                        rowKey = {'id'}
                    />
                </Modal>
                <SongFolderForm visibleSong={this.state.visibleSong}
                    hidePopup={() => this.setState({ visibleSong: false })}
                    refreshTable={() => this.state.folder_id ? this.getListSongs({ folder_id: this.state.folder_id }) : this.getListSongs()}
                    song={this.state.song}
                    datasFolder={this.state.datasFolder}
                    songs_id={selectedRowKeys}
                    transLang = {this.props}
                />
                <SongForm
                    visible={this.state.visible}
                    hidePopup={() => this.setState({ visible: false })}
                    refreshTable={() => this.getListSongs({ folder_id: this.state.folder_id })}
                    song={this.state.song}
                    folder_id = {this.state.folder_id}
                    transLang = {this.props}
                />
                <FolderForm
                    visibleFolder={this.state.visibleFolder}
                    hidePopup={() => this.setState({ visibleFolder: false })}
                    folder={this.state.dataFolder}
                    refreshFolder={() => this.getListFolder()}
                    transLang = {this.props}
                />
                <PlayFolderForm
                    visiblePlay={this.state.visiblePlay}
                    hidePopup={() => this.setState({ visiblePlay: false })}
                    folder={this.state.dataFolder}
                    refreshFolder={() => this.getListFolder()}
                    transLang = {this.props}
                />
            </>
        )
    }
}

const mapStateToProps = (state) => ({

})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Music))
