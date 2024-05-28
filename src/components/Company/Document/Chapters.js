import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Table, Row, Col, Button, Popconfirm, Modal, Tooltip } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { getChapters as getListChapter, deleteChapter, deleteChapterDraft } from '~/apis/company/document/chapter';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FormOutlined } from '@ant-design/icons';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ChapterForm from '~/components/Company/Document/ChapterForm';
import {
    QuestionCircleOutlined, YoutubeOutlined, FilePdfOutlined, VideoCameraOutlined, DeleteOutlined,
    QrcodeOutlined, AlignCenterOutlined, LinkOutlined, StarOutlined, PlusOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import { checkManagerHigher, checkPermission, showNotify } from '~/services/helper';
import PopupPdfOrYoutube from '~/components/Company/Document/PopupPdfOrYoutube';
import QRCode from 'qrcode.react';
import CounterView from '~/scenes/Company/Document/CounterView';
import { getDocumentDetail, approvedChapter } from '~/apis/company/document'
import PopupGenerate from './PopupGenerate';
import PopupFile from './PoupFile';
import DocumentChaptersHistoryModal from './DocumentChaptersHistoryModal';
import { HistoryOutlined } from "@ant-design/icons";
import DocumentChaptersHistory from './DocumentChaptersHistory';

class Chapters extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chapters: [],
      chapter: null,
      visibleAddNew: false,
      visiblePdfOrYoutube: false,
      visibleFile: false,
      visibleQRCode: false,
      visibleCounterView: false,
      selectedRowKeys: [],
      visiblePopupGenerate: false,
      document: {},
      visibleChaptersHistory: false,
      chapterHistoryId: null,
      indexEditDarft: null,
    };
  }

  /**
   * handle edit chapter
   */
  onClickEditChapter = (e, chapter = null, index = null) => {
    e.stopPropagation();
    e.preventDefault();
    if (chapter) {
      this.setState({ visibleAddNew: true, chapter, indexEditDarft: index });
    } else {
      this.setState({ visibleAddNew: true });
    }
  };

  /**
   * handle toggle QR code
   */
  toggleQRCode = (e, chapter = null) => {
    e.stopPropagation();
    e.preventDefault();
    if (chapter) this.setState({ visibleQRCode: true, chapter: chapter });
    else this.setState({ visibleQRCode: false, chapter: null });
  };

  /**
   *
   * @param {*} e
   * @param {*} chapter
   */
  toggleCounterView = (e, chapter = null) => {
    e.stopPropagation();
    e.preventDefault();
    if (chapter) this.setState({ visibleCounterView: true, chapter: chapter });
    else this.setState({ visibleCounterView: false, chapter: null });
  };

  /**
   * handle click detele chapter
   * @param {*} e
   * @param {*} id
   */
  onDeleteChapter = (e, id, index = null) => {
    let { t, submitDraft, isDraft, documentID } = this.props;
    e.stopPropagation();
    let xhr;
    if (isDraft) {
      let params = {
        index: index,
        document_id: documentID,
      };
      xhr = deleteChapterDraft(params);
    } else {
      let params = {
        is_draft: submitDraft ? 1 : 0,
      };
      xhr = deleteChapter(id, params);
    }
    xhr
      .then((response) => {
        if (response.status) {
          this.props.refreshChapter();
          showNotify(t("Notification"), t("Chapter  has been removed!"));
        } else {
          showNotify(t("Notification"), response.message);
        }
      })
      .catch((error) => {
        showNotify(t("Notification"), t("Server has error!"));
      });
  };

  renderIconLink(type = null ) {
    switch (type) {
      case "pdf":
        return <FilePdfOutlined />;
      case "video":
        return <VideoCameraOutlined />;
      case "youtube":
        return <YoutubeOutlined />;
      case "link":
        return <LinkOutlined />;
      default:
        return [];
    }
  }

  downloadQR = () => {
    const canvas = document.getElementById("qrChapter");
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `qr_code_document.png`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  /**
   *
   * @param {*} documentId
   */
  handleApprovedChapter = (documentId) => {
    let { selectedRowKeys } = this.state;

    if(selectedRowKeys.length < this.props.chapters.length) {
      Modal.confirm({
        title: 'Xác nhận',
        icon: <ExclamationCircleOutlined />,
        content: 'Còn chapter chưa approve bạn có chắc approve chapter ?',
        onOk: () => {
          let xhr = approvedChapter({
            document_id: documentId,
            keys: selectedRowKeys,
          });
          xhr.then((res) => {
            if (res.status) {
              this.props.refreshChapter();
            } else {
              showNotify("Notify", res.message, "error");
            }
          });
        }
      })
      return false;
    }


    let xhr = approvedChapter({
      document_id: documentId,
      keys: selectedRowKeys,
    });
    xhr.then((res) => {
      if (res.status) {
        this.props.refreshChapter();
      } else {
        showNotify("Notify", res.message, "error");
      }
    });
  };

  checkPdf = (link) => {
    if (link) {
      let arr = link.split(".");
      if (arr[arr.length - 1] === "pdf") {
        return true;
      }
    }
    return false;
  };

  checkFile = (link) => {
    if (  link !== undefined && link !== null) {
        let extension = link.split('.').pop();
        if (['xlsx', 'xls', 'docx', 'doc'].includes(extension)) {
        return true;
      }
      return false;
    }
  };

  /**
   *
   * @param {*} newSelectedRowKeys
   */
  onSelectChange = (newSelectedRowKeys) => {
    this.setState({ selectedRowKeys: newSelectedRowKeys });
  };

  render() {
    let {
      t,
      disable,
      documentID,
      isDraft,
      submitDraft,
      chapters,
      auth: { staff_info },
    } = this.props;
    let {
      chapter,
      visibleAddNew,
      visiblePdfOrYoutube,
      visibleFile,
      selectedRowKeys,
      visiblePopupGenerate,
      chapterHistoryId,
    } = this.state;
    const columns = [
      {
        title: "ID",
        dataIndex: "id",
        width: "10%",
      },
      {
        title: t("Chapter"),
        dataIndex: "title",
        width: "50%",
      },
      {
        title: t("Action"),
        width: "22%",
        render: (record, r, index) => {
          return (
            <div>
              {r.type == "link" ? (
                this.renderIconLink(r.type)
              ) : (
                <>
                  {this.checkPdf(r.link) && (
                    <Tooltip title="Generate questions">
                      <Link
                        to=""
                        onClick={(e) => {
                          e.preventDefault();
                          this.setState({
                            visiblePopupGenerate: true,
                            chapter: r,
                          });
                        }}
                        className="mr-2"
                      >
                        <StarOutlined />
                      </Link>
                    </Tooltip>
                  )}
                  {r.link !== null ? (
                    this.checkFile(r.link) ? (
                      <Tooltip title="File">
                        <Link
                          to=""
                          onClick={(e) => {
                            e.preventDefault();
                            this.setState({
                              visibleFile: true,
                              chapter: r,
                            });
                          }}
                        >
                          {this.renderIconLink(r.type)}
                        </Link>
                      </Tooltip>
                    ) : (
                      <Tooltip title="File">
                        <Link
                          to=""
                          onClick={(e) => {
                            e.preventDefault();
                            this.setState({
                              visiblePdfOrYoutube: true,
                              chapter: r,
                            });
                          }}
                        >
                          {this.renderIconLink(r.type)}
                        </Link>
                      </Tooltip>
                    )
                  ) : null}
                 
                </>
              )}

              {!isDraft ? (
                <>
                  <Tooltip title="QR Code">
                    <Link
                      to=""
                      onClick={(e) => this.toggleQRCode(e, r)}
                      style={{ marginLeft: 8 }}
                    >
                      <QrcodeOutlined />{" "}
                    </Link>
                  </Tooltip>
                  <Tooltip title="Counter View">
                    <Link
                      to=""
                      onClick={(e) => this.toggleCounterView(e, r)}
                      style={{ marginLeft: 8 }}
                    >
                      <AlignCenterOutlined />{" "}
                    </Link>
                  </Tooltip>
                  <Tooltip title="History">
                    <span
                      onClick={() =>
                        this.setState({
                          visibleChaptersHistory: true,
                          chapterHistoryId: r.id,
                        })
                      }
                      style={{
                        marginLeft: 8,
                        cursor: "pointer",
                        color: "#1890ff",
                      }}
                    >
                      {<HistoryOutlined />}
                    </span>
                  </Tooltip>
                </>
              ) : null}
              {!disable && !(isDraft && r.act_delete) ? (
                <>
                  <Tooltip title="Edit">
                    <span
                      onClick={(e) => this.onClickEditChapter(e, r, index)}
                      style={{
                        marginLeft: 8,
                        cursor: "pointer",
                        color: "#1890ff",
                      }}
                    >
                      <FormOutlined />
                    </span>
                  </Tooltip>
                </>
              ) : (
                []
              )}
              <Popconfirm
                title={t("Confirm delete selected item?")}
                placement="topLeft"
                icon={<QuestionCircleOutlined style={{ color: "red" }} />}
                onConfirm={(e) => this.onDeleteChapter(e, r.id, index)}
              >
                <Link
                  to="#"
                  type="primary"
                  size="small"
                  style={{ marginLeft: 8 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <DeleteOutlined />
                </Link>
              </Popconfirm>
            </div>
          );
        },
        align: "right",
      },
    ];

    if (isDraft) {
      columns.unshift({
        title: "Type",
        render: (r) => {
          if (r.act_delete) {
            return <span className="text-danger"> Delete</span>;
          }
          if (r.id == 0) {
            return <span className="text-success"> Add new</span>;
          }
          return <span className="text-primary">Update</span>;
        },
        width: "20%",
      });
    }

    const rowSelection = {
      selectedRowKeys,
      onChange: (key) => this.onSelectChange(key),
    };

    return (
      <div className="block_chapter_site_document">
        <PageHeader
          title={isDraft ? t("Chapter Drafts") : t("Chapters")}
          tags={
            !disable && !isDraft
              ? [
                  checkPermission("hr-document-detail-chapter-create") ? (
                    <Button
                      key="create-category"
                      type="primary"
                      icon={<FontAwesomeIcon icon={faPlus} />}
                      onClick={() =>
                        this.setState({ visibleAddNew: true, chapter: null })
                      }
                    >
                      &nbsp;{t("Add new")}
                    </Button>
                  ) : (
                    ""
                  ),
                ]
              : []
          }
          extra={
            isDraft &&
            selectedRowKeys.length &&
            checkManagerHigher(staff_info.position_id) ? (
              checkPermission("hr-document-detail-approve") ? (
                <Button
                  onClick={() => this.handleApprovedChapter(documentID)}
                  type="primary"
                  className="bg-info"
                >
                  Approved
                </Button>
              ) : (
                ""
              )
            ) : null
          }
        />
        <Table
          className="mb-3"
          dataSource={chapters}
          columns={columns}
          loading={false}
          rowKey={(r, index) => index}
          pagination={{ pageSize: 10 }}
          rowSelection={isDraft ? rowSelection : null}
        />
        {visibleAddNew ? (
          <ChapterForm
            visible={visibleAddNew}
            hidePopup={() => this.setState({ visibleAddNew: false })}
            chapter_id={chapter ? chapter.id : 0}
            document_id={documentID}
            resetTableChapters={() => {
              this.props.refreshChapter();
            }}
            isDraft={isDraft}
            chapter={chapter}
            submitDraft={submitDraft}
            index={this.state.indexEditDarft}
            types={this.props.types}
          />
        ) : (
          []
        )}

        {visiblePdfOrYoutube ? (
          <PopupPdfOrYoutube
            visible={visiblePdfOrYoutube}
            chapter={chapter}
            hidePopup={() => this.setState({ visiblePdfOrYoutube: false })}
            documentId={documentID}
          />
        ) : (
          []
        )}

        {visibleFile ? (
          <PopupFile
            visible={visibleFile}
            chapter={chapter}
            hidePopup={() => this.setState({ visibleFile: false })}
            documentId={documentID}
          />
        ) : (
          []
        )}

        {visiblePopupGenerate ? (
          <PopupGenerate
            visible={visiblePopupGenerate}
            chapter={chapter}
            hidePopup={() => this.setState({ visiblePopupGenerate: false })}
            documentId={documentID}
          />
        ) : (
          []
        )}
        <Modal
          title="QR Chapter"
          open={this.state.visibleQRCode}
          onCancel={(e) => this.toggleQRCode(e, null)}
          onOk={(e) => this.toggleQRCode(e, null)}
        >
          <div className="text-center">
            <QRCode
              id="qrChapter"
              value={`{"action":"document","id":${
                this.props.documentID
              },"id_chapter":${
                this.state.chapter ? this.state.chapter.id : null
              }}`}
              style={{ marginTop: 20, marginBottom: 20 }}
            />
            <br />
            <Button
              type="link"
              onClick={() => this.downloadQR()}
              className="mb-2"
            >
              {" "}
              Download QR Code
            </Button>
          </div>
        </Modal>

        <Modal
          title="Counter View"
          open={this.state.visibleCounterView}
          onCancel={(e) => this.toggleCounterView(e, null)}
          onOk={(e) => this.toggleCounterView(e, null)}
          width="50%"
        >
          <CounterView documentId={8} chapterId={18} />
        </Modal>
        <DocumentChaptersHistory
          visible={this.state.visibleChaptersHistory}
          hiddenModal={() => this.setState({ visibleChaptersHistory: false })}
          documentId={this.props.documentID}
          chapterId={chapterHistoryId}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
    };
}

export default connect(mapStateToProps, null)(withTranslation()(Chapters))