import React, { Fragment, useEffect, useState } from 'react'
import { Drawer, Divider, Spin } from 'antd'
import logo from 'assets/images/logo_spa.png'
import dayjs from 'dayjs'
import Barcode from 'react-barcode'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPhoneSquareAlt, faGlobeAsia, faPhone } from '@fortawesome/free-solid-svg-icons'
import { PHONE_HOTLINE, MST_HASAKI, PHONE_COMPLAIN } from '~/constants'
import { faAngry } from '@fortawesome/free-regular-svg-icons'
export const PrintWindow = ({ element, consultant, loading }) => {
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
                    {consultant.code && <img className="mb-1" src={logo} width="150" alt="logo" onLoad={onLoadLogo}/>}
                    <div>
                        <div><FontAwesomeIcon icon={faPhoneSquareAlt}/> {PHONE_HOTLINE} (Tư vấn)</div>
                        <div><FontAwesomeIcon icon={faPhoneSquareAlt}/> {PHONE_COMPLAIN} (Khiếu nại / góp ý)</div>
                        <div><FontAwesomeIcon icon={faGlobeAsia}/> hasaki.vn/spa - <b>MST</b>: {MST_HASAKI}</div>
                    </div>

                    <Divider className="divider-black font-weight-bold"><span className="h3 mb-0">PHIẾU TƯ VẤN</span></Divider>

                    {consultant.code && <div>
                        <h3 className="font-weight-normal">
                        {consultant.booking_code > 1 ? 2 : 3}{String(consultant.code).substr(-3)}
                        </h3>
                        {consultant.booking_code > 1 && <p>(BOOKING)</p>}
                        {consultant.customer && consultant.customer.customer_name && <h5 className="font-weight-normal text-uppercase">KH: {consultant.customer.customer_name}</h5>}

                        <p className="mb-0">Note: {consultant.note}</p>
                        <Barcode format="CODE128" value={String(consultant.code)} height={40} width={2} displayValue={false} margin={0}/>
                        <p>MS: {consultant.code}</p>
                    </div>}

                    <div className="text-muted small text-center">{dayjs().format('YYYY-MM-DD HH:mm')}</div>
                </div>
            </Drawer>
        </Fragment>
    )
}
export default PrintWindow
