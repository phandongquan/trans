import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { Row, Divider } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { preview as getPreviewExam } from '~/apis/company/trainingExamination';
import BackButton from '~/components/Base/BackButton';
import ListQuestion from '~/components/Company/TrainingExamination/ListQuestion';
import './config/TrainingExaminationHistory.css';

class TrainingExaminationPreview extends Component {
    /**
     *
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            examData: null,
        };
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        let { id } = this.props.match.params;
        if (id) {
            this.gePreview(id);
        }
    }

    /**
     * Request preview TrainingExamination
     * @param {integer} id 
     */
    async gePreview(id) {
        let response = await getPreviewExam(id);
        if (response.status == 1 && response.data) {
            let { data } = response;
            this.setState({ examData: data });
        } 
    }
  
    /**
     * Show loading button
     */
    enterLoading = () => {
        this.setState({ loading: true });
        setTimeout(() => {
            this.setState({ loading: false });
        }, 1000);
    }

    /**
     * @render
     */
    render() {
        let { examData } = this.state;
        if (!examData) {
            return [];
        }
        let { t } = this.props;

        return (
            <>
                <PageHeader title={t('hr:training_exam')} subTitle={t('hr:preview')} />

                <Row className='card p-3 pt-0'>
                    <ListQuestion data={examData} type="preview" />
                    <Divider className="mt-1 mb-2" />
                    <BackButton url={`/company/training-examination`} />
                </Row>
            </>
        );
    }
}

export default withTranslation()(TrainingExaminationPreview);