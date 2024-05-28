import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSortDown, faUser, faLock, faDollarSign, faCalculator, faLifeRing, faSignOutAlt, faGlobe } from '@fortawesome/free-solid-svg-icons'
import { Menu, Dropdown, Space } from 'antd';
import { withTranslation } from 'react-i18next';
import { UserOutlined } from '@ant-design/icons';
import { logout } from '~/redux/actions/auth'
import { screenResponsive } from '~/constants/basic';
import {update, updateLanguage} from '../../../apis/setting/user';
import flagVn from '~/assets/images/flag_vn.svg';
import flagEn from '~/assets/images/flag_en.svg';
import i18n from '~/services/locale/setup';
class UserDropdown extends Component {

    /**
     * Event change language set in local storage
     * @param {string} lang
     */
    changeLanguage = async () => {
        const {profile} = this.props;
        const lang = localStorage.getItem('hr.language') === 'en' ? 'vi' : 'en';
        let formData = {
            locale: lang
        }
        let res = await updateLanguage(profile.id, formData).then(
            (res) => {
                localStorage.setItem('hr.language', lang);
                i18n.changeLanguage(lang);
            }).catch(err => {
                console.log(err);
            }
            );
    }
    /**
     * Event click menu
     * @param {string} param0
     */
    handleMenuClick = ({ key }) => {
        switch (key) {
            case 'logout':
                this.props.logout();
                break;
            case 'language':
                this.changeLanguage();
                break;
            default:
                break;
        }
    }

    render() {
        const { t, profile } = this.props
        const items = [
            {
                key: 'language',
                label: t('Change Language'),
                icon: localStorage.getItem('hr.language') === 'en' ? <img width={18} src={flagVn} /> : < img width={18} src={flagEn} />

            },
            {
                key: 'logout',
                label: t('Sign Out'),
                icon: <FontAwesomeIcon style={{ width: 20 }} icon={faSignOutAlt} />
            },
        ];

        return (
            <>
            {window.innerWidth < screenResponsive ?
                <div className='block_user_info'>
                    <div className='block_name'>
                        Hello! <br />
                        <strong className="my-0"> {profile.name}</strong>
                    </div>
                    <div className='block_sign_out' onClick={this.props.logout}> <FontAwesomeIcon style={{ width: 20 }} icon={faSignOutAlt} /> {t('Sign Out')}</div>
                </div>
                :
                <Dropdown trigger={['click']} menu={{ items, onClick: this.handleMenuClick }}>
                    <Space className="cursor-pointer">
                        {/* <Avatar size={20} icon={<UserOutlined/>} /> */}
                        <UserOutlined />
                        <p className="my-0">{profile.name}</p>
                        <FontAwesomeIcon style={{ fontSize: 20 }} icon={faSortDown} />
                    </Space>
                </Dropdown>
            }
            </>

        )
    }
}

const mapStateToProps = (state) => ({
    profile: state.auth.info.profile
})

const mapDispatchToProps = (dispatch) => {
    return {
        logout: () => {
            dispatch(logout())
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(UserDropdown))
