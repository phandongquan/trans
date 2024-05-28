import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
import './config/Editor.css'
import { generateLink  } from '~/apis/company/mediaPublic';

/**
 * @propsType define
 */
const propTypes = {
  placeholder: PropTypes.string,
  style: PropTypes.object,
  value: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool
};

/**
 * 
 */
const defaultProps = {
  placeholder: '',
  value: '',
  disabled: false,
  onChange: () => { },
  style: { height: '500px' }
}

class Editor extends Component {

  /**
   * @lifecycle
   * @param {*} props 
   */
  constructor(props) {
    super(props)
    this.state = {
      theme: 'snow'
    }
    this.handleChange = this.handleChange.bind(this)
    this.quillRef = React.createRef();
    this.uploadRef = React.createRef();
  }

  handleChange(html) {
    this.setState({ editorHtml: html });
  }

  handleUpload = async (event) => {
    let formData = new FormData();
    let { value, onChange } = this.props;
    let holder = [];
    // create form data
    formData.append('path', `${this.props.path}`);
    formData.append('prefix', `${this.props.prefix}`);
    let files = event.target.files;
    // for object files
    for (let i = 0; i < files.length; i++) {
      formData.append('files[]', files[i]);
      let link = await generateLink(formData)
      if (link.status) {
        holder.push(link.data[i])
      }
    }
    const quill = this.quillRef.getEditor(); // Get the Quill editor instance
    const selection = quill.getSelection();

    const linkHtmlArray = holder.map(link => `<a href="${link}" target="_blank">${link}</a>`);
    const linkHtml = linkHtmlArray.join("<br />");
    // // Insert the links at the selection point
    quill.clipboard.dangerouslyPasteHTML(selection.index, linkHtml);

    // Update the editor's content using the onChange prop
    const updatedContent = quill.root.innerHTML;
    onChange(updatedContent);
    this.uploadRef.current.value = '';
  };

  /**
   * Handle upload
   */
  clickUpload = () => {
    this.uploadRef.current.click();
  }

  render() {
    let { placeholder, style, value, onChange, disabled } = this.props;
    const formats = [
      'header', 'font', 'size',
      'bold', 'italic', 'underline', 'strike', 'blockquote',
      'list', 'bullet', 'indent',
      'link', 'image', 'video', 
    ]

    const modules = {
      toolbar: {
        container: [
          [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
          [{size: []}],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
          ['link', 'image', 'video'],
          ['clean'],
          ['upload']
        ],
        handlers: {
          'upload': this.clickUpload,
        }
      } ,
      clipboard: {
        matchVisual: false,
      },
    }

    return (
      <>
        <ReactQuill
          readOnly={disabled}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          style={{ ...style, marginBottom: '40px' }}
          onChange={(value) => onChange(value)}
          value={value}
          ref={(el) => (this.quillRef = el)}
        />
        <input type="file" onChange={this.handleUpload} className='d-none' ref={this.uploadRef} multiple />
      </>
    )
  }
}

Editor.propTypes = propTypes;
Editor.defaultProps = defaultProps;

export default (Editor)