import React, { useState, useEffect, useRef, useContext } from "react";
import { connect } from "react-redux";
import { Row, Form, Col, Input, Button, Table } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import kpiConfigApi from "~/apis/company/task/kpiConfig";
import {
  formatVND,
  showNotify,
  historyReplace,
  historyParams,
  checkPermission,
} from "~/services/helper";
import DeleteButton from "~/components/Base/DeleteButton";
import Dropdown from "~/components/Base/Dropdown";
import tabList from "./config/tabList";
import Tab from "~/components/Base/Tab";
import KpiConfigModal from "./KpiConfigModal";
import "./config/kpiConfig.scss";
import {screenResponsive} from '~/constants/basic';
import { withTranslation } from "react-i18next";

const EditableContext = React.createContext(null);
const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

/**
 * Editable cell
 * @param {*} param0
 * @returns
 */
const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  isDropdown,
  dataDropdown,
  isMultiple,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing && !isDropdown) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave(record, values);
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  let childNode = children;
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        {isDropdown ? (
          <Dropdown
            datas={dataDropdown}
            defaultOption={`--- All ${title} ---`}
            onChange={save}
            mode={isMultiple ? "multiple" : "single"}
          />
        ) : (
          <Input ref={inputRef} onPressEnter={save} onBlur={save} />
        )}
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};

