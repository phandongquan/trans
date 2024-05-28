import React, { Component } from "react";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { Row, Table } from "antd";
import { PageHeader } from "@ant-design/pro-layout";
import tabConfig from "./config/tab";
import Tab from "~/components/Base/Tab";
import { staffBalance } from "~/apis/company/staff";
import { showNotify, formatVND } from '~/services/helper';
import {typeBalanceStaff } from '~/constants/basic';

export class StaffBalance extends Component {
         constructor(props) {
           super(props);
           this.formRef = React.createRef();
           this.state = {
             listBalance: [],
             loading: false,
             code: 0,
           };
         }

         componentDidMount() {
           this.getStaff();
         }

         /**
          *
          * @returns get list balance
          */
         getStaff = (params = {}) => {
           let { match } = this.props;
           let { id } = match.params;
           let xhr = staffBalance(id);
           xhr.then((res) => {
             if (res.status) {
               this.setState({
                 listBalance: res.data,
               });
             } else {
               showNotify("Notification", res.message, "error");
             }
           });
         };
         render() {
           const { t, match } = this.props;
           const filteredData = this.state.listBalance.filter(item => [1,2,4].includes(item.balance_type));
           let { id } = match.params;
           const constTablist = tabConfig(id, this.props);
           const columns = [
             {
               title: "No.",
               align: "center",
               render: (r) => this.state.listBalance.indexOf(r) + 1,
               width: "5%",
             },
             {
               title: t("type"),
               align: "center",
               render: (r) => <small>{typeBalanceStaff[r.balance_type]}</small>,
             },
             {
               title: t("hr:debit"),
               align: "center",
               render: (r) => <span>{formatVND(r.debit, "")}</span>,
             },
             {
               title: t("hr:credit"),
               align: "center",
               render: (r) => <span>{formatVND(r.credit, "")}</span>,
             },
             {
               title: t("hr:update_date"),
               align: "center",
               render: (r) => r.created_at,
             },
           ];
           return (
             <>
               <PageHeader title={t("staff_balance")} />
               <Row className="card p-3 pt-0 mb-3">
                 <Tab tabs={constTablist} />
               </Row>
               <Row className="card mb-1 p-3">
                 <strong className="ml-2">
                   {t("account_code")} 
                 </strong>
               <Table columns={columns} dataSource={filteredData} />
               </Row>
             </>
           );
         }
       }
const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(StaffBalance));
