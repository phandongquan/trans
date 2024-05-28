import React, { Component } from 'react'
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Table, Row, Col } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tab from '~/components/Base/Tab';
import constTablist from '~/scenes/Company/config/tabListDocument'
import { getDocumentRead } from '~/apis/company/document/read';
import { Link } from 'react-router-dom';
import { timeFormatStandard , parseIntegertoTime } from '~/services/helper';
import {screenResponsive} from '~/constants/basic';
const dateFormat = 'HH:mm DD/MM/YY';

class DocumentRead extends Component {
  /**
     * 
     * @param {*} props 
     */
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.state = {
      loading: false,
      limit: 100,
      page: 1,
      total: 0,
      datas: []
    };
  }
  /**
     * @lifecycle
     */
  componentDidMount() {
    this.getDocumentRead();
  }
  async getDocumentRead(){
    this.setState({loading : true})
    let params = {
      limit : this.state.limit,
      offset : this.state.limit * (this.state.page - 1)
    }
    let response = await getDocumentRead(params)
    if(response.status){
      this.setState({loading : false , datas : response.data.rows , total: response.data.total})
    }else{
      console.log(response.message)
    }
  }
  onChangePage = page => {
    this.setState({ page }, () => {
      // let values = this.formRef.current.getFieldsValue();
      this.getDocumentRead()
    })
  }
  render() {
    const { t } = this.props;
    const columns = [
      {
        title: t('No.'),
        width : '3%',
        render: r => this.state.datas.indexOf(r) + 1 
      },
      {
        title: t('hr:document'),
        render: r =>  r.document?
              <>
              <Link to={`/company/document/${r.document.id}/edit`} >{r.document?.title}</Link> <small>({r.document?.document_code})</small> <br />
              </>
              :
              []
      },
      {
        title: t('hr:chapter'),
        render: r => (r.chapterReaded).length ?
            (r.chapterReaded).map(c => {
              return <div key={c.id}>{c.title}</div>
            })
          : []
      },
      {
        title : t('hr:read_by'),
        width: '20%',
        render: r => <>
          <small>{
            typeof r.created_at == 'string' && r.created_at != '-0001-11-30 00:00:00' ?
              `Created: ${timeFormatStandard(r.created_at, dateFormat)}` :
              r.created_at && (r.created_at > 0) ?
                `Created: ${parseIntegertoTime(r.created_at, dateFormat)}` : ''

            //  <span>{r.read_by.name}</span>
          }
          </small>
          <small>
            &nbsp;By {r.read_by.name}
          </small>
        </>
        
      }
    ]
    return (
      <div>
        <PageHeader
          title={t('hr:read_log')}
        />
        <Row className= {window.innerWidth < screenResponsive  ? "card pl-3 pr-3 mb-3 pb-3" : "card pl-3 pr-3 mb-3"}>
          <Tab tabs={constTablist(this.props)} />
        </Row>
        <Row gutter={[16, 24]}>
          <Col span={24}>
            {window.innerWidth < screenResponsive  ? 
                  <div className='block_scroll_data_table'>
                      <div className='main_scroll_table'> 
                        <Table dataSource={this.state.datas}
                          columns={columns} loading={this.state.loading}
                          rowKey={(r, i)=> i}
                          pagination={{
                            pageSize: this.state.limit,
                            total: this.state.total,
                            onChange: page => this.onChangePage(page),
                            showSizeChanger: false
                          }}
                        />
                      </div>
                  </div>
                  :
                  <Table dataSource={this.state.datas}
                    columns={columns} loading={this.state.loading}
                    rowKey={(r, i)=> i}
                    pagination={{
                      pageSize: this.state.limit,
                      total: this.state.total,
                      onChange: page => this.onChangePage(page),
                      showSizeChanger: false
                    }}
                  />
            }
          </Col>
        </Row>

      </div>
    )
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(DocumentRead));
