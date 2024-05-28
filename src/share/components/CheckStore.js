import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { Alert } from 'antd'

const CheckStore = ({profile}) => {
    if(!profile.ip_allow){
        return <Alert className="bg-warning text-white" type="error" showIcon message={<b className="text-white">STORE INVALID</b>} banner description={`Your account does have permission to access this store. (${profile.ip})`} />
    }
    return null
}
const mapStateToProps = (state) => ({
    profile: state.auth.info.profile,
})

export default connect(mapStateToProps)(CheckStore)