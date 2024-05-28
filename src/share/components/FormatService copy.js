import React from 'react'
import money from '~/utils/money'
import { Tooltip } from 'antd'
import classNames from 'classnames'

export const FormatService = ({service, hideSku, hidePrice, children, prefix, boldName}) => {
    if(!service){
        return null
    }
    const is_diagnostic = service.type == 4
    const is_dangerous = service.options ? service.options.find(item=>item.option_key === 'dangerous_catalog') : null
    return (
        <div>
            {prefix}
            <Tooltip title={is_dangerous ? is_dangerous.option_value || 'Dangerous catalog' : ''}>
                <span className={classNames({'text-warning': is_dangerous})}>{!hideSku && <span><b>{service.service_sku}</b> - </span>}<span className={classNames({'font-weight-bold': boldName})}>{service.service_name}</span> {!hidePrice && !is_diagnostic && `(${money(service.service_price || 0)})`}</span>
            </Tooltip>
            {children}
        </div>
    )
}
