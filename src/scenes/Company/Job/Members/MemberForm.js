import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Row, Col, Spin, Form, Input, Divider, Button, InputNumber, Space } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { create as apiCreate, update as apiUpdate, detail as apiMemberDetail, upload as apiUploadFile } from '~/apis/company/job/member';
import Dropdown from '~/components/Base/Dropdown';
import { genders, staffStatus as arrStatus } from '~/constants/basic';
import ReactQuill from 'react-quill';
import { RollbackOutlined, LoadingOutlined } from '@ant-design/icons';
import Upload from '~/components/Base/Upload';
import { convertToFormData, showNotify } from '~/services/helper';
import { getList as apiGetListBasic } from '~/apis/company/job/basic';
import EventSourceSingleton from '~/apis/ai/event';
import { WS_URL_TUYENDUNG } from '~/constants';

const mappingTable = {
    "_name": null,
    "_number": null,
    "_of": null,
    "_birth": null,
    "```": null,
    "json": null,
    "": null,
    ":::NEXT_LINE:::": null,
    "{": null,
    "}": null,
    '"': null,
    ' "': null,
    '":': null,
    '",': null,
    ',': null,
    "_of": null,
    "_experience": null,
    '["': null,
    '],': null,
};

const mappingTableV2 = {
    "_name": null,
    "_number": null,
    "_of": null,
    "_birth": null,
    "```": null,
    "json": null,
    "": null,
    "{": null,
    "}": null,
    '"': null,
    ' "': null,
    '":': null,
    '",': null,
    ',': null,
    "_of": null,
    "_experience": null,
    '["': null,
    '],': null,
}

const mappingKeyTable = {
    "first": "firstname",
    "last": "lastname",
    "phone": "phone",
    "date": "dateofbirth",
    'email': "email",
    'sexual': 'gender',
    "address": "address",
    "title": "resume_title",
    "years": "yearofexperience",
    "education": "education",
    "certificate": "certificate",
    "experience": "experience",
    "skill": "skill",
}

const arrayKey = [
    'education',
    'experience',
    'skill',
    'certificate',
]

class MemberForm extends Component {

    /**
     * @lifecycle
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            summary: '',
            experiences: '',
            educations: '',
            skills: '',
            references: '',
            defaultFile: [],
            file_link: [],
            messagesEvent: [],
            currentKey: null,
            file_link_url: null,

            //for test
            objectData: {
                "education": "",
                "experience": "",
                "skill": "",
                "certificate": "",
            },
            summaryDocument: '',
            loadingProcess: false,
        }
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        this.getBasic();
        this.formRef.current.setFieldsValue({
            gender: 1,
            status: 1,
            salary_unit: 'ltt'
        });
        let { id } = this.props.match.params;
        if (id) this.getDetailMember(id);
    }

    async getBasic() {
        let response = await apiGetListBasic();
        if (response.status) {
            let { data } = response;
            this.setState({ cities: data.locations, levels: data.levels, degrees: data.degrees })
        }
    }

    resetState = () => {
        this.setState({
            summary: '',
            experiences: '',
            educations: '',
            skills: '',
            references: '',
            defaultFile: [],
            file_link: [],
            messagesEvent: [],
            currentKey: null,
            file_link_url: null,
            objectData: {
                "education": "",
                "experience": "",
                "skill": "",
                "certificate": "",
            },
            summaryDocument: '',
        })
        this.formRef.current.resetFields();
    }

    /**
     * Call api get detail candidate
     * @param {} id 
     */
    async getDetailMember(id) {
        let response = await apiMemberDetail(id);
        if (response.status) {
            let { member } = response.data;
            let defaultFile = [];
            if (member.file_link) {
                defaultFile = [{
                    uid: '1',
                    name: member.file_link,
                    status: 'done',
                    url: member.file_link,
                }]
            }

            let keyNeedFormat = ['gender', 'status', 'current_degree_id', 'current_level_id', 'level_id', 'yearofexperience', 'salary_from', 'salary_to']
            Object.keys(member).map(key => {
                if (keyNeedFormat.includes(key) && member[key] == 0) {
                    member[key] = null;
                }
                if (key == 'salary_unit' && !member[key]) {
                    member[key] = 'ltt'
                }
            })

            this.setState({
                summary: typeof member.summary != 'undefined' ? member.summary : '',
                experiences: typeof member.experiences != 'undefined' ? member.experiences : '',
                educations: typeof member.educations != 'undefined' ? member.educations : '',
                skills: typeof member.skills != 'undefined' ? member.skills : '',
                references: typeof member.references != 'undefined' ? member.references : '',
                defaultFile: defaultFile
            })
            this.formRef.current.setFieldsValue(member)
        }
    }

