import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { Card, Row, Col } from 'antd'

class LatestExamination extends Component{
    render() {
        let { t, type, data } = this.props;
        const lastExam = data[0];
        let examData = lastExam && JSON.parse(lastExam.examination_data);
        if(data.length < 1)
            return [];
        return (
            <Card type="inner" title={<strong className='text-info'>{ type === '1' ? t('THEORY') : t('PRACTICAL') }</strong>} className='mb-3'>
                <Row gutter={12}>
                    <Col span={14}>
                        <Row gutter={12}>
                            <Col span={12}> Correct Answer </Col>
                            <Col span={12}> { examData ? examData.totalCorrectAnswer : 'NA' } </Col>
                        </Row>
                    </Col>
                    <Col span={10}>
                        <Row gutter={12}>
                            <Col span={14}> Total questions </Col>
                            <Col span={10}> { lastExam.examination ? lastExam.examination.number_of_questions : 'NA' } </Col>
                        </Row>
                    </Col>
                </Row>
                <Row gutter={12}>
                    <Col span={14}>
                        <Row gutter={12}>
                            <Col span={12}> Start At </Col>
                            <Col span={12}> { lastExam.start_at ? lastExam.start_at : 'NA' } </Col>
                        </Row>
                    </Col>
                    <Col span={10}>
                        <Row gutter={12}>
                            <Col span={14}> Duration </Col>
                            <Col span={10}> { lastExam.examination ? lastExam.examination.duration : 'NA' }  {t('mins')} </Col>
                        </Row>
                    </Col>
                </Row>
                <Row gutter={12}>
                    <Col span={14}>
                        <Row gutter={12}>
                            <Col span={12}> End At </Col>
                            <Col span={12}> { lastExam.end_at ? lastExam.end_at : 'NA' } </Col>
                        </Row>
                    </Col>
                </Row>
            </Card>
        )
    }
}

export default (withTranslation()(LatestExamination))
