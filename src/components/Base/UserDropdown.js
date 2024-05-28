import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import { withTranslation } from 'react-i18next';
import { Select } from "antd";
import {searchForDropdown} from'~/apis/company/staffSearchDropDown';

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
};
const defaultProps = {
    style: {},
    defaultValue: null,
    value: null,
    defaultOption: 'Tất cả nhân viên',
    hideDefaultOption: false,
    valueIsCode: false,
    onChange: () => { },
    onSelect: () => { },
    onSearch: () => { },
    onClear: () => { }
}

class StaffDropdown extends Component {

    constructor(props) {
        super(props);
        this.state = {
            datas: []
        }
        this.getStaffs = debounce(this.getStaffs, 300);
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        /**
         * Get staff when initial = true
         */
        let { initial, value } = this.props;
        if (initial) {
            this.getStaffs();
        }

        if (value) {
            this.getStaffs({ user_id: value });
        }
    }

    /**
     * @lifecycle
     */
    componentDidUpdate(prevProps, prevState) {
        let { value } = this.props;
        let params = {};
        if (value !== prevProps.value && value) {
            /**
             * @init data
             * if
             */
            if (!this.state.datas.length || prevState !== this.state) {
                if (Array.isArray(value) && value.length) {
                    params = { user_id: value.join(',') };
                } else {
                    params = { user_id: value };
                }
                this.getStaffs(params);
            } else {
                /**
                 * @case  render multiple component
                 * On we change to render new componet, we need to set value = []
                 */
                if (Array.isArray(value) && (Array.isArray(prevProps.value) && prevProps.value.length == 0)) {
                    params = { user_id: value.join(',') };
                    this.getStaffs(params);
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
    async getStaffs(params = {}) {
        let response = await searchForDropdown({
            ...params,
            limit: 20,
            sort: 'staff_id'
        });
        if (response.status) {
            let { baseData: { departments, majors, locations } } = this.props;
            let staffs = response.data;
            let datas = [];
            if (staffs) {
                staffs.map(s => {
                    let deptFinded = departments.find(d => d.id == s.staff_dept_id );
                    let majorFinded = majors.find(m => m.id == s.major_id)

                    let result = '';
                    // BOD 
                    if(s.staff_dept_id == 100) {
                        result = deptFinded?.name || 'BOD';
                    // Director
                    } else if (s.major_id == 29) {
                        result = `${deptFinded?.name || ''} / ${majorFinded.name || ''}`;
                    } else {
                        let locFinded = locations.find(l => l.id == s.staff_loc_id)
                        result = `${deptFinded?.name || ''} / ${majorFinded?.name || ''} / ${locFinded?.name || ''}`;
                    }
                    datas.push({ 'id': s.user_id, 'name': `${s.code} - ${s.staff_name} (${result})`, 'code': s.code });
                })
            }

            this.setState({ datas });
        }
    }

    /**
     * @event search dropdon
     * @param {*} q 
     */
    onSearch(q) {
        this.getStaffs({ q });
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

StaffDropdown.propTypes = propTypes;
StaffDropdown.defaultProps = defaultProps;

const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    };
}

const mapDispatchToProps = (dispatch) => {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(StaffDropdown));