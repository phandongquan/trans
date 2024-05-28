import React, { Component } from "react";
import { connect } from "react-redux";
import { Image, Row, Col, Table, Button } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import Tab from "~/components/Base/Tab";
import tabList from "../config/tabList";
import { list as apiGetList } from "~/apis/assetDevice/criterion_log";
import { list as apiGetDeviceLog } from "~/apis/assetDevice/device_log";
import { getMaintenaceByAsset } from "~/apis/assetDevice/group";
import { uniqueId } from "lodash";
import {
  historyParams,
  timeFormatStandard,
  getThumbnailHR,
  getURLHR,
  returnMediaType,
  historyReplace,
} from "~/services/helper";
import { dateFormat, dateTimeFormat } from "~/constants/basic";
import dayjs from "dayjs";
import Barcode from "react-barcode";
import "./config/crirerionLog.scss";
import { typeAssetDevice } from "../config";

export class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      datas: [],
      parts: [],
      asset: null,
      deviceLogs: [],
      location: null
    };
  }

  componentDidMount() {
    let params = historyParams();
    if (params.asset_id) {
      this.getMaintenace(params.asset_id, {type: params.type });
    }
    if (params.date) {
      params.date = dayjs(params.date);
    }
    this.getListLog(params);
    this.getDeviceLog({ asset_id: params.asset_id, type: params.type });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.location.search != prevProps.location.search) {
      let params = historyParams();
      if (params.asset_id) {
        this.getMaintenace(params.asset_id, { type: params.type });
      }
    }
  }

  /**
   * Get detail asset
   * @param {*} id
   */
  getMaintenace = (id, params = {}) => {
    let xhr = getMaintenaceByAsset(id, params);
    xhr.then((res) => {
      this.setState({
        parts: res.data?.asset_device_part || [],
        asset: res.data?.asset || [],
        location: res.data?.location || [],
      });
    });
  };

  /**
   * Get device logs
   * @param {*} params
   */
  getDeviceLog = (params = {}) => {
    let xhr = apiGetDeviceLog(params);
    xhr.then((res) => {
      this.setState({ deviceLogs: res.data.rows });
    });
  };

  /**
   * Get list logs
   */
  getListLog = (params = {}) => {
    let paramsReplace = {
      ...params,
      date: params.date ? timeFormatStandard(params.date, dateFormat) : "",
    };
    historyReplace(paramsReplace);
    if (params.date) {
      params.from_date = timeFormatStandard(params.date, dateFormat);
      params.to_date = timeFormatStandard(params.date, dateFormat);
      delete params.date;
    }
    let xhr = apiGetList(params);
    xhr.then((res) => {
      if (res.status) {
        this.setState({ datas: res.data.rows });
      }
    });
  };

  /**
   * Render images
   * @param {*} imgs
   * @returns
   */
  renderImages = (imgs) => {
    let result = [];
    imgs.map((i) => {
      if (returnMediaType(i) == 1) {
        result.push(
          <span className="mr-1" key={uniqueId("__image")}>
            <Image
              className="ml-1"
              style={{ objectFit: "cover" }}
              src={getThumbnailHR(i, '240x360')}
              width={120}
              height={80}
              preview={{ src: getURLHR(i) }}
            />
          </span>
        );
      }
      if (returnMediaType(i) == 3) {
        result.push(
          <span className="mr-1" key={uniqueId("__image")}>
            <video
              controls
              style={{ backgroundColor: "black" }}
              src={getURLHR(i)}
              width={200}
              height={130}
            />
          </span>
        );
      }
    });
    return result;
  };

  /**
   * On search
   * @param {*} values
   */
  onSearch = (values) => {
    this.getListLog(values);
  };

  /**
   * Render diagram criterion log
   * @returns
   */
  renderCriterionLogDiagram = () => {
    let params = historyParams();
    const { datas, parts } = this.state;

    let headers = {
      count: "No.",
      //   part_name: "Bộ phận",
      criterion_name: "Tiêu chuẩn",
      staff_id: "Người thực hiện",
      current_status: "Tình trạng thiết bị",
      images_before: "Hình ảnh trước bảo trì",
      images_after: "Hình ảnh sau bảo trì",
      solution: "Biện pháp xử lý",
      solution_next: "Hướng xử lý tiếp theo",
    };

    return (
      <table className="diagram-criterion-log">
        <tbody>
          <tr>
            {Object.keys(headers).map((key) => (
              <td className="td-header" key={uniqueId('__header')}>
                {headers[key]}
              </td>
            ))}
          </tr>
          {parts.map((part, indexPart) => {
            let result = [];
            result.push(
              <tr>
                <td className="td-part" colSpan={9}>
                  {part.name}
                </td>
              </tr>
            );
            if (part.criterions && Array.isArray(part.criterions)) {
              let trs = [];
              if (part.criterions.length > 0) {
                part.criterions.map((cri, indexCri) => {
                  let logFound = datas.filter(
                    (d) => d.asset_id == params.asset_id && d.crit_id == cri.id
                  );
                  let tds = [];
                  Object.keys(headers).map((key) => {
                    switch (key) {
                      case "count":
                        if (indexCri == 0) {
                          tds.push(
                            <td key={key} rowSpan={part.criterions.length}>
                              {indexPart + 1}
                            </td>
                          );
                        }
                        break;
                      //   case "part_name":
                      //     if (indexCri == 0) {
                      //       tds.push(
                      //         <td key={key} rowSpan={part.criterions.length}>
                      //           {part.name}
                      //         </td>
                      //       );
                      //     }
                      //     break;
                      case "criterion_name":
                        tds.push(<td key={key}>{cri.name}</td>);
                        break;
                      case "staff_id":
                        if (typeof logFound[0] == "undefined") {
                          tds.push(<td></td>);
                          break;
                        }
                        tds.push(
                          <td key={key} style={{lineHeight: '1.2'}}>
                            {logFound[0]?.staff?.staff_name}{" "}
                            <small>
                              <strong>#{logFound[0]?.staff?.code}</strong>
                            </small>
                          </td>
                        );
                        break;
                      case "current_status":
                        if (typeof logFound[0] == "undefined") {
                          tds.push(<td></td>);
                          break;
                        }
                        tds.push(<td key={key}>{logFound[0].current_status}</td>);
                        break;
                      case "images_before":
                        if (typeof logFound[0] == "undefined") {
                          tds.push(<td></td>);
                          break;
                        }
                        tds.push(
                          <td>
                            {this.renderImages(logFound[0].images_before)}
                          </td>
                        );
                        break;
                      case "images_after":
                        if (typeof logFound[0] == "undefined") {
                          tds.push(<td></td>);
                          break;
                        }
                        tds.push(
                          <td>{this.renderImages(logFound[0].images_after)}</td>
                        );
                        break;
                      case "solution":
                        if (typeof logFound[0] == "undefined") {
                          tds.push(<td></td>);
                          break;
                        }
                        tds.push(<td>{logFound[0].solution}</td>);
                        break;
                      case "solution_next":
                        if (typeof logFound[0] == "undefined") {
                          tds.push(<td></td>);
                          break;
                        }
                        tds.push(<td>{logFound[0].solution_next}</td>);
                        break;
                      default:
                        break;
                    }
                  });
                  trs.push(<tr>{tds}</tr>);
                });
              } else {
                trs.push(
                  <tr>
                    <td>{indexPart + 1}</td>
                    <td>{part.name}</td>
                    {/* <td></td> */}
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                );
              }
              result.push(trs);
            }
            return result;
          })}
        </tbody>
      </table>
    );
  };

  render() {
    let params = historyParams();
    const { asset, deviceLogs, location } = this.state;

    const columns = [
      {
        title: "Ngày bảo trì",
        render: (r) => <Button type="link" onClick={() => this.getListLog({ asset_id: params.asset_id, date: r.date, type: params.type })}>{timeFormatStandard(r.date, dateFormat)}</Button>,
      },
      {
        title: "Nhân viên",
        render: (r) => {
          let result = [];
          if (Array.isArray(r.assgin_to_staff)) {
            r.assgin_to_staff.map((staff) =>
              result.push(
                <div key={staff.staff_id}>
                  {staff.staff_name} <strong><small>#{staff.code}</small></strong>
                </div>
              )
            );
          }
          return result;
        },
      },
    ];

    return (
      <>
        <PageHeader title="Lịch sử bảo trì" />
        <Row className="card mb-3 p-3">
          <Tab tabs={tabList(this.props)} />
          <Row className="mt-3">
            {params.type == typeAssetDevice ? (
              <>
                <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                  <Row gutter={12}>
                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>Tên thiết bị</Col>
                    <Col xs={24} sm={24} md={24} lg={18} xl={18}>
                      <strong className="ml-2">{asset?.product_name}</strong>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>Label Code</Col>
                    <Col xs={24} sm={24} md={24} lg={18} xl={18}>
                      <span className="ml-2">{asset?.code}</span>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>Product SKU</Col>
                    <Col xs={24} sm={24} md={24} lg={18} xl={18}>
                      <span className="ml-2">{asset?.product_sku}</span>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>Ngày bảo trì</Col>
                    <Col xs={24} sm={24} md={24} lg={18} xl={18}>
                      <strong className="ml-2">{params?.date}</strong>
                    </Col>
                  </Row>
                </Col>
                <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                  <Row gutter={12}>
                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>Assigned To</Col>
                    <Col xs={24} sm={24} md={24} lg={18} xl={18}>
                      {console.log(asset)}
                      <strong className="ml-2">{asset?.staff?.staff_name} #{asset?.staff?.code}</strong>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={6} xl={6}>Stock</Col>
                    <Col xs={24} sm={24} md={24} lg={18} xl={18}>
                      <span className="ml-2">{asset?.stock?.stock_name}</span>
                    </Col>
                  </Row>
                </Col>
                <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                  <Barcode value={asset?.code} height={60} />
                </Col>
              </>
            ) : (
              <div>
                Tên chi nhánh: <strong>{location?.name}</strong> <br />
                Ngày bảo trì: <strong>{params?.date}</strong> <br />
              </div>
            )}
          </Row>
        </Row>
        <Row gutter={12}>
          <Col xs={24} sm={24} md={24} lg={18} xl={18}>{this.renderCriterionLogDiagram()}</Col>
          <Col xs={24} sm={24} md={24} lg={6} xl={6}>
            <Table
              columns={columns}
              dataSource={deviceLogs}
              pagination={false}
              rowKey="id"
            />
          </Col>
        </Row>
      </>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(index);
