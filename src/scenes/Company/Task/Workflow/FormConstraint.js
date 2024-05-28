import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next';
import { detail as getDetailWorkflowStep , update as updateWorkflowStep} from '~/apis/company/workflowStep';
import { Button, Row, Col, Input, Form, Divider, Checkbox, Select, Spin, Tooltip } from "antd";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { showNotify } from '~/services/helper';
import Dropdown from '~/components/Base/Dropdown';
import { MinusCircleOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { getList as getListWfConfig } from '~/apis/company/workflowConfig'

export class FormConstraint extends Component {
    /**
     *
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
        };
    }
    componentDidMount(){
        let { bindings, wfConfigs } = this.props;
        this.formRef.current.setFieldsValue({bindings : bindings})
    }
    submitForm(values) {
        let { wfstep , wfConfigs } = this.props
        values.name = wfstep.name
        if (values.bindings.length > 0) {
            values.params = {
                bindings: values.bindings,
                configs: wfstep.params?.configs || {}
            }
            delete values.bindings;
            if (wfstep.id) {
                let xhr = updateWorkflowStep(wfstep.id, values);
                xhr.then(res => {
                    if (res.status){
                        showNotify('Notification' , 'Workflow step updated!')
                    }
                })
                xhr.catch(err => console.log(err))
            }
        }
        
    }
    render() {
        let { bindings, wfConfigs } = this.props;
        const {t} = this.props;
        return (
            <div>
                <Form ref={this.formRef} 
                    className="mt-3"
                    preserve={false}
                    layout="vertical"
                    onFinish={this.submitForm.bind(this)}
                    >
                    <Row gutter={12}>
                        <Col span={24} style={{ backgroundColor: "#f5f5f5", padding: 15 }}>
                            <Form.List name="bindings">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name, ...restField }) => (
                                            <Row gutter={12} key={key}>
                                                <Col span={11}>
                                                    <Form.Item
                                                        className='m-0'
                                                        {...restField}
                                                        name={[name, 'key']}
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: t('select_key'),
                                                            },
                                                        ]}
                                                    >
                                                        <Dropdown datas={{ 'location_id': 'Location' }} defaultOption={t('select_key')} />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={11}>
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'value']}
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: (t('please_select') + (' ') + t('value')),
                                                            },
                                                        ]}
                                                    >
                                                        <Dropdown datas={wfConfigs.locations} defaultOption={t('value')} />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={2}>
                                                    <MinusCircleOutlined className='mt-2' onClick={() => remove(name)} />
                                                </Col>
                                            </Row>
                                        ))}
                                        <Form.Item>
                                            <Button type="dashed" onClick={() => {
                                                add()
                                            }} block icon={<PlusOutlined />}>
                                              {t('add_binding')}
                                            </Button>
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>
                        </Col>
                    </Row>
                    {
                        this.props.checkPermissionEdit ?
                            <div className='mt-2 text-right'>
                                <Button loading={this.state.loading} type="primary" htmlType="submit">{t('save')}</Button>
                            </div>
                            : []
                    }
                </Form>
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

export default connect(mapStateToProps)(withTranslation()(FormConstraint))