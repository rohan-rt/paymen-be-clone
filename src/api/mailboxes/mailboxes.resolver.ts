import { Args, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from 'common/guards/session.guard';
import { JwtAuthGuard } from 'common/guards/jwt.guard';

// Import services
import { MailboxesService } from './mailboxes.service';

// Import inputs

// Import models

@Resolver()
export class MailboxesResolver {
    constructor(private mailboxService: MailboxesService) {}

    @Query((returns) => [String])
    @UseGuards(JwtAuthGuard)
    async getMailboxByEmail(@Args({ name: 'email' }) email: string) {
        return await this.mailboxService.getMailboxByEmail(email);
    }
}
