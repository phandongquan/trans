import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Form, InputNumber, Button, Checkbox, Input, Spin, Row } from 'antd';
import { PageHeader } from '@ant-design/pro-layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faBackspace } from '@fortawesome/free-solid-svg-icons';
import { getStaffConfig, updateStaffConfig } from '~/apis/company/salary';
import { Link } from 'react-router-dom';
import './config/staffConfig.css';
import Dropdown from '~/components/Base/Dropdown';
import { checkPermission, showNotify } from '~/services/helper';
import tabConfig from './config/tab';
import Tab from '~/components/Base/Tab';

const placeholderDefault = 'Mặc định';
const paymentTypes = {
    0: 'Chuyển khoản ngân hàng',
    1: 'Tiền mặt'
}
export class StaffConfig extends Component {

    constructor(props) {
        super(props)
        this.formRef = React.createRef();
        this.state = {
            loading: false
        }
    }

    componentDidMount() {
        let { match } = this.props;
        let { id } = match.params;
        this.getSalaryConfigByStaff(id)
    }

    /**
     * Get salary config staff
     */
    getSalaryConfigByStaff = (id) => {
        let xhr = getStaffConfig(id)
        xhr.then(response => {
            if(response.status) {
                let fieldSetNull = ['base_salary', 'robationary_salary', 'luong_hdld', 'luong_bhxh', 'luong_bhtn',
                'cham_cong_tre', 'cham_cong_ve_som', 'phep_nam', 'nghi_khong_luong', 'ngay_lam_viec', 'gio_lam_viec']
                let data = response.data;
                if(data && Object.keys(data).length) {
                    Object.keys(data).map(key => {
                        if(fieldSetNull.includes(key) && data[key] == 0) {
                            data[key] = null;
                        }
                    })
                    this.formRef.current.setFieldsValue(data)
                }
            }
        })
    }

    /**
     * Submit form
     */
    submitForm = () => {
        this.setState({ loading: true })
        let { id } = this.props.match.params;
        let values = this.formRef.current.getFieldsValue();
        let xhr = updateStaffConfig(id, values);
        xhr.then(response => {
            this.setState({ loading: false })
            if(response.status) {
                this.getSalaryConfigByStaff(id);
                showNotify('Notify', 'Cập nhật thành công!');
            } else {
                showNotify('Notify', 'Cập nhật thất bại!', 'error')
            }
        })
    }

    /**
     * Render labor contract
     * @returns 
     */
    renderLaborContract = () => {
        return <>
            <h6>Lương theo HDLD</h6>
            <table className="table">
                <thead className="thead-light">
                    <tr>
                        <th scope="col" className='text-left' style={{ width: '80%' }}>Loại</th>
                        <th scope="col" className='text-left'>Số tiền</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className='border-right w-80' style={{ width: '80%' }}>Hình thức trả lương</td>
                        <td>
                            <Form.Item name='payment_type'>
                                <Dropdown datas={paymentTypes} defaultOption={'Hình thức trả lương'} />
                            </Form.Item>
                        </td>
                    </tr>
                    <tr>
                        <td className='border-right w-80' style={{ width: '80%' }}>Lương căn bản</td>
                        <td>
                            <Form.Item name='base_salary' 
                                hasFeedback 
                                rules={[{ pattern: new RegExp("^[0-9]*$"), message: 'Wrong format!'}]}
                            >
                                <Input placeholder={placeholderDefault} />
                            </Form.Item>
                        </td>
                    </tr>
                    <tr>
                        <td className='border-right w-80' style={{ width: '80%' }}>Lương thử việc</td>
                        <td>
                            <Form.Item name='robationary_salary' 
                                hasFeedback 
                                rules={[{ pattern: new RegExp("^[0-9]*$"), message: 'Wrong format!'}]}
                            >
                                <Input placeholder={placeholderDefault} />
                            </Form.Item>
                        </td>
                    </tr>
                    <tr>
                        <td className='border-right w-80' style={{ width: '80%' }}>Lương HDLD</td>
                        <td>
                            <Form.Item name='luong_hdld' 
                                hasFeedback 
                                rules={[{ pattern: new RegExp("^[0-9]*$"), message: 'Wrong format!'}]}
                            >
                                <Input placeholder={placeholderDefault} />
                            </Form.Item>
                        </td>
                    </tr>
                    <tr>
                        <td className='border-right w-80' style={{ width: '80%' }}>Lương BHXH</td>
                        <td>
                            <Form.Item name='luong_bhxh'
                                hasFeedback 
                                rules={[{ pattern: new RegExp("^[0-9]*$"), message: 'Wrong format!'}]}
                            >
                                <Input placeholder={placeholderDefault} />
                            </Form.Item>
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    }
    
