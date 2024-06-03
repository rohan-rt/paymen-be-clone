import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CurrencyService } from 'api/currency/currency.service';

// Import services
import { TeamsService } from 'api/teams/teams.service';
import { TeamInvitationsService } from 'api/team-invitations/team-invitations.service';
import { SupplierInvitationsService } from 'api/supplier-invitations/supplier-invitations.service';

@Injectable()
export class TasksService implements OnApplicationBootstrap {
    constructor(
        private readonly teamsService: TeamsService,
        private readonly teamInvitationService: TeamInvitationsService,
        private readonly supplierInvitationsService: SupplierInvitationsService,
        private readonly currencyService: CurrencyService,
    ) {}

    private readonly logger = new Logger(TasksService.name);

    async onApplicationBootstrap() {
        await this.currencyService.ensureBase();
    }

    // Runs everyday at midnight
    @Cron('0 0 0 * * *')
    handleCron() {
        this.teamsService.deleteExpiredTeams();
        this.teamInvitationService.deleteExpiredInvites();
        this.supplierInvitationsService.deleteExpiredInvites();
    }

    // Runs every 3 hours
    @Cron('0 0 */3 * * *')
    updateCurrencyRates() {
        console.log('CRON: Update Currency Rates');
        this.currencyService.updateBase();
    }
}
