import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';
import { Checkbox } from "antd";

/**
 * @propsType define
 */
const propTypes = {
    style: PropTypes.object,
    defaultValue: PropTypes.any,
    options: PropTypes.any,
    onChange: PropTypes.func,
};
const defaultProps = {
    style: {},
    defaultValue: null,
    onChange: () => { }
}

class CheckboxGroup extends Component {

    /**
      * Render select option
      * @param {Array} locations 
      */
    formatOptions = () => {
        let { options } = this.props;
        if (!options) {
            return [];
        }
        let listOptions = [];
        Object.keys(options).map((key) => {
            listOptions.push({
                value: key,
                label: options[key]
            });
        });
        return listOptions;
    }



    render() {
        let { onChange, defaultValue, value } = this.props;
        return (<Checkbox.Group
            options={this.formatOptions() || []}
            defaultValue={defaultValue || []}
            value={value || []}
            onChange={(value) => onChange(value)} />)
    }
}

CheckboxGroup.propTypes = propTypes;
CheckboxGroup.defaultProps = defaultProps;

export default withTranslation()(CheckboxGroup);