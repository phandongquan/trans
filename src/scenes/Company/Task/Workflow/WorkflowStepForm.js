import React, { Component } from 'react';
import { Modal, Input, Form, Row, Col, InputNumber, Checkbox, Tabs, Button, Space, Upload } from 'antd';
import FormItem from 'antd/lib/form/FormItem';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import dayjs from 'dayjs'
import { workflowStepAction, workflowStepOptionStaff, workflowStepStop, workflowStepDoNothing, projectTaskPriority, screenResponsive, workflowStepParamConfigs } from '~/constants/basic';
import Dropdown from '~/components/Base/Dropdown';
import { updateFormData as updateWorkflowStep, createFormData as createWorkflowStep } from '~/apis/company/workflowStep';
import { showNotify, timeFormatStandard, checkValueToDropdown, convertToFormData, checkPermission } from '~/services/helper';
import StaffDropdown from '~/components/Base/StaffDropdown';
import FormConfig from './FormConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faImage } from '@fortawesome/free-solid-svg-icons';
import ConditionRedirectForm from './ConditionRedirectForm';
import SkillDropdown from '~/components/Base/SkillDropdown';
import { getList as getListWfConfig } from '~/apis/company/workflowConfig'
import FormConstraint from './FormConstraint';
import { MEDIA_URL_HR } from '~/constants';
import Editor from '~/components/Base/Editor';

const FormatTime = 'HH:mm';

const defaultProps = {
	onChange: () => { },
}

class WorkflowStepForm extends Component {
	constructor(props) {
		super(props)
		this.modalForm = React.createRef();
		this.state = {
			skills: [],
			conditions: [],
			params: [],
			option: 'form',
			wfConfigs: {},
			fileList: [], // File upload
			historyFileList: [], // File from history model
			removeFileList: [],// File will be remove,
			loading: false,
			showStockDropdown: false,
		}

		this.onChangeStockConfigs = this.onChangeStockConfigs.bind(this);
	}
	/**
	 * @lifecycle
	 */
	componentDidMount() {
		this.getConfigWorkflow();
	}

	componentDidUpdate(prevProps) {
		const { paramsWorkflowStep: { visible, wfstep }, conditions, wfid } = this.props;

		if (visible && wfstep != prevProps.paramsWorkflowStep.wfstep && !Object.keys(wfstep).length) {
			this.modalForm.current.resetFields();
			this.modalForm.current && this.modalForm.current.setFieldsValue({
				action_id: 0,
				option_staff: 0,
				group_id: 0
			});
		}

		if (visible && wfstep.id != prevProps.paramsWorkflowStep.wfstep?.id) {
			if (wfstep.condition) {
				this.onChangeCondition(wfstep.condition)
			}
			this.getWorkflowStep();
		}

		if (conditions != prevProps.conditions) {
			this.filterConditions(conditions);
		}

		if ((wfid != prevProps.wfid) && wfid) {
			this.getConfigWorkflow();
		}
	}

	/**
	 * Filter conditions
	 */
	filterConditions = (conditions) => {
		let conditionsNew = [];
		conditions.map(c => conditionsNew.push({ id: c.key, name: c.text }));
		if (conditionsNew) {
			this.setState({ conditions: conditionsNew });
		}
	}

	/**
	 * Get workflow step
	 */
	getWorkflowStep = () => {
		let { paramsWorkflowStep: { wfstep } } = this.props;
		if (this.modalForm.current) {
			let fieldsUpdate = {
				skill_id: checkValueToDropdown(wfstep.skill_id),
				begintime: wfstep.begintime ? dayjs(wfstep.begintime, 'HH:mm') : null,
			}

			wfstep.department_id = wfstep.department_id || null;
			wfstep.major_id = wfstep.major_id || null;
			wfstep.location_id = wfstep.location_id || null;
			wfstep.next_id = wfstep.next_id || null;
			wfstep.fail_id = wfstep.fail_id || null;
			wfstep.position_id = wfstep.position_id || null;
			
			if (wfstep.staff_id) {
				wfstep.staff_id = String(wfstep.staff_id).split(',')
			}
			if (wfstep?.report_to) {
				wfstep.report_to = String(wfstep?.report_to).split(',')
			}
			if (wfstep.default_staffs)
				wfstep.default_staffs = String(wfstep.default_staffs).split(',')
			if (wfstep?.files?.length) {
				let historyFileList = [];
				wfstep.files.map((f, i) => historyFileList.push({
					uid: `history-${i}`,
					name: f.split("/").pop(),
					fileRaw: f,
					status: 'done',
					url: `${MEDIA_URL_HR}/${f}`,
				}));
				this.setState({ historyFileList });
			}

			/**
			 * Handle show configs stocks, set value for option stock and selected stock
			 */
			let stockConfigs = wfstep.params?.configs?.stocks || null;
			if (stockConfigs) {
				if (['stock_id_in', 'stock_id_out'].includes(stockConfigs)) {
					fieldsUpdate['stock_configs'] = stockConfigs;
					fieldsUpdate['stock_manual_configs'] = null;
				} else {
					fieldsUpdate['stock_configs'] = 'stock_id_manual';
					fieldsUpdate['stock_manual_configs'] = stockConfigs.split(',');
					this.toogleStockDropdown(true);
				}
			} else {
				fieldsUpdate['stock_configs'] = null;
				fieldsUpdate['stock_manual_configs'] = null;
			}
			this.modalForm.current.setFieldsValue({ ...wfstep, ...fieldsUpdate });
		}
	}

