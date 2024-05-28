import React, { Component } from 'react'
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Table, Row, Col, Button, Form, Input, Modal, Image, Popover, Avatar ,Spin ,Dropdown as DropdownAntd , Menu , Tag , Badge,DatePicker} from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { getList, apiListComment ,apiReplyFeedbacks , apiDeleteFeedback , apiDeleteReply , updateStatus , apiListType , updateType} from '~/apis/company/staff/feedbacks';
import Tab from '~/components/Base/Tab';
import tabListFeedbacks from '../config/tabListFeedbacks';
import dayjs from 'dayjs';
import { CommentOutlined } from '@ant-design/icons';
import { uniqueId } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip, faFilePdf, faFil, faFileExport, faFile } from '@fortawesome/free-solid-svg-icons';
import { PaperClipOutlined , EllipsisOutlined , DeleteOutlined , ExclamationCircleOutlined} from '@ant-design/icons';
import UploadMultiple from '~/components/Base/UploadMultiple';
import { arrMimeType } from '~/constants/basic';
import { faPaperPlane} from '@fortawesome/free-solid-svg-icons';
import { checkAssistantManagerHigher, checkManager, checkPermission, historyParams, historyReplace, showNotify } from '~/services/helper';
import DeleteButton from '~/components/Base/DeleteButton';
import Dropdown from '~/components/Base/Dropdown';
import { getURLHR , getThumbnailHR ,timeFormatStandard, exportToXLS } from '~/services/helper';
import { getHeader, formatData } from './config/FeedbackExport';
import { typeFeedbacks, statusFeedbacks } from './config/feedbackConfig'

const MEDIA_URL_WP = 'https://wshr.hasaki.vn/production/workplace/'
// const MEDIA_URL_HR = 'https://wshr.hasaki.vn/production/hr/'
// const MEDIA_URL_HR_THUMBNAIL = 'https://wshr.hasaki.vn/thumbnail/250x170/production/hr/'
const MEDIA_URL_IMG_WP = 'https://work.hasaki.vn/workplace/'
const MEDIA_URL_IMG_WP_THUMBNAIL = 'https://work.hasaki.vn/workplace/thumbnail/250x170/'
//https://wshr.hasaki.vn/production/hr/
//https://wshr.hasaki.vn/thumbnail/
// const typeFeedbacks = { 1: 'Phản hồi lỗi', 2: 'Phản hồi đóng góp', 3: 'Phản hồi tính năng' }
const colorStatus = {0 : 'rgb(32, 170, 234)', 1 : '#a5e9a5' , 2 : '#ec8d8a'}
class FeedBacksStaff extends Component {
  constructor(props) {
    super(props)
    this.formSearchRef = React.createRef()
    this.formRef = React.createRef()
    this.uploadRef = null;
    let params = historyParams();
    let page = 1;
    let limit = params.limit ? params.limit : 35;
    if (params.offset) {
      page = params.offset / limit + 1;
    }
    this.state = {
      loading: false,
      content: '',
      fileList: [],
      historyFileList: [],
      removeFileList: [],
      // dataFeedBacks: [],
      limit,
      total: 0,
      type: 1,
      datas: [],
      visibleReply: false,
      page,
      datasComment: [],
      object_id : '',
      limitComment : 5,
      totalComment: 0,
      loadingModal : false,
      typeFeedbacks : [],
      subTypeFeedback : [],
      data: {},
      listSubType : [],
    }
  }
  componentDidMount() {
    // let params = {
    //   date :  [dayjs(params.from_date, dateFormat), dayjs(params.to_date, dateFormat)];
    // }
    let params = historyParams();
    this.formSearchRef.current.setFieldsValue(params);
    let values = this.formSearchRef.current.getFieldsValue();
    this.getListFeedbacks(values)
    this.getListType()
  }
  async getListType () {
    let response = await apiListType()
    let resultSub = []
    if(response.status){
      let datas = response.data
      if(datas.length){
        datas.map(d => {
          d.subtitle.map(s => {
            resultSub.push(s)
          })
        })
      }
      this.setState({typeFeedbacks : datas , subTypeFeedback : resultSub})
    } else {
      console.log(response.message)
    }
  }
  async getListFeedbacks(params = {}) {
    let { t, auth: { profile } } = this.props;
    this.setState({ loading: true })
    let values =  {
      ...params , 
      limit: this.state.limit,
      offset: this.state.limit * (this.state.page - 1)
    }
    historyReplace(values);
    let response = await getList(values)
    if (response.status) {
      this.setState({ loading: false, datas: response.data.rows, total: response.data.total })
    } else {
      console.log(response.message)
    }
  }

