import React from 'react'
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Trans from '~/utils/Trans'

const ButtonCreate = ({ type, ...props }) => {
    return (
        type === 'link' ? (
            <Link {...props} className="btn btn-info btn-sm" {...props}><FontAwesomeIcon icon={faPlusCircle} style={{marginRight: 10}}/><Trans value="Create"/></Link>
        ):(
            <button {...props} className="btn btn-info btn-sm" {...props}><FontAwesomeIcon icon={faPlusCircle} style={{marginRight: 10}}/><Trans value="Create"/></button>
        )
    )
}

export default ButtonCreate

