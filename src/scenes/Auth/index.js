import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faKey } from '@fortawesome/free-solid-svg-icons';

import { login, logout } from '~/redux/actions/auth';
import { Form, Input, Button, Alert } from 'antd';
import { validateEmail } from '~/services/helper';
import logo from "~/assets/images/hsk_logo_login.png";
import iconEye from '~/assets/images/icons/icon_eye.svg'
import iconEyeActive from '~/assets/images/icons/icon_eye_green.svg'
import logoMobile from "~/assets/images/logo_site.svg";
import {screenResponsive} from '~/constants/basic';
class Index extends Component {

    constructor() {
        super();
        this.formRef = React.createRef();
    }

    /**
     * @lifecycle
     */
    componentDidMount() {
        this.props.dispatch(logout());
    }

    /**
     * @lifecycle
     * 
     * @param {*} prevProps 
     * @param {*} prevState 
     */
    componentDidUpdate(prevProps, prevState) {
        const { profile, history } = this.props
        if (profile.id && profile.id !== prevProps.profile.id) {
            history.replace('/')
        }
    }

    /**
     * @event submit form
     * @param {*} values 
     */
    handleLogin(values) {
        let isEmail = validateEmail(values.email);
        if (!isEmail) {
            values['email'] = values['email'] + '@hasaki.vn';
        }
        this.props.dispatch(login(values));
    }

    render() {
        const { t } = this.props
        return (
            <div className='login_container' >
                <div className="login_left">
                {
                    window.innerWidth < screenResponsive ? <img alt="" src={logoMobile} className="logo-login" /> : <img alt="" src={logo} className="logo-login" />
                }
                   
                </div>
                <div className="login_right">
                    <h1>ĐĂNG NHẬP</h1>
                    <div className="form_login_page"> 
                        <Form ref={this.formRef} name="upsertForm" layout="vertical"
                            name="login_form" className="login-form"
                            onFinish={this.handleLogin.bind(this)}>
                            <Form.Item name="email" label={t('Email')} rules={[{ required: true, message: t('Please input your email!') }]}                        >
                                <Input className="mr-1" placeholder="Email" />
                            </Form.Item>
                            <Form.Item name="password" label={t('Password')} rules={[{ required: true, message: t('Please input your password!') }]}>
                                <Input.Password 
                                   
                                    type="password" 
                                    placeholder="Password" 
                                    iconRender={(visible) =>
                                        visible ?<img src={iconEyeActive} /> :  <img src={iconEye} />}
                                />
                            </Form.Item>
                            {this.props.login_fail_notify ? <Alert message={this.props.login_fail_data.message} type="error" className="mb-3" /> : []}
                            <Form.Item>
                                <Button type="primary" htmlType="submit" className="login-form-button mt-2" style={{ width: '100%' }}>
                                    Log in
                                    </Button>
                            </Form.Item>
                        </Form>
                    </div>
                    
                </div>                
            </div>
        );
    }
}

/**
 * Map redux state to component props
 * @param {Object} state 
 */
const mapStateToProps = (state) => {
    return {
        profile: state.auth.info.profile,
        login_fail_notify: state.auth.info.login_fail_notify,
        login_fail_data: state.auth.info.login_fail_data,
    }
}

/**
 * Map redux dispatch to component props
 * @param {Object} state 
 */
const mapDispatchToProps = (dispatch) => {
    return { dispatch };
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Index))