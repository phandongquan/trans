import React from 'react'
import { connect } from 'react-redux'

const LocationDisplay = ({locationId, storeId, stores, locations}) => {
    const store = stores.find(item=>item.store_id == storeId)
    let location = {}
    if(locationId){
        location = locations.find(item=>item.id == locationId) || {}
    }else if(store){
        location = locations.find(item=>item.id == store.location_id) || {}
    }
    return (
        <span>
            {location.address}
        </span>
    )
}
const mapStateToProps = (state) => ({
    stores: state.auth.info.stores,
    locations: state.auth.info.locations
})

const mapDispatchToProps = {
    
}

export default connect(mapStateToProps, mapDispatchToProps)(LocationDisplay)