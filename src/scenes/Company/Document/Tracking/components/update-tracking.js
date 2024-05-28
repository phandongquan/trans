import React, { Component } from 'react';
import { Modal, Input, Form, DatePicker, Checkbox } from 'antd';
import { dateFormat } from '~/constants/basic';
import dayjs from 'dayjs';

const { TextArea } = Input;

class UpdateTrackingModal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            checked: false
        }
        this.formRef = React.createRef();
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps) {
        const { visible, trackingDetail } = this.props;
        if (visible !== prevProps.visible) {
            if (visible) {
                const fromDate = trackingDetail.from_date ? dayjs(trackingDetail.from_date) : null
                const toDate = trackingDetail.to_date ? dayjs(trackingDetail.to_date) : null

                this.formRef.current.setFieldsValue({
                    summary: trackingDetail.summary,
                    date: [fromDate, toDate]
                });
                this.setState({ checked: trackingDetail.is_comment })
            }
        }
    }

    onSubmit = () => {
        const { onOk, trackingDetail } = this.props
        let values = this.formRef.current.getFieldsValue();
        let fromDate = values.date[0] ? new Date(values.date[0]).toISOString() : null
        let toDate = values.date[1] ? new Date(values.date[1]).toISOString() : null

        values.from_date = fromDate
        values.to_date = toDate
        values.is_comment = this.state.checked ? true : false
        delete values.date

        values = {
            ...values,
            document_id: trackingDetail.document_id,
            times: trackingDetail.times,
            summary: values.summary,
            status: 1,
        }

        onOk(values)
    }

    resetState = () => {
        this.setState({ checked: false })
        this.formRef.current.resetFields()
    }

    render() {
        let { visible, onCancel } = this.props;
        return (
            <Modal
                title="Create Communication"
                key={"create-communication"}
                open={visible}
                onCancel={() => onCancel()}
                afterClose={() => this.resetState()}
                width={700}
                onOk={() => this.onSubmit()}
            >
                <div>
                    <Form ref={this.formRef}>
                        <Form.Item name='date' >
                            <DatePicker.RangePicker
                                style={{ width: '100%' }}
                                format={dateFormat}
                                disabledDate={current => {
                                    return current && current < dayjs().subtract(1, 'day')
                                }}
                            />
                        </Form.Item>
                        <Form.Item
                            name="summary"
                            rules={[{ required: true, message: 'Please input summary!' }]}
                        >
                            <TextArea rows={4} />
                        </Form.Item>
                        <Form.Item
                            label="Is Comment"
                            name="is_comment"
                        >
                            <Checkbox
                                checked={this.state.checked}
                                onChange={() => this.setState({ checked: !this.state.checked })}
                            />
                        </Form.Item>
                    </Form>
                </div>
            </Modal>
        )
    }
}

export default UpdateTrackingModal;
