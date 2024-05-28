import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next';
import { Upload, Button, message } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

/**
 * @propsType define
 */
const propTypes = {
    listType : PropTypes.string
}
const defaultProps = { 
    listType : 'picture'
}
export class UploadMultiple extends Component {

    constructor(props) {
        super(props)
        this.state = {
            fileList: [],
            historyFileList: [],
            removeFileList: []
        }
    }

    componentDidMount() {
        this.props.onRef(this);
    }

    componentWillUnmount() {
        this.props.onRef(undefined);
    }

    /**
     * Get form values on parent component
     */
     getValues = () => {
        let { fileList, removeFileList ,historyFileList } = this.state;
        return {
            fileList,
            removeFileList,
            historyFileList
        }
    }

    /**
     * Set form values on parent component
     */
    setValues = (value = {}) => {
         this.setState({
            historyFileList: value.historyFileList || []
        })
    }

    /**
     * Reset form from parent component
     */
    resetForm = () => {
        this.setState({
            fileList: [],
            historyFileList: [],
            removeFileList: [],
        })
    }

    /**
     * @handle before upload
     * 
     * @return false will default upload to url
     * @param {BinaryType} file 
     */
    beforeUpload = file => {
        let { type, size } = this.props;
        if(!this.checkType(file)){
            message.error("You can only upload ["+ type +"] file!");
            return false;
        }
            
        if (!this.checkSize(file)){
            message.error("Image must smaller than " + size + "MB!");
            return false;
        }
        
        this.setState(state => ({
            fileList: [...state.fileList, file],
        }));
        return false;
    }

    /**
     * Check type of file
     * @param {*} file 
     */
    checkType(file) {
        let { type } = this.props;
        if(type.length)
            return type.includes(file.type) ? true : false;
    }

    /**
     * Check size of file
     * @param {*} file 
     */
    checkSize(file) {
        let { size } = this.props;
        let defaultSize = size ? size : 5;
        return file.size / 1024 / 1024 < defaultSize ? true : false;
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
                newRemoveFileList.push(file.fileRaw);
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
                return {
                    fileList: newFileList,
                };
            });
        }
    }

    render() {
        const { t } = this.props;
        let { historyFileList, fileList } = this.state;
        return (
            <Upload 
                key="upload" 
                listType={this.props.listType}
                beforeUpload={this.beforeUpload} 
                onRemove={this.onRemove} 
                fileList={[...historyFileList, ...fileList]} 
                multiple
            >
                <Button className='ml-2' key="upload" icon={<FontAwesomeIcon icon={faPaperclip} />}>
                    &nbsp;{t('Upload file')}
                </Button>
            </Upload>
        )
    }
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(UploadMultiple))