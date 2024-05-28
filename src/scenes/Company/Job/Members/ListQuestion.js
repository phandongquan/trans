import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Row, Descriptions, Col, Radio, Modal } from "antd";
import { uniqueId } from 'lodash';
import { Image } from 'antd'
import { checkISO, checkManager, getURLHR, showNotify } from '~/services/helper'
import { CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { removeFile } from '~/apis/company/trainingExamination/staff';
import { URL_HR } from '~/constants';
class ListQuestion extends Component {

    /**
     * Remove file of question
     */
    removeFileOfQuestion = (question_id, value) => {
        Modal.confirm({
            title: 'Confirm',
            icon: <ExclamationCircleOutlined />,
            content: 'Do you want to delete this file?',
            onOk: async () => {
                let { data } = this.props;
                if (!data.detail) {
                    showNotify('Notify', 'Data not found!')
                    return false;
                }
                let params = {
                    'exam_staff_id': data.detail.id,
                    'question_id': question_id,
                    'value': value
                }
                let response = await removeFile(params)
                if (response.status) {
                    showNotify('Notify', 'Success!')
                    this.props.cbReloadData();
                } else {
                    showNotify('Notify', response.message, 'error')
                }
            }
        });
    }

    /**
     * 
     * @param {*} currentAnswer 
     * @param {*} resultAnswer 
     */
    checkResultAnswer = (currentAnswer, resultAnswer) => {
        let result = {
            isChecked: false,
            class: ''
        }

        if (currentAnswer.id == resultAnswer?.answer_id) {
            return {
                isChecked: true,
                class: resultAnswer.is_correct == "1" ? 'correct' : 'in-correct'
            }
        }

        return result;
    }

    /**
     * 
     * @param {*} questions 
     */
    renderQuestions(questions, candidate_result) {
        let returnRender = [];
        let { t } = this.props;
        questions.map((q, i) => {
            let qArr = [];
            let questionResult = candidate_result[i]
            if (typeof q.detail == 'object') {
                q.detail.map((d, ind) => {
                    if (d.id) {
                        qArr.push(
                            <Col sxs={24} sm={24} md={12} lg={12} key={d.id}>
                                <Radio value="a" disabled
                                    style={{ whiteSpace: "normal" }}
                                    checked={this.checkResultAnswer(d, questionResult).isChecked}
                                    className={this.checkResultAnswer(d, questionResult).class}>
                                    {d.content}
                                </Radio>
                            </Col>
                        );
                    }
                })
            }

            returnRender.push(
                <div className="mb-3" key={q.id}>
                    <div>
                        <strong>{`${t('Question')} ${i + 1}: `}</strong>
                        <span>
                            <div dangerouslySetInnerHTML={{ __html: q.content }} />
                        </span>
                    </div>
                    <Row>
                        {qArr}
                    </Row>
                </div>
            );
        });

        return returnRender;
    }

    render() {
        let { data, type } = this.props;
        let { questions, candidate_result } = data;
        if (!questions || !Object.keys(questions).length) {
            return (
                <>
                    <Descriptions title={<p>{data.title}  <small>{(data && data.duration && type === 'preview') ? `(Duration: ${data.duration} minutes)` : ''}</small></p>} className="pt-2" size="small" column={2} />
                    <strong>This training examination have no question. Please add question and try again later!</strong>
                </>
            );
        }
        return (
            <>
                <Descriptions title={<p>{data.title}  <small>{(data && data.duration && type === 'preview') ? `(Duration: ${data.duration} minutes)` : ''}</small></p>} className="pt-2" size="small" column={2} />
                {Object.keys(questions).length ? this.renderQuestions(questions, candidate_result) : []}
            </>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
    };
}
const mapDispatchToProps = (dispatch) => {
    return {};
}
export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ListQuestion));