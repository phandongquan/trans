import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Row, Col, Input, Form, Divider, Checkbox, Select, Spin, Tooltip, Table } from "antd";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSave, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { configWorkflow } from '~/constants/basic';
import { checkPermission, showNotify } from '~/services/helper';
import Dropdown from '~/components/Base/Dropdown';
import { MinusCircleOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { save as apiSave, getList as apiGetList, destroy as apiDestroy, updatePriorityFormConfig } from '~/apis/company/workflowConfig';
import { DndContext } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { MenuOutlined, DeleteOutlined } from "@ant-design/icons";
import { screenResponsive } from '~/constants/basic';
import { uniqueId } from 'lodash';

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


class FormConfig extends Component {

    /**
     *
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            massDelete: [],
            datas: []
        };
    }

    componentDidMount() {
        this.getDetail();
    }

    /**
     * @lifecycle
     */
    componentDidUpdate(prevProps) {
        if (this.props.workflowStepId != prevProps.workflowStepId && this.props.workflowStepId) {
            this.getDetail();
        }
    }

    /**
     * Get detail
     */
    getDetail = () => {
        let { workflowId, workflowStepId } = this.props;
        if (workflowStepId) { // Workflow Step
            let params = { id: workflowStepId, is_step: 1 }
            this.getWorkflowConfig(params);
        } else if (workflowId) { // Workflow
            let params = { id: workflowId }
            this.getWorkflowConfig(params);
        }
    }

    /**
     * Get workflow config
     */
    getWorkflowConfig = async (params = {}) => {
        this.setState({ loading: true })
        let response = await apiGetList(params)
        if (response.status) {
            let { rows } = response.data;
            this.setState({ datas: rows, loading: false })
        }
    }

    /**
     * Loading Button
     */
    enterLoading = () => {
        this.setState({ loading: true });
        setTimeout(() => {
            this.setState({ loading: false });
        }, 1000);
    }

    /**
     * @event submit form config
     */
    submitFormWorkflow = async () => {
        // this.setState({ loading: true })
        let data = {
            data :  this.state.datas.slice()
        }
        let isRequiredForm = true 
        data.data.map(d => {
            d.is_required = d.is_required == true ? 1 : 0;
            d.key = d.key.trim()
            if (this.checkTypeOptionCheckList(d.type)) {
                d.value = Array.isArray(d.value) ? d.value.toString() : '';
            } else {
                d.value = ''
            }
            if(d.key.length && d.label.length && typeof d.type != 'undefined'){ // require form field 'key', 'label','type'
                isRequiredForm = true
            }else{
                isRequiredForm = false
            }
        })
        let { t } = this.props;
        const { massDelete } = this.state;
        if(isRequiredForm){
            try {
                if (massDelete.length) {
                    let responseDelete = await apiDestroy({ id: massDelete });
                }
    
                if (data.data.length) {
                    let response = await apiSave(data)
                    let arrDatas = response.data.rows
                    let arrFormDataPiority = new FormData;
                    arrDatas.map((d,index) =>  arrFormDataPiority.append(`data[${d.id}]`,index + 1))
                    arrFormDataPiority.append('_method','PUT')
                    let responseUpdatePiority = await updatePriorityFormConfig(arrFormDataPiority);
                }
    
                this.getDetail();
                this.setState({ loading: false })
                showNotify(t('Notification'), 'Workflow config updated!');
                this.props.refreshConstraints();
            } catch (error) {
                this.setState({ loading: false })
                showNotify(t('Notification'), 'Error', 'error');
            }
        }else{
            this.setState({ loading: false })
            showNotify(t('Notification'), 'Please input key, label, type!', 'error');
        }
        
    }

    /**
     * 
     * @param {*} type 
     */
    checkTypeOptionCheckList = (type) => {
        return type == 'check_list' || type == 'option'
    }
    /**
     * Update mass delete
     * @param {*} index 
     */
    updateMassDelete = (index) => {
        const { datas } = this.state;

        if (typeof datas[index] != 'undefined') {
            this.setState(state => { return { massDelete: [...state.massDelete, datas[index].id] } })
        }
    }
    onClickAddNew() {
        let { workflowId, workflowStepId } = this.props;
        let { datas } = this.state;
        let result = datas.slice()
        let dataNew = {
            auto: 0,
            id: 0,
            is_required: false,
            key: '',
            label: '',
            type: "location",
            value: [],
            workflow_id: workflowId ,
            workflow_step_id: workflowStepId ? workflowStepId : 0
        };

        result.push(dataNew);
        this.setState({ datas : result });
    }
    /**
     *  handle delete round
     */
    handleDelete(index) {
        let { datas } = this.state;
        let result = datas.slice()
        result.splice(index, 1);
        this.setState({datas : result });
    }
    /**
     *
     */
    onDragEnd({ active, over }) {
        let { datas } = this.state;
        if (active?.id !== over?.id) { // over id is index old , active id is index new 
            const activeIndex = datas.findIndex(
                (item) => datas.indexOf(item) + 1 === active?.id
            );
            const overIndex = datas.findIndex(
                (item) => datas.indexOf(item) + 1  === over?.id
            );

            let datasNew = arrayMove(datas, activeIndex, overIndex);
            datasNew.map((d, i) => {
                d["priority"] = i + 1;
            });
            this.setState({ datas: datasNew });
            // this.updateWf(over?.id, active?.id)  
        }
    }

    setStateData(event, index, field) {
        let { datas } = this.state;
        let datasNew = datas.slice()
        const arrFieldEvent = ['key', 'label']
        const arrFieldEventCheckbox = ['auto', 'is_required']
        let val = null;
        if (arrFieldEvent.includes(field)) {
            val = event?.target?.value;
        }else if(arrFieldEventCheckbox.includes(field)){
            val = event.target.checked 
        } else {
            val = event;
        }
        if (typeof datasNew[index] != "undefined") {
            datas[index][field] = val;
        }
        this.setState({ datas : datasNew });
      }
    /**
     * @render
     */
    render() {
        let { t, workflowId, workflowStepId } = this.props;
        const columns = [
            {
                title: " ",
                key: "sort",
            },
            {
                title: <Tooltip
                    className="cursor-pointer text-muted"
                    title="Require"
                >
                    <QuestionCircleOutlined />
                </Tooltip>,
                render: (t , r , i) => <Checkbox checked={r.is_required} 
                // value="is_required" 
                onChange={e =>  this.setStateData(e, i, "is_required")}></Checkbox>
            },
            {
                title: t('auto'),
                render: (t , r , i)=> <Checkbox checked={r.auto} 
                 value="auto" onChange={e =>  this.setStateData(e, i, "auto")}></Checkbox>
            },
            {
                title: t('key'),
                width: '25%',
                render:(t , r , i) => <Input
                    placeholder="Key"
                    onKeyDown={(event) => {
                        if (/[^a-zA-Z0-9]/.test(event.key)) {
                            event.preventDefault();
                        }
                    }}
                    onChange={e =>  this.setStateData(e, i, "key")}
                    disabled={r?.id ? true : false}
                    value={r.key}
                />
            },
            {
                title: t('label'),
                width: '25%',
                render:(t , r , i)=> <Input value={r.label} placeholder="Label" onChange={e =>  this.setStateData(e, i, "label")} />
            },
            {
                title: t('type'),
                render:(t , r , i)=> <Dropdown
                    datas={configWorkflow}
                    value={r.type}
                    defaultOption={("Type")}
                    onChange={v =>  {
                        this.setStateData(v, i, "type")
                    }}
                />
            },
            {
                title: t('value'),
                width: '30%',
                render: (t, r, i) => this.checkTypeOptionCheckList(r.type) ? <Select
                    value={r.value}
                    mode="tags"
                    style={{ width: "100%" }}
                    placeholder="Value"
                    onChange={e => this.setStateData(e, i, "value")}
                />
                    : ''
            },
            {
                title: t('action'),
                render: (t , r , i)=> <Button
                    danger
                    size="small"
                    icon={<FontAwesomeIcon icon={faTrashAlt}/>}
                    onClick={() => 
                       {
                        this.handleDelete(i) 
                        this.updateMassDelete(i);
                       }
                    }
                />
            }
        ]
        return <>
            <Row>
                <Col span={24}>
                    <DndContext
                        modifiers={[restrictToVerticalAxis]}
                        onDragEnd={(event) => this.onDragEnd(event)}
                    >
                        <SortableContext
                            items={this.state.datas.map((d, i) => i + 1)}
                            strategy={verticalListSortingStrategy}
                        >
                            <Table
                                components={{
                                    body: {
                                        row: Rows,
                                    },
                                }}
                                dataSource={[...this.state.datas]}
                                columns={columns}
                                rowKey={(r, i) => i + 1}
                                pagination={false}
                                loading={this.state.loading}
                            />
                        </SortableContext>
                    </DndContext>
                    {
                    // checkPermission('hr-workflow-update') ? 
                            <Button type="primary" key="create-staff" block onClick={() => this.onClickAddNew()} icon={<FontAwesomeIcon icon={faPlus} />}>
                                &nbsp;{t('add_new')}
                            </Button>
                        // : []
                    }
                </Col>
            </Row>
            {
                true ?
                    <Row gutter={12} className="pt-3 pb-3">
                        <Col span={24} key="bnt-submit" style={{ textAlign: "right" }}>
                            {
                                checkPermission('hr-workflow-update') ?
                                    <Button
                                        type="primary"
                                        icon={<FontAwesomeIcon icon={faSave} />}
                                        // htmlType="submit"
                                        onClick={()=>this.submitFormWorkflow()}
                                        loading={this.state.loading}
                                    >
                                        {t("save")}
                                    </Button>
                                    : ''
                            }
                        </Col>
                    </Row>
                    : []
            }
        </>
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

export default connect(mapStateToProps)(withTranslation()(FormConfig));