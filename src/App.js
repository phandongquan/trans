import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router'
import { Route, Switch, Redirect } from 'react-router-dom';
import { Spin, ConfigProvider } from 'antd';
import { withTranslation } from 'react-i18next';
import { verify } from '~/redux/actions/auth';
import { getData as getBaseData } from '~/redux/actions/base';
import routes from './routes';
import Layout from './layouts'
import { keyPermissinAll, roleSupperAdmin } from './constants/basic';
import { checkManager, checkISO, checkManagerHigher } from '~/services/helper';

class App extends Component {

    /**
     * 
     */
    componentDidMount() {
        this.props.verify();
        // this.props.getBaseData();
    }

    /**
     * 
     * @param {*} prevProps 
     * @param {*} prevState 
     */
    componentDidUpdate(prevProps, prevState) {
        
    }

    /**
     * 
     * @param {*} component 
     * @returns 
     */
    checkPermission(menu) {
        const { auth: { permission: staffPermission, logged } } = this.props;
        let flagCheckPermission = true ;
        if(menu?.permission){
            flagCheckPermission = false
            if(!Array.isArray(menu.permission)){
                menu.permission = [menu.permission]
            }
            let arrayPermission = menu.permission
            arrayPermission.map(permission => {
                if(~staffPermission.indexOf(permission)){
                    flagCheckPermission = true ;
                }
            })
        }
        return menu.is_public ||
            (logged &&
                (
                    ~staffPermission.indexOf(keyPermissinAll) || flagCheckPermission
                    // (!menu.permission || ~staffPermission.indexOf(menu.permission))
                )
            );
    }

    render() {
        const { t, auth: { profile, staff_info, stores, permission: user_permissions, logged, verified } } = this.props;
        if (!verified) {
            return (<div className="d-flex w-100 justify-content-center align-items-center" style={{ height: '100vh' }}><Spin size="large" /></div>)
        }
        return (
            <ConfigProvider theme={{ token: { fontFamily: 'Inter',  itemInputBg:'#ffffff', } }}>
                <ConnectedRouter history={this.props.history}>
                    <Switch>
                        {routes.map(({ children, ...rest }) => {
                            let components = children ? [rest, ...children] : [rest];
                            return components.map(c => {
                                let { component: Content, key, name, path, is_public, permission, template, exact = true } = c;
                                return <Route exact={exact} path={path} key={key} render={route => {
                                    return (
                                        this.checkPermission(c) ? (
                                            <Layout template={template}>
                                                <Content {...route} t={t} pageName={name} userInfo={profile} stores={stores} staffInfo={staff_info} checkPermission={(action) => user_permissions.indexOf(action) > -1} />
                                            </Layout>
                                        ) : (logged ? <Redirect to="/" /> : <Redirect to="/auth/login" />)
                                    )
                                }}
                                />
                            })
                        })}
                        <Redirect from="*" to="/errors/404" />
                    </Switch>
                </ConnectedRouter>
            </ConfigProvider>
            )
    }
}

/**
 * @connect redux store with props
 * @param {*} state 
 */
const mapStateToProps = (state) => {
    return {
        auth: state.auth.info,
        location: state.router.location,
    }
}
/**
 * @connect redux action with props
 * @param {*} dispatch 
 */
const mapDispatchToProps = (dispatch) => {
    return {
        verify: () => {
            dispatch(verify())
        },
        getBaseData: () => {
            dispatch(getBaseData())
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(App));