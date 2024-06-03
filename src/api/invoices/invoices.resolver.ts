import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'common/guards/jwt.guard';
import { SessionAuthGuard } from 'common/guards/session.guard';

// Import services
import { InvoicesService } from './invoices.service';

// Import inputs
import { InvoiceInput } from './inputs/invoice.input';
import { FileInput } from 'api/files/inputs/files.input';

// Import models
import { InvoiceType } from './models/invoice.model';
import { InvoicesSummaryType } from './models/invoices-summary.model';
import { FileType } from 'api/files/models/file.model';
import { RelatedMembersType } from 'common/models/related-members.model';

@Resolver()
export class InvoicesResolver {
    constructor(private readonly invoicesService: InvoicesService) {}

    @Query((returns) => [InvoiceType])
    @UseGuards(JwtAuthGuard)
    async getInvoicesByTeam(@Args({ name: 'teamId' }) teamId: string) {
        try {
            return await this.invoicesService.getInvoicesByTeam(teamId);
        } catch (err) {
            throw err;
        }
    }

    @Query((returns) => [InvoiceType])
    @UseGuards(JwtAuthGuard)
    async getInvoicesBySupplierTeam(@Args({ name: 'supplierTeamId' }) supplierTeamId: string) {
        try {
            return await this.invoicesService.getInvoicesBySupplierTeam(supplierTeamId);
        } catch (err) {
            throw err;
        }
    }

    @Query((returns) => InvoiceType)
    @UseGuards(JwtAuthGuard)
    async getInvoiceByID(@Args({ name: 'invoiceId' }) invoiceId: string) {
        try {
            return await this.invoicesService.getInvoiceById(invoiceId);
        } catch (err) {
            throw err;
        }
    }

    // @Query((returns) => InvoiceType)
    // async getInvoiceForEmail(@Args({ name: 'emailIds', type: () => [String] }) emailIds: string[]) {
    //     try {
    //         return await this.invoicesService.getInvoiceForEmail(emailIds);
    //     } catch (err) {
    //         throw err;
    //     }
    // }

    @Mutation((returns) => InvoiceType)
    @UseGuards(JwtAuthGuard)
    async submitInvoice(@Args({ name: 'invoice' }) invoice: InvoiceInput) {
        try {
            return await this.invoicesService.submitInvoice(invoice);
        } catch (err) {
            throw err;
        }
    }

    @Mutation((returns) => InvoiceType)
    @UseGuards(JwtAuthGuard)
    async updateInvoiceStatus(
        @Args({ name: 'invoiceId' }) invoiceId: string,
        @Args({ name: 'status' }) status: string,
        @Args({ name: 'updatedBy' }) updatedBy: string,
    ) {
        try {
            return await this.invoicesService.updateStatus(invoiceId, status, updatedBy);
        } catch (err) {
            throw err;
        }
    }

    @Mutation((returns) => [InvoiceType])
    @UseGuards(JwtAuthGuard)
    async updateMultipleInvoiceStatus(
        @Args({ name: 'invoiceIds', type: () => [String] }) invoiceIds: string[],
        @Args({ name: 'status' }) status: string,
        @Args({ name: 'updatedBy' }) updatedBy: string,
    ) {
        try {
            const res = [];
            for (let i = 0; i < invoiceIds.length; i++) {
                const updatedInv = await this.invoicesService.updateStatus(
                    invoiceIds[i],
                    status,
                    updatedBy,
                );
                res.push(updatedInv);
            }
            return res;
        } catch (err) {
            throw err;
        }
    }

    @Query((returns) => [RelatedMembersType])
    @UseGuards(JwtAuthGuard)
    async getInvoiceRelatedMembers(
        @Args({ name: 'invoiceId' }) invoiceId: string,
        @Args({ name: 'teamId' }) teamId: string,
    ) {
        return await this.invoicesService.getInvoiceRelatedMembers(invoiceId, teamId);
    }

    @Mutation((returns) => InvoiceType)
    @UseGuards(JwtAuthGuard)
    async updateInvoice(@Args({ name: 'invoice' }) invoice: InvoiceInput) {
        try {
            return await this.invoicesService.updateInvoice(invoice);
        } catch (err) {
            throw err;
        }
    }

