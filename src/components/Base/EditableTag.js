import React, { Component } from 'react';
import { Tag, Input, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './config/EditableTag.css';
import PropTypes from 'prop-types';
import { timesheetStatus } from '~/constants/basic';

/**
 * @propsType define
 */
const propTypes = {
    values: PropTypes.array,
    onChange: PropTypes.func,
    placeholder: PropTypes.string
};
const defaultProps = {
    values: [],
    onChange: () => {},
    placeholder: 'New Tag'
}
class EditableTag extends Component {
    constructor(props) {
        super(props)
        this.state = {
            inputVisible: false,
            inputValue: '',
            editInputIndex: -1,
            editInputValue: '',
        }
    }

    handleClose = removedTag => {
        const { values } = this.props;
        let valuesNew = values.filter(tag => tag !== removedTag)
        this.props.onChange(valuesNew)
    };

    showInput = () => {
        this.setState({ inputVisible: true }, () => this.input.focus());
    };

    handleInputChange = e => {
        this.setState({ inputValue: e.target.value });
    };

    handleInputConfirm = () => {
        const { inputValue } = this.state;
        let { values } = this.props;
        if (inputValue && values.indexOf(inputValue) === -1) {
            values = [...values, inputValue];
        }
        this.setState({
            inputVisible: false,
            inputValue: '',
        });

        this.props.onChange(values)
    };

    handleEditInputChange = e => {
        this.setState({ editInputValue: e.target.value });
    };

    handleEditInputConfirm = () => {
        const { editInputIndex, editInputValue } = this.state;
        let { values } =  this.props;
        const newValues = [...values];
        newValues[editInputIndex] = editInputValue;
        this.props.onChange(newValues)
        this.setState({
            editInputIndex: -1,
            editInputValue: '',
        });
    };

    saveInputRef = input => {
        this.input = input;
    };

    saveEditInputRef = input => {
        this.editInput = input;
    };

    render() {
        const { inputValue, editInputIndex, editInputValue } = this.state;

        let { values, placeholder } = this.props;

        return (
            <>
                <Input
                    ref={this.saveInputRef}
                    type="text"
                    size="small"
                    className="tag-input"
                    value={inputValue}
                    onChange={this.handleInputChange}
                    onBlur={this.handleInputConfirm}
                    onPressEnter={this.handleInputConfirm}
                    placeholder={placeholder}
                />

                {values.map((tag, index) => {
                    if (editInputIndex === index) {
                        return (
                            <Input
                                ref={this.saveEditInputRef}
                                key={tag}
                                size="small"
                                className="tag-input"
                                value={editInputValue}
                                onChange={this.handleEditInputChange}
                                onBlur={this.handleEditInputConfirm}
                                onPressEnter={this.handleEditInputConfirm}
                                style={{ width: '20%' }}
                            />
                        );
                    }

                    const isLongTag = tag.length > 20;

                    const tagElem = (
                        <Tag
                            className="edit-tag"
                            key={tag}
                            closable={true}
                            onClose={() => this.handleClose(tag)}
                        >
                            <span
                                onDoubleClick={e => {
                                    this.setState({ editInputIndex: index, editInputValue: tag }, () => {
                                        this.editInput.focus();
                                    });
                                    e.preventDefault();
                                }}
                            >
                                {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                            </span>
                        </Tag>
                    );
                    return isLongTag ? (
                        <Tooltip title={tag} key={tag}>
                            {tagElem}
                        </Tooltip>
                    ) : (
                        tagElem
                    );
                })}
            </>
        )
    }
}

EditableTag.propTypes = propTypes;
EditableTag.defaultProps = defaultProps;

export default (EditableTag)