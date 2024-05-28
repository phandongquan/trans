import React, { useState } from 'react'
import { Field, reduxForm } from 'redux-form'
import { Spin, Card, List } from 'antd'
import { getProfile, create as createProfile, update as updateProfile } from '~/apis/sales/customer_profile'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAddressCard, faUserMd, faEdit, faCalendarAlt } from '@fortawesome/free-solid-svg-icons'
import Modal from 'antd/lib/modal/Modal'
import RenderTextareAnt from '~/utils/Form/RenderTextareaAnt'
import { RenderInputText, RenderSelectAnt, RenderSwitchAnt, RenderRadioAnt, SelectDistrict } from '~/utils/Form'


const validate = values => {
    let errors = {}
    if (!values.name) {
        errors.name = true
    }

    if (!values.code) {
        errors.code = true
    }

    return errors
}
let FormUpdateProfile =({t, handleSubmit, initialValues})=> {
    return (
        <form onSubmit={handleSubmit}>
            <div className="row">
                <div className="col-12 mb-2">
                    <label className="col-form-label font-weight-bold">{t('Full Name')}</label>
                    <Field 
                        name="name"
                        placeholder="Full Name"
                        component={RenderInputText}
                    />
                </div>
                <div className="col-12 mb-2">
                    <label className="col-form-label font-weight-bold">{t('CMND/Passport')}</label>
                    <Field 
                        name="code"
                        placeholder="CMND/Passport"
                        component={RenderInputText}
                    />
                </div>
                <div className="col-12">
                    <label className="col-form-label font-weight-bold">{t('Birthday')}</label>
                    <div className="row">
                        <div className="col-md-4">
                            <div className="form-group">
                                <Field 
                                    name="day"
                                    placeholder="--choose day--"
                                    component={RenderSelectAnt}
                                    options={[...Array(31).keys()].map(item=>({
                                        value: item + 1,
                                        label: item + 1
                                    }))}
                                />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <Field 
                                    name="month"
                                    placeholder="--choose month--"
                                    component={RenderSelectAnt}
                                    options={[...Array(12).keys()].map(item=>({
                                        value: item + 1,
                                        label: item + 1
                                    }))}
                                />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <Field 
                                    name="year_range"
                                    placeholder="--choose year--"
                                    component={RenderSelectAnt}
                                    options={[
                                        {
                                            value: 25, label: '< 25 years old'
                                        },

                                        {
                                            value: 35, label: '25-35 years old'
                                        },

                                        {
                                            value: 50, label: '35-50 years old'
                                        },

                                        {
                                            value: 51, label: '> 50 years old'
                                        }
                                    ]}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-5 mb-2">
                    <label className="col-form-label font-weight-bold">{t('District')}</label>
                    <Field 
                        name="district_id"
                        placeholder="--choose district"
                        component={SelectDistrict}
                        cityId={initialValues.city_id}
                    />
                </div>
                <div className="col-md-7 mb-2">
                    <label className="col-form-label font-weight-bold">{t('Address')}</label>
                    <Field 
                        name="address"
                        placeholder="Address"
                        component={RenderInputText}
                    />
                </div>
                <div className="col-12 mb-2">
                    <label className="col-form-label font-weight-bold">{t('Allow Take Photos')}</label>
                    <Field 
                        name="not_photos"
                        component={RenderSwitchAnt}
                    />
                </div>
                <div className="col-12 mb-2">
                    <label className="col-form-label font-weight-bold">{t('From Channel')}</label>
                    <Field 
                        name="channel"
                        component={RenderRadioAnt}
                        options={[
                            {value: 1, label: 'Facebook'},
                            {value: 2, label: 'Google'},
                            {value: 3, label: 'Zalo'},
                            {value: 4, label: 'Friends'},
                            {value: 5, label: 'Other...'}
                        ]}
                    />
                </div>
                <div className="col-12 mb-3">
                    <label className="col-form-label font-weight-bold">{t('Note')}</label>
                    <Field 
                        name="note"
                        component={RenderTextareAnt}
                        rows={2}
                    />
                </div>
                <div className="col-12">
                    <Button block type="primary" htmlType="submit" size="large">{t('Update')}</Button>
                </div>
            </div>
        
        </form>
    )
}


FormUpdateProfile = reduxForm({
    form: 'ShareFormUpdateProfile',  
    validate,
})(FormUpdateProfile)

export default function BoxCustomerTab({customer_id, customer_phone, name, code, city_id, district_id}) {
    const [showProfile, setShowProfile] = useState(false)
    const [profile, setProfile] = useState({
        name, code: customer_phone, city_id, district_id
    })
    const [profileLoading, setProfileLoading] = useState(false)
    const handleShowProfile =()=>{
        if(!customer_id){
            return
        }
        setShowProfile(true)
        setProfileLoading(true)
        getProfile(customer_id).then(({status, data})=>{
            if(status && data.CustomerProfile){
                setProfile(data.CustomerProfile)
            }
            setProfileLoading(false)
        }).catch(error=>{
            console.log(error)
            setProfileLoading(false)
        })
    }
    const handleUpdateProfile =(values)=>{
        console.log(value)
        setProfile({})
    }
    const buttons = [
        ...(customer_id ? [
            <Spin spinning={profileLoading}>
                <button onClick={()=> handleShowProfile()} className="btn btn-outline-primary btn-block mb-3"><FontAwesomeIcon icon={faAddressCard}/> <div>{t('Profile')}</div></button>
            </Spin>
        ]: []),
        ...(customer_phone ? [
            <Link to={`/clinic/customer?phone=${customer_phone}`} className="btn btn-outline-primary btn-block mb-3"><FontAwesomeIcon icon={faUserMd}/> <div>{t('Prescriptions')}</div></Link>,
            <Link to={`/consultant/create?phone=${customer_phone}`} className="btn btn-outline-primary btn-block mb-3"><FontAwesomeIcon icon={faEdit}/> <div>{t('Consultants')}</div></Link>,
            <Link to={`/cs/bookings/daily?code=${customer_phone}`} className="btn btn-outline-primary btn-block mb-3"><FontAwesomeIcon icon={faCalendarAlt}/> <div>{t('Bookings')}</div></Link>,
        ]: []),
    ]
    return (
        <Card bodyStyle={{paddingBottom: 5}}>
            <List
                grid={{
                    gutter: 16,
                    xs: 2,
                    md: 4,
                    lg: 2,
                }}
                dataSource={buttons}
                renderItem={button => (
                <List.Item>
                    {button}
                </List.Item>
                )}
            />
            <Modal
                open={showProfile}
                onCancel={()=>setShowProfile(false)}
                width={800}
                title={<div><h4 className="mb-0">{t('Update Profile')}</h4>ID: {profile.id}</div>}
                destroyOnClose
                footer={null}
            >
                <Spin spinning={profileLoading}>
                    <FormUpdateProfile
                        t={t}
                        initialValues={{
                            ...profile,
                            day: profile.day || null,
                            month: profile.month || null,
                            year_range: profile.year_range && typeof profile.year_range === 'number' ? (
                                    year - profile.year_range <= 25 ? 25 : (
                                        year - profile.year_range > 25 && year - profile.year_range <= 35 ? 35 : (
                                            year - profile.year_range > 35 && year - profile.year_range <= 50 ? 50 : 51
                                        )
                                    )
                                ) : (profile.year_range || null),
                            district_id: profile.district_id || null,
                            not_photos: !!profile.not_photos
                        }}
                        onSubmit={handleUpdateProfile} 
                        onCancel={()=>setShowProfile(false)}
                    />
                </Spin>
            </Modal>
        </Card> 
    )
}