    /**
     * @event sumbit Form
     */
    submitForm = (values) => {
        this.setState({ loading: true })
        let { t } = this.props;
        let { id } = this.props.match.params;
        let { summary, experiences, educations, skills, references, file_link_url } = this.state;
        let xhr, message;

        values = {
            ...values,
            summary, experiences, educations, skills, references,
        }

        Object.keys(values).map(key => {
            if (['degree_id', 'level_id', 'yearofexperience'].includes(key)) values[key] = values[key] ? values[key] : 0;
            if (values[key] == undefined) delete (values[key]);
        });

        let datas = convertToFormData(values)

        // if (this.state.file_link.length > 0) {
        //     datas.append('Upload[resume_file]', this.state.file_link[0])
        // }

        if (file_link_url) {
            datas.append('file_link', file_link_url)
        }

        if (id) {
            xhr = apiUpdate(id, datas);
            datas.append('_method', 'PUT');
            message = t('Updated member')
        } else {
            xhr = apiCreate(datas);
            message = t('Created member')
        }

        xhr.then((response) => {
            if (response.status != 0) {
                this.setState({ loading: false })
                showNotify(t('Notification'), message, 'success', 5, () => {
                    if (!id) {
                        this.props.history.push("/company/job/members")
                    }
                });
            } else {
                showNotify(t('Notification'), response.message, 'error');
            }
        });
    }

    isWhitespace(str) {
        return str.trim() === '';
    }

