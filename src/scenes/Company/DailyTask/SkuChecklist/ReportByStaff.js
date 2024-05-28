import React, { useState } from "react";
import { connect } from "react-redux";
import { Avatar, Table } from "antd";
import { useEffect } from "react";
import { verifySkuStaff } from "~/apis/company/dailyTask/skuChecklist";
import { dateFormat } from "~/constants/basic";
import { showNotify, timeFormatStandard, getThumbnailHR } from "~/services/helper";
import { MEDIA_URL_HR } from "~/constants";

export const ReportByStaff = (props) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const {baseData: { locations  , majors , divisions , departments} } = props;
  const {t} = props.translang
  useEffect(() => {
    getVerifyStaff();
  }, [props.params]);

  /**
   * Get verify staff
   */
  const getVerifyStaff = () => {
    setLoading(true);
    let params = props.params;
    if (params.date) {
      params.from_date =
        typeof params.date !== undefined && params.date
          ? timeFormatStandard(params.date[0], dateFormat)
          : undefined;
      params.to_date =
        typeof params.date !== undefined && params.date
          ? timeFormatStandard(params.date[1], dateFormat)
          : undefined;
      delete params.date;
    }
    if (!params.perPage) {
      params.perPage = props.limit
    }
    if (!params.pageNum) {
      params.pageNum = props.page
    }
    let xhr = verifySkuStaff(params);
    xhr.then((res) => {
      setLoading(false);
      if (res.status) {
        setData(res.data);
      } else {
        showNotify("Notify", res.message, "error");
      }
    });
  };

  const columns = [
    {
      title: "No.",
      render: (r) => data.indexOf(r) + 1,
      width: '5%',
    },
    {
      title: t("staff"),
      dataIndex: "verify_by_staff",
      render: (staff) => (
        <div className="d-flex align-items-center">
          <div>
            <Avatar
              src={
                staff.user?.avatar
                  ? getThumbnailHR(staff.user?.avatar, '40x40')
                  : ""
              }
            />
          </div>
          <div className="ml-2">
            <div>
              {staff.staff_name} #{staff.code}
            </div>
            <small>{staff.staff_email}</small>
          </div>
        </div>
      ),
    },
    {
      title: t('hr:location_division_major_dept'),
      dataIndex: "verify_by_staff",
      render: staff => (
          <div>
              {locations.map(m => m.id == staff.staff_loc_id && m.name)}  / 
              {divisions.map(d => d.id == staff.division_id && d.name)}  / 
              {majors.map(m => m.id == staff.major_id && m.name)} / 
              {departments.map(de => de.id == staff.staff_dept_id && de.name)}  / 
          </div>
      )
    },
    {
      title: t("hr:total_verify"),
      dataIndex: "total_verify",
    },
    {
      title: t("hr:total_kpi"),
      dataIndex: "total_kpi",
    },
  ];
  return (
    <div className='block_scroll_data_table'>
      <div className='main_scroll_table'> 
        <Table
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={false}
          rowKey='verifiedBy'
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  baseData: state.baseData
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ReportByStaff);
