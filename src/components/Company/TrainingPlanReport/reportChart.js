import React, { Component } from "react";
import {
  Chart,
  Interval,
  Tooltip,
  Axis,
  Coordinate,
  getTheme,
  Interaction
} from "bizcharts";
import { withTranslation } from "react-i18next";
import { getReportChart } from "~/apis/company/TrainingPlan";
class TrainingPlanReportChart extends Component {
  /**
   *
   * @param {*} props
   */
  constructor(props) {
    super(props);
    this.state = {
      reportData: {},
    };
  }
  componentDidMount() {
    this.getTrainingPlanReport();
  }
  getTrainingPlanReport(params = {}) {
    let xhr = getReportChart(params);
    xhr.then((response) => {
      if (response.status) {
        this.setState({
          reportData: response.data?.circle?.[0],
        });
      }
    });
  }
  render() {
    let data = this.state.reportData;
    let total = Number(data.total);
    let active = Number(data.active) - (Number(data.expired) + Number(data.completed));
    let inactive = Number(data.inactive);
    let expired = Number(data.expired);
    let completed = Number(data.completed);
    const datas = [
      {
        item: "Active",
        count: active / total,
        percent: (active * 100) / total,
      },
      {
        item: "Completed",
        count: completed / total,
        percent: (completed * 100) / total,
      },
      {
        item: "Inactive",
        count: inactive / total,
        percent: (inactive * 100) / total,
      },
      {
        item: "Expired",
        count: expired / total,
        percent: (expired * 100) / total,
      },
    ];
    // const colors = datas.reduce((pre, cur, idx) => {
    //   pre[cur.item] = getTheme().colors10[idx];
    //   return pre;
    // }, {});

    const cols = {
      percent: {
        formatter: (val) => {
          return val.toFixed(1) + "%";
        },
      },
    };
    return (
      <div className="card">
        <h4 style={{ padding: "10px", paddingBottom: "0" }}></h4>
        <div className="card-body" style={{ overflowX: "auto" }}>
          <Chart
            height={400}
            data={datas}
            scale={cols}
            interactions={["element-active"]}
            autoFit
          >
            <Coordinate type="theta" radius={0.75} />
            <Tooltip showTitle={false} />
            <Axis visible={false} />
            <Interval
              position="percent"
              adjust="stack"
              color="item"
              style={{
                lineWidth: 1,
                stroke: "#fff",
              }}
              label={[
                "count",
                {
                  content: (datas) => {
                    var num = datas.percent.toFixed(1);
                    return `${datas.item}: ${num}%`;
                  },
                },
              ]}
              state={{
                selected: {
                  style: (t) => {
                    const res = getTheme().geometries.interval.rect.selected.style(
                      t
                    );
                    return { ...res, fill: "red" };
                  },
                },
              }}
            />
            <Interaction type="element-single-selected" />
          </Chart>
        </div>
      </div>
    );
  }
}
export default withTranslation()(TrainingPlanReportChart);