	/**
	 * Show stock dropdown
	 */
	toogleStockDropdown(showStockDropdown = false) {
		this.setState({ showStockDropdown });
	}

	/**
	 * @event before submit form
	 * Validate before submit
	 */
	handleFormSubmit() {
		this.modalForm.current.validateFields()
			.then((values) => {
				this.submitModal(values);
			})
			.catch((info) => {
				console.log('Validate Failed:', info);
			});
	}

	/**
	 * @event change stock configs
	 * 
	 */
	onChangeStockConfigs(key) {
		if (!['stock_id_in', 'stock_id_out'].includes(key)) {
			this.toogleStockDropdown(true);
		} else {
			this.toogleStockDropdown();
		}
	}

	/**
	 * OnChange dropdown condition
	 */
	onChangeCondition = (key) => {
		this.setState({ params: [] });
		this.modalForm.current.setFieldsValue({ params: null })
		const { conditions } = this.props;

		let paramFind = conditions.find(c => c.key == key);

		if (paramFind.childs) {
			let paramNews = [];
			let childs = paramFind.childs;
			childs.map(c => {
				paramNews.push({
					id: c.key,
					name: c.text
				})
			});
			if (paramNews) {
				this.setState({ params: paramNews })
			}
		}
	}

	/**
	 * Submit form
	 */
	submitModal() {
		this.setState({ loading: true });
		let data = this.modalForm.current.getFieldsValue();

		let { t, wfid, paramsWorkflowStep: { wfstep } } = this.props;

		let arrNameSelect = ['action_id', 'skill_id'];
		Object.keys(data).map((key) => {
			if (arrNameSelect.includes(key) && data[key] == undefined)
				data[key] = 0
		});

		data.begintime = data.begintime ? timeFormatStandard(data.begintime, FormatTime) : '00:00:00';
		data.next_id = data.next_id || 0;
		data.fail_id = data.fail_id || 0;
		data.department_id = data.department_id || 0;
		data.location_id = data.location_id || 0;
		data.position_id = data.position_id || 0;
		data.major_id = data.major_id || 0;
		data.skill_id = data.skill_id || 0;
		data['wfid'] = wfid
		data.staff_id = data.staff_id ? data.staff_id.toString() : '';
		data.report_to = data.report_to ? data.report_to.toString() : '';
		data.default_staffs = data.default_staffs ? data.default_staffs.toString() : '';
		data.check_timesheet = data.check_timesheet ? 1 : 0
		data.is_task_auto_done = data.is_task_auto_done ? 1 : 0
		data.lock_fail = data.lock_fail ? 1 : 0

		let stockConfigs = data.stock_configs;
		let stockManualConfigs = data.stock_manual_configs || null;
		delete data.stock_configs;
		delete data.stock_manual_configs;

		Object.keys(data).forEach(key => {
			if (data[key] == null || data[key] == undefined) {
				delete data[key];
			}
		});
		let formData = convertToFormData(data);

		/**
		 *  Handle update params configs stocks, include params bindings
		 */
		let paramsBindings = wfstep.params?.bindings ? wfstep.params?.bindings : [];
		if (paramsBindings && paramsBindings.length) {
			paramsBindings.map((binding, index) => {
				formData.append(`params[bindings][${index}][key]`, binding['key']);
				formData.append(`params[bindings][${index}][value]`, binding['value']);
			});
		}
		if (stockConfigs) {
			if (stockManualConfigs && !['stock_id_in', 'stock_id_out'].includes(stockConfigs)) {
				formData.append('params[configs][stocks]', stockManualConfigs);
			} else {
				formData.append('params[configs][stocks]', stockConfigs);
			}
		} else {
			formData.append('params[configs]', '');
		}

		if (this.state.fileList.length && Array.isArray(this.state.fileList)) {
			this.state.fileList.map(f => formData.append('files[]', f))
		}
		if (this.state.removeFileList.length && Array.isArray(this.state.removeFileList)) {
			this.state.removeFileList.map(f => formData.append('remove_files[]', f))
		}
		let xhr;
		let message = '';
		if (wfstep.id) {
			formData.append('_method', 'PUT');
			xhr = updateWorkflowStep(wfstep.id, formData);
			message = t('Workflow step updated!');
		} else {
			xhr = createWorkflowStep(formData);
			message = t('Workflow step created!');
		}
		xhr.then((response) => {
			if (response.status != 0) {
				showNotify(t('Notification'), message);
				this.setState({ loading: false });
				this.props.hidePopup();
				this.props.resetTable();

			} else {
				showNotify(t('Notification'), response.message, 'error');
			}
		});
	}
	/**
	 * @handle before upload
	 * 
	 * @return false will default upload to url
	 * @param {BinaryType} file 
	 */
	beforeUpload = file => {
		this.setState(state => ({
			fileList: [...state.fileList, file],
		}));
		return false;
	}

