import React, { Component } from 'react'
import { connect } from 'react-redux'

export class ManpowerAllocationForm extends Component {
  render() {
    return (
      <div>
        
      </div>
    )
  }
}
/**
 * Map redux state to component props
 * @param {Object} state 
 */
const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    }
}
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(ManpowerAllocationForm);