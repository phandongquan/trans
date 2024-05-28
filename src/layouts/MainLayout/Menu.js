import React, { PureComponent } from 'react';
import { connect } from 'react-redux'
import { Layout, Menu } from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';
import { Link } from 'react-router-dom'
import { withTranslation } from 'react-i18next';
import routers from '~/routes';
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { HomeOutlined } from '@ant-design/icons';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import logoInline from '~/assets/images/logo_white.svg';
import logoMini from '~/assets/images/logo_white_short.svg';
import { checkManager, checkISO, checkManagerHigher, checkPermissionParentRoute, checkPermission } from '~/services/helper';
import { keyPermissinAll, roleSupperAdmin } from '~/constants/basic';
import iconSliderMenu from '~/assets/images/icons/icon_slider_menu.svg';
const { Sider } = Layout;
const { SubMenu } = Menu;

class SiderMenu extends PureComponent {
    constructor(props) {
        super(props);
        let keyPathname = props.location.pathname.split("/")[2] == 'staff' ? ['company.staff'] : [props.location.pathname.split("/")[1]]
        this.state = {
            openKeys: props.screens.is_mobile || props.ui.open_left_sidebar ? keyPathname : []
        }
    }
    componentDidUpdate(prevProps, prevState) {
        const { location, screens: { is_mobile }, ui: { open_left_sidebar } } = this.props
        let keyPathname = location.pathname.split("/")[2] == 'staff' ? ['company.staff'] : [location.pathname.split("/")[1]] 
        if (open_left_sidebar !== prevProps.ui.open_left_sidebar) {
            this.setState({
                openKeys: is_mobile || open_left_sidebar ? keyPathname : []
            })
        }
    }

    isMainMenu = key => {
        return routers.some(item => {
            if (key) {
                return item.key === key || item.path === key;
            }
            return false;
        });
    };
    handleOpenChange = openKeys => {
        const moreThanOne = openKeys.filter(openKey => this.isMainMenu(openKey)).length > 1;
        this.setState({
            openKeys: moreThanOne ? [openKeys.pop()] : [...openKeys],
        });
    };
    openSubmenu = (e, menu, hasChild) => {
        if (menu) {
            if (hasChild) {
                e.preventDefault();
            } else {
                this.props.onClickLink();
            }

        } else {
            this.props.onClickLink();
        }
    }
    getSelectedMenuKeys = pathname => {
        const arr = pathname.split('/').filter(i => i);
        if (arr.length > 0) {
            return arr.reduce((acc, cur, i) => {
                if (!!parseInt(cur)) {
                    return acc
                }
                if (acc.length > 0) {
                    acc.push(
                        `${acc[acc.length - 1]}.${cur}`
                    )
                } else {
                    acc.push(cur)
                }
                return acc
            }, [])
        }
        return [arr.slice(0, arr.length - 1).join('.')];
    };
    handleClickLink = () => {
        const { screens: { is_mobile }, toggleSidebar } = this.props
        if (is_mobile) {
            toggleSidebar(true)
        }
    }

    /**
     * Check have permission to render menu
     * @param {*} menu 
     * @returns 
     */
    checkPermission(menu) {
        let { permission: staffPermission } = this.props; 
        let flagCheckPermission = true;
        if (menu?.permission) {
            flagCheckPermission = false
            if (!Array.isArray(menu.permission)) {
                menu.permission = [menu.permission]
            }
            let arrayPermission = menu.permission
            arrayPermission.map(permission => {
                if (~staffPermission.indexOf(permission)) {
                    flagCheckPermission = true;
                }
            })
        }
        return ( 
            menu.is_public ||
            (~staffPermission.indexOf(keyPermissinAll)) || flagCheckPermission
        )
    }