  renderMediaFeedback(filesFeedbacks) {
    let files = [];
    let imgVideos = [];
    if (filesFeedbacks?.files?.length) {
      (filesFeedbacks?.files).map(n => {
        if (n.type == 1 || n.type == 3) {
          imgVideos.push(n)
        } else {
          files.push(n);
        }
      })
    }
    return <div>
      {files.map((file, index) => {
        const original = file.url?.substr(file.url.length - 4);
        return (<div
          key={uniqueId(index)}
          className='position-relative d-flex justify-content-start align-items-center'
          style={{ backgroundColor: '#F5F5F5', borderRadius: 10, padding: 20, marginTop: 5 , marginBottom:2 }}
        >
          {
            original == '.pdf' ?
              <a href={getURLHR(file.url)} target='_blank' rel='noopener noreferrer'>
                <FontAwesomeIcon icon={faFilePdf} style={{ fontSize: 25 }} />
                <span className='text-muted ml-3'>{file?.url?.split('/').pop()}</span>
              </a>
              :
              <a
                href={getURLHR(file.url)}
              >
                <FontAwesomeIcon icon={faFile} style={{ fontSize: 25 }} />
                <span className='text-muted ml-3'>{file?.url?.split('/').pop()}</span>
              </a>
          }
        </div>)
      })}

      <div className='d-flex' style={{ flexWrap: 'wrap' }}>
        {imgVideos.map((file, index) => {
          if (file.type == 1) {
            return (
              <div className='comment-item ml-1 mb-1' key={uniqueId(index)} >
                {/* <Image style={{ objectFit: 'cover' }} src={MEDIA_URL_THUMBNAIL + file.url} width={200} height={150}
                    preview={{ src: MEDIA_URL_HR + file.url }}
                  /> */}
                <Image style={{ objectFit: 'cover' }} src={getThumbnailHR(file.url,'240x360')} width={150} height={100}
                  preview={{ src: getURLHR(file.url) }}
                />
              </div>
            )
          }
          else {
            return (
              <div className='comment-item video ml-1 mb-1' key={uniqueId(index)}>
                <video controls style={{ backgroundColor: 'black' }} src={getURLHR(file.url)} width={150} height={100} />
              </div>
            )
          }
        })}
      </div>
    </div>
    // return <div>abc</div>
  }
  async getListComment(loadMore = false, offset = 0, limit = 5){
    let params = {
      object_id: this.state.object_id,
      object_type: 6,
      limit: limit,
      offset: offset
    }
    let xhr = apiListComment(params)
    xhr.then(res => {
      if (res.status) {
        let rows = res.data.rows
        this.setState(state => ({
          datasComment: loadMore ? state.datasComment.concat(rows) : rows,
          totalComment: res.data.total,
          loadingModal : false
        }))

      } else {
        console.log(res.message)
      }
    })

  }
  popupReply(value) {
    let findType = this.state.typeFeedbacks.find(t => t.id == value.type)
    this.setState({ visibleReply: true , object_id : value.id ,loadingModal : true , listSubType : findType ?  findType.subtitle : []} ,
      () => {
        this.formRef.current.setFieldsValue({type : value.type , subtype : value.subtype })
        this.getListComment(value)
    })
   
  }
  onChangePage = page => {
    this.setState({ page }, () => {
      let values = this.formSearchRef.current.getFieldsValue();
      this.getListFeedbacks(values)
      window.scrollTo(0, 0)
    })
  }
  deleteFeedback(e,id){
    e.stopPropagation();
    let { t } = this.props;
    let xhr = apiDeleteFeedback(id);
    xhr.then((response) => {
      if (response.status) {
        showNotify(t('Notification'), t('hr:delete_complete'));
        this.getListFeedbacks();
      }
    });

  }
  deleteReply(id){
    let { t } = this.props;
    let xhr = apiDeleteReply(id);
    xhr.then((response) => {
      if (response.status && response.data) {
        this.setState(state => {
          let datasCommentCoppy = this.state.datasComment.slice();
          let indexComment = datasCommentCoppy.findIndex(n => n.id == id);
          if (datasCommentCoppy[indexComment]) {
            datasCommentCoppy.splice(indexComment, 1)
          }
          this.setState({ datasComment: datasCommentCoppy, totalComment: (this.state.totalComment - 1) })
        })
        showNotify(t('Notification'), t('hr:delete_complete'));
      }else{
        showNotify('Notification', response.message, t('error'))
      }
    });

  }
  /**
     * Render media comment
     */
  renderMediaComment = (filesComment) => {
    const { dataComment } = this.state;
    let files = [];
    let imgVideos = [];
    if (filesComment?.files?.length) {
      (filesComment?.files).map(n => {
        if (n.type == 1 || n.type == 3) {
          imgVideos.push(n)
        } else {
          files.push(n);
        }
      })
    }
    return <div>
      {files.map((file, index) => {
        const original = file.url.substr(file.url.length - 4);
        return (<div
          key={file.id}
          className='position-relative d-flex justify-content-start align-items-center'
          style={{ backgroundColor: '#F5F5F5', borderRadius: 10, padding: 20, marginTop: 5 }}
        >
          {
            original == '.pdf' ?
              <a href={`${MEDIA_URL_IMG_WP}/${file.url}`} target='_blank' rel='noopener noreferrer'>
                <FontAwesomeIcon icon={faFilePdf} style={{ fontSize: 25 }} />
                <span className='text-muted ml-3'>{file?.url?.split('/').pop()}</span>
              </a>
              :
              <a
                href={`${MEDIA_URL_IMG_WP}/${file.url}`}
              >
                <FontAwesomeIcon icon={faFile} style={{ fontSize: 25 }} />
                <span className='text-muted ml-3'>{file?.url?.split('/').pop()}</span>
              </a>
          }
        </div>)
      })}

      <div className='d-flex' style={{ flexWrap: 'wrap' }}>
        {imgVideos.map((file, index) => {
          if (file.type == 1) {
            return (
              <div className='comment-item ml-1 mb-1' key={file.id} >
                <Image style={{ objectFit: 'cover' }} src={MEDIA_URL_IMG_WP_THUMBNAIL + file.url} width={200} height={130}
                  preview={{ src: MEDIA_URL_IMG_WP + file.url }}
                />
              </div>
            )
          }
          else {
            return (
              <div className='comment-item video ml-1 mb-1' key={file.id}>
                <video controls style={{ backgroundColor: 'black' }} src={MEDIA_URL_WP + file.url} width={200} height={130} />
              </div>
            )
          }
        })}
      </div>
    </div>
  }
  renderComments(comments) {
    let result = []
    const {t} =  this.props
    const styleMenuEditPostItem = { boxShadow: '0.9px 1.8px 10px 0 rgba(0, 0, 0, 0.32)', borderRadius: '10px' }
    const menu = (comment) => {
      return <Menu style={styleMenuEditPostItem}>
      <Menu.Item key="0" className="item_edit_comment">
        <Button type='link'
          onClick={() => Modal.confirm({
            title: <span className='p-3'>{t('confirm')}</span>,
            icon: <ExclamationCircleOutlined className='pl-3 pt-3' />,
            content: <span className='p-3'>{t('hr:delete_feedback')}</span>,
            onOk: () => { this.deleteReply(comment.id) }
          })
          }
          className='text-muted'
          icon={<DeleteOutlined />}
          size='small'
        >
          <span style={{ fontSize: 13 }}>{t('hr:delete')}</span>
        </Button>
      </Menu.Item>
    </Menu>
    }
    comments.map((v, i) => {
      result.push(
        <div className='mt-2 d-flex justify-content-start' key={i}>
          <div className='d-flex justify-content-start mt-2'>
            <div className='comment-avatar' >
              <Avatar size={48} src={getURLHR(v.avatar)} key={i} />
            </div>
            <div className='comment-body pl-2'>
              <div className='comment-content'>
                <div style={{ backgroundColor: '#F5F5F5', borderRadius: 10, padding: '5px 10px', marginTop: 5 }}>
                  <div><strong className=''>{v.staff_name}</strong></div>
                  <span>{v.content}</span>
                </div>
                <div className='comment-img'>
                  {this.renderMediaComment(v)}
                </div>
                <div className='comment-action d-flex justify-content-between align-items-center'>
                  <span style={{ color: '#777777', fontWeight: 'bold', fontSize: 12 }}>
                    {/* <DateFromNow date={v.updated_at}/> */}
                    {dayjs(v.updated_at).format('DD/MM/YYYY')}
                  </span>
                </div>

              </div>
            </div>
          </div>
          <div className='mt-1 ml-2'>
            <DropdownAntd menu={menu(v)}>
              <EllipsisOutlined className='rounded-circle p-1 mr-1 cursor-pointer' style={{ fontSize: 20 }} />
            </DropdownAntd>
          </div>
        </div>
      )
    })
    return result
  }
  replyFeedbacks(loadMore = true){
    this.setState({loadingModal : true})
    const {t} = this.props
    let {object_id} = this.state
    let note = this.formRef.current.getFieldsValue().note
    let values = this.uploadRef.getValues();
    let formData = new FormData;
    if (values.fileList.length) {
      (values.fileList).map(n => {
        if (n.uid.includes('upload')) {
          formData.append('files[]', n)
        }
      })
    }
    formData.append('object_type', 6);
    formData.append('content', note)
    formData.append('object_id', object_id)
    let xhr = apiReplyFeedbacks(formData)
    xhr.then(res => {
      if (res.status) {
        let { datasComment } = this.state;
        datasComment.unshift(res.data);
    this.formRef.current.resetFields()
    this.uploadRef.resetForm()
        this.setState(state => ({
          loadingModal: false,
          dataComment: loadMore ? datasComment : datasComment,
        }))
        showNotify('Notification', t('hr:feedback_susscess'))
      }else{
        showNotify('Notification', res.message, t('error'))
      }

    })
  }
  onChangeStatus(e , id , value){
    const {t} = this.props
    e.stopPropagation()
    let formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('status',value);
    let xhr = updateStatus(id,formData)
    xhr.then(res=>{
      if(res.status) {
        showNotify('Notify', t('hr:update_susscess'));
        let datasCopy = this.state.datas.slice();
        let indexFound = datasCopy.findIndex(d => d.id == id);
        if(indexFound > -1) {
          datasCopy[indexFound]['status'] = value;
            this.setState({ datas: datasCopy })
        }
    } else {
        showNotify('Notify', res.message,t('error'));
    }
    })
  }
  submitForm(){
    let values = this.formSearchRef.current.getFieldsValue()
    this.setState({page : 1})
    if (values.date) {
      values = {
        ...values,
        from_date: timeFormatStandard(values.date[0], 'YYYY-MM-DD'),
        to_date: timeFormatStandard(values.date[1], 'YYYY-MM-DD')
      }
      delete (values.date);
    }
    window.scrollTo(0, 0)
    this.getListFeedbacks(values)
  }

