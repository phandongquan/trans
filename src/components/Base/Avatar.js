import React from "react";
import { Upload, message, Image } from "antd";
import { LoadingOutlined, PlusOutlined,EyeOutlined ,EditOutlined} from "@ant-design/icons";
import PropTypes from 'prop-types';
import axios from 'axios';
import { WS_HR } from '~/constants';

const token = localStorage.getItem('client_hasaki_inside_token');
/**
 * @propsType define
 */
const propTypes = {
  action: PropTypes.string,
}
const defaultProps = {
  action: ''
}

class Avatar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      imageUrl: null
    }
  }

  getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  }

  beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 10;
    if (!isLt2M) {
      message.error("Image must smaller than 10MB!");
      return false;
    }
    this.getBase64(file, imageUrl =>
      this.setState({
        imageUrl,
        loading: false,
      }),
    );

    if(!this.props.action) {
      return false;
    }
  }

  customRequest = async option => {
    const { file, action } = option;

    const formData = new FormData();
    formData.append('avatar', file);
    if(this.props.staff_id) {
      formData.append('staff_id', this.props.staff_id);
    }
    
    axios({
      method: 'POST',
      url: `${WS_HR}/${action}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
      data: formData
    })
      .then(response => console.log(response.data))
      .catch(error => { throw error })
  };

  render() {
    const { loading, imageUrl } = this.state;
    const uploadButton = (
      <div>
        {loading ? <LoadingOutlined /> : <PlusOutlined />}
        <div style={{ marginTop: 8 }}>Upload</div>
      </div>
    );
    let url = imageUrl ? imageUrl : this.props.url
    return (
      <div className="block_component_upload">
        <div className={url ? ("main_upload mask") : ("main_upload")}>        
          <Upload
            action={this.props.action}
            customRequest={this.customRequest}
            name="avatar"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            beforeUpload={(e) => this.beforeUpload(e)}
            onChange={(e) => this.props.onChange(e.file)}
          >
            {url ? (
              <div className="block_edit_image">
                <img src={url} alt="Thumbnail" style={{ width: "100%" }} />            
                <span className="btn_edit_avata"><EditOutlined /> Edit </span>
              </div>
            ) : (
                uploadButton
              )}
          </Upload>         
          

      </div>    
      {
        url ? (<div className="block_preview_upload"><Image src={url} width = '0px'/> <EyeOutlined  /> Preview</div>) : ("")
      }     
       
      </div>
    );
  }
}

Avatar.propTypes = propTypes;
Avatar.defaultProps = defaultProps;

export default (Avatar)
