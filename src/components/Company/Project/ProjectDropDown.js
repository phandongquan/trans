import React, { Component } from 'react'
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import { withTranslation } from 'react-i18next';
import { Select } from "antd";
import { suggestName } from '~/apis/company/project';

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
    valueIsID: PropTypes.bool,
};
const defaultProps = {
    style: {},
    defaultValue: null,
    value: null,
    defaultOption: 'Nhóm Công Việc',
    hideDefaultOption: false,
    valueIsID: false,
    onChange: () => { },
    onSelect: () => { },
    onSearch: () => { },
    onClear: () => { }
}

class ProjectDropDown extends Component {
    constructor(props) {
        super(props);
        this.state = {
            datas: []
        }
        this.getProjects = debounce(this.getProjects, 300);
    }
    componentDidUpdate(prevProps, prevState){
        let { value  } = this.props;
        let params = {};
        if (value !== prevProps.value && value) {
            this.getProjects({value})
        }
    }
    /**
     * Call api get list staff
     */
    async getProjects(params = {}) {
        let response
        if(params?.value > 0){
            response = await suggestName({ id: params.value });
        }else{
            response = await suggestName({ keyword: params.q });
        }
        let result = [];
        if (response.status) {
            let { data } = response;
            if (Array.isArray(data)) {
                data.map(r => {
                    result.push({
                        display: r.name,
                        id: r.id,
                    })
                })
                this.setState({ datas: result })
            }
        }

        return result;
    }
    /**
     * @event search dropdon
     * @param {*} q 
     */
    onSearch(q) {
        this.getProjects({ q });
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
                    <Option key={index} value={this.props.valueIsID ? String(data.display) : String(data.id)}>
                        {typeof data.display !== 'undefined' ? data.display :''}
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

        value = value ? String(value) : null;

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
                disabled={disabled}
            >
                {this.renderOptions()}
            </Select>
        )
    }
}

ProjectDropDown.propTypes = propTypes;
ProjectDropDown.defaultProps = defaultProps;

const mapStateToProps = (state) => {
    return {
        baseData: state.baseData
    }
}

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectDropDown)