  /**
   * Export data feedback
   */
  exportFeedback = () => {
    let { t, auth: { profile } } = this.props;
    this.setState({ loading: true });
    let params = this.formSearchRef.current.getFieldsValue();
    let values =  {
      ...params , 
      limit: -1,
      offset: 0
    }
    let xhr = getList(values)
    xhr.then(res => {
      this.setState({ loading: false })
      if (res.status) {
        let header = getHeader();
        let data = formatData(res.data.rows)
        let fileName=`Feedback-${dayjs().format('YYYY-MM-DD')}`;
        let datas=[...header, ...data];

        exportToXLS(fileName, datas, [{width: 100}, {width: 40}, , {width: 40}])
      } else {
        showNotify('Notify', res.message, t('error'))
      }
    })
  }
  updateTypeFeedbacks(){
    const {t} = this.props
    let id = this.state.object_id
    let values = this.formRef.current.getFieldsValue()
    let params = {
      type : values.type ? values.type : '',
    }
    if(values.subtype){
      params.subtype =  values.subtype
    }
    let xhr = updateType(id ,params )
    xhr.then(res => {
      if(res.status){
        let valuesSearch = this.formSearchRef.current.getFieldsValue()
        this.getListFeedbacks(valuesSearch)
        showNotify('Notify', t('hr:update_susscess'));
      }
    })
    xhr.catch(err => console.log(err))
  }

