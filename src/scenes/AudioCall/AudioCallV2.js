import React, { Component, useContext, useState, useEffect, useRef } from 'react'
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Row, Col, Form, Table, Select, Input, Button, Modal } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import './config/audiocall.css'
import { showNotify, historyReplace, historyParams } from '~/services/helper'
import { getListAudioV2, updateTextAudioV2, deleteAudioV2 } from '~/apis/audiocall/audioCallV2';
import DeleteButton from '~/components/Base/DeleteButton';
import Tab from '~/components/Base/Tab';
import tabListAudioCall from '../Company/config/tabListAudioCall';


const { TextArea } = Input;

const urlAI = 'https://ai.hasaki.vn/control/'

const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
};

const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
}) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);
    const form = useContext(EditableContext);



    useEffect(() => {
        if (editing) {
            inputRef.current.focus();
        }
    }, [editing]);

    // /**
    //  * Handle key press
    //  * @param {*} e 
    //  */
    // const handleKeyPress = (e) => {
    //     console.log(e)
    //     if (e.key === 'Enter' && ! e.shiftKey) {
    //         e.preventDefault();
    //     }
    // }

    const toggleEdit = () => {
        setEditing(!editing);
        form.setFieldsValue({
            [dataIndex]: record[dataIndex],
        });
    };

    const save = async () => {
        try {
            const values = await form.validateFields();
            toggleEdit();
            handleSave({ ...record, ...values });
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    };

    let childNode = children;

    if (editable) {
        childNode = editing ? (
            <Form.Item
                style={{
                    margin: 0,
                }}
                name={dataIndex}
                rules={[
                    {
                        required: true,
                        message: `${title} is required.`,
                    },
                ]}
            >
                <Input.TextArea ref={inputRef} onPressEnter={save} onBlur={save}
                // onKeyPress={e => handleKeyPress(e)} 
                />
            </Form.Item>
        ) : (
            <div
                className="editable-cell-value-wrap"
                style={{
                    paddingRight: 24,
                }}
                onClick={toggleEdit}
            >
                {children}
            </div>
        );
    }

    return <td {...restProps}>{childNode}</td>;
};


