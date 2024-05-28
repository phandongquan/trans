import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Menu, Drawer } from 'antd';

import { Link } from 'react-router-dom'
import { AppstoreOutlined } from '@ant-design/icons'
import { withTranslation } from 'react-i18next';
import UserDropdown from './UserDropdown'
import routers from '~/routes';
import classNames from 'classnames';
import { checkManager, checkISO, checkManagerHigher } from '~/services/helper';
import { roleSupperAdmin } from '~/constants/basic';
import logoMobile from '~/assets/images/logo_short.svg';


const { SubMenu } = Menu;

class Sidebar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            openKeys: [this.props.pathname.split("/")[1]]
        }
    }
    toggleSidebarMenu =(show)=>{
        this.setState({
            visible: show
        })
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
    getSelectedMenuKeys = () => {
        return [this.props.pathname.split('/').filter(i=>i).join('.')];
    };
    /**
     * Check have permission to render menu
     * @param {*} menu 
     * @returns 
     */
    checkPermission(menu) {
        let { permission: staffPermission, staff_info: staffInfo, profile } = this.props;

        // Specialized
        if(menu.key == 'company.staff.specialized-list' || menu.key == 'company.staff.specialized') {
            return checkManagerHigher(staffInfo.position_id) || staffInfo.division_id == 115;
        }
        if(profile.role_id == roleSupperAdmin) {
            return true;
        }
        

        return ((!menu.permission || ~staffPermission.indexOf(menu.permission))
            || menu.is_public
            || (menu.requiredMajors && ~menu.requiredMajors.indexOf(staffInfo.major_id))
            || (menu.requiredDepts && ~menu.requiredDepts.indexOf(staffInfo.staff_dept_id))
            || (menu.requiredStaffIds && ~menu.requiredStaffIds.indexOf(staffInfo.staff_id))
            || (menu.requiredDivisions && ~menu.requiredDivisions.indexOf(staffInfo.division_id))
            || (menu.requiredManager && checkManager(staffInfo.position_id))
            || (menu.requiredManagerHigher && checkManagerHigher(staffInfo.position_id))
            || (checkISO(staffInfo.major_id) ? (menu.exceptMajors ? !~menu.exceptMajors.indexOf(staffInfo.major_id) : true) : false)
        )
    }
    render() {
        const { t } = this.props
        const { visible, openKeys } = this.state
        const selectedKeys = this.getSelectedMenuKeys();
        const renderMenu = (menu) => {
            if (menu.hide) {
                if (menu.children && menu.children.length > 0) {
                    return menu.children.map(child => {
                        return renderMenu(child)
                    })
                }
            } else {
                if (menu.children && menu.children.length > 0) {
                   if (this.checkPermission(menu)) {
                        return (
                            <SubMenu
                                key={menu.key}
                                title={
                                    <span className={classNames("d-flex align-items-center")}>
                                        <span className={classNames("sidebar-menu-icon mb-0 h5", { 'mr-2':'' })}>{menu.icon}</span>
                                        <span>{menu.menu_name || menu.name}</span>
                                    </span>
                                }
                            >
                                {<Menu.Item disabled><b>{t(menu.menu_name || menu.name)}</b></Menu.Item>}
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
                                    {menu.icon && <span className={classNames("sidebar-menu-icon mb-0 h5", { 'mr-2' :'' })}>{menu.icon}</span>}
                                    <span>{t(menu.menu_name || menu.name)}</span>
                                </Link>
                            </Menu.Item>
                        )
                    }
                }
            }
        }

        return (
            <div>
                <button className="hamer_menu" onClick={()=>this.toggleSidebarMenu(true)}>
                    <div className='block_hamer_menu'>
                    <span>&nbsp</span>
                    <span>&nbsp</span>
                    <span>&nbsp</span>
                    </div>
                </button>
                <a href='/' className='logo_mobile'><img src={logoMobile} /></a>
                
                <Drawer
                    maskStyle={{background: 'rgba(48,75,88,.5)'}}
                    placement="left"
                    closable={false}
                    onClose={()=>this.toggleSidebarMenu(false)}
                    open={visible}
                    width="300"
                    bodyStyle={{padding: 0}}
                    className='main_menu_mobile'
                >
                    <UserDropdown/>
                    <Menu
                        className="sidebar-menu"
                        mode="inline"
                        openKeys={openKeys}
                        onOpenChange={this.handleOpenChange}
                        selectedKeys={selectedKeys}
                    >
                        {/* <Menu.Item key="dashboard">
                            <Link to="/dashboard" onClick={()=>this.toggleSidebarMenu(false)}> 
                                <i className="mr-2 fas fa-tachometer-alt"></i>
                                <span>{t('SPA')}</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="clinic">
                            <Link to="/clinic" onClick={()=>this.toggleSidebarMenu(false)}> 
                                <i className="mr-2 fas fa-tachometer-alt"></i>
                                <span>{t('Clinic')}</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="promotions">
                            <Link to="/promotions" onClick={()=>this.toggleSidebarMenu(false)}> 
                                <i className="mr-2 fas fa-tachometer-alt"></i>
                                <span>{t('Promotion')}</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="user_dropdown">
                            <UserDropdown/>
                          
                        </Menu.Item> */}
                        {routers.map(router => {
                                return renderMenu(router)
                            })}
                    </Menu>
                </Drawer>
            </div>
        )
    }
}
export default connect(    
    state=>({
        pathname: state.router.location.pathname,
        permission: state.auth.info.permission, 
        location: state.router.location,
        staff_info: state.auth.info.staff_info,
        profile: state.auth.info.profile
    }), 
    dispatch=>({
        // setExtraMenu: (menu, id)=>{
        //     dispatch(setExtraMenu(menu, id))
        // }
    })
)(withTranslation()(Sidebar));