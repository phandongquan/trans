import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next';
import { Row, Col, Form, Input, Modal ,TimePicker ,Button} from 'antd';
import { create, update } from '~/apis/music/songs';
import Dropdown from '~/components/Base/Dropdown';
import Upload from '~/components/Base/Upload'; 
import { convertToFormData, showMessage, showNotify } from '~/services/helper';
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faPlusCircle, faMinusCircle } from '@fortawesome/free-solid-svg-icons';

export class Advertisement extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.adudioRef = React.createRef();
        this.state = {
            duration: 0,
            file: null,
            defaultFile: null,
            removeFile: false,
            timeStart: [],
        }
    }

    componentDidUpdate(prevProps, prevState) {
        let {song} = this.props
        if (prevProps.song.id != this.props.song.id) {
            if (Object.keys(this.props.song).length) {
                this.setState({
                    defaultFile: [{
                        uid: '-1',
                        name: this.props.song.file,
                        status: 'done',
                        url: this.props.song.file,
                    }],
                    timeStart : this.props.song.times_frame ?  this.props.song.times_frame : []
                })
                // song = {
                //     ...song,
                //     begin_time : dayjs(song.begin_time,'HH:mm')
                // }
                this.formRef.current.setFieldsValue(song);
            } else {
                this.formRef.current.resetFields();
                this.setState({ defaultFile: [], timeStart: []})
            }
        }
        if ((Object.keys(this.props.song).length == 0 && this.props.visible) && (prevProps.visible != this.props.visible)) {
            this.formRef.current.resetFields();
            this.setState({ defaultFile: [], timeStart: [] })

        }
    }

    /**
     * @event before submit form
     * Validate before submit
     */
    handleFormSubmit() {
        const {t} = this.props;
        this.formRef.current.validateFields()
            .then((values) => {
                delete values.file
                if (this.state.file?.length || this.props.song?.id) {
                    if(this.state.timeStart.length){
                        this.submitForm(values)
                    }
                    else{
                        showNotify('Notification', t('hr:please_select') + t(' ') + t('hr:start_time') , 'error')
                    }
                } else {
                    showNotify('Notification', t('hr:select_mp3'), 'error')
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
        let {timeStart} = this.state ;
        let xhr;
        let message = '';
        let formData;
        // values['begin_time'] = dayjs(values.begin_time).format('YYYY-MM-DD HH:mm:ss')
        delete values.time
        values['type'] = 1
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
            timeStart.map(v => {
                formData.append('times_frame[]' , v)
            })
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
            timeStart.map(v => {
                formData.append('times_frame[]' , v)
            })
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
    addTimeStart(){
        const { t }= this.props;
        let newTimeStart = this.state.timeStart
        let values = this.formRef.current.getFieldsValue()
        if(values?.time){
            if (newTimeStart.length) {
                newTimeStart = [...newTimeStart, dayjs(values?.time).format('HH:mm:ss')]
            }else{
                newTimeStart = [dayjs(values?.time).format('HH:mm:ss')]
            }
            this.setState({timeStart : newTimeStart})
        }else{
            showNotify('Notification',t('hr:please_select') + t(' ') + t('hr:start_time'), 'error')
        }
    }
    removeTimeStart(index){
        let newTimeStart = this.state.timeStart.slice()
        newTimeStart.splice(index, 1)
        this.setState({timeStart : newTimeStart})
    }
    render() {
        const { t , baseData: { locations } }= this.props;
        let title = t('add_new') + (' ') + t('hr:advertisement')

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
                                <Form.Item label={t('name')} name='name' hasFeedback rules={[{ required: true, message: t('hr:input_name_folder') }]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={24} className={this.props.song?.id ? `d-none` : ''}>
                                <Form.Item
                                    label={t('file')}
                                    extra='Only support MP3. Size max 20MB!'
                                    name={'file'}
                                    // hasFeedback rules={[{ required: true, message: t('Please select mp3 file') }]}
                                    // hasFeedback rules={[{ required: true, message: t('Please input name') }]}
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
                                <Form.Item name='category_id' label={t('category')} hasFeedback rules={[{ required: true, message: t('hr:please_select') + (' ') + t('category') }]}>
                                    <Dropdown datas={{ 1: t('shop'), 2: t('clinic') }} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name='locations' label={t('location')} hasFeedback rules={[{ required: true, message: t('hr:please_select') + (' ') + t('location')  }]}>
                                    <Dropdown datas={locations} mode={'multiple'} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                {/* <Form.Item name={'begin_time'} label='Time start' hasFeedback rules={[{ required: true, message: t('Select time') }]}>
                                    <TimePicker format={'HH:mm'} />
                                </Form.Item> */}
                                <div className="d-flex mt-2">
                                    <Form.Item name='time'>
                                        <TimePicker format={'HH:mm'} onOk={() => this.addTimeStart()}/>
                                    </Form.Item>
                                    <Button className="ml-1" icon={<FontAwesomeIcon icon={faPlusCircle} />}
                                        onClick={async () => {
                                            this.addTimeStart()
                                        }}>
                                    </Button>
                                </div>
                                
                            </Col>
                            {
                                this.state.timeStart.length ?
                                    <Row>
                                        {
                                            (this.state.timeStart).map((t,index) =>
                                                <div key={index} className='card mt-1 ml-2 position-relative'>
                                                    <span className='p-2'>{t}</span>
                                                    <FontAwesomeIcon className='cursor-pointer' onClick={() => this.removeTimeStart(index)}
                                                     icon={faMinusCircle} style={{position : 'absolute' , top:-5 ,right: -8 }} />
                                                </div>
                                            )
                                        }
                                    </Row>
                                    : []
                            }
                        </Row>
                    </Form>
                </Modal>
            </>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    };
}

const mapDispatchToProps = {
    
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Advertisement))
