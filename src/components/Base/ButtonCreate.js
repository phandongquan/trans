import React from 'react'
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const ButtonCreate = ({ type, ...props }) => {
    return (
        type === 'link' ? (
            <Link {...props} className="btn btn-info btn-sm" {...props}><FontAwesomeIcon icon={faPlusCircle} style={{marginRight: 10}}/>Create</Link>
        ):(
            <button {...props} className="btn btn-info btn-sm" {...props}><FontAwesomeIcon icon={faPlusCircle} style={{marginRight: 10}}/>Create</button>
        )
    )
}

export default ButtonCreate

