import React, { Component } from 'react'
import Navbar from './components/Navbar'
// import { Layout } from 'antd'
import { MenuOutlined  } from '@ant-design/icons'
import SidebarRight from './components/SidebarRight'
import iconSliderMenu from '~/assets/images/icons/icon_slider_menu.svg'
// const { Header } = Layout;
export default class MainHeader extends Component {
    // getHeadWidth = () => {
    //     const { screens: { is_mobile }, ui: { collapsed } } = this.props;
    //     if (is_mobile) {
    //       return '100%';
    //     }
    //     return collapsed ? '100%' : 'calc(100% - 256px)';
    //   };
  
    render() {
        const { toggleSidebar, screens: { is_mobile }} = this.props
  
      
        // const width = this.getHeadWidth();
        return (
            // <Header
            //     style={{ 
            //         // backgroundColor: '#fff',
            //         // padding: 0,
            //         // width,
            //         // position: 'fixed',
            //         // top: 0,
            //         // right: 0,
            //         // zIndex: 9,
            //         // transition: 'width 0.2s'
            //     }} 
            //     className="site-header header-main"
            // >
                // <div className="pl-0">
                    <div id='block_main_header' className="d-flex justify-content-between pr-3">
                        <span className='top-menu-toggler' onClick={toggleSidebar}>
                          
                        </span>  
                        {/* <b>SPA</b> */}
                        {!is_mobile ? (
                            <Navbar/>
                          
                        ) : (
                            <SidebarRight/>
                        )}
                        {/* <Navbar/> */}
                    </div>
                // </div>
            // </Header>
        )
    }
}
