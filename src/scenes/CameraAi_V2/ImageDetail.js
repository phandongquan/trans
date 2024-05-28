import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getListCamera } from '~/apis/aiCamera_V2';
import { showNotify } from '~/services/helper';

export class ImageDetail extends Component {
  /**
     * 
     * @param {*} props 
     */
  constructor(props) {
    super(props)
    this.formRef = React.createRef();
    this.state = {
      loading: false,
      data : {}
    }
  }
  componentDidMount(){
    let { t, match } = this.props;
    let id = match.params.id;
    this.getDetailCamera(id)
  }
  async getDetailCamera(id) {
    this.setState({ loading: true })
    let response = await getListCamera({id})
    if (response.status) {
      console.log(response)
    } else {
      showNotify('Notification', response.message, 'error')
      this.setState({ loading: false })
    }
  }
  render() {
    return (
      <div>ImageDetail</div>
    )
  }
}
const mapStateToProps = (state) => {
  return {
      auth: state.auth.info,
      baseData: state.baseData
  }
}
const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(ImageDetail)