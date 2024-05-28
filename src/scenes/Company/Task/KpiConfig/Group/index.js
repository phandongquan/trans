import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Table, Button, Row } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import GroupForm from "./GroupForm";
import kpiConfigGroupApi from "~/apis/company/task/kpiConfig/group";
import { checkPermission, showNotify } from "~/services/helper";
import DeleteButton from "~/components/Base/DeleteButton";
import Tab from "~/components/Base/Tab";
import tabList from "../config/tabList";
import {screenResponsive} from '~/constants/basic';
import { withTranslation } from "react-i18next";

export const Group = (props) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [group, setGroup] = useState(null);

  useEffect(() => {
    getListGroup();
  }, []);

  /**
   * Get list groups
   */
  const getListGroup = () => {
    let xhr = kpiConfigGroupApi.getList();
    xhr.then((res) => {
      if (res.status) {
        setData(res.data);
      } else {
        showNotify("Notify", res.message, "error");
      }
    });
  };

  /**
   * On delete
   */
  const onDelete = (e, id, index) => {
    e.stopPropagation();
    setLoading(true);
    let xhr = kpiConfigGroupApi.destroy(id);
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
  const {t} = props;
  const columns = [
    {
      title: "No.",
      render: (r) => data.indexOf(r) + 1,
      width: 80,
    },
    {
      title: t("hr:code"),
      render: (r) => r.code,
    },
    {
      title: t("hr:name"),
      render: (r) => r.name,
    },
    {
      title: t("hr:action"),
      render: (text, r, index) => {
        return (
          <div className="d-flex">
            {
              checkPermission('hr-kpi-config-group-update') ? 
                <Button
                  className="mr-2"
                  icon={<EditOutlined />}
                  type="primary"
                  onClick={() => {
                    setVisible(true);
                    setGroup(r);
                  }}
                />
              : ''
            }
            {
              checkPermission('hr-kpi-config-group-delete') ?
                <DeleteButton onConfirm={(e) => onDelete(e, r.id, index)} />
              : ''
            }
          </div>
        );
      },
      width: 120,
    },
  ];
  return (
    <>
      <PageHeader
        title={t("hr:group")}
        subTitle={
          checkPermission('hr-kpi-config-group-create') ?
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setVisible(true)}
          >
           {t('hr:add_new')}
          </Button>
          : ''
        }
      />
      <Row className={window.innerWidth < screenResponsive  ? "card pl-3 pr-3 mb-3 pb-3" : "card pl-3 pr-3 mb-3"}>
        <Tab tabs={tabList(props)} />
      </Row>
      {window.innerWidth < screenResponsive  ? 
          <div className='block_scroll_data_table'>
              <div className='main_scroll_table'> 
                  <Table columns={columns} dataSource={data} rowKey="id" />
              </div>
          </div>
          :
          <Table columns={columns} dataSource={data} rowKey="id" />
      }
      <GroupForm
        translang={props}
        visible={visible}
        setVisible={(visible) => setVisible(visible)}
        refreshData={() => getListGroup()}
        group={group}
      />
    </>
  );
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Group));
