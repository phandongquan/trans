import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Form, Image, Table, Row, Col, Modal, Pagination } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { timeFormatStandard } from '~/services/helper';
import { dateTimeFormat } from '~/constants/basic';
import Dropdown from '~/components/Base/Dropdown';
import { getList } from '~/apis/aiDetection';
import dayjs from 'dayjs';
import { DoubleRightOutlined } from '@ant-design/icons';
import { uniqueId } from 'lodash';
import FsLightbox from 'fslightbox-react';

const FormItem = Form.Item;
class AiDetection extends Component {

    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            datas: [],
            limit: 60,
            page: 1,
            total: 0,
            
            toggler: false,
            slide: 1
        };
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        this.getLisAi();
    }



    /**
     * event click btn search
     * @param {*} e 
     */
    submitForm = (values) => {
        this.getLisAi(values);
    }

    /**
     * Get list
     * @param {Object} params 
     */
    async getLisAi(params = {}) {
        this.setState({ loading: true });
        params = {
            ...params,
            offset: (this.state.page - 1) * this.state.limit,
            limit: this.state.limit,
        }
        let xhr = getList(params);
        xhr.then((response) => {
            if (response.status) {
                let { data } = response;
                this.setState({
                    loading: false,
                    datas: data.rows,
                    rootPath: data.root_path,
                    total: data.total
                });
            }
        });
    }

    /**
     * @event change page
     * 
     * @param {*} page 
     */
     onChangePage(page) {
        let values = this.formRef.current.getFieldsValue();
        this.setState({ page }, () => this.getLisAi({ ...values }));
    }

    /**
     * Chunk array
     * @param {*} arr 
     * @param {*} size 
     * @returns 
     */
    chunk = (arr, size) =>
        Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
            arr.slice(i * size, i * size + size)
    );

    /**
     * Render content
     */
    renderContent = () => {
        const { datas } = this.state;
        const { baseData: { locations } } = this.props;
        let arrImgs = [];
        if(Array.isArray(datas)) {
            datas.map((d, index) => {
                const location = locations.find(l => l.id == d.location_id);
                const images = JSON.parse(d.images);
                images.map(i => arrImgs.push({ 
                    src: this.state.rootPath + 'ai/' + dayjs(d.created_at).format('YYYY/MM/DD') + '/' + i, 
                    location: location?.name,
                    cam_id: d.cam_id,
                    created_at: timeFormatStandard(d.created_at, 'HH:mm DD/MM/YYYY'),
                    index: index
                }));
            })
        }

        const sizeChunk = 6;
        let result = [];

        this.chunk(arrImgs, sizeChunk).map((arrChunk, index) => {
            let arrCol = [];
            if (Array.isArray(arrChunk)) {
                arrChunk.map(i => {
                    arrCol.push(<Col key={uniqueId('__ai_img')} span={4} className='mb-2'>
                        <div className='mr-2 mb-3' style={{ boxShadow: 'rgb(0 0 0 / 10%) 1.3px 2.7px 5px 0px'}}>
                            <Image src={i.src} onClick={() => this.setState(state => { return { toggler: !state.toggler, slide: i.index } })} style={{width:'100%', height:'140px'}} />
                            <div className='mb-1 p-1'>
                                {i.location ? <span>{i.location} <br/></span> : ''}
                                <strong className=''> Cam {i.cam_id} </strong>
                                <small className='text-muted float-right'>{i.created_at}</small>
                            </div>
                        </div>
                    </Col>)
                })
            }
            result.push(<Row key={index}>{arrCol}</Row>)
        })

        return result;
    }

    /**
     * @render
     */
    render() {
        const { t, baseData: { locations } } = this.props;
        let { datas } = this.state;

        let dataSource = [];
        if(Array.isArray(datas)) {
            datas.map(d => {
                const images = JSON.parse(d.images);
                images.map(i => dataSource.push(<img src={this.state.rootPath + 'ai/' + dayjs(d.created_at).format('YYYY/MM/DD') + '/' + i} /> ));
            })
        }

        return (
            <div>
                <PageHeader title={t('AI Detection')} />
                <Row className="card pr-1 mb-2 pl-3 pr-3">
                    <Form layout="vertical" className="pt-3"
                        ref={this.formRef}
                        onFinish={this.submitForm.bind(this)}>
                        <Row gutter={12}>
                            <Col span={4} key=''>
                                <FormItem name="location_id">
                                    <Dropdown datas={locations} defaultOption="-- All Locations --" />
                                </FormItem>
                            </Col>
                            <Col span={6} className='mb-2'>
                                <Button type="primary" htmlType="submit" className='mr-2'
                                    icon={<FontAwesomeIcon icon={faSearch} />}>
                                    {t('Search')}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Row>

                <div>
                    { this.renderContent() }
                </div>

                <div className='float-right'>
                    <Pagination
                        total={this.state.total}
                        pageSize={this.state.limit}
                        hideOnSinglePage={true}
                        showSizeChanger={false}
                        current={this.state.page}
                        onChange={page => this.onChangePage(page)}
                    />
                </div>

                <FsLightbox
                    toggler={this.state.toggler}
                    sources={dataSource}
                    slide={this.state.slide + 1}
                />
            </div >
        );
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(AiDetection));
