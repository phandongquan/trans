import React, { Component } from 'react'
import { create as apiCreate, update as apiUpdate, detail as apiDetail } from '~/apis/aiLogIssue'
import { Button, Row, Col, Input, Form, Spin ,Upload  } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faBackspace  } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import Dropdown from '~/components/Base/Dropdown';
import { showNotify,} from '~/services/helper';
import { UploadOutlined } from '@ant-design/icons';
import { getURLHR } from '~/services/helper';
import { LogIssueType } from '../../constants/basic';

class logIssueForm extends Component {
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            file :'',
            fileList: [], // File upload
            historyFileList: [], // File from history model
            removeFileList: [] // File will be remove
        };
    }
    /**
     * @lifecycle
     */
    componentDidMount() {
        this.getDetail();
    }
    /**
         * @handle before upload
         * 
         * @return false will default upload to url
         * @param {BinaryType} file 
         */
    beforeUpload = file => {
        this.setState(state => ({
            fileList: [...state.fileList, file],
        }));
        return false;
    }

    /**
     * @event remove file
     * @param {BinaryType} file 
     */
    onRemove = file => {
        if (file.uid.includes('history')) {
            this.setState(state => {
                const index = state.historyFileList.indexOf(file);
                const newHistoryFileList = state.historyFileList.slice();
                newHistoryFileList.splice(index, 1);
                let newRemoveFileList = state.removeFileList.slice();
                newRemoveFileList.push(file);
                return {
                    historyFileList: newHistoryFileList,
                    removeFileList: newRemoveFileList
                };
            });
        } else {
            this.setState(state => {
                const index = state.fileList.indexOf(file);
                const newFileList = state.fileList.slice();
                newFileList.splice(index, 1);
                let newRemoveFileList = state.removeFileList.slice();
                newRemoveFileList.push(file);
                return {
                    fileList: newFileList,
                    removeFileList : newRemoveFileList
                };
            });
        }
    }
    /**
     * @get detail
     */
    getDetail() {
        let { id } = this.props.match.params;
        let xhr;
        if (id) {
            xhr = apiDetail(id);
            xhr.then((response) => {
                if(response.status){
                    let datas = response.data
                    this.setState({file : datas.images})
                    this.formRef.current.setFieldsValue(datas); 
                    let arrURL = [];
                    (datas.images).forEach(n => {
                        arrURL.push({
                            src: getURLHR(n),
                            name : n.split('/').pop(),
                            image : n
                        })
                    });
                    this.setState({ fileList: arrURL }) 
                } 
                
            })
        } else {
            xhr = apiDetail(0);
            xhr.then((response) => {
                if(response.status){
                    let datas = response.data
                    this.formRef.current.setFieldsValue(datas); 
                }      
            })
        }
    }
    /**
     * @event submitForm
     */
    submitForm(value) {
        this.setState({ loading: true })
        let { t } = this.props;
        let { id } = this.props.match.params;
        let xhr, message;
        let formData = new FormData();
        if(id){
            value['_method'] = 'PUT';
        }
        // format data before submit form
        let arrNameSelect = ['title', 'location_id', 'cam']
        Object.keys(value).map((key) => {
            if (arrNameSelect.includes(key) && value[key] == undefined) {
                formData.append(key, 0)
            } else {
                if(typeof value[key] != 'undefined' && key != 'images') {
                    formData.append(key, value[key])
                }
            }
        })

        if(value?.images?.fileList){
            this.state.fileList.map(n =>{
                if(n.uid.includes('upload')){
                    formData.append('images[]',n)
                }
            })
        }

        this.state.removeFileList.map(n=>formData.append('remove_images[]',n.image))
        if (id) {
            xhr = apiUpdate(id, formData);
            message =(t('hr:log_issue') + (' ') + ('hr:updated'))
        } else {
            formData.append('status', 0);
            xhr = apiCreate(formData);
            message = (t('hr:log_issue') + (' ') + ('hr:created'))
        }

        xhr.then(response => {
            this.setState({ loading: false })
            if (response.status != 0) {
                if (!id)
                showNotify(t('Notification'), message);
                this.props.history.push("/ai-logissue")
            } else {
                showNotify(t('Notification'), response.message, 'error');
            }
        }).catch(error => console.log(error))
    }
    render() {
        let { t, match, baseData: { locations } } = this.props;
        let id = match.params.id;
        let subTitle = id ? t('update') : t('add_new');
        return (
            <div>
                <PageHeader
                    title={t('hr:log_issue')}
                    subTitle={subTitle}
                />
                <Row>
                    <Col span={24} className='card mr-1 pl-3 pr-3'>
                        <Spin spinning={this.state.loading}>
                            <Form
                                ref={this.formRef}
                                name="upsertLogForm"
                                className="ant-advanced-search-form pt-3"
                                layout="vertical"
                                onFinish={this.submitForm.bind(this)}
                            >
                                <Row gutter={12}>
                                    <Col span={16}>
                                        <Form.Item name="title" label={t('hr:title')} hasFeedback rules={[{ required: true, message: t('hr:input_title') }]}>
                                            <Input placeholder= {t('hr:title')} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item name="type" label={t('type')} hasFeedback rules={[{ required: true, message: t('hr:input_type') }]}>
                                            <Dropdown datas={LogIssueType} defaultOption={t('hr:all_type')} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={[12, 0]}>
                                    <Col span={8}>
                                        <Form.Item name="location_id" label={t('location')}>
                                            <Dropdown datas={locations} defaultOption={t('location')}/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>
                                        <Form.Item name="cam" label={t('camera')} >
                                            <Input placeholder="Camera" />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={24}>
                                        <Form.Item name="images" label={t('image')}>
                                            <Upload
                                                beforeUpload={this.beforeUpload} 
                                                onRemove={this.onRemove}
                                                listType="picture-card"
                                                fileList={[...this.state.historyFileList, ...this.state.fileList]}
                                                multiple
                                            >
                                                <Button icon={<UploadOutlined />}>{t('upload')}</Button>
                                            </Upload>
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={24} className="pt-3 pb-3">
                                    <Col span={12} key='bnt-submit' >
                                        <Button type="primary"
                                            icon={<FontAwesomeIcon icon={faSave} />}
                                            htmlType="submit"
                                            loading={this.state.loading}
                                        // onClick={}
                                        >
                                            {t('save')}
                                        </Button>
                                    </Col>
                                    <Col span={12} key='btn-back' style={{ textAlign: "right" }}>
                                        <Link to={`/ai-logissue`}>
                                            <Button type="default"
                                                icon={<FontAwesomeIcon icon={faBackspace} />}
                                            >{t('back')}</Button>
                                        </Link>
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
/**
 * Map redux state to component props
 * @param {Object} state 
 */
const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    }
}
export default connect(mapStateToProps)(withTranslation()(logIssueForm));