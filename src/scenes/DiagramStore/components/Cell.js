import React, { Component } from "react";
import { connect } from "react-redux";
import _groupBy from "lodash/groupBy";
import _forEach from "lodash/forEach";
import _map from "lodash/map";
import _findLast from "lodash/findLast";

const Aux = props => props.children;
export class Cell extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasMore1shelf: true,
      levelWidth: 1,
      firstshelf: [],
      upshelf: {},
    };
  }
  componentDidMount() {
    this.loadData(this.props.data);
  }

  loadData = (data) => {
    const cell = _groupBy(data, (c) => {
      return c.shelf;
    });
    const hasMore1shelf = cell.hasOwnProperty("02");
    let levelWidth = 1;
    let firstshelf = {};
    let upshelf = {};
    _forEach(cell, (value, key) => {
      _map(value, (c) => {
        if (parseInt(c.bin) > levelWidth) levelWidth = parseInt(c.bin);
        if (key === "01") {
          firstshelf = value;
        } else {
          upshelf[key] = value;
        }
      });
    });
    if (levelWidth === 1) levelWidth = 2;

    this.setState({
      hasMore1shelf,
      levelWidth,
      firstshelf,
      upshelf,
    });
  };

  getColor = (code) => {
    const selectChecked = _findLast(this.props.checklist_tracking, (c) => {
      return c.code === code;
    });
    let color = null;
    if (selectChecked) {
      if (selectChecked.status === 1) color = "orange";
      if (selectChecked.status === 2) color = "#28a745";
      if (selectChecked.status === 3) color = "#337ab7";
    }
    return color;
  };

  getTitle = (code) => {
    const selectChecked = _findLast(this.props.checklist_tracking, (c) => {
      return c.code === code;
    });
    let status = "Chưa count";
    if (selectChecked) {
      if (selectChecked.status === 1) status = "Đang count";
      if (selectChecked.status === 2) status = "Đã count xong";
      if (selectChecked.status === 3) status = "Đã count(kệ trống)";
    }
    return selectChecked
      ? `${code}\n${selectChecked.user_name}\n(${selectChecked.user_id})\n${status}`
      : `${code}\n${status}`;
  };

  render() {
    const { data, rack } = this.props;
    const { hasMore1shelf, levelWidth, firstshelf, upshelf } = this.state;
    let upshelfArray = Object.keys(upshelf);
    upshelfArray.sort().reverse();
    return (
      <div className="checklist-section" style={{ width: levelWidth * 40 }}>
        {hasMore1shelf ? (
          <Aux>
            <div style={{ height: "80%", width: "100%" }}>
              {_map(upshelfArray, (c) => {
                const height = 100 / upshelfArray.length;
                return (
                  <div
                    key={`cell-item-${c}`}
                    className="checklist-item"
                    style={{ width: "100%", height: `${height}%` }}
                  >
                    {_map(upshelf[c], (p, i) => {
                      const width = 100 / upshelf[c].length;
                      return (
                        <div
                          key={`cell-item-item-${i}`}
                          data-toggle="tooltip"
                          data-placement="bottom"
                          data-original-title={this.getTitle(p.code)}
                          className="checklist-item"
                          style={{
                            width: `${width}%`,
                            height: "100%",
                            backgroundColor: this.getColor(p.code),
                          }}
                        ></div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            <div style={{ height: "20%", width: "100%" }}>
              {_map(firstshelf, (c, i) => {
                const width = 100 / firstshelf.length;
                return (
                  <div
                    key={`cell-item-first$-${i}`}
                    data-toggle="tooltip"
                    data-placement="top"
                    data-original-title={this.getTitle(c.code)}
                    className="checklist-item"
                    style={{
                      width: `${width}%`,
                      height: "100%",
                      backgroundColor: this.getColor(c.code),
                    }}
                  ></div>
                );
              })}
            </div>
            <div
              style={{
                position: "absolute",
                bottom: -20,
                width: "100%",
                left: 0,
                textAlign: "center",
              }}
            >
              {rack}
            </div>
          </Aux>
        ) : (
          <Aux>
            <div style={{ height: "100%", width: "100%" }}>
              {_map(firstshelf, (c, i) => {
                const width = 100 / firstshelf.length;
                return (
                  <div
                    key={`cell-item-first$-${i}`}
                    data-toggle="tooltip"
                    data-placement="bottom"
                    data-original-title={this.getTitle(c.code)}
                    className="checklist-item"
                    style={{
                      width: `${width}%`,
                      height: "100%",
                      backgroundColor: this.getColor(c.code),
                    }}
                  ></div>
                );
              })}
            </div>
            <div
              style={{
                position: "absolute",
                bottom: -20,
                width: "100%",
                left: 0,
                textAlign: "center",
              }}
            >
              {rack}
            </div>
          </Aux>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Cell);
