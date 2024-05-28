import React, { Component } from 'react'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setExcelIoCount } from '~/redux/actions/layout';
import { withTranslation } from 'react-i18next';
import { Button, Table, Tag, Row, Form, Col, Input,  DatePicker} from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { timeFormatStandard } from '~/services/helper';
import { excelIOLogsIOType, excelIOLogsImportType, excelIOLogsExportType, excelIOLogsStatus, colorExcelIOLogs, dateFormat } from '~/constants/basic';
import FailImport from '~/components/Company/FailImport/FailImport';
import { MEDIA_URL_HR } from "~/constants";
import { getList, updateCount } from '~/apis/excelIOLogs';
import Dropdown from "~/components/Base/Dropdown";
import dayjs from 'dayjs';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
class ExcelIOLogs extends Component {
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            logs: [],
            loading: false,

            visibleFail: false,
            dataPopupFail: {},
        }
    }
    componentDidMount() {
        this.getExcelIoLogs();
    }
    /**
     * Get list project import
     */
    async getExcelIoLogs(params = {}) {
        this.setState({loading: true});
        if(params.date) {
            params.from_date = dayjs(params.date[0]).format('YYYY-MM-DD')
            params.to_date = dayjs(params.date[1]).format('YYYY-MM-DD')
            delete params.date
          }
        let response = await getList(params);
        if (response.status) {
            this.setState({ logs: response.data.rows })
        }
        this.setState({loading: false});
    }

    /**
   * Submit form
   * @param {*} values
   */
  submitForm = async () => {
    this.setState({ page: 1 }, () => {
      let values = this.formRef.current.getFieldsValue();
      this.getExcelIoLogs(values)
    })
  };
    /**
     * Toggle popup fail modal
     * @param {*} visibleFail 
     */
    togglePopupFail = (visibleFail = true, dataPopupFail = {}) => {
        this.setState({ visibleFail, dataPopupFail })
    }
    /**
     * Download file
     * 
     * @param {string} file_path 
     */
    downloadFile(log = {}) {
        // if
        let { ui } = this.props;
        if (log.io_type == 1 && log.download_count == 0 && ui.excel_io_count > 0) {
            this.props.setExcelIoCount(ui.excel_io_count - 1);
        }
        updateCount(log.id);
        let fileUrl = `${MEDIA_URL_HR}/${log.file_path}`;
        let fileName = log.file_path.split('/').pop();

        const link = document.createElement('a');
        link.setAttribute('href', fileUrl);
        link.setAttribute('download', fileName);

        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    }

    render() {
        const { t } = this.props;
        const columns = [
            {
                title: t('No.'),
                render: r => this.state.logs.indexOf(r) + 1,
            },
            {
                title: t('Excel Type'),
                render: r => <Tag color={colorExcelIOLogs[r.io_type]}>{excelIOLogsIOType[r.io_type]}</Tag>
            },
            {
                title: t('Link tải file'),
                render: r => r.file_path ?
                    <Button type='link' onClick={() => this.downloadFile(r)}>{r.file_path.split('/').pop()}</Button>
                    : ''
            },
            {
                title: t('Type'),
                render: r => (r.io_type == 1) ? excelIOLogsExportType[r.type] : excelIOLogsImportType[r.type]
            },
            {
                title: t('Trạng thái'),
                render: r => <Tag color={colorExcelIOLogs[r.status]}>{excelIOLogsStatus[r.status]}</Tag>
            },
            {
                title: t('Kết quả'),
                align: 'center',
                render: r => {
                    return r?.log ? `${r?.log?.message}` : '';
                }
            },
            {
                title: t('Ngày yêu cầu'),
                render: r => <small>{timeFormatStandard(r.created_at, 'YYYY-MM-DD HH:mm')}</small>
            },
        ];

        return (
          <div id="page_excel_io_logs">
            <PageHeader title={t("Excel IO Logs")} />
            <Row className="card pl-3 pr-3 mb-3">
              <Form
                className="pt-3 mb-2"
                layout="vertical"
                ref={this.formRef}
                onFinish={(values) => this.submitForm(values)}
              >
                <Row gutter={12}>
                  <Col xs={24} sm={24} md={24} lg={6} xl={4}>
                    <Form.Item name="date">
                      <RangePicker
                        style={{ width: "100%" }}
                        format={dateFormat}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                    <FormItem name="file_path">
                      <Input placeholder={"File"} />
                    </FormItem>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                    <FormItem name="io_type">
                      <Dropdown
                        datas={excelIOLogsIOType}
                        defaultOption="-- Excel Type --"
                      />
                    </FormItem>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                    <FormItem name="type">
                      <Dropdown
                        datas={excelIOLogsExportType}
                        defaultOption="-- All type --"
                      />
                    </FormItem>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                    <FormItem name="status">
                      <Dropdown
                        datas={excelIOLogsStatus}
                        defaultOption="-- All Status --"
                      />
                    </FormItem>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={2} xl={2}>
                    <Button type="primary" htmlType="submit">
                      &nbsp;{t("search")}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Row>
            <div className="block_table_excel_io_logs">
              <Table
                rowKey={(r) => r.id}
                dataSource={this.state.logs}
                columns={columns}
                pagination={{ pageSize: 20, showSizeChanger: false }}
                loading={this.state.loading}
              />
            </div>
            <FailImport
              visible={this.state.visibleFail}
              togglePopup={() => this.togglePopupFail(false)}
              datas={this.state.dataPopupFail}
            />
          </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData,
        ui: state.ui
    };
}
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        setExcelIoCount,
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ExcelIOLogs));

