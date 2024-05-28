import React from 'react'
import { PHONE_HOTLINE, PHONE_COMPLAIN, SPA_WORKTIME } from '~/constants'
import { faPhoneSquareAlt, faGlobeAsia } from '@fortawesome/free-solid-svg-icons'
import { faClock } from '@fortawesome/free-regular-svg-icons'
import { Space } from 'antd'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export const PrintSPAInfo = () => {
    return (
        <Space size={20}>
            <div><FontAwesomeIcon icon={faPhoneSquareAlt}/> {PHONE_HOTLINE} (Tư vấn)</div>
            <div><FontAwesomeIcon icon={faPhoneSquareAlt}/> {PHONE_COMPLAIN} (Khiếu nại / góp ý)</div>
            <div><FontAwesomeIcon icon={faGlobeAsia}/> hasaki.vn/spa</div>
            <div><FontAwesomeIcon icon={faClock}/> {SPA_WORKTIME}</div>
        </Space>
    )
}
