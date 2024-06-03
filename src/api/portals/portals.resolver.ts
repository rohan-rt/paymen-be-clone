import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from 'common/guards/session.guard';
import { JwtAuthGuard } from 'common/guards/jwt.guard';

// Import inputs
import { PortalInput } from './inputs/portal.input';

// Import models
import { PortalType } from './models/portal.model';
import { InvoiceTemplateType } from './models/invoice-template.model';
import { PortalMailboxType } from './models/portal-mailbox.model';

// Import services
import { PortalsService } from './portals.service';

@Resolver()
export class PortalsResolver {
    constructor(private portalsService: PortalsService) {}

    @Query((returns) => [PortalType])
    @UseGuards(JwtAuthGuard)
    async getPortalsByTeam(@Args({ name: 'teamId' }) teamId: string) {
        try {
            return await this.portalsService.getPortalsByTeam(teamId);
        } catch (error) {
            throw error;
        }
    }

    @Query((returns) => PortalType)
    @UseGuards(JwtAuthGuard)
    async getPortal(@Args({ name: 'portalId' }) portalId: string) {
        try {
            return await this.portalsService.getPortal(portalId);
        } catch (error) {
            throw error;
        }
    }

    @Query((returns) => PortalType)
    @UseGuards(JwtAuthGuard)
    async getPortalByInvoiceType(@Args({ name: 'invoiceTypeId' }) invoiceTypeId: string) {
        try {
            return await this.portalsService.getPortalByInvoiceType(invoiceTypeId);
        } catch (error) {
            throw error;
        }
    }

    @Query((returns) => PortalType)
    @UseGuards(JwtAuthGuard)
    async getPortalByMailbox(@Args({ name: 'mailboxId' }) mailboxId: string) {
        try {
            return await this.portalsService.getPortalByMailbox(mailboxId);
        } catch (error) {
            throw error;
        }
    }

    @Query((returns) => PortalMailboxType, { nullable: true })
    @UseGuards(JwtAuthGuard)
    async getPortalByEmail(
        @Args({ name: 'email' }) email: string,
        @Args('mode', { nullable: true }) mode?: number,
    ) {
        try {
            return await this.portalsService.getPortalByEmail(email, mode);
        } catch (error) {
            throw error;
        }
    }

    @Query((returns) => [InvoiceTemplateType])
    @UseGuards(JwtAuthGuard)
    async getAllInvoiceTemplates() {
        try {
            return await this.portalsService.getAllInvoiceTemplates();
        } catch (error) {
            throw error;
        }
    }

    @Query((returns) => InvoiceTemplateType)
    @UseGuards(JwtAuthGuard)
    async getInvoiceTemplateById(@Args({ name: 'templateId' }) templateId: string) {
        try {
            return await this.portalsService.getInvoiceTemplateById(templateId);
        } catch (error) {
            throw error;
        }
    }

    @Mutation((returns) => [PortalType])
    @UseGuards(JwtAuthGuard)
    async createPortal(@Args({ name: 'newPortal' }) newPortal: PortalInput) {
        try {
            return await this.portalsService.createPortal(newPortal);
        } catch (error) {
            throw error;
        }
    }

    @Mutation((returns) => [PortalType])
    @UseGuards(JwtAuthGuard)
    async addNewInvoiceType(@Args({ name: 'portal' }) portal: PortalInput) {
        try {
            return await this.portalsService.addNewInvoiceType(portal);
        } catch (error) {
            throw error;
        }
    }

    @Mutation((returns) => [PortalType])
    @UseGuards(JwtAuthGuard)
    async updatePortal(@Args({ name: 'portal' }) portal: PortalInput) {
        try {
            return await this.portalsService.updatePortal(portal);
        } catch (error) {
            throw error;
        }
    }

    // Doesn't delete but actually updates attribute 'DELETED' to true
    @Mutation((returns) => [PortalType])
    @UseGuards(JwtAuthGuard)
    async deletePortal(@Args({ name: 'portal' }) portal: PortalInput) {
        try {
            return await this.portalsService.deletePortal(portal);
        } catch (error) {
            throw error;
        }
    }

    @Mutation((returns) => [PortalType])
    @UseGuards(JwtAuthGuard)
    async deleteInvoiceType(
        @Args({ name: 'portal' }) portal: PortalInput,
        @Args({ name: 'invoiceTypeId' }) invoiceTypeId: string,
    ) {
        try {
            return await this.portalsService.deleteInvoiceType(portal, invoiceTypeId);
        } catch (error) {
            throw error;
        }
    }

    @Mutation((returns) => PortalType)
    @UseGuards(JwtAuthGuard)
    async updatePortalSubscribers(@Args({ name: 'portal' }) portal: PortalInput) {
        try {
            return await this.portalsService.updatePortalSubscribers(portal);
        } catch (error) {
            throw error;
        }
    }
}
