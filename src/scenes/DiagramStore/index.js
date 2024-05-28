import React, { Component } from "react";
import { connect } from "react-redux";
import { Form, Row, Col, DatePicker, Button, Input, Select } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { faSearch } from "@fortawesome/free-solid-svg-icons";

// Components
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import StockDropdown from "~/components/Base/StockDropdown";
import Dropdown from "~/components/Base/Dropdown";
import RowCompo from './components/Row';

import { getList as apiGetList } from "~/apis/diagram/binLocation";
import _groupBy from 'lodash/groupBy';
import { area, zone } from "./configs";
import './configs/diagramStore.scss';
import Tab from "~/components/Base/Tab";
import tabList from "../Company/DailyTask/config/tabList";

export class index extends Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.state = {
      datas: [],
      row: {}
    };
  }
  componentDidMount() {
    this.formRef.current.setFieldsValue({ stock_id: 1005, zone: 'F1', area: 'A1' });
    let values = this.formRef.current.getFieldsValue();
    this.getChecklistTracking(values);
  }

  /**
   * Get list tracking
   */
  getChecklistTracking = async (params = {}) => {
    params = {
      ...params,
      pageNum: 1,
      perPage: 1000
    }
    let res = await apiGetList(params);
    if (res) {
      const row = _groupBy( res.data.docs, c => { return c.aisle });
      this.setState({ datas: res.data.docs, row });
    }
  };

  render() {
    const {t} = this.props;
    const { row } = this.state;
    return (
      <>
        <PageHeader title={"Diagram Store"} />
        <Row className="card p-3">
          <div id="tab_responsive">
            <div className='tab_content_mantenance_device'>
              <Tab tabs={tabList(this.props)} />
            </div>
          </div>
          <Form ref={this.formRef} className="mt-3">
            <Row gutter={12}>
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <Form.Item>
                  <DatePicker.RangePicker className="w-100" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <Form.Item name="stock_id">
                  <StockDropdown />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                <Form.Item name="zone">
                  <Dropdown datas={zone} defaultOption={t('hr:choose_zone')} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                <Form.Item name="area">
                  <Dropdown datas={area} defaultOption={t('hr:choose_area')} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={4} xl={4}>                
                  <Button
                    type="primary"
                    icon={<FontAwesomeIcon icon={faSearch} />}
                  >
                   {t('search')}
                  </Button>
              </Col>
            </Row>
          </Form>
        </Row>
        <Row className="mt-3 p-3 card">
          {Object.keys(row).map((key) => {
            return (
              <div className = 'block_scroll_diagrame_store'>
                <div key={`row-${key}`} className="checklist-scroll">
                  <RowCompo
                    checklist_tracking={this.state.checklist_tracking}
                    data={this.state.row[key]}
                    aisle={key}
                  />
                </div>
              </div>
            );
          })}
        </Row>
      </>
    );
  }
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(index);
