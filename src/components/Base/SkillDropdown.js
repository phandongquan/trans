import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import { withTranslation } from 'react-i18next';
import { Select } from "antd";
import { searchForDropdown } from '~/apis/company/skill'

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
    valueIsCode: PropTypes.bool,
    paramSearch: PropTypes.func
};
const defaultProps = {
    style: {},
    defaultValue: null,
    value: null,
    defaultOption: '-- Choose --',
    hideDefaultOption: false,
    valueIsCode: false,
    onChange: () => { },
    onSelect: () => { },
    onSearch: () => { },
    onClear: () => { },
    paramSearch: () => {}
}

class SkillDropdown extends Component {

    constructor(props) {
        super(props);
        this.state = {
            datas: []
        }
        this.getSkills = debounce(this.getSkills, 300);
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        /**
         * Get staff when initial = true
         */
        let { initial , value} = this.props;
        if (initial) {
            this.getSkills(value ? {id: value} : {});
        }
    }

    /**
     * @lifecycle
     */
    componentDidUpdate(prevProps, prevState) {
        let { value, valueIsCode } = this.props;
        let params = {};
        if (value !== prevProps.value && value) {
            /**
             * @init data
             * if
             */
            if (!this.state.datas.length || prevState !== this.state) {
                if (Array.isArray(value) && value.length) {
                    params = valueIsCode ? { value: value.join(',') } : { ids: value.join(',') };
                } else {
                    params = valueIsCode ? { value: value } : { ids: value };
                }
                this.getSkills(params);
            } else {
                /**
                 * @case  render multiple component
                 * On we change to render new componet, we need to set value = []
                 */
                if (Array.isArray(value)) {
                    params = valueIsCode ? { value: value.join(',') } : { ids: value.join(',') };
                    this.getSkills(params);
                } else {
                    params = valueIsCode ? { value: value } : { ids: value };
                    this.getSkills(params);
                }
            }
        }

        if (prevProps.defaultDatas !== this.props.defaultDatas) {
            this.setState({ datas: this.props.defaultDatas });
        }
    }

    /**
     * Call api get list staff
     */
    async getSkills(params = {}) {
        let response = await searchForDropdown({
            ...params,
            limit: 20,
            ...this.props.paramSearch
        });
        if (response.status) {
            let skills = response.data.results;
            let datas = [];
            if (skills) {
                skills.map(s => datas.push({ 'id':s.id, 'name': s.name + ' #' + s.code }))
            }
            this.setState({ datas });
        }
    }

    /**
     * @event search dropdon
     * @param {*} q 
     */
    onSearch(q) {
        this.getSkills({ value: q });
    }

    /**
      * Render select option
      * @param {Array} locations 
      */
    renderOptions = () => {
        const { Option } = Select;
        let datas = this.state.datas.length ? this.state.datas : (this.props.defaultDatas ? this.props.defaultDatas : []);
        let listOptions = [];
        if (Array.isArray(datas) && datas.length) {
            datas.map((data, index) =>
                listOptions.push(
                    <Option key={index} value={this.props.valueIsCode ? String(data.code) :String(data.id)}>
                        {typeof data.name !== 'undefined' ? data.name : typeof data.title !== 'undefined' ? data.title : ''}
                    </Option>
                )
            );
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
        let { defaultOption, onSelect, onChange, onClear, value, style, disabled, mode = null } = this.props;

        if (['tags', 'multiple'].includes(mode)) {
            value = (value && value.length) ? value.map(v => String(v)) : [];
        } else {
            value = value ? String(value) : null;
        }
        return (
            <Select
                onClick={this.onMouseEnter}
                showSearch={true}
                optionFilterProp="children"
                filterOption={false}
                placeholder={defaultOption || ''}
                value={value}
                allowClear={true}
                style={{ width: '100%', ...style }}
                onSelect={(value) => onSelect(value)}
                onChange={(value) => onChange(value)}
                onClear={(value) => onClear(value)}
                onSearch={(value) => this.onSearch(value)}
                mode={mode}
                disabled={disabled}
            >
                {this.renderOptions()}
            </Select>
        )
    }
}

SkillDropdown.propTypes = propTypes;
SkillDropdown.defaultProps = defaultProps;

const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    };
}

const mapDispatchToProps = (dispatch) => {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SkillDropdown));