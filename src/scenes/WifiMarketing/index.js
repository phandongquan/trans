import { Button, Col, Form, Image, Modal, Row, Table, DatePicker, TimePicker } from 'antd'
import { PageHeader } from '@ant-design/pro-layout';
import Dragger from 'antd/lib/upload/Dragger'
import axios from 'axios'
import dayjs from 'dayjs'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { mineTypeImage } from '~/constants/basic'
import { checkPermission, convertToFormData, showNotify } from '~/services/helper'
import { InboxOutlined } from '@ant-design/icons';
import './config/wifimarketing.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faPen, faClock } from '@fortawesome/free-solid-svg-icons'
import Dropdown from '~/components/Base/Dropdown'
const typeStatus = { 0 : 'Không hoạt động' , 1 : 'Hoạt động'}
const { RangePicker } = DatePicker;

export class WifiMarketing extends Component {
  constructor (props) {
    super(props)
    this.state = { 
      datas : [],
      data : {}, 
      token : '',
      loadingModal : false,
      loading : false,
      datasCount : [] ,
      visible : false ,
      visible2 : false ,
      image_1 : [],
      imageUrl_1 : null,
      image_2 : [],
      imageUrl_2 : null ,
      image_3: [],
      imageUrl_3: null,
      image_4: [],
      imageUrl_4: null,
      dataLocations : [],
      defaultStartDate: dayjs(),
    }
    this.formUploadRef = React.createRef()
    this.formUploadImageSchedule = React.createRef()
    // this.formUploadAllRef = React.createRef()
  }
  componentDidMount(){
    this.getToken()
    this.interval = setInterval(() => {
     axios.get('https://wifi-marketing.app.rdhasaki.com/count')
      .then(resCount => {
        if (resCount.data.status) {
          this.setState({ datasCount: resCount.data.data})
        } else {
          showNotify('Notifications', resCount.data.message, 'error')
        }
      })
      .catch(err => {
        console.log(err)
      })
    }, 30000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }
  async getToken() {
    await axios.get(`https://wifi-marketing.app.rdhasaki.com/auth/all`)
      .then(res => {
        this.setState({ token: res.data.KEY}, () => this.getListWifi())
      })
      .catch(err => {
        console.log(err)
      })
  }
  getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  }


