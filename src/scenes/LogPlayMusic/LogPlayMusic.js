import React, { Component } from 'react'
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Table, Row, Col, Input, Form, Modal } from "antd";
import { PageHeader } from '@ant-design/pro-layout';

class LogPlayMusic extends Component {
  render() {
    return (
      <div>
        <PageHeader title={'Shop play music'} />
        <Row className="card pl-3 pr-3 mb-3" >
            
        </Row>
      </div>
    )
  }
}
const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        baseData: state.baseData
    };
}

const mapDispatchToProps = (dispatch) => {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(LogPlayMusic));
