import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { withTranslation } from 'react-i18next';
import { Select, Tag } from "antd";

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
}

class DropdownLocations extends Component {
    /**
      * Render select option
      * @param {Array} locations 
      */
    renderOptions = () => {
        const { Option } = Select;
        const { baseData: { departments }, datas, id } = this.props

        let isDivision = false;
        if (id && String(id) && (id.includes('division_id') || id.includes('section_id'))) {
            isDivision = true;
            datas.map(d => d.parent_name = departments.find(de => de.id == d.parent_id)?.name)
        }

        let listOptions = [];
        let value;
        if (Array.isArray(datas) && datas.length) {
            datas.map((data, index) => {
                value = String(data.id);
                listOptions.push(
                    <Option key={index} value={value}>
                        {typeof data.name !== 'undefined' ? data.name : typeof data.title !== 'undefined' ? data.title : ''}
                        {isDivision ? <small className='ml-2'>({data.parent_name})</small> : ''}
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
        let { defaultOption, takeZero, onSelect, onChange, onSearch, onClear, value, style, disabled, className, mode = null, allowClear, baseData: { locations } } = this.props;
        if (['tags', 'multiple'].includes(mode)) {
            value = (value && Array.isArray(value) && value.length) ? value.map(v => String(v)) : [];
        } else {
            value = (value !== null) ?
                (takeZero ? String(value) : (value == 0 ? null : value))
                : value;
        }
        return (
            <div className='dropdown-custom-hidden-values-select'>
                <Select
                    onClick={this.onMouseEnter}
                    showSearch={true}
                    optionFilterProp="children"
                    placeholder={defaultOption || ''}
                    value={value}
                    allowClear={false}
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
                <div className='mt-2'>
                    <div className=''>
                    {
                        Array.isArray(this.props.value) && this.props.value.map((v, index) => {
                            let locationFind = locations.find(l => l.id == v)
                            return <span
                                className="border pl-2 pr-2"
                                style={{whiteSpace: 'nowrap', display: 'inline-block', marginBottom: 4, marginRight: 8 , backgroundColor:'#fafafa'}}
                                key={index}
                            >
                                <span>{locationFind.name}</span>
                                <span className='ml-2 cursor-pointer' onClick={() => {
                                    const newValues = value.slice()
                                    newValues.splice(index, 1);
                                    onChange(newValues);
                                }}>x</span>
                            </span>
                        })
                    }
                    </div>
                </div>

            </div>
        )
    }
}

DropdownLocations.propTypes = propTypes;
DropdownLocations.defaultProps = defaultProps;

const mapStateToProps = (state) => {
    return {
        baseData: state.baseData
    };
}
const mapDispatchToProps = (dispatch) => {
    return {};
}
export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(DropdownLocations));