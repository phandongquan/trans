// export default [
//   {
//     title: "KPI Config",
//     route: "/company/kpiconfig",
//   },
//   {
//     title: "Group",
//     route: "/company/kpiconfig/group",
//   },

import { checkPermission } from "~/services/helper";

// ];
export default function (props){
  let result = [] ;
  const {t} = props;
  if (checkPermission('hr-kpi-config-list')){
    result.push({
      title: t("hr:kpi_config"),
      route: "/company/kpiconfig",
    })
  }
  if (checkPermission('hr-kpi-config-group-list')) {
    result.push({
      title: t("hr:group"),
      route: "/company/kpiconfig/group",
    })
  }
  return result;
}


