import React, { useEffect, useRef } from "react";
import { connect } from "react-redux";
import { Modal, Row, Col, Input, Form, Divider, Button } from "antd";
import Dropdown from "~/components/Base/Dropdown";
import Upload from "~/components/Base/Upload";
import Avatar from "~/components/Base/Avatar";
import {
  mainTypeDocument,
  MAIN_TYPE_DOCUMENT,
} from "~/scenes/Company/Document/config";
import { arrMimeType, typeFilePdf } from "~/constants/basic";
import { URL_HR } from "~/constants";
import SkillDropdown from "~/components/Base/SkillDropdown";

const { TextArea } = Input;
export const RevisedModal = (props) => {
  const formRef = useRef(null);

  useEffect(() => {
    if (props.data) {
      formRef.current.setFieldsValue(props.data);
    }
  }, [props.data]);

  const {
    data,
    categories,
    types,
    status,
    baseData: { departments, majors },
  } = props;
  if (!data) return false;

  return (
    <Modal
    open={props.visible}
      width="60%"
      onCancel={() => props.setVisible(false)}
      footer={false}
    >
      <div className="p-3">
        <Form
          className="ant-advanced-search-form pt-3"
          layout="vertical"
          onFinish={(values) => this.handleSubmitForm(values)}
          ref={formRef}
        >
          <strong style={{ float: "right", color: "#17A2B8" }}>
            STATUS : {status[data.status]}
          </strong>
          <br></br>
          <Row gutter={24}>
            <Col span={18}>
              <Form.Item
                label="Title"
                name="title"
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Please input title",
                  },
                ]}
              >
                <Input disabled={true} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Control No."
                name="document_code"
                rules={[
                  {
                    required: true,
                    message: "Please input Control No.",
                  },
                ]}
              >
                <Input disabled={true} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                label="Category"
                name="category_id"
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Please choose category",
                  },
                ]}
              >
                <Dropdown
                  datas={categories}
                  takeZero={false}
                  defaultOption="-- All Categories --"
                  disabled={true}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Main type" name="main_type">
                <Dropdown
                  datas={mainTypeDocument}
                  defaultOption="-- All Main Type --"
                  disabled={true}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Type"
                name="type"
                rules={[
                  {
                    required: true,
                    message: "Please chosse type",
                  },
                ]}
              >
                <Dropdown
                  datas={types}
                  defaultOption="-- All Types --"
                  disabled={true}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="Department" name="department_id">
                <Dropdown
                  datas={departments}
                  defaultOption="-- All Departments --"
                  disabled={true}
                  onSelect={() => {
                    this.formRef.current.setFieldsValue({
                      skill_id: null,
                    });
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Major" name="major_id">
                <Dropdown
                  datas={majors}
                  defaultOption="-- All Majors --"
                  disabled={true}
                  onSelect={() => {
                    this.formRef.current.setFieldsValue({
                      skill_id: null,
                    });
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          {data.main_type == MAIN_TYPE_DOCUMENT ? (
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item label="Skills" name="skill_id">
                  <SkillDropdown />
                </Form.Item>
              </Col>
            </Row>
          ) : (
            ""
          )}
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                label="Summary"
                name="lead"
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Please input summary",
                  },
                ]}
              >
                <TextArea disabled={true} rows={4} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                name="source_file"
                label="Source File"
                valuePropName="source_file"
                extra="Maximum file size 25MB!"
              >
                <Upload
                  extensions={["ppt", "pptx"]}
                  type={arrMimeType}
                  size={25}
                  defaultFileList={
                    data.source_file
                      ? [
                          {
                            uid: "-1",
                            name: data.source_file
                              ? data.source_file.split("/").pop()
                              : "",
                            status: "done",
                            url: data.source_file
                              ? URL_HR +
                                "/production/training/" +
                                data.source_file
                              : "",
                          },
                        ]
                      : null
                  }
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <Form.Item
                name="pdf_file"
                label="PDF File"
                valuePropName="pdf_file"
                extra="Support file PDF. Maximum file size 25MB!"
              >
                <Upload
                  type={typeFilePdf}
                  size={25}
                  accept=".pdf"
                  defaultFileList={
                    data.pdf_file
                      ? [
                          {
                            uid: "-1",
                            name: data.pdf_file
                              ? data.pdf_file.split("/").pop()
                              : "",
                            status: "done",
                            url: data.pdf_file
                              ? URL_HR + "/production/training/" + data.pdf_file
                              : "",
                          },
                        ]
                      : null
                  }
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="file"
            label="Thumbnail"
            valuePropName="file"
            extra="Support file PNG/JPG/JPEG. Maximum file size 10MB!"
          >
            <Avatar
              onChange={(e) => this.setState({ file: e })}
              url={data && data.image}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

const mapStateToProps = (state) => ({
  auth: state.auth.info,
  baseData: state.baseData,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(RevisedModal);
