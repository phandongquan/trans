import React from 'react'
import { InputNumber, Input, Form, Select, Switch, Radio } from 'antd';

const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    inputProps,
    children,
    options,
    required,
    placeholder,
    ...restProps
}) => {
    let inputNode = null
    switch(inputType){
        case 'number': 
            inputNode = <InputNumber />
        break;
        case 'switch': 
            inputNode = <Switch />       
        case 'yesno': 
          inputNode = <Radio.Group {...inputProps}>
            <Radio value="1">Có</Radio>
            <Radio value="0">Không</Radio>
          </Radio.Group>     
        case 'radio': 
          inputNode = <Radio.Group className="radio-square" {...inputProps}>
            {(options || []).map(item=> <Radio key={item.value} value={item.value}>{item.label}</Radio>)}
          </Radio.Group>
        break;
        case 'select': 
          inputNode = <Select placeholder={placeholder} {...inputProps}>
              {(options || []).map(item=> <Select.Option key={item.value} value={item.value}>{item.label}</Select.Option>)}
          </Select>
        break;
        default:
            inputNode = <Input placeholder={placeholder}/>
    }
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            {...(inputType === 'switch' ? {valuePropName: 'checked'} : {})}
            style={{
              margin: 0,
              textAlign: 'center'
            }}
            rules={[
              {
                required: !!required,
                message: `Please Input ${title}!`,
              },
            ]}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
};
export default EditableCell