import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { getList } from './actions'
import { List, Card } from 'antd'
import { MEDIA_URL } from '~/constants';
import { useTranslation } from 'react-i18next'
export const Index = ({keyByObjId=1, objectId, objectType, code, data, getList}) => {
    const { t } = useTranslation()
    useEffect(() => {
        getList({
            keyby_objid: keyByObjId,
            object_id: objectId, 
            object_type: objectType, 
            code
        })
    }, [keyByObjId, objectId, code, objectType, getList])
    return (
        <Card title={t('Photos')} loading={data.loading}>
            <List
                bordered
                dataSource={data.links}
                renderItem={item => (
                    <List.Item>
                        <a href={`${MEDIA_URL}/${item.upload.name}`} target="_blank" rel="noopener noreferrer">
                            <img src={`${MEDIA_URL}/${item.upload.name}`} alt="" width={150}/>
                        </a>
                    </List.Item>
                )}
            />
        </Card>
    )
}

const mapStateToProps = (state) => ({
    data: state.api.company_file.data
})

const mapDispatchToProps = dispatch => ({
    getList: (params) => {
        dispatch(getList(params))
    },
})
export default connect(mapStateToProps, mapDispatchToProps)(Index)
