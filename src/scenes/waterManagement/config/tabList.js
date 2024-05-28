import React from "react";
export default function(){
    let result = [
        {
            title: 'Daily',
            route: '/water-management'
        },
        {
            title: 'Monthly',
            route: '/water-management/monthly'
        },
        {
            title: 'Account Config',
            route: '/water-management/config'
        },
        {
            title: 'Invoices',
            route: '/water-management/invoices'
        }
    ]
    return result
}