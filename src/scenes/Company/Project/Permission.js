import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Row, Col, Checkbox, Divider, Button, Spin } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { detail as apiDetail, updateConfig as apiUpdateConfig } from '~/apis/company/project';
import Tab from '~/components/Base/Tab';
import TabList from './config/tab';
import BackButton from '~/components/Base/BackButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { showNotify } from '~/services/helper';

class Permission extends Component {

    /**
     * @lifecycle
     * @param {*} props 
     */
    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            loading: false,
            name: null,
            is_owner: null,
            main_assign: {},
            assign: {},
            staff: {}
        }
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        let { id } = this.props.match.params
        this.getDetailProject(id);
    }

    /**
     * Get detail project 
     * @param {*} id 
     */
    async getDetailProject(id) {
        let response = await apiDetail(id);
        if(response.status) {
            let { assign, main_assign, staff } = response.data.config;

            this.setState({
                name: response.data.name,
                is_owner: response.data.is_owner,
                assign,
                main_assign,
                staff
            })
        }
    }

    /**
     * 
     * @param {*} variableState 
     * @returns 
     */
    checkCheckedAll(variableState){
        let temp = Object.keys(this.state[variableState]).find(key => this.state[variableState][key] == 0);
        return temp ? false : true;
    }

    /**
     * @param {*} event 
     * @param {*} variableState 
     */
    handleChangeCheckbox(event, variableState) {
        let name = event.target.name;
        switch(variableState) {
            case 'main_assign': 
                let { main_assign } = this.state;
                event.target.checked ? main_assign[name] = 1 : delete(main_assign[name]);
                this.setState({ main_assign });
                break;
            case 'assign': 
                let { assign } = this.state;
                event.target.checked ? assign[name] = 1 : delete(assign[name]);
                this.setState({ assign });
                break;
            case 'staff': 
                let { staff } = this.state;
                event.target.checked ? staff[name] = 1 : delete(staff[name]);
                this.setState({ staff });
                break;
            default:
                break;
        }
    }

    /**
     * 
     * @param {*} event 
     * @param {*} variableState 
     */
    handleChangeSelectedRows(event, variableState) {
        let tmps = {};
        Object.keys(this.state[variableState]).map(key => {
            tmps = this.state[variableState][key] = event.target.checked ? 1 : 0;
        })
        this.setState({ variableState: tmps})
    }

    /**
     * @param {*} name 
     */
    renderCheckBoxInTalbe(name = '') {
        let { main_assign, assign, staff } = this.state;
        return (
            <>
                <td className="col-sm-1 text-center">
                    <Checkbox name={`owner[${name}]`} checked disabled />
                </td>
                <td className="col-sm-1 text-center">
                    <Checkbox name={name} checked={typeof main_assign[name] != 'undefined' && main_assign[name] && 'true'} onChange={(e) => this.handleChangeCheckbox(e, 'main_assign')} />
                </td>
                <td className="col-sm-1 text-center">
                    <Checkbox name={name} checked={typeof assign[name] != 'undefined' && assign[name] && 'true'} onChange={(e) => this.handleChangeCheckbox(e, 'assign')} />
                </td>
                <td className="col-sm-1 text-center">
                    <Checkbox name={name} checked={typeof staff[name] != 'undefined' && staff[name] && 'true'} onChange={(e) => this.handleChangeCheckbox(e, 'staff')} />
                </td>
            </>
        )
    }

    /**
     * Handle click btn save
     * @param {*} values 
     */
    handleClickBtnSave() {
        this.setState({loading: true})
        let { id } = this.props.match.params
        let { t } = this.props;
        let { assign, main_assign, staff } = this.state;
        let xhr = apiUpdateConfig(id, { assign, main_assign, staff })
        xhr.then(response => {
            this.setState({loading: false})
            if(response.status) {
                showNotify(t('Update config success'))
            }
        })
    }

    render() {
        let { t } = this.props;
        let { id } = this.props.match.params;
        return (
            <>
                <PageHeader 
                    title={this.state.name}
                />

                <Row className="card p-3 mb-3 pt-0">
                    <Tab tabs={TabList(id, this.state.is_owner)} />
                </Row>

                <Row className='card'>
                    <Spin spinning={this.state.loading}>
                        <Col span={24} >
                            
                            <table className='table table-hover'>
                                <thead>
                                    <tr className="d-flex">
                                        <th className='col-8'>{t('Quyền theo tài khoản')}</th>
                                        <th className="col-1 text-center">
                                            {t('Người tạo')} 
                                            <br/>
                                            <Checkbox checked disabled />
                                        </th>
                                        <th className="col-1 text-center" style={{ verticalAlign: 'bottom'}}>
                                            {t('Người quản lý chính')}
                                            <br/>
                                            <Checkbox onClick={(e) => this.handleChangeSelectedRows(e, 'main_assign')} checked={this.checkCheckedAll('main_assign')} />
                                        </th>
                                        <th className="col-1 text-center">
                                            {t('Người thực hiện')}
                                            <br/>
                                            <Checkbox onClick={(e) => this.handleChangeSelectedRows(e, 'assign')} checked={this.checkCheckedAll('assign')} />
                                        </th>
                                        <th className="col-1 text-center">
                                            {t('Nhân viên')}
                                            <br/>
                                            <Checkbox onClick={(e) => this.handleChangeSelectedRows(e, 'staff')} checked={this.checkCheckedAll('staff')}/>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="d-flex">
                                        <td className="col-sm-8">{t('Xem báo cáo')}</td>
                                        {this.renderCheckBoxInTalbe('view_report')}
                                    </tr>
                                    <tr className="d-flex">
                                        <td className="col-sm-8">{t('Xem công việc người khác')}</td>
                                        {this.renderCheckBoxInTalbe('view_tasks')}
                                    </tr>
                                    <tr className="d-flex">
                                        <td className="col-sm-8">{t('Chỉnh sửa người thực hiện')}</td>
                                        {this.renderCheckBoxInTalbe('edit_assign')}
                                    </tr>
                                    <tr className="d-flex">
                                        <td className="col-sm-8">{t('Chỉnh sửa tên/nội dung công việc')}</td>
                                        {this.renderCheckBoxInTalbe('edit_task')}
                                    </tr>
                                    <tr className="d-flex">
                                        <td className="col-sm-8">{t('Chỉnh sửa độ ưu tiên công việc')}</td>
                                        {this.renderCheckBoxInTalbe('edit_piority')}
                                    </tr>
                                    <tr className="d-flex">
                                        <td className="col-sm-8">{t('Chỉnh sửa thời gian thực hiện')}</td>
                                        {this.renderCheckBoxInTalbe('edit_timeline')}
                                    </tr>
                                    <tr className="d-flex">
                                        <td className="col-sm-8">{t('Xóa công việc')}</td>
                                        {this.renderCheckBoxInTalbe('delete_task')}
                                    </tr>
                                    <tr className="d-flex">
                                        <td className="col-sm-8">{t('Tạo thêm công việc mới')}</td>
                                        {this.renderCheckBoxInTalbe('add_task')}
                                    </tr>
                                    <tr className="d-flex">
                                        <td className="col-sm-8">{t('Đánh dấu hoàn thành công việc')}</td>
                                        {this.renderCheckBoxInTalbe('mark_complete')}
                                    </tr>
                                    <tr className="d-flex">
                                        <td className="col-sm-8">{t('Quyền thảo luận công việc')}</td>
                                        {this.renderCheckBoxInTalbe('comment')}
                                    </tr>
                                </tbody>
                            </table>

                            <Divider className="m-0" />
                            <Row gutter={24} className="p-3">
                                <Col span={12} key='bnt-submit' >
                                    <Button 
                                        type="primary" 
                                        icon={<FontAwesomeIcon icon={faSave} />} 
                                        onClick={() => this.handleClickBtnSave()}>
                                        &nbsp;{t('Save')}
                                    </Button>
                                </Col>
                                <Col span={12} key='btn-back' style={{ textAlign: "right" }}>
                                    <BackButton url={`/company/projects`} />
                                </Col>
                            </Row>
                        </Col>
                    </Spin>
                </Row>
            </>
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

const mapDispatchToProps = (dispatch) => {
    return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Permission));