export const KpiConfig = (props) => {
  // Ref
  const formSearchRef = useRef(null);
  // State
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [total, setTotal] = useState(0);
  const [type, setType] = useState([]);
  const [standardType, setStandardType] = useState([]);
  const [timingUnit, setTimingUnit] = useState([]);
  const [status, setStatus] = useState([]);
  const [group, setGroup] = useState([]);

  // State for modal
  const [config, setConfig] = useState(null);
  const [visible, setVisible] = useState(false);

  /**
   * Const props;
   */
  const { departments, divisions, majors } = props.baseData;
  useEffect(() => {
    let params = historyParams();
    if (params.offset) {
      let currentPage = params.offset / limit + 1;
      setPage(currentPage);
    }
    if (formSearchRef.current) {
      formSearchRef.current.setFieldsValue(params);
    }
  }, []);

  useEffect(() => {
    getList();
  }, [page]);

  /**
   * Get list data
   */
  const getList = (isSearch = false) => {
    setLoading(true);
    let params = formSearchRef.current.getFieldsValue();
    params = {
      ...params,
      offset: isSearch ? 0 : (page - 1) * limit,
      limit: limit,
    };
    historyReplace(params);
    let xhr = kpiConfigApi.getList(params);
    xhr.then((res) => {
      setLoading(false);
      if (res.status) {
        setData(res.data.rows);
        setTotal(res.data.total);
        setGroup(res.data.group);
        if (Array.isArray(res.data?.type)) {
          let type = [];
          res.data.type.map((t, i) => type.push({ id: i, name: t }));
          setType(type);
        }
        if (Array.isArray(res.data?.standard_type)) {
          let standardTypes = [];
          res.data.standard_type.map((t, i) =>
            standardTypes.push({ id: i, name: t })
          );
          setStandardType(standardTypes);
        }
        if (Array.isArray(res.data?.status)) {
          let status = [];
          res.data.status.map((t, i) => status.push({ id: i, name: t }));
          setStatus(status);
        }
        if (Array.isArray(res.data?.timing_unit)) {
          let timingUnit = [];
          res.data.timing_unit.map((t, i) =>
            timingUnit.push({ id: t, name: t })
          );
          setTimingUnit(timingUnit);
        }
      } else {
        showNotify("Notify", res.message, "error");
      }
    });
  };

  /**
   * On search form
   * @param {*} values
   */
  const onSearch = async (values) => {
    getList(true);
  };

  /**
   * On delete item
   * @param {*} e
   * @param {*} id
   */
  const onDelete = (e, id, index) => {
    e.stopPropagation();
    setLoading(true);
    let xhr = kpiConfigApi.destroy(id);
    xhr.then((response) => {
      setLoading(false);
      if (response.status) {
        showNotify("Notification", "Xóa thành công!");
        const newdatas = data.slice();
        newdatas.splice(index, 1);
        setData(newdatas);
      }
    });
  };

  /**
   * On change page
   * @param {*} page
   */
  const onChangePage = async (page) => {
    setPage(page);
  };
  const {t} = props
  const defaultColumns = [
    {
      title: "No.",
      render: (r) => data.indexOf(r) + 1,
      fixed:window.innerWidth < screenResponsive  ? '' : "left",
    },
    {
      title: t("type") + t(" KPIs"),
      render: (r) => type.find((t) => t.id == r.type)?.name,
      fixed: window.innerWidth < screenResponsive  ? '' : "left",
    },
    {
      title: t("group") + t(" KPIs"),
      render: (r) => group.find((g) => g.id == r.group_id)?.name,
      fixed: window.innerWidth < screenResponsive  ? '' : "left",
    },
    {
      title: t("code"),
      render: (r) => r.code,
      fixed: window.innerWidth < screenResponsive  ? '' : "left",
    },
    {
      title:t("category") + t(" KPIs"),
      dataIndex: "criterion",
      // editable: true,
    },
    {
      title: t("hr:standard_type"),
      dataIndex: "standard_type",
      render: (standard_type) =>
        standardType.find((t) => t.id == standard_type)?.name,
      // editable: true,
      isDropdown: true,
      dataDropdown: standardType,
    },
    {
      title: t("hr:timing_unit"),
      dataIndex: "timing_unit",
      render: (timing_unit) =>
        timingUnit.find((t) => t.id == timing_unit)?.name,
      // editable: true,
      isDropdown: true,
      dataDropdown: timingUnit,
    },
    {
      title: t("hr:target") + ('(') +  t("hr:muntes_unit") + (')'),
      dataIndex: "timing_target",
      editable: true,
    },
    {
      title: t("hr:target") + ('(') + t("hr:vnd_unit") + (')'),
      dataIndex: "timing_target_money",
      render: (item) => (item ? formatVND(item, "") : ""),
      editable: true,
    },
    {
      title: t("dept"),
      dataIndex: "department_id",
      render: (department_id) =>
        departments.find((d) => d.id == department_id)?.name,
      // editable: true,
      isDropdown: true,
      dataDropdown: departments,
    },
    {
      title: t("section"),
      dataIndex: "division_id",
      render: (division_id) => {
        if (Array.isArray(division_id)) {
          let arrDivisions = [];
          division_id.map((dId) =>
            arrDivisions.push(divisions.find((div) => div.id == dId)?.name)
          );
          return arrDivisions.join(", ");
        } else {
          return divisions.find((d) => d.id == division_id)?.name;
        }
      },
      // editable: true,
      isDropdown: true,
      dataDropdown: divisions,
      isMultiple: true,
    },
    {
      title: t("major"),
      dataIndex: "major_id",
      render: (major_id) => {
        if (Array.isArray(major_id)) {
          let arrMajors = [];
          major_id.map((mId) =>
            arrMajors.push(majors.find((major) => major.id == mId)?.name)
          );
          return arrMajors.join(", ");
        } else {
          return majors.find((m) => m.id == major_id)?.name;
        }
      },
      // editable: true,
      isDropdown: true,
      dataDropdown: majors,
      isMultiple: true,
    },
    {
      title: t("status"),
      render: (r) => status.find((s) => s.id == r.status)?.name,
    },
    {
      title: t("action"),
      render: (txt, r, index) => (
        <div className="d-flex align-items-center">
          {
            checkPermission('hr-kpi-config-update') ? 
              <Button
                icon={<EditOutlined />}
                type="primary"
                onClick={() => {
                  setConfig(r);
                  setVisible(true);
                }}
              />
            : ''
          }
        </div>
      ),
      width: 45,
    },
  ];

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => {
        return {
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave,
          isDropdown: col.isDropdown,
          dataDropdown: col.dataDropdown,
          isMultiple: col.isMultiple,
        };
      },
    };
  });

  /**
   * Handle save
   * @param {*} row
   * @param {*} values
   */
  const handleSave = (row, values) => {
    let field = Object.keys(values)[0];
    let value = Object.values(values)[0];
    let dataForm = {
      id: row.id,
      field,
      value,
    };

    const newData = data.slice();
    const index = newData.findIndex((item) => row.id === item.id);
    if (newData[index][field] == value) {
      return;
    }
    const {t} = props;
    let xhr = kpiConfigApi.updateField(dataForm);
    xhr.then((res) => {
      if (res.status) {
        if (index !== -1) {
          newData[index] = res.data;
        }
        setData(newData);
        showNotify("Notify", t("hr:update_susscess"));
      } else {
        showNotify("Notify", res.message, "error");
      }
    });
  };

  /**
   * Refresh record
   * @param {*} record
   */
  const refreshRecord = (record) => {
    const newData = data.slice();
    const index = newData.findIndex((item) => record.id === item.id);
    if (index !== -1) {
      newData[index] = record;
    }
    setData(newData);
  };

  /**
   * Add record
   * @param {*} record
   */
  const addRecord = (record) => {
    const newData = data.slice();
    newData.unshift(record);
    setData(newData);
  };

  return (
    <>
      <PageHeader
        title={t('hr:kpi_config')}
        subTitle={
          checkPermission('hr-kpi-config-create') ?
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setConfig(null);
              setVisible(true);
            }}
          >
           {t('hr:add_new')}
          </Button>
          : ''
        }
      />
      <Row className="card pl-3 pr-3 mb-3 pb-3">
        <Tab tabs={tabList(props)} />
        <Form
          ref={formSearchRef}
          className="mt-3"
          layout="vertical"
          onFinish={(values) => onSearch(values)}
        >
          <Row gutter={12}>
            <Col xs={24} sm={24} md={24} lg={6} xl={6}>
              <Form.Item name="keyword">
                <Input placeholder={t('hr:criterion') + (' / ') + t('hr:code')} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
              <Form.Item name="group_id">
                <Dropdown datas={group} defaultOption={t('hr:group')}/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
              <Form.Item name="type">
                <Dropdown datas={type} defaultOption={t('hr:type')}/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
              <Form.Item name="timing_unit">
                <Dropdown
                  datas={timingUnit}
                  defaultOption={t("hr:timing_unit")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
              <Form.Item>
                <Button
                  htmlType="submit"
                  type="primary"
                  icon={<SearchOutlined />}
                >
                  {t('hr:search')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Row>
      {window.innerWidth < screenResponsive  ? 
                            <div className='block_scroll_data_table'>
                                <div className='main_scroll_table table_2000'> 
                                    <Table
                                        columns={columns}
                                        dataSource={data}
                                        rowKey="id"
                                        rowClassName={() => "editable-row"}
                                        pagination={{
                                          pageSize: limit,
                                          onChange: (page) => onChangePage(page),
                                          total: total,
                                          hideOnSinglePage: true,
                                          showSizeChanger: false,
                                          current: page,
                                        }}
                                    />
                                </div>
                            </div>
                            :
              <Table
                components={components}
                columns={columns}
                dataSource={data}
                rowKey="id"
                rowClassName={() => "editable-row"}
                pagination={{
                  pageSize: limit,
                  onChange: (page) => onChangePage(page),
                  total: total,
                  hideOnSinglePage: true,
                  showSizeChanger: false,
                  current: page,
                }}
              />
        }

      <KpiConfigModal
        translang = {props}
        config={config}
        setConfig={(config) => setConfig(config)}
        visible={visible}
        setVisible={(visible) => setVisible(visible)}
        type={type}
        standardType={standardType}
        timingUnit={timingUnit}
        status={status}
        group={group}
        refreshRecord={(record) => refreshRecord(record)}
        addRecord={(record) => addRecord(record)}
      />
    </>
  );
};

const mapStateToProps = (state) => ({
  baseData: state.baseData,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(KpiConfig));
