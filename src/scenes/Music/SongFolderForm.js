import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Row, Col, Form, Input, Modal } from 'antd';
import { addSongFolder } from '~/apis/music/songs';
import Dropdown from '~/components/Base/Dropdown';
import { showNotify } from '~/services/helper';

export class SongFolderForm extends Component {
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            data: {}
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        if(prevProps.song.id != this.props.song.id) {
            if(Object.keys(this.props.song).length) {
            //     this.formRef.current.setFieldsValue(this.props.song);
            //     this.setState({ defaultFile: [{
            //         uid: '-1',
            //         name: this.props.song.file,
            //         status: 'done',
            //         url: this.props.song.file,
            //       }] 
            //   })
            } else {
                this.formRef.current.resetFields();
            }
        }
        if(prevProps.songs_id != this.props.songs_id ){
            if(this.props.songs_id.length){

            }else {
                this.formRef.current.resetFields();
            }
        }
    }

    /**
     * handle submit form
     */
    async submitForm() {
        const {t} = this.props.transLang
        let values = this.formRef.current.getFieldValue()
        let formData = new FormData()
        if(this.props.song.id ){
            formData.append('music_id[]' , this.props.song.id )
        }
        if(this.props.songs_id.length){
            this.props.songs_id.map(id =>{
                formData.append('music_id[]' , id )
            })
        }
        formData.append('_method','PUT')
        let response = await addSongFolder(values.folder_id , formData)
        if(response.status){
            this.props.hidePopup()
            this.props.refreshTable();
            showNotify('Notification', t('hr:add_play_list_susscess'))
        }else {
            showNotify('Notification', response.message , 'error')
        }
    }
    
    render() {
        const {t} = this.props.transLang
        return (
            <Modal
                open={this.props.visibleSong}
                title={t('hr:add_song_folder')}
                forceRender
                width='40%'
                onCancel={() => this.props.hidePopup()}
                onOk={this.submitForm.bind(this)}
                afterClose={() => this.formRef.current.resetFields()}
            >
                <Form
                    preserve={false}
                    ref={this.formRef}
                    layout='vertical'
                >
                    <Form.Item label={('folder')} name='folder_id' hasFeedback rules={[{ required: true, message: ('hr:choose_folder') }]}>
                        <Dropdown datas={this.props.datasFolder} defaultOption={t('hr:all_folder')}/>
                    </Form.Item>
                </Form>

            </Modal>
        )
  }
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(SongFolderForm)