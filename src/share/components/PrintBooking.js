import React, { Fragment, useEffect, useState } from 'react'
import { Drawer, Divider, Spin, Descriptions } from 'antd'
import logo from 'assets/images/logo_spa.png'
import dayjs from 'dayjs'
import Barcode from 'react-barcode'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPhoneSquareAlt, faGlobeAsia, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons'
import LocationDisplay from './LocationDisplay'
import { PHONE_HOTLINE, MST_HASAKI } from '~/constants'
export const PrintWindow = ({ element, booking, loading }) => {
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
                className="drawer-printing"
            >
                <div className="text-center"><Spin spinning={loading} size="large"/></div>
                <div className="text-center mb-4" style={{maxWidth: 350, margin: '0 auto'}}>
                    {booking.booking_id > 0 && <img className="mb-1" src={logo} width="150" alt="logo" onLoad={onLoadLogo}/>}
                    <div>
                        <div>
                            <FontAwesomeIcon icon={faMapMarkerAlt}/> CN : <LocationDisplay storeId={booking.store_id}/>
                        </div>
                        <div><FontAwesomeIcon icon={faPhoneSquareAlt}/> {PHONE_HOTLINE} (Tư vấn)</div>
                        <div><FontAwesomeIcon icon={faGlobeAsia}/> hasaki.vn/spa - <b>MST</b>: {MST_HASAKI}</div>
                    </div>

                    <Divider className="divider-black font-weight-bold"><span className="h3 mb-0">PHIẾU HẸN</span></Divider>
                    <Descriptions
                        column={1}
                        size="small"
                        colon={false}
                    >
                        <Descriptions.Item label={<span className="font-size-16">MP:</span>}>
                            <span className="font-size-16 text-uppercase font-weight-bold">{booking.booking_code}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label={<span className="font-size-16">Ngày giờ:</span>}>
                            <span className="font-size-16 text-uppercase font-weight-bold">{dayjs.unix(booking.booking_date).format('YYYY-MM-DD HH:mm')}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label={<span className="font-size-16">Khách hàng:</span>}>
                            <span className="font-size-16 text-uppercase font-weight-bold">{booking.booking_name}</span>
                        </Descriptions.Item>
                        <Descriptions.Item label={<span className="font-size-16">Điện thoại:</span>}>
                            <span className="font-size-16 text-uppercase font-weight-bold">{booking.booking_phone}</span>
                        </Descriptions.Item>
                    </Descriptions>
                    <Barcode format="CODE128" value={booking.booking_code+''} height={40} width={2} displayValue={false} margin={0}/>
                    <p>{dayjs().format('YYYY-MM-DD HH:mm:ss')}</p>
                </div>
            </Drawer>
        </Fragment>
    )
}
export default PrintWindow