  render() {
    const { t , baseData: { locations , departments } ,auth :{staff_info}} = this.props;
    const columns = [
      {
        title: t('No.'),
        width: '3%',
        render: r => this.state.datas.indexOf(r) + 1
      },
      {
        title: t('dept'),
        width: '10%',
        render: r => {
            let deparment = departments.find(d => r?.created_by_staff?.staff_dept_id == d.id);
            let deptName = deparment ? deparment.name : 'NA';
            return (
                <>
                  <strong>{deptName}</strong>
                </>
            )
        }
      },
      {
        title: t('feedback'),
        width: '30%',
        render: r =><div style={{ whiteSpace: 'pre-line', maxWidth: 400 }}>{r.content}</div>
      },
      {
        title: t('file'),
        width: '30%',
        render: r => this.renderMediaFeedback(r)
      },
      {
        title: t('status'),
        // render: r => <Dropdown value={r.status} onChange={(v) => this.onChangeStatus(v,r.id)} datas={statusFeedbacks} />
        render: r => {
          let items = []
          Object.keys(statusFeedbacks).map((key,index) => {
            let color = colorStatus[key];
            items.push(
              {
                key: (index+1).toString(),
                label:
                    <a onClick={(e) => this.onChangeStatus(e, r.id, key)}>
                      <Badge color={color} text={statusFeedbacks[key]} />
                    </a>
              }
            );
          });
          // const menu = <Menu className="">{statusList}</Menu>;
          const onClickItems = ({ key }) => {
            let value = parseInt(key);
            this.onChangeStatus(value);
          }
          return (<DropdownAntd menu={{ items, onClick: onClickItems }} className="pl-2">
            <Tag className='text-center' color={colorStatus[r.status]} style={{ cursor: 'pointer' }}>
              {statusFeedbacks[r.status]}
            </Tag>
          </DropdownAntd>)
        }
      },
      {
        title : t('hr:process_by'),
        width: '10%',
        render : r => r.processed_by_staff?.id ? <span>{r.processed_by_staff?.name}</span> : []
      },
      {
        title: t('type'),
        width: '10%',
        // render: r => <span>{typeFeedbacks[r.type]}</span>
        render: r => {
          let typeDetail = this.state.typeFeedbacks.filter(t => t.id == r.type)
          return <span>{typeDetail[0]?.title}</span>
        }
      },
      {
        title: t('sub_type'),
        width: '10%',
        render: r => <span>{r.sub_type?.title}</span>
      },
      {
        title: t('created_by'),
        width: '10%',
        render: r => {
              let location = locations.find(l => r?.created_by_staff?.staff_loc_id == l.id);
              let locName = location ? location.name : 'NA';
              return (
                  <div>
                    <small>{dayjs(r.created_at).format('YYYY-MM-DD HH:mm')}</small><br/>
                    <small><strong>{r.create_by && r.type!=6 ? r.create_by.name : ''}</strong></small><br/>
                    <small>{locName}</small>
                  </div>
              )
            }
      },
      {
        title: t('action'),
        width: '5%',
        render: r => <div className='d-flex'>
          <Button type='primary' size='small' onClick={() => this.popupReply(r)} icon={<CommentOutlined />} className='mr-2'></Button>
          {/* {checkManager(staff_info.position_id) ?
            <DeleteButton onConfirm={(e) => this.deleteFeedback(e, r.id)} />
            : []
          } */}
          {
            checkPermission('hr-feedback-delete') ?
              <DeleteButton onConfirm={(e) => this.deleteFeedback(e, r.id)} />
              : ''
          }
        </div>
      },
    ]
    return (
      <div>
        <PageHeader
          className="site-page-header"
          title={t('hr:feedback_staff')}
        />
        <Row className='card p-3 mb-3'>
          {/* <Tab tabs={tabListFeedbacks(checkAssistantManagerHigher(staff_info?.position_id))} /> */}
          <Tab tabs={tabListFeedbacks(this.props)} />
          <Form
            className="pt-3"
            ref={this.formSearchRef}
            name="searchForm"
            onFinish={this.submitForm.bind(this)}
            layout="vertical"
          >
            <Row gutter={[12, 0]}>
              <Col span={4}>
                <Form.Item name="keywords">
                  <Input placeholder={t("hr:keywords")} />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="status" >
                  <Dropdown datas={statusFeedbacks} defaultOption={t('hr:all_status')}/>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="type" >
                  <Dropdown datas={this.state.typeFeedbacks} defaultOption={t('hr:all_type')} />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="subtype" >
                  <Dropdown datas={this.state.subTypeFeedback} defaultOption={t('hr:all_problem')}/>
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name={'location_id'} >
                  <Dropdown datas={locations} defaultOption={t('hr:all_location')} />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="department_id" >
                  <Dropdown datas={departments} defaultOption={t('hr:all_department')} mode="multiple" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name='date'>
                  <DatePicker.RangePicker style={{ width: '100%' }} format={'YYYY-MM-DD'} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Button
                  type="primary"
                  style={{ marginLeft: 8 }}
                  htmlType="submit"
                >
                  {t("search")}
                </Button>
                {
                  checkPermission('hr-feedback-export') ? 
                    <Button
                      type="primary"
                      icon={<FontAwesomeIcon icon={faFileExport} />}
                      onClick={() => this.exportFeedback()}
                      className="ml-2"
                    >
                     {t("export_file")}
                    </Button>
                  : ""
                }
              </Col>
            </Row>
          </Form>
        </Row>
        <Row gutter={[16, 24]}>
          <Col span={24}>
            <Table
              dataSource={this.state.datas}
              columns={columns}
              loading={this.state.loading}
              pagination={{
                pageSize: this.state.limit,
                total: this.state.total,
                onChange: (page) => this.onChangePage(page),
                showSizeChanger: false,
                current: this.state.page,
              }}
              rowKey={(r) => r.id}
            />
          </Col>
        </Row>
        <Modal
          title={t("reply")}
          open={this.state.visibleReply}
          // onOk={() => { }}
          // okText='Reply'
          onCancel={() => this.setState({ visibleReply: false })}
          afterClose={() => this.setState({ datasComment: [], object_id: "" })}
          width={!this.state.datasComment.length ? "60%" : "70%"}
          footer={
            // !this.state.datasComment.length ?
            <Button
              key={uniqueId("back")}
              onClick={() => this.setState({ visibleReply: false })}
            >
             {t('hr:close')}
            </Button>
            // :
            // [
            //   <Button key={uniqueId('back')} onClick={() => this.setState({ visibleReply: false })}>
            //     Close
            //   </Button>,
            //   <Button key={uniqueId('reply')} type="primary" onClick={() => this.setState({ visibleReply: false })}>
            //     Reply
            //   </Button>
            // ]
          }
        >
          <div
            className="mb-2 block_write_comment"
            style={{ width: "100%", position: "relative", zIndex: 10 }}
          >
            <Form preserve={false} ref={this.formRef}>
              <Row gutter={24}>
                <Col span={6}>
                  <span className='mb-2'>{t('type')} : </span>
                  <Form.Item name="type">
                    <Dropdown datas={this.state.typeFeedbacks} 
                    defaultOption={t('all_type')}
                      onChange={v => {
                        let findType = this.state.typeFeedbacks.find(s => s.id == v)
                        this.setState({ listSubType: findType ? findType.subtitle : [] })
                        this.formRef.current.setFieldsValue({ subtype: null })
                    }}
                    disabled={checkManager(staff_info.position_id) ? false : true}
                     />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <span className='mb-2'>{t('sub_type')}: </span>
                  <Row>
                    <Col span={12}>
                      <Form.Item name="subtype">
                        <Dropdown datas={this.state.listSubType}
                          defaultOption={('hr:all_problem')}
                          disabled={checkManager(staff_info.position_id) ? false : true}
                        />
                      </Form.Item>
                    </Col>
                    {
                      checkManager(staff_info.position_id) ?
                        <Col span={12}>
                          <Button type='primary' className='ml-3' onClick={() => this.updateTypeFeedbacks()}>{t('hr:update_type')}</Button>
                        </Col>
                        : []
                    }
                  </Row>
                </Col>
              </Row>
              <Form.Item name="note">
                <Input.TextArea
                  placeholder={t('hr:reply_comment')}
                  ref={(v) => {
                    this.inputRef = v;
                  }}
                  autoSize={{ minRows: 5 }}
                />
              </Form.Item>
            </Form>
            {/* <span className='align-items-end' style={{ position: 'absolute', bottom: 5, right: 14, fontSize: 20, zIndex: 5 }}>
                <PaperClipOutlined style={{ color: '#666' }} onClick={() => this.uploadRef.onClick()} />
              </span> */}
          </div>
          <Spin spinning={this.state.loadingModal}>
            <div className="mt-1">
              <Button
                type="primary"
                icon={<FontAwesomeIcon icon={faPaperPlane} />}
                onClick={() => this.replyFeedbacks()}
              >
                {t('hr:send')}
              </Button>
              <UploadMultiple
                type={arrMimeType}
                size={100}
                onRef={(ref) => {
                  this.uploadRef = ref;
                }}
              />
            </div>
            {!this.state.datasComment.length ? (
              <div className="d-flex justify-content-center mt-2">
                <span style={{ fontSize: 20 }}>
                 {t('hr:no_data')}
                </span>
              </div>
            ) : (
              this.renderComments(this.state.datasComment)
            )}
            <div className="ml-2">
              {this.state.totalComment > this.state.datasComment?.length ? (
                <Button
                  key={uniqueId("__btn_load_more")}
                  type="text"
                  className="mt-2 pl-1 text-muted"
                  onClick={() =>
                    this.getListComment(true, this.state.datasComment.length)
                  }
                >
                  {t('hr:view_more')}{" "}
                  {this.state.totalComment - this.state.datasComment.length}{" "}
                  {t('hr:comment')}
                </Button>
              ) : (
                ""
              )}
            </div>
          </Spin>
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

export default connect(mapStateToProps, null)(withTranslation()(FeedBacksStaff));