	/**
	* @event remove file
	* @param {BinaryType} file 
	*/
	onRemove = file => {
		if (file.uid.includes('history')) {
			this.setState(state => {
				const index = state.historyFileList.indexOf(file);
				const newHistoryFileList = state.historyFileList.slice();
				newHistoryFileList.splice(index, 1);
				let newRemoveFileList = state.removeFileList.slice();
				newRemoveFileList.push(file.fileRaw);
				return {
					historyFileList: newHistoryFileList,
					removeFileList: newRemoveFileList
				};
			});
		} else {
			this.setState(state => {
				const index = state.fileList.indexOf(file);
				const newFileList = state.fileList.slice();
				newFileList.splice(index, 1);
				return {
					fileList: newFileList,
				};
			});
		}
	}
	/**
	 * Get config workflow
	 */
	getConfigWorkflow = () => {
		let { wfid } = this.props;
		let params = { id: wfid, all: 1 }
		let xhr = getListWfConfig(params);
		xhr.then((response) => {
			if (response.status) {
				if (Array.isArray(response.data?.rows)) {
					let locations = [];
					response.data.rows.filter(t => t.type == 'location' || t.type == 'stock').map(t => locations.push({ id: t.key, name: t.label }));
					this.setState({ wfConfigs: { locations } });
				}
			}
		})
	}

