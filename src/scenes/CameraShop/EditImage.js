import React, { Component } from 'react'
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import { historyParams } from '~/services/helper';
import './config/CameraShop.css'
import Canvas from './canvas/Canvas';

class EditImage extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
    }
    /**
     * 
     * @render after update
     */
    renderInfoAfterUpdate = (camInfoNew) =>{
        const { state } = this.props.location;
        if (state && state.camInfo) {
            const stateCopy = { ...state };
            stateCopy.camInfo = camInfoNew;
            this.props.history.replace({ state: stateCopy });
        }
        window.location.reload();
    }
    render() {
        let { t, location: { state } } = this.props
        return (
            <div className="edit-image">
                {
                    state.Image?
                    <Canvas 
                        urlImg={state.Image} infoCamera={state.camInfo} 
                        cbUpdateInfoCam={camInfoNew =>this.renderInfoAfterUpdate(camInfoNew)} 
                        channel = {state.channel} 
                        client_name={state.client_name}
                    />
                    :[]
                }
                
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(EditImage));