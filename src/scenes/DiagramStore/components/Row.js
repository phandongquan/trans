import React, { Component } from "react";
import { connect } from "react-redux";
import CellCompo from "../components/Cell";
import _groupBy from "lodash/groupBy";
import _map from "lodash/map";

export class Row extends Component {
    constructor(props) {
        super(props)
        this.state = {
            rack: {}
        }
    }
  componentDidMount() {
    this.loadData(this.props.data);
  }

  componentWillReceiveProps(nextProps) {
    this.loadData(nextProps.data);
  }

  loadData = (data) => {
    const rack = _groupBy(data, (c) => {
      return c.rack;
    });
    this.setState({
      rack,
    });
  };

  render() {
    const { aisle, checklist_tracking } = this.props;
    const { rack } = this.state;
    let data = Object.keys(rack);
    data = data.sort();
    return (
      <div className="checklist-container">
        {_map(data, (key) => {
          return (
            <CellCompo
              checklist_tracking={checklist_tracking}
              key={`${aisle}-cell-${key}`}
              data={rack[key]}
              rack={key}
              aisle={aisle}
            />
          );
        })}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Row);
