import React, { Component } from 'react';
import { Button, Checkbox, Input, Modal, Radio, Spin, Typography } from 'antd';
import './configs/popup_generate.scss';
import { generate, fetchDocument } from '~/apis/company/document/generate_ai';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { showMessage } from '~/services/helper';
import { create } from '~/apis/company/TrainningQuestion/index';
import { isArray } from 'lodash';


const { Paragraph } = Typography;
const STRUCTURE_CODE = "GENERATE_AI";
const MAX_SELECT_PAGE = 5;
class PopupGenerate extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loadingGenerate: false,
            inputText: [],
            response: null,
            visibleEditContent: false,
            loading: true,
            pages: [],
            resultPage: [],
            isReview: false
        }
        this.windowRef = React.createRef();
    }

    componentDidMount() {
        const { chapter } = this.props;
        if (chapter) {
            const fileURL = chapter?.link;
            // const fileURL = "https://wshr.hasaki.vn/production/training/23/07/21/LOG-QD-003-QuyDinhNghiepVuShipperGiaoHangNhanh-PhienBan05_163406.pdf";
            fetchDocument({ file: fileURL, list_page: 'all' }).then(res => {
                let { result } = res;
                if (isArray(result) && result.length > 0) {
                    result = result.sort((a, b) => a.page - b.page);
                }
                this.setState({ loading: false, resultPage: result, isReview: true });
            })
        }
    }

    resetState = () => {
        this.setState({
            loadingGenerate: false,
            inputText: [],
            response: null,
            visibleEditContent: false,
            loading: true
        })
    }

    componentDidUpdate(prevProps) {
    }

    processFile = (pdf) => {
        return new Promise((resolve, reject) => {
            const totalPage = pdf.numPages;
            const pagesText = []
            for (let i = 0; i < totalPage; i++) {
                const currentPage = i + 1;
                pdf.getPage(currentPage).then(async function (page) {
                    const content = await page.getTextContent();
                    const { items } = content;
                    const text = items.map((item) => item.str).join(" ");
                    pagesText.push(text);

                    const lastPage = pagesText.length;
                    if (lastPage === totalPage) {
                        resolve(pagesText)
                    }
                });
            }
        })
    }

    /**
     * Render content
     */
    renderContent() {
        let { chapter } = this.props;
        let fileURL = chapter?.link;
        // let fileURL = "https://wshr.hasaki.vn/production/training/23/07/21/LOG-QD-003-QuyDinhNghiepVuShipperGiaoHangNhanh-PhienBan05_163406.pdf";
        return (
            < iframe
                width='100%'
                height='100%'
                src={fileURL}
                title='pdf'
            />
        )
    }

    shuffle = (array = []) => {
        let currentIndex = array.length, randomIndex;

        // While there remain elements to shuffle.
        while (currentIndex > 0) {

            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    setEditableStrQuestion = (str, index) => {
        if (!str) return;
        const { response } = this.state;
        const { new_list_question = [] } = response;
        new_list_question[index].question = str;
        this.setState({ response });
    }

    setEditableStrAnswer = (str, i, j) => {
        if (!str) return;
        const { response } = this.state;
        const { new_list_question = [] } = response;
        new_list_question[i].answers[j].text = str;
        this.setState({ response });
    }

    onDeleteQuestion = (i) => {
        const { response } = this.state;
        const { new_list_question = [] } = response;
        new_list_question.splice(i, 1);
        this.setState({
            response: {
                ...response,
                new_list_question: new_list_question
            }
        });
    }

    onDelete = (i, j) => {
        const { response } = this.state;
        const { new_list_question = [] } = response;
        const answer = new_list_question[i].answers[j];
        if (answer.isCorrect) {
            showMessage("Bạn không thể xóa đáp án đúng", "error");
            return;
        }
        const totalAnswer = new_list_question[i].answers.length;
        if (totalAnswer <= 2) {
            showMessage("Số lượng đáp án phải lớn hơn 2", "error");
            return;
        }

        let newAnswers = new_list_question[i].answers.filter((item, index) => index !== j);
        new_list_question[i].answers = newAnswers;
        this.setState({
            response: {
                ...response,
                new_list_question: new_list_question
            }
        });
    }

    onChangeRadio = (e, i) => {
        const { response } = this.state;
        const { new_list_question = [] } = response;

        const answer = new_list_question[i].answers[e.target.value];
        new_list_question[i].answers[e.target.value] = {
            ...answer,
            isCorrect: true
        }

        //set all of answer isCorrect = false
        new_list_question[i].answers.map((item, index) => {
            if (index !== e.target.value) {
                item.isCorrect = false;
            }
        })

        this.setState({ response });
    }

    renderQuestion = (item, index) => {
        const { answers = [] } = item;
        const defaultValueIdx = answers.findIndex(item => item.isCorrect);
        return <div className='question' key={index}>
            <div className='d-flex question_text'>
                <Paragraph
                    className='question_title'
                    editable={{
                        triggerType: 'text',
                        onChange: (str) => this.setEditableStrQuestion(str, index)
                    }}
                >
                    {item.question}
                </Paragraph>
                {" "}
                <Button className='delete_btn' type='link' danger onClick={() => this.onDeleteQuestion(index)} >
                    <DeleteOutlined />
                </Button>
            </div>
            <div>
                <Radio.Group
                    value={defaultValueIdx}
                    onChange={(e) => this.onChangeRadio(e, index)}
                >
                    {answers.map((ans, j) => {
                        return <Radio
                            key={j}
                            name={`radio_${index}`}
                            value={j}
                            className='answer_radio'
                        >
                            <div key={j} className='answer d-flex' >
                                <Paragraph
                                    className='answer_title'
                                    editable={{
                                        triggerType: 'text',
                                        tooltip: false,
                                        onChange: (str) => this.setEditableStrAnswer(str, index, j)
                                    }}
                                >
                                    {ans.text}
                                </Paragraph>
                                {" "}
                                <Button className='delete_btn' type='link' danger onClick={() => this.onDelete(index, j)} >
                                    <DeleteOutlined />
                                </Button>
                            </div>
                        </Radio>
                    })}
                </Radio.Group>
            </div>
        </div>
    }

    renderResponse() {
        const { response } = this.state;
        if (!response) return null;
        const { new_list_question = [] } = response;
        return new_list_question.map((item, index) => {
            return this.renderQuestion(item, index);
        })
    }

    generateAI() {
        const { inputText } = this.state;
        this.setState({ loadingGenerate: true, response: null });
        const params = {
            content: inputText
        }
        generate(params).then(res => {
            const { list_question = [] } = res;
            const newListQuestion = [];

            list_question.map((item, index) => {
                const answers = [];
                item.wrong_answer.map((item, index) => {
                    const answer = {
                        text: item,
                        isCorrect: false
                    }
                    answers.push(answer);
                })

                const answer = {
                    text: item.correct_answer,
                    isCorrect: true
                }

                let newAnswers = this.shuffle([...answers, answer]);
                newListQuestion.push({
                    question: item.question,
                    answers: newAnswers
                })
            })

            let response = {
                ...res,
                new_list_question: newListQuestion
            }
            this.setState({ loadingGenerate: false, response: response });
        }).catch(err => {
            this.setState({ loadingGenerate: false });
        })
    }

    renderText = (text, resize) => {
        if (text?.length > resize) {
            return text.substring(0, resize) + "...";
        }

        return text;
    }
    save = () => {
        const getContent = () => {
            const { documentId } = this.props;
            const { response } = this.state;
            const { new_list_question = [] } = response;
            const datas = new_list_question.map((item, index) => {
                const dateNow = Date.now().toString();
                let params = {
                    "title": item.question,
                    "code": `${STRUCTURE_CODE}_${dateNow}_${index}`,
                    "type": 1,
                    "input_type": 1,
                    "is_required": 0,
                    "status": 3,
                    "document_id": documentId,
                    "level": 1,
                    "content": item.question,
                    "answer": item.answers.map((ans, j) => {
                        return {
                            "id": null,
                            "content": ans.text,
                            "is_correct": ans.isCorrect ? 1 : 0,
                        }
                    })
                }
                return params;
            })

            return datas;
        }

        const datas = getContent();
        if (!datas.length) {
            showMessage("Vui lòng tạo câu hỏi", "error");
            return;
        }
        
        this.createDatas(datas).then(res => {
            showMessage("Lưu thành công", "success");
            // this.props.hidePopup();
            // this.resetState();

        }).catch(err => {
            showMessage("Lưu thất bại", "error");
        })
    }

    createDatas = datas => {
        return new Promise((resolve, reject) => {
            const promises = datas.map(item => {
                return create(item);
            })

            Promise.all(promises).then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            })
        })
    }

    onCheck = (value) => {
        if (value.length > MAX_SELECT_PAGE) {
            showMessage(`Bạn chỉ được chọn tối đa ${MAX_SELECT_PAGE} trang`, "error");
            return;
        }

        this.setState({ pages: value })
    }

    render() {
        const { loadingGenerate, response, inputText, visibleEditContent, loading, resultPage, pages, isReview } = this.state;
        return (
            <Modal
                title='Title'
                visible={this.props.visible}
                onCancel={this.props.hidePopup}
                width='70%'
                okButtonProps={{ style: { display: 'none' } }}
                footer={
                    <div className='hub_actions' >
                        {
                            <>
                                <Button
                                    className='cancel_btn'
                                    danger
                                    loading={loadingGenerate}
                                    onClick={() => this.props.hidePopup()}>
                                    Cancel
                                </Button>
                                {
                                    !isReview && !response && (
                                        <Button
                                            className='back_btn'
                                            type='primary'
                                            loading={loadingGenerate}
                                            onClick={() => this.setState({ isReview: true, pages: [] })}>
                                            Back
                                        </Button>
                                    )
                                }
                                {
                                    !isReview && (
                                        <Button
                                            className='generate_btn'
                                            type='primary'
                                            loading={loadingGenerate}
                                            onClick={() => this.generateAI()}>
                                            {
                                                !response ? 'Generate AI' : 'Generate Again'
                                            }
                                        </Button>
                                    )
                                }
                                {
                                    isReview && (
                                        <Button
                                            className='review_btn'
                                            type='primary'
                                            loading={loadingGenerate}
                                            onClick={() => {
                                                const { pages } = this.state;
                                                if (!pages.length) {
                                                    showMessage("Vui lòng chọn trang", "error");
                                                    return;
                                                }

                                                let text = ""
                                                if (!pages.length) {
                                                    showMessage("Vui lòng chọn trang", "error");
                                                    return;
                                                }

                                                text = resultPage.filter(item => pages.includes(item.page)).map(item => item.content).join(" ");
                                                this.setState({ inputText: text, visibleEditContent: false, isReview: false })
                                            }
                                            }>
                                            Review
                                        </Button>
                                    )
                                }
                                {
                                    response && (
                                        <Button
                                            className='save_btn'
                                            type='primary'
                                            loading={loadingGenerate}
                                            onClick={() => this.save()}>
                                            Save
                                        </Button>
                                    )
                                }
                            </>
                        }
                    </div>
                }
            >
                <div id='body_generate' >
                    <div className='left'>
                        {this.renderContent()}
                    </div>
                    <div className='right'>
                        <Spin spinning={loading}>
                            <div className='mt-1'>
                                {
                                    !response ? (
                                        <div>
                                            <div className='d-flex' >
                                                <h2 className='mt-1'>
                                                    Xem lại nội dung trước khi tạo
                                                </h2>
                                                {
                                                    pages.length ? (
                                                        <span
                                                            className='edit_content'
                                                            onClick={() => this.setState({ visibleEditContent: !visibleEditContent })}
                                                        >
                                                            <EditOutlined />
                                                        </span>
                                                    ) : null
                                                }
                                            </div>
                                            {
                                                !isReview ? (
                                                    visibleEditContent ? (
                                                        <div>
                                                            <Input.TextArea
                                                                value={inputText}
                                                                onChange={(e) => this.setState({ inputText: e.target.value })}
                                                                placeholder='Nhập nội dung'
                                                                style={{ width: '100%', height: window.innerHeight - 300 }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className='mt-1' >
                                                            {this.renderText(inputText, 1000)}
                                                        </div>
                                                    )
                                                ) : (
                                                    <div>
                                                        <Checkbox.Group
                                                            onChange={(value) => this.onCheck(value)}
                                                            value={pages}
                                                        >
                                                            {
                                                                resultPage.map((item, index) => {
                                                                    return <Checkbox key={index} value={item.page} ><strong>Page {item.page}: </strong>{item.content}</Checkbox>
                                                                })
                                                            }
                                                        </Checkbox.Group>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    ) : this.renderResponse()
                                }
                            </div>
                        </Spin>
                    </div>
                </div >
            </Modal >
        )
    }

}

export default (PopupGenerate)