import React, { Component } from 'react';
import { Modal, Input, Label } from 'antd';

const { TextArea } = Input;

const defaultProps = {
    onChange: () => { },
}

class ReplyModal extends Component{
    constructor(props){
        super(props)
    }
    render() {
        let { onChange, title, visible, hidePopup, submitPopup, content, inputType } = this.props
        return (
            <Modal
                forceRender
                title={title || 'Modal'}
                visible={visible}
                onCancel={hidePopup}
                onOk={submitPopup}>
                    {
                        inputType == 'Input' ? 
                        <Input
                            placeholder="Name"
                            value={content}
                            onChange={(value) => onChange(value)}
                        />
                        :
                        <TextArea
                            rows={5}
                            value={content}
                            onChange={(value) => onChange(value)}
                        />
                    }
            </Modal>
        )
    }
} 

ReplyModal.defaultProps = defaultProps;

export default (ReplyModal)
