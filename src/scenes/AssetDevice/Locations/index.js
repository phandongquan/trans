import React, { Component } from "react";
import { connect } from "react-redux";
import { Table, Button, Row, Modal, Form, Input, Col } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import tabList from "../config/tabList";
import Tab from "~/components/Base/Tab";
import { list as apiListGroup, connectAsset } from "~/apis/assetDevice/group";
import { listLocation } from '~/apis/assetDevice'
// import { getList as apiGetList } from '~/apis/assetDevice'
import Dropdown from "~/components/Base/Dropdown";
import { typeAssetLocation } from "../config";
import {screenResponsive} from '~/constants/basic';

export class AssetLocations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      datas: [],
      selectedRowKeys: [],
      visible: false,
      groups: [],
      locationGroups: [],
    };
    this.formSearchRef = React.createRef();
    this.formRef = React.createRef();
  }
  componentDidMount() {
    this.getListLocationGroups();
    this.getListGroup();
  }

  /**
   * Get list location groups
   */
  getListLocationGroups = (params = {}) => {
    let xhr = listLocation(params)
    xhr.then(res => res.status && this.setState({ locationGroups: res.data }))
  };

  /**
   * Get list group
   */
  getListGroup = () => {
    let xhr = apiListGroup();
    xhr.then((res) => {
      if (res.status) {
        this.setState({ groups: res.data.rows });
      }
    });
  };

  /**
   * Submit search form
   * @param {*} values 
   */
  submitSearchForm = values => {
    this.getListLocationGroups(values)
  }

  /**
   * OnSelect change
   * @param {*} selectedRowKeys
   */
  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  };
  /**
   * Click add group
   * @param {*} asset
   */
  clickAddGroup = (asset) => {
    this.setState({ visible: true }, () => {
      if (this.formRef.current) {
        this.formRef.current.setFieldsValue({
          asset_id: asset.id,
          group_id: asset.location?.id,
        });
      }
    });
  };
  /**
   * Handle submit form
   */
  handleSubmitForm = () => {
    this.formRef.current
      .validateFields()
      .then((values) => {
        this.submitForm(values);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  /**
   * Submit form
   * @param {*} values
   */
  submitForm = (values) => {
    values.type = typeAssetLocation;
    if (this.state.selectedRowKeys.length) {
      values = {
        ...values,
        asset_id: this.state.selectedRowKeys,
      };
    }
    let valuesSearch = this.formSearchRef.current.getFieldsValue()
    let xhr = connectAsset(values);
    xhr.then((res) => {
      if (res.status) {
        this.getListLocationGroups(valuesSearch);
        this.setState({ visible: false, selectedRowKeys: [] });
      }
    });
  };

  render() {
    let {
      t, baseData: { locations },
    } = this.props;
    let { selectedRowKeys, locationGroups } = this.state;
    const columns = [
      {
        title: "No.",
        render: (r) => locationGroups.indexOf(r) + 1,
      },
      {
        title: t("alias"),
        dataIndex: "alias",
      },

      {
        title: t("name"),
        dataIndex: "name",
      },
      {
        title: t("address"),
        dataIndex: "address",
      },
      {
        title: t("group"),
        render: (r) => {
            if(r.location) {
                return <Button type='link' onClick={() => this.clickAddGroup(r)}>{r.location?.name}</Button>
            } 
            return (<Button
                type="primary"
                size="small"
                icon={<FontAwesomeIcon icon={faPlus} />}
                onClick={() => this.clickAddGroup(r)}
              >
                {t("add") +t(' ')+ t('group')}
              </Button>)
        },
        align: "center",
      },
    ];
    const rowSelection = {
      selectedRowKeys,
      onChange: (value) => this.onSelectChange(value),
    };

    const hasSelected = selectedRowKeys.length > 0;
    return (
      <>
        <PageHeader title={t('hr:branch')} />
        <Row className="card pl-3 pr-3 mb-3">
          <div id="tab_responsive">
            <div className='tab_content_mantenance_device'>
              <Tab tabs={tabList(this.props)} />
            </div>
          </div>
          <Form
            className="pt-3"
            ref={this.formSearchRef}
            name="searchLocationsForm"
            onFinish={this.submitSearchForm.bind(this)}
            layout="vertical"
          >
            <Row gutter={12}>
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <Form.Item name="group_id">
                  <Dropdown
                    datas={this.state.groups}
                    defaultOption={t('group')}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                <Form.Item name="location_id">
                  <Dropdown
                    datas={locations}
                    defaultOption={t('hr:all_location')}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                    >
                     {t('search')}
                    </Button>
                  </Form.Item>
              </Col>
            </Row>
          </Form>
        </Row>
        <div className="mb-2" style={{ height: 35 }}>
          {hasSelected ? (
            <Button
              icon={<FontAwesomeIcon icon={faPlus} />}
              onClick={() => this.setState({ visible: true })}
              type="primary"
            > 
             {t('add') + selectedRowKeys.length + t('brach') + t(' ') + t('hr:to_group')}
            
            </Button>
          ) : (
            ""
          )}
        </div>
        {window.innerWidth < screenResponsive  ? 
              <div className='block_scroll_data_table'>
                  <div className='main_scroll_table'> 
                      <Table
                            columns={columns}
                            rowKey="id"
                            dataSource={locationGroups}
                            pagination={false}
                            rowSelection={rowSelection}
                      />
                  </div>
              </div>
              :
            <Table
              columns={columns}
              rowKey="id"
              dataSource={locationGroups}
              pagination={false}
              rowSelection={rowSelection}
            />
        }
        <Modal
          open={this.state.visible}
          onCancel={() =>
            this.setState({ visible: false, selectedRowKeys: [] })
          }
          onOk={this.handleSubmitForm.bind(this)}
        >
          <Form className="p-3" ref={this.formRef}>
            <Form.Item
              name="group_id"
              rules={[{ required: true, message: t('hr:please_select') + t(' ') + t('group')}]}
            >
              <Dropdown datas={this.state.groups} />
            </Form.Item>
            <Form.Item name="asset_id" hidden>
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.auth.info,
    baseData: state.baseData,
  };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(AssetLocations);
