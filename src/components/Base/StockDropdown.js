import React, { Component } from "react";
import { connect } from "react-redux";
import { Select } from "antd";
import PropTypes from "prop-types";
import { getList } from "~/apis/inventory/stock";

const propTypes = {
  defaultOption: PropTypes.string,
  onChange: PropTypes.func,
  onSelect: PropTypes.func,
  onSearch: PropTypes.func,
  onClear: PropTypes.func,
};

const defaultProps = {
  defaultOption: "-- Choose Stock --",
  onChange: () => {},
  onSelect: () => {},
  onSearch: () => {},
  onClear: () => {},
};

export class StockDropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.getListStock();
  }

  /**
   * Get list stock from ws
   */
  getListStock = async () => {
    let res = await getList();
    if (res.status) {
      let { rows } = res.data
      rows.push({stock_name: '499 Trần Hưng Đạo', stock_id: 1140});
      rows.push({stock_name: '197 Trần Hưng Đạo', stock_id: 1142});
      rows.push({stock_name: '7 Tỉnh Lộ 43', stock_id: 1146});
      this.setState({ datas: rows });
    }
  };

  /**
   * Render options
   */
  renderOptions = () => {
    const { Option } = Select;
    const { datas } = this.state;
    let listOptions = [];
    if (Array.isArray(datas) && datas.length) {
      datas.map((data, index) =>
        listOptions.push(
          <Option key={index} value={data.stock_id}>
            {data.stock_name}
          </Option>
        )
      );
    }
    return listOptions;
  };

  render() {
    let {
      defaultOption,
      onSelect,
      onChange,
      onClear,
      value,
      style,
    } = this.props;
    return (
      <Select
        showSearch={true}
        placeholder={defaultOption}
        value={value}
        onSelect={(value) => onSelect(value)}
        onChange={(value) => onChange(value)}
        onClear={(value) => onClear(value)}
        style={{ width: '100%', ...style }}
      >
        {this.renderOptions()}
      </Select>
    );
  }
}

StockDropdown.propTypes = propTypes;
StockDropdown.defaultProps = defaultProps;

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(StockDropdown);
