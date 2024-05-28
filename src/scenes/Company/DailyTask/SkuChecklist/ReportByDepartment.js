import React, { useState } from "react";
import { Avatar, Table } from "antd";
import { connect } from "react-redux";
import { useEffect } from "react";
import { getVerifySkuByDepartment } from "~/apis/company/dailyTask/skuChecklist";
import { dateFormat } from "~/constants/basic";
import { showNotify, timeFormatStandard, getThumbnailHR } from "~/services/helper";


export const ReportByDepartment = (props) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const {t} = props.translang;
    useEffect(() => {
        getListReport();
    }, [props.params]);

    const getListReport = () =>{
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
        let xhr = getVerifySkuByDepartment(params);
        xhr.then((res) => {
            setLoading(false);
            if (res.status) {
                setData(res.data);
            } else {
                showNotify("Notify", res.message, "error");
            }
        });
    }
    const columns = [
        {
            title: "No.",
            render: (r) => data.indexOf(r) + 1,
            width: 50
        },
        {
            title: t("stock"),
            render: (r) => r.stock_name,
            width: 400
        },
        {
            title: t("hr:total_need_verify"),
            render: (r) => r.total_need_verify,
            width: 130
        },
        // {
        //     title: "Total Assign",
        //     render: (r) =>  r.assign_locid,
        //     width: 130

        // },
        {
            title: t("hr:total_verified"),
            render: (r) => r.total_verified,
            width: 130

        }

    ];
    return (
        <div className='block_scroll_data_table'>
            <div className='main_scroll_table'>
                <Table
                    loading={loading}
                    columns={columns}
                    dataSource={data}
                    rowKey='verifiedBy'
                    pagination={{
                        pageSize: 30,
                        showSizeChanger: false,
                    }}
                />
            </div>
        </div>
    )
};
const mapStateToProps = (state) => ({
    baseData: state.baseData
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ReportByDepartment);