import React, { Component } from 'react';
import { Modal, Input } from 'antd';

const { TextArea } = Input;

const defaultProps = {
    onChange: () => { },
}

class ReplyModal extends Component{
    constructor(props){
        super(props)
    }
    render() {
        let { onChange } = this.props
        return (
            <Modal
                title="Reply"
                open={this.props.visible}
                onCancel={this.props.hidePopup}
                onOk={this.props.submitPopup}>
                <TextArea
                    rows={7}
                    value={this.props.content}
                    onChange={(value) => onChange(value)}
                >
                </TextArea>
            </Modal>
        )
    }
} 

ReplyModal.defaultProps = defaultProps;

export default (ReplyModal)
