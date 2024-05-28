import React, { useState, useEffect, useRef } from 'react'
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Upload, Button, message, Modal } from 'antd';
import { showMessage } from '~/services/helper';
import { arrMimeType } from '~/constants/basic';
import { FieldFiles, chunkMaxSize, chunkSizeDefault, conversionRateUnitData, statusFilesOperation } from './const';
import { uploadFile } from './upload';
import { Row, Col, Form, Input } from 'antd';
import { create, update } from '~/apis/music/songs';
import Dropdown from '~/components/Base/Dropdown';
import { resizeText } from '~/utils';

const allFilesRetry = {};
export const AdvertisementFormVideoChunk = (props) => {
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [statusFiles, setStatusFiles] = useState({});
    let [counter, setCounter] = useState(1);
    const [isRetry, setIsRetry] = useState(false);
    const refInputUpload = useRef(null);

    const { dataProps, t, song } = props;
    const chunkSize =
        dataProps?.bandwidth >= chunkSizeDefault &&
            dataProps?.bandwidth <= chunkMaxSize
            ? dataProps?.bandwidth
            : chunkSizeDefault;

    const formRef = useRef(null);

    useEffect(() => {
        setInitialState();
    }, [props.visible]);

    useEffect(() => {
        if (song?.id) {
            formRef.current.setFieldsValue(song);
        }
    }, [song?.id]);

    const setInitialState = () => {
        setLoading(false);
        setFileList([]);
        setStatusFiles({});
        setCounter(1);
        setIsRetry(false);
        formRef.current.resetFields();
    }

    const handleCheckFile = (files = []) => {
        const filesAllow = [];
        Object.keys(files).map(index => {
            const file = files[index];
            const isType = arrMimeType.includes(file.type);
            if (!isType) {
                message.error(t('workplace:only_upload_file_types'));
                return false;
            }

            filesAllow.push(file)
            return file;
        })
        return filesAllow;
    }

    const handleAddFiles = (e) => {
        const files = e.target.files;
        if (!files.length) return;
        const filesAllow = handleCheckFile(files);
        const newStatusFilesOperation = statusFilesOperation(filesAllow, chunkSize);
        setStatusFiles({ ...statusFiles, ...newStatusFilesOperation });
        refInputUpload.current.value = null;
    };

    const onRemove = file => {
        const key = file['fileNumber']
        if (statusFiles[key]) {
            delete statusFiles[key];
            setStatusFiles({ ...statusFiles });
        }

        const index = fileList.indexOf(file);
        const newFileList = fileList.slice();
        newFileList.splice(index, 1);
        setFileList(newFileList)
    }

    const uploadChunk = async (data) => {
        return new Promise(async (resolve, reject) => {
            const {
                chunk,
                chunk_number,
                total_chunk,
                file_number,
                file_name,
                retry,
                retry_is_last,
            } = data;
            uploadFile({
                chunk,
                chunk_number,
                total_chunk,
                file_number,
                file_name,
                retry,
                retry_is_last,
            }).then((res) => {
                const { file_number, percent, url } = res.data;
                statusFiles[file_number][FieldFiles.percent] = percent;
                statusFiles[file_number][FieldFiles.urlGet] = url;
                setCounter(++counter);
                setStatusFiles({ ...statusFiles });

                if (retry) {
                    if (url) {
                        delete allFilesRetry[file_number];
                    } else {
                        const indexChunk = allFilesRetry[
                            file_number
                        ].chunksNumberRetry.findIndex(
                            (item) => item === chunk_number
                        );
                        allFilesRetry[file_number].chunksNumberRetry.splice(
                            indexChunk,
                            1
                        );
                    }
                    console.log("allFilesRetry: ", allFilesRetry);
                }

                if (percent === 100 && url) {
                    resolve(url);
                }
            }).catch((err) => {
                const fileRetry = {
                    file_number,
                    chunksNumberRetry: [chunk_number],
                };

                let getFileNumber = allFilesRetry[file_number];
                if (allFilesRetry && getFileNumber) {
                    if (
                        !getFileNumber.chunksNumberRetry.includes(chunk_number)
                    ) {
                        getFileNumber.chunksNumberRetry.push(chunk_number);
                    }
                } else {
                    allFilesRetry[file_number] = fileRetry;
                }

                !isRetry && setIsRetry(true);
            });
        })

    };

    const operateChunksAndRetry = (fileRetry) => {
        return new Promise(async (resolve, reject) => {
            // retry call chunks failed
            if (fileRetry) {
                const urls = []
                const getFileRetry = statusFiles[fileRetry.file_number];

                if (getFileRetry && fileRetry?.chunksNumberRetry?.length) {
                    const file = getFileRetry[FieldFiles.fileUpload];
                    const totalChunk = getFileRetry[FieldFiles.totalChunk];
                    for (let j = 0; j < totalChunk;) {
                        const beginChunk = j * chunkSize;
                        const endChunk = Math.min(
                            beginChunk + chunkSize,
                            file.size
                        );
                        const chunk = file.slice(beginChunk, endChunk);
                        const data = {
                            chunk: chunk,
                            chunk_number: ++j,
                            total_chunk: getFileRetry[FieldFiles.totalChunk],
                            file_number: getFileRetry[FieldFiles.fileNumber],
                            file_name: file.name,
                            retry: true,
                            retry_is_last: false,
                        };
                        if (fileRetry.chunksNumberRetry.slice(-1)[0] === j) {
                            data.retry_is_last = true;
                        }
                        if (fileRetry.chunksNumberRetry.includes(j)) {
                            setTimeout(async () => {
                                let url = await uploadChunk(data);
                                if (url) {
                                    urls.push(url);
                                }

                                if (fileRetry.chunksNumberRetry.length === urls.length) {
                                    resolve(urls);
                                }

                            }, j * 100);
                        }
                    }
                } else {
                    console.log("Please retry right file");
                    delete allFilesRetry[fileRetry.file_number];
                }
            } else {
                const urls = [];
                Object.values(statusFiles).forEach((item) => {
                    const file = item[FieldFiles.fileUpload];
                    const totalChunk = item[FieldFiles.totalChunk];
                    for (let j = 0; j < totalChunk;) {
                        const beginChunk = j * chunkSize;
                        const endChunk = Math.min(
                            beginChunk + chunkSize,
                            file.size
                        );
                        const chunk = file.slice(beginChunk, endChunk);
                        const data = {
                            chunk: chunk,
                            chunk_number: ++j,
                            total_chunk: item[FieldFiles.totalChunk],
                            file_number: item[FieldFiles.fileNumber],
                            file_name: file.name,
                            retry: false,
                            retry_is_last: false,
                        };
                        setTimeout(async () => {
                            let url = await uploadChunk(data);
                            if (url) {
                                urls.push(url);
                            }

                            if (Object.values(statusFiles).length === urls.length) {
                                resolve(urls);
                            }

                        }, j * 100);
                    }
                });
            }
        })
    };

    const getDuration = (file) => {
        return new Promise((resolve) => {
            const objectURL = URL.createObjectURL(file);
            const myVideo = document.createElement('video');
            myVideo.src = objectURL;
            myVideo.addEventListener('loadedmetadata', () => {
                resolve(myVideo.duration);
            });
        });
    }

    /**
     * 
     */
    const handleRetryAll = () => {
        allFilesRetry &&
            Object.values(allFilesRetry).forEach((item) => {
                operateChunksAndRetry(item);
            });
    };

    /**
     * 
     * @returns 
     */
    const handleRenderFiles = () => {
        let result = [];
        if (statusFiles && Object.entries(statusFiles).length) {
            Object.values(statusFiles).map((item, key) => {
                const fileUpload = item['fileUpload'];
                let file = {
                    ...item,
                    uid: `files-${key}`,
                    status: !loading ? 'done' : item[FieldFiles.percent] === 100 ? 'done' : 'uploading',
                    name: resizeText(fileUpload.name, 20) + ` (${conversionRateUnitData(fileUpload.size)}, ${item[FieldFiles.totalChunk]} chunks)`,
                    url: fileUpload.preview,
                }
                result.push(file);
                return file;
            });
        }

        return result;
    }

    /**
     * 
     * @returns 
     */
    const submit = async () => {
        formRef.current.validateFields().then(async (values) => {
            setLoading(true);
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('category_id', values.category_id);
            formData.append('type', 2);

            let xhr;
            if (props.song?.id) {
                formData.append('id', props.song.id);
                formData.append('_method', 'PUT');
                xhr = update(props.song.id, formData);
            } else {
                if (!Object.entries(statusFiles).length) {
                    showMessage('error', 'Please select file');
                    return;
                }

                if (Object.entries(statusFiles).length) {
                    const urls = await operateChunksAndRetry(null);
                    const url = urls[0];
                    formData.append('file_url', url);
                    try {
                        let timeDuration = await getDuration(statusFiles[Object.keys(statusFiles)[0]]?.fileUpload);
                        formData.append('duration', Math.round(timeDuration));
                    } catch (error) {
                        showMessage('error', error);
                        return
                    }
                }

                xhr = create(formData);
            }

            let response = await xhr;
            if (response.status) {
                showMessage('success', response.message);
                props.hidePopup();
                props.refreshTable();
            } else {
                showMessage('error', response.message);
            }
        }).catch((info) => {
            console.log('Validate Failed:', info);
        })
    }

    return (
        <>
            <Modal
                open={props.visible}
                title={props.song?.id ? t('edit') : t('add') + (' ') + t('video')}
                forceRender
                width='50%'
                onCancel={() => props.hidePopup()}
                onOk={submit}
                confirmLoading={loading}
                footer={[
                    <Button key="back" onClick={() => props.hidePopup()}>
                        {t('cancel')}
                    </Button>,
                    <>
                        {
                            isRetry ? <Button key="retry" onClick={handleRetryAll} loading={loading}>
                                {t('retry')}
                            </Button> : <Button key="submit" type="primary" onClick={submit} loading={loading}>
                                {t('save')}
                            </Button>
                        }
                    </>
                ]}
            >
                <Form
                    preserve={false}
                    ref={formRef}
                    layout='vertical'
                >
                    <Row gutter={24}>
                        <Col span={24}>
                            <Form.Item label={t('name')} name='name' hasFeedback rules={[{ required: true, message: t('hr:input_name_folder') }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={24} className={props.song?.id ? `d-none` : ''}>
                            <Upload
                                listType="picture"
                                className="upload-list-inline"
                                fileList={handleRenderFiles()}
                                onRemove={onRemove}
                            >
                            </Upload>
                            <input
                                className='mt-1'
                                type="file"
                                accept='video/mp4'
                                onChange={handleAddFiles}
                                ref={refInputUpload}
                            />
                        </Col>
                        <Col span={24}>
                            <Form.Item name='category_id' label={t('category')} hasFeedback rules={[{ required: true, message: t('hr:please_select') + (' ') + t('category') }]}>
                                <Dropdown datas={{ 1: t('shop'), 2: t('clinic') }} />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </>
    )
}

const mapStateToProps = (state) => ({
    auth: state.auth.info,
    baseData: state.baseData,
})

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(AdvertisementFormVideoChunk))
