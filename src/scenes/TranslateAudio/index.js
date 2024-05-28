import { PageHeader } from '@ant-design/pro-layout';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Col, Input, Row, Spin, Switch, Timeline } from 'antd';
import Axios from 'axios';
import { at } from 'lodash';
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Dropdown from '~/components/Base/Dropdown';
import { typeLanguagesTranslate } from '~/constants/basic';
import { showNotify } from '~/services/helper';

export class TranslateAudio extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            text: '',
            urlAudio : '',
            type : null , 
        }
    }
    async getAudio() {
        if(this.state.text.length > 1000 ){
            showNotify('Notification' , 'Value must not exceed 1000 characters!' , 'error')
        } else {
            this.setState({loading : true})
            const data = {
                text : this.state.text ,
                language : this.state.type
            };
            Axios.post('https://tts.gpu.rdhasaki.com/tts', data)
                .then(res => {
                    this.setState({urlAudio : res.data.url_output , loading : false})
                });
        }
    }
    downloadAudio() {
        this.setState({ loading: true })
        fetch(this.state.urlAudio, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/wav',
            },
        })
            .then((response) => response.blob())
            .then((blob) => {
                // Create blob link to download
                const url = window.URL.createObjectURL(
                    new Blob([blob]),
                );
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute(
                    'download',
                    `audio.wav`,
                );

                // Append to html link element page
                document.body.appendChild(link);

                // Start download
                link.click();

                // Clean up and remove the link
                link.parentNode.removeChild(link);
                this.setState({ loading: false })
            });
        
    }
    render() {
        const {t} = this.props
        return (
            <>
                <PageHeader title={t('translate_audio')} />
                <Spin spinning={this.state.loading} >
                    <Timeline
                        items={[
                            {   
                                color: '#306e51',
                                children: <>
                                    <div className='mb-2'><strong>{t('translate_audio')}</strong></div>
                                    <Input.TextArea autoSize={{ minRows: 5 }} value={this.state.text} onChange={(e) => this.setState({ text: e.target.value })} />
                                </>,
                            },
                            {
                                color: '#306e51',
                                children: <>
                                <div className='mb-2'><strong>{t('languages')}</strong></div>
                                <div style={{width: '20%'}}>
                                    <Dropdown 
                                        // disabled = {this.state.text.length ? false : true}
                                        value={this.state.type}
                                        datas={typeLanguagesTranslate} 
                                        defaultOption={t('hr:all_type')}
                                        onChange={v=> this.setState({type : v})}/>
                                </div>
                                </>,
                            },
                            {
                                color: '#306e51',
                                children: <>
                                <div className='mb-2'><strong>{t('hr:tool_reading_content')}</strong></div>
                                <Button type='primary' onClick={() => this.getAudio()}>{t('submit')}</Button>
                                </>,
                            },
                            {
                                color: '#306e51',
                                children:<> 
                                    <div className='mb-2'><strong>{t('hr:tool_plugin_reading')}</strong></div>
                                    <div className='d-flex align-items-stretch'>
                                    <audio style={{ height: '30px' }} controls className="audio-element" src={this.state.urlAudio} preload="metadata"></audio>
                                    {
                                        this.state.urlAudio.length ?
                                            <Button
                                                size='small'
                                                onClick={() => this.downloadAudio()}
                                                loading={this.state.loading}
                                                icon={<FontAwesomeIcon icon={faDownload} />}
                                                type='primary' />
                                            : []
                                    }
                                    </div>
                                </>,
                            },
                        ]}
                    >
                    </Timeline>
                    {/* <Row gutter={24}>
                        <Col span={12}>
                            
                        </Col>
                        <div>
                            <br />
                            
                        </div>
                    </Row> */}
                </Spin>
            </>
      )
  }
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(TranslateAudio)