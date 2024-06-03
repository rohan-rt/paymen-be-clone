import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import config from 'config';

@Injectable()
export class EmailServerService {
    constructor(private readonly httpService: HttpService) {}

    async connectMailboxImap(email) {
        const params = {
            email: email,
        };

        return await this.httpService.post(config.keys.EMAIL_SERVER.URL + '/mailboxes/run', params);
    }

    async createMailbox(email) {
        console.log(`${config.keys.EMAIL_SERVER.URL}/Mailboxes/${email}`);

        const response = this.httpService.post(
            `${config.keys.EMAIL_SERVER.URL}/Mailboxes/${email}`,
            {
                headers: {
                    'Api-Key': config.keys.EMAIL_SERVER.API_KEY,
                },
            },
        );

        return response;
    }
}
