import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Table, Form, Col, Row, Button, Input, Menu, Dropdown, Modal } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import DropdownCustom from '~/components/Base/Dropdown';
import { getResultList as apiGetResultList, updateStatus as apiUpdateStatusTrainingExam } from '~/apis/company/trainingExamination';
import { trainingExamStatus, trainingExamResults, trainingExamTypes, levels, screenResponsive } from '~/constants/basic';
import { Link } from 'react-router-dom';
import { EyeOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { checkPermission, showNotify , historyParams, historyReplace } from '~/services/helper';
import Tab from '~/components/Base/Tab';
import tabListTraining from '~/scenes/Company/config/tabListTraining';
import { getList as apiGetList } from '~/apis/company/skill';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { updateLevel as apiUpdateLevel } from '~/apis/company/staff/skill';
import { debounce } from 'lodash';
import { searchForDropdown as getSkillList } from '~/apis/company/skill';
import dayjs from 'dayjs';
import StaffDropdown from '~/components/Base/StaffDropdown';
import UserDropdown from '~/components/Base/UserDropdown';
import SkillDropdown from '~/components/Base/SkillDropdown';


const { confirm } = Modal;

class ExaminationResult extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            limit: 30,
            page: 1,
            total: 0,
            result: [],
            selectedRowKeys: [],
            skills: [],
        }

        // this.getListSkill = debounce(this.getListSkill, 500);
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
      let params = historyParams();
      if (params.offset) {
        this.setState({ page: params.offset / this.state.limit + 1 });
      }
      params.status = typeof params.status != 'undefined' ? params.status : 3; // Complete
      params.result = typeof params.result != 'undefined' ? params.result : 0; // Waiting approved
      this.formRef.current.setFieldsValue(params);
      let values = this.formRef.current.getFieldsValue();
      params = {
        ...params,
        ...values
    }
      this.getResultList(params);
      // this.getListSkill();
    }


    // /**
    //  * Get list skill and refresh list skill
    //  */
    // async getListSkill() {
    //     let response = await apiGetList();
    //     if (response.status) {
    //         let { data: { rows } } = response;
    //         // Format data
    //         let skillFormat = [];
    //         Object.keys(rows).map(i => {
    //             skillFormat.push({
    //                 id: rows[i].id,
    //                 name: rows[i].name
    //             });
    //         });
    //         this.setState({ skills: skillFormat });
    //     }
    // }

    /**
     * Get reuslt list
     * @param {*} params 
     */
    // async getResultList (params = {}) {
      getResultList = (params = {}) => {
        this.setState({
            loading: true
        });

        params = {
            ...params,
            with_staff: true,
            check_permission: true,
            limit: this.state.limit,
            offset: params.offset || (this.state.page - 1) * this.state.limit,
            check_iso: true,
            is_exam_skill: true,
            sort: 'id',
            dir: 'desc'

        }
        historyReplace(params);
        let xhr = apiGetResultList (params);
        xhr.then((response) => {
            if (response.status) {
                let { data } = response;
                this.setState({
                    result: data.rows,
                    loading: false,
                    total: data.total
                });
            }
        });
    } 

    /**
     * @event change page
     * 
     * @param {*} page 
     */
    onChangePage = (page) => {
      let params = historyParams();
      delete params.limit;
      delete params.offset;
      let values = this.formRef.current.getFieldsValue();
      values = {
        ...params,
        ...values,
      };
      this.setState({ page }, () => this.getResultList(values));
    };

    onSelectChange = (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
    };

    /**
     * @event submit Form
     * @param {} values 
     */
    submitForm = (e) => {
      this.setState({ page: 1 }, () => {
        let values = this.formRef.current.getFieldsValue();
        this.getResultList(values)
      })
    }

    /**
     * Update status when click dropdown slected table
     * @param {*} e 
     */
    updateStatus = (e) => {
        this.setState({loading: true})
        const data = {
            id: this.state.selectedRowKeys,
            status: e.key
        }

        let { t } = this.props;
        let message = t('Updated status')
        let xhr = apiUpdateStatusTrainingExam(data)
        xhr.then(response => {
            this.setState({loading: false})
            if(response.status){
                showNotify(message)
                let values = this.formRef.current.getFieldsValue();
                this.getResultList(values)
                this.setState({selectedRowKeys: []})
            }
        })
    }

    /**
     * Update status & result when click dropdown slected table
     * @param {*} e 
     */
     updateStaffs = (field, e) => {
        this.setState({loading: true})
        let data = { id: this.state.selectedRowKeys}
        data[field] = e.key;
        let { t } = this.props;
        let xhr = apiUpdateStatusTrainingExam(data)
        xhr.then(response => {
            if (response.status) {
                showNotify(t('hr:notification'), t('hr:update_susscess'));
                this.setState({ selectedRowKeys: [] })
                let values = this.formRef.current.getFieldsValue();
                this.getResultList(values)
            }else {
                showNotify(t('hr:notification'), t('hr:server_error'), 'error');
            }
            this.setState({ loading: false })
        })
    }

    /**
     * Update staff_skill level
     * @param {integer} level 
     */
     updateLevel = (level) => {
        let {t} = this.props
        let { selectedRowKeys, result  } = this.state;
        let staff_ids = [];
        let skill_id = []
        selectedRowKeys.map(id => {
            let row = result.find(se =>  se.id == id);
            staff_ids.push(row?.staff_id);

            if(row) {
                skill_id.push(row.skill_id ? row.skill_id : row?.examination?.skill_id)
            }
        })
        confirm({
            title: 'Confirm?',
            icon: <ExclamationCircleOutlined />,
            maskStyle: { background: 'rgba(0, 0, 0, 0.1)' },
            content: `Update staff list with level = ${level}?`,
            onOk: async () => {
                this.setState({ loading: true });
                let data = {
                    skill_id: skill_id,
                    staff_ids,
                    level,
                    _method: 'PUT'
                };

                let response = await apiUpdateLevel(data);

                if (response.status == 1) {
                    showNotify(t('hr:notification'), t('hr:update_susscess'));
                    this.setState({ selectedRowKeys: [] })
                } else {
                    showNotify(t('hr:notification'), t('hr:server_error'), 'error');
                }
                this.setState({ loading: false })
            },
            onCancel: () => { },
        });
    }

    // /**
    //  * @event Search skill
    //  * @param {*} value 
    //  */
    //  onSearchSkill(value) {
    //     if (!value) {
    //         return;
    //     }
    //     this.getListSkill({ value });
    // }

    // /**
    //  * List skill for dropdown
    //  */
    // getListSkill = async (params = {}) => {
    //     params = {
    //         ...params,
    //     }
    //     let skillResponse = await getSkillList(params);
    //     if (skillResponse && skillResponse.data) {
    //         let listSkill = skillResponse.data.results;
    //         this.setState({ listSkill });
    //     }
    // }

    render() {
        let { t, baseData: { locations, departments, majors } } = this.props;
        let { selectedRowKeys } = this.state;

        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange
        };

        const hasSelected = selectedRowKeys.length > 0;

        const menuDropDown = (
            <Menu onClick={(e) => this.updateStaffs('status' , e)}>
                { Object.keys(trainingExamStatus).map(key => <Menu.Item key={key} >{trainingExamStatus[key]}</Menu.Item>) }
            </Menu>
        );

        const menuDropDownResult = (
            <Menu onClick={(e) => this.updateStaffs('examination_result' , e)}>
                { Object.keys(trainingExamResults).map(key => <Menu.Item key={key} >{trainingExamResults[key]}</Menu.Item>)}
            </Menu>
        );

        const menuDropDownLevel = (
            <Menu onClick={(e) => this.updateLevel(e.key)}>
                { Object.keys(levels).map(key => <Menu.Item key={key} >{levels[key]}</Menu.Item>)}
            </Menu>
        );

        /** Column of table */
        const columns = [
            {
                title: t('No.'),
                render: r => this.state.result.indexOf(r) + 1
            },
            {
                title: t('hr:staff'),
                render: r => {
                    if(!r.staff) return '';

                    let previewIcon = (
                        <Link to={`/company/staff/${r.staff_id}/skill`} target='_blank'>
                            <FontAwesomeIcon icon={faSearch} />
                        </Link>
                    );

                    let deptFound = departments.find(d => d.id == r.staff.staff_dept_id)
                    let majorFound = majors.find(m => m.id == r.staff.major_id)
                    let locFound = locations.find(l => l.id == r.staff.staff_loc_id)
                    return <div>
                        {r.skill ? previewIcon : ''} &nbsp;
                        <strong>{r.staff.staff_name} <small>({r.staff.code})</small></strong><br/>
                        <small>{deptFound?.name} / {majorFound?.name} / {locFound?.name}</small>
                    </div>
                } 
            },
            {
                title: t('hr:title'),
                render: r => (r.examination_id == 0 ? 'Tự thi'
                    : r.examination && <><Link to={`/company/training-examination/${r.examination?.id}/edit`}>{r.examination.title}</Link> <small><strong>({r.examination.code})</strong></small></>
                )
            },
            {
                title: t('hr:skill'),
                render: r => r.skill?.name
            },
            {
                title: t('hr:start_at'),
                dataIndex: 'start_at'
            },
            {
              title: t('hr:end_date'),
                dataIndex: 'end_at'
            },
            {
                title: t('hr:type'),
                render: r => r.examination ? trainingExamTypes[r.examination.type] : trainingExamTypes[r.type] 
            },
            {
              title: t('hr:result_by'),
                width : '6%',
                render: r => (
                    r.result_at ?
                    <div>
                        <small>{dayjs(r.result_at).format('YYYY-MM-DD HH:mm')}</small><br/>
                        <small>By #<strong>{r.result_by_user? r.result_by_user.name : ''}</strong></small>
                    </div>
                    :[]
                )
            },
            {
                title: t('hr:approved_by'),
                width : '6%',
                render: r => (
                    r.approved_at ?
                    <div>
                        <small>{dayjs(r.approved_at).format('YYYY-MM-DD HH:mm')}</small><br/>
                        <small>By #<strong>{r.approved_by_user? r.approved_by_user.name : ''}</strong></small>
                    </div>
                    :[]
                )
            },
            {
                title: t('hr:unapproved_by'),
                width : '6%',
                render: r => (
                    r.approved_at ?
                        <div>
                            <small>{dayjs(r.unapproved_by_user).format('YYYY-MM-DD HH:mm')}</small><br />
                            <small>By #<strong>{r.unapproved_by_user ? r.unapproved_by_user.name : ''}</strong></small>
                        </div>
                        : []
                )
            },
            {
                title: t('hr:status'),
                render: r => r.status && trainingExamStatus[r.status]
            },
            {
                title: t('hr:result'),
                render: r => r.examination_result ? trainingExamResults[r.examination_result] : ' Waiting approval'
            },
            {
                title: t('hr:action'),
                render: r => r.status == 3 && 
                    <Link className='' target='_blank' to={`/company/training-examination/${r.id}/history`}>
                        {
                            checkPermission('hr-examination-result-preview') ? 
                            <EyeOutlined />
                            : ''
                        }
                    </Link>,
                align: 'right'
            }
        ]

        return (
          <>
            <PageHeader title={t("hr:exam_result")} />
            <Row className="card pl-3 pr-3 mb-3">
              <Tab tabs={tabListTraining(this.props)} />
              <Form
                className="pt-3"
                ref={this.formRef}
                name="searchForm"
                onFinish={this.submitForm.bind(this)}
                layout="vertical"
              >
                <Row gutter={12}>
                  <Col xs={24} sm={24} md={24} lg={6} xl={4}>
                    <Form.Item name="q">
                      <Input
                        placeholder={t('hr:name') + '/' + t('hr:code')}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6} xl={4}>
                    <Form.Item name="type">
                      <DropdownCustom
                        datas={trainingExamTypes}
                        defaultOption={t('hr:all_type')}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6} xl={4}>
                    <Form.Item name="status">
                      <DropdownCustom
                        datas={trainingExamStatus}
                        defaultOption={t('hr:all_status')}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6} xl={4}>
                    <Form.Item name="result">
                      <DropdownCustom
                        datas={trainingExamResults}
                        defaultOption={t('all_result')}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6} xl={4}>
                    <Form.Item name="skill_id">
                      {/* <DropdownCustom
                        datas={this.state.listSkill}
                        onSearch={this.onSearchSkill.bind(this)}
                        defaultOption="-- All Skills --"
                      /> */}
                      <SkillDropdown defaultOption={t('hr:all_skill')} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6} xl={4}>
                    <Form.Item name="result_by">
                      <UserDropdown
                        datas={this.state.listSkill}
                        defaultOption={t('hr:staff')}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6} xl={4}>
                    <Form.Item name="department_id">
                      <DropdownCustom
                        datas={departments}
                        defaultOption={t('hr:all_department')}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6} xl={4}>
                    <Form.Item name="staff_loc_id">
                      <DropdownCustom
                        datas={locations}
                        defaultOption={t('hr:all_location')}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6} xl={4}>
                    <Form.Item name="major_id">
                      <DropdownCustom
                        datas={majors}
                        defaultOption={t('hr:all_major')}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6} xl={4}>
                    <Form.Item name="staff_id">
                      <StaffDropdown defaultOption={t('all_staff')} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                    <Form.Item>
                      <Button type="primary" htmlType="submit">
                        {t("hr:search")}
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={12}>
                </Row>
                <Row span={12}>
                </Row>
              </Form>
            </Row>
            <Row gutter={[16, 24]}>
              <Col span={24}>
                {/* <div style={{ marginBottom: 16 }}>
                            <Dropdown.Button menu={menuDropDown} disabled={!hasSelected}> 
                                Status 
                            </Dropdown.Button>
                            <Dropdown.Button menu={menuDropDownResult} disabled={!hasSelected} style={{ marginLeft: 8 }}>
                                Result
                            </Dropdown.Button>
                            <Dropdown.Button menu={menuDropDownLevel} disabled={!hasSelected} style={{ marginLeft: 8 }}>
                                Level
                            </Dropdown.Button>
                            <span style={{ marginLeft: 8 }}>
                                {hasSelected ? `Selected ${selectedRowKeys.length} items` : ''}
                            </span>
                        </div> */}
                {window.innerWidth < screenResponsive ? (
                  <div className="block_scroll_data_table">
                    <div className="main_scroll_table table_2000">
                      <Table
                        loading={this.state.loading}
                        // rowSelection={rowSelection}
                        dataSource={this.state.result}
                        columns={columns}
                        pagination={{
                          hideOnSinglePage: true,
                          showSizeChanger: false,
                          total: this.state.total,
                          pageSize: this.state.limit,
                          current: this.state.page,
                          onChange: (page) => this.onChangePage(page),
                        }}
                        showSorterTooltip={true}
                        rowKey={(result) => result.id}
                      />
                    </div>
                  </div>
                ) : (
                  <Table
                    loading={this.state.loading}
                    // rowSelection={rowSelection}
                    dataSource={this.state.result}
                    columns={columns}
                    pagination={{
                      hideOnSinglePage: true,
                      showSizeChanger: false,
                      total: this.state.total,
                      pageSize: this.state.limit,
                      current: this.state.page,
                      onChange: (page) => this.onChangePage(page),
                    }}
                    showSorterTooltip={true}
                    rowKey={(result) => result.id}
                  />
                )}
              </Col>
            </Row>
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
const mapDispatchToProps = (dispatch) => {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ExaminationResult))