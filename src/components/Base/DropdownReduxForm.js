import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';
import { Select } from "antd";

/**
 * @propsType define
 */
const propTypes = {
    style: PropTypes.object,
    value: PropTypes.any,
    // defaultValue: PropTypes.any,
    onChange: PropTypes.func,
    onSelect: PropTypes.func,
    onSearch: PropTypes.func,
    onClear: PropTypes.func,
    defaultOption: PropTypes.string,
    hideDefaultOption: PropTypes.bool,
};
const defaultProps = {
    style: {},
    // defaultValue: null,
    value: null,
    defaultOption: '-- Choose --',
    hideDefaultOption: false,
    onChange: () => { },
    onSelect: () => { },
    onSearch: () => { },
    onClear: () => { }
}

class Dropdown extends Component {

    /**
      * Render select option
      * @param {Array} locations 
      */
    renderOptions = () => {
        const { Option } = Select;
        let datas = this.props.datas;
        let listOptions = [];
        let value;
        if (Array.isArray(datas) && datas.length) {
            datas.map((data, index) => {
                value = String(data.id);
                listOptions.push(
                    <Option key={index} value={value}>
                        {typeof data.name !== 'undefined' ? data.name : typeof data.title !== 'undefined' ? data.title : ''}
                    </Option>
                );
            });
        } else {
            if (typeof datas == 'object' && datas != null) {
                Object.keys(datas).map((id) => {
                    if (typeof datas[id] == 'object') {
                        value = String(datas[id].id);                        
                        listOptions.push(<Option key={datas[id].id} value={value}>{datas[id].name}</Option>)
                    } else {
                        value = String(id);
                        listOptions.push(<Option key={id} value={value}>{datas[id]}</Option>)
                    }
                });
            }
        }

        return listOptions;
    }
    /**
      * @event click
      * @param {Object} e 
      */
    onMouseEnter(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    render() {
        let { defaultOption, onSelect, onChange, onSearch, onClear, value, style, disabled, defaultValue, mode = null } = this.props;
        if (['tags', 'multiple'].includes(mode)) {
            value = (value && value.length) ? value.map(v => String(v)) : [];
        } else {
            value = (value !== null) ? String(value) : value;
        }
        return (
            <Select
                onClick={this.onMouseEnter}
                showSearch={true}
                optionFilterProp="children"
                placeholder={defaultOption || ''}
                value={value || undefined}
                defaultValue={defaultValue || undefined}
                allowClear={true}
                style={{ width: '100%', ...style }}
                onSelect={(value) => onSelect(value)}
                // onChange={(value) => onChange(value)}
                onClear={(value) => onClear(value)}
                onSearch={(value) => onSearch(value)}
                mode={mode}
                disabled={disabled}
            >
                {this.renderOptions()}
            </Select>
        )
    }
}

Dropdown.propTypes = propTypes;
Dropdown.defaultProps = defaultProps;

export default withTranslation()(Dropdown);