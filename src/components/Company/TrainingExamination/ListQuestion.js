import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Row, Descriptions, Col, Radio, Modal } from "antd";
import { uniqueId } from 'lodash';
import { Link } from 'react-router-dom';
import {Image} from 'antd'
import {checkISO, checkManager, getURLHR, showNotify, parseLinkFromString } from '~/services/helper'
import UploadResultQuestion from './UploadResultQuestion';
import { mineTypeImage, mineTypeVideo } from '~/constants/basic';
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
                if(!data.detail) {
                    showNotify('Notify', 'Data not found!')
                    return false;
                }
                let params = {
                    'exam_staff_id': data.detail.id,
                    'question_id': question_id,
                    'value': value
                }
                let response = await removeFile(params)
                if(response.status) {
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
     * @param {*} questions 
     */
    renderQuestions(questions) {
        let returnRender = [];
        let { t, type, auth: {staff_info} } = this.props;
        questions.map((q, i) => {
            let qArr = [];
            if (typeof q.detail == 'object') {
                q.detail.map((d, ind) => {
                    if (d.id) {
                        if (q.input_type == 3) {
                            qArr.push(
                                <Col xs={24} sm={24} md={12} lg={12}  key={d.id}>
                                    {d.content}
                                </Col>
                            );
                        } else {
                            qArr.push(
                                <Col sxs={24} sm={24} md={12} lg={12} key={d.id}>
                                    <Radio value="a" disabled
                                        style={{ whiteSpace: "normal" }}
                                        checked={type === 'preview' ? (d.is_correct ? 'checked' : '') : (d.is_selected ? 'checked' : '')}
                                        className={
                                            q.input_type == 1 ?
                                                d.is_correct ? 'correct' : !d.is_correct && d.is_selected ? 'in-correct' : ''
                                                :
                                                q.input_type == 2 ?
                                                    d.is_correct && d.is_selected ? 'correct' :
                                                        d.is_correct && !d.is_selected ? 'warning' :
                                                            !d.is_correct && d.is_selected ? 'in-correct' :
                                                                ''
                                                    : ''
                                        }>
                                        {d.content}
                                    </Radio>
                                </Col>
                            );
                        }
                    }else{
                        if(typeof d[0] != 'undefined') {
                            let arrImageVideo = d[0].split(',');
                            let result = [];
                            let duplicateText = 'workplace/workplace';
                            arrImageVideo.map((item, index) => {
                                if (q.input_type == 4){
                                    qArr.push(
                                        <div style={{ position: 'relative' }} key={uniqueId('image__')} className='ml-3 mb-1'>
                                            <Image style={{ objectFit: 'cover' }}  
                                            src={item.includes(URL_HR) ? item.replace(duplicateText, 'workplace') :  getURLHR(item)} 
                                            width={200} 
                                            height={150}/>
                                            { checkISO(staff_info.major_id) || checkManager(staff_info.position_id) ?  
                                                <CloseCircleOutlined 
                                                    onClick={() => this.removeFileOfQuestion(q.id, item)}
                                                    style={{ position: 'absolute', top: '-7px', right: '-7px', backgroundColor: '#fff', borderRadius: 10, fontSize: 20, color: '#afafaf', cursor: 'pointer' }}  
                                                />
                                            : ''}
                                        </div>
                                    )
                                }
                                if (q.input_type == 5){
                                    qArr.push(
                                        <div style={{ position: 'relative' }} key={uniqueId('video__')} className='ml-3 mb-1'>
                                            <video controls style={{ backgroundColor: 'black' }} src={getURLHR(item)} width={200} height={150} />
                                            { checkISO(staff_info.major_id) || checkManager(staff_info.position_id) ?  
                                                <CloseCircleOutlined 
                                                    onClick={() => this.removeFileOfQuestion(q.id, item)}
                                                    style={{ position: 'absolute', top: '-7px', right: '-7px', backgroundColor: '#fff', borderRadius: 10, fontSize: 20, color: '#afafaf', cursor: 'pointer' }}  
                                                />
                                            : ''}
                                        </div>
                                    )
                                }
                                if (q.input_type == 3){
                                    qArr.push(
                                        <div style={{ position: 'relative' }} key={uniqueId('text__')} className='ml-3 mb-1'>
                                            <div
                                                className="block_info_user_task_flow mt-2 pl-2"
                                                style={{ whiteSpace: "pre-wrap" }}
                                                dangerouslySetInnerHTML={{
                                                    __html: parseLinkFromString(item),
                                                }}
                                            />
                                        </div>
                                    )
                                }
                            })
                            qArr.push(
                                <div key={ind}>
                                    {result}
                                </div>
                            )
                        }
                    }
                })

                if(q.type == 2 && (checkISO(staff_info.major_id) || checkManager(staff_info.position_id)) && (q.input_type == 4 || q.input_type == 5)) {
                    qArr.push(
                        <Col xs={24} sm={24} md={6} lg={6} key={q.id}>
                            <UploadResultQuestion 
                                type={q.input_type == 4 ? mineTypeImage : mineTypeVideo}
                                examData={this.props.data}
                                question={q}
                                cbReloadData={() => this.props.cbReloadData()}
                            />
                        </Col>
                    )
                }
            }

            returnRender.push(
                <div className="mb-3" key={q.id}>
                    <div>
                        <strong>{`${t('Question')} ${i + 1}: `}</strong>
                        {/* <span> <small><Link to={`/company/trainning-question/${q.id}/edit`} target='_blank'>{q.code}</Link></small>  - {q.title}</span> */}
                    </div>
                    {q.content ? (<div className='text-inline'>
                        <p dangerouslySetInnerHTML={{ __html: q.content }} />
                    </div>) : null}
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
        let { questions } = data;
        if (!questions || !Object.keys(questions).length) {
            return (
                <>
                    <Descriptions title={
                    <p>{data.title}  <small>{(data && data.duration && type === 'preview') ? `(Duration: ${data.duration} minutes)` : ''}</small></p>} 
                    className="pt-2" size="small" column={2} />
                    <strong>This training examination have no question. Please add question and try again later!</strong>
                </>
            );
        }
        return (
            <>
                <Descriptions title={<p>{data.title}  <small>{(data && data.duration && type === 'preview') ? `(Duration: ${data.duration} minutes)` : ''}</small></p>} className="pt-2" size="small" column={2} />
                {Object.keys(questions).length ? this.renderQuestions(questions) : []}
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