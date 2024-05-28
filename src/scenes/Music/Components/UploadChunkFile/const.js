export const HTTP_SERVER = "https://wshr.inshasaki.com/api/v2/files"; // qc
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
    uploadChunk: `${HTTP_SERVER}/chunk-upload`,
    uploadChunkBase64: `${HTTP_SERVER}/upload-chunks-base64`,
    uploadForm: `${HTTP_SERVER}/file-upload`,
    deleteFileChunks: `${HTTP_SERVER}/file-chunks`,
    files: HTTP_SERVER,
};

// qc
export const AuthHeader =
    "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjQxMDI0MTk1OTksInN1YiI6MTE5OCwiaXNzIjoiaHR0cHM6Ly93c2hyLmluc2hhc2FraS5jb20vYXBpL2F1dGgvbG9naW4iLCJpYXQiOjE2OTc2MDA2MjMsIm5iZiI6MTY5NzYwMDYyMywianRpIjoiV25qS0hDWHN5aGhwZGxGWiJ9.TDNduYnx3N_Y774_EE0cgGnmBIiQIfSQIrXzuPOyCM0";

// token production
// export const AuthHeader =
//     "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3MDQ2MTQzMDksInN1YiI6MTE4ODYsImlzcyI6Imh0dHBzOi8vd3Noci5oYXNha2kudm4vYXBpL2F1dGgvbG9naW4iLCJpYXQiOjE3MDQzNTUxMDksIm5iZiI6MTcwNDM1NTEwOSwianRpIjoiaFVhQk84ZVBwN3d5cGVtViJ9.Rfo2t7IkKbUf-d__Bclvwb8KN13hkEqY6uZiUnnIMJo";
