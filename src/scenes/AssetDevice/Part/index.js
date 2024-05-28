import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Button, Col, Row, Table, Modal, Form, Input, Space, Popconfirm, Upload as UploadAntd, InputNumber } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { detail as apiDetailGroup } from '~/apis/assetDevice/group'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrashAlt, faPen } from '@fortawesome/free-solid-svg-icons';
import { MinusCircleOutlined, PlusOutlined, QuestionCircleOutlined , UploadOutlined } from '@ant-design/icons'
import { save as apiSave, list as apiList, destroy } from '~/apis/assetDevice/part'
import {screenResponsive, status_assetDevices, typeFileImagePng} from '~/constants/basic';
import Dropdown from '~/components/Base/Dropdown';
import { typeAssetDevice } from '../config';
import { showNotify } from '~/services/helper';
import Upload from "~/components/Base/Upload";
import { MEDIA_URL_HR } from '~/constants';

const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

const readFileAsBinaryString = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            resolve(event.target.result);
        };
        reader.onerror = reject;
        reader.readAsBinaryString(file);
    });
};
export class index extends Component {

    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            group: null,
            parts: [],
            visible: false,
            part: null ,
            datasCriterions : [],
            imgCriterions : []
        }
        this.formRef = React.createRef();
        this.formSearchRef = React.createRef();
    }
    

    componentDidMount() {
        const { group_id } = this.props.match.params
        this.getGroupDetail(group_id)
        this.getListParts({ group_id })
    }

    /**
     * Get group detail
     * @param {*} id 
     */
    getGroupDetail = id => {
        let xhr = apiDetailGroup(id)
        xhr.then(res => {
            if(res.status) {
                this.setState({ group: res.data })
            }
        })
    }

    /**
     * Get list parts 
     * @param {*} params 
     */
    getListParts = params => {
        let xhr = apiList(params)
        xhr.then(res => {
            if(res.status) {
                this.setState({ parts: res.data.rows })
            }
        })
    }

    /**
     * On cancel modal
     */
    onCancelModal = () => {
        this.setState({ visible: false, part: null })
    }

    /**
     * Handle submit form
     */
    handleSubmitForm = () => {
        this.formRef.current.validateFields()
            .then((values) => {
                this.submitForm(values);
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    }
    // /**
    //  * Submit form
    //  * @param {*} values 
    //  */
    // submitForm = values => {
    //     const { group_id } = this.props.match.params
    //     const { part } = this.state;
    //     let arrCriterions = values.criterions.slice();
    //     let formData = new FormData();
    //     formData.append('group_id',values.group_id);
    //     formData.append('name',values.name); 
    //     if (arrCriterions.length) {
    //         arrCriterions.map((c, i) => {
    //             formData.append(`criterions[${i}][name]`, c.name)
    //             formData.append(`criterions[${i}][note]`, c.note)
    //             formData.append(`criterions[${i}][duration]`, c.duration)
    //             formData.append(`criterions[${i}][status]`, c.status)
    //             if(c.images && typeof c.images[0] != 'undefined'){
    //                 const binaryFile = c.images[0].originFileObj; // Lấy đối tượng file gốc
    //                 const itemsWithBinaryFile  = {
    //                     name: c.name,
    //                     file: readFileAsBinaryString(binaryFile),
    //                 };
    //                 console.log(itemsWithBinaryFile)
    //                 formData.append(`criterions[${i}][images]`, itemsWithBinaryFile)
    //             }
    //         })
    //     }
    //     return      
    //     let xhr = apiSave(part ? part.id : 0, formData)
    //     xhr.then(res => {
    //         this.onCancelModal();
    //         this.getListParts({group_id})
    //     })
    // }
    submitForm(values) {
        const { group_id } = this.props.match.params
        const { part } = this.state;
        let { datasCriterions } = this.state;
        let formData = new FormData();
        formData.append('group_id', values.group_id);
        formData.append('name', values.name);
        let continueProcessing = true;
        if (datasCriterions.length) {
            let arrKey = ['id','name', 'note', 'duration', 'status']
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

                if (c.images && c.images instanceof File) {
                    formData.append(`criterions[${i}][images][]`, c.images)
                }
            })
        }
        if (!continueProcessing) {
            return;
        }
        let xhr =  apiSave(part ? part.id : 0, formData)
        xhr.then(res => {
            if(res.status) {
                this.onCancelModal();
                this.getListParts({ group_id })
                showNotify('Notification', 'Success !')
            }else{
                showNotify('Notification',res.message, 'error')
            }
        }) 
        xhr.catch(err =>  showNotify('Notification',err, 'error'))
    }
    /**
     * Click edit
     * @param {*} part 
     */
    clickEdit = part => {
        this.setState({ visible: true, part , datasCriterions : part?.criterions })
        if(this.formRef.current) {
            this.formRef.current.setFieldsValue(part)
        }
    }

    /**
     * Delete part
     * @param {*} id 
     */
    deletePart = async id => {
        let res = await destroy(id)
        if(res.status) {
            const { group_id } = this.props.match.params
            this.getListParts({ group_id })
        }
    }
    beforeUpload = (file) => {
        const isPNG = file.type == 'image/png';
        if (!isPNG) {
          showNotify('Notification','You can only upload PNG files!','error');
          return false;
        }
      };
    handleDelete(index) {
        let { datasCriterions } = this.state;
        let result = datasCriterions?.slice()
        result.splice(index, 1);
        this.setState({ datasCriterions: result });
    }
    onClickAddNew() {
        let { datasCriterions } = this.state;
        let result = datasCriterions.slice()
        let dataNew = {
            name : null,
            note : '' ,
            duration : null,
            status : null,
            images : null
        };

        result.push(dataNew);
        this.setState({ datasCriterions : result });
    }
    setDatasCriterions(event, index, field){
        let { datasCriterions } = this.state;
        let datasNew = datasCriterions.slice()
        const arrFieldEvent = ['name', 'note']
        let val = null;
        if (arrFieldEvent.includes(field)) {
            val = event?.target?.value;
        }else if(field == 'images'){
            val = event.length ? event[0] : event
        } else {
            val = event;
        }
        if (typeof datasNew[index] != "undefined") {
            datasNew[index][field] = val;
        }
        this.setState({ datasCriterions : datasNew });
    }
    render() {
        const { group, parts, visible, part } = this.state;
        const {t} = this.props
        if(!group) return '';

        const columns = [
          {
            title: "No.",
            render: (r) => parts.indexOf(r) + 1,
          },
          {
            title: t('hr:parts'),
            render: (r) => (
                r.name
            //   <Button type="link" onClick={() => this.clickEdit(r)}>
            //     {r.name}
            //   </Button>
            ),
          },
          {
            title: t('standard'),
            dataIndex: "criterions",
            render: (criterions) => {
              let result = [];
              criterions.map((c) => result.push(<div key={c.id}>{c.name}</div>));
              return result;
            },
          },
          {
            title: t('image') + (' ') + t('standard'),
            dataIndex: "images",
            render: (r) =>{ 
                return r?.length > 0 ? <img src={MEDIA_URL_HR + r[0]} style={{width: 100}}/> : ''
            }
           
          },
        //   {
        //     title: "Action",
        //     render: (r) => {
        //       return (
        //         <>
        //               {/* <Button className='btn_icon_image' type="primary" size="small" onClick={() => this.clickEdit(r)}>
        //                   <FontAwesomeIcon icon={faPen} />
        //               </Button> */}
        //               <Popconfirm
        //                   title="Bạn có muốn xóa bộ phận này và các tiểu chuẩn kèm theo ?"
        //                   placement="topLeft"
        //                   icon={<QuestionCircleOutlined style={{ color: "red" }} />}
        //                   onConfirm={(e) => this.deletePart(r.id)}
        //               >
        //                   <Button
        //                       type="primary"
        //                       size="small"
        //                       className='ml-2'
        //                       icon={<FontAwesomeIcon icon={faTrashAlt} />}
        //                   />
        //               </Popconfirm>
        //         </>
        //       );
        //     },
        //   },
        ];
        const columnsCriterions = [
            {
                title: t('name'),
                render: (t , r , i) => <Input placeholder='Name' value={r.name} onChange={e => this.setDatasCriterions(e, i, "name")}/>
            },
            {
                title: t('note') ,
                render: (t , r , i) => <Input placeholder='Note' value={r.note} onChange={e => this.setDatasCriterions(e, i, "note")}/>
            },
            {
                title: t('duration'),
                render: (t, r, i) => <InputNumber placeholder='duration (min)'
                    value={r.duration}
                    controls={false}
                    style={{ width: '100%' }}
                    onChange={e => {
                        if(e > 32767){
                            showNotify('Notification', 'Duration Less than 32767 !', 'error')
                            return false
                        }else{
                            this.setDatasCriterions(e, i, "duration")
                        }
                    }}
                />
            },
            {
                title: t('image'),
                render: (t , r , i) => <div style={{width: 200}}><Upload
                    defaultFileList = {
                        r.images?.length > 0 ?
                            [{
                                uid: r.id + 1,
                                name: r.images[0],
                                status: "done",
                                url: MEDIA_URL_HR + r.images[0],
                            }]
                            : []
                    }
                    listType="picture"
                    onChange={v => this.setDatasCriterions(v, i, "images")}
                    onRemove={v => this.setDatasCriterions(v, i, "images")}
                    accept='image/png'
                    type={typeFileImagePng}
                >
                    <Button icon={<UploadOutlined />}>{t('select_file')}</Button>
                </Upload>
                </div>
            },
            {
                title: t('action'),
                render: (t , r , i)=> <MinusCircleOutlined style={{ marginTop: 8 }} onClick={() => this.handleDelete(i) }/>
            }
        ]
        return (
            <>
                <PageHeader 
                    title={group.name} 
                    // tags={[
                    //     <Button type="primary" key='create' icon={<FontAwesomeIcon icon={faPlus} />}
                    //         onClick={() => this.setState({ visible: true, part: null , datasCriterions : []})}
                    //     >
                    //         &nbsp; Tạo mới
                    //     </Button>
                    // ]}
                />
                <Table
                    columns={columns}
                    rowKey='id'
                    pagination={{pageSize: 30}}
                    dataSource={parts}
                />
                <Modal
                    forceRender
                    open={visible}
                    onCancel={this.onCancelModal.bind(this)}
                    width=  {window.innerWidth < screenResponsive  ? '100%' : '60%'} 
                    title={part ? part.name : t('add_new') + (' ') + t('hr:parts')}
                    onOk={this.handleSubmitForm.bind(this)}
                    afterClose={() => this.formRef.current.resetFields()}
                >
                    <Form
                        layout='vertical'
                        ref={this.formRef}
                    >
                        <Row gutter={12}>
                            <Col span={24}>
                                <Form.Item name='group_id' hidden initialValue={group.id}>
                                    <Input value={group.id} />
                                </Form.Item>
                                <Form.Item name='name' label={t('hr:parts') + (' ') + t('name') + (' - ') +t('criterion')} rules={[{ required: true, message: t('hr:please_input') + (' ') + t('parts') }]}>
                                    <Input placeholder='Tên bộ phận' />
                                </Form.Item>
                                <Form.Item label={t('hr:maintenance') + (' ') + t('month')} name='maintenance_month'>
                                    <InputNumber placeholder={t('hr:maintenance') + (' ') + t('month')} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <div>{t('standard')}</div>
                                {/* <Form.List name="criterions" label='Tiểu chuẩn'>
                                    {(fields, { add, remove }) => (
                                        <>
                                            {fields.map(({ key, name, ...restField }) => (
                                                <Row key={key} gutter={12}>
                                                    <Col span={5}>
                                                        <Form.Item {...restField} name={[name, 'id']} hidden>
                                                            <Input placeholder='Id' />
                                                        </Form.Item>
                                                        <Form.Item {...restField} name={[name, 'name']}>
                                                            <Input placeholder='Name' />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={5}>
                                                        <Form.Item {...restField} name={[name, 'note']}>
                                                            <Input placeholder='Note' />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={4}>
                                                        <Form.Item {...restField} name={[name, 'duration']}>
                                                            <InputNumber placeholder='duration (min)' controls={false} style={{ width: '100%' }}/>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={4}>
                                                        <Form.Item {...restField} name={[name, 'status']}>
                                                            <Dropdown datas={status_assetDevices}/>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={5}>
                                                        <Form.Item
                                                            {...restField}
                                                            name={[name, 'images']}
                                                            fieldKey={[key, 'images']}
                                                            valuePropName="fileList"
                                                            getValueFromEvent={normFile}
                                                            extra="Upload a file PNG!"
                                                        >
                                                            <UploadAntd
                                                                listType="picture"
                                                                beforeUpload={e => this.beforeUpload(e)}
                                                                accept = 'image/png'
                                                            >
                                                                <Button icon={<UploadOutlined />}>Select File</Button>
                                                            </UploadAntd>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={1}>
                                                        <MinusCircleOutlined style={{ marginTop: 8 }} onClick={() => remove(name)} />
                                                    </Col>
                                                </Row>
                                            ))}
                                            <Form.Item>
                                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                    Thêm tiêu chuẩn
                                                </Button>
                                            </Form.Item>
                                        </>
                                    )}
                                </Form.List> */}
                                <Table
                                    dataSource={this.state.datasCriterions}
                                    columns={columnsCriterions}
                                    pagination={false}
                                    rowKey={'id'}
                                />
                                <Button className='mt-1' type="dashed" onClick={() => this.onClickAddNew()} block icon={<PlusOutlined />}>
                                    {t('add') + (' ') + t('standard')} 
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Modal>
            </>
        )
    }
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = {}

 export default connect(mapStateToProps, mapDispatchToProps)(index)