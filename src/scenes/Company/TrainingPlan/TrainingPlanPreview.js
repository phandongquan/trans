import React, { Component } from "react";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { PageHeader } from "@ant-design/pro-layout";
import { Table } from "antd";
import { detailPlan } from '~/apis/company/TrainingPlan';
import { subTypeRangeUsers } from "./config";

class TrainingPlanPreview extends Component {
  /**
   *
   */
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.state = {
      datas: []
    };
  }

  /**
   * 
   */
  componentDidMount() {
    this.getList();
  }

  /**
   * get list traning skill
   */
  getList = () => {
    let { id } = this.props.match.params;
    let xhr = detailPlan(id, { "get-by-skill": 1})
    xhr.then(res => {
      if(res.status) {
        this.setState({ datas: res.data })
      }
    });
  }

  render() {
    let { datas } = this.state;
    let { t, baseData: { majors, departments }} = this.props;
    const columns = [
      {
        title: "No.",
        align: "center",
        render: r => datas.indexOf(r) + 1
      },
      {
        title: t("hr:department"),
        render: r => {
          if(!r.training_plan_detail?.training_plan) {
            return false;
          }
          let deptId = r.training_plan_detail?.training_plan.department_id;
          return departments.find(d => d.id === deptId)?.name
        }
      },
      {
        title: t("hr:major"),
        render: r => {
          if(!r.training_plan_detail?.training_plan) {
            return false;
          }
          let major_ids = r.training_plan_detail?.training_plan.major_id;

          let result = [];
          if(Array.isArray(major_ids)){
            major_ids.map(mId => result.push(majors.find(item => item.id == mId)?.name))
          }

          return result.join(', ');
        }
      },
      {
        title: t("hr:round_title"),
        render: r => r.training_plan_detail?.name
      },
      {
        title: t('hr:skill_name'),
        render: r => r.skill?.name
      },
      {
        title:t("hr:type"),
        render: r => subTypeRangeUsers[r.sub_type]
      },
      {
        title:t("hr:during_times_time") ,
        dataIndex: 'during_time'
      },
    ];
    return (
      <>
        <PageHeader title={t('hr:plan_preview')} />
        <Table columns={columns} 
          dataSource={datas}
          pagination={false}
        />
      </>
    );
  }
}

const mapStateToProps = (state) => {
	return {
		auth: state.auth.info,
		baseData: state.baseData,
	};
};

export default connect(mapStateToProps)(withTranslation()(TrainingPlanPreview));
