import React from "react";
import { BarChartOutlined } from '@ant-design/icons';
import AnalysisImageComponent from "~/scenes/AnalysisImage/index";

const route = [
    {
        key: "analysis-image",
        name: "Analysis Image",
        component: AnalysisImageComponent,
        path: "/tools/analysis-image",
        permission: "hr-tool-analysis-image-list",
        icon: <BarChartOutlined />,
        template: "main",
    },
];

export { route }