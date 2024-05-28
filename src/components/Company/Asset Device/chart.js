import React, { Component } from "react";
import {
  Axis,
  Chart,
  // Tooltip,
  Line,
  Point,
  Legend,
  View,
  Slider,
  Interval,
} from 'bizcharts';
import { connect } from 'react-redux';
import { isEqual } from 'lodash'

import { withTranslation } from "react-i18next";
import { getChart } from '~/apis/assetDevice'
import PoTable from "./StockTable";

class AssetDeviceChart extends Component {
  /**
   *
   * @param {*} props
   */
  constructor(props) {
    super(props);
    this.state = {
      dataChart: [],
      datas: [],
    };
  }

  /**
   * 
   */
  componentDidMount() {
    this.getChartAssetDevice(this.props.params);
  }

  /**
   * 
   * @param {*} prevProps 
   */
  componentDidUpdate(prevProps) {
    if(!isEqual(prevProps.params, this.props.params)) {
      this.getChartAssetDevice(this.props.params); 
    }
  }

  /**
   * 
   * @param {*} params 
   */
  getChartAssetDevice(params = {}) {
    let xhr = getChart(params);
    xhr.then((response) => {
      if (response.status) {
        this.setState({
          datas: response.data,
        });
      }
    });
  }

  /**
   * 
   * @param {*} datas 
   * @returns 
   */
  formatData(datas) {
    let result = [];
    let {
      baseData: { locations },
    } = this.props;
    if (Array.isArray(datas) && datas.length) {
      datas.map((n) => {
        let locFindName = locations.find((l) => l.id == n.location_id)?.name
        let locNameSplit = locFindName?.split(' - ')[0]
        result.push(
          {
            location_id: n.location_id,
            date: locNameSplit,
            type: "total",
            level: "Tất cả",
            value: n.total,
          },
          {
            location_id: n.location_id,
            date: locNameSplit,
            type: "finished",
            level: "Đã gắn QR",
            value: n.total - n.unfinished,
          }
        
        );
      });
    }
    return result;
  }

  /**
   * 
   * @returns 
   */
  render() {
    let {
      t,
      baseData: { locations },
      params,
      isReport
    } = this.props;
    let { datas } = this.state;
    let data = this.formatData(datas )
    let chartIns;
    const len = (data?.length && data.length / 3) || 6;
    const sliderStart = (len - 6) / len;
    const ratioConvert = (num) => {
      if (num === null || typeof num === "undefined") return "--";
      const multi = 1000;
      const res = Math.floor(num * multi) / 10;
      return typeof res === "number" ? `${res}%` : "--";
    };

    const scale = {
      date: {
        sync: true,
      },
      type: {
        values: ["purchase_receive_amount", "sale_amount"],
      },
      value: {
        alias: "Số lượng thiết bị",
        min: 0,
        tickCount: 8,
        type: "linear-strict",
      },
      rate: {
        alias: "123",
        tickCount: 8,
        formatter: (data) => ratioConvert(data),
        type: "linear-strict",
      },
    };

    const colors = ['#868e96',  "#0284FD", "#3895FF", "#8272EC"];
    const handleChartClick = (ev) => {
      if(ev.data?.data) {
        window.open(`/asset-device?location_id=${ev.data.data.location_id}&is_has_qr=${ev.data.data.type == 'finished' ? 1 : ''}`, '_blank')
      }
    };

    return (
      <div className="card p-3">
        <Chart
          padding={[60, 60, 90, 60]}
          scale={scale}
          autoFit
          height={500}
          data={data}
          onGetG2Instance={(chart) => {
            chartIns = chart;
          }}
          onClick={handleChartClick}
        >
          <Interval
            position="date*value"
            label={[
              "value",
              {
                position: "middle",
                style: {
                  fill: "#000",
                },
              },
            ]}
            color={["level", [colors[0], colors[1], colors[2]]]}
            adjust={[
              {
                type: "dodge",
                dodgeBy: "type",
                marginRatio: 0,
              },
              {
                type: "stack",
              },
            ]}
          ></Interval>
          <View scale={scale} padding={0}>
            <Legend name="rateType" />
            <Axis name="rate" title position="right" />
          </View>
          <Axis name="value" title position="left" />
          <Slider start={sliderStart} />
        </Chart>
        {params.location_id && !isReport ? <PoTable params={params} /> : ''}
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
      auth: state.auth.info,
      baseData: state.baseData
  };
}
const mapDispatchToProps = (dispatch) => {
  return {};
}
export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(AssetDeviceChart));
