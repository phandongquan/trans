import React, { Fragment, useEffect, useState } from 'react'
import { Spin, Descriptions, Table, Divider, Drawer, Space } from 'antd';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSquare } from '@fortawesome/free-regular-svg-icons'
import Barcode from 'react-barcode'
import logo from 'assets/images/logo_spa.png'
import dayjs from 'dayjs'
import LocationDisplay from './LocationDisplay';
import { FormatMedicationNote } from './FormatMedicationNote';
import { templates } from '~/share/template_print'
import { MST_HASAKI } from '~/constants'
import { PrintSPAInfo } from './PrintSPAInfo';
export const PrintWindow = ({ prescription, element, loading }) => {
    const [visible, setVisible] = useState(false)
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
               bodyStyle={{padding: 0}}
               className="drawer-printing"
            >
                <div className="text-center"><Spin spinning={loading} size="large"/></div>
                <div className="print-wrapper" style={{maxWidth: 700, margin: '0 auto'}}>
                    <header className="row align-items-center mb-4">
                        <div className="col-6">
                            <img src={logo} width="130" alt="logo" onLoad={onLoadLogo}/>
                        </div>
                        <div className="col-6">
                            <Barcode format="CODE128" value={String(prescription.data.code)} height={40} displayValue={false} margin={0}/>
                            <div className="h5 mb-0">MS: <span className="font-weight-normal">{prescription.data.code}</span></div>
                        </div>
                    </header>
                    <Space size={20}>
                        <div><FontAwesomeIcon icon={faMapMarkerAlt}/> CN : <LocationDisplay storeId={prescription.data.store_id}/></div>
                        <div><b>MST</b> : {MST_HASAKI}</div>
                    </Space>
                    <PrintSPAInfo/>

                    <Divider className="divider-black font-weight-bold"><span className="h3">TOA THUỐC</span></Divider>
                    <Descriptions
                        column={4}
                        size="small"
                        className="mb-1"
                        colon={false}
                    >
                        <Descriptions.Item span={2} label={<span className="font-size-16">Họ tên:</span>}>
                            <span className="font-size-16 text-uppercase font-weight-bold">{prescription.customer.customer_name}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label={<span className="font-size-16">Năm sinh:</span>}>
                            <hr className="m-0 p-0" style={{width: 50, borderTopStyle: 'dotted'}}/>
                        </Descriptions.Item>
                        <Descriptions.Item label={<span className="font-size-16"><FontAwesomeIcon icon={faSquare}/> Nam <FontAwesomeIcon className="ml-2" icon={faSquare}/> Nữ</span>}>
                        </Descriptions.Item>
                        <Descriptions.Item span={2} label={<span className="font-size-16">SĐT:</span>}>
                            <span className="font-size-16 text-uppercase font-weight-bold">{prescription.customer.customer_phone}</span>
                        </Descriptions.Item>
                        <Descriptions.Item span={2} label={<span className="font-size-16">Địa chỉ:</span>}>
                            <span className="font-size-16">{prescription.customer.customer_district || ''}</span>
                        </Descriptions.Item>
                        {/* <Descriptions.Item label={<span className="font-size-16">Nghề nghiệp:</span>}>
                            <hr className="m-0 p-0" style={{width: 100, borderTopStyle: 'dotted'}}/>
                        </Descriptions.Item> */}
                        <Descriptions.Item label={<span className="font-size-16">Chẩn đoán:</span>} span={4}>
                            <b className="font-size-16">{(prescription.data.items ? prescription.data.items.filter(item=>item.type === 4) : []).map(item=>item.service.service_name).join('; ')}</b>
                        </Descriptions.Item>
                    </Descriptions>
                    <Table
                        rowKey="id"
                        size="small"
                        className="mb-3 table-hide-empty"
                        // bordered
                        dataSource={prescription.data.items ? prescription.data.items.filter(item=>item.type === 3) : []}
                        pagination={false}
                        columns={[
                            {
                                title: <b>Tên thuốc</b>,
                                className: 'text-left font-size-16',
                                render: (value, record, i)=> {
                                    // let note_str = ''
                                    // let cach_dung = ''
                                    // let unit = 'lần'
                                    // let luu_y = ''
                                    // if(isJSON(record.note)){
                                    //     const note = JSON.parse(record.note)
                                    //     if(note.cach_dung === 'Uống'){
                                    //         unit = 'viên'
                                    //     }
                                    //     note_str = note.cach_dung ? ` Cách dùng: ${note.cach_dung}` : ''
                                    //     note_str += note.sang ? ` - Sáng: ${note.sang} ${unit}` : ''
                                    //     note_str += note.trua ? ` - Trưa: ${note.trua} ${unit}` : ''
                                    //     note_str += note.toi ? ` - Tối: ${note.toi} ${unit}` : ''
                                    //     note_str = note_str.trim().replace(/^-+|-+$/g, '')

                                    //     luu_y = note.luu_y ? note.luu_y : ''

                                    // }else if(typeof record.note === 'string'){ // OLD format
                                    //     const arr_note = String(value.note).split('-')
                                    //     for (let index = 0; index < arr_note.length; index++) {
                                    //         const element = arr_note[index];
                                    //         if(element.indexOf('Cách dùng') > -1){
                                    //             cach_dung = element.split(':')[1].trim()

                                    //             note_str += `Cách dùng: ${cach_dung}`
                                    //             if(cach_dung == 'Uống'){
                                    //                 unit = 'viên'
                                    //             }
                                    //         }
                                    //         if(element.indexOf('Sáng') > -1){
                                    //             note_str += ` - Sáng: ${element.split(':')[1].trim()} ${unit}`
                                    //         }
                                    //         if(element.indexOf('Trưa') > -1){
                                    //             note_str += ` - Trưa: ${element.split(':')[1].trim()} ${unit}`
                                    //         }
                                    //         if(element.indexOf('Tối') > -1){
                                    //             note_str += ` - Tối: ${element.split(':')[1].trim()} ${unit}`
                                    //         }
                                    //         if(element.indexOf('Lưu ý') > -1){
                                    //             luu_y = element.replace('Lưu ý:', '').trim()
                                    //         }
                                    //     }
                                    // }

                                    return <div className="text-uppercase">
                                        <div>{i+1}) <b>{value.service.service_name}</b></div>

                                        <FormatMedicationNote note={record.note} />
                                    </div>
                                }
                            },
                            {
                                title: <b>Số lượng</b>,
                                width: 90,
                                dataIndex: 'qty',
                                key: 'qty',
                                className: 'text-center font-size-16 align-top',
                                render: (value)=>(
                                    <b>{value}</b>
                                )
                            }
                        ]}
                    />
                    <Descriptions
                        column={1}
                        size="small"
                    >
                        <Descriptions.Item style={{display: 'flex'}} label={<span className="font-size-16 font-weight-bold">Chỉ định dịch vụ</span>}><span className="font-size-16">{(prescription.data.items ? prescription.data.items.filter(item=>item.type === 1 || item.type === 2) : []).map(item=><div key={item.sku} className="font-weight-bold">- {item.service.service_name} (<b>x{item.qty}</b>)</div>)}</span></Descriptions.Item>
                        <Descriptions.Item label={<span className="font-size-16 font-weight-bold">Lời dặn</span>}><span className="font-size-16">{prescription.data.note}</span></Descriptions.Item>
                    </Descriptions>
                    <div className="">
                        <div className="row">
                            <div className="col-6 font-size-16">
                                <i>Ngày tái khám</i>: {prescription.booking && prescription.booking.booking_date ? dayjs.unix(prescription.booking.booking_date).format('HH[H] DD-MM-YYYY') : ''}
                            </div>
                            <div className="col-6 text-center font-size-16">
                                <div>Ngày {dayjs(prescription.data.created_at).format('DD')} Tháng {dayjs(prescription.data.created_at).format('MM')} Năm {dayjs(prescription.data.created_at).format('YYYY')}</div>
                                Bác sĩ kê toa
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 text-muted small">{dayjs().format('YYYY-MM-DD HH:mm')}</div>

                    {(prescription.data.items || []).reduce((acc, cur, i)=>{
                        if(cur.service?.options){
                            const option = cur.service.options.find(option=>option.option_key === "attached_printing")
                            if(option && acc.indexOf(option.option_value) === -1){
                                acc.push(option.option_value)
                            }
                        }
                        return acc
                    }, []).map(item=>(
                        <div key={item}>
                            <div className="page-break"></div>
                            <div className="mt-5 pt-5">{templates[item]}</div>
                        </div>
                    ))}
                </div>
            </Drawer>
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    @page { 
                        size: A5 portrait;
                        margin: 0;
                    }
                }
            `}} />
        </Fragment>
    )
}
export default PrintWindow
