import React, { Component } from 'react'
import { connect } from 'react-redux'
import UploadMultiple from '~/components/Base/UploadMultiple';
import { Button, Spin } from 'antd';
import { updateResultFormData  } from '~/apis/company/trainingExamination/staff';
import { showNotify, convertToFormData } from '~/services/helper';

export class UploadResultQuestion extends Component {

    constructor(props) {
        super(props)
        this.uploadRef = null;
        this.state = {
            loading: false
        }
    }

    /**
     * Upload result training
     */
    uploadResultTraining = async () => {
        this.setState({ loading: true })
        let values = this.uploadRef.getValues();
        if(values.fileList.length) {
            let { examData, question } = this.props;
            let formData = convertToFormData({examination_result: examData.detail.examination_result});
            formData.append(`_method`, 'PUT')
            values.fileList.map(f => formData.append(`results[${question.id}][]`, f))
            let response = await updateResultFormData(examData.detail.id, formData);
            if (response.status) {
                showNotify('Notification', 'Success');
                this.props.cbReloadData();
                this.uploadRef.resetForm();
            } else {
                showNotify('Notification', response.message, 'error');
            }
        }
        this.setState({ loading: false })
    }

    render() {
        let { type } = this.props;

        return (
            <div className='ml-2 mb-1'>
                <Spin spinning={this.state.loading}>
                    <UploadMultiple
                        type={type}
                        size={100}
                        onRef={ref => { this.uploadRef = ref }}
                    />
                    <Button className='ml-2 mt-2' type='primary' onClick={() => this.uploadResultTraining()}>Save</Button>
                </Spin>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(UploadResultQuestion)