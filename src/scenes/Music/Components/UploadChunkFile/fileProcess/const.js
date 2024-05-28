import { UPLOAD_FILES } from "~/constants/index"

export const oneKb = 1024;
export const chunkSizeDefault = oneKb ** 2 / 2; // 500 kb
export const chunkMaxSize = chunkSizeDefault * 10; // 5 MB
// 1 (byte) * 1 (kb) <=> 1024 * 1024 = 1048576 (mb)

export const FieldFiles = {
    fileNumber: "fileNumber",
    fileType: "fileType",
    totalChunk: "totalChunk",
    counterChunk: "counterChunk",
    fileUpload: "fileUpload",
    beginChunk: "beginChunk",
    endChunk: "endChunk",
    urlGet: "urlGet",
    percent: "percent",
};

export const statusFilesOperation = (files, chunkSize) => {
    const statusFiles = {};

    for (let i = 0; i < files.length;) {
        const file = files[i];
        const totalChunk =
            file.size % chunkSize === 0
                ? file.size / chunkSize
                : Math.ceil(file.size / chunkSize);

        const getLastDot = file.name.lastIndexOf(".");
        const getTypeFile = file.name.slice(getLastDot + 1);

        const eachUser = Number(new Date()) + "_" + Date.now(); // user + timeStamp
        const getFileNumber = `${eachUser}_${FieldFiles.fileNumber}_${++i}`;

        statusFiles[getFileNumber] = {
            [FieldFiles.fileNumber]: getFileNumber,
            [FieldFiles.fileType]: getTypeFile,
            [FieldFiles.totalChunk]: totalChunk,
            [FieldFiles.counterChunk]: 0,
            [FieldFiles.fileUpload]: file,
            [FieldFiles.beginChunk]: 0,
            [FieldFiles.endChunk]: chunkSize,
        };
    }
    return statusFiles;
};

export const conversionRateUnitData = (num) => {
    let res = num / oneKb;
    let unit;
    if (res < oneKb) {
        unit = "kb";
    } else if (res < oneKb ** 2) {
        res = num / oneKb ** 2;
        unit = "Mb";
    } else {
        res = num / oneKb ** 3;
        unit = "Gb";
    }
    res = `${res.toFixed(2)} ${unit}`;
    return res;
};

export const endPoints = {
    uploadChunk: `${UPLOAD_FILES}/chunk-upload`,
    uploadForm: `${UPLOAD_FILES}/file-upload`,
    deleteFileChunks: `${UPLOAD_FILES}/file-chunks`,
    files: UPLOAD_FILES,
};