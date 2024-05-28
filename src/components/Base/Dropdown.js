import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { withTranslation } from 'react-i18next';
import { Select } from "antd";

/**
 * @propsType define
 */
const propTypes = {
    style: PropTypes.object,
    value: PropTypes.any,
    defaultValue: PropTypes.any,
    onChange: PropTypes.func,
    onSelect: PropTypes.func,
    onSearch: PropTypes.func,
    onClear: PropTypes.func,
    defaultOption: PropTypes.string,
    hideDefaultOption: PropTypes.bool,
    takeZero: PropTypes.bool,
    allowClear: PropTypes.bool,
    keyMapping: PropTypes.any
};
const defaultProps = {
    style: {},
    defaultValue: null,
    value: null,
    defaultOption: '-- Choose --',
    hideDefaultOption: false,
    takeZero: true,
    allowClear: true,
    onChange: () => { },
    onSelect: () => { },
    onSearch: () => { },
    onClear: () => { },
    keyValMapping: null
}

class Dropdown extends Component {

    /**
      * Render select option
      * @param {Array} locations 
      */
    renderOptions = () => {
        const { Option } = Select;
        const { baseData: { departments }, datas, id, keyValMapping } = this.props

        let isDivision = false;
        if (id && String(id) && (id.includes('division_id') || id.includes('section_id'))) {
            isDivision = true;
            datas.map(d => d.parent_name = departments.find(de => de.id == d.parent_id)?.name)
        }

        let listOptions = [];
        let value; let text;
        let textField = null;
        let valueField = null;
        if (keyValMapping) {
            valueField = Object.keys(keyValMapping)[0];
            textField = Object.values(keyValMapping)[0];
        }
        if (Array.isArray(datas) && datas.length) {            

            datas.map((data, index) => {
                value = valueField ? String(data[valueField]) : String(data.id);
                text = textField ? data[textField] : (typeof data.name !== 'undefined' ? data.name : typeof data.title !== 'undefined' ? data.title : '');
                listOptions.push(
                    <Option key={index} value={value}>
                        {text}
                        {isDivision ? <small className='ml-2'>({data.parent_name})</small> : ''}
                    </Option>
                );
            });
        } else {
            if (typeof datas == 'object' && datas != null) {
                Object.keys(datas).map((id) => {
                    if (typeof datas[id] == 'object') {
                        value = valueField ? String(datas[id][valueField]) : String(datas[id].id);
                        text = textField ? datas[id][textField] : datas[id].name;
                    } else {
                        value = String(id);
                        text = datas[id];
                    }
                    listOptions.push(<Option key={value} value={value}>{text}</Option>)
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
        let { defaultOption, takeZero, onSelect, onChange, onSearch, onClear, value, style, disabled, className, mode = null, allowClear } = this.props;
        if (['tags', 'multiple'].includes(mode)) {
            value = (value && Array.isArray(value) && value.length) ? value.map(v => String(v)) : [];
        } else {
            value = (value !== null) ?
                (takeZero ? String(value) : (value == 0 ? null : value))
                : value;
        }
        return (
            <Select
                onClick={this.onMouseEnter}
                showSearch={true}
                optionFilterProp="children"
                placeholder={defaultOption || ''}
                value={value}
                allowClear={allowClear}
                style={{ width: '100%', ...style }}
                onSelect={(value) => onSelect(value)}
                onChange={(value) => onChange(value)}
                onClear={(value) => onClear(value)}
                onSearch={(value) => onSearch(value)}
                mode={mode}
                disabled={disabled}
                className={className}
            >
                {this.renderOptions()}
            </Select>
        )
    }
}

Dropdown.propTypes = propTypes;
Dropdown.defaultProps = defaultProps;

const mapStateToProps = (state) => {
    return {
        baseData: state.baseData
    };
}
const mapDispatchToProps = (dispatch) => {
    return {};
}
export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Dropdown));