import React, { Component, useContext, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Button, Table, Row, Col, Space, Form, Input } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import DeleteButton from '~/components/Base/DeleteButton';
import './configs/style.scss'
import { getListMessage, createMessage, deleteMessage, deleteMultipleMessage, getListMessageNotSent, markSentMessages, updateMessage } from '~/apis/chatBot/index';
import { channels } from './const';
import { ChatBotManagementForm } from './components';
import { checkPermission, showNotify, timeFormatStandard } from '~/services/helper';
import { trainingChatBot } from '~/apis/company/document/generate_ai';
import { dateFormat } from '~/constants/basic';

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
            handleSave({
                ...record,
                ...values,
            });
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
                <Input ref={inputRef} onPressEnter={save} onBlur={save} />
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

export class ChatBotManagement extends Component {
    /**
    * 
    * @param {*} props 
    */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            visiblePopup: false,
            listMessage: {
                rows: [],
                meta_data: {}
            },
            limit: 10,
            selectedRowKeys: [],
            detail: null
        };
    }

    /**
     * @lifecycle 
     */
    componentDidMount() {
        this.getListQuestion();
    }

    getListQuestion = (params = { limit: 10, page: 1 }) => {
        this.setState({ loading: true });
        let xhr = getListMessage(params);
        xhr.then((response) => {
            if (response.status) {
                let { data } = response;
                this.setState({
                    loading: false,
                    listMessage: data
                });
            }
        });
    }

    /**
     * onChange page
     * @param {*} page 
     */
    onChangePage = page => {
        const { limit } = this.state;
        this.getListQuestion({ limit: limit, page: page });
    }

    onCreateMessage = async params => {
        let res = await createMessage(params);
        if (res.status) {
            this.getListQuestion();
            this.setState({
                visiblePopup: false
            })
        }
    }

    onUpdateMessage = async params => {
        const { detail } = this.state;
        let update = {
            ...detail,
            ...params
        }
        let res = await updateMessage(update);
        if (res.status) {
            this.getListQuestion();
            this.setState({
                visiblePopup: false,
                detail: null
            })
        }
    }

    handleSave = async (row) => {
        const newData = [...this.state.listMessage.rows];
        const index = newData.findIndex((item) => row.id === item.id);
        const item = newData[index];

        let rowJson = JSON.stringify(row);
        let itemJson = JSON.stringify(item);

        if (rowJson === itemJson) {
            return;
        }

        let newRow = {
            ...row,
            is_sent: false
        }

        let res = await updateMessage(newRow);
        if (res.status) {
            showNotify("success", "Update success!")
        }

        const { data: updatedMessage } = res;

        newData.splice(index, 1, {
            ...item,
            ...updatedMessage,
        });

        this.setState({
            listMessage: {
                ...this.state.listMessage,
                rows: newData
            }
        })
    };

    onDelete = async (id) => {
        let res = await deleteMessage(id);
        if (res.status) {
            this.getListQuestion();
        }
    }

    onDeleteV2 = async (id) => {
        Promise.all([
            deleteMessage(id),
            trainingChatBot({
                "list_question_remove": [id]
            })
        ]).then((res) => {
            this.getListQuestion();
        }).catch((err) => {
            console.log(err);
        })
    }

    onDeleteMulti = async () => {
        const { selectedRowKeys } = this.state;
        if (!selectedRowKeys.length) return;
        const params = {
            ids: selectedRowKeys
        }

        let res = await deleteMultipleMessage(params);
        if (res.status) {
            this.getListQuestion();
        }

    }

    processMessages = async (messages = []) => {
        let arr = []
        messages.forEach((item) => {
            return item;
        })

        return {
            list_question: arr
        }
    }

    onTrainingAll = async () => {
        let res = await getListMessageNotSent();
        if (res.status) {
            const { listMessage } = this.state;
            const { rows = [] } = listMessage;
            let newRows = rows.map((item) => {
                return {
                    ...item,
                    is_sent: true
                }
            })

            this.setState({
                listMessage: {
                    ...listMessage,
                    rows: newRows
                },
                selectedRowKeys: []
            })

            showNotify("success", "Training all success!")
        }
    }

    onTraining = async () => {
        const { selectedRowKeys, listMessage } = this.state;
        if (!selectedRowKeys.length) return;
        let { rows = [] } = listMessage;
        const params = {
            ids: selectedRowKeys
        }
        let res = await markSentMessages(params);
        if (!res.status) return;

        let newRows = rows.map((item) => {
            if (selectedRowKeys.includes(item.id)) {
                return {
                    ...item,
                    is_sent: true
                }
            }
            return item;
        })

        this.setState({
            listMessage: {
                ...listMessage,
                rows: newRows
            },
            selectedRowKeys: []
        })

        let newRowsTraining = selectedRowKeys.map((item) => {
            let row = rows.find(r => r.id == item);
            let params = {
                ...row,
            }

            if (params.created_at != params.updated_at) {
                params.is_update = true;
            } else {
                params.is_update = false;
            }

            return params;
        })

        await trainingChatBot({
            "list_question": newRowsTraining
        })

        showNotify("success", "Training success!")
    }

    submitForm = (values) => {
        this.getListQuestion(values);
    }

    /**
     * @render
     */
    render() {
        let { t } = this.props;
        let { listMessage, visiblePopup, selectedRowKeys = [], limit } = this.state;
        let { rows = [], meta_data = {} } = listMessage;
        let { total = 0, page = 1 } = meta_data;

        const columns = [
            {
                title: t('No.'),
                render: r => rows.indexOf(r) + 1
            },
            {
                title: t('question'),
                dataIndex: 'question',
                editable: true,
                width: '20%',
            },
            {
                title: t('answer'),
                dataIndex: 'answer',
                editable: true,
            },
            {
                title: t('status'),
                editable: false,
                render: r => {
                    return r.status ? t('active') : t('inactive')
                }
            },
            {
                title: t('hr:channel'),
                editable: false,
                render: r => {
                    return channels[r.channel].name
                }
            },
            {
                title: t('hr:last_modified'),
                width: '15%',
                editable: false,
                render: r => {
                    const { staff_info: { staff_name, staff_id } } = r;
                    let modified = <div>
                        <span className='d-block' >
                            By: {staff_id === 0 ? "Bot" : staff_name}
                        </span>
                        <span className='d-block' >
                            Created: {timeFormatStandard(r.created_at, dateFormat)}
                        </span>
                        <span className='d-block' >
                            Updated: {timeFormatStandard(r.updated_at, dateFormat)}
                        </span>
                    </div>
                    return modified;
                }
            },
            {
                title: t('action'),
                render: r => {
                    return (<Space size={5}>
                        {
                            checkPermission('hr-tool-chat-bot-management-update') ?
                                <Button type="primary" size='small'
                                    onClick={() => {
                                        this.setState({
                                            visiblePopup: true,
                                            detail: r
                                        })
                                    }}
                                    icon={<FontAwesomeIcon icon={faPen} />}>
                                </Button>
                                : null
                        }
                        {
                            checkPermission('hr-tool-chat-bot-management-delete') ?
                            r.is_sent ? (
                                <DeleteButton onConfirm={(e) => {
                                    this.onDeleteV2(r.id)
                                }}
                                />
                            ) : (
                                <DeleteButton onConfirm={(e) => {
                                    this.onDelete(r.id)
                                }} />
                            )
                            : null
                        }
                    </Space>)
                },
                align: 'center',
                width: '10%'
            }
        ].map((item) => {
            if (!item.editable) {
                return item;
            }

            return {
                ...item,
                onCell: (record) => ({
                    record,
                    dataIndex: item.dataIndex,
                    title: item.title,
                    editable: true,
                    handleSave: this.handleSave,
                }),
            }
        })

        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => this.setState({ selectedRowKeys }),
            getCheckboxProps: (record) => ({
                disabled: record.is_sent,
                name: record.id,
            }),
            selectedRowKeys: selectedRowKeys
        };

        return (
            <>
                <PageHeader
                    title={t('hr:list_mess_chat_bot')}
                    tags={<Space size="small">
                        {
                            checkPermission('hr-tool-chat-bot-management-create') ? 
                                <Button key="create-question-cb" onClick={() => this.setState({ visiblePopup: true })} type="primary" icon={<FontAwesomeIcon icon={faPlus} />}>
                                    &nbsp;{t('add_new')}
                                </Button>
                            : null
                        }
                        {
                            selectedRowKeys.length ? (
                                <>
                                    {
                                        checkPermission('hr-tool-chat-bot-management-update') ? 
                                            <Button key="create-question-tn" onClick={() => this.onTraining()} type="primary">
                                                &nbsp;{t('training')}
                                            </Button>
                                        : null
                                    }
                                    {/* <Button key="create-question-tnd" onClick={() => this.onDeleteMulti()} type="danger" icon={<FontAwesomeIcon icon={faTrash} />}>
                                        &nbsp;{t('Delete')}
                                    </Button> */}
                                </>
                            ) : null
                        }
                        {/* <Button key="create-question-tna" onClick={() => this.onTrainingAll()} type="primary">
                            &nbsp;{t('Training all')}
                        </Button> */}
                    </Space>}
                />
                {/* <Row className="card pl-3 pr-3 mb-3">
                    <Form
                        className="pt-3"
                        ref={this.formRef}
                        name="searchStaffForm"
                        onFinish={(values) => this.submitForm(values)}
                        layout="vertical"
                    >
                        <Row gutter={[8, 8]}>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                <FormItem name="department_id" >
                                    <Dropdown datas={channels} defaultOption="-- All Departments --" />
                                </FormItem>
                            </Col>
                            <Col xs={24} sm={24} md={24} lg={4} xl={4} key='submit'>
                                <FormItem>
                                    <Button type="primary" htmlType="submit">
                                        {t('Search')}
                                    </Button>
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                </Row> */}
                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        <Table
                            className='table-striped-rows-list-message'
                            rowSelection={{
                                type: "checkbox",
                                ...rowSelection,
                            }}
                            components={{
                                body: {
                                    row: EditableRow,
                                    cell: EditableCell,
                                },
                            }}
                            rowClassName={(record) => record.is_sent ? 'row-sent' : ''}
                            dataSource={rows}
                            columns={columns}
                            loading={this.state.loading}
                            rowKey={(row) => row.id}
                            pagination={{
                                total: total,
                                pageSize: limit,
                                hideOnSinglePage: true,
                                showSizeChanger: false,
                                current: page,
                                onChange: page => this.onChangePage(page)
                            }}
                        />
                    </Col>
                </Row>
                <ChatBotManagementForm
                    translang = {this.props}
                    visible={visiblePopup}
                    onCancel={() => { this.setState({ visiblePopup: false, detail: null }) }}
                    onCreate={(params) => { this.onCreateMessage(params) }}
                    onUpdate={(params) => { this.onUpdateMessage(params) }}
                    detail={this.state.detail}
                />
            </>
        );
    }
}
/**
 * Map redux state to component props
 * @param {Object} state 
 */
const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    }
}
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(ChatBotManagement)