    render() {
        const { openKeys } = this.state;
        const { t, screens: { is_mobile }, ui: { open_left_sidebar }, location: { pathname }, permission, staff_info } = this.props;
        const selectedKeys = this.getSelectedMenuKeys(pathname);
        let hideStatus = false;
        const renderMenu = (menu) => {
            if (menu.permissionOfChild && menu.permissionOfChild.length > 0) {
                // set status hide for parent item menu
                let temp = menu.permissionOfChild.map(item => {
                    return checkPermission(item);
                });
            hideStatus = temp.some(item => item === true);        
            menu.hide = hideStatus ? false : true;
            }
            if (menu.hide) {
                if (menu.children && menu.children.length > 0) {
                    // set status hide for child item menu
                    menu.children.map(child => {
                        child.hide = true;
                    })
                    return menu.children.map(child => {
                        return renderMenu(child)
                    })
                }
            } else {
                if (menu.children && menu.children.length > 0) {
                    // console.log('menu', menu.children)

                    // set status hide for child item menu
                    menu.children.map(child => {
                        child.hide = false;
                    })
                   if (this.checkPermission(menu)) {

                        return (
                            <SubMenu
                                key={menu.key}
                                popupClassName="block_sub_main_menu"
                                title={
                                    <span className={classNames("d-flex align-items-center")}>
                                        <span className={classNames("sidebar-menu-icon mb-0 h5", { 'mr-2': open_left_sidebar })}>{menu.icon}</span>
                                        <span>{menu.menu_name || menu.name}</span>
                                    </span>
                                }
                            >
                                {!is_mobile && !open_left_sidebar && <Menu.Item disabled><b>{t(menu.menu_name || menu.name)}</b></Menu.Item>}
                                {menu.children.map(child => {
                                    return renderMenu(child)
                                })}
                            </SubMenu>
                        )
                    }
                }
                 else {
                    if (this.checkPermission(menu)) {
                        return (
                            <Menu.Item key={menu.key}>
                                <Link className={classNames("d-flex align-items-center")} to={menu.path} onClick={this.handleClickLink}>
                                    {menu.icon && <span className={classNames("sidebar-menu-icon mb-0 h5", { 'mr-2': open_left_sidebar })}>{menu.icon}</span>}
                                    <span>{t(menu.menu_name || menu.name)}</span>
                                </Link>
                            </Menu.Item>
                        )
                    }
                }
            }
        }
        return (
            <Sider
                trigger={null}
                collapsedWidth={is_mobile ? 0 : 60}
                collapsible
                collapsed={!open_left_sidebar}
                width={230}
                className="left-sidebar-menu"
                id='main_menu_site'
            >
                <a href='/'>
                    <div className="block_logo_site text-center" id="logo">
                        {is_mobile || open_left_sidebar ? <img src={logoInline} alt="logo" className='logo_hasaki' /> : <img src={logoMini} alt="logo" className='logo_hasaki' />}
                    </div>
                </a>
                <div className='colslap_menu'><img src={iconSliderMenu} alt=''/></div>                
                <nav id="sidebar" className="sidebar-wrapper">
                    <Scrollbars style={{ width: '100%', height: 'calc(100vh - 60px)' }}>
                        <Menu
                            key="Menu"
                            mode="vertical"
                            //openKeys={openKeys}
                            onOpenChange={this.handleOpenChange}
                            selectedKeys={selectedKeys}
                            
                            style={{ height: '100%', borderRight: 0 }}
                        >

                            {/* <Menu.Item>
                                <a className={classNames("d-flex align-items-center")}> 
                                        <span className={classNames("sidebar-menu-icon mb-0 h5", { 'mr-3': open_left_sidebar })}><HomeOutlined/></span>
                                    <span className="text-uppercase">{t('Drashboard')}</span>
                                </a>
                             </Menu.Item>  */}
                           
                            {routers.map(router => {
                                return renderMenu(router)
                            })}
                            {/* <Menu.Item key='signout'>
                                <a className={classNames("d-flex align-items-center")} href={OLD_INSIDE + '/auth/logout'}>
                                    <span className={classNames("sidebar-menu-icon mb-0 h5", { 'mr-3': open_left_sidebar })}><FontAwesomeIcon icon={faSignOutAlt} /></span>
                                    <span>{t('Sign Out')}</span>
                                </a>
                            </Menu.Item> */}
                        </Menu>
                    </Scrollbars>
                </nav>
            </Sider>
        );
    }
}
export default connect(
    state => ({
        location: state.router.location,
        permission: state.auth.info.permission,
        staff_info: state.auth.info.staff_info,
        profile: state.auth.info.profile
    }),
    dispatch => ({
        // setExtraMenu: (menu, id)=>{
        //     dispatch(setExtraMenu(menu, id))
        // }
    })
)(withTranslation()(SiderMenu));
