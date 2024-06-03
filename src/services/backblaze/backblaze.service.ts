import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

// Import config
import config from 'config';

// Import helpers
import { getB2Url } from 'helpers/backblaze.helper';

const downloadUrl = config.keys.B2.backblazeUrl;

@Injectable()
export class BackblazeService {
    constructor(private readonly httpService: HttpService) {}

    async fetchFile(fileName: string, native?: boolean) {
        const url = getB2Url(downloadUrl, fileName, native);
        return await this.fetchFileById(url);
    }

    async fetchFileById(url: string) {
        const res = await this.httpService
            .get(url, {
                responseType: 'arraybuffer',
            })
            .toPromise()
            .then((res) => {
                return res.data;
            })
            .catch((err) => {
                return null;
            });

        return res;
    }
}
