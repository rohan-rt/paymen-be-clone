import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from 'common/guards/session.guard';
import { JwtAuthGuard } from 'common/guards/jwt.guard';

// Import inputs
import { SupplierInput } from './inputs/supplier.input';

// Import services
import { SuppliersService } from './suppliers.service';

// Import models
import { SupplierType } from './models/supplier.model';

@Resolver()
export class SuppliersResolver {
    constructor(private suppliersService: SuppliersService) {}

    @Query((returns) => SupplierType)
    @UseGuards(JwtAuthGuard)
    async getSupplierById(
        @Args({ name: 'supplierId' }) supplierId: string,
        @Args({ name: 'timeZone' }) timeZone: string,
    ) {
        return await this.suppliersService.getSupplierById(supplierId, timeZone);
    }

    @Query((returns) => [SupplierType])
    @UseGuards(JwtAuthGuard)
    async getSuppliersByTeam(
        @Args({ name: 'teamId' }) teamId: string,
        @Args({ name: 'timeZone' }) timeZone: string,
    ) {
        return await this.suppliersService.getSuppliersByTeam(teamId, timeZone);
    }

    @Query((returns) => [SupplierType])
    @UseGuards(JwtAuthGuard)
    async getSuppliersBySupplierTeam(
        @Args({ name: 'supplierTeamId' }) supplierTeamId: string,
        @Args({ name: 'timeZone' }) timeZone: string,
    ) {
        return await this.suppliersService.getSuppliersBySupplierTeam(supplierTeamId, timeZone);
    }

    @Query((returns) => [SupplierType])
    @UseGuards(JwtAuthGuard)
    async getSuppliersByInvoiceType(
        @Args({ name: 'teamId' }) teamId: string,
        @Args({ name: 'invoiceTypeId' }) invoiceTypeId: string,
    ) {
        return await this.suppliersService.getSuppliersByInvoiceType(teamId, invoiceTypeId);
    }

    @Mutation((returns) => [SupplierType])
    @UseGuards(JwtAuthGuard)
    async addSuppliers(
        @Args({ name: 'suppliers', type: () => [SupplierInput] }) suppliers: SupplierInput[],
    ) {
        return await this.suppliersService.addSuppliers(suppliers);
    }

    @Mutation((returns) => SupplierType)
    @UseGuards(JwtAuthGuard)
    async updateSupplier(@Args({ name: 'supplier' }) supplier: SupplierInput) {
        return await this.suppliersService.updateSupplier(supplier);
    }

    @Mutation((returns) => [SupplierType])
    @UseGuards(JwtAuthGuard)
    async unlinkSuppliers(
        @Args({ name: 'suppliers', type: () => [SupplierInput] }) suppliers: SupplierInput[],
    ) {
        return await this.suppliersService.unlinkSuppliers(suppliers);
    }

    @Mutation((returns) => [SupplierType])
    @UseGuards(JwtAuthGuard)
    async removeSuppliers(
        @Args({ name: 'suppliers', type: () => [SupplierInput] }) suppliers: SupplierInput[],
    ) {
        return await this.suppliersService.removeSuppliers(suppliers);
    }
    @Mutation((returns) => SupplierType)
    @UseGuards(JwtAuthGuard)
    async updateSupplierSubscribers(@Args({ name: 'supplier' }) supplier: SupplierInput) {
        try {
            return await this.suppliersService.updateSupplierSubscribers(supplier);
        } catch (error) {
            throw error;
        }
    }
}
