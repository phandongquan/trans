import React, { useState, useEffect } from 'react'
import { getProfile } from '~/apis/sales/customer_profile'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClipboard } from '@fortawesome/free-regular-svg-icons'

const CustomerNoteDisplay = ({id}) => {
    const [ profile, setProfile ] = useState(null)
    useEffect(() => {
        let isSubscribed = true
        if(id){
            getProfile(id).then(({status, data})=>{
                if(status && data.CustomerProfile){
                    if (isSubscribed) {
                        setProfile(data.CustomerProfile)
                    }
                }
            }).catch(error=>{
                console.log(error)
            })
        }
        return () => isSubscribed = false
    }, [id])
    if(profile?.note){
        return <span>
            <FontAwesomeIcon icon={faClipboard}/> <span className="text-warning">{profile.note}</span>
        </span>
    }
    return null
}

export default CustomerNoteDisplay