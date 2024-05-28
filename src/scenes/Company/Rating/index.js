import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Button, Table, Row, Col, Form, Input } from "antd";
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { getList as apiGetList, destroy as apiDelete } from '~/apis/company/rating';
import { Link } from 'react-router-dom';
import { dateTimeFormat, staffStatus as arrStatus } from '~/constants/basic';
import DeleteButton from '~/components/Base/DeleteButton';
import { showNotify, timeFormatStandard } from '~/services/helper';
import CreateUpdateDate from '~/components/Base/CreateUpdateDate';

class Rating extends Component {
    /**
     * 
     * @param {*} props 
     */
    constructor(props) {
        super(props);
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            ratings: []
        };
    }

    /**
     * @lifecycle 
     */
    componentDidMount() {
        this.getRatings();
    }

    /**
     * Get list ratings
     * @param {} params 
     */
    getRatings = (params = {}) => {
        this.setState({ loading: true });
        let xhr = apiGetList(params);
        xhr.then((response) => {
            if (response.status) {
                let { data } = response;
                this.setState({ 
                    loading: false,
                    ratings: data.rows,
                });
            }
        });
    }

    /**
     * @event submit form
     * @param {Object} values 
     */
    submitForm = (values) => {
        this.getRatings(values);
    }

    /**
     * Delete rating
     * @param {*} e 
     * @param {*} id 
     */
    onDeleteRating = (e, id) => {
        let { t } = this.props;
        e.stopPropagation();
        let xhr = apiDelete(id);
        xhr.then((response) => {
            if (response.status) {
                let values = this.formRef.current.getFieldsValue();
                this.getRatings(values);
                showNotify(t('Notification'), t('Rating has been removed!'));
            } else {
                showNotify(t('Notification'), response.message);
            }
        }).catch(error => {
            showNotify(t('Notification'), t('Server has error!'));
        });
    }

    /**
     * @render
     */
    render() {
        let { t } = this.props;
        const columns = [
            {
                title: t('No.'),
                render: r => this.state.ratings.indexOf(r) + 1 
            },
            {
                title: t('Candidate Name'),
                render: r => {
                    return (
                        <>
                            <span><Link to={`/company/rating/${r.id}/edit`}>{r.name}</Link><small> ({r.phone}) </small></span> <br/>
                            <small>{r.email}</small>
                        </>
                    )
                }
            },
            {
                title: t('Supervisor Name'),
                render: r => {
                    return (
                        <>
                            <span>{r.supervisor}</span><br/>
                            <small>{r.position_supervisor}</small>
                        </>
                    )
                }
            },
            {
                title: t('Date'),
                render: r => <CreateUpdateDate record={r} />
            },
            {
                title: t('Result'),
                render: r => r.status && arrStatus[r.status]
            },
            {
                title: t('Action'),
                render: r => {
                    return (<>
                            <Link to={`/company/rating/${r.id}/edit`} style={{ marginRight: 8 }} >
                                <Button type="primary" size='small' icon={<FontAwesomeIcon icon={faPen}/>} />
                            </Link>
                            <DeleteButton onConfirm={(e) => this.onDeleteRating(e, r.id)}/>
                        </>)
                },
                align: 'center',
            }
        ]

        return (
            <div>
                <PageHeader
                    title={t('Ratings')}
                />
                <Row className="card pl-3 pr-3 mb-3">
                    <Form
                        className="pt-3"
                        ref={this.formRef}
                        name="searchStaffForm"
                        onFinish={this.submitForm.bind(this)}
                        layout="vertical"
                    >
                        <Row gutter={24}>
                            <Col span={6}>
                                <Form.Item name="name">
                                    <Input placeholder={t('Candidate Name')} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name="supervisor">
                                    <Input placeholder={t('Supervisor Name')} />
                                </Form.Item>
                            </Col>
                            <Col span={4} key='submit'>
                                <Button type="primary" htmlType="submit">
                                    {t('Search')}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Row>
                <Row gutter={[16, 24]}>
                    <Col span={24}>
                        <Table
                            dataSource={this.state.ratings}
                            columns={columns}
                            loading={this.state.loading}
                            pagination={{ pageSize: 20 }}
                            rowKey={r => r.id}
                        />
                    </Col>
                </Row>
            </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Rating));
