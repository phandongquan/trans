import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next';
import { Button, Row, Col, Input, Form, Table, Modal, DatePicker ,Avatar, Checkbox } from "antd";
import TextArea from 'antd/lib/input/TextArea';
import Dropdown from '~/components/Base/Dropdown';
import { typeRangeUsers, subTypeRangeUsers } from '~/constants/basic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFileExport, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import Upload from '~/components/Base/Upload';
import { typeFileExcel } from '~/constants/basic';
import StaffDropdown from '~/components/Base/StaffDropdown';
import { showInfoStaff, getThumbnailHR, exportToXLS , convertToFormData ,showNotify , timeFormatStandard , convertToFormDataV2} from '~/services/helper';
import {  searchForDropdownSkill } from '~/apis/company/staffSearchDropDown';
import dayjs from 'dayjs';
import { formatHeader ,formatData } from '~/scenes/Company/Skill/config/exportModalSkillRequest';
import { upraisePushNotify } from '~/apis/company/skill';
import {  ExclamationCircleFilled } from '@ant-design/icons';
import DeleteButton from '~/components/Base/DeleteButton';

export class ModalSkillRequest extends Component {
    constructor(props) {
        super(props);
        this.formModalRef = React.createRef();
        this.formFilterStaff = React.createRef();
        this.state = {
            loading: false ,
            rangeUser: null,
            dataRangeUsers: [],
            selectedRowKeys: [],
            deadline: null,
            sub_type: null,
            file: "",
            loadingExport: false,
            paramSearchSkill: {},
            approvedBy: null,
            parentId: null,
            status: null,
            offsetStaff: 0,
            limitStaff: 50,
            totalStaff: 0,
            staffTypes: {},
            typeAllMultipleStaffs: null,
            visibleViewsStaff: false,
            AllStaffSelected : [],
            AllstaffSave : [],
            AlltypesSave : {}
        };
      }
    componentDidMount(){
    }
    componentDidUpdate(prevProps, prevState){
        if(this.props.visible){
            
        }
    }
    async exportStaffSkillRequest() {
        let  id  = this.props.data.id;
        this.setState({ loadingExport: true });
        if (this.state.deadline && this.state.dataRangeUsers) {
            let params = {
                skill_id: id,
                deadline: dayjs(this.state.deadline).format("YYYY-MM-DD HH:mm:ss"),
                type: this.state.rangeUser,
                is_export: 1,
                sub_type: this.state.sub_type,
            };
            let formData = convertToFormData(params);
            let response = await upraisePushNotify(formData);
            if (response.status) {
                let header = formatHeader();
                let data = formatData(
                    response.data,
                    dayjs(this.state.deadline).format("YYYY-MM-DD HH:mm:ss"),
                    this.state.sub_type,
                    this.props.data.name
                );
                let fileName = `Staff-${dayjs().format("YYYY-MM-DD")}`;
                let dataFormat = [...header, ...data];
                exportToXLS(fileName, dataFormat, [
                    { width: 10 },
                    { width: 35 },
                    { width: 15 },
                    { width: 15 },
                    { width: 15 },
                    { width: 15 },
                    { width: 25 },
                    { width: 25 },
                    { width: 15 },
                    { width: 15 },
                    { width: 25 },
                    { width: 15 },
                ]);
            }
        } else {
            showNotify(
                "Notification",
                "Required to choose deadline , type and range user !",
                "error"
            );
        }
        this.setState({ loadingExport: false });
    }
    // onChangePageStaff(page){
    //     let values = this.formFilterStaff.current.getFieldsValue();
    //     this.setState({ offsetStaff: (page - 1) * this.state.limitStaff }, () => this.handleFilterStaff({ ...values }));
    //   }
    /**
   *
   * @param {*} values
   */
    handleFilterStaff = (values) => {
        let is_required = false ; 
        Object.keys(values).map(key => {
            if(typeof values[key] != 'undefined' && values[key].length){
                is_required = true
            }
        })
        if(is_required){
            this.setState({loading : true})
            let  id  = this.props.data.id;
            // values.limit = this.state.limitStaff;
            // values.offset = this.state.offsetStaff
            values.limit = -1
            let xhr = searchForDropdownSkill(values, id);
            xhr.then((res) => {
                if (res.status) {
                    this.setState({ dataRangeUsers: res.data.rows, totalStaff: res.data.total , loading : false });
                }
            });
        }else{
            showNotify('Notification', 'Please select staff, departments, majors, locations or positions !','error');
            return
        }
        
    };
    /**
   * onSelectMultipleFilters
   * @param {*} selectedRowKeys
   */
    onSelectMultipleFilters = (selectedRowKeys) => {
        let listStaff = []
        if (selectedRowKeys.length) {
            listStaff = selectedRowKeys.map(s => {
                let data = this.state.dataRangeUsers.find(item => item.staff_id == s);
                if (typeof data != 'undefined') {
                    return data
                } else {
                    let dataOld = this.state.AllStaffSelected.find(item => item.staff_id == s)
                    return dataOld
                }
            })
        }
        this.setState({ selectedRowKeys, AllStaffSelected: listStaff });
    };
    handleSubmitDeadline() {
        this.formModalRef.current
            .validateFields()
            .then((values) => {
                Object.keys(values).forEach((key) => {
                    values[key] == undefined || values[key] == "file"
                        ? delete values[key]
                        : (values[key] = values[key]);
                });
                this.submitDeadlineForm(values);
            })
            .catch((info) => {
                this.setState({ visibleViewsStaff: false })
                console.log("Validate Failed:", info);
                showNotify('Notification', 'Validate Failed', 'error')
            });
    }
    async submitDeadlineForm(values, isConfirm = false) {
        let  id  = this.props.data.id;
        if (values.deadline) {
            values.deadline = timeFormatStandard(values.deadline);
        }
        let params = {
            ...values,
            skill_id: id,
        };

        let noneType = true;
        let formData = convertToFormDataV2(params);
        if (params.type == 2) {
            params.filter_staff = this.state.AllstaffSave;
            let staffList = []
            if (this.state.AllstaffSave.length ) {
                this.state.AllstaffSave.map((staff, index) => {
                    if(noneType){
                        formData.append(`staff_list[${index}][staff_id]`, staff.staff_id);
                        if (typeof this.state.AlltypesSave[staff.staff_id] != 'undefined') {
                            formData.append(`staff_list[${index}][sub_type]`, this.state.AlltypesSave[staff.staff_id]);
                        } else {
                            showNotify('Notification', 'Bạn chọn chưa đủ type !', 'error');
                            noneType = false
                            return
                        }
                    }
                })
            } else {
                showNotify('Notification', 'Bạn chưa chọn staff !', 'error');
                noneType = false
                return
            }
        }

        if (noneType) {
            if (this.state.file) {
                formData.append("file", this.state.file);
            }

            if (isConfirm) {
                formData.append('is_confirm', 1)
            }
            let response = await upraisePushNotify(formData);
            if (response.status) {
                showNotify("Notification", response.message);
                this.props.onCancel()
                this.setState({ visibleViewsStaff: false });
            } else {
                if (response.check_confirm != 'undefined' && response.check_confirm) {
                    let self = this;
                    Modal.confirm({
                        title: 'Xác nhận',
                        icon: <ExclamationCircleFilled />,
                        content: 'Có skill request đang Active, bạn có muốn tiếp tục?',
                        onOk() {
                            self.submitDeadlineForm(values, true);
                        },
                    })
                    return;
                }
                showNotify("Notification", response.message, "error");
            }
        } else {
            return
        }

    }
    saveTemporaryStaff(){
        this.setState({loading : true})
        this.setState(state => {
            let newAllStaffSave = state.AllstaffSave
            let AllStaffSaveIds = newAllStaffSave.map(staff => staff.staff_id )
            newAllStaffSave = [...newAllStaffSave,
            ...this.state.AllStaffSelected.filter(staff => !AllStaffSaveIds.includes(staff.staff_id))]
            let newAlltypesSave = state.AlltypesSave
            newAlltypesSave = {...newAlltypesSave , ...this.state.staffTypes}
            return { 
                AlltypesSave : newAlltypesSave,
                AllstaffSave: newAllStaffSave, 
                selectedRowKeys: [], 
                staffTypes: {} ,
                AllStaffSelected : [],
                loading : false,
                typeAllMultipleStaffs : null
            };
        });
    }
    toggleSelectAll(){
        this.setState({
                selectedRowKeys:
                    this.state.selectedRowKeys == this.state.dataRangeUsers.length ? [] : this.state.dataRangeUsers.map((r) => r.staff_id),
                AllStaffSelected :
                    this.state.selectedRowKeys == this.state.dataRangeUsers.length ? [] : this.state.dataRangeUsers,
        })
    };
    render() {
        let {
            t,
            match,
            baseData: { departments, divisions, majors, positions, locations },
            auth: { staff_info, profile },
        } = this.props;
        let majorsAddNone = [{ id: 'all', name: 'All majors' }, { id: 999999999, name: "None" }, ...majors];
        let {dataRangeUsers , selectedRowKeys} = this.state
        const rowSelection = {
            type: "checkbox",
            fixed: true,
            columnTitle: <Checkbox
                checked={selectedRowKeys.length}
                indeterminate={
                    selectedRowKeys.length > 0 && selectedRowKeys.length < this.state.AllStaffSelected.length
                }
                onChange={() => this.toggleSelectAll()}
            />,
            selectedRowKeys,
            onChange: this.onSelectMultipleFilters,
            preserveSelectedRowKeys: true
        };
        const columnsRangeUsers = [
            {
              title: "No.",
              render: (r) => dataRangeUsers.indexOf(r) + 1,
              width: "10%",
            },
            {
              title: "Staff",
              render: (r) => {
                if (!r) {
                  return "";
                }
                return (
                  <div className="d-flex">
                    <div>
                      <Avatar src={getThumbnailHR(r.avatar, "40x40")} />
                    </div>
                    <div className="ml-2" style={{ lineHeight: 1.2 }}>
                      <div>
                        <b>
                          {r.staff_name} - {r.code}
                        </b>
                      </div>
                      <div>
                        <small>
                          {showInfoStaff(
                            r.position_id,
                            r.staff_dept_id,
                            r.major_id,
                            r.staff_loc_id
                          )}
                        </small>
                      </div>
                    </div>
                  </div>
                );
              },
            },
            {
              title: "Position",
              render: (r) => {
                if (!r.position_id) {
                  return "";
                }
                let positionFinded = positions.find((p) => p.id == r.position_id);
                return positionFinded?.name;
              },
            },
            {
              title: "Level",
              render: (r) => r.level,
            },
            {
              title: 'Type',
              render: r=> {
                let value = this.state.staffTypes[r.staff_id]
                return <Dropdown value={value} datas={subTypeRangeUsers} defaultOption='-- All Types --' onChange={v => {
                  if (r.staff_id) {
                    let staffTypes = {
                      ...this.state.staffTypes
                    }
                    staffTypes[r.staff_id] = v
                    this.setState({staffTypes})
                }
                }} />
              }
            }
          ];
        const columnsAllStaffSelected = [
            {
              title: "No.",
              render: (r) => this.state.AllstaffSave.indexOf(r) + 1 ,
              width: "10%",
            },
            {
              title: "Staff",
              render: (r) => {
                if (!r) {
                  return "";
                }
                return (
                  <div className="d-flex">
                    <div>
                      <Avatar src={getThumbnailHR(r.avatar, "40x40")} />
                    </div>
                    <div className="ml-2" style={{ lineHeight: 1.2 }}>
                      <div>
                        <b>
                          {r.staff_name} - {r.code}
                        </b>
                      </div>
                      <div>
                        <small>
                          {showInfoStaff(
                            r.position_id,
                            r.staff_dept_id,
                            r.major_id,
                            r.staff_loc_id
                          )}
                        </small>
                      </div>
                    </div>
                  </div>
                );
              },
            },
            {
              title: "Position",
              render: (r) => {
                if (!r.position_id) {
                  return "";
                }
                let positionFinded = positions.find((p) => p.id == r.position_id);
                return positionFinded?.name;
              },
            },
            {
              title: "Level",
              render: (r) => r.level,
            },
            {
              title: 'Type',
              render: r=> {
                let value = this.state.AlltypesSave[r.staff_id]
                return subTypeRangeUsers[value]
              }
            },
            {
                title : 'Action',
                render : (text , record ,index) => {
                    return  <Button danger
                    size='small'
                    icon={<FontAwesomeIcon icon={faTrashAlt} />}
                    onClick={() => {
                        let newAllstaffSave = this.state.AllstaffSave.slice()
                        newAllstaffSave.splice(index, 1);
                        this.setState({ AllstaffSave: newAllstaffSave })
                    }}
                    />
                }
            }
          ]
        return (
            <div>
                <Modal
                    title={this.state.data?.name}
                    open={this.props.visible}
                    onCancel={() => this.props.onCancel()}
                    afterClose={() => this.setState({ typeAllMultipleStaffs: null })}
                    onOk={() => {
                        if ((this.state.rangeUser == 2) && !(this.state.file instanceof File)) {
                            this.setState({ visibleViewsStaff: true })
                        } else {
                            this.handleSubmitDeadline();
                            this.props.enterLoading();
                        }
                    }}
                    width={"60%"}
                >
                    <Form ref={this.formModalRef} layout="vertical">
                        <Row gutter={[12, 0]}>
                            <Col span={24}>
                                <Form.Item name={"title"} label={"Title"}>
                                    <Input placeholder="Title" />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name={"content"} label={"Content"}>
                                    <TextArea placeholder="Content" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name={"deadline"}
                                    label={"Deadline"}
                                    rules={[{ required: true, message: "Vui lòng chọn" }]}
                                >
                                    <DatePicker
                                        showTime
                                        className="w-100"
                                        placeholder="Deadline"
                                        onChange={(v) => this.setState({ deadline: v })}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name={"sub_type"}
                                    label={"Type"}
                                    rules={[{ required: this.state.rangeUser == 2 ? false : true, message: "Vui lòng chọn" }]}
                                >
                                    <Dropdown
                                        datas={subTypeRangeUsers}
                                        defaultOption="-- Type --"
                                        onChange={(val) => this.setState({ sub_type: val })}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name={"type"}
                                    label={"Range user"}
                                    rules={[{ required: true, message: "Vui lòng chọn" }]}
                                >
                                    <Dropdown
                                        datas={typeRangeUsers}
                                        defaultOption="-- Range user --"
                                        onChange={(val) => {
                                            this.formModalRef.current.resetFields(["file"]);
                                            this.setState({ rangeUser: val, file: "" }, () => {
                                                if (val == 2) {
                                                    if ((!this.props.data.major_id.includes("0") || !this.props.data.major_id.includes(""))) {
                                                        this.formFilterStaff.current.setFieldsValue({ major_id: this.props.data.major_id })
                                                    }
                                                    let values = this.formFilterStaff.current.getFieldsValue()
                                                    this.handleFilterStaff(values)
                                                }
                                            }
                                            );
                                        }}
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={24} className="mt-3">
                                <div className="d-flex">
                                    <Button
                                        loading={this.state.loadingExport}
                                        className="mr-2"
                                        type="primary"
                                        icon={<FontAwesomeIcon icon={faFileExport} />}
                                        onClick={() => this.exportStaffSkillRequest()}
                                    >
                                        &nbsp;Export
                                    </Button>
                                    <Form.Item name={"file"}>
                                        <Upload
                                            fileList={this.state.file}
                                            type={typeFileExcel}
                                            size={5}
                                            onChange={(e) => {
                                                if (e.length) {
                                                    this.setState({ file: e[0] });
                                                }
                                            }}
                                            onRemove={() => this.setState({ file: "" })}
                                        />
                                    </Form.Item>
                                </div>
                                {this.state.rangeUser == 2 ? (
                                    <Col span={24} className="mt-3">
                                            <Form
                                                layout="vertical"
                                                ref={this.formFilterStaff}
                                                onFinish={(value) => {
                                                    this.setState({offsetStaff : 0}, () => this.handleFilterStaff(value))
                                                }}
                                            >
                                                <Row gutter={12}>
                                                    <Col span={6}>
                                                        <Form.Item name="ids">
                                                            <StaffDropdown
                                                                defaultOption="--- All Staffs ---"
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={4}>
                                                        <Form.Item name="department_id">
                                                            <Dropdown
                                                                datas={departments}
                                                                defaultOption="--- All Departments ---"
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={4}>
                                                        <Form.Item name="major_id">
                                                            <Dropdown
                                                                datas={majorsAddNone}
                                                                defaultOption="--- All Majors ---"
                                                                mode="multiple"
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={4}>
                                                        <Form.Item name="location_id">
                                                            <Dropdown
                                                                datas={locations}
                                                                defaultOption="--- All Locations ---"
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={4}>
                                                        <Form.Item name="position_id">
                                                            <Dropdown
                                                                datas={positions}
                                                                defaultOption="--- All Positions ---"
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={2}>
                                                        <Button
                                                            htmlType="submit"
                                                            type="primary"
                                                            icon={
                                                                <FontAwesomeIcon icon={faSearch} type="primary" />
                                                            }
                                                        />
                                                    </Col>
                                                </Row>
                                            </Form>
                                        <Table
                                            className="mt-2"
                                            dataSource={[...dataRangeUsers]}
                                            columns={columnsRangeUsers}
                                            rowSelection={rowSelection}
                                            rowKey="staff_id"
                                            pagination={{
                                                pageSize: 50,
                                                showSizeChanger: false,
                                                // onChange: page => this.onChangePageStaff(page),
                                                // current: (this.state.offsetStaff / this.state.limitStaff) + 1,
                                                // total: this.state.totalStaff,
                                            }}
                                            scroll={{ y: 500 }}
                                        />
                                        <div className='p-2 mt-2'>
                                            <span className='mt-1'>Select type multiple staff : </span>
                                            <br />
                                            <Dropdown
                                                style={{ width: '50%' }}
                                                datas={subTypeRangeUsers}
                                                defaultOption={t('-- All type --')}
                                                value={this.state.typeAllMultipleStaffs}
                                                onSelect={v => {
                                                    if (this.state.selectedRowKeys.length > 0) {
                                                        let staffTypes = {}
                                                        this.setState({ typeAllMultipleStaffs: v })
                                                        this.state.selectedRowKeys.map(s => {
                                                            staffTypes[s] = v
                                                        })
                                                        this.setState(state => {
                                                            let newStaffTypes = state.staffTypes
                                                            newStaffTypes = { ...newStaffTypes, ...staffTypes }
                                                            return { staffTypes: newStaffTypes };
                                                        });
                                                    }
                                                }}
                                            />
                                            <Button
                                                className='ml-2'
                                                type='primary'
                                                onClick={() => this.saveTemporaryStaff()}
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                className='ml-2'
                                                danger
                                                onClick={() => {
                                                    this.setState({ AllstaffSave: [] , AlltypesSave : {} })
                                                }}
                                            >
                                                Clear
                                            </Button>
                                            <a className='ml-2' onClick={() => this.setState({ visibleViewsStaff: true })}>
                                                selected {this.state.AllstaffSave.length} staffs
                                            </a>
                                        </div>
                                    </Col>
                                ) : null}
                            </Col>
                        </Row>
                    </Form>
                </Modal>
                <Modal
                    title={'View staffs'}
                    open={this.state.visibleViewsStaff}
                    onCancel={() => this.setState({ visibleViewsStaff: false })}
                    onOk={() => {
                        this.handleSubmitDeadline();
                        this.props.enterLoading();
                    }}
                    width={"60%"}
                >
                    <Table className="mt-2"
                        dataSource={this.state.AllstaffSave}
                        columns={columnsAllStaffSelected}
                        rowKey="staff_id"
                        pagination={false}
                        scroll={{ y: 500 }}
                        loading={this.state.loading}
                         />
                        
                </Modal>
            </div>
        )
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
export default connect(mapStateToProps )(withTranslation()(ModalSkillRequest))