import * as B2 from 'backblaze-b2';
import config from 'config';

// payload -- either path or (if native) fileId
export function getB2Url(downloadUrl, payload, native?) {
    return native
        ? downloadUrl + config.keys.B2.nativeUrl + payload
        : downloadUrl + config.keys.B2.friendlyUrl + payload;
}

export function extractFileId(url) {
    return url.split('?fileId=')[1];
}

class BackblazeHelpers {
    constructor() {
        this.b2 = new B2({
            applicationKeyId: config.keys.B2.keyID,
            applicationKey: config.keys.B2.applicationKey,
        });
    }
    b2: B2;
    bucketId: string;
    uploadUrl: string;
    authorizationToken: string;
    downloadUrl: string;

    async init() {
        try {
            await this.auth();
            await this.getUploadUrl();
            return true;
        } catch (err) {
            throw err;
        }
    }

    async auth() {
        try {
            const { data, status } = await this.b2.authorize();
            if (status !== 200) throw 'err';
            this.bucketId = data.allowed.bucketId;
            this.downloadUrl = data.downloadUrl;
        } catch (err) {
            throw err;
        }
    }

    async getBucket() {
        try {
            const { data, status } = await this.b2.getBucket({
                bucketName: config.keys.B2.bucketName,
            });
            if (status !== 200) throw 'err';

            return data;
        } catch (err) {
            throw err;
        }
    }

    async getFilesByName(fileName: String) {
        try {
            let res = await this.b2.listFileNames({
                bucketId: this.bucketId,
                startFileName: fileName,
                maxFileCount: 10,
                delimiter: '',
            });
            res = res.data.files.filter((r) => r.fileName === fileName);
            return res;
        } catch (err) {
            return err;
        }
    }

    async getFileVersionsByName(fileName) {
        try {
            let res = await this.b2.listFileVersions({
                bucketId: this.bucketId,
                startFileName: fileName,
                maxFileCount: 10,
            });
            res = res.data.files.filter((r) => r.fileName === fileName);
            return res;
        } catch (err) {
            return err;
        }
    }

    // payload -- either path or (if native) fileId
    getUrl(payload, native?) {
        return getB2Url(this.downloadUrl, payload, native);
        // return native
        //     ? this.downloadUrl + config.keys.B2.nativeUrl + payload
        //     : this.downloadUrl + config.keys.B2.friendlyUrl + payload;
    }

    async getUploadUrl() {
        try {
            const { data, status } = await this.b2.getUploadUrl({
                bucketId: this.bucketId,
            });
            if (status !== 200) throw 'err';
            this.authorizationToken = data.authorizationToken;
            this.uploadUrl = data.uploadUrl;
        } catch (err) {
            throw err;
        }
    }

    async uploadBase64File(fileName, file) {
        try {
            const base64Image = file.split(';base64,').pop();
            const imageBuffer = Buffer.from(base64Image, 'base64');
            return await this.b2.uploadFile({
                uploadUrl: this.uploadUrl,
                uploadAuthToken: this.authorizationToken,
                fileName: fileName,
                data: imageBuffer,
            });
        } catch (err) {
            throw 'Error while uploading file ' + err;
        }
    }

    async deleteFile(id, fileName) {
        try {
            await this.b2.deleteFileVersion({
                fileId: id,
                fileName: fileName,
            });
        } catch (err) {
            throw err;
        }
    }

    async deleteAllFileVersions(fileName: String) {
        try {
            const res = await this.getFileVersionsByName(fileName);
            for (let i of res) {
                await this.deleteFile(i.fileId, i.fileName);
            }
        } catch (err) {
            throw err;
        }
    }
}

export default BackblazeHelpers;
