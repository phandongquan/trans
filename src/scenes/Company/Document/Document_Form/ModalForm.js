import React, { Component } from 'react';
import { Modal } from 'antd';
import ReactPlayer from "react-player";
import { URL_HR } from '~/constants';
import {getURLHR, returnMediaType } from '~/services/helper';

const newPrefix = 'training'

class ModalForm extends Component {

    /**.
     * Render content
     */
    renderContent() {
        let { url } = this.props;
        let type = returnMediaType(getURLHR(url));
        if(type == 2)
            return ( 
                <iframe 
                    width='100%'
                    height={600}
                    src={getURLHR(url, newPrefix) || ''}
                />)
        else 
            return ( 
                <ReactPlayer
                    url={getURLHR(url,newPrefix) || ''}
                    playing
                    width='100%'
                    height={600}
                    controls={true}
                />
            )
    }
    render() {
        return (
          <Modal 
          title = 'Title'
          open={this.props.visible}
          onCancel={this.props.hidePopup}
          width='70%'> 
          {this.renderContent()}  
          </Modal>
        )
      }

}

export default (ModalForm)