import React, { Component, useState, useRef, useEffect, useContext } from 'react'
import MdEditor  from './MdEditor';
import { Upload, message } from 'antd';
import { arrMimeType } from '~/constants/basic';
import { MEDIA_URL_HR } from '~/constants';
import { uniqueId } from 'lodash';
import { CloseCircleOutlined } from '@ant-design/icons';
import { getIconFile } from '~/services/helper';

let mdEditorRef = null;
export class MdEditorFile extends Component {
    constructor(props) {
        super(props)
        this.uploadRef = React.createRef();
        this.state = {
            content: '',
            fileList: [],
            historyFileList: [],
            removeFileList: [],
            resetForm: false,
        }
    }

    componentDidMount() {
        this.props.onRef(this);
        this.setState({ resetForm: false })
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    /**
     * Get form values on parent component
     */
    getValues = () => {
        let { fileList, removeFileList } = this.state;
        return {
            content: mdEditorRef.getContent(),
            fileList,
            removeFileList
        }
    }

    /**
     * Set form values on parent component
     */
     setValues = (value = {}) => {
         this.setState({
            content: value.content || '',
            historyFileList: value.historyFileList || []
        })
    }

    /**
     * Reset form from parent component
     */
    resetForm = () => {
        this.setState({
            content: '',
            fileList: [],
            historyFileList: [],
            removeFileList: [],
            resetForm: true
        })
    }

    /**
     * Set reset form from parent component
     */
    setResetForm = value => {
        this.setState({ resetForm: value})
    }

    /**
     * @event handle before upload file
     * @param {} file 
     */
    beforeUpload = file => {
        const isType = arrMimeType.includes(file.type);
        if (!isType) {
            message.error("Bạn chỉ có thể tải tệp JPG/PNG/JPEG, PDF, ZIP, MP4/MP3, DOC, DOCX, XLS, XLSX ");
            return false;
        }

        if (file.size / 1024 / 1024 > 20) {
            message.error("Tệp không lớn quá 20 MB !");
            return false;
        }

        if (['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
            this.getBase64(file, imageBase64 => {
                file.imageBase64 = imageBase64;
                this.setMutiFileList(file)
            });
        } else {
            this.setMutiFileList(file)
        }
        return false;
    }

    /**
     * 
     * @param {*} file 
     */
    setMutiFileList = (file) => {
        this.setState(state => {
            return { fileList: [...state.fileList, file] }
        })
    }

    /**
     * Get file image base64
     * @param {*} img 
     * @param {*} callback 
     */
    getBase64 = (img, callback) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    }

    /**
     * On remove in upload
     * @param {*} file 
     */
    onRemove = (event, file) => {
        event.stopPropagation();
        let { historyFileList, removeFileList, fileList } = this.state;
        if (file.uid.includes('files')) {
            const index = historyFileList.indexOf(file);
            const newHistoryFileList = historyFileList.slice();
            newHistoryFileList.splice(index, 1);

            let newRemoveFileList = removeFileList.slice();
            newRemoveFileList.push(file.fileRaw);

            this.setState({ historyFileList: newHistoryFileList, removeFileList: newRemoveFileList })
        } else {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            this.setState({fileList: newFileList})
        }
    }

    /**
     * Render file default
     * @returns 
     */
    renderFiles = (canEdit = true) => {
        let { fileList, historyFileList } = this.state;
        let datas = [...fileList, ...historyFileList];
        let result = [];
        datas.map(file => {
            if (file.imageBase64) {
                let checkImgBase64 = false;
                if (typeof file.imageBase64 == 'string') {
                    checkImgBase64 = file.imageBase64.substring(0, 5) == 'data:'
                }
                let url = !checkImgBase64 ? MEDIA_URL_HR + file.imageBase64 : file.imageBase64;
                result.push(
                    <div className='item_comment_file cursor-pointer' key={uniqueId('comment_img')}>
                        <div className='thumb_image_file'>
                            <img src={url} alt="avatar" />
                        </div>
                        <CloseCircleOutlined
                            className='icon_del_item_comment text-muted'
                            onClick={e => this.onRemove(e, file)}
                        />
                    </div>
                )
            } else {
                result.push(
                    <div className='item_comment_file cursor-pointer' key={uniqueId('comment_file')}>
                        <div className='thumb_image_file'>
                            {getIconFile(typeof file.url != 'undefined' ? file.url : file.name)}
                        </div>
                        <div className='thumb_file_name'>
                            {Object.keys(file).length ? file.name : null}
                        </div>
                        <CloseCircleOutlined
                            className='icon_del_item_comment text-muted'
                            onClick={e => this.onRemove(e, file)}
                        />
                    </div>
                )
            }
        })

        return <div className='d-flex mt-1'>
            {result}
        </div>
    }

    /**
     * Handle paste image
     */
    handlePaste = (e) => {
        if (e.clipboardData.files.length) {
            const fileObjects = e.clipboardData.files;
            Object.keys(fileObjects).map(index => {
                this.beforeUpload(fileObjects[index])
            })
        }
    };

    /**
     * Handle Drop
     * @param {*} ev 
     */
    handleDrop = (ev) => {
        ev.preventDefault();
        if (ev.dataTransfer.files) {
            for (var i = 0; i < ev.dataTransfer.files.length; i++) {
                this.beforeUpload(ev.dataTransfer.files[i])
            }
        }
    }

    render() {
        let { content, historyFileList, fileList, resetForm } = this.state;
        return (
            <div onPaste={e => this.handlePaste(e)} onDrop={e => this.handleDrop(e)}>
                <MdEditor
                    onRef={ref => mdEditorRef = ref}
                    className="mentions_sub"
                    placeholder={this.props.placeholder || 'Mô tả'}
                    value={content}
                    onChangeUpload={() => this.uploadRef.current.click()}
                    resetForm={resetForm}
                />
                {/* <div className=''>
                    <div className='width_common relative'>
                        <div className='block_right_add_item'>
                            <Upload
                                fileList={[...historyFileList, ...fileList]}
                                multiple
                                className="upload-list-inline"
                                listType="picture"
                                showUploadList={false}
                                beforeUpload={e => this.beforeUpload(e)}
                            >
                                {this.renderFiles()}
                                <span className='d-none' ref={this.uploadRef} />
                            </Upload>
                        </div>
                    </div>
                    <div className='clearfix'></div>
                </div> */}
            </div>
        )
    }
}

export default (MdEditorFile)
