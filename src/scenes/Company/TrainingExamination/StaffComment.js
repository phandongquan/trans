import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Row, Col, Input, Button, Spin, Avatar , Image } from 'antd'
import { updateResult } from '~/apis/company/trainingExamination/staff';
import { showNotify } from '~/services/helper';
import UploadMultiple from '~/components/Base/UploadMultiple';
import { arrMimeType } from '~/constants/basic';
import { getListComment, createComment } from '~/apis/company/trainingExamination/comment';
import { uniqueId } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile ,faFilePdf} from '@fortawesome/free-solid-svg-icons';
import DateFromNow from './config/DateFromNow';
import { debounce } from 'lodash';

// const MEDIA_URL = 'http://ws.hasaki.local/production/workplace/'
// const MEDIA_URL_HR = 'http://ws.hasaki.local/production/hr/'
const MEDIA_URL = 'https://wshr.hasaki.vn/production/workplace/'
const MEDIA_URL_HR = 'https://wshr.hasaki.vn/production/hr/'
const MEDIA_URL_THUMBNAIL = 'https://wshr.hasaki.vn/thumbnail/250x170/production/workplace/'
export class TrainingExamComment extends Component {

    constructor(props) {
        super(props);
        this.uploadRef = null;
        this.state = {
            value: '',
            loading: false,
            limit: 5,
            total: 0,
            dataComment: []
        }
        this.getListComments = debounce(this.getListComments, 500);
    }

    
    componentDidMount() {
        this.props.onRef(this);
        this.getListComments()

    }
    componentWillUnmount() {
        this.props.onRef(undefined);
    }
    /**
     * get list comment 
     */
    async getListComments(loadMore = false, offset = 0, limit = 5) {
        this.setState({ loading: true });
        let params = {
            object_type: 5,
            offset: offset,
            limit: this.state.limit,
            object_id: this.props.object_id
        }
        let response = await getListComment(params);
        if (response.status) {
            if (Array.isArray(response.data.rows)) {
                let rows = response.data.rows
                this.setState(state => ({ 
                    loading : false ,
                    dataComment: loadMore ? state.dataComment.concat(rows) : rows,
                    total: response.data.total 
                }))
            }
        }
    }
    /**
     * Render media comment
     */
    renderMediaComment = (filesComment) => {
        const { dataComment } = this.state;
        let files = [];
        let imgVideos = [];
        if (filesComment?.files?.length) {
            (filesComment?.files).map(n => {
                if (n.type == 1 || n.type == 3) {
                    imgVideos.push(n)
                } else {
                    files.push(n);
                }
            })
        }
        return <div>
            {files.map((file, index) => {
                const original = file.url.substr(file.url.length - 4);
                return (<div
                    key={file.id}
                    className='position-relative d-flex justify-content-start align-items-center'
                    style={{ backgroundColor: '#F5F5F5', borderRadius: 10 ,padding: 20, marginTop:5}}
                >
                    {
                        original == '.pdf' ?
                            <a  href={`${MEDIA_URL}/${file.url}`} target='_blank' rel='noopener noreferrer'>
                                <FontAwesomeIcon icon={faFilePdf} style={{fontSize : 25}} />
                                <span className='text-muted ml-3'>{file?.url?.split('/').pop()}</span>
                            </a>
                            :
                            <a
                                href={`${MEDIA_URL}/${file.url}`}
                            >
                                <FontAwesomeIcon icon={faFile} style={{fontSize : 25}}/>
                                <span className='text-muted ml-3'>{file?.url?.split('/').pop()}</span>
                            </a>
                    }
                </div>)
            })}

            <div className='d-flex' style={{flexWrap : 'wrap'}}>
                {imgVideos.map((file, index) => {
                    if (file.type == 1) {
                        return (
                            <div className='comment-item ml-1 mb-1' key={file.id} >
                                <Image style={{ objectFit: 'cover' }} src={MEDIA_URL_THUMBNAIL + file.url} width={200} height={130} 
                                    preview={{src : MEDIA_URL + file.url}}
                                    />
                            </div>
                        )
                    }
                     else {
                        return (
                            <div className='comment-item video ml-1 mb-1' key={file.id}>
                                <video controls style={{ backgroundColor: 'black' }} src={MEDIA_URL + file.url} width={200} height={130} />
                            </div>
                        )
                    }
                })}
            </div> 
        </div>
    }
    renderComments = () => {

        let result = []
        let { dataComment } = this.state
        if (dataComment.length) {
            dataComment.map((v, i) => {
                result.push(
                    <div className='d-flex justify-content-start' key={i}>
                        <div className='d-flex justify-content-start mt-2'>
                            <div className='comment-avatar' >
                                <Avatar size={48} src={MEDIA_URL_HR + v.avatar} key={i} />
                            </div>
                            <div className='comment-body pl-2'>
                                <div className='comment-content'>
                                    <div style={{ backgroundColor: '#F5F5F5', borderRadius: 10 ,padding: '5px 10px', marginTop:5 }}>
                                        <div><strong className=''>{v.staff_name}</strong></div>
                                        <span>{v.content}</span>
                                    </div>
                                    <div className='comment-img'>
                                        {this.renderMediaComment(v)}
                                    </div>
                                    <div className='comment-action d-flex justify-content-between align-items-center'>
                                        <span style={{ color:'#777777' , fontWeight: 'bold' , fontSize: 12 }}>
                                            <DateFromNow date={v.updated_at}/>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })
        }

        return result
    }
    /**
     * @event submitForm comment
     */
    async submitComment(loadMore = true) {
        this.setState({loading : true})
        // let values = this.uploadRef.getValues();
        let formData = new FormData();
        formData.append('content',this.state.value)
        formData.append('object_id',this.props.object_id)
        formData.append('object_type',5)
        // if(values.fileList.length){
        //     (values.fileList).map(n =>{
        //         if(n.uid.includes('upload')){
        //             formData.append('files[]',n)
        //         }
        //     })
        // }
        let response = await createComment(formData)
        if(response.status){
            this.getListComments()
            // let { dataComment } = this.state;
            // dataComment.unshift(response.data);
            // this.setState(state => ({ 
            //     loading : false ,
            //     dataComment: loadMore ? dataComment : dataComment,
            // }))
        }
    }

    render() {
        let { total, dataComment } = this.state
        let { value } = this.state;
        return (
            <>
                <Spin spinning={this.state.loading}>
                    <div style={{ fontWeight: 'bold', marginTop: 10, marginBottom: 5, marginLeft: '0.5em' }}>
                        Bình luận:
                    </div>
                    <Row className='border-bottom pb-3'>
                        <Col span={14}>
                            <div className='ml-2 mb-1'>
                                <Input.TextArea rows={2} placeholder='Viết Bình luận'
                                    onChange={value => this.setState({ value: value.target.value })}
                                    value={value}
                                />
                            </div>
                            {/* <UploadMultiple
                                onRef={ref => { this.uploadRef = ref }}
                                type={arrMimeType}
                                size={100}
                            /> */}
                        </Col>
                        <Col className='ml-2 d-flex align-items-end'>
                            <Button type='primary' className='ml-2' onClick={() => this.submitComment()}>Submit</Button>
                        </Col>
                    </Row>
                    <div className='ml-2'>
                        {this.renderComments()}
                    </div>
                    <div className='ml-2'>
                        {total > dataComment?.length ?
                            <Button key={uniqueId('__btn_load_more')} type='text' className='mt-2 pl-1 text-muted' onClick={() => this.getListComments(true, dataComment.length)} >
                                {(`Xem thêm`)} {total - dataComment.length} {('bình luận')}
                            </Button>
                        : ''}
                    </div>
                </Spin>
            </>

        )
    }
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(TrainingExamComment)