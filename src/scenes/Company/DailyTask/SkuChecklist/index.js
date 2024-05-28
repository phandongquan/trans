import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import { useTranslation } from 'react-i18next';
import { Row, Col, Form, DatePicker,  Table,  Button, Image, Modal, Input, Spin, Tabs, Divider} from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import Tab from "~/components/Base/Tab";
import tabListTask from "../config/tabList";
import { dateFormat, dateTimeFormat, typeCountDate, screenResponsive, sku_Category } from "~/constants/basic";
import Dropdown from "~/components/Base/Dropdown";
import { getList, getListExcel, getListExportExcel, updateCorrect, updateVerifySku } from "~/apis/company/dailyTask/skuChecklist";
import { getList as apiListStock } from "~/apis/stock";
import { createTaskWorkflow } from '~/apis/taskInput'
import { getList as apiDetailWorkflowConfig } from '~/apis/company/workflowConfig'
import dayjs from "dayjs";
import {timeFormatStandard, historyParams, historyReplace, showNotify, getURLHR, exportToXLS, returnMediaType, checkMajorStoreManager, checkPermission,} from "~/services/helper";
import LazyLoad from "react-lazy-load";
import { MEDIA_URL, URL_HR,  } from "~/constants";
import { get, uniq, uniqueId } from 'lodash'
import { searchForDropdown } from "~/apis/company/staffSearchDropDown";
import { Link } from "react-router-dom";
import { LineOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase, faFileExport, faSearch } from "@fortawesome/free-solid-svg-icons";
import { formatData, getHeader } from "./config/SkuChecklistExport";
import { getCountDate } from "~/apis/company/dailyTask/skuChecklist";
import ReportByStaff from "./ReportByStaff";
import { ReportByDepartment } from "./ReportByDepartment";
const { RangePicker } = DatePicker;
const mediaHR = 'https://hr-media.hasaki.vn'


const valueDiffCount = 1; // Sai lệch
const valueNoDiffCount = 2; // Không sai lệch

const valids = { 0: "Không hợp lệ", 1: "Hợp lệ" };
const wfidDailyChecklist = 182;
const urlWorkTask = 'https://work.hasaki.vn/tasks?task_id='
const FormItem = Form.Item;
export const SkuChecklist = (props) => {
  let params = historyParams();
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] = useState([]);
  const [datas, setDatas] = useState([]);
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [total, setTotal] = useState(0);

  const [staffVerifiedId, setStaffVerifiedId] = useState([])
  // const [staffVerifieds, setStaffVerifieds] = useState([])
  const [visibleSendTask, setVisibleSendTask] = useState(false);
  const [record, setRecord] = useState(null)
  const [wfConfigs, setWfConfigs] = useState([])
  const formRef = useRef(null);
  const formSendTaskRef = useRef(null);
  const [visibleCountDate , setVisibleCountDate] = useState(false);
  const [loadingCountDate, setLoadingCountDate] = useState(false);
  const [datasCountDate, setDatasCountDate] = useState([]);
  const [datasProductModel, setDatasProductModel] = useState([]);
  const [imageSKU , setImageSKU] = useState('');
  const [paramsSearch, setParamsSearch] = useState({});
  const [paramsDepartment, setParamsDepartment] = useState({});
  const [paramsStaff, setParamsStaff] = useState({});
  const [valueStatus , setValueStatus] = useState(null);
  const [valueStatus2 , setValueStatus2] = useState(null);
  const [valueReason , setValueReason] = useState(null);
  const [valueReason2 , setValueReason2] = useState(null);
  const videoModalRef = useRef(null);
  const [dataDetail , setDataDetail] = useState({})
  const [activeTab, setActiveTab] = useState('report');
  const { t, i18n } = useTranslation();
  useEffect(() => {
    const {
      baseData: { stocks: baseDataStocks },
    } = props;
    let tempStocks = [];
    if (baseDataStocks) {
      baseDataStocks.map((s) =>
        tempStocks.push({ id: s.stock_id, name: s.stock_name })
      );
    }
    setStocks(tempStocks);

    let params = historyParams();
    let values = {
      ...params,
      date: (params.from_date &&  params.to_date) ? [dayjs(params.from_date),dayjs(params.to_date)]: [dayjs(),dayjs()],
    };

    formRef.current.setFieldsValue(values);

    getDetailWorkflowConfig()
  }, []);

  useEffect(() => {
    let values = formRef.current.getFieldsValue();
    setParamsSearch(values)
    getListSkuChecklist(values);
  }, [page]);

  // useEffect(() => {
  //   if(staffVerifiedId.length) {
  //     let xhr = searchForDropdown({ code: uniq(staffVerifiedId) , limit : 200 })
  //     xhr.then(res => {
  //       if(res.status) {
  //         setStaffVerifieds(res.data)
  //       }
  //     })

  //   }
  // }, [staffVerifiedId])

  const handleTabChange = (key) => {
    setActiveTab(key); // Update the active tab
  };

  /**
   * Get detail workflow config
   */
  const getDetailWorkflowConfig = () => {
    let xhr = apiDetailWorkflowConfig({ id: wfidDailyChecklist })
    xhr.then(res => {
      if(res.status) {
        setWfConfigs(res.data.rows)
      }
    })
  }

  /**
   * Get list sku checklist
   * @param {*} params
   */
  const getListSkuChecklist = (params = {} , isSearch = false ) => {
    setLoading(true);
    if (params.date) {
      params.from_date = typeof params.date !== undefined && params.date ? timeFormatStandard(params.date[0], dateFormat) : undefined;
      params.to_date = typeof params.date !== undefined && params.date ? timeFormatStandard(params.date[1], dateFormat) : undefined;
      delete (params.date);
    }
    params.limit = limit;
    params.offset = isSearch ? 0 : (page - 1) * limit;
    
    historyReplace(params);

    let xhr = getList(params);
    xhr.then((res) => {
      setLoading(false);
      if (res.data) {
        let { rows } = res.data;
        if(rows) {
          // if(params.diffCount) {
            // let docsFilter = []
            // if(params.diffCount == valueDiffCount) {
            //   docsFilter = docs.filter(d => d.instock != d.count);
            // } else {
            //   docsFilter = docs.filter(d => d.instock == d.count);
            // }
            // setDatas(docsFilter);
            // setTotal(docsFilter.length);
          // } else {
            setDatas(res.data.rows);
            setTotal(res.data.total);
          // }
        } 

        let staffIds = [];
        res.data.rows.map(r => {
          if(r.verifiedBy) {
            staffIds.push(r.verifiedBy)
          }
        })
        setStaffVerifiedId(staffIds)
      }
    });
  };

  /**
   * Submit form
   * @param {*} values
   */
  const submitForm = async (values) => {
    setPage(1);
    if (activeTab === 'report') {
      getListSkuChecklist(values , true);
    }
    if (activeTab === 'report_staff') {
      setParamsStaff(values);
    }
    if (activeTab === 'report_department') {
      setParamsDepartment(values); 
    }
  };

  /**
   * Onchange page
   * @param {*} page
   */
  const onChangePage = async (page) => {
    setPage(page);
  };

  /**
   * On change correct
   * @param {*} value
   * @param {*} id
   */
  const onChangeCorrect = (value, record) => {
    const { auth: {staff_info}} = props;
    setValueStatus(value)
  };
 /**
   * On change correct
   * @param {*} value
   * @param {*} id
   */
 const onChangeCorrect2 = (value, record) => {
  const { auth: {staff_info}} = props;
  setValueStatus2(value)
};
  /**
   * Submit correct
   * @param {*} data 
   */
  const submitCorrect = (params) => {
    setLoading(true);
    // let xhr = updateCorrect(data);
    let xhr = updateVerifySku(params);
    setLoading(false);
    xhr.then((res) => {
      let values = formRef.current.getFieldsValue();
      getListSkuChecklist(values);
    });
  }
  /**
      * Export data
      */
  const exportData = async () => {
    let values = formRef.current.getFieldsValue();
    setLoading(true);
    let params = {
      ...values,
      limit : 200000,
      from_date: typeof values.date !== undefined && values.date ? timeFormatStandard(values.date[0], dateFormat) : undefined,
      to_date: typeof values.date !== undefined && values.date ? timeFormatStandard(values.date[1], dateFormat) : undefined
    }
    delete (params.date);
    let response = await getListExportExcel(params);
    if (response.data) {
      let header = getHeader();
      let data = formatData(response.data , stocks);
      let fileName = `SKU-Checklist-${dayjs(values?.from_date).format('YYYY-MM-DD')}-${dayjs(values?.to_date).format('YYYY-MM-DD')}`;
      let datasExcel = [...header, ...data];
      exportToXLS(
        fileName,
        datasExcel,
        [{ width: 5 }, 
        { width: 5 }, 
        { width: 5 }, 
        { width: 15 }, 
        { width: 15 }, 
        { width: 15 }, 
        { width: 25 }, 
        { width: 30 }, 
        { width: 20 }, 
        { width: 30 }, 
        { width: 20 }, 
        { width: 20 }, 
        { width: 20 }, 
        { width: 15 }, 
        { width: 70 }]
      )
      setLoading(false);
    }
  }
  /**
   * Submit form send task
   */
  const submitFormSendTask = async () => {
    setLoading(true);
    const {t, auth: {staff_info}} = props;
    let values = formSendTaskRef.current.getFieldsValue();

    // Get staff_id by createdBy
    let staff_id = null;
    if (record.createdby) {
      const userId = record.createdby.slice(
        record.createdby.indexOf("(") + 1,
        record.createdby.lastIndexOf(")")
      );

      if (userId) {
        let xhrSearchStaff = searchForDropdown({ user_id: userId });
        await xhrSearchStaff.then((res) => {
          if (res.status) {
            if (res.data && typeof res.data[0] != "undefined") {
              if (res.data[0].user_id == userId) {
                staff_id = res.data[0].staff_id;
              }
            }
          }
        });
      }
    }

    // Nếu không tìm được staff_id
    if (!staff_id) {
      setLoading(false);
      submitCorrect( {
        id: record.id,
        isCorrect: 0,
        verifiedBy: staff_info.code
      })
      return false;
    }

    let urlImage = '';
    if(record.image) {
      urlImage = record.image.split('https://wshr.hasaki.vn/production/ws');
      urlImage = urlImage.pop();
    }

    // Bắn task work.hasaki.vn
    let configs = []
    if(wfConfigs && Array.isArray(wfConfigs)) {
      wfConfigs.map((c, index) => {
        if(c.key == 'status') {
          configs.push({
            required: c.required,
            type: c.type,
            key: c.key,
            label: c.label,
            value: t('invalid')
          })
        }

        if(c.key == 'sku') {
          configs.push({
            required: c.required,
            type: c.type,
            key: c.key,
            label: c.label,
            value: record.sku
          })
        }
      })
    }

    let dataCreateTaskWorkflow = {
      workflow_id: wfidDailyChecklist,
      staff_id: staff_id,
      note: values.note,
      name: 'Daily check stock sai lệch',
      date_start: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      data: { sku_checklist: record.id, configs: configs },
      note_files_feedback: urlImage ? [urlImage] : ''
    } 

    let xhrWorkflow = createTaskWorkflow(dataCreateTaskWorkflow)
    xhrWorkflow.then(res => {
      setVisibleSendTask(false);
      setRecord(null);
      if(res.status) {
        if(res.data) {
          setLoading(false);
          submitCorrect( {
            id: record.id,
            isCorrect: 0,
            verifiedBy: staff_info.code,
            task_id: res.data.id
          })
          return false;
        }
      } else {
        showNotify('Notify', res.message, 'error')
        setLoading(false);
        submitCorrect( {
          id: record.id,
          isCorrect: 0,
          verifiedBy: staff_info.code
        })
        return false;
      }
    })
  };
  const getCountDateDetail = async (id , r) => {
    setRecord(r);
    setValueStatus(r.isCorrect)

    setVisibleCountDate(true)
    setLoadingCountDate(true)
    let response = await getCountDate(id)
    let result = []
    if(response.status) {
      let arrDataCount_date = response.data?.data?.count_date
      let dataProduct_model = response.data?.data?.product_model
      setDatasCountDate(arrDataCount_date?.length ? arrDataCount_date : [])
      setDatasProductModel(dataProduct_model ? [dataProduct_model] : [])
      setImageSKU(response.data?.data?.image)
      setLoadingCountDate(false)
      setDataDetail(response.data)
    }else{
      showNotify('Notification', response.message , 'error')
    }
  }
  const submitChangeStatus2 = async () => { 
    
  }
  const submitChangeStatus = async () => {
    setLoading(true);
    //record biến state
    if (valueStatus == 1) { // hợp lệ
      let data = {
        task_log_id: record.id,
        value: valueStatus,
      };
      submitCorrect(data)
    }
    else { // không hợp lệ
      const { auth: { staff_info } } = props;

      let data = {
        task_log_id: record.id,
        value: valueStatus,
        note: [valueReason]
      }
      submitCorrect(data)
    }
  }
  const renderImageSku = () => {
    let result = []
    if (imageSKU?.length) {
      if (returnMediaType(imageSKU) == 1) {
        let urlThumbnail = imageSKU.replace(
          URL_HR,
          URL_HR + "/thumbnail/100x70"
        );
        result.push(<Image
          preview={{ src: imageSKU }}
          src={urlThumbnail}
          style={{ objectFit: "cover" }}
        />)
      }
      if (returnMediaType(imageSKU) == 3) {
        result.push(<video
          ref={videoModalRef}
          width={200} 
          height={140}
          controls
          src={imageSKU}
          // muted
        >
        </video>)
      }
    }
    return <div className="mt-2">{result}</div>
  }
  const columns = [
    {
      title: "No.",
      render: (r) => datas.indexOf(r) + 1,
      width: '3%',
    },
    {
      title: t("image"),
      render: (r) => {
        if (r.image) {
          if (returnMediaType(r.image) == 1) {
            let urlThumbnail = (r.image)?.includes(URL_HR) ?  
            r.image.replace(URL_HR,URL_HR + "/thumbnail/100x70") 
            : 
            r.image.replace(mediaHR,mediaHR + "/thumbnail/100x70")
            return (
              <LazyLoad height={70}>
                <Image
                  preview={{ src: r.image }}
                  src={urlThumbnail}
                  style={{ objectFit: "cover" }}
                />
              </LazyLoad>
            );
          }
          if (returnMediaType(r.image) == 3) {
            return (
              <div className='text-center'>
                <PlayCircleOutlined style={{fontSize:"40px"}} />
              </div>
            )
          }
        }
      },
    },
    {
      title: t("hr:count"),
      dataIndex: "count",
      sorter: (a, b) => a.count - b.count,
    },
    {
      title: t("instock"),
      dataIndex: "instock",
      sorter: (a, b) => a.instock - b.instock,
    },
    {
      title: t("SKU"),
      dataIndex: "sku",
    },
    {
      title: t("date"),
      dataIndex: "date",
    },
    {
      title: t("stock"),
      dataIndex: "stock_id",
      render: (id) => stocks.find((s) => s.id == id)?.name,
    },
    {
      title: t("created_by"),
      render: (r) => (
        <span>
          {r.created_by_staff?.staff_name}
          <small>
            <br />{" "}
            {r.createdDate
              ? timeFormatStandard(r.createdDate, dateTimeFormat, true)
              : ""}
          </small>
        </span>
      ),
    },
    {
      title: t("verified_by"),
      render: (r) => <span>
          {r.verify_by_staff?.staff_name}
          <small>
            <br />{" "}
            {r.verifiedDate
              ? timeFormatStandard(r.verifiedDate, dateTimeFormat, true)
              : ""}
          </small>
        </span>
      },
    {
      title: t("status"),
      render: (r) => r.verifiedBy ? valids[r.isCorrect] : 'Chưa đánh giá',
      sorter: (a, b) => a.isCorrect - b.isCorrect,
    },
    {
      title: t("action"),
      render: r => 
      {
        return checkPermission('hr-daily-task-sku-checklist-update') ? 
         <Button type='primary' size='small' className='m-1' onClick={() => getCountDateDetail(r.id , r)}>
        Đánh giá
        </Button> : ''
      }
    },
    {
      title: t("hr:link_task"),
      render: (r) => {
        if(r.task_id) {
          return <a href={urlWorkTask + r.task_id} target='_blank'>{r.task_id}</a>
        }
      }
    },
  ];
  const columnsCountDate = [
    {
      title:t("image"), 
      width: '30%',
      render: r => {
        if (r.image) {
          let typeMedia = returnMediaType(r.image);
          if(typeMedia == 3) {
            return <video
              width={200} 
              height={140}
              controls
              src={r.image}
            >
            </video>
          } else {
            let urlThumbnail = r.image.replace(
              URL_HR,
              URL_HR + "/thumbnail/100x70"
            );
            return (
                <Image
                  preview={{ src: r.image }}
                  src={urlThumbnail}
                  style={{ objectFit: "cover" }}
                />
            );
          }
        }
    }
      // <Image src={r.image} width={125} height={125}/>
    },
    {
      title:t("hr:count"), 
      width: '20%',
      align :'center',
      render : r => r.count
    },
    {
      title:t("type"), 
      render : r => typeCountDate[r.dateType]
    },
    {
      title:t("date"), 
      render : r => r.dateValue
    },

  ]
  const columnsProductModel = [
    {
      title: t("image"),
      width: '50%',
      render: r => {
        if (r.image) {
          let urlThumbnail = r.image.replace(
            URL_HR,
            URL_HR + "/thumbnail/100x70"
          );
          return (
            <Image
              preview={{ src: r.image }}
              src={urlThumbnail}
              style={{ objectFit: "cover" }}
            />
          );
        }
      }
    },
    {
      title:t("type"), 
      render : r => typeCountDate[r.dateType]
    },
    {
      title:t("date"), 
      render : r => r.dateValue
    },
  ]
  let styleTitleModal = { fontSize: 15, fontWeight: 600}
 
  
  return (
    <div>
      <PageHeader title={t('sku_checklist')} />
      <Row className="card pl-3 pr-3 mb-3">
        <div id="tab_responsive">
          <div className='tab_content_mantenance_device'>
           <Tab tabs={tabListTask(props)}></Tab>
          </div>
        </div>
        <Form
          className="pt-3"
          ref={formRef}
          onFinish={(values) => submitForm(values)}
        >
          <Row gutter={12}>
            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
              <FormItem name="sku">
                <Input placeholder="SKU" />
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={4} xl={4}>
              <FormItem name={'category_id'}>
                <Dropdown datas={sku_Category} defaultOption={t('category')} />
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={6} xl={4}>
              <Form.Item name="date">
                <RangePicker style={{ width: "100%" }} format={dateFormat} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={24} lg={3} xl={3}>
              <FormItem name="stock_id">
                <Dropdown datas={stocks} defaultOption={t('hr:all_stock')}/>
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={3} xl={3}>
              <FormItem name="isCorrect">
                <Dropdown
                  datas={{ 0: t('invalid'), 1: t('valid'), 2: t('hr:not_yet_rated') }}
                  defaultOption= {t('hr:evaluate')}
                />
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={3} xl={3}>
              <FormItem name="diffCount">
                <Dropdown

                  datas={{ 0: t("hr:no_deviation"), 1: t("hr:deviation") }}
                  defaultOption={t('hr:no_chossen')}
                />
              </FormItem>
            </Col>
            <Col xs={24} sm={24} md={24} lg={5} xl={4} key="submit">
              <FormItem>
                <Button type="primary" htmlType="submit" className="mr-2">
                  {t('search')}
                </Button>
                {
                  checkPermission('hr-daily-task-sku-checklist-export') ? 
                    <Button
                      key="export-staff"
                      type="primary"
                      onClick={() => exportData()}
                      icon={<FontAwesomeIcon icon={faFileExport} />}
                    >
                       {t('export_file')}
                    </Button>
                  : ''
                }
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Row>
      <Row gutter={[16, 24]}>
        <Col span={24} className={window.innerWidth < screenResponsive  ? "" :"card"}>
          <Tabs activeKey={activeTab} onChange={handleTabChange}>
            <Tabs.TabPane tab={t('report')} key="report">
              <div className="mt-2">
                {window.innerWidth < screenResponsive  ? 
                  <div className='block_scroll_data_table'>
                    <div className='main_scroll_table'> 
                        <Table
                            dataSource={datas}
                            columns={columns}
                            loading={loading}
                            rowKey="id"
                            rowClassName={(r) =>
                              r.count !== r.instock ? "bg-warning" : ""
                            }
                            pagination={{
                              pageSize: limit,
                              total: total,
                              showSizeChanger: false,
                              onChange: (page) => onChangePage(page),                            
                            }}
                        />
                        </div>
                    </div>
                      :
                    <Table
                      dataSource={datas}
                      columns={columns}
                      loading={loading}
                      rowKey="id"
                      rowClassName={(r) =>
                        r.count !== r.instock ? "bg-warning" : ""
                      }
                      pagination={{
                        pageSize: 30,
                        showSizeChanger: false,

                        pageSize: limit,
                        total: total,
                        showSizeChanger: false,
                        onChange: (page) => onChangePage(page),
                        // hideOnSinglePage: true,
                        // current: Number(page),
                      }}
                    />
                    }
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane tab={t('hr:report_by_staff')} key="report_staff">
              <div className="mt-2">
                <ReportByStaff page={page} limit={limit} params={paramsStaff} translang = {props}/>
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane tab={t('hr:report_by_stock')} key="report_department">
              <div className="mt-2">
                <ReportByDepartment page={page} limit={limit} params={paramsDepartment} translang = {props}/>
              </div>
            </Tabs.TabPane>
          </Tabs>
        </Col>
      </Row>

      {/* <Modal
        open={visibleSendTask}
        onCancel={() => {
          setVisibleSendTask(false);
          setRecord(null);
          formSendTaskRef.current.resetFields();
        }}
        onOk={() => submitFormSendTask()}
        width="40%"
        title="Nội dung công việc"
      >
        <Spin spinning={loading}>
          <Form ref={formSendTaskRef}>
            <Form.Item name="note">
              <Dropdown
                datas={{
                  "Hình bị mờ": "Hình bị mờ",
                  "Hình chụp không đúng": "Hình chụp không đúng",
                  "Không sắp xếp đúng cách": "Không sắp xếp đúng cách",
                  "Không thấy nhãn hiệu": "Không thấy nhãn hiệu",
                  "Lý do khác": "Lý do khác",
                  "Sai date" : "Sai date",
                }}
                defaultOption="Chọn lý do"
              />
            </Form.Item>
          </Form>
        </Spin>
      </Modal> */}
      {
        visibleCountDate ?
          <Modal
          open={visibleCountDate}
            onCancel={() => {
              if(videoModalRef && videoModalRef.current){
                videoModalRef.current.pause()
              }
              setVisibleCountDate(false);
            }}
            footer={null}
            title="Count Date"
            width={window.innerWidth < screenResponsive  ? "100%": "60%"}
            afterClose={() => {
              setDatasCountDate([]);
              setDatasProductModel([]);
              setImageSKU("");
              setRecord(null);
              setValueStatus(null)
              setValueReason (null)
              setValueStatus2(null)
              setValueReason2 (null)
              setDataDetail({})
            }}
          >
            <div className="d-flex justify-content-between">
              <div>
                <strong style={styleTitleModal}>Sku:&nbsp;</strong><span>{dataDetail?.sku}</span><br/>
                <span>Name:&nbsp;</span><span>{dataDetail?.data?.product_name}</span><br/>
                <span>Barcode:&nbsp;</span><span>{dataDetail?.data?.barcode}</span><br/>
                <span>Count:&nbsp;</span><span>{dataDetail?.data?.count}</span><br/>
              </div>
              <div>
                <span style={styleTitleModal}>Verified By</span><br/>
                <span>
                  {dataDetail?.verifiedDate ? dayjs(dataDetail.verifiedDate * 1000).format('YYYY-MM-DD HH:mm:ss') : ''}
                  &nbsp;
                  <strong>By#{dataDetail?.verifiedBy}</strong>
                </span><br/>
                <span style={styleTitleModal}>Count date</span><br/>
                <span>{dataDetail?.date}</span><br/>
                <span style={styleTitleModal}>Update time</span><br/>
                <span>{dataDetail?.updated_at}</span>
              </div>
              <div>
                <span style={styleTitleModal}>Status</span><br/>
                <span>{valids[dataDetail?.isCorrect]}</span>
              </div>

            </div>
            <Divider />
            <Row gutter={24}>
              <Col span={6}>
                {renderImageSku()}
              </Col>
              <Col span={18}>
                <Row>
                  <Col span={4}>
                    <span style={styleTitleModal}>Sku:&nbsp;</span>
                  </Col>
                  <Col span={20}>
                    <span>{dataDetail?.sku}</span>
                  </Col>
                </Row>
                <Row>
                  <Col span={4}>
                    <span style={styleTitleModal}>Name:&nbsp;</span>
                  </Col>
                  <Col span={20}>
                    <span>{dataDetail?.data?.product_name}</span>
                  </Col>
                </Row>
                <Row>
                  <Col span={4}>
                    <span style={styleTitleModal}>Barcode:&nbsp;</span>
                  </Col>
                  <Col span={20}>
                    <span>{dataDetail?.data?.barcode}</span>
                  </Col>
                </Row>
                <Row>
                  <Col span={4}>
                    <span style={styleTitleModal}>Count:&nbsp;</span>
                  </Col>
                  <Col span={20}>
                    <span>{dataDetail?.count}</span>
                  </Col>
                </Row>
              </Col>
              
              <Col span={24} className="mt-2">
                <span style={styleTitleModal}>Count Date</span>
                <Table
                  dataSource={datasCountDate}
                  columns={columnsCountDate}
                  loading={loadingCountDate}
                  rowKey={(r) => uniqueId()}
                  pagination={false}
                  className="mt-2"
                />
              </Col>
              <Col span={24} className="mt-2">
                <span style={styleTitleModal}>Trưng bày</span>
                <Table
                  dataSource={datasProductModel}
                  columns={columnsProductModel}
                  loading={loadingCountDate}
                  rowKey={(r) => uniqueId()}
                  pagination={false}
                  className="mt-2"
                />
              </Col>
            </Row>
            {
              !checkMajorStoreManager(props.staffInfo.major_id) ?
                <Row gutter={[24, 0]} className="mt-2">
                  <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                    <span style={styleTitleModal} className="mb-2">Đánh giá</span><br />
                    <Dropdown datas={valids} value={valueStatus} defaultOption="-- Chọn trạng thái --" onChange={(value) => onChangeCorrect(value)} />
                  </Col>
                  {
                    //trường hợp không hợp lệ
                    valueStatus == 0 ?
                      <Col xs={24} sm={24} md={24} lg={6} xl={6}>
                        <span style={styleTitleModal} className="mb-2">Lý do</span><br />
                        <Dropdown
                          value={valueReason}
                          datas={{
                            'Sai số lượng': 'Sai số lượng',
                            'Sai sản phẩm/SKU': 'Sai sản phẩm/SKU',
                            'Sai date': 'Sai date',
                            'Sai số lượng theo date': 'Sai số lượng theo date',
                            'Sắp xếp không đúng quy cách': 'Sắp xếp không đúng quy cách',
                            'Không xác định': 'Không xác định'
                          }}
                          defaultOption="Chọn lý do"
                          onChange={v => setValueReason(v)}
                        />
                      </Col>
                      : []
                  }

                  {
                    record.verifiedBy > 0 ?
                      []
                      : <Col xs={24} sm={24} md={24} lg={4} xl={4}>
                        <span style={styleTitleModal} className="mb-2"></span><br />
                        {
                          checkPermission('hr-daily-task-sku-checklist-detail-update') ? 
                            <Button type='primary' onClick={() => submitChangeStatus()}>Submit</Button>
                          : ''
                        }
                      </Col>
                  }
                </Row>
                : []
            }
            
            {/* {
              record.verifiedBy > 0 ?
                <Row gutter={[24, 0]} className="mt-2">
                  <Col span={6}>
                    <span style={{ fontSize: 15, fontWeight: 600 }} className="mb-2">Đánh giá lần 2</span><br />
                    <Dropdown datas={valids} value={valueStatus2} defaultOption="-- Chọn trạng thái --" onChange={(value) => onChangeCorrect2(value)} />
                  </Col>
                  {
                    //trường hợp không hợp lệ
                    valueStatus2 == 0 ?
                      <Col span={6}>
                        <span style={{ fontSize: 15, fontWeight: 600 }} className="mb-2">Lý do</span><br />
                        <Dropdown
                          value={valueReason2}
                          datas={{
                            "Hình bị mờ": "Hình bị mờ",
                            "Hình chụp không đúng": "Hình chụp không đúng",
                            "Không sắp xếp đúng cách": "Không sắp xếp đúng cách",
                            "Không thấy nhãn hiệu": "Không thấy nhãn hiệu",
                            "Lý do khác": "Lý do khác",
                            "Sai date": "Sai date",
                          }}
                          defaultOption="Chọn lý do"
                          onChange={v => setValueReason2(v)}
                        />
                      </Col>
                      : []
                  }
                  <Col span={4}>
                    <span style={{ fontSize: 15, fontWeight: 600 }} className="mb-2"></span><br />
                    <Button type='primary' onClick={() => submitChangeStatus2()}>Submit</Button>
                  </Col>
                </Row>
                :
                []
            } */}
          </Modal>

          : []
      }

    </div>
  );
};

const mapStateToProps = (state) => ({
  baseData: state.baseData,
  auth: state.auth.info
});

const mapDispatchToProps = (dispatch) => {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(SkuChecklist);