	render() {
		let { t, title, hidePopup, paramsWorkflowStep: { visible, wfstep }, workflowSteps, wfid, baseData: {positions, departments, locations, majors, stocks }, checkPermissionEdit } = this.props;
		let { option, wfConfigs, showStockDropdown } = this.state;
		let wfstepFilter = workflowSteps.filter(s => s.id != wfstep.id);
		wfstepFilter.push(workflowStepStop);
		wfstepFilter.push(workflowStepDoNothing);
		return (
			<Modal style={{ top: 20 }} forceRender
				afterClose={() => this.setState({ historyFileList: [], fileList: [], removeFileList: [] })}
				title={<div>
					{title || "Modal"}
					<span className='ml-3' style={{ fontSize: 15, color: 'rgba(0, 0, 0, 0.45)' }}>{wfstep?.name}</span>
				</div>}
				visible={visible}
				onCancel={hidePopup}
				onOk={this.handleFormSubmit.bind(this)}
				width={window.innerWidth < screenResponsive ? "100%" : "90%"}
				footer={
					(option == "form" && checkPermissionEdit) && (checkPermission('hr-workflow-update')) ? (
						<Button loading={this.state.loading}
							type="primary" key="btn-submit"
							icon={<FontAwesomeIcon icon={faSave} />}
							onClick={this.handleFormSubmit.bind(this)}
						>
							{t('save')}
						</Button>
					)
						: []
				}
			>
				<Tabs activeKey={option} onChange={(value) => this.setState({ option: value })}>
					<Tabs.TabPane tab={t('form')} key="form">
						<Form className="mt-3" preserve={false} ref={this.modalForm} layout="vertical">
							<Row gutter={12}>
								<Col xs={24} sm={24} md={24} lg={4} xl={4}>
									<FormItem label={t("step_number")} name="step_number">
										<Input className="w-100" />
									</FormItem>
								</Col>
								<Col xs={24} sm={24} md={24} lg={12} xl={12}>
									<FormItem label={t("name")} name="name" hasFeedback rules={[{ required: true, message: t("Please input name") },]}>
										<Input placeholder="Name" />
									</FormItem>
								</Col>
								<Col xs={24} sm={24} md={24} lg={3} xl={3}>
									<FormItem label={t("code")} name="step_code">
										<Input />
									</FormItem>
								</Col>
								<Col xs={24} sm={24} md={24} lg={2} xl={2}>
									<FormItem label={t("duration(H)")} name="duration" hasFeedback rules={[{ required: true, message: t("Please input duration") },
									 ({getFieldValue}) => ({
										validator(_, value) {
												if(!value) {
														return Promise.reject(t('require_better_0'));
												}
												return Promise.resolve();
										},
								})
									
								]

								}>
										<InputNumber min={0} className="w-100" />
									</FormItem>
								</Col>
								<Col xs={24} sm={24} md={24} lg={3} xl={3}>
									<FormItem label={t("priority")} name="priority_task">
										<Dropdown datas={projectTaskPriority} defaultOption="Priority" />
									</FormItem>
								</Col>
							</Row>
							<Row gutter={12}>
								<Col xs={24} sm={24} md={24} lg={16} xl={16}>
									<FormItem label={t("skill_require")} name="skill_id">
										<SkillDropdown defaultOption='-- All Skills --' mode='multiple' />
									</FormItem>
								</Col>
								<Col xs={24} sm={24} md={24} lg={3} xl={3}>
									<FormItem label={t("action_require")} name="action_id">
										<Dropdown datas={workflowStepAction} />
									</FormItem>
								</Col>
								<Col xs={24} sm={24} md={24} lg={3} xl={3}>
									<FormItem label={t("pending_time") +  (" (H)")} name="pending_day">
										<InputNumber min={0} className="w-100" />
									</FormItem>
								</Col>
								{/* <Col span={2}>
                      <FormItem label={t("Repeat")} name="repeat">
                        <InputNumber min={0} className="w-100" />
                      </FormItem>
                    </Col> */}
							</Row>
							<Row gutter={12}>
								<Col xs={24} sm={24} md={24} lg={8} xl={6}>
									<Form.Item label={t("department")} name="department_id">
										<Dropdown datas={departments} defaultOption={t("all_department")} />
									</Form.Item>
								</Col>
								<Col xs={24} sm={24} md={24} lg={8} xl={6}>
									<Form.Item label={t("major")} name="major_id">
										<Dropdown mode='multiple' takeZero={false} datas={majors} defaultOption={t("all_major")} />
									</Form.Item>
								</Col>
								<Col xs={24} sm={24} md={24} lg={8} xl={6}>
									<Form.Item label={t("location")} name="location_id">
										<Dropdown datas={locations} defaultOption={t("all_location")} />
									</Form.Item>
								</Col>
								<Col xs={24} sm={24} md={24} lg={8} xl={6}>
									<Form.Item label={t("position ")} name="position_id">
										<Dropdown mode='multiple' datas={positions} defaultOption={t("all_position")} />
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={12}>
								<Col xs={24} sm={24} md={24} lg={8} xl={8}>
									<Form.Item label={t("option_staff")} name="option_staff"
										tooltip={
											"Tùy chọn giao task cho 1 nhân viên ngẫu nhiên hoặc toàn bộ nhân viên phù hợp với skill, department, major..." +
											" trong trường hợp bạn không chọn field `Assign Staff` bên cạnh"
										}
										rules={[{ required: true, message: t("please_select_option_staff") }]}
									>
										<Dropdown datas={workflowStepOptionStaff} />
									</Form.Item>
								</Col>
								<Col sxs={24} sm={24} md={24} lg={16} xl={8}>
									<Form.Item label={t("assign_staff")} name="staff_id">
										<StaffDropdown mode="multiple" defaultOption={t("assign_staff")} />
									</Form.Item>
								</Col>
								<Col sxs={24} sm={24} md={24} lg={16} xl={8}>
									<Form.Item label={t("CC")} name="report_to">
										<StaffDropdown mode="multiple" defaultOption={t("-- CC to --")} />
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={12}>
								<Col xs={24} sm={24} md={24} lg={8} xl={8}>
									<Form.Item label={t("next_step")} name="next_id">
										<Dropdown datas={wfstepFilter} defaultOption={t("default")} />
									</Form.Item>
								</Col>
								<Col xs={24} sm={24} md={24} lg={8} xl={8}>
									<Form.Item label={t("fail_back_step")} name="fail_id">
										<Dropdown datas={wfstepFilter} defaultOption={t("default")} />
									</Form.Item>
								</Col>
								<Col xs={24} sm={24} md={24} lg={8} xl={2}>
									<Form.Item label={t("group_id")} name="group_id">
										<InputNumber min={0} className="w-100 " />
									</Form.Item>
								</Col>
								<Col xs={24} sm={24} md={24} lg={8} xl={6}>
									<Form.Item label={t("option_stock")} name="stock_configs"
										tooltip={
											"Tùy chọn nhân viên nhận task phải được assign theo stock!" +
											"Có thể lựa chọn stock out-in, hoặc từng stock cụ thể!"
										}
									>
										<Dropdown datas={workflowStepParamConfigs} defaultOption={t("default")}
											onChange={this.onChangeStockConfigs} />
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={12}>
								<Col xs={24} sm={24} md={24} lg={8} xl={8}>
									<Form.Item name="working_type" label={t("team_work")} initialValue={0}
										tooltip={"Làm việc nhóm: tất cả thành viên sẽ làm chung 1 task. Mỗi thành viên: hệ thống sẽ giao cho mỗi thành viên là 1 task riêng"}
									>
										<Dropdown takeZero
											datas={{
												0: t("team_work"),
												1: t('every_member'),
											}}
										/>
									</Form.Item>
								</Col>
								<Col xs={24} sm={24} md={24} lg={12} xl={8}>
									<Form.Item label={t("default_staff")} name="default_staffs">
										<StaffDropdown mode="multiple" defaultOption={t("assign_staff")} />
									</Form.Item>
								</Col>
								<Col xs={24} sm={24} md={24} lg={4} xl={3}>
									<Form.Item name="check_timesheet" label="check_timesheet" valuePropName="checked">
										<Checkbox value='check_timesheet'></Checkbox>
									</Form.Item>
								</Col>
								<Col xs={24} sm={24} md={24} lg={4} xl={2}>
									<Form.Item name="is_task_auto_done" label="lock_finish_task" valuePropName="checked">
										<Checkbox value='is_task_auto_done'></Checkbox>
									</Form.Item>
								</Col>
								<Col xs={24} sm={24} md={24} lg={4} xl={2}>
									<Form.Item name="lock_fail" label="lock_fail_task" valuePropName="checked">
										<Checkbox value='lock_fail '></Checkbox>
									</Form.Item>
								</Col>
								<Col xs={24} sm={24} md={24} lg={8} xl={4}>
									<Form.Item label={t("pick_stock")} name="stock_manual_configs" hidden={!showStockDropdown}>
										<Dropdown datas={stocks} defaultOption={t("default")}
											keyValMapping={{ 'stock_id': 'stock_name' }} mode='multiple' />
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={24}>
								<Col span={24}>
									<Form.Item label={t("description")} name="description">
										<Editor 
										path='workflow_step'
										prefix='hr'
										style={{ height: 200 }} />
									</Form.Item>
								</Col>
							</Row>
							{/* {
								checkPermissionEdit ?
									<Row>
										<Col span={12}>
											<Form.Item label='Image'>
												<Upload key="upload"
													listType="picture"
													beforeUpload={this.beforeUpload}
													onRemove={this.onRemove}
													fileList={[...this.state.historyFileList, ...this.state.fileList]}
													multiple>
													<Button key="upload" icon={<FontAwesomeIcon icon={faImage} />} type='primary'>
														&nbsp;{t('Upload file')}
													</Button>
												</Upload>
											</Form.Item>
										</Col>
									</Row>
									: []
							} */}

						</Form>
					</Tabs.TabPane>
					{wfstep?.id && (
						<>
							<Tabs.TabPane tab={t("phase_completion_data")} key="config">
								<FormConfig
									workflowId={wfid}
									workflowStepId={wfstep.id}
									refreshConstraints={() => this.getConfigWorkflow()}
									checkPermissionEdit={checkPermissionEdit} />
							</Tabs.TabPane>
							<Tabs.TabPane tab={t("navigation_condition")} key="condition_redirect">
								<ConditionRedirectForm wfid={wfid} wfstep_id={wfstep.id} workflowStep={wfstep} checkPermissionEdit={checkPermissionEdit} translang= {this.props}/>
							</Tabs.TabPane>
							<Tabs.TabPane tab={t("binding_condition")} key="constraint">
								<FormConstraint
									bindings={wfstep.params?.bindings ? wfstep.params.bindings : []}
									wfConfigs={wfConfigs}
									wfstep={wfstep}
									checkPermissionEdit={checkPermissionEdit} />
							</Tabs.TabPane>
						</>
					)}
				</Tabs>
			</Modal>
		);
	}
}

WorkflowStepForm.defaultProps = defaultProps;

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

export default connect(mapStateToProps)(withTranslation()(WorkflowStepForm))
