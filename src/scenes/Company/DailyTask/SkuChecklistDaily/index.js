import { Button, Col, DatePicker, Form, Image, Modal, Row, Table, TimePicker } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { apiListDaily } from '~/apis/company/dailyTask/skuChecklistDaily';
import { showNotify } from '~/services/helper';
import Tab from "~/components/Base/Tab";
import tabListTask from "../config/tabList";
import dayjs from 'dayjs';
import Dropdown from '~/components/Base/Dropdown';
import { dateFormat, typeCountDate, screenResponsive } from '~/constants/basic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { URL_HR } from '~/constants';
import { uniqueId } from 'lodash';

export class SkuChecklistDaily extends Component {
  constructor(props) {
    super(props)
    this.formRef = React.createRef();
    this.state = {
        datas: [],
        visible: false,
        loading: false,
        // limit: 36,
        page: 1,
        total: 0,
        stocks : [] ,
        data : {}
    }
}
/**
 * @lifecycle 
 */
  componentDidMount() {
    this.formRef.current.setFieldsValue({
      date: [dayjs().subtract(7, 'd'), dayjs()],
    })
    let values = this.formRef.current.getFieldsValue();
    this.getListSkuChecklist(values);

    const {
      baseData: { stocks: baseDataStocks },
    } = this.props;
    let tempStocks = [];
    if (baseDataStocks) {
      baseDataStocks.map((s) =>
        tempStocks.push({ id: s.stock_id, name: s.stock_name })
      );
    }
    this.setState({ stocks: tempStocks });
}
async getListSkuChecklist(params = {}){
  this.setState({ loading: true })
  params = {
    ...params,
    page : this.state.page,
  }
  if(params.date) {
    params.from_date = dayjs(params.date[0]).format('YYYY-MM-DD')
    params.to_date = dayjs(params.date[1]).format('YYYY-MM-DD')
    delete params.date
  }
  let response = await apiListDaily(params)
  if(response.status){
    this.setState({ loading: false  , datas : response.data , total : response.total})
  }else{
    showNotify('Notification', response.message , 'error')
    }
  }
  async getDetail (data){
    this.setState({data , visible : true})

  }
  onChangePage(page) {
    this.setState({ page }, () => {
      let values = this.formRef.current.getFieldsValue();
      this.getListSkuChecklist(values)
    })
  }
  /**
   * Submit form
   * @param {*} values
   */
  submitForm = async () => {
    this.setState({ page: 1 }, () => {
      let values = this.formRef.current.getFieldsValue();
      this.getListSkuChecklist(values)
    })
  };
  renderImageSku = (data) => {
    // let { data } = this.state
    let result = []
    if (data.data) {
      let urlThumbnail = data.data.image.replace(
        URL_HR,
        URL_HR + "/thumbnail/100x70"
      );
      result.push(<Image
        preview={{ src: data.data.image }}
        src={urlThumbnail}
        style={{ objectFit: "cover" }}
      />)
    }
    return <div className="mt-2">{result}</div>
  }
  render() {
    let { datas, stocks , data} = this.state
    const {t} = this.props
    const columns = [
      {
        title: "No.",
        render: (r) => datas.indexOf(r) + 1,
        width : 20,
      },
      {
        title : t('image'),
        render : r => r.qty ? 
        this.renderImageSku(r)
        : ''

      },
      {
        title:t('hr:qty'),
        dataIndex : 'qty',
      },
      {
        title:t('instock'),
        dataIndex : 'instock',
      },
      {
        title : t('hr:indate'),
        dataIndex: 'indate',
        sorter: (a, b) => a.instock - b.instock,
      },
      {
        title : 'Sku',
        dataIndex : 'sku',
      },
      {
        title : t('hr:bin_location'),
        dataIndex : 'bin_location',
      },
      {
        title: t("stock"),
        render: (r) => stocks.find((s) => s.id == r.stock_id)?.name,
      },
      {
        title: t("created_by"),
        render: (r) => (
          <span>
            {r.created_user?.name}
            <small>
              <br />{" "}
              {r.created_at
                ? dayjs(r.created_at).format('YYYY-MM-DD HH:mm:ss')
                : ""}
            </small>
          </span>
        ),
      },
      {
        title: t('action'),
        render: r => r.qty ?
          <Button type='primary' size='small' className='m-1' onClick={() => this.getDetail(r)}>
            <FontAwesomeIcon icon={faSearch} />
          </Button>
          : []
      }
    ]
    const columnsCountDate = [
      {
        title:t('image'), 
        width: '30%',
        render: r => {
          if (r.image) {
            let urlThumbnail = r.image.replace(
              URL_HR,
              URL_HR + "/thumbnail/100x70"
            );
            return (
                <Image
                  preview={{ src: r.image }}
                  src={urlThumbnail}
                  style={{ objectFit: "cover" }}
                />
            );
          }
      }
        // <Image src={r.image} width={125} height={125}/>
      },
      {
        title:t('count'), 
        width: '20%',
        align :'center',
        render : r => r.count
      },
      {
        title:t('type'), 
        render : r => typeCountDate[r.dateType]
      },
      {
        title:t('date'), 
        render : r => r.dateValue
      },
  
    ]
    const columnsProductModel = [
      {
        title: t('image'),
        width: '50%',
        render: r => {
          if (r.image) {
            let urlThumbnail = r.image.replace(
              URL_HR,
              URL_HR + "/thumbnail/100x70"
            );
            return (
              <Image
                preview={{ src: r.image }}
                src={urlThumbnail}
                style={{ objectFit: "cover" }}
              />
            );
          }
        }
      },
      {
        title:t('type'), 
        render : r => typeCountDate[r.dateType]
      },
      {
        title:t('date'), 
        render : r => r.dateValue
      },
    ]
    return (
      <div>
        <PageHeader title={t("hr:sku_checklist_daily")} />
        <Row className="card pl-3 pr-3 mb-3">
          <div id="tab_responsive">
            <div className='tab_content_mantenance_device'>
              <Tab tabs={tabListTask(this.props)} />
            </div>
          </div>
          <Form
            className="pt-3"
            ref={this.formRef}
            onFinish={(values) => this.submitForm(values)}
          ><Row gutter={12}>
          {/* <Col span={4}>
            <Form.Item name="sku">
              <Input placeholder="SKU" />
            </Form.Item>
          </Col> */}
          <Col xs={24} sm={24} md={24} lg={6} xl={6}>
            <Form.Item name="date">
              <DatePicker.RangePicker style={{ width: "100%" }} format={dateFormat} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={3} xl={3}>
            <Form.Item name="stock_id">
              <Dropdown datas={this.state.stocks} defaultOption={t('stock')} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={24} lg={5} xl={5} key="submit">
            <Form.Item>
              <Button type="primary" htmlType="submit" className="mr-2">
               {t('search')}
              </Button>
            </Form.Item>
          </Col>
        </Row>

          </Form>
        </Row>
        <Row gutter={[16, 24]}>
        <Col span={24} >
          {/* <Tabs>
            <Tabs.TabPane tab="Báo cáo" key="report"> */}
              <div className="mt-2">
              {window.innerWidth < screenResponsive  ? 
                    <div className='block_scroll_data_table'>
                        <div className='main_scroll_table'> 
                            <Table
                                 dataSource={this.state.datas}
                                 columns={columns}
                                 loading={this.state.loading}
                                 rowKey="id"
                                 pagination={{
                                   pageSize: 30,
                                   showSizeChanger: false,
                                   onChange: page => this.onChangePage(page),
                                   total : this.state.total
                                 }}
                            />
                        </div>
                    </div>
                    :

                <Table
                  dataSource={this.state.datas}
                  columns={columns}
                  loading={this.state.loading}
                  rowKey="id"
                  pagination={{
                    pageSize: 30,
                    showSizeChanger: false,
                    onChange: page => this.onChangePage(page),
                    total : this.state.total
                  }}
                />
                }
              </div>
          {/* </Tabs> */}
        </Col>
      </Row>
        <Modal
          open={this.state.visible}
          onCancel={() => {
            this.setState({visible : false});
          }}
          footer={null}
          title={t('hr:count_date')}
          width={window.innerWidth < screenResponsive  ? "100%": "60%"}
          afterClose={() => {
            this.setState({data : {}});
          }}
        >
          {
            data ?
              <Row gutter={24}>
                <Col span={24}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{t('image')}</span>
                  {this.renderImageSku(data)}
                </Col>
                <Col span={24} className="mt-2">
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{t('hr:count_date')}</span>
                  <div className='block_scroll_data_table'>
                    <div className='main_scroll_table'> 
                      <Table
                        dataSource={data?.data?.count_date}
                        columns={columnsCountDate}
                        loading={false}
                        rowKey={(r) => uniqueId()}
                        pagination={false}
                        className="mt-2"
                      />
                      </div>
                  </div>
                </Col>
                <Col span={24} className="mt-2">
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{t('hr:display')}</span>
                  <div className='block_scroll_data_table'>
                    <div className='main_scroll_table'> 
                      <Table
                        dataSource={[data?.data?.product_model]}
                        columns={columnsProductModel}
                        loading={false}
                        rowKey={(r) => uniqueId()}
                        pagination={false}
                        className="mt-2"
                      />
                      </div>
                  </div>
                </Col>
              </Row>
              : []
          }
          
        </Modal>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  baseData: state.baseData,
  auth: state.auth.info
});
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(SkuChecklistDaily)