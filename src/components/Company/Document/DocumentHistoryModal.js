import React, { Component } from 'react';
import { connect } from "react-redux";
import { Modal, Input, Form, Col, Row } from 'antd';
import { createGlobalStyle } from 'styled-components';
import Dropdown from "~/components/Base/Dropdown";
import Upload from "~/components/Base/Upload";
import {
    mainTypeDocument,
    MAIN_TYPE_DOCUMENT,
} from "~/scenes/Company/Document/config";
import { arrMimeType, typeFilePdf } from "~/constants/basic";
import { URL_HR } from "~/constants";
import SkillDropdown from "~/components/Base/SkillDropdown";
import { showNotify } from '~/services/helper';
import { getDocumentDraft } from '~/apis/company/document/draft';
import { withTranslation } from 'react-i18next';
import { color, time } from 'highcharts';
const { TextArea } = Input;

class DocumentHistoryModal extends Component {
    constructor(props) {
        super(props)
        this.formRefCurrent = React.createRef();
        this.formRefUpdate = React.createRef();
        this.state = {
            fieldDifferent: [],
        };
    }
    componentDidMount() {
        // this.getDocumentDraft();
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.newContent !== this.props.newContent) {
            let { newContent }=this.props;
            newContent.category_id=String(newContent.category_id)
            newContent.skill_id=String(newContent.skill_id)
            this.formRefUpdate.current.setFieldsValue(this.props.newContent)
        }
        if (prevProps.oldContent !== this.props.oldContent) {
            let { oldContent }=this.props;
            oldContent.category_id=String(oldContent.category_id)
            oldContent.skill_id=String(oldContent.skill_id)
            this.formRefCurrent.current.setFieldsValue(this.props.oldContent)
        }
        if (prevProps.documentDraftId !== this.props.documentDraftId) {
            let { oldContent, newContent } = this.props;

            let tempFieldDiff = [];
            Object.keys(newContent).map(keyNewContent => {
                if (Array.isArray(newContent[keyNewContent])) {
                    if (newContent[keyNewContent].join("") != oldContent[keyNewContent].join("")) {
                        tempFieldDiff.push(keyNewContent);
                    }
                } else {
                    if (newContent[keyNewContent] != oldContent[keyNewContent]) {
                        tempFieldDiff.push(keyNewContent);
                    }
                }

            });
            this.setState({ fieldDifferent: tempFieldDiff });
        }
    }
    /**
     * get document draft Form
     */
    getDocumentDraft = () => {
        let { documentId, t } = this.props;
        let data = {
            document_id: documentId,
        };

        let xhr = getDocumentDraft(data);
        xhr.then((response) => {
            if (response.status !== 0) {
                showNotify(t('hr:notification'), 'Get the document draft successfully');
                this.props.hiddenModal()
            } else {
                showNotify(t('hr:notification'), response.message, 'error');
            }
        });

    }

    renderForm = (data = {}, type = "curent") => {
        const {
            baseData: { departments, majors}
        } = this.props;
        const { fieldDifferent } = this.state;
        const {categories, types, listSkill, t} = this.props;
        return (
            <>
                <Row gutter={24}>
                    <Col span={18}>
                        <Form.Item
                            label={t("hr:title")}
                            name="title"
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: "Please input title",
                                },
                            ]}
                        >
                            <Input disabled={true} style={fieldDifferent.includes("title") ? { border: "1px solid #ff6666" } : {}} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            label={t("hr:control_no")}
                            name="document_code"
                            rules={[
                                {
                                    required: true,
                                    message: "Please input Control No.",
                                },
                            ]}
                        >
                            <Input disabled={true} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={8}>
                        <Form.Item
                            label={t("hr:category")}
                            name="category_id"
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: "Please choose category",
                                },
                            ]}
                        >
                            <Dropdown
                                datas={categories}
                                takeZero={false}
                                defaultOption="-- All Categories --"
                                disabled={true}

                                style={fieldDifferent.includes("category_id") ? { border: "1px solid #ff6666" } : {}}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Main type" name="main_type">
                            <Dropdown
                                datas={mainTypeDocument}
                                defaultOption="-- All Main Type --"
                                disabled={true}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label={t("hr:type")}
                            name="type"
                            rules={[
                                {
                                    required: true,
                                    message: "Please chosse type",
                                },
                            ]}
                        >
                            <Dropdown
                                datas={types}
                                defaultOption="-- All Types --"
                                disabled={true}
                                style={fieldDifferent.includes("type") ? { border: "1px solid #ff6666" } : {}}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item label={t("hr:dept")} name="department_id">
                            <Dropdown
                                datas={departments}
                                defaultOption="-- All Departments --"
                                disabled={true}
                                onSelect={() => {
                                    this.formRef.current.setFieldsValue({
                                        skill_id: null,
                                    });
                                }}
                                style={fieldDifferent.includes("department_id") ? { border: "1px solid #ff6666" } : {}}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label={t("hr:major")} name="major_id">
                            <Dropdown
                                mode="multiple"
                                datas={majors}
                                defaultOption="-- All Majors --"
                                disabled={true}
                                onSelect={() => {
                                    this.formRef.current.setFieldsValue({
                                        skill_id: null,
                                    });

                                }}
                                style={fieldDifferent.includes("major_id") ? { border: "1px solid #ff6666" } : {}}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={24}>
                        <Form.Item label={t("hr:skill")} name="skill_id"
                          datas={listSkill}
                        >
                            <SkillDropdown  disabled={true}  style={fieldDifferent.includes("skill_id") ? { border: "1px solid #ff6666" } : {}} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={24}>
                        <Form.Item
                            label="Summary"
                            name="lead"
                            hasFeedback
                            rules={[
                                {
                                    required: true,
                                    message: "Please input summary",
                                },
                            ]}
                        >
                            <TextArea disabled={true} rows={4} style={fieldDifferent.includes("lead") ? { border: "1px solid #ff6666" } : {}}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={24}>
                        <Form.Item
                            name="source_file"
                            label={t("hr:source_file")}
                            valuePropName="source_file"
                            extra="Maximum file size 25MB!"
                        >
                            <Upload
                                extensions={["ppt", "pptx"]}
                                type={arrMimeType}
                                size={25}
                                defaultFileList={
                                    data.source_file
                                        ? [
                                            {
                                                uid: "-1",
                                                name: data.source_file
                                                    ? data.source_file.split("/").pop()
                                                    : "",
                                                status: "done",
                                                url: data.source_file
                                                    ? URL_HR +
                                                    "/production/training/" +
                                                    data.source_file
                                                    : "",
                                            },
                                        ]
                                        : null
                                }

                                style={fieldDifferent.includes("source_file") ? { border: "1px solid #ff6666" } : {}}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={24}>
                    <Col span={24}>
                        <Form.Item
                            name="pdf_file"
                            label="PDF File"
                            valuePropName="pdf_file"
                            extra="Support file PDF. Maximum file size 25MB!"
                        >
                            <Upload
                                type={typeFilePdf}
                                size={25}
                                accept=".pdf"
                                defaultFileList={
                                    data.pdf_file
                                        ? [
                                            {
                                                uid: "-1",
                                                name: data.pdf_file
                                                    ? data.pdf_file.split("/").pop()
                                                    : "",
                                                status: "done",
                                                url: data.pdf_file
                                                    ? URL_HR + "/production/training/" + data.pdf_file
                                                    : "",
                                            },
                                        ]
                                        : null
                                }
                                style={fieldDifferent.includes("pdf_file") ? { border: "1px solid #ff6666" } : {}}

                            />
                        </Form.Item>
                    </Col>
                </Row>
            </>
        )
    }

    render() {
        let { visible,t } = this.props;
        let dataCurrent = this.props.newContent;
        let dataUpdate = this.props.oldContent;
        return (
            <Modal
                title={t("history_document_modal")} open={visible}
                onCancel={() => this.props.hiddenModal()}
                width="80%"
            >
                <Row gutter={24}>
                    <Col span={12} style={{ borderRight: '1px solid #d1d5db' }}>
                        <Form layout='vertical'
                            ref={this.formRefCurrent} >
                            {this.renderForm(dataCurrent, "current")}
                        </Form>

                    </Col>
                    <Col span={12}>
                        <Form layout='vertical'
                            ref={this.formRefUpdate}>
                            {this.renderForm(dataUpdate, "update")}
                        </Form>
                    </Col>

                </Row>

            </Modal>

        )
    }
}

const mapStateToProps = (state) => ({
    auth: state.auth.info,
    baseData: state.baseData,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(DocumentHistoryModal))