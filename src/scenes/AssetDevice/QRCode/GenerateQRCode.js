import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Row,
  Col,
  Form,
  Table,
  Select,
  Input,
  Button,
  Modal,
  InputNumber,
} from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import Dropdown from "~/components/Base/Dropdown";
import { getListType, generate } from "~/apis/qrCode";
import QRCode from "qrcode.react";
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import tabList from "../config/tabList";
import Tab from "~/components/Base/Tab";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackspace, faPrint } from "@fortawesome/free-solid-svg-icons";
import { getHeaderTitle, getWidthColumn, getHeightRow, getHeaderHeight } from './config/GenQRCodeConfig';
import tabsQR from "./config/tabsQR";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import moment from 'moment'
import XLSX from 'xlsx';


export class GenerateQRCode extends Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.state = {
      datas: [],
      exportEnable: false,
      loading: false,
      datasType: [],
      imgElement: [],
    };
  }
  componentDidMount() {
    this.formRef.current.setFieldsValue({ size: 5 });
    // this.getListType();
    if(this.state.datas.length > 0){
      this.setState({exportEnable: true})
    }
  }
  // async getListType() {
  //   let response = await getListType();
  //   if (response.status) {
  //     this.setState({ datasType: response.data.types });
  //   }
  // }

  async generateQR() {
    let values = this.formRef.current.getFieldsValue();
    let params = {
      ...values,
    };
    let response = await generate(params);
    if (response.status) {
      this.setState({ datas: response.data });
    }
  }
  resultHasData() {
    const { datas } = this.state;
    return datas.length > 0;
  }
  exportQRToExcel = async () => {
    const { datas } = this.state;
    this.setState({loading : true})
    let imageUrls = []
    if (datas?.length) {
      datas.forEach((v) => {
        let params = {
          key: "qr_mapping",
          code: v,
        };
        imageUrls.push(`https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${JSON.stringify(params)}`)
      });
    }
    // Return an array of img elements with the generated image URLs
    const base64Images = [];
    // Download and convert images to base64
    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i];
      try {
        const response = await fetch(imageUrl);
        if (response.ok) {
          const blob = await response.blob();
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          await new Promise((resolve) => {
            reader.onloadend = () => {
              base64Images[i] = reader.result; // Store the image in the correct position
              resolve();
            };
          });
        } else {
          console.error(
            `Error fetching image from URL: ${imageUrl}, Status: ${response.status}`
          );
        }
      } catch (error) {
        console.error("Error fetching or converting image:", error);
      }
      this.setState({loading : false})

    }
    const workbook = new ExcelJS.Workbook();
    let header = getHeaderTitle();
    const worksheet = workbook.addWorksheet('Images');
    worksheet.addRows(header);
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    base64Images.map((base64, index) => {
      const rowNumber = index + 1;
      const imageId = workbook.addImage({
        base64: base64,
        extension: 'png',
      });
      worksheet.addImage(imageId, {
        tl: { col: 0, row: rowNumber },
        br: { col: 1, row: rowNumber + 1 }, 
        // size QRCode in excel
        ext: { width: 100, height: 100 }, 
      });
      worksheet.columns[0].width = 30;
      worksheet.getRow(rowNumber).height = 100;
    });
    const lastRowNumber = base64Images.length + 1; 
    worksheet.getRow(lastRowNumber).height = 100; 
    // Code column format
    datas.map((code, index) => {
      worksheet.getCell(`B${index + 2}`).value = code;
      worksheet.getColumn('B').width = 30;
    });
    // Value column format 
    datas.map((code, index) => {
      worksheet.getCell(`C${index + 2}`).value = JSON.stringify({
        key: "qr_mapping",
        code: code,
      });
      worksheet.getColumn('C').width = 50;
    });
    const customRowHeight = 20; // Specify the desired height
    worksheet.getRow(1).height = customRowHeight; // Set the height
    workbook.xlsx.writeBuffer().then((buffer) => {
      saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'qccode' + `-${moment().format('YYYY-MM-DD')}.xlsx`);
    });
  }
  renderQR() {
    let { datas } = this.state;
    let result = [];
    let values = this.formRef.current?.getFieldsValue();
    if (datas?.length) {
      datas.forEach((v) => {
        let params = {
          key: "qr_mapping",
          type: values?.type,
          code: v,
        };
        result.push(
          <Col span={4} key={v}>
            <div className="text-center">
              <div>
                <QRCode
                  id="qrCode"
                  value={JSON.stringify(params)}
                  style={{ marginTop: 20, marginBottom: 20 }}
                />
              </div>
              <span>{v}</span>
            </div>
          </Col>
        );
      });
    }

    return <Row gutter={[24, 24]}>{result}</Row>;
  }
  render() {
    const {t} = this.props
    return (
      <div>
        <PageHeader title="Bài test" />
        <Row className="card pl-3 pr-3 mb-3">
          <Tab tabs={tabList(this.props)} />
          <Form
            className="pt-3"
            ref={this.formRef}
            onFinish={(values) => this.generateQR()}
          >
            <Row gutter={12}>
              <Col span={4}>
                <Form.Item name="size">
                  <InputNumber
                    placeholder="Nhập số lượng"
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              {/* <Col span={4}>
                <Form.Item name="type">
                  <Dropdown datas={this.state.datasType} defaultOption="-- All Types --"/>
                </Form.Item>
              </Col> */}
              <Col span={5} key="submit" className="d-flex">
                <Button type="primary" htmlType="submit" className="mr-2">
                  Generate
                </Button>
                <Button
                  type="primary"
                  style={{ display: this.resultHasData() ? 'block' : 'none' }}
                  onClick={() => this.exportQRToExcel()}
                  loading={this.state.loading}
                >
                  Export
                </Button>
              </Col>
            </Row>
          </Form>
        </Row>
        <Row>
          <Col span={24} className="p-3">
          {this.state.datas.length > 0 ? (
            <div>
              <div className="card p-3" style={{ display: "block" }}>
                <div className="float-right">
                  <Link
                    to={{
                      pathname: `/qrcode/print`,
                      search: `?code=${this.state.datas}`
                    }}
                    target="_blank"
                  >
                    <Button type="primary" className="mr-2" icon={<FontAwesomeIcon icon={faPrint} />}
                    >
                      &nbsp;Print
                    </Button>
                  </Link>
                </div>
                {this.renderQR()}
              </div>
            </div>

          ) : null}
          </Col>
        </Row>
        {/* <Button onClick={() => this.props.history.push("/qrcode/list")}
          icon={<FontAwesomeIcon icon={faBackspace} />}>
          &nbsp;Back
        </Button> */}
        {
          this.state.imgElement
        }
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
const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(GenerateQRCode);
