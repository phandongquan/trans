import { Spin } from 'antd'
import React from 'react'
import { options_staff_position } from '~/share/options'

const staff_positions = options_staff_position.reduce((acc, cur, i)=> {
    acc[cur.value] = cur
    return acc
}, {})
export const FormatStaff = ({staff, departments}) => {
    return (
        staff ? <span>
            {/* {staff.staff_name} #{staff.code} */}
            
            {staff.staff_name} 
            {departments ? <small className="text-muted"> (
              {staff_positions[staff.position_id] && <span>{staff_positions[staff.position_id].short_label}</span>}
              {departments[staff.division_id] && <span>/{departments[staff.division_id].name}</span>}
              {departments[staff.staff_dept_id] && <span>/{departments[staff.staff_dept_id].name}</span>}
            )</small> : <span>#{staff.code}</span>}
        </span> : <Spin/>
    )
}
