import React, { Component } from 'react'
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Spin ,Col, Button , Row ,Checkbox} from "antd";

import { historyParams, showNotify } from '~/services/helper';
import Canvas from './Canvas';
import { getImageCamera ,getTask } from "~/apis/aiCheckLight/ai_check_light";
import { faPlus , faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import _, { uniqueId } from 'lodash';
import { typeCamera } from '~/constants/basic';
import axios from 'axios';

const WS_API = 'https://ai.hasaki.vn/control/check_light_is_on/updateTask'

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
            indexLayer : '',
            idList : [],
            priority : {}
        }
    }
    componentDidMount(){
        const { state } = this.props.location;
        // this.setState({datas : state.ai_control } , () => {
            // if (Array.isArray(state.ai_control) && (state.ai_control).length) {
            //     this.setState({datas : state.ai_control } ,() => this.setState({ data: this.state.datas[0] , indexLayer : 1} , () => this.getImageCamera()) )
            // }
            // if(!Array.isArray(state.ai_control)|| state.ai_control == 0){
            //     let newArrayDatas = [state.ai_control]
            //     // newArrayDatas[0]
            //     this.setState({datas : newArrayDatas } ,() => this.setState({ data: this.state.datas[0] , indexLayer : 1} , () => this.getImageCamera()) )
                
            // }
            this.getImageCamera()
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

        let response = await getImageCamera(params)
        let responseTask = await getTask(params)
        if (response && responseTask) {
            this.setState({ 
                urlImageCamera: response.image_url , loading : false , datas : responseTask.json_list 
                , priority: responseTask.priority}, () => {
                    //get arrValue[0]
                if (Array.isArray(this.state.datas) && (this.state.datas).length) {
                    this.setState({ data: this.state.datas[0], indexLayer: 1 })
                }})
        }
    }
    // /**
    //  * 
    //  * @render after update
    //  */
    // renderInfoAfterUpdate = (camInfoNew) =>{
    //     const { state } = this.props.location;
    //     if (state && state.ai_control) {
    //         const stateCopy = { ...state };
    //         stateCopy.ai_control = camInfoNew;
    //         this.props.history.replace({ state: stateCopy });
    //     }
    //     window.location.reload();
    // }
    addNewLayer(){
        let newDatas = this.state.datas
        let newLayer = {
            IGNORE_TIME : null,
            MAX_PERSON : null,
            MIN_PERSON : null ,
            WAITING_TIME : null,
            TASK_TYPE : null ,
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
        let { t, location: { state } } = this.props

        let newDatas = this.state.datas.slice()
        newDatas.splice(indexValue, 1)

        if(!newDatas.length){
            const formData = new FormData();
            const formDataStatus = new FormData();
            formData.append('IP', state.IP);
            formData.append('port', state.Port);
            formData.append('C', state.channel);
            formData.append('json_list', JSON.stringify(newDatas));
            formData.append('priority', JSON.stringify(this.state.priority));
            formData.append('store_id', state.store_id);

            axios({
                method: 'POST',
                url: WS_API,
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                data: formData
            })
                .then(response => showNotify('Notification','Đã xoá hết layer'))
                .catch(error => console.log(error))
        }

        this.setState({datas : newDatas})
        

        
    }
    onChangePriority(value , key){
        let newpriority = this.state.priority
        newpriority[key] = value.target.checked ? 1 : 0
        this.setState({priority : newpriority})
    }
    render() {
        let { t, location: { state } } = this.props
        let {datas , data , priority} = this.state
        return (
            <div className="edit-image">
                <Spin style={{marginTop: 100}} spinning={this.state.loading} size="large">
                    <div style={{position:'relative'}} >
                        <Col className='card' span={6} style={{left: 0 , top : 3, zIndex: 2 , width:395 ,height: 'auto' , position:'absolute'}}>
                            <Row>
                                <Col span={12}>
                                    <h6 className='m-2'>Ưu tiên task</h6>
                                    {
                                        Object.keys(priority).map(( k )=>{
                                            return(
                                                <div className='ml-2' key={k}>
                                                    <Checkbox defaultChecked={priority[k] === 1 ? true : false} onChange={v => this.onChangePriority(v , k)}>{typeCamera[k]}</Checkbox>
                                                </div>
                                                
                                            )
                                        })
                                    }
                                </Col>
                                <Col span={12}>
                                    <h6 className='m-2'>List Layer</h6>

                                    {
                                        Array.isArray(datas) && (datas).length ?
                                            (datas).map((v, i) => {
                                                return (
                                                    <div className='d-flex align-self-center' key={uniqueId(i)}>
                                                        <div className='cursor-pointer card text-center w-50 mt-2' key={uniqueId(i)}
                                                            onClick={() => {
                                                                this.setState({ data: v, indexLayer: i + 1 })
                                                            }}
                                                            style={{ background:  i == ( this.state.indexLayer -1 )? '#fff495' : (v.new ? '#58dd91' : '') }}
                                                        >
                                                            <span>
                                                                {
                                                                    !v.new ?
                                                                        v.TASK_TYPE ?
                                                                            typeCamera[v.TASK_TYPE]
                                                                            :
                                                                            `Layer-${i + 1}`
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
                                    <Button className='mt-2 mb-2' type='primary'
                                        onClick={() => this.addNewLayer()} icon={<FontAwesomeIcon icon={faPlus}/>}
                                    />
                                </Col>
                            </Row>

                        </Col>
                    {
                        this.state.urlImageCamera ?
                            <Canvas
                                locaName ={state.locaName}
                                ai_control={this.state.data}
                                urlImg={this.state.urlImageCamera}
                                infoCamera={''}
                                channel={state.channel}
                                port={state.Port}
                                IP={state.IP}
                                client_name={''}
                                ai_control_status={state.ai_control_status}
                                // cbUpdateInfoCam={camInfoNew =>this.renderInfoAfterUpdate(camInfoNew)} 

                                store_id = {state.store_id}
                                indexLayer = {this.state.indexLayer}
                                fullLayer = {this.state.datas}
                                changeDatas = {(value , index) => {
                                    let newDatas = this.state.datas
                                    newDatas[index] = value
                                    this.setState({datas : newDatas})
                                }}
                                // idList = {this.state.idList}
                                priority = {this.state.priority}
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