  async getListWifi() {
    let { baseData: { locations } } = this.props
    this.setState({ loading: true })
    await axios.get('https://wifi-marketing.app.rdhasaki.com/ftp', { headers: { "Authorization": `Bearer ${this.state.token}` } })
      .then(res => {
        if (res.data.status) {
          let arrDataLoc = []
          let datas = res.data.data
          datas.map(d => {
            let locFind = locations.find(l => {
              if (l.ip && l.ip.length) {
                let arrIP = l.ip
                if (arrIP.includes(d.location)) {
                  return l
                } else {
                  return
                }
              }
            })
            arrDataLoc.push({
              id: d.location,
              name: locFind?.name
            })
          })
          this.setState({ datas, loading: false, dataLocations: arrDataLoc })
        } else {
          showNotify('Notifications', res.data.message, 'error')
        }
      })
      .catch(err => {
        console.log(err)
      })
    await axios.get('https://wifi-marketing.app.rdhasaki.com/count')
      .then(resCount => {
        if (resCount.data.status) {
          this.setState({ datasCount: resCount.data.data})
        } else {
          showNotify('Notifications', resCount.data.message, 'error')
        }
      })
      .catch(err => {
        console.log(err)
      })
  }
  openModalUpload(data) {
    this.setState({ visible: true, data , imageUrl_1 : data.img[0] , imageUrl_2 : data.img[1]} ,
     () => this.formUploadRef.current.setFieldsValue({ftp_host : data.location}))
  }
  openModalUpload2(data) {
    this.setState({ visible2: true, data },
      () => this.formUploadImageSchedule.current.setFieldsValue({ ftp_host: data.location }))
  }
  /**
 * Check size of file
 * @param {*} file 
 */
  checkSize(file) {
    return file.size / 1024 / 1024 < 1 ? true : false;
  }
  submitUploadImage() {
    let self = this
    this.setState({loadingModal : true})
    let valuesUpload = this.formUploadRef.current.getFieldsValue()
    let formData = convertToFormData(valuesUpload);
    if (this.state.image_1.length) {
      formData.append('image1', this.state.image_1[0])
    }
    if (this.state.image_2.length) {
      formData.append('image2', this.state.image_2[0])
    }
    if (Object.keys(this.state.data).length == 0) {
      axios({
        method: "POST",
        url: "https://wifi-marketing.app.rdhasaki.com/update_all_location",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" , "Authorization": `Bearer ${this.state.token}`} ,
      })
        .then(function (response) {
          console.log(response)
          if(response.data.status){
            self.setState({loadingModal : false , visible : false})
            showNotify('Notification' , response.data.message )
          }else{
            showNotify('Notification' , response.data.message , 'error')
            self.setState({loadingModal : false})
            self.getListWifi()
          }
        })
        .catch(function (response) {
          //handle error
          console.log(response);
        });
    } else {
      axios({
        method: "POST",
        url: "https://wifi-marketing.app.rdhasaki.com/update_multi_location",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" , "Authorization": `Bearer ${this.state.token}`},
      })
        .then(function (response) {
          if(response.data.status){
            self.setState({loadingModal : false , visible : false})
            showNotify('Notification' , response.data.message )
            self.getListWifi()
          }else{
            showNotify('Notification' , response.data.message , 'error')
            self.setState({loadingModal : false})
          }
        })
        .catch(function (response) {
          //handle error
          console.log(response);
        });
    }
  }
  submitUploadImageSchedule() {
    let valuesUpload = this.formUploadImageSchedule.current.getFieldsValue();
    let body = {};
    if (valuesUpload.day && valuesUpload.time) {
      this.setState({ loadingModal: true })
      // init body request
      body['ftp_host'] = valuesUpload.ftp_host;
      body['datetime_start'] = valuesUpload.day[0].format('YYYY-MM-DD');
      body['datetime_end'] = valuesUpload.day[1].format('YYYY-MM-DD');
      body['time_start'] = valuesUpload.time[0].format('HH:mm');
      body['time_end'] = valuesUpload.time[1].format('HH:mm');
      if(!this.state.image_3.length || !this.state.image_4.length){
        showNotify('Notification', 'Vui lòng chọn 2 hình ảnh', 'error');
        this.setState({ loadingModal: false })
        return;
      }else{
        if (this.state.image_3.length) {
          body['image1'] = this.state.image_3[0];
        }
        if (this.state.image_4.length) {
          body['image2'] = this.state.image_4[0];
        }
      }
      let formData = convertToFormData(body);
      try {
        axios({
          method: "POST",
          url: "https://wifi-marketing.app.rdhasaki.com/schedule_multi",
          data: formData,
          headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${this.state.token}` },
        })
          .then((response) => {
            console.log(response);
            if (response.data.status) {
              showNotify('Notification', 'Thiết lập thành công');
              this.setState({ loadingModal: false, visible2: false }); // Use arrow function for 'this'
            } else {
              showNotify('Notification', 'Thiết lập thất bại', 'error');
              this.setState({ loadingModal: false });
            }
          })
          .catch(function (response) {
            //handle error
            console.log(response);
          });
      } catch (err) {
        console.log(err);
      }
    }else{
      this.setState({ loadingModal: false })
      showNotify('Notification', 'Vui lòng chọn ngày và giờ', 'error');
    }
  }
  render() {
    const { t ,baseData: { locations }} = this.props;
    let { imageUrl_1, image_1, imageUrl_2, image_2, imageUrl_3, image_3, imageUrl_4, image_4 } = this.state
    const columns = [
      {
        title: 'No.',
        render: r => this.state.datas.indexOf(r) + 1,
        width: '5%'
      },
      {
        title: t('image'),
        render: r => {
          let result = []
          let arrImg = r.img
          let arrScheduleImg = r.img_schedule
          if (arrImg?.length > 0) {
            arrImg.forEach((img, index) => {
              result.push(
                <Image className='mr-2' style={{ width: 100, height: 120 }} key={index} src={img + "?timestamp=" + new Date().getTime()} />
              );
            });
          }

          if (arrScheduleImg?.length > 0) {
            arrScheduleImg.forEach((img, index) => {
              result.push(
                <Image className='mr-2' style={{ width: 60, height: 80 }} key={index} src={img + "?timestamp=" + new Date().getTime()} />
              );
            });
          }
          return <div>
            {result}
          </div>
        }

      },
      {
        title: t('location'),
        render: r => {
          let locFind = locations.find(l => {
            if (l.ip && l.ip.length) {
              let arrIP = l.ip
              if (arrIP.includes(r.location)) {
                return l
              } else {
                return
              }
            }
          })
          return locFind?.name
        }
      },
      {
        title: t('status'),
        render: r => typeStatus[r.status_host]
      },
      {
        title: t('person_using'),
        render: r => {
          let IPFind = this.state.datasCount.find(d => d.location == r.location)
          return IPFind ? IPFind['person_using'] : ''
        },
      },
      {
        title: t('update_at'),
        render: r => dayjs(r.updated_at).format('YYYY-MM-DD HH:mm:ss'),
        width : '15%'
      },
      {
        title: t('action'),
        render: r => 
        {
          return (
            <div style={{display: 'flex',gap:'10px'}}>
              {checkPermission('hr-tool-wifi-marketing-update') && (
                <Button
                  type="primary"
                  size='small'
                  onClick={() => this.openModalUpload(r)}
                  icon={<FontAwesomeIcon icon={faPen} />}
                >
                </Button>
              )}
              {/* Add another button conditionally */}
             
                <Button
                  type="primary"
                  size='small'
                  onClick={() => this.openModalUpload2(r)}
                  icon={<FontAwesomeIcon icon={faClock} />}
                >
                </Button>
            </div>
          );
        }

      }
      
  ]
    return (
      <div>
        <PageHeader title={t('Wifi marketing')} 
        extra={
          // checkPermission('hr-tool-wifi-marketing-upload') ? 
        <Button onClick={() => this.setState({visible : true})} type='primary'>{t('upload_all_images')}</Button>
        // : ""
      }
        />
        <Table dataSource={this.state.datas}
          columns={columns}
          rowKey={'location'}
          pagination={false}
        />
        <Modal 
          confirmLoading={this.state.loadingModal}
          open={this.state.visible}
          title={t('update_images')}
          width={'70%'}
          onCancel={() => this.setState({ visible: false , image_1: [], imageUrl_1: null , image_2: [], imageUrl_2: null , data : {}})}
          onOk={() => this.submitUploadImage()}
        >
          <Form
            ref={this.formUploadRef}
            name="uploadForm"
            layout="vertical" autoComplete="off">
            {
              Object.keys(this.state.data).length != 0 ?
                <Row gutter={[24,0]}>
                  <Col span={4}>
                    <Form.Item name={'ftp_host'} label={<span className='title-upload'>{t('location')}</span>}>
                      <Dropdown datas= {this.state.dataLocations} disabled/>
                    </Form.Item>
                  </Col>
                </Row>
                : []
            }
            <Row gutter={[24, 0]}>
              <Col span={12}>
                <div>
                  <span className='title-upload'>{t('image')} 1</span>
                  <Dragger
                    className='mt-2'
                    fileList={image_1}
                    accept={mineTypeImage}
                    onRemove={() => this.setState({ image_1: [], imageUrl_1: null })}
                    listType='picture'
                    beforeUpload={(file, fileList) => {
                      if (!this.checkSize(file)) {
                        showNotify('Notification', "Image must smaller than 1 MB", 'error');
                        return false;
                      } else {
                        this.getBase64(file, imageUrl =>
                          this.setState({
                            imageUrl_1: imageUrl,
                            image_1: [file]
                          }),
                        );
                        // this.setState({ file: [file] })
                      }
                      return false
                    }}
                  >
                    {
                      imageUrl_1 ?
                        <img src={imageUrl_1} alt="Thumbnail" style={{ width: "220px", height: '250px' }} />
                        :
                        <>
                          <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                          </p>
                          <p className="ant-upload-text">{t('drap_drop_upload_image')}</p>
                          <p className="ant-upload-hint">{t('max_image_upload_support')}</p>
                        </>
                    }
                  </Dragger>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <span className='title-upload'>{t('image')} 2</span>
                  <Dragger
                    className='mt-2'
                    fileList={image_2}
                    accept={mineTypeImage}
                    onRemove={() => this.setState({ image_2: [], imageUrl_2: null })}
                    listType='picture'
                    beforeUpload={(file, fileList) => {
                      if (!this.checkSize(file)) {
                        showNotify('Notification', "Image must smaller than 1 MB", 'error');
                        return false;
                      } else {
                        this.getBase64(file, imageUrl =>
                          this.setState({
                            imageUrl_2: imageUrl,
                            image_2: [file]
                          }),
                        );
                        // this.setState({ file: [file] })
                      }
                      return false
                    }}
                  >
                    {
                      imageUrl_2 ?
                        <img src={imageUrl_2} alt="Thumbnail" style={{ width: "220px", height: '250px' }} />
                        :
                        <>
                          <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                          </p>
                          <p className="ant-upload-text">{t('drap_drop_upload_image')}</p>
                          <p className="ant-upload-hint">{t('max_image_upload_support')}</p>
                        </>
                    }
                  </Dragger>
                </div>
              </Col>
            </Row>
          </Form>
        </Modal>
        {/* Modal Schedule */}
        <Modal
          confirmLoading={this.state.loadingModal}
          open={this.state.visible2}
          title={t('image_schedule')}
          width={'70%'}
          onCancel={() => this.setState({ visible2: false, image_3: [], imageUrl_3: null, image_4: [], imageUrl_4: null, data: {} })}
          onOk={() => this.submitUploadImageSchedule()}
        >
          <Form
            ref={this.formUploadImageSchedule}
            name="uploadForm"
            layout="vertical" autoComplete="off">
          
              <Row gutter={[24, 0]} 
              style={{ marginTop: '15px'}}>
              {
                Object.keys(this.state.data).length != 0 ?
                  <Col span={4}>
                    <Form.Item name={'ftp_host'}>
                      <Dropdown datas={this.state.dataLocations} disabled />
                    </Form.Item>
                  </Col>
                  : []
              }
                <Col span={4}>
                <Form.Item name="day">
                  <RangePicker
                    defaultValue={[this.state.defaultStartDate, null]}
                 />
                </Form.Item>
                </Col>
                <Col span={4}>
                <Form.Item name="time">
                  <TimePicker.RangePicker />
                </Form.Item>
                </Col>
              </Row>
          
            <Row style={{marginTop: '15px'}} gutter={[24, 0]}>
              <Col span={12}>
                <div>
                  <span className='title-upload'>{t('image')} 1</span>
                  <Dragger
                    className='mt-2'
                    fileList={image_3}
                    accept={mineTypeImage}
                    onRemove={() => this.setState({ image_3: [], imageUrl_3: null })}
                    listType='picture'
                    beforeUpload={(file, fileList) => {
                      if (!this.checkSize(file)) {
                        showNotify('Notification', "Image must smaller than 1 MB", 'error');
                        return false;
                      } else {
                        this.getBase64(file, imageUrl =>
                          this.setState({
                            imageUrl_3: imageUrl,
                            image_3: [file]
                          }),
                        );
                        // this.setState({ file: [file] })
                      }
                      return false
                    }}
                  >
                    {
                      imageUrl_3 ?
                        <img src={imageUrl_3} alt="Thumbnail" style={{ width: "220px", height: '250px' }} />
                        :
                        <>
                          <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                          </p>
                          <p className="ant-upload-text">{t('drap_drop_upload_image')}</p>
                          <p className="ant-upload-hint">{t('max_image_upload_support')}</p>
                        </>
                    }
                  </Dragger>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <span className='title-upload'>{t('image')} 2</span>
                  <Dragger
                    className='mt-2'
                    fileList={image_4}
                    accept={mineTypeImage}
                    onRemove={() => this.setState({ image_4: [], imageUrl_4: null })}
                    listType='picture'
                    beforeUpload={(file, fileList) => {
                      if (!this.checkSize(file)) {
                        showNotify('Notification', "Image must smaller than 1 MB", 'error');
                        return false;
                      } else {
                        this.getBase64(file, imageUrl =>
                          this.setState({
                            imageUrl_4: imageUrl,
                            image_4: [file]
                          }),
                        );
                        // this.setState({ file: [file] })
                      }
                      return false
                    }}
                  >
                    {
                      imageUrl_4 ?
                        <img src={imageUrl_4} alt="Thumbnail" style={{ width: "220px", height: '250px' }} />
                        :
                        <>
                          <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                          </p>
                          <p className="ant-upload-text">{t('drap_drop_upload_image')}</p>
                          <p className="ant-upload-hint">{t('max_image_upload_support')}</p>
                        </>
                    }
                  </Dragger>
                </div>
              </Col>
            </Row>
          </Form>
        </Modal>
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
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(WifiMarketing)