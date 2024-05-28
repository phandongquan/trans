import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next';
import { Row, Col, Form, Input, Modal ,TimePicker } from 'antd';
import { create, update } from '~/apis/music/songs';
import Dropdown from '~/components/Base/Dropdown';
import Upload from '~/components/Base/Upload'; 
import { convertToFormData, showMessage, showNotify } from '~/services/helper';
import dayjs from 'dayjs';

export class Music extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.adudioRef = React.createRef();
        this.state = {
            duration: 0,
            file: null,
            defaultFile: null,
            removeFile: false,
            typeAD: true,
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.song.id != this.props.song.id) {
            if (Object.keys(this.props.song).length) {
                this.setState({
                    defaultFile: [{
                        uid: '-1',
                        name: this.props.song.file,
                        status: 'done',
                        url: this.props.song.file,
                    }],
                    typeAD: this.props.song.type == 1 ? false : true
                })
                this.formRef.current.setFieldsValue(this.props.song);
            } else {
                this.formRef.current.resetFields();
                this.setState({defaultFile: []})
            }
        }
        if ((Object.keys(this.props.song).length == 0 && this.props.visible) && (prevProps.visible != this.props.visible)) {
                this.formRef.current.resetFields();
                this.setState({ defaultFile: [] })

        }
    }

    /**
     * @event before submit form
     * Validate before submit
     */
    handleFormSubmit() {
        const {t} = this.props
        this.formRef.current.validateFields()
            .then((values) => {
                delete values.file
                if (this.state.file?.length || this.props.song?.id) {
                    this.submitForm(values)
                } else {
                    showNotify('Notification',t('hr:select_mp3'),'error')
                }
            }
             )
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    }

    /**
     * Get duration from mp3 file
     * @param {*} file 
     * @returns 
     */
    getDuration = (file) => {
        return new Promise((resolve) => {
            var objectURL = URL.createObjectURL(file);
            var mySound = new Audio([objectURL]);
            mySound.addEventListener(
              "canplaythrough",
              () => {
                resolve(this.setState({ duration: mySound.duration}));
              },
              false,
            );
          }); 
    }

    /**
     * handle submit form
     */
    async submitForm(values) {
        const { t, song } = this.props;

        let xhr;
        let message = '';
        let formData;
        // if(values.type == 1 && values.time){
        //     values['begin_time'] = dayjs(values.time).format('YYYY-MM-DD HH:mm:ss')
        //     // values['end_time'] = dayjs(values.time[1]).format('YYYY-MM-DD HH:mm:ss')
        // }
        values['type'] = 0
        if (song.id) {
            if(this.state.removeFile && !this.state.file) {
                showMessage(t('hr:select_mp3'),'error');
                return false;
            }

            if(this.state.file) {
                await this.getDuration(this.state.file[0]);
                values.duration = Math.floor(this.state.duration)
            }
            formData = convertToFormData(values);
            formData.append('_method', 'PUT');
            xhr = update(song.id, formData);
            message = t('hr:update_song');
        } else {
            if(!this.state.file) {
                showMessage(t('hr:select_mp3'),'error');
                return false;
            }
            if(this.state.file) {
                await this.getDuration(this.state.file[0]);
                values.duration = Math.floor(this.state.duration)
            }
            formData = convertToFormData(values);
            formData.append('folder_id[]', this.props.folder_id ? this.props.folder_id : 0)
            formData.append('file', this.state.file[0])
            xhr = create(formData);
            message = t('hr:create_song');
        }

        xhr.then(response => {
            if(response.status) {
                showNotify(t('Notification'), message);
                this.props.hidePopup();
                this.props.refreshTable();
            }
        });
    }

    render() {
        const { t } = this.props;
        let title = t('hr:create_song')

        return (
            <>
                <Modal
                    open={this.props.visible}
                    title={title}
                    forceRender
                    width='40%'
                    onCancel={() => this.props.hidePopup()}
                    onOk={this.handleFormSubmit.bind(this)}
                >
                    <Form
                        preserve={false}
                        ref={this.formRef}
                        layout='vertical'
                    >
                        <Row gutter={24}>
                            <Col span={24}>
                                <Form.Item label={t('name')} name='name' hasFeedback rules={[{ required: true, message: t('hr:input_name') }]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={24} className={this.props.song?.id ? `d-none` : ''}>
                                <Form.Item
                                    name={'file'}
                                    label={t('File')}
                                    extra='Only support MP3. Size max 20MB!'
                                >
                                    <Upload
                                        defaultFileList={this.state.defaultFile}
                                        onChange={(value) => {
                                            this.setState({ file: value })
                                            const objectUrl = URL.createObjectURL(value[0]);
                                            this.setState({ src: objectUrl})
                                        } }
                                        onRemove={() => this.setState({ file: null, removeFile: true })}
                                        type={['audio/mpeg','audio/x-m4a','audio/x-flac','audio/flac']}
                                        size={20}
                                    />
                                    <audio ref={this.adudioRef} style={{display: 'none'}} src={this.state.src}></audio>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name='category_id' label={t('category')} hasFeedback rules={[{ required: true, message: t('hr:please_select') + t(' ') + t('category') }]}>
                                    <Dropdown datas={{ 1: t('hr:shop'), 2: t('hr:clinic') }} />
                                </Form.Item>
                            </Col>

                        </Row>
                    </Form>
                </Modal>
            </>
        )
    }
}

const mapStateToProps = (state) => ({
    
})

const mapDispatchToProps = {
    
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Music))