    @Mutation((returns) => [FileType])
    @UseGuards(JwtAuthGuard)
    async uploadFiles(@Args({ name: 'files', type: () => [FileInput] }) files: FileInput[]) {
        try {
            return await this.invoicesService.uploadFiles(files);
        } catch (err) {
            throw err;
        }
    }

    @Query((returns) => [InvoiceType])
    @UseGuards(JwtAuthGuard)
    async getInvoicesByPortal(@Args({ name: 'portalId' }) portalId: string) {
        try {
            return await this.invoicesService.getInvoicesByPortal(portalId);
        } catch (err) {
            throw err;
        }
    }

    @Query((returns) => [InvoiceType])
    @UseGuards(JwtAuthGuard)
    async getInvoicesBySupplierIds(
        @Args({ name: 'supplierIds', type: () => [String] }) supplierIds: string[],
    ) {
        try {
            return await this.invoicesService.getInvoicesBySupplierIds(supplierIds);
        } catch (err) {
            throw err;
        }
    }

    @Query((returns) => [InvoiceType])
    @UseGuards(JwtAuthGuard)
    async getInvoicesByInvoiceType(@Args({ name: 'invoiceTypeId' }) invoiceTypeId: string) {
        try {
            return await this.invoicesService.getInvoicesByInvoiceType(invoiceTypeId);
        } catch (err) {
            throw err;
        }
    }

    // @Mutation((returns) => String)
    // @UseGuards(JwtAuthGuard)
    // async deleteInvoice(
    //     @Args({ name: 'invoiceId' }) invoiceId: string,
    //     @Args({ name: 'userId' }) userId: string,
    // ) {
    //     try {
    //         const invoice = await this.invoicesService.deleteById(invoiceId, userId);
    //         return 'INVOICE.DELETED';
    //     } catch (err) {
    //         throw err;
    //     }
    // }

    @Query((returns) => InvoicesSummaryType)
    @UseGuards(JwtAuthGuard)
    async getInvoicesInSummary(
        @Args({ name: 'teamId' }) teamId: string,
        @Args({ name: 'timeZone' }) timeZone: string,
    ) {
        try {
            return this.invoicesService.getInvoicesInSummary(teamId, timeZone);
        } catch (err) {
            throw err;
        }
    }

    @Query((returns) => InvoicesSummaryType)
    @UseGuards(JwtAuthGuard)
    async getInvoicesOutCount(@Args({ name: 'teamId' }) teamId: string) {
        try {
            return await this.invoicesService.getInvoicesOutCount(teamId);
        } catch (err) {
            throw err;
        }
    }

    @Mutation((returns) => String)
    @UseGuards(JwtAuthGuard)
    async unlinkEmailsFromInvoice(
        @Args({ name: 'invoiceId' }) invoiceId: string,
        @Args({ name: 'emailIds', type: () => [String] }) emailIds: string[],
        @Args({ name: 'userId' }) userId: string,
        @Args({ name: 'teamId' }) teamId: string,
    ) {
        try {
            return await this.invoicesService.unlinkEmailsFromInvoice(
                invoiceId,
                emailIds,
                userId,
                teamId,
            );
        } catch (err) {
            throw err;
        }
    }

    @Mutation((returns) => String)
    @UseGuards(JwtAuthGuard)
    async deleteFilesFromInvoice(
        @Args({ name: 'invoiceId' }) invoiceId: string,
        @Args({ name: 'fileIds', type: () => [String] }) fileIds: string[],
        @Args({ name: 'teamId' }) teamId: string,
        @Args({ name: 'userId' }) userId: string,
    ) {
        try {
            return await this.invoicesService.deleteFilesFromInvoice(
                invoiceId,
                fileIds,
                teamId,
                userId,
            );
        } catch (err) {
            throw err;
        }
    }

    @Mutation((returns) => InvoiceType)
    @UseGuards(JwtAuthGuard)
    async updateInvoiceSubscribers(@Args({ name: 'invoice' }) invoice: InvoiceInput) {
        try {
            return await this.invoicesService.updateInvoiceSubscribers(invoice);
        } catch (error) {
            throw error;
        }
    }
}