    /**
     * Render timekeeping
     * @returns 
     */
    renderTimekeeping = () => {
        return <>
            <h6>Chấm công</h6>
            <table className="table">
                <thead className="thead-light">
                    <tr>
                        <th scope="col" className='text-left' style={{ width: '80%' }}>Tùy chọn</th>
                        <th scope="col" className='text-left'>Thiết lập</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className='border-right w-80' style={{ width: '80%' }}>Bắt buộc chấm công</td>
                        <td>
                            <Form.Item name='cham_cong' valuePropName="checked">
                                <Checkbox />
                            </Form.Item>
                        </td>
                    </tr>
                    <tr>
                        <td className='border-right w-80' style={{ width: '80%' }}>Cho phép đi trễ (phút)</td>
                        <td>
                            <Form.Item name='cham_cong_tre' 
                                hasFeedback 
                                rules={[{ pattern: new RegExp("^[0-9]*$"), message: 'Wrong format!'}]}
                            >
                                <Input placeholder={placeholderDefault} />
                            </Form.Item>
                        </td>
                    </tr>
                    <tr>
                        <td className='border-right w-80' style={{ width: '80%' }}>Cho phép về sớm (phút)</td>
                        <td>
                            <Form.Item name='cham_cong_ve_som'
                                hasFeedback 
                                rules={[{ pattern: new RegExp("^[0-9]*$"), message: 'Wrong format!'}]}
                            >
                                <Input placeholder={placeholderDefault} />
                            </Form.Item>
                        </td>
                    </tr>
                    <tr>
                        <td className='border-right w-80' style={{ width: '80%' }}>Số ngày làm việc chuẩn</td>
                        <td>
                            <Form.Item name='ngay_lam_viec'
                                hasFeedback 
                                rules={[{ pattern: new RegExp("^[0-9]*$"), message: 'Wrong format!'}]}
                            >
                                <Input placeholder={placeholderDefault} />
                            </Form.Item>
                        </td>
                    </tr>
                    <tr>
                        <td className='border-right w-80' style={{ width: '80%' }}>Số giờ làm việc</td>
                        <td>
                            <Form.Item name='gio_lam_viec'
                                hasFeedback 
                                rules={[{ pattern: new RegExp("^[0-9]*$"), message: 'Wrong format!'}]}
                            >
                                <Input placeholder={placeholderDefault} />
                            </Form.Item>
                        </td>
                    </tr>
                    <tr className='border-bottom'>
                        <td className='border-right w-80' style={{ width: '80%' }}>Chế độ chuyên cần</td>
                        <td>
                            <Form.Item name='chuyen_can' valuePropName="checked">
                                <Checkbox />
                            </Form.Item>
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    }

    /**
     * Render on leave
     * @returns 
     */
    renderOnLeave = () => {
        return <>
            <h6>Chế độ nghỉ phép</h6>
            <table className="table">
                <thead className="thead-light">
                    <tr>
                        <th scope="col" className='text-left' style={{ width: '80%' }}>Tùy chọn</th>
                        <th scope="col" className='text-left'>Thiết lập</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className='border-right w-80' style={{ width: '80%' }}>Nghỉ phép năm (ngày)</td>
                        <td>
                            <Form.Item name='phep_nam'>
                                <InputNumber className='w-100' placeholder={placeholderDefault} />
                            </Form.Item>
                        </td>
                    </tr>
                    <tr>
                        <td className='border-right w-80' style={{ width: '80%' }}>Nghỉ không lương (ngày)</td>
                        <td>
                            <Form.Item name='nghi_khong_luong'>
                                <InputNumber className='w-100' placeholder={placeholderDefault} />
                            </Form.Item>
                        </td>
                    </tr>
                    <tr className='border-bottom'>
                        <td className='border-right w-80' style={{ width: '80%' }}>Thưởng nghiệp vụ</td>
                        <td>
                            <Form.Item name='thuong_nghiep_vu' valuePropName="checked">
                                <Checkbox />
                            </Form.Item>
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    }

    render() {
        const { t, match } = this.props;
        let { id } = match.params;

        const constTablist = tabConfig(id,this.props);
        return (
            <>
                <PageHeader title={t('hr:salary_config')}/>
                <Row className="card p-3 pt-0 mb-3">
                    <Tab tabs={constTablist} />
                </Row>
                <div className='card p-3 table-staff-config'>
                    <Form ref={this.formRef} onFinish={this.submitForm.bind(this)}>
                        <Spin spinning={this.state.loading}>
                            {this.renderLaborContract()}
                            {this.renderTimekeeping()}
                            {this.renderOnLeave()}
                            {
                                checkPermission('hr-staff-salary-config-update') ?
                                    <Button htmlType='submit' type='primary' icon={<FontAwesomeIcon icon={faSave} />}>
                                        &nbsp;{t('hr:submit')}
                                    </Button>
                                : ''
                            }
                        </Spin>
                    </Form>
                </div>
            </>
        )
    }
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(StaffConfig))