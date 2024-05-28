import React, { Component } from 'react'
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Spin ,Col, Button} from "antd";

import { historyParams } from '~/services/helper';
import Canvas from './Canvas';
import { getImageCamera } from "~/apis/aiCheckLight/ai_check_light";
import { faPlus , faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import _, { uniqueId } from 'lodash';
import { typeCamera } from '~/constants/basic';

class EditImage extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            urlImageCamera : '' ,
            loading : false , 
            datas : [] ,
            data : {},
            indexLayer : ''
        }
    }
    componentDidMount(){
        const { state } = this.props.location;
        // this.setState({datas : state.ai_control } , () => {
            if (Array.isArray(state.ai_control) && (state.ai_control).length) {
                this.setState({datas : state.ai_control } ,() => this.setState({ data: this.state.datas[0] , indexLayer : 1} , () => this.getImageCamera()) )
            }
            if(!Array.isArray(state.ai_control)|| state.ai_control == 0){
                let newArrayDatas = [state.ai_control]
                // newArrayDatas[0]
                this.setState({datas : newArrayDatas } ,() => this.setState({ data: this.state.datas[0] , indexLayer : 1} , () => this.getImageCamera()) )
                
            }
            else{
                this.getImageCamera()
            }
            
        // })
    }
    //get image camera 
    async getImageCamera () {
        this.setState({loading : true})
        let { t, location: { state } } = this.props
        let params = {
            IP : state.IP,
            port : state.Port,
            C : state.channel
        }

        let reponse = await getImageCamera(params)
        if (reponse) {
            this.setState({ urlImageCamera: reponse.image_url , loading : false})
        }
    }
    /**
     * 
     * @render after update
     */
    renderInfoAfterUpdate = (camInfoNew) =>{
        const { state } = this.props.location;
        if (state && state.ai_control) {
            const stateCopy = { ...state };
            stateCopy.ai_control = camInfoNew;
            this.props.history.replace({ state: stateCopy });
        }
        window.location.reload();
    }
    addNewLayer(){
        let newDatas = this.state.datas
        let newLayer = {
            IGNORE_TIME : null,
            MAX_PERSON : null,
            MIN_PERSON : null ,
            WAITING_TIME : null,
            type : null ,
            new: 1
        }
        if (newDatas.length) {
            newDatas = [...newDatas, newLayer]
        }else{
            newDatas = [newLayer]
        }
        this.setState({datas : newDatas})
    }
    removeValue(indexValue){
        let newDatas = this.state.datas
        newDatas.splice(indexValue, 1)
        this.setState({datas : newDatas})
    }
    render() {
        let { t, location: { state } } = this.props
        let {datas , data} = this.state

        let indexs = [0]
        return (
            <div className="edit-image">
                <Spin style={{marginTop: 100}} spinning={this.state.loading} size="large">
                    <div style={{position:'relative'}} >
                        <Col className='card' span={4} style={{left: 0 , top : 3, zIndex: 2 , width:395 ,height: 393 , position:'absolute'}}>
                            <h6 className='m-2'>List Layer</h6>
                            {
                                Array.isArray(datas) && (datas).length ?
                                    (datas).map((v , i) => {
                                        return (
                                            <div className='d-flex align-self-center w-50' key={uniqueId(i)}>
                                                <div className='cursor-pointer w-100 card mt-2 text-center' key={uniqueId(i)}
                                                    onClick={() => {
                                                        let newDatas = this.state.datas
                                                        this.setState({ data: v, indexLayer: i + 1})
                                                    }}
                                                    style={{ background: v.status ? '#ede492' : v.new ? '#58dd91' : '' }}
                                                >
                                                    <span>
                                                        {
                                                            !v.new ?
                                                                v ?
                                                                    typeCamera[v?.type]
                                                                    :
                                                                    'Layer'
                                                            :
                                                            `Layer-${i + 1}`
                                                        }
                                                    </span>
                                                </div>
                                                <Button className='ml-2 mt-2' size='small' icon={<FontAwesomeIcon icon={faTrash} />} key={uniqueId(i)}
                                                    onClick={() => this.removeValue(i)}
                                                />
                                            </div>
                                            
                                        )
                                    })
                                :
                                []
                            }
                            <Button className='d-flex align-self-center w-50 mt-2' type='primary'
                                onClick={() => this.addNewLayer()}
                            >
                                <FontAwesomeIcon icon={faPlus} style={{ marginRight: 10 }} />Add new layer
                            </Button>
                        </Col>
                    {
                        this.state.urlImageCamera ?
                            <Canvas
                                ai_control={this.state.data}
                                urlImg={this.state.urlImageCamera}
                                infoCamera={''}
                                channel={state.channel}
                                port={state.Port}
                                IP={state.IP}
                                client_name={''}
                                ai_control_status={state.ai_control_status}
                                cbUpdateInfoCam={camInfoNew =>this.renderInfoAfterUpdate(camInfoNew)} 

                                indexLayer = {this.state.indexLayer}
                                fullLayer = {this.state.datas}
                                changeDatas = {(value , index) => {
                                    let newDatas = this.state.datas
                                    newDatas[index] = value
                                    this.setState({datas : newDatas})
                                }}

                            />
                            : []
                    }
                    </div>
                    
                </Spin>
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