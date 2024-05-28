import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Button, Table, Row, Col, Form, Modal, Image, Avatar } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tab from '~/components/Base/Tab';
import { showNotify, historyReplace, historyParams, exportToXLS, checkPermission } from '~/services/helper';
import { getList as getListStaff, getViewLog, saveArea, getDetailArea } from '~/apis/company/staff';
import { UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { WorkType } from '~/constants/basic';
import { faEye, faPen, faFileExport } from '@fortawesome/free-solid-svg-icons';
import DropdownLocations from '~/components/Base/DropdownLocations';
import tabList from '~/scenes/Company/config/tabListTask';
import { screenResponsive } from '~/constants/basic';
import StaffDropdown from '~/components/Base/StaffDropdown';
import DropdownCustom from '~/components/Base/Dropdown';
import dayjs from 'dayjs';
import {formatHeaderReport, formatDataAreaManagement} from 'src/scenes/Company/Staff/config/exportAreaManagement'
import { save } from '~/apis/company/workflowConfig';
import { withTranslation } from 'react-i18next';

export class StaffManagement extends Component {
  constructor(props) {
    super(props)
    this.formRef = React.createRef();
    this.formEditRef = React.createRef();
    let params = historyParams();
    this.state = {
      loading: false,
      visible: false,
      datas: [],
      data: {},
      staffList: [],
      dataStaff: {},
      limit: 20,
      page: params.page ? Number(params.page) : 1,
      total: 0,
      visibleViewLog : false ,
      datasViewLog : []
    }
  }
  /**
       * @lifecycle 
       */
  componentDidMount() {
    let params = historyParams();
    this.formRef.current.setFieldsValue(params);
    // let values = this.formRef.current.getFieldsValue();
    this.getStaff();
    // this.getStaff(values);
    // this.getReportStaff()
  }
  /**
      * Get list staff
      * 
      * 
      * 
      * @param {} params 
      */
  async getStaff(params = {}) {
    this.setState({ loading: true });
    params = {
      ...params,
      major_id: ['74'], //quản lý khu vực,
      status: 1, //còn làm việc
      page: this.state.page,
      limit: this.state.limit,
    }
    historyReplace(params);
    let response = await getListStaff(params);

    if (response.status) {
      let { data } = response;
      // Format rows to array object
      let listData = [];
      if (data.rows) {
        Object.keys(data.rows).map(id => {
          listData.push(data.rows[id]);
        })
      }
      // let listDataResult = []
      // listData.map(d => {

      // })
      this.setState({
        staffList: listData,
        loading: false,
        total: data.total
      });
    }
  }

  /**
  * Submit form
  * @param {*} values 
  */
  submitForm = values => {
    let { dataStaff } = this.state
    saveArea(values, dataStaff.staff_id).then(res => {
      if (res.status) {
        this.getStaff()
        this.setState({ visible: false })
        showNotify('Notification', res.message)
      }
    }).catch(err => console.log(err))
  }

   submitFormFile = (e) => {
    this.setState({ page: 1 }, () => {
      let values = this.formRef.current.getFieldsValue();
      this.getStaff({ ...values });
    });
   }

  /**
   * Handle submit form
   */
  handleSubmitForm = () => {
    this.formEditRef.current.validateFields()
      .then((values) => {
        this.submitForm(values);
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  }

  async viewLog(data){
    let params = {
      id : data.manage_location?.id,
      type : 'StaffManagementLocation'
    }
    let response = await getViewLog(params)
    if(response){
      this.setState({ visibleViewLog: true , datasViewLog : response.data?.length ? response.data : []})
    }else{
      showNotify('Notification', response.message , 'error')
    }
  }

  renderViewLog(){
    let {datasViewLog} = this.state
    let {t, baseData : {locations}} = this.props
    let result = []
    if(datasViewLog.length){
      datasViewLog.map(d => {
        let currentLocations = d?.properties?.attributes?.locations?.length ? d.properties?.attributes?.locations : []
        let oldLocations = d?.properties?.old?.locations?.length ? d?.properties?.old?.locations : []
        // (locations.find(loc => loc.id == oldL)?.name) 
        result.push(
          <div className='mb-2'>
            {d.created_at} by {d?.user?.name} :
            <br/>
            {
              <span>
                {t('hr:old_location')}: {oldLocations.map((oldID , indexOld) => 
                <span>
                  {indexOld ? ',' : ''} {locations.find(loc => loc.id == oldID)?.name}
                </span>)}
              </span>
            }
            <br/>
            {
              <span>
               {t('hr:current_location')} : {currentLocations.map((currentID , indexCurrent) => 
                <span>
                  {indexCurrent ? ',' : ''} {locations.find(loc => loc.id == currentID)?.name}
                </span>)}
              </span>
            }
          </div>
        )
      })
    }
    return result
  }

   /**
   *
   * export area management
   */
   async exportAreaManagement() {
    this.setState({ loading: true });
    let { baseData } = this.props;
    let values = this.formRef.current.getFieldsValue();
    let params = {
      ...values,
    };
    let response = await getDetailArea(params);
    if (response.status) {
      let header = formatHeaderReport();
      let data = formatDataAreaManagement(response.data.rows);
      let fileName = `Staff Area Management ${dayjs().format("YYYY-MM-DD")}`;
      // let dataFormat = [...header, ...data];
      let dataFormat = [...header, ...data.reverse()];
      exportToXLS(fileName, dataFormat, [
        { width: 20},
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 40 },
        { width: 100 },
      ]);
    }
    this.setState({ loading: false });
  }

  render() {
    let { t, baseData: { locations, departments, divisions, positions, majors, pendingSkills, cities }, auth: { staff_info } } = this.props;
    const columns = [
      {
        title: t('avatar'),
        align: 'center',
        render: r => {
          if (r.user && r.user.avatar) {
            return <Image className='staff_image' width={64} height={64} preview={true} src={r.user.avatar.replace('https://media.inshasaki.com/', 'https://wshr.hasaki.vn/')} />
          } else {
            return <Avatar size={64} icon={<UserOutlined />} />
          }
        }
      },
      {
        title: t('staff_name'),
        render: r => (
          <div>
            <Link to={`/company/staff/${r.staff_id}/edit`}>{r.staff_name}</Link> #<strong>{r.code}</strong><br />
            <small>{r.staff_phone ? `${r.staff_email} - ${r.staff_phone}` : ''}</small><br />
            <small>CMND: {r.cmnd}</small><br />
            <small>{r.temporary_residence_address ? ` ${r.temporary_residence_address}` : ''}</small>
          </div>
        )
      },
      {
        title: t('position') + (' / ') + t('major')+ (' / ') + t('work_type'),
        render: r => (
          <div>
            {positions.map(m => m.id == r.position_id && m.name)}  / <br />
            {majors.map(m => m.id == r.major_id && m.name)} / <br />
            {WorkType[r.work_type]}
          </div>
        )
      },
      {
        title: t('dept')+ (' / ') + t('hr:section')+ (' / ') + t('location'),
        render: r => {
          let deparment = departments.find(d => r.staff_dept_id == d.id);
          let deptName = deparment ? deparment.name : 'NA';
          let division = divisions.find(d => r.division_id == d.id)
          let divName = division ? division.name : 'NA';
          let location = locations.find(l => r.staff_loc_id == l.id)
          let locName = location ? location.name : 'NA';
          return (
            <>
              <strong>{deptName}</strong> / <br />
              {divName} / <br />
              {locName}
            </>
          )
        }
      },
      {
        title: t('Management Area'),
        render: r => {
          let result = [];
          if (r?.manage_location?.locations) {
            (r.manage_location.locations).map(mLocationId => {
              let mLocationData = locations.find(l => mLocationId == l.id);
              if (mLocationData) {
                result.push(<div key={mLocationData.id}>{mLocationData.name}</div>)
              }

            })
          }
          return result
        }
      },
      {
        title: t('action'),
        render: r =><>
        { 
            checkPermission('hr-management-area-update') ?
              <Button
                style={{ marginLeft: 8 }}
                type="primary"
                size='small'
                onClick={() => this.setState({ dataStaff: r, visible: true },
                  () => {
                    let result = []
                    if (r?.manage_location?.locations?.length) {
                      (r.manage_location?.locations).map(mLocationId => result.push(mLocationId))
                    }
                    this.formEditRef.current.setFieldsValue({ locations: result })
                  })}
                icon={<FontAwesomeIcon icon={faPen} />}>
              </Button> : ''
        } 
              <Button className='ml-2' icon={<FontAwesomeIcon icon={faEye} />} type='primary' size='small' onClick={()=> this.viewLog(r)} />
         </>
      }
    ];
    
    return (
      <>
        <PageHeader title={t("hr:management_location")} />
        <Row
          className={
            window.innerWidth < screenResponsive
              ? "card pl-3 pr-3 mb-3 pb-3"
              : "card pl-3 pr-3 mb-3"
          }
        >
          {/* <Tab tabs={tabListStaff} /> */}
          <Tab tabs={tabList(this.props)}></Tab>
          <Form
            ref={this.formRef}
            className="pt-3"
            onFinish={this.submitFormFile.bind(this)}
          >
            <Row gutter={12}>
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <Form.Item name="manage_location_id">
                  <DropdownCustom
                    datas={locations}
                    defaultOption={t("hr:all_manage_area")}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <Form.Item name="ids">
                  <StaffDropdown defaultOption={t("hr:all_staff")} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <Button type="primary" htmlType="submit">
                  {t("search")}
                </Button>
                <Button
                  className="ml-2"
                  type="primary"
                  icon={<FontAwesomeIcon icon={faFileExport} />}
                  onClick={() => this.exportAreaManagement()}
                >
                 {t('export_file')}
                </Button>
              </Col>
            </Row>
          </Form>
        </Row>
        <Row gutter={[16, 24]}>
          <Col span={24}>
            {window.innerWidth < screenResponsive ? (
              <div className="block_scroll_data_table">
                <div className="main_scroll_table">
                  <Table
                    dataSource={this.state.staffList}
                    columns={columns}
                    loading={this.state.loading}
                    pagination={{ pageSize: 30, hideOnSinglePage: true }}
                    rowKey={"staff_id"}
                  />
                </div>
              </div>
            ) : (
              <Table
                dataSource={this.state.staffList}
                columns={columns}
                loading={this.state.loading}
                pagination={{ pageSize: 30, hideOnSinglePage: true }}
                rowKey={"staff_id"}
              />
            )}
          </Col>
        </Row>
        <Modal
          open={this.state.visible}
          onCancel={() => this.setState({ visible: false })}
          onOk={this.handleSubmitForm.bind(this)}
          title={t('hr:edit') + (' ')+ t('hr:management_location')}
          width={window.innerWidth < screenResponsive ? "100%" : "100%"}
          afterClose={() => {
            this.formEditRef.current.resetFields();
            this.setState({ dataStaff: {} });
          }}
        >
          <Form preserve={false} ref={this.formEditRef} layout="vertical">
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  name="locations"
                  label={t('location')}
                  rules={[
                    { required: true, message: t("hr:input_location") },
                  ]}
                >
                  {/* <Dropdown datas = {locations} defaultOption='-- All Locations --' mode='multiple'/> */}
                  <DropdownLocations
                    datas={locations}
                    defaultOption={t('hr:all_location')}
                    mode="multiple"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
        <Modal
          visible={this.state.visibleViewLog}
          onCancel={() => this.setState({ visibleViewLog: false })}
          // onOk={this.handleSubmitForm.bind(this)}
          title={t('log')+ (' ') + t('hr:management_location')}
          width={"60%"}
          footer={false}
          afterClose={() => {
            // this.formEditRef.current.resetFields()
            // this.setState({ dataViewLog: {}})
          }}
        >
          <div>{this.renderViewLog()}</div>
        </Modal>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.auth.info,
    baseData: state.baseData
  };
}
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(StaffManagement))