    subscribeEvent = ({ url }) => {
        const instance = EventSourceSingleton.getInstance({ url: url });
        this.setState({ loadingProcess: true })
        instance.onmessage = (e) => {
            const { data } = e;
            const { summaryDocument, currentKey } = this.state;
            this.setState({ summaryDocument: summaryDocument + data })
            const value = mappingTable[data];
            if (value !== null && !this.isWhitespace(data)) {
                const key = mappingKeyTable[data]
                if (key) {
                    this.setState({ currentKey: mappingKeyTable[data] })
                } else {
                    if (currentKey && !arrayKey.includes(currentKey)) {
                        let currentValue = this.formRef.current.getFieldValue(currentKey);
                        let newValue = currentValue ? currentValue + data : data;
                        this.formRef.current.setFieldsValue({ [currentKey]: newValue })
                    }
                }
            }

            const valueV2 = mappingTableV2[data];
            if (valueV2 !== null && !this.isWhitespace(data)) {
                const key = mappingKeyTable[data]
                if (!key) {
                    if (currentKey && arrayKey.includes(currentKey)) {
                        let newData = data.replace(/["'[\],]*/g, '');
                        if (newData === ":::NEXT_LINE:::") {
                            newData = "<br/>";
                        }
                        const { objectData } = this.state;
                        switch (currentKey) {
                            case 'education':
                                let updatedEducation = objectData.education;
                                updatedEducation = updatedEducation + newData;
                                this.setState({ objectData: { ...objectData, education: updatedEducation } })
                                break;
                            case 'experience':
                                let updatedExperience = objectData.experience;
                                updatedExperience = updatedExperience + newData;
                                this.setState({ objectData: { ...objectData, experience: updatedExperience } })
                                break;
                            case 'skill':
                                let updatedSkill = objectData.skill;
                                updatedSkill = updatedSkill + newData;
                                this.setState({ objectData: { ...objectData, skill: updatedSkill } })
                                break;
                            case 'certificate':
                                let updatedCertificate = objectData.certificate;
                                updatedCertificate = updatedCertificate + newData;
                                this.setState({ objectData: { ...objectData, certificate: updatedCertificate } })
                                break;
                            default:
                                break;
                        }
                    }
                }
            }

        }
        instance.onerror = (err) => {
            const { objectData, summaryDocument } = this.state;
            this.setState({ loadingProcess: false })
            Object.keys(objectData).map(key => {
                let value = objectData[key];
                switch (key) {
                    case 'education':
                        this.setState({ educations: value })
                        break;
                    case 'experience':
                        this.setState({ experiences: value })
                        break;
                    case 'skill':
                        this.setState({ skills: value })
                        break;
                    case 'certificate':
                        this.setState({ certificates: value })
                        break;
                    default:
                        break;
                }

                return null;
            })

            console.log({ summaryDocument })
            showNotify("Notification", "Import data thành công, vui lòng kiểm tra lại dữ liệu !", 'success');
            EventSourceSingleton.removeInstance();
        }
    }

    onUploadFile = (files) => {
        if (files.length === 0) return;
        this.resetState();
        const file = files[0];

        const formData = new FormData();
        formData.append('Upload[resume_file]', file);

        apiUploadFile(formData).then((response) => {
            const { data: { file_link } } = response;
            if (file_link) {
                this.setState({ file_link_url: file_link })
                const url = WS_URL_TUYENDUNG + file_link;
                this.subscribeEvent({ url: url });
            }
        });
    }

    render() {
        let { t, baseData: { majors } } = this.props;
        let { id } = this.props.match.params;
        let title;
        if (id) {
            title = t('Edit Member')
        } else {
            title = t('Create Member')
        }
        return (
            <div id='page_edit_member'>
                <PageHeader title={title} />
                <Row className='card pl-3 pr-3 mb-3'>
                    <Col span={24}>
                        <Spin spinning={this.state.loading}>
                            <Form ref={this.formRef}
                                name="upsertStaffForm"
                                className="ant-advanced-search-form pt-3"
                                layout="vertical"
                                onFinish={this.submitForm.bind(this)}
                            >
                                <Space
                                    size={20}
                                    className='mb-3'
                                >
                                    <h5 className='title-member-form'>{t('PERSONAL INFORMATION')}</h5>
                                    <Spin
                                        indicator={<LoadingOutlined spin />}
                                        spinning={this.state.loadingProcess}
                                    />
                                </Space>
                                <Divider className="m-0" />
                                <Row gutter={24} className='mt-1' >
                                    <Col span={24}>
                                        <Form.Item
                                            label={t('Attachment')}
                                            valuePropName="fileList"
                                            extra={t('Support file PDF. Maximum file size 2MB!')}>
                                            <Upload
                                                defaultFileList={this.state.defaultFile}
                                                onChange={(value) => {
                                                    this.onUploadFile(value)
                                                }}
                                                onRemove={(value) => this.resetState()}
                                                type={['application/pdf']}
                                                size={2}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={12} className='mt-1'>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                        <Form.Item
                                            name="firstname"
                                            label={t('First Name')}
                                            hasFeedback
                                            rules={[{ required: true, message: t('Please input firs tname') }]}>
                                            <Input placeholder="First Name" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                        <Form.Item
                                            name="lastname"
                                            label={t('Last Name')}
                                            hasFeedback
                                            rules={[{ required: true, message: t('Please input last name') }]}>
                                            <Input placeholder="Last name" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                        <Form.Item name="identity" label={t('Identity')}>
                                            <Input placeholder="Identity" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                        <Form.Item
                                            name="gender"
                                            label={t('Gender')}
                                            hasFeedback
                                            rules={[{ required: true, message: t('Select gender') }]}>
                                            <Dropdown datas={genders} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={12}>
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                        <Form.Item
                                            name="email"
                                            label={t('Email')}
                                            hasFeedback
                                            rules={[
                                                {
                                                    type: 'email',
                                                    message: 'The input is not valid E-mail!',
                                                },
                                                {
                                                    required: true,
                                                    message: 'Please input your Email!',
                                                },
                                            ]}>
                                            <Input placeholder="Email" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                        <Form.Item
                                            name="phone"
                                            label={t('Phone')}
                                            hasFeedback
                                            rules={[{ required: true, message: t('Please input phone') }]}>
                                            <Input placeholder="Phone" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                        <Form.Item
                                            name="status"
                                            label={t('Status')}
                                            hasFeedback
                                            rules={[{ required: true, message: t('Select status') }]}>
                                            <Dropdown datas={arrStatus} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col span={24}>
                                        <Form.Item
                                            name='address'
                                            label={t('Address')}
                                            hasFeedback
                                            rules={[{ required: true, message: t('Please input phone') }]}
                                        >
                                            <Input placeholder={t('Address')} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Divider />
                                <Row gutter={24}>
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                        <Form.Item
                                            name='resume_title'
                                            label={t('Expected Job Title')}
                                            hasFeedback
                                            rules={[{ required: true, message: t('Select gender') }]}>
                                            <Input placeholder={t('Expected Job Title')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                        <Form.Item name='current_degree_id' label={t('Degree')}>
                                            <Dropdown datas={this.state.degrees} defaultOption={t('Degree')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                        <Form.Item name='level_id' label={t('Level')}>
                                            <Dropdown datas={this.state.levels} defaultOption={t('Level')} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col span={12} xs={24} sm={24} md={24} lg={6} xl={6}>
                                        <Form.Item
                                            name='industries'
                                            label={t('Industries')}
                                            hasFeedback
                                            rules={[{ required: true, message: t('Select industries') }]}>
                                            <Dropdown datas={majors} mode='multiple' />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                        <Form.Item name='locations' label={t('Expected Locations')}>
                                            <Dropdown datas={this.state.cities} mode='multiple' />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                                        <Form.Item name='current_position' label={t('Current Position')}>
                                            <Input placeholder={t('Current Position')} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                                        <Form.Item name='yearofexperience' label={t('Years Of Experience')}>
                                            <Input type='number' placeholder={t('Years Of Experience')} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                                        <Form.Item label={t('Salary Unit')} name='salary_unit'>
                                            <Dropdown datas={{ 'ltt': 'Negotiable', 'lct': 'Competition', 'vnd': 'VND' }} />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={9} xl={9}>
                                        <Form.Item label={t('Salary From')} name='salary_from' rules={[
                                            {
                                                pattern: /^(?:\d*)$/,
                                                message: "Value should contain just number",
                                            },
                                            {
                                                pattern: /^[\d]{0,9}$/,
                                                message: "Value should be less than 9 character",
                                            },
                                        ]}>
                                            <InputNumber
                                                formatter={(value) => `VND ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                                parser={(value) => value.replace(/\VND\s?|(,*)/g, "")}
                                                style={{ width: '100%' }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={24} md={24} lg={9} xl={9}>
                                        <Form.Item label={t('Salary To')} name='salary_to' rules={[
                                            {
                                                pattern: /^(?:\d*)$/,
                                                message: "Value should contain just number",
                                            },
                                            {
                                                pattern: /^[\d]{0,9}$/,
                                                message: "Value should be less than 9 character",
                                            },
                                        ]}>
                                            <InputNumber
                                                formatter={(value) => `VND ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                                parser={(value) => value.replace(/\VND\s?|(,*)/g, "")}
                                                style={{ width: '100%' }}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col span={24}>
                                        <Form.Item name='languages' label={t('Languages')}>
                                            <Input.TextArea rows={2} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col span={24}>
                                        <Form.Item label={t('Career Objective')}>
                                            <ReactQuill
                                                style={{ height: 200, marginBottom: 40 }}
                                                value={this.state.summary}
                                                onChange={(value) => this.setState({ summary: value })}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col span={24}>
                                        <Form.Item label={t('Experience')}>
                                            <ReactQuill
                                                style={{ height: 200, marginBottom: 40 }}
                                                value={this.state.experiences}
                                                onChange={(value) => this.setState({ experiences: value })}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col span={24}>
                                        <Form.Item label={t('Education')}>
                                            <ReactQuill
                                                style={{ height: 200, marginBottom: 40 }}
                                                value={this.state.educations}
                                                onChange={(value) => this.setState({ educations: value })}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col span={24}>
                                        <Form.Item label={t('Skill')}>
                                            <ReactQuill
                                                style={{ height: 200, marginBottom: 40 }}
                                                value={this.state.skills}
                                                onChange={(value) => this.setState({ skills: value })}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24}>
                                    <Col span={24}>
                                        <Form.Item label={t('References')}>
                                            <ReactQuill
                                                style={{ height: 200, marginBottom: 40 }}
                                                value={this.state.references}
                                                onChange={(value) => this.setState({ references: value })}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Divider className="m-0" />
                                <Row gutter={24} className="pt-3">
                                    <Col span={12} key='btn-back'>
                                        <Form.Item>
                                            <Button type="primary" htmlType="submit">Submit</Button>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12} key='bnt-submit' style={{ textAlign: "right" }}>
                                        <Form.Item>
                                            <Button type="default" icon={<RollbackOutlined />}
                                                onClick={() => this.props.history.push("/company/job")}>
                                                Cancel
                                            </Button>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form>
                        </Spin>
                    </Col>
                </Row>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    };
}
const mapDispatchToProps = (dispatch) => {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(MemberForm));