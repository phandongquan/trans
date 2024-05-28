import React, { Component } from 'react';
import {  Avatar } from 'antd';
import { Comment } from '@ant-design/compatible';
import helper from '~/services/helper';

class DocumentFeedback extends Component {
    constructor(props){
        super(props)

    }

    renderFeedbacks = () => {
        let { feedbacks } = this.props
        let result = [];
        if(feedbacks){
            feedbacks.map((feedback, index) => {
                if(feedback.userreply){
                    result.push(
                        <Comment
                            key={feedback.id}
                            author={feedback.username}
                            avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                            content={<p>{feedback.feedback}</p>}
                            datetime={helper.timeFormatStandard(feedback.created_at, 'HH:mm DD-MM-YYYY')}
                            style={{marginLeft: 10}}>
                                <Comment
                                author={feedback.userreply.name}
                                avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                                content={<p>{feedback.reply}</p>}
                                datetime={helper.timeFormatStandard(feedback.updated_at, 'HH:mm DD-MM-YYYY')}
                                style={{marginLeft: 10}}/>
                        </Comment>
                    )
                } else {
                    result.push(
                        <Comment
                            key={feedback.id}
                            author={feedback.username}
                            avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                            content={<p>{feedback.feedback}</p>}
                            datetime={helper.timeFormatStandard(feedback.created_at, 'HH:mm DD-MM-YYYY')}
                            style={{ marginLeft: 10 }} 
                        />
                    )
                }
            });
        }
        return result;
    }

    render() {
        return (
            <div style={{maxHeight: 600, overflow: 'scroll'}}>
                {this.renderFeedbacks()}
            </div>
        )
    }
}

export default (DocumentFeedback)