import React, { Component } from 'react'
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import {  Row, Col, Form, Table, Select, Input, Button, Modal } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import Tab from '~/components/Base/Tab';
import tabListAudioCall from '../../Company/config/tabListAudioCall';
import { getList, uploadAudio } from '~/apis/audiocall/record'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPauseCircle, faPlayCircle } from '@fortawesome/free-solid-svg-icons';
import { showNotify } from '~/services/helper';
import ReactPlayer from "react-player";

export class RecordAudioCall extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef()
        this.state = {
            loading: false,
            visible: false,
            datas: [],
            data: {},
            recording: false,
            audioChunks: [],
            file : null,
            urlFile : null
        }
        this.mediaRecorder = null;
        this.mediaStream = null;
    }
    componentDidMount() {
        this.getListDatas()
    }
    async getListDatas(params = {}){
        this.setState({loading: true})
        params = {
            ...params
        }
        let response = await getList(params)
        this.setState({data : response , loading: false} ,()=>console.log(this.state.data))
    }
    startRecording = () => {
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
                this.mediaStream = stream;
                this.mediaRecorder = new MediaRecorder(stream);

                this.mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        this.setState((prevState) => ({
                            audioChunks: [...prevState.audioChunks, event.data],
                        }));
                    }
                };

                this.mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(this.state.audioChunks, { type: 'audio/wav' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    // Cleanup
                    this.mediaStream.getTracks().forEach((track) => track.stop());
                    this.setState({ audioChunks: [], urlFile: audioUrl ,file: audioBlob });
                };

                this.mediaRecorder.start();
                this.setState({ recording: true });
            })
            .catch((error) => {
                showNotify('Error', error, 'error')
                console.error('Error accessing the microphone:', error);
            });
    };

    stopRecording = () => {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
            this.setState({ recording: false });
        }
    };
    async submitAudio(id){
        let params = {
            id : id
        }
        let formData = new FormData();
        if(this.state.file && this.state.urlFile){
            formData.append('audio', this.state.file)
        }
        let response = await uploadAudio(params , formData)
        if(response.status == 'success'){
            showNotify('Notification', response.status, )
            this.setState({ file : null , urlFile : null  });
            this.getListDatas()
        }else{
            showNotify('Error', response.status, 'error')
        }
    }
    render() {
        const { t } = this.props;
        const columns = [
            {
                title : 'No.',
                width: 5,
                render:r=>  1
            },
            {
                title : t('Content'),
                width :'800px',
                render: r => <span>{r?.text}</span> 
            },
            {
                title : t('record_audio'),
                width: '10%',
                render: r => <Button 
                    onClick={this.state.recording ? this.stopRecording : this.startRecording}
                    icon={<FontAwesomeIcon icon={this.state.recording ? faPauseCircle : faPlayCircle} />}
                    type='primary'
                >
                {this.state.recording ? t('stop_recording') : t('start_recording')}
            </Button>
            },
            {
                title :t('audio'),
                render: r => this.state.urlFile && <ReactPlayer
                url={this.state.urlFile}
                width='100%'
                height={80}
                controls={true}
            />
            },
            {
                title: t('action'),
                width: '7%',
                render: r => this.state.urlFile && <Button type='primary' onClick={() => this.submitAudio(r.id)}>{t('submit')}</Button>
            }
        ]
        return (
            <div>
                <PageHeader title={ t('record_audio')} />
                <Row className="card pl-3 pr-3 mb-3">
                    <Tab tabs={tabListAudioCall(this.props)}></Tab>
                </Row>
                <Table
                    key='id'
                    className='table-record-audio'
                    dataSource={[this.state.data]}
                    columns={columns}
                    loading={this.state.loading}
                />
            </div>
        )
    }
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(RecordAudioCall)