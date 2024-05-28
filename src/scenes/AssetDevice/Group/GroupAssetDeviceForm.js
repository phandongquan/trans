import React, { Component } from 'react'
import { connect } from 'react-redux'
import { PageHeader } from "@ant-design/pro-layout";
import { Link } from "react-router-dom";
import {
    Button,
    Table,
    Row,
    Col,
    Form,
    Input,
    Space,
    InputNumber,
    Modal,
    Spin
} from "antd";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPen, faList, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { MinusCircleOutlined, PlusOutlined, QuestionCircleOutlined, UploadOutlined } from '@ant-design/icons'
import { checkPermission, redirect, showNotify } from '~/services/helper'
import { save as apiSave, list as apiList, destroy, detail, saveV2 } from '~/apis/assetDevice/group'
import { list as apiListPart, save as apiSavePart  } from '~/apis/assetDevice/part'
import { MenuOutlined, DeleteOutlined } from "@ant-design/icons";
import Dropdown from "~/components/Base/Dropdown";
import SkuDeviceDropdown from '../config/SkuDeviceDropdown';
import { DndContext } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { screenResponsive, status_assetDevices, typeFileImagePng } from '~/constants/basic';
import Upload from "~/components/Base/Upload";
import { MEDIA_URL_HR } from '~/constants';
import { f } from 'rhino-react-image-lightbox-rotate';
import { status } from '~/scenes/ChatBotManagement/const';
const FormItem = Form.Item;
const Rows = ({ children, ...props }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: props["data-row-key"],
    });
    const style = {
        ...props.style,
        transform: CSS.Transform.toString(
            transform && {
                ...transform,
                scaleY: 1,
            }
        ),
    };
    return (
        <tr {...props} ref={setNodeRef} style={style} {...attributes}>
            {React.Children.map(children, (child) => {
                if (child.key === "sort") {
                    return React.cloneElement(child, {
                        children: (
                            <MenuOutlined
                                ref={setActivatorNodeRef}
                                style={{
                                    touchAction: "none",
                                    cursor: "move",
                                }}
                                {...listeners}
                            />
                        ),
                    });
                }
                return child;
            })}
        </tr>
    );
};
export class GroupAssetDeviceForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            datas: [],
            visible: false,
            group: null,
            parts: [],
            part: null,
            datasCriterions: [],
            status: 0,
            images: []
        };
        this.formAddRef = React.createRef();
        this.formRef = React.createRef();
    }

    componentDidMount() {
        const { id } = this.props.match.params;
        this.getDetailGroup();
        this.getDetailParts({ group_id: id })
    }

    /**
     * Get list parts 
     * @param {*} params 
     */
    getDetailParts = params => {
        if(!params.group_id) return;
        let xhr = apiListPart(params)
        xhr.then(res => {
            if (res.status) {
                this.setState({ parts: res.data.rows })
            }
        })
    }

    getDetailGroup = async (params = {}) => {
        let { id } = this.props.match.params;
        if (id) {
            let response = await detail(id,params)
            if(response.status) {
                let { data } = response;
                this.setState({
                    group: data,
                    status: data.status
                });
                // console.log('group',this.state.group)
                this.formAddRef.current.setFieldsValue(data)            
            }
        }
    }

    /**
     * Click edit
     * @param {*} part 
     */
    clickEdit = part => {
        this.setState({ visible: true, part: part, datasCriterions: part.criterions })
        // console.log('part', this.state.part)
        if(this.formRef.current) {
            this.formRef.current.setFieldsValue(part)
        }
    }
    onCancelModal = () => {
        this.setState({ visible: false });
    }
    onDragEnd({ active, over }) {
        let { parts } = this.state;
        if (active?.id !== over?.id) {
            const activeIndex = parts.findIndex(
                (item) => item.priority === active?.id
            );
            const overIndex = parts.findIndex((item) => item.priority === over?.id);

            let partsNew = arrayMove(parts, activeIndex, overIndex);
            partsNew.map((d, i) => {
                d["priority"] = i + 1;
            });
            this.setState({ parts: partsNew });
        }
    }
    /**
     *
     * @param {*} event
     * @param {*} index
     * @param {*} field
     */
    setStateTitle(event, index, field) {
        let val = null;
        if (field == "name") {
            val = event.target.value;
        } else {
            val = event;
        }
        let detailNews = this.state.parts;
        if (typeof detailNews[index] != "undefined") {
            detailNews[index][field] = val;
        }
        this.setState({ parts: detailNews });
    }

    onClickNewRound() {
        let { parts } = this.state;
        let dataNew = {
            id: 0,
            name: null,
            group_id: this.state.group ? this.state.group.id : 0,
            maintenance_month: 0,
            images: [],
        };
        parts.push(dataNew);
        this.setState({ parts });
    }
    onClickDeleteRound(id) {
        let { parts } = this.state;
        const index = parts.findIndex(part => part.id === id);
        if (index !== -1) {
            parts.splice(index, 1);
            this.setState({ parts: parts });
        }
    }
    onClickNewRoundModal() {
        let { datasCriterions } = this.state;
        let result = datasCriterions.slice()
        let dataNew = {
            name: null,
            note: '',
            duration: null,
        };
        result.push(dataNew);
        this.setState({ datasCriterions: result });
    }
    
    handleDeleteModal(index) {
        let { datasCriterions } = this.state;
        let result = datasCriterions?.slice()
        result.splice(index, 1);
        this.setState({ datasCriterions: result });

    }

    submitForm(values) {
        const { t } = this.props;
        const { part, datasCriterions } = this.state;
        let formData = new FormData();
        formData.append('group_id', values.group_id);
        formData.append('name', values.name);
        formData.append('maintenance_month', values.maintenance_month);
        if (values.images && values.images.length > 0) {
            for (let i = 0; i < values.images.length; i++) {
                formData.append(`images[${i}]`, values.images[i]);
            }
        } else {
            formData.append('images', []);
        }
        let continueProcessing = true;
        let arrKey = ['id', 'name', 'note', 'duration']
        if (datasCriterions.length === 0) {
            showNotify('Notification',t("hr:add_new_criterion"), 'error')
            continueProcessing = false
        } else {
            datasCriterions.map((c, i) => {
                if (!continueProcessing) {
                    return;
                }
                arrKey.map(k => {
                    if (typeof c[k] != 'undefined' && (c[k] || c[k] == 0)) {
                        formData.append(`criterions[${i}][${k}]`, c[k])
                    } else {
                        if ((k != 'note' && k != 'id')) {
                            showNotify('Notification', `Input requirement ${k}`, 'error')
                            continueProcessing = false
                        }
                    }
                })
            })
        }
        if (!continueProcessing) {
            return;
        }
        let xhr = apiSavePart(part ? part.id : 0, formData)
        xhr.then(res => {
            if (res.status) {
                this.onCancelModal();
                this.getDetailParts({ group_id: values.group_id })
                showNotify('Notification', t('success'))
            } else {
                showNotify('Notification', res.message, 'error')
            }
        })
        xhr.catch(err => showNotify('Notification', err, 'error'))
    }

    
    handleValidateForm = () => {
        this.formRef.current.validateFields()
            .then((values) => {
                console.log(values)
                this.submitForm(values);
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    }
    async handleSubmitForm(values) {
        const { t } = this.props;
        let { group,parts } = this.state;
        if (!parts.length) {
            showNotify("Notification", t("hr:add_new_round"), "error");
            return false;
        }
        values.parts = parts;
        // formData use for upadate data just update info not include criterions and images
        let formData = new FormData();
        formData.append('name', values.name);
        formData.append('sku', values.sku);
        formData.append('status', values.status);
        formData.append('maintenance_month', values.maintenance_month);
        parts.map((d, i) => {
            formData.append(`parts[${i}][id]`, d.id);
            formData.append(`parts[${i}][name]`, d.name);
            formData.append(`parts[${i}][maintenance_month]`, d.maintenance_month);
        });
        let { id } = this.props.match.params;
        let response, message; 
        if (id) {
            response = await saveV2(id, formData);
            message =t('asset') +(' ') + t('device') +(' ') + t('group') +(' ') + t('hr:updated');
        } else {
            response = await apiSave(group ? group.id : 0,values);
            message = t('asset') +(' ') + t('device') +(' ') + t('group') +(' ') + t('hr:created');
        }
        this.setState({ loading: false });
        if (response.status) {
            showNotify("Notification", message);
            this.getDetailParts({ group_id: response.data.id })
            return redirect(`/asset-device/group/edit/${response.data.id}`);
        } else {
            showNotify("Notification", response.message, "error");
        }
    }
    setDatasCriterions(event, index, field) {
        let { datasCriterions } = this.state;
        let datasNew = datasCriterions.slice()
        const arrFieldEvent = ['name', 'note']
        let val = null;
        if (arrFieldEvent.includes(field)) {
            val = event?.target?.value;
        } else {
            val = event;
        }
        if (typeof datasNew[index] != "undefined") {
            datasNew[index][field] = val;
        }
        this.setState({ datasCriterions: datasNew });
    }
    updateStatus = async(status) =>{
        const { t } = this.props;
        let { group } = this.state;
        group.status = status;
        let response = await apiSave(group.id, group);
        if (response.status) {
            showNotify('Notification',t('success'))
            this.getDetailGroup();
        } else {
            showNotify('Notification', response.message, 'error')
        }
    }
    /**
     *
    * @returns
     */
    renderAction() {
        const { t } = this.props;
        const { group } = this.state;
        if(group?.status === 3) {
            return null;
        }
        switch (group?.status) {
            case 0:
                return (
                    <>
                        {
                        checkPermission('hr-asset-device-group-verify') ?
                            <>  
                                <Button type='primary' className='ml-2' onClick={() => this.updateStatus(1)}>{t('verify')}</Button>
                            </>
                        : null
                        }   
                    </>
                );
            case 1:
                return (
                    <>
                        {
                        checkPermission('hr-asset-device-group-approve') ?
                            <>
                            <Button type='primary' className='ml-2' onClick={() => this.updateStatus(2)}>{t('hr:approve')}</Button>
                            </>
                        : null
                        }
                    </>
                );
            case 2:
                return (
                    <>
                    {
                    checkPermission('hr-asset-device-group-approve') ?
                        <>
                        <Button type='primary' className='ml-2' onClick={() => this.updateStatus(0)}>{t('hr:unapprove')}</Button>             
                        </>
                    : null
                    }
                    </>
                );
            default:
                return null;
        }
    }
    renderActionColumn(r) {
        const { group, status } = this.state;
        if (!group?.id) {
            return <Button
                className='btn_icon_image ml-2'
                type="danger"
                size="small"
                onClick={() => this.onClickDeleteRound(r.id)}
            >
                <FontAwesomeIcon style={{ marginLeft: 5 }} icon={faTrashAlt} />
            </Button>
        }
        if (status === 3) {
            return null;
        }
        switch (group?.status) {
            case 0:
                return checkPermission('hr-asset-device-group-update') ?
                    <>
                        <Button className='btn_icon_image ml-2' type="primary" size="small" onClick={() => this.clickEdit(r)}>
                            <FontAwesomeIcon style={{ marginLeft: 5 }} icon={faPen} />
                        </Button>
                        <Button
                            className='btn_icon_image ml-2'
                            type="danger"
                            size="small"
                            onClick={() => this.onClickDeleteRound(r.id)}
                        >
                            <FontAwesomeIcon style={{ marginLeft: 5 }} icon={faTrashAlt} />
                        </Button>
                    </>
                    : null;
            case 1:
                return checkPermission('hr-asset-device-group-verify') ?
                    <>
                        <Button className='btn_icon_image ml-2' type="primary" size="small" onClick={() => this.clickEdit(r)}>
                            <FontAwesomeIcon style={{ marginLeft: 5 }} icon={faPen} />
                        </Button>
                        <Button
                            className='btn_icon_image ml-2'
                            type="danger"
                            size="small"
                            onClick={() => this.onClickDeleteRound(r.id)}
                        >
                            <FontAwesomeIcon style={{ marginLeft: 5 }} icon={faTrashAlt} />
                        </Button>
                    </>
                    : null;
            case 2:
                return checkPermission('hr-asset-device-group-approve') ?
                    <>
                        <Button className='btn_icon_image ml-2' type="primary" size="small" onClick={() => this.clickEdit(r)}>
                            <FontAwesomeIcon style={{ marginLeft: 5 }} icon={faPen} />
                        </Button>
                        <Button
                            className='btn_icon_image ml-2'
                            type="danger"
                            size="small"
                            onClick={() => this.onClickDeleteRound(r.id)}
                        >
                            <FontAwesomeIcon style={{ marginLeft: 5 }} icon={faTrashAlt} />
                        </Button>
                    </>
                    : null;
            default:
                return null;
        }
    }
    submitButton() {
        const { t } = this.props;
        const { status,group } = this.state;
        let { id } = this.props.match.params;
        if (id){
            if (
                (checkPermission("hr-asset-device-group-update") && 
                [0].includes(status)) ||
                (checkPermission("hr-asset-device-group-approve") &&
                    [0, 1, 2].includes(status)) ||
                (checkPermission("hr-asset-device-group-verify") &&
                    [0, 1].includes(status)) ||
                !group ||
                status === 0
            ) {
                return (
                    <>
                        <Button type="primary" htmlType="submit">
                            {t("submit")}
                        </Button>
                        <Button onClick={() => this.updateStatus(3)} className='ml-2'>
                            {t("cancel")}
                        </Button>
                    </>
                );
            }
            return [];
        }else{
            return (
                <>
                    <Button type="primary" htmlType="submit">
                       {t("submit")}
                    </Button>
                </>
            ); 
        }
    }
    removeImage = () =>{
        this.formRef.current.setFieldsValue({images: []})
    }
    render() {
        const { t } = this.props;
        
        const { id } = this.props.match.params;
        const { parts, datasCriterions, part, status } = this.state;
         const columnsModal = [
            {
                title: t('name'),
                render: (t, r, i) => <Input placeholder='Name' value={r.name} onChange={e => this.setDatasCriterions(e, i, "name")} />
            },
            {
                title: t('note'),
                render: (t, r, i) => <Input placeholder='Note' value={r.note} onChange={e => this.setDatasCriterions(e, i, "note")} />
            },
            {
                title: t('duration') + (' ') + t('minute'),
                render: (t, r, i) => <InputNumber placeholder='duration (min)'
                    value={r.duration}
                    controls={false}
                    style={{ width: '100%' }}
                    onChange={e => {
                        if (e > 32767) {
                            showNotify('Notification', 'Duration Less than 32767 !', 'error')
                            return false
                        } else {
                            this.setDatasCriterions(e, i, "duration")
                        }
                    }}
                />
            },
            {
                title: t('action'),
                width: 100,
                align: 'center',
                render: (t, r, i) => 
                <MinusCircleOutlined style={{ marginTop: 8 }} onClick={() => this.handleDeleteModal(i)} />
            }
        ]

        const columns = [
            {
                title: t("hr:component"),
                dataIndex: "component",
                key: "component",
                render: (text, r, index) => {
                    return (
                        <Input
                            placeholder={t("hr:component")}
                            value={r.name}
                            onChange={(event) => this.setStateTitle(event, index, "name")}
                        ></Input>
                    );
                },
            },
            {
                title: t('hr:maintenance') + (' ') + t('month'),
                width: 100,
                dataIndex: "component",
                key: "component",
                render: (text, r, index) => {
                    return (
                        <InputNumber
                            placeholder={t('hr:maintenance') + (' ') + t('month')}
                            value={r.maintenance_month}
                            onChange={(event) => this.setStateTitle(event, index, "maintenance_month")}
                        />
                    )
                },
            },
            {
                title: t("action"),
                key: "action",
                width: 100, 
                align: 'center',
                render: (text, r, index) => {
                    return (
                        <>
                            {
                                this.renderActionColumn(r)
                            }
                        </>
                    );
                },
            },
        ];
        // set condition render image column
        if (id) {
            let desiredIndex = columns.length - 1;
            let imageColumn = {
                title: t("hr:image"),
                dataIndex: "image",
                key: "image",
                align: 'center',
                render: (text, r, index) => {
                    return (
                        r.images?.length ? r.images.map((d, i) => {
                            return (
                                <img src={`${MEDIA_URL_HR}${d}`} style={{ width: 100, height: 100 }} />
                            )
                        }) : ''
                    );
                },
            };
            columns.splice(desiredIndex, 0, imageColumn);
        }
        return (
            <div>
                <PageHeader title={t('hr:group_asset_device_form')}/>
                <Row className="card pl-3 pr-3 mb-3">
                    <Spin spinning={this.state.loading}>
                        <Form
                            ref={this.formAddRef}
                            name="detailForm"
                            layout="vertical"
                            className="pt-3 ant-advanced-create-form"
                            onFinish={this.handleSubmitForm.bind(this)}
                        >
                            <Row gutter={24}>
                                <Col xs={24} sm={24} md={24} lg={7} xl={7}>
                                    <Form.Item
                                        label={t('name')} name='name' rules={[{ required: true, message: t('hr:input_title') }]}
                                    >
                                        <Input placeholder={t('name')} className="w-70" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                    <Form.Item label='SKU' name='sku' rules={[{ required: true, message: t('hr:please_input') + (' ') + t('Sku') }]}  >
                                        <SkuDeviceDropdown defaultOption={ t('SKU') + (' ') + t('hr:device')}
                                            mode="multiple" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                    <Form.Item label={t('status')}name='status' initialValue={0}>
                                        <Dropdown
                                            disabled={true}
                                            defaultOption={t('status')}
                                            datas={status_assetDevices}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={5} xl={5}>
                                    <Form.Item label={t('hr:maintenance') + (' ') + t('month')}  name='maintenance_month'
                                        rules={[{ required: true, message: t('hr:please_input') + (' ') + t('maintenance') + (' ') + t('month') }]}
                                    >
                                        <InputNumber placeholder={t('hr:maintenance') + (' ') + t('month')} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Space>
                                <Button
                                    type="link"
                                    style={{ color: "#135200" }}
                                    onClick={() => this.onClickNewRound()}
                                >
                                    <strong>{t('add_new') + (' ') + t('component')}</strong>
                                </Button>
                            </Space>
                            <DndContext
                                modifiers={[restrictToVerticalAxis]}
                                onDragEnd={(event) => this.onDragEnd(event)}
                            >
                                    <Table
                                        components={{
                                            body: {
                                                row: Rows,
                                            },
                                        }}
                                        dataSource={[...parts]}
                                        columns={columns}
                                        pagination={false}
                                        rowKey="priority"
                                    ></Table>
                             </DndContext>
                            <Row className="mt-3 mb-2">
                                <Col span={12}>
                                    <Link to={`/asset-device/group`}>
                                        <Button className=" mr-5" htmlType="button">
                                            {"Back"}
                                        </Button>
                                    </Link>
                                </Col>
                                <Col span={12}>
                                    <div className="float-right">
                                        {this.submitButton()}
                                        {this.renderAction()}
                                        {/* {
                                            status === 3 ? null :
                                            (
                                                id ?
                                                    (
                                                    checkPermission('hr-asset-device-group-update') ?
                                                        <Button onClick={() => this.updateStatus(3)} className='ml-2'>
                                                            Cancel
                                                        </Button>
                                                    : null
                                                    )
                                                : null
                                            )
                                        } */}
                                    </div>
                                </Col>
                            </Row>
                        </Form>
                    </Spin>
                </Row>
                <Modal
                    forceRender
                    open={this.state.visible}
                    onCancel={this.onCancelModal.bind(this)}
                    width={window.innerWidth < screenResponsive ? '100%' : '60%'}
                    title={parts ? parts.name : t('add_new') + (' ') + t('hr:parts')}
                    onOk={this.handleValidateForm.bind(this)}
                    afterClose={() => this.formRef.current.resetFields()}
                >
                    <Form
                        layout='vertical'
                        ref={this.formRef}
                    >
                        <Row gutter={12}>
                            <Col span={24}>
                                <Form.Item name='group_id' hidden initialValue={id}>
                                    <Input value={id} />
                                </Form.Item>
                                <Form.Item name='name' label={t('hr:parts') + (' ') + t('name') + (' - ') +t('criterion')} rules={[{ required: true, message: t('hr:please_input') + (' ') + t('parts') }]}>
                                    <Input  placeholder={t('hr:parts') + (' ') + t('name')} />
                                </Form.Item>
                                <Form.Item label={t('hr:maintenance') + (' ') + t('month')} name='maintenance_month'>
                                    <InputNumber placeholder={t('hr:maintenance') + (' ') + t('month')} />
                                </Form.Item>
                                <Form.Item name='images' label={t('image')}>
                                    <Upload
                                        defaultFileList={part?.images?.length ? part.images.map((d, i) => {
                                            return {
                                                uid: i,
                                                name: d,
                                                status: 'done',
                                                url: `${MEDIA_URL_HR}${d}`
                                            }
                                        } ) : []}
                                        listType="picture"
                                        accept='image/png'
                                        type={typeFileImagePng}
                                        onRemove={this.removeImage}
                                    >
                                        <Button icon={<UploadOutlined />}>{t('select_file')}</Button>
                                    </Upload>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <div>{t('standard')}</div>
                                <Table
                                    dataSource={this.state.datasCriterions}
                                    columns={columnsModal}
                                    pagination={false}
                                    rowKey={'id'}
                                />
                             
                                <Button className='mt-1' type="dashed" onClick={()=>this.onClickNewRoundModal()} block icon={<PlusOutlined />}>
                                    {t('add') + (' ') + t('standard')} 
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Modal>
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    };
}
const mapDispatchToProps = {};
export default connect(mapStateToProps, mapDispatchToProps)(GroupAssetDeviceForm)