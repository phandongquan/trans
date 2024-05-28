import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import { withTranslation } from 'react-i18next';
import { Select, Tag } from "antd";
import { getList as apiGetList , getListSku } from '~/apis/assetDevice'

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
    allowClear: PropTypes.bool
};
const defaultProps = {
    style: {},
    defaultValue: null,
    value: null,
    defaultOption: '-- Choose --',
    hideDefaultOption: false,
    onChange: () => { },
    onSelect: () => { },
    onSearch: () => { },
    onClear: () => { },
    allowClear: true
}

class SkuDeviceDropdown extends Component {

    constructor(props) {
        super(props);
        this.state = {
            datas: {}
        }
        this.getSkus = debounce(this.getSkus, 300);
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        
    }

    /**
     * @lifecycle
     */
    componentDidUpdate(prevProps, prevState) {
        let { value } = this.props;
        if (value !== prevProps.value && value) { 
            if (!this.state.datas.length || prevState !== this.state) {
                this.getSkus({ id: value})
            }
        }
    }

    /**
     * Call api get list asset
     */
    async getSkus(params = {}) {
        let response = await getListSku({
            ...params,
            limit: 20
        });
        if (response.status) {
            if(!Array.isArray(response.data)){
                this.setState({ datas: response.data });
            }
        }
    }

    /**
     * @event search dropdon
     * @param {*} q 
     */
    onSearch(q) {
        this.getSkus({ keyword: q });
    }

    /**
      * Render select option
      * @param {Array} locations 
      */
    renderOptions = () => {
        const { Option } = Select;
        let datas = this.state.datas ;
        let listOptions = [];
        if (!Array.isArray(datas) && Object.keys(datas).length) {
            Object.keys(datas).map((key, index) =>
                listOptions.push(
                    <Option key={index} value={String(key)}>
                        <div>
                            <small><b>{datas[key]}</b></small>
                        </div>
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
        let { defaultOption, onSelect, onChange, onClear, value, style, disabled, mode = null, allowClear } = this.props;
        if (['tags', 'multiple'].includes(mode)) {
            value = (value && value.length) ? value.map(v => String(v)) : [];
        }else {
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
                allowClear={allowClear}
                style={{ width: '100%', ...style }}
                onSelect={(value) => onSelect(value)}
                onChange={(value) => onChange(value)}
                onClear={(value) => onClear(value)}
                onSearch={(value) => this.onSearch(value)}
                mode={mode}
                disabled={disabled}
                // tagRender={(tagProps) => { 
                //     const { label, value, closable, onClose } = tagProps;
                //     return <Tag closable={closable} onClose={onClose} style={{ marginRight: 3, paddingBottom: 2, paddingTop: 2 }}>
                //         <span className='ml-1'>{label?.props?.label}</span>
                //     </Tag>
                // }}
            >
                {this.renderOptions()}
            </Select>
        )
    }
}

SkuDeviceDropdown.propTypes = propTypes;
SkuDeviceDropdown.defaultProps = defaultProps;

const mapStateToProps = (state) => {
    
}

const mapDispatchToProps = (dispatch) => {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(SkuDeviceDropdown));