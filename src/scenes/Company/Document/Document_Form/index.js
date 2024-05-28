import React, { Component } from 'react'
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Row, Col, Table, Tooltip, Button, Form, Input } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import Tab from '~/components/Base/Tab';
import tabList from '../../config/tabListDocument';
import { getDocument } from 'src/apis/company/document/form/index';
import { getURLHR, isURL, returnMediaType, historyParams} from '~/services/helper';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faSearch } from '@fortawesome/free-solid-svg-icons';
import {FilePdfOutlined, VideoCameraOutlined,FileImageOutlined, DownloadOutlined } from '@ant-design/icons';
import ModalForm from 'src/scenes/Company/Document/Document_Form/ModalForm';
import { saveAs } from 'file-saver';

const newPrefix = 'training'
const FormItem = Form.Item;


class Document_Form extends Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.state = {
      forms: [],
      loading: false,
      limit: 30,
      page: 1,
      total: 0,
      visible: false,
      url: null,
      loading: true,
    };
  }

  /**
   *
   */
  componentDidMount() {
    let params = historyParams();
    this.formRef.current.setFieldsValue(params);
    let values = this.formRef.current.getFieldsValue();
    params = {
      ...params,
      ...values,
    };
    this.getDocumentForm(params);
  }

  /**
   * event click btn search
   * @param {*} e
   */
  submitForm = (e) => {
    this.setState({ page: 1 }, () => {
      let values = this.formRef.current.getFieldsValue();
      this.getDocumentForm({ ...values });
    });
  };

  /**
   *
   * get document form
   */
  async getDocumentForm(values) {
    this.setState({ loading: true });
    let params = {
      ...values,
      limit: this.state.limit,
      offset: this.state.limit * (this.state.page - 1),
    };
    let response = await getDocument(params);
    if (response.status) {
      this.setState({ forms: response.data });
    }

  }
//  getDocument = (values) => {
//     this.setState({ loading: true });
//     values.limit = this.state.limit;
//     values.offset = this.state.limit * (this.state.page - 1);
//     historyReplace(values);
//     let xhr = documentApi.getDocument(values);
//     xhr.then((response) => {
//       if (response.status) {
//         let { data } = response;
//         this.setState({
//           loading: false,
//           documents: data.rows,
//           categories: data.categories,
//           types: data.document_type,
//           status: data.document_status,
//           total: data.total,
//         });
//       }
//     });
//   };
  onChangePage = (page) => {
    this.getDocumentForm();
  };

  downloadCurrentImageFile = (url) => {
    const filename = url.split("/").pop();
    saveAs(getURLHR(url, newPrefix), filename);
  };

  downloadCurrentVideoFile = (url) => {
    const filename = url.split("/").pop();
    fetch(url)
      .then((response) => response.blod())
      .then((blod) => {
        saveAs(blod, filename);
      })
      .catch((error) => {
        console.error("Error fetching the MP4 file".error);
      });
  };

  render() {
    const { t } = this.props;
    let { visible, url } = this.state;
    const columns = [
      {
        title: t("hr:title"),
        render: (r) => {
          if (r.document_id != 0) {
            return (
              <Link to={`/company/document/${r.document_id}/edit`}>
                {r.title}
              </Link>
            );
          } else {
            return <Link to={`/company/document/${r.id}/edit`}>{r.title}</Link>;
          }
        },
      },
      {
        title: t("hr:file"),
        render: (r) => {
          const filename = r.file.split("/").pop();
          return getURLHR(r.file), filename;
        },
      },
      {
        title: t("hr:view"),
        align: "center",
        render: (r) => {
          let type = returnMediaType(r.file);
          let icon = type;
          switch (type) {
            case "2":
              icon = <FilePdfOutlined />;
              break;
            case "1":
              icon = <FileImageOutlined />;
              break;
            case "3":
              icon = <VideoCameraOutlined />;
              break;
            default:
              return [];
          }
          return (
            <div>
              <Link
                to={""}
                onClick={(e) => {
                  e.preventDefault();
                  this.setState({
                    visible: true,
                    url: r.file,
                  });
                }}
              >
                {icon}
              </Link>
            </div>
          );
        },
      },
      {
        title: t("hr:download"),
        align: "center",
        render: (r) => {
          let type = returnMediaType(r.file);
          return (
            <>
              <Button
                size="small"
                type="link"
                to={""}
                onClick={(e) => {
                  if (type == 2) {
                    return this.downloadCurrentImageFile(r.file);
                  } else {
                    return this.downloadCurrentVideoFile(r.file);
                  }
                }}
              >
                <DownloadOutlined />
              </Button>
            </>
          );
        },
      },
    ];
    return (
      <>
        <PageHeader title={t("hr:document_form")} />
        <Row className="card mb-3 pl-3 pr-3">
          <Tab tabs={tabList(this.props)} />
          <Form
            className="pt-3"
            name="searchDocumentForm"
            ref={this.formRef}
            onFinish={this.submitForm.bind(this)}
          >
            <Row gutter={12}>
              <Col xs={24} sm={24} md={24} lg={6} xl={6} key="keyword">
                <FormItem name="keyword">
                  <Input placeholder={"Biểu mẫu, tài liệu"}></Input>
                </FormItem>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <FormItem>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="mr-2"
                    icon={<FontAwesomeIcon icon={faSearch} />}
                  >
                    &nbsp;{t("hr:search")}
                  </Button>
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Row>
        <Table
          columns={columns}
          dataSource={this.state.forms}
          pagination={{
            pageSize: this.state.limit,
            total: this.state.total,
            showSizeChanger: false,
          }}
        />
        <ModalForm
          visible={visible}
          url={url}
          hidePopup={() => this.setState({ visible: false })}
        />
      </>
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
export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Document_Form));