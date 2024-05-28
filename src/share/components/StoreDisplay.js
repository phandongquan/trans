import React from 'react'
import { connect } from 'react-redux'

const StoreDisplay = ({id, stores}) => {
    const store = stores.find(item=>item.store_id == id)
    return (
        <span>
            {store ? store.store_name : id}
        </span>
    )
}
const mapStateToProps = (state) => ({
    stores: state.auth.info.stores
})

const mapDispatchToProps = {
    
}

export default connect(mapStateToProps, mapDispatchToProps)(StoreDisplay)