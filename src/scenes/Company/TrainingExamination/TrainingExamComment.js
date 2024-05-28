import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Row, Col, Input, Button } from 'antd'
import { updateResult, updateReview  } from '~/apis/company/trainingExamination/staff';
import { showNotify } from '~/services/helper';

export class TrainingExamComment extends Component {

    constructor(props) {
        super(props);
        this.state = {
            value: ''
        }
    }

    componentDidMount() {
        this.setState({ value: this.props.examData.detail?.note || '' })
    }

    /**
     * @event submitForm comment
     */
     async submitComment() {
        let { value } = this.state;
        let { examData } = this.props;
        let values = {
            // examination_result: examData.detail.examination_result,
            note: value
        }
        let response = await updateReview(examData.detail.id, values);
        if (response.status) {
            showNotify('Notification', 'Success');
            this.props.toggleVisible(false)
            this.props.cbSubmit(value)
        } else {
            showNotify('Notification', response.message, 'error');
        }
    }

    render() {
        let { value } = this.state;
        return (
            <Row>
                <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                    <Input.TextArea rows={5} placeholder='Viết nhận xét'
                        onChange={value => this.setState({ value: value.target.value })}
                        value={value}
                    />
                </Col>
                <Col xs={24} sm={24} md={24} lg={4} xl={4} className='d-flex align-items-end'>
                    <Button type='primary' className='ml-2' onClick={() => this.submitComment()}>Save</Button>
                    {/* <Button className='ml-1' onClick={() => {
                        this.props.toggleVisible(false)
                        this.setState({ value: this.props.examData.detail?.note || '' })
                    }}>Cancel</Button> */}
                </Col>
            </Row>
        )
    }
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(TrainingExamComment)