import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Inject, UseGuards, forwardRef } from '@nestjs/common';
import { JwtAuthGuard } from 'common/guards/jwt.guard';
import { ApiKeyGuard } from 'common/guards/api-key.guard';

// Import inputs
import { EmailInput } from './input/email.input';
import { EmailsInput } from './input/emails.input';

// Import services
import { EmailsService } from './emails.service';
import { SocketIoClientService } from 'api/socket-client/socket-io-client.service';

// Import models
import { EmailType } from './model/email.model';
import { EmailAcceptType } from './model/email-accept.model';

@Resolver()
export class EmailsResolver {
    constructor(
        private readonly socketIoClientService: SocketIoClientService,
        private emailsService: EmailsService,
    ) {}

    @Query((returns) => [EmailType])
    @UseGuards(JwtAuthGuard)
    async getEmailsByPortal(@Args({ name: 'portalId' }) portalId: string) {
        try {
            return await this.emailsService.getEmailsByPortal(portalId);
        } catch (err) {
            throw err;
        }
    }

    @Query((returns) => [EmailType])
    @UseGuards(JwtAuthGuard)
    async getEmailsByTeam(@Args({ name: 'teamId' }) teamId: string) {
        try {
            return await this.emailsService.getEmailsByTeam(teamId);
        } catch (err) {
            throw err;
        }
    }

    @Mutation((returns) => Boolean)
    @UseGuards(ApiKeyGuard)
    async notifyEmailReceived(@Args({ name: 'emailInput' }) emailInput: EmailInput) {
        try {
            this.socketIoClientService.handleEmailArrivedAlert(emailInput);
            return true;
        } catch (err) {
            throw err;
        }
    }

    @Mutation((returns) => [EmailType])
    @UseGuards(JwtAuthGuard)
    // Expects emailIds, status and teamId
    async updateEmailStatus(@Args({ name: 'emailsInput' }) emailsInput: EmailsInput) {
        try {
            return await this.emailsService.updateEmailStatus(emailsInput);
        } catch (err) {
            throw err;
        }
    }

    @Mutation((returns) => [EmailType])
    @UseGuards(JwtAuthGuard)
    // Expects emailIds, status and teamId
    async updateEmailPortal(@Args({ name: 'emailsInput' }) emailsInput: EmailsInput) {
        try {
            return await this.emailsService.updateEmailPortal(emailsInput);
        } catch (err) {
            throw err;
        }
    }

    @Mutation((returns) => EmailAcceptType)
    @UseGuards(JwtAuthGuard)
    // Expects emailIds and invoiceId
    async acceptInExistingInvoice(@Args({ name: 'emailsInput' }) emailsInput: EmailsInput) {
        try {
            return await this.emailsService.acceptInExistingInvoice(emailsInput);
        } catch (err) {
            throw err;
        }
    }
}