class AudioCallV2 extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.formReportRef = React.createRef();
        let params = historyParams();
        this.state = {
            visible: false,
            loadingFile: false,
            dataFiles: [],
            dataFIlesFormat: [],
            dataFormat: [],
            loading: false,
            datas: [],
            PATH: '',
            indexPath: [],
            saved: false,
            visibleReport: false,
            pathReport: '',
            indexPathReport: [],
            limit: 30,
            total: 0,
            page: params.page ? Number(params.page) : 1,

            visibleNotChecked: false,
            datasNotCheckedList: [],
            visibleNote: false
        }
    }
    componentDidMount() {
        let params = historyParams();
        this.getListFile(params)
    }

    // /**
    //  * format list text
    //  */
    // formatListText = () => {
    //     let {datas} = this.state
    //     let idDatas = datas?.ID
    //     let transDatas = datas?.trans
    //     let checkedDatas = datas?.checked_list
    //     let arrData = [];
    //     if(datas){
    //         idDatas.forEach((r , index) => {
    //             arrData.push({
    //                     key: index,
    //                     ID : r,
    //                     trans : transDatas[index],
    //                     checked_list : checkedDatas[index]
    //             })       
    //         });
    //         this.setState({dataFormat : arrData})
    //     }
    // }
    /**
     * format list file
     */
    formatListFile = () => {
        let { dataFiles } = this.state
        let checkFiles = dataFiles?.checkedList
        let urlFiles = dataFiles?.audioPaths
        // let ratioFinished = dataFiles?.number_file_labeled_list
        let labelFiles = dataFiles?.labelList
        let indexList = dataFiles?.indexList
        let notCheckedList = dataFiles?.notCheckedList
        let arrFiles = [];
        if (dataFiles) {
            checkFiles.forEach((r, index) => {
                arrFiles.push({
                    key: index,
                    check_list: r,
                    files: urlFiles[index],
                    choose: false,
                    trans: labelFiles[index],
                    indexList: indexList[index]
                    // saved : false
                })
            });
            this.setState({ dataFIlesFormat: arrFiles, datasNotCheckedList: notCheckedList })
        }

    }
    /**
     * Get list file 
     */
    getListFile = async (params = {}) => {
        params = {
            page: this.state.page,
        }
        let response = await getListAudioV2(params)
        if (response) {
            this.setState({ dataFiles: response, total: (this.state.limit * response.maxPage) })
        }
        this.formatListFile()
    }
    // /**
    //  * Get list text audio
    //  * @param {Object} params 
    //  */
    // getListTextAudio = async  (params ={}) =>{
    //     this.setState({loading : true})
    //     await axios.post(`${urlAI}get_trans?PATH=${params}`)
    //         .then(response =>
    //             this.setState({ datas: response.data, loading: false}),
    //         )
    //         .catch(error => console.log(error))
    //     this.formatListText()
    // }
    /**
     * render file
     */
    renderFile() {
        let { dataFiles } = this.state
        let result = []
        let dataNameFile = dataFiles.files
        if (dataNameFile) {
            dataNameFile.map(item => {
                result.push(<li>{item}</li>)
            })
        }
        return <ul>{result}</ul>
    }
    //
    handleSave = async (row) => {
        const newDataFormat = [...this.state.dataFIlesFormat];
        const index = newDataFormat.findIndex((item) => row.key === item.key);
        const item = newDataFormat[index];
        if (item.trans != row.trans) {
            row = {
                ...row,
                check_list: 1
            }
            newDataFormat.splice(index, 1, { ...item, ...row });
            this.setState({
                dataFIlesFormat: newDataFormat,
            });

            let params = {
                index: row.indexList,
                label: row.trans
            }
            let response = await updateTextAudioV2(params)
            if (response) {
                showNotify('Notification', 'Cập nhật dữ liệu thành công');
            }
        } else {
            // row = {
            //     ...row,
            //     check_list: 1
            // }
            // let params = {
            //     index : row.indexList ,
            // }
            // // newDataFormat.splice(index, 1, { ...item, ...row });
            // // this.setState({
            // //     dataFIlesFormat: newDataFormat,
            // // });

            // let response = await updateTextAudio(params)
            // if(response){
            //     showNotify('Notification', 'Cập nhật dữ liệu thành công');
            // }
        }
    };
    // /**
    //  * render Text audio
    //  */
    // renderTextAudio (r) {
    //     let {dataFIlesFormat} = this.state
    //     let indexPath = r.key

    //     if(dataFIlesFormat[indexPath]['choose'] == false){
    //         dataFIlesFormat[indexPath]['choose'] = !dataFIlesFormat[indexPath]['choose']
    //     }
    //     this.setState({PATH : r.files  , indexPath : indexPath})
    //     this.getListTextAudio(r.files)
    // }
    /**
     * save text 
     */
    // saveInfo () {
    //     let {datas , PATH , indexPath} = this.state
    //     axios.post(`${urlAI}save_trans`, {
    //         ID_LIST : datas.ID,
    //         TRANS_LIST : datas.trans ,
    //         CHECKED_LIST : datas.checked_list,
    //         PATH: PATH ,
    //         INDEX_PATH : indexPath
    //     })
    //         .then(response =>
    //             this.setState({visible: false })
    //         )
    //         .catch(error => console.log(error))
    // }
    /**
     * report file error
     */
    // reportFileError(params ={}){
    //     let {pathReport , indexPathReport ,datas, dataFormat} = this.state
    //     let newDataFormat = [...this.state.dataFormat];
    //     let newDatas = datas
    //     let item = newDataFormat[indexPathReport]
    //     item = {
    //         ...item,
    //         checked_list : -1 
    //     }
    //     //checked_list data when report
    //     newDatas['checked_list'][indexPathReport] = -1 
    //     newDataFormat[item.key]['checked_list'] = -1


    //     axios.post(`${urlAI}report?PATH=${pathReport}&CONTENT=${params}`, {
    //     })
    //         .then(response =>
    //             this.setState({
    //                 dataFormat : newDataFormat,
    //                 visibleReport: false ,
    //                 datas : newDatas ,
    //             })
    //         )
    //         .catch(error => console.log(error))
    //     this.formReportRef.current.resetFields()
    // }
    // /**
    //  * submit Report
    //  */
    // submitReport () {
    //     let values = this.formReportRef.current.getFieldsValue()
    //     this.reportFileError(values.content)
    // }
    /**
     * @event change page
     * 
     * @param {*} page 
     */
    onChangePage(page) {
        // let values = this.formRef.current.getFieldsValue();
        this.setState({ page }, () => this.getListFile({}));
    }
    onDelete(e, r) {
        e.stopPropagation();
        let { t } = this.props;
        let params = {
            index: r.indexList
        }
        let xhr = deleteAudioV2(params);
        xhr.then((response) => {
            if (response.status) {
                showNotify(t('Notification'), t('Deleted successfully!'));
                const newdatas = this.state.dataFIlesFormat.slice()
                let indexData = newdatas.findIndex(v => v.indexList == r.indexList)
                newdatas.splice(indexData, 1)
                this.setState({ dataFIlesFormat: newdatas })
            }
        });
    }
    render() {
        const { t } = this.props;
        const { visible, dataFIlesFormat, datasNotCheckedList } = this.state
        // const columnsFile = [
        //     {
        //         title: 'No.',
        //         render: r => dataFIlesFormat?.indexOf(r) + 1,
        //         width:'5%'
        //     },
        //     {
        //         title: 'File',
        //         render: (text, r, index ) => <p className='cursor-pointer' onClick={()=> this.renderTextAudio(r)} style={{ color:'#009aff'}}>{r.files}</p>,
        //         width: '40%'
        //     },
        //     {
        //         title: 'Finished',
        //         render: r => <strong>{r.ratio}</strong>,
        //         width:'10%'
        //     },

        // ]
        const columns = [
            {
                title: 'No',
                width: '3%',
                render: r => r.indexList
            },
            {
                title: t('audio_call'),
                width: '10%',
                render: r => <audio style={{ height: '30px' }} controls className="audio-element" src={r.files} preload="metadata"></audio>
                // render : r=> <Audio urlFiles = {r.files} />
            },
            {
                title: t('text'),
                dataIndex: 'trans',
                width: '50%',
                editable: true
            },
            ,
            {
                title: t('action'),
                width: '5%',
                render: r => <DeleteButton onConfirm={(e) => this.onDelete(e, r)} />
            }
            // {
            //     title: t('Action'),
            //     align: 'center',
            //     width: '10%',
            //     // render: r => <Button danger onClick={()=>this.setState({visibleReport: true , pathReport: r.ID , indexPathReport : r.key})}>Báo cáo</Button>
            // },
        ]

        const components = {
            body: {
                row: EditableRow,
                cell: EditableCell,
            },
        };
        const myColumns = columns.map((col) => {
            if (!col.editable) {
                return col;
            }

            return {
                ...col,
                onCell: (record) => ({
                    record,
                    editable: col.editable,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    handleSave: this.handleSave,
                }),
            };
        });

        const columnsNotCheckedList = [
            {
                title: 'No',
                render: r => this.state.datasNotCheckedList.indexOf(r) + 1
            },
            {
                title: 'file',
                render: r => r
            }
        ]

        return (
            <>
                <PageHeader title={t('audio_call')} />
                {/* <Row className='card mb-3'>
                        <Col className='ml-2 mt-2' span={24}><p style={{fontSize: '15px', fontWeight: 'bold' }}>Danh sách file text</p> </Col>
                        <Table
                            rowKey={r => r.key}
                            dataSource = {dataFIlesFormat}
                            columns={columnsFile}
                            loading={this.state.loadingFile}
                            pagination={{ pageSize: 10, showSizeChanger: false, showQuickJumper: true }}
                            rowClassName={(r) =>(r.files == PATH && r.choose == true) ? 'bg-choose' : (r.check_list == 1 ) ? 'bg-done' :  ''}
                        />
                    </Row> */}
                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={tabListAudioCall(this.props)}></Tab>
                </Row>
                <Row >
                    <span>{t('total_file_uncheck')}: {datasNotCheckedList.length} &nbsp;
                        (<span className='cursor-pointer' style={{ color: '#009aff' }} onClick={() => this.setState({ visibleNotChecked: true })}>{t('detail')}</span>)
                    </span>
                </Row>
                <span className='cursor-pointer' style={{ color: '#009aff' }} onClick={() => this.setState({ visibleNote: true })}>{t('labeling_instructions')}</span>
                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        {/* <Button type="primary" className='mb-3' onClick={() => this.setState({ visible: true })}>
                                    {t('Save')}
                                </Button> */}
                        <Table
                            dataSource={dataFIlesFormat}
                            components={components}
                            rowKey={r => r.key}
                            columns={myColumns}
                            pagination={{
                                total: this.state.total,
                                pageSize: this.state.limit,
                                hideOnSinglePage: true,
                                showSizeChanger: false,
                                current: this.state.page,
                                onChange: page => this.onChangePage(page)
                            }}
                            loading={this.state.loading}
                            rowClassName={(r) => (r.check_list == 1) ? 'bg-done' : (r.check_list == '-1') ? 'bg-error' : ''}
                        // rowClassName={r => console.log(r)}
                        />

                    </Col>
                </Row>
                <Modal
                    open={this.state.visibleNotChecked}
                    title='List not checked'
                    forceRender
                    onCancel={() => this.setState({ visibleNotChecked: false })}
                    footer={false}
                >
                    <Table
                        rowKey={(r, i) => r}
                        dataSource={this.state.datasNotCheckedList}
                        columns={columnsNotCheckedList}
                        pagination={{ pageSize: 20, showSizeChanger: false }}
                    />

                </Modal>
                {/* <Modal
                        open={visible}
                        title='Upload text'
                        forceRender
                        onCancel={() => this.setState({visible : false})}
                        onOk ={() => this.saveInfo()}
                    >
                        <p>Bạn có muốn lưu không ? </p>
                    </Modal>
                    <Modal
                        open={visibleReport}
                        title='Báo Cáo'
                        onCancel={() =>{
                            this.setState({visibleReport : false})
                            this.formReportRef.current.resetFields()
                        }}
                        onOk = {() =>this.submitReport()}
                    >
                        <Form ref={this.formReportRef} preserve={false} layout="vertical">
                            <Form.Item
                                name="content"
                                label="content"
                                rules={[{ required: true, message: 'Please input content' }]}
                            >
                                <Input.TextArea rows={7}/>
                            </Form.Item>
                        </Form>
                    </Modal> */}
                <Modal open={this.state.visibleNote}
                    title='Ghi chú'
                    forceRender
                    onCancel={() => this.setState({ visibleNote: false })}
                    footer={false}
                >
                    <span style={{ whiteSpace: 'pre-line' }}>{
                        `Hướng dẫn cách gắn nhãn:\n
                        1. text chỉ là chữ thường tiếng việt có dấu or tiếng anh đối với tên sản phẩm tên công ty ( không được dùng các ký tự đặc biệt ,các dấu câu, các số phải chuyển về dạng chữ, ..)\n
                        2. nếu có đoạn audio nghe không ra or không có tiếng thì có thể dùng biểu tượng bên cạnh để xóa ( chỉ dùng xóa đối với những audio này )\n
                        3. cố gắng gán nhãn đúng nhất có thể hạn chế lượt bỏ từ.`
                    }
                    </span>
                </Modal>
            </>
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(AudioCallV2));