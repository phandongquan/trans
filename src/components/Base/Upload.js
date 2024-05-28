import React, { Component } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

/**
 * @propsType define
 */
const propTypes = {
    type: PropTypes.any,
    size: PropTypes.number,
    onChange: PropTypes.func,
    onRemove: PropTypes.func,
    accept: PropTypes.string,
    extensions: PropTypes.any,
    checkAllFiles : PropTypes.bool,
};
const defaultProps = {
    type: [],
    size: null,
    onChange: () => { },
    onRemove: () => { },
    accept: '',
    extensions: [],
    checkAllFiles : false
}

class UploadComponent extends Component {   
    constructor(props) {
        super(props)
        this.state = {
            fileList: null,
            isShowUploadList: true
        }
    }
    
    /**
     * @event handle before upload file
     * @param {} file 
     */
    beforeUpload = (file) => {
        let { type, size , checkAllFiles } = this.props;
        if(!this.checkType(file) && !checkAllFiles){
            message.error("You can only upload ["+ type +"] file!");
            return false;
        }
            
        if (!this.checkSize(file) && !checkAllFiles){
            message.error("Image must smaller than " + size + "MB!");
            return false;
        }
            
        return false;
    }

    /**
     * Check type of file
     * @param {*} file 
     */
    checkType(file) {
        let { type, extensions } = this.props;

        let ext = this.getExt(file.name);
        if([...extensions, 'drawio'].includes(ext)) {
            return true;
        }

        if(type.length)
            return type.includes(file.type) ? true : false;
    }

    /**
     * Get extension file
     * @param {*} filename 
     * @returns 
     */
    getExt(filename)
    {
        var ext = filename?.split('.')?.pop();
        if(ext == filename) return "";
        return ext;
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
     * @event handle upload file
     */
    handleOnChangeUpload = (value) => {
        let {checkAllFiles} = this.props;
        if((this.checkType(value.file) && this.checkSize(value.file)) || checkAllFiles){
            this.setState({fileList: [value.file], isShowUploadList: true})
            this.props.onChange([value.file])
        } else {
            this.setState({isShowUploadList: false})
        }
    }

    /**
     * @event handle on remove
     */
    handleOnRemove = () => {
        this.props.onRemove([])
        // return false;
    }
 
    render() {
        const { accept } = this.props;
        let file = this.state.fileList ? this.state.fileList : this.props.defaultFileList;
        return (
            <Upload
                fileList={file}
                listType='picture'
                showUploadList={this.state.isShowUploadList}
                beforeUpload={(e) => this.beforeUpload(e)}
                onChange={(e) => this.handleOnChangeUpload(e)}
                onRemove={() => this.handleOnRemove()}
                accept={accept}
            >
                <Button type='default' icon={<UploadOutlined />}>Select File</Button>
            </Upload>
        )
    }
}

UploadComponent.propTypes = propTypes;
UploadComponent.defaultProps = defaultProps;

export default (UploadComponent)