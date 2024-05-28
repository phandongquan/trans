import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Row, Col, Divider } from "antd";
import { uniqueId } from "lodash";
import './config/formatKpi.scss'
import { formatVND } from "~/services/helper";

const arrTypes = ['KPIs Thưởng', 'KPIs Trừ', 'Thưởng, phụ cấp']

const TYPE_KPI_THUONG = 0;
const TYPE_KPI_TRU = 1;
const TYPE_KPI_PHU_CAP = 2;

const TYPE_STANDARD_TIMING = 0;
const TYPE_STANDARD_PERCENT = 1;
const TYPE_STANDARD_VND = 2;

export const FormatKpi = (props) => {
  const { data, kpiGroups, groups, timingUnit } = props;
  const [valueKpiGroup, setValueKpiGroup] = useState({})
  const [staffInfo, setStaffInfo] = useState([])

  useEffect(() => {
    // Merge kpi by code
    let arrKpi = [];
    if (data.kpis) {
      Object.keys(data.kpis).map((code) => {
        let objFind = kpiGroups.find((k) => k.code === code);
        objFind = { ...objFind, ...data.kpis[code] };
        arrKpi.push(objFind);
      });
    }

    let A11 = data.working_time;
    let A12 = arrKpi.filter(a => a.standard_type == TYPE_STANDARD_TIMING).reduce((total, num) => total + (num.kpi == "" ? 0 : num.kpi), 0);
    let K01 = A11 == 0 ? 0 :(A12/A11)*100;
    // let K01 = arrKpi.filter(a => a.type == TYPE_KPI_THUONG && a.standard_type == TYPE_STANDARD_PERCENT).reduce((total, num) => total + num.kpi, 0);
    let K02 = arrKpi.filter(a => a.type == TYPE_KPI_TRU && a.standard_type == TYPE_STANDARD_PERCENT).reduce((total, num) => total + num.kpi, 0);
    let K03 = 0;
    let K04 = (K01 + K03) - K02

    // Group
    let kpiGroup = [];
    arrKpi.sort((a, b) => a.code.localeCompare(b.code)).map((r) => {
      if (typeof kpiGroup[r.group_id] == "undefined") {
        kpiGroup[r.group_id] = [r];
      } else {
        kpiGroup[r.group_id] = kpiGroup[r.group_id].concat(r);
      }
    });

    setValueKpiGroup(kpiGroup)
    setStaffInfo([
      {
        key: 'A05',
        label: 'Số ngày làm việc tại công ty',
        value: data.days_work
      },
      {
        key: 'A11',
        label: 'Tổng giờ làm việc tại công ty',
        value: A11 + ' h '
      },
      {
        key: 'A12',
        label: 'Tổng giờ thực hiện KPIs',
        value: Number(A12).toFixed(2) + ' h'
      },
      {
        key: 'K01',
        label: '% KPIs thưởng',
        value: Number(K01).toFixed(0) + ' %'
      },
      {
        key: 'K02',
        label: '% KPIs trừ',
        value: Number(K02).toFixed(0) + ' %'
      },
      {
        key: 'K03',
        label: '% KPIs bù',
        value: ''
      },
      {
        key: 'K04',
        label: '% KPIs cuối cùng',
        value: Number(K04).toFixed(0) + ' %'
      },
      {
        key: 'A13',
        label: 'Hệ số thưởng KPIs',
        value: ''
      },
      {
        key: 'HSK.B01',
        label: 'Thưởng kỹ năng',
        value: data?.skill_revenue ? formatVND(data?.skill_revenue) : 0
      },
      {
        key: 'COS.B00',
        label: 'Tổng tiền thưởng, phụ cấp khác',
        value: ''
      }
    ])
  }, [props.data.kpis])

  /**
   * Staff info
   * @returns
   */
  const renderInfoStaff = () => {
    return <div className="mb-3">
      {staffInfo.map(info => <Row gutter={12} key={info.key}>
        <Col span={3} className="text-center">
          {info.key}
        </Col>
        <Col span={6}>
          {info.label}
        </Col>
        <Col span={4} className="text-center">
          <b>{info.value}</b>
        </Col>
      </Row>)}
    </div>
  }



  /**
   * Format value
   * @param {*} record 
   */
  const formatValue = (record) => {
    if (record.timing_unit === 'VNĐ') {
      return formatVND(record.value, '');
    }
    return record.value;
  }

  /**
   * Format target
   * @param {*} record 
   */
  const formatTarget = (record) => {
    if (record.standard_type == 0) {
        return <span>{record.timing_target} <span>m</span></span>
    }
    return record.timing_target
  }

  /**
   * Format kpi
   * @param {*} record 
   * @returns 
   */
  const formatKpi = (record) => {
    if (record.standard_type == 0) {
      return <span>{record.kpi ? record.kpi.toFixed(2) : record.kpi} <span>h</span></span>
    } else if (record.standard_type==1) {
      return <span>{record.kpi} <span>%</span></span>
    }
    return record.kpi;
  }

  /**
   * render kpi group
   */
  const renderKpiGroup = () => {
    let resultRender = [];
    Object.keys(valueKpiGroup).map((groupId) => {
      resultRender.push(
        <Row key={uniqueId('__group')}>
          <Col span={3}   style={{ backgroundColor: "#ecf6f8" }} > <strong>{groups.find((g) => g.id == groupId)?.code}</strong> </Col>
          <Col
            key={uniqueId("__group")}
            className="border-bottom pb-1 pt-1 "
            style={{ backgroundColor: "#ecf6f8" }}
            span={21}
          >
            <strong>{groups.find((g) => g.id == groupId)?.name}</strong>
          </Col>
        </Row>
      );
      if (Array.isArray(valueKpiGroup[groupId])) {
        valueKpiGroup[groupId].map((r) => {
          resultRender.push(
            <Row key={uniqueId('__kpi_group')}>
              <Col className="border-bottom pt-1 pb-1 text-center" span={3}>
                {r.code}
              </Col>
              <Col className="border-bottom pt-1 pb-1" span={8}>
                {r.criterion}
              </Col>
              <Col className="border-bottom pt-1 pb-1 text-center" span={3}>
                {arrTypes[r.type]}
              </Col>
              <Col className="border-bottom pt-1 pb-1 text-center" span={4}>
                {formatValue(r)}
              </Col>
              <Col className="border-bottom pt-1 pb-1 text-center" span={2}>
                {r.timing_unit}
              </Col>
              <Col className="border-bottom pt-1 pb-1 text-center" span={2}>
                {formatTarget(r)}
              </Col>
              <Col className="border-bottom pt-1 pb-1 text-center" span={2}>
                {formatKpi(r)}
              </Col>
            </Row>
          );
        });
      }
    });

    return resultRender;
  };

  return (
    <div className="kpi-json-info-staff">
      {renderInfoStaff()}
      <Row style={{ backgroundColor: '#f5f1b6' }}>
        <Col className="text-right" span={24}>
          <span><b>m</b>: (phút)</span>
          <span className="ml-3"><b>h</b>: (giờ)</span>
        </Col>
      </Row>
      <Row>
        <Col className="border-bottom pt-1 pb-1  text-center" span={3}>
          <strong>Mã kiểm soát</strong>
        </Col>
        <Col className="border-bottom pt-1 pb-1" span={8}>
          <strong>Hạng mục</strong>
        </Col>
        <Col className="border-bottom pt-1 pb-1 text-center" span={3}>
          <strong>Loại KPIs</strong>
        </Col>
        <Col className="border-bottom pt-1 pb-1 text-center" span={4}>
          <strong>Kết quả thực hiện</strong>
        </Col>
        <Col className="border-bottom pt-1 pb-1 text-center" span={2}>
          <strong>Đơn vị tính (Unit)</strong>
        </Col>
        <Col className="border-bottom pt-1 pb-1 text-center" span={2}>
          <strong>Tiêu chuẩn / Unit</strong>
        </Col>
        <Col className="border-bottom pt-1 pb-1 text-center" span={2}>
          <strong>Quy đổi</strong>
        </Col>
      </Row>
      {renderKpiGroup()}
      <Divider />
    </div>
  );
};

const mapStateToProps = (state) => ({
  auth: state.auth.info,
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(FormatKpi);
