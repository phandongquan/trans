import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import { withTranslation } from 'react-i18next';
import { Button, Row, Select ,Tag ,Col} from "antd";
import { getList as getListStaff } from '~/apis/company/staff';
import {searchForDropdown} from'~/apis/company/staffSearchDropDown';
import { ClockCircleOutlined, CloseCircleOutlined, CloseOutlined } from '@ant-design/icons';

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
    defaultOption: '-- Choose --',
    hideDefaultOption: false,
    valueIsCode: false,
    onChange: () => { },
    onSelect: () => { },
    onSearch: () => { },
    onClear: () => { }
}

class StaffDropdownConfig extends Component {

    constructor(props) {
        super(props);
        this.formRef = React.createRef();
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
        let { initial } = this.props;
        if (initial) {
            this.getStaffs();
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
                    params = valueIsCode ? { q: value.join(',') } : { ids: value.join(',') };
                } else {
                    params = valueIsCode ? { q: value } : { ids: value };
                }
                this.getStaffs(params);
            } else {
                /**
                 * @case  render multiple component
                 * On we change to render new componet, we need to set value = []
                 */
                if (Array.isArray(value)) {
                    params = valueIsCode ? { q: value.join(',') } : { ids: value.join(',') };
                    this.getStaffs(params);
                } else {
                    params = valueIsCode ? { q: value } : { ids: value };
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
            sort: 'staff_id',
            get_inactive : 1,
        });
        if (response.status) {
            let { baseData: { departments, majors } } = this.props;
            let staffs = response.data;
            let datas = [];
            if (staffs) {
                staffs.map(s => {
                    let majorFinded = majors.find(m => m.id == s.major_id)
                    let deptFinded = departments.find(d => d.id == s.staff_dept_id )
                    datas.push({ 'id':s.staff_id, 'name': `${s.code} - ${s.staff_name} (${deptFinded ? deptFinded.name : ''} / ${majorFinded ? majorFinded.name : '' })`, 'code': s.code ,'full_name' : s.staff_name });
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
                        <div full_name={data.full_name}>{typeof data.name !== 'undefined' ? data.name : typeof data.title !== 'undefined' ? data.title : ''}</div>
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
    /**
     * Render tag
     * @param {*} tagProps
     * @returns
     */
    renderTag(tagProps) {
        const { label, closable, onClose } = tagProps;
        return  <Tag
        closable={closable}
        onClose={onClose}
        style={{ marginRight: 3, paddingBottom: 1, paddingTop: 1 }}
      >
        {label?.props?.full_name}
      </Tag>
    }
    render() {
        let { defaultOption, onSelect, onChange, onClear, value, style, disabled, mode = null } = this.props;
        if (['tags', 'multiple'].includes(mode)) {
            value = (value && value.length) ? value.map(v => String(v)) : [];
        } else {
            value = value ? String(value) : null;
        }
        return (
            <Row className="align-items-center">
                <Col span={22}>
                    <Select
                        ref={this.formRef}
                        onClick={this.onMouseEnter}
                        showSearch={true}
                        optionFilterProp="children"
                        filterOption={false}
                        placeholder={defaultOption || ''}
                        value={value}
                        allowClear={false}
                        style={{ width: '100%', ...style }}
                        onSelect={(value) => onSelect(value)}
                        onChange={(value) => onChange(value)}
                        onSearch={(value) => this.onSearch(value)}
                        mode={mode}
                        disabled={disabled}
                        tagRender={(tagProps) => this.renderTag(tagProps)}
                    >
                        {this.renderOptions()}
                    </Select>
                </Col>
                <Col span={2} style={{textAlign: 'center'}}>
                    <span className='cursor-pointer'><CloseCircleOutlined onClick={() => onChange([])}/></span>
                </Col>
            </Row>

        )
    }
}

StaffDropdownConfig.propTypes = propTypes;
StaffDropdownConfig.defaultProps = defaultProps;

const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    };
}

const mapDispatchToProps = (dispatch) => {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(StaffDropdownConfig));