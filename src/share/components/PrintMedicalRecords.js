import React, { Fragment, useEffect, useState } from 'react'
import { Divider, Descriptions, Drawer, notification, Space, Spin, Table, Tooltip, Button, Checkbox, Radio } from 'antd';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckSquare, faSquare } from '@fortawesome/free-regular-svg-icons'
import Barcode from 'react-barcode'
import logo from 'assets/images/logo_spa.png'
import dayjs from 'dayjs'
import classNames from 'classnames'
import { MST_HASAKI, COMPANY_FULLNAME, PHONE_HOTLINE, PHONE_COMPLAIN, WEBSITE, FANPAGE } from '~/constants';
import { useTranslation } from 'react-i18next'

const gender_obj = {
    'male': 'Nam',
    'female': 'Nữ',
    'nam': 'Nam',
    'nữ': 'Nữ',
    'nu': 'Nữ'
}

export const PrintWindow = ({ fields, values, customerMedicalRecord, element, loading }) => {
    const [visible, setVisible] = useState(false)
    const { t } = useTranslation()
    const beforePrint =()=> {
        console.log('Functionality to run before printing.');
    };

    const afterPrint =()=> {
        console.log('Functionality to run after printing');
        setVisible(false)
    };
    const eventListener =(mql)=>{
        if (mql.matches) {
            beforePrint();
        } else {
            afterPrint();
        }
    }
    useEffect(() => {
        if (window.matchMedia) {
            const mediaQueryList = window.matchMedia('print');
            mediaQueryList.addListener(eventListener);
        }
        return () => {
            window.matchMedia('print').removeListener(eventListener)
        }
    }, [])
    const onLoadLogo =()=>{
        window.print();
    }
    // const values = records.reduce((acc, cur, i)=> {
    //     acc[cur.medical_record_field_id] = cur
    //     return acc
    // }, {})
    const renderBlock = (field, index) => {
        let label = index ? <><span className="mr-2">{index}.</span> {t(field.name)}</>: t(field.name)
        let input = null
        switch (field.input_type) {
            case 'number_of_visits':
                input = <div className="d-flex justify-content-between align-items-center" style={{width: 230}}>
                    <div><FontAwesomeIcon style={{fontSize: 24, marginRight: 5}} icon={values[field.id]?.value == 1 ? faCheckSquare : faSquare}/> Lần đầu</div>
                    <div>
                        <b>Lần thứ:</b> {values[field.id]?.value}
                    </div>
                </div>
                break;
            case 'customer_gender':
                input = values[field.id] ? <span>{gender_obj[values[field.id].value] || values[field.id].value}</span> : <hr/>
                break;
            case 'yesno':
                input = <>
                    <div style={{width: 65}}><FontAwesomeIcon style={{fontSize: 24, marginRight: 5}} icon={values[field.id]?.value == 1 ? faCheckSquare : faSquare}/> Có</div>
                    <div style={{width: 80}}><FontAwesomeIcon style={{fontSize: 24, marginRight: 5}} icon={values[field.id]?.value == 0 ? faCheckSquare : faSquare}/> Không</div>
                    <span className="font-weight-light">{field.enable_desc ? values[field.id]?.desc : ''}</span>
                </>
                break;
            case 'textarea':
                input = values[field.id] && values[field.id].value != '' ? <span>{values[field.id].value}</span> : <><hr/><hr/></>
                break;
            default:
                input = values[field.id] && values[field.id].value != '' ? <span>{values[field.id].value}</span> : <hr/>
                break;
        }
        return <Descriptions.Item 
            key={field.id}
            className={classNames(`descriptions-preview font-size-16 descriptions-type-${field.input_type} descriptions-block-${field.block}`, {'description-dotted': (!values[field.id] || values[field.id].value == '') && field.input_type != 'yesno' && field.input_type != 'number_of_visits'})}
            span={field.number_of_columns || 12} 
            label={label ? <span>{label}:</span> : null}
        >
            {input}
        </Descriptions.Item>
    }

    return (
        <Fragment>
            <span onClick={()=>setVisible(true)}>
                {element}
            </span>
            <Drawer
               width="100%"
               placement="right"
               onClose={()=>setVisible(false)}
               open={visible}
               destroyOnClose
               closable={false}
               bodyStyle={{padding: '20px 0 0 0'}}
               className="modal-medical-records  medical-records-preview drawer-printing"
            >
                <div style={{maxWidth: 900, margin: '0 auto'}}>
                    <header className="row align-items-center mb-4">
                        <div className="col-4">
                            <img src={logo} width="130" alt="logo" onLoad={onLoadLogo}/>
                        </div>
                        <div className="col-8">
                            <div className="h5 mb-0 text-uppercase">{COMPANY_FULLNAME}</div>
                            <div className="d-flex align-items-center justify-content-between">
                                <div>
                                    <div className="">Hotline tư vấn: {PHONE_HOTLINE} - nhấn phím 2</div>
                                    <div className="">Hotline khiếu nại: {PHONE_COMPLAIN} - nhấn phím 2</div>
                                    <div className="">Website: {WEBSITE}</div>
                                    <div className="">Fanpage: {FANPAGE}</div>
                                </div>
                                <div>
                                    <Barcode format="CODE128" value={String(customerMedicalRecord.medical_record_code)} height={40} displayValue={false} margin={0}/>
                                    <div className="h5 mb-0">MS: <span className="font-weight-normal">{customerMedicalRecord.medical_record_code}</span></div>
                                </div>
                            </div>
                           
                            
                        </div>
                    </header>

                    <Divider className="divider-black font-weight-bold"><span className="h3">HỒ SƠ BỆNH ÁN</span></Divider>
                    <Descriptions
                        column={12}
                        size="small"
                        className="mb-4"
                        colon={false}
                    >
                        {fields.filter(field=> field.input_type !== 'image' && field.block === 1).map(field=> (
                            renderBlock(field)
                        ))}
                        <Descriptions.Item span={12} label={<b className="font-size-16 text-uppercase">{t('Tiền sử y khoa')}</b>}/>
                        {fields.filter(field=> field.input_type !== 'image' && field.block > 1).map((field, field_index)=> (
                            renderBlock(field, field_index + 1)
                        ))}
                    </Descriptions>
                    <div className="">
                        <div className="row">
                            <div className="col-6 font-size-16">
                                
                            </div>
                            <div className="col-6 text-center font-size-16">
                                <div>TP.HCM, Ngày {dayjs(customerMedicalRecord.created_at).format('DD')} Tháng {dayjs(customerMedicalRecord.created_at).format('MM')} Năm {dayjs(customerMedicalRecord.created_at).format('YYYY')}</div>
                                Chữ ký của khách hàng
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 text-muted small">{dayjs().format('YYYY-MM-DD HH:mm')}</div>
                </div>
            </Drawer>
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    @page { 
                        size: A4 portrait;
                        margin: 0;
                    }
                }
            `}} />
        </Fragment>
    )
}
export default PrintWindow
