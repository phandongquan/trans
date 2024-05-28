import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import ExcelIOLogs from './ExcelIOLogs'
import UserDropdown from './UserDropdown'
import { withTranslation } from 'react-i18next';

class Navbar extends Component {
    handleChange =(lang)=>{
    
    }
    render() {
        const { t, i18n } = this.props
        return (
            <div className="d-flex justify-content-between align-items-center w-100">
                <div className="d-flex justify-content-end align-items-center">
                     <ul className="nav">
                        <li className="nav-item">
                            <NavLink activeClassName="active_text_menu" className="px-3 text_menu" to="/"> 
                                <span>{t('Dashboard')}</span>
                            </NavLink>
                        </li>
                        {/* <li className="nav-item">
                            <NavLink activeClassName="link-active-primary" className="px-3 text-white" to="/clinic"> 
                                <span>{t('Clinic')}</span>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink activeClassName="link-active-primary" className="px-3 text-white" to="/promotions"> 
                                <span>{t('Promotion')}</span>
                            </NavLink>
                        </li> */}
                    </ul>

                </div>
                <div>
                    <ExcelIOLogs />
                    {/* <Select value={i18n.language} onChange={this.handleChange} className="mr-2" bordered={false} showArrow={false}>
                        <Select.Option className="text-center" value="vi"><img src="/images/vi.svg" width="20"/></Select.Option>
                        <Select.Option className="text-center" value="en"><img src="/images/en.svg" width="20"/></Select.Option>
                    </Select> */}
                    
                    <UserDropdown/>
                </div>
            </div>
        )
    }
}
export default withTranslation()(Navbar)