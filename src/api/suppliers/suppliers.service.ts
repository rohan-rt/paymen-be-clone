import { Injectable, HttpStatus, HttpException, Options, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
const mongoose = require('mongoose');

// Import inputs
import { SupplierInput } from './inputs/supplier.input';

// Import schemas
import { EnumSupplierStatus, SupplierDocument } from './schemas/supplier.schema';
import { PortalDocument } from 'api/portals/schemas/portal.schema';

// Import services
import { SupplierInvitationsService } from 'api/supplier-invitations/supplier-invitations.service';
import { InvoicesService } from 'api/invoices/invoices.service';
import { FeedsService } from 'api/feeds/feeds.service';

// Import models
import { SupplierType } from './models/supplier.model';

// Import libraries and helpers
import * as cloneDeep from 'lodash/cloneDeep';
import { arrayCompare } from 'helpers/formatters.helper';
import { randomColorGenerator } from 'helpers/avatars-logos.helper';
import { EnumFeedSubType, EnumFeedType } from 'api/feeds/schemas/feed.schema';
import { GeneralContext, InvoiceTypeContext } from 'api/feeds/models/contexts.model';

const populate = [
    // 'team',
    'supplier',
    'invitation',
    { path: 'settings.portal', model: 'Portal' },
    { path: 'subscribers.user', model: 'User' },
    'createdBy',
    'updatedBy',
];

@Injectable()
export class SuppliersService {
    constructor(
        @InjectModel('Supplier') private readonly supplierModel: Model<SupplierDocument>,
        @InjectModel('Portal') private readonly portalModel: Model<PortalDocument>,

        private readonly invoicesService: InvoicesService,
        // private readonly feedsService: FeedsService,
        @Inject(forwardRef(() => FeedsService)) private readonly feedsService: FeedsService,

        @Inject(forwardRef(() => SupplierInvitationsService))
        private readonly supplierInvitationsService: SupplierInvitationsService,
    ) {}

    async getSuppliersByTeam(teamId: string, timeZone?: string): Promise<SupplierType[]> {
        // === fetching suppliers (excl. supplier invitees)
        const suppliers = await this.supplierModel
            .find({
                team: mongoose.Types.ObjectId(teamId),
                status: { $ne: EnumSupplierStatus.DELETED },
            })
            .populate(populate);
        if (!timeZone) return suppliers;
        else return await this.fetchAddMetrics(suppliers, timeZone);
    }

    async getSuppliersBySupplierTeam(
        supplierTeamId: string,
        timeZone?: string,
    ): Promise<SupplierType[]> {
        // === fetching suppliers (excl. supplier invitees)
        const pop = [
            ...populate,
            { path: 'invitation', populate: { path: 'invitee', model: 'User' } },
            { path: 'invitation', populate: { path: 'updatedBy', model: 'User' } },
        ];
        const suppliers = await this.supplierModel
            .find({
                supplier: mongoose.Types.ObjectId(supplierTeamId),
                status: { $ne: EnumSupplierStatus.DELETED },
            })
            .populate(pop);
        if (!timeZone) return suppliers;
        else return await this.fetchAddMetrics(suppliers, timeZone);
    }

    async getSupplierById(supplierId: string, timeZone?: string): Promise<SupplierType> {
        const supplier = await this.supplierModel
            .findOne({ _id: supplierId, status: { $ne: EnumSupplierStatus.DELETED } })
            .populate(populate);
        if (!timeZone) return supplier;
        else return (await this.fetchAddMetrics([supplier], timeZone))[0];
    }

    async fetchAddMetrics(suppliers: SupplierType[], timeZone: string): Promise<SupplierType[]> {
        await Promise.all(
            suppliers.map(async (supplier) => {
                supplier['metrics'] = {};
                const summary = await this.invoicesService.getInvoicesInSummary(
                    supplier.team._id,
                    timeZone,
                    supplier._id,
                );
                supplier['metrics']['in'] = summary;
            }),
        );
        return suppliers;
    }

    async getSuppliersByInvoiceType(
        teamId: string,
        invoiceTypeId: string,
    ): Promise<SupplierType[]> {
        return await this.supplierModel
            .find({
                'team': mongoose.Types.ObjectId(teamId),
                'settings.invoiceTypes': invoiceTypeId,
                'status': { $ne: EnumSupplierStatus.DELETED },
            })
            .populate(populate);
    }

    async addSuppliers(suppliers: SupplierInput[]): Promise<SupplierType[]> {
        // 1 -- Prepare suppliers
        const supps = [];
        const invites = [];
        const feeds = [];
        const now = new Date();

        for (let i = 0; i < suppliers?.length; i++) {
            const supp = suppliers[i];
            const teamId = supp.team;
            const invitorId = supp.createdBy;
            const supplierName = supp.name;
            const inviteeEmail = supp.email;
            supp.createdAt = now;
            supp.updatedAt = now;
            supp.updatedBy = supp.createdBy;
            const supplier = new this.supplierModel(supp);
            supplier._id = mongoose.Types.ObjectId();
            const supplierId = supplier._id;
            supplier.logoBg = randomColorGenerator();

            if (supp?.sendInvite) {
                supplier.invitation = mongoose.Types.ObjectId();
                supplier.status = EnumSupplierStatus.AWAITING;
            }
            supps.push(supplier);

            // Supplier needs to be saved first so it is present in invite object
            if (supp?.sendInvite) {
                const invite = {
                    _id: supplier.invitation,
                    teamId,
                    invitorId,
                    supplierId,
                    inviteeEmail,
                    supplierName,
                };
                invites.push(invite);
            }

            // Create feed item in supplier feed
            const feed = {
                supplier: supplierId,
                type: EnumFeedType.SUPPLIER,
                subType: EnumFeedSubType.SUPPLIER_CREATED,
                userId: invitorId,
                team: teamId,
                context: new GeneralContext(null, supplier.name),
            };
            feeds.push(feed);
        }
        // 2 -- Push suppliers to DB
        const res = await this.supplierModel.insertMany(supps);
        if (!res.length) throw 'ADD_SUPPLIERS.WRITE_FAILED';

        feeds.forEach(async (f) => {
            await this.feedsService.createFeed(f);
        });

        // 4 -- Push invites to DB and send invite emails
        if (invites.length) await this.supplierInvitationsService.inviteSuppliers(invites);

        // 5 -- Only return the first supplier
        // TODO: Remove this and have web app call current view of suppliers!
        // return await this.getSuppliersByTeam(suppliers[0].team);
        const supp = await res[0].populate(populate);
        return [supp];
    }

    // Userid is important for supplier invites!
    async updateSupplier(supplier: SupplierInput): Promise<SupplierType> {
        try {
            let data = null;
            const now = new Date();
            const oldSupplier = await this.supplierModel
                .findOne({ _id: supplier._id })
                .populate({ path: 'settings.portal', model: 'Portal' });
            const sup = new this.supplierModel(supplier);
            data = cloneDeep(sup).toObject(); // Should never update status via this method (delete doesn't work)
            if (!supplier?.status) delete data.status;
            if (!supplier.logoBg) delete data.logoBg;
            if (!supplier?.createdAt) delete data.createdAt;
            // For both Settings & Properties
            // Make sure to have objectIDs(and not mere string types) for 'portal'
            // It's OK to leave 'id' as strings for 'invoiceTypes'
            if (supplier?.settings === undefined) delete data.settings;
            else {
                data.settings?.forEach((i) => {
                    i.portal = mongoose.Types.ObjectId(i.portal);
                });
            }
            if (supplier?.properties === undefined) delete data.properties;
            else {
                data.properties?.forEach((i) => {
                    i.portal = mongoose.Types.ObjectId(i.portal);
                });
            }
            data.updatedAt = now;
            const res = await this.supplierModel
                .findOneAndUpdate({ _id: supplier._id }, { $set: data }, { new: true })
                .populate(populate);

            // If email is provided as input, revoke any outstanding supplier-invites if the e-mail is changed
            const c1 = !!supplier.email;
            const c2 = !!res.invitation;
            const c3 = res?.invitation?.inviteeEmail !== res?.email;
            if (c1 && c2 && c3) {
                await this.supplierInvitationsService.revokeSupplierInvite(
                    res.invitation.token,
                    supplier.updatedBy,
                    res?.team?._id || null, // If user is updating supplier he is assumed to be in client team
                );
            }

            /** Adding informtion to supplier feed */
            if (!supplier.status) {
                const context = await this.compareSuppliers(res, oldSupplier);
                await this.feedsService.createFeed({
                    supplier: res._id,
                    type: EnumFeedType.SUPPLIER,
                    subType: context.type,
                    userId: supplier.updatedBy,
                    team: res.team._id,
                    context: new InvoiceTypeContext(context.refId, context.name, context.updates),
                });
            }
            return res;
            // return await this.getSuppliersByTeam(res.team._id);
        } catch (err) {
            console.log(
                '🚀 ~ file: suppliers.service.ts:366 ~ SuppliersService ~ updateSupplier ~ err:',
                err,
            );
            throw err;
        }
    }

    async unlinkSuppliers(suppliers: SupplierInput[]): Promise<SupplierType[]> {
        const { _id, team, updatedBy } = suppliers[0];
        if (!team) throw 'UNLINK_SUPPLIERS.INVALID_TEAM';
        if (!updatedBy) throw 'UNLINK_SUPPLIERS.INVALID_USER';
        const supplierIds = suppliers.map((s) => s._id);

        const res = await this.supplierModel.updateMany(
            { _id: { $in: supplierIds } },
            {
                $unset: {
                    supplier: 1,
                    invitation: 1,
                },
                status: EnumSupplierStatus.PENDING,
                updatedAt: new Date(),
                updatedBy,
            },
        );
        console.log(
            '🚀 ~ file: suppliers.service.ts:376 ~ SuppliersService ~ unlinkSuppliers ~ res:',
            res,
        );

        // Adding Feed
        suppliers.forEach(async (s) => {
            await this.feedsService.createFeed({
                supplier: s._id,
                type: EnumFeedType.SUPPLIER,
                subType: EnumFeedSubType.SUPPLIER_UNLINKED,
                userId: updatedBy,
                team: team,
            });
        });

        this.supplierInvitationsService.deleteInvitesBySuppliers(supplierIds);

        // 4 -- Only return the first supplier
        // return await this.getSuppliersByTeam(team);
        console.log(
            '🚀 ~ file: suppliers.service.ts:395 ~ SuppliersService ~ unlinkSuppliers ~ _id:',
            _id,
        );
        const supp = await this.getSupplierById(_id);

        console.log(
            '🚀 ~ file: suppliers.service.ts:399 ~ SuppliersService ~ unlinkSuppliers ~ supp:',
            supp,
        );
        return [supp];
    }

    async removeSuppliers(suppliers: SupplierInput[]): Promise<SupplierType[]> {
        // 1 -- Validate inputs and prepare suppliers IDs
        const { team, updatedBy } = suppliers[0];
        if (!team) throw 'REMOVE_SUPPLIERS.INVALID_TEAM';
        if (!updatedBy) throw 'REMOVE_SUPPLIERS.INVALID_USER';
        const supplierIds = suppliers.map((s) => s._id);

        // 2 -- Update suppliers in DB
        await this.supplierModel.updateMany(
            { _id: { $in: supplierIds } },
            {
                $unset: {
                    supplier: 1,
                    invitation: 1,
                },
                status: EnumSupplierStatus.DELETED,
                updatedAt: new Date(),
                updatedBy,
            },
        );

        // Adding feed
        suppliers.forEach(async (s) => {
            await this.feedsService.createFeed({
                supplier: s._id,
                type: EnumFeedType.SUPPLIER,
                subType: EnumFeedSubType.SUPPLIER_DELETED,
                userId: updatedBy,
                team: team,
            });
        });

        // 4 -- Remove all related supplier invitations
        this.supplierInvitationsService.deleteInvitesBySuppliers(supplierIds);

        // 5 -- Return success
        // TODO: Remove this and have web app call current view of suppliers!
        return await this.getSuppliersByTeam(team);
    }

    async removeClients(clients: SupplierInput[]): Promise<SupplierType[]> {
        // 1 -- Validate inputs and prepare suppliers IDs
        const { supplier, updatedBy } = clients[0];
        if (!supplier) throw 'REMOVE_CLIENTS.INVALID_TEAM'; // ! Supplier points to supplier itself
        if (!updatedBy) throw 'REMOVE_CLIENTS.INVALID_USER';
        const clientIds = clients.map((c) => c._id);

        // 2 -- Update suppliers in DB
        await this.supplierModel.updateMany(
            { _id: { $in: clientIds } },
            {
                $unset: {
                    supplier: 1,
                    invitation: 1,
                },
                status: EnumSupplierStatus.PENDING,
            },
            // Don't update the updatedAt and updatedBy fields
            // This because this scenario is performed by a supplier himself!
            // The supplier is NOT a team member
            // The client must still have local access to this supplier
        );

        // 3 -- Foresee client removal feed item
        // TODO: Implement the commented out function below
        // const options = {
        //      supType: EnumFeedSupType.DELETE_CLIENT,
        //      userId: updatedBy,
        //      teamId: supplier,
        // };
        // ! await this.feedsService.createSupplierFeeds(clientIds, options)

        // 4 -- Remove all related supplier/client invitations
        this.supplierInvitationsService.deleteInvitesBySuppliers(clientIds);

        // 5 -- Return success
        // TODO: Remove this and have web app call current view of suppliers!
        return await this.getSuppliersBySupplierTeam(supplier);
    }

    async updateSupplierSubscribers(supplier: SupplierInput): Promise<SupplierType> {
        const subs = supplier.subscribers.map((s) => ({ user: mongoose.Types.ObjectId(s.user) }));
        const res = await this.supplierModel.findOneAndUpdate(
            { _id: supplier._id },
            { $set: { subscribers: subs } },
            { new: true },
        );

        return await this.getSupplierById(supplier._id);
    }

    async compareSuppliers(newSup, oldSup) {
        const updates = [];
        newSup = newSup.toJSON();
        oldSup = oldSup.toJSON();
        let type = null;
        let name = null;
        let refId = null;
        let portalId = null;
        let oldInvTypes = [];
        let newInvTypes = [];
        Object.keys(oldSup).map(async (sk) => {
            if (typeof oldSup[sk] === 'string' || sk === 'address' || sk === 'phone') {
                if (sk === 'address' || sk === 'phone') {
                    Object.keys(oldSup[sk]).map((skk) => {
                        if (oldSup[sk][skk] !== newSup[sk][skk]) {
                            updates.push({
                                field: skk,
                                parentField: sk,
                                prevValue: oldSup[sk][skk],
                                newValue: newSup[sk][skk],
                            });
                        }
                    });
                } else if (oldSup[sk] !== newSup[sk]) {
                    updates.push({
                        field: sk,
                        prevValue: oldSup[sk],
                        newValue: newSup[sk],
                    });
                }
                type = EnumFeedSubType.SUPPLIER_UPDATED;
            } else if (sk === 'settings') {
                // If array size does not change that means portals are same changes is in invoice types
                const newSupLength = newSup[sk].length;
                const oldSupLength = oldSup[sk].length;
                if (!oldSup[sk] || newSupLength > oldSupLength) {
                    type = EnumFeedSubType.SUPPLIER_PORTAL_ASSIGNED;
                    name = newSup[sk][newSupLength - 1].portal.name;
                } else if (newSupLength < oldSupLength) {
                    type = EnumFeedSubType.SUPPLIER_PORTAL_REMOVED;
                    name = oldSup[sk][oldSupLength - 1].portal.name;
                } else {
                    newSup[sk]?.forEach(async (skk, i) => {
                        // Invoice types from only 1 portal can be edited at a time we will check which
                        // old array is different from onew array
                        if (!arrayCompare(skk.invoiceTypes, oldSup[sk][i]['invoiceTypes'])) {
                            //Once we get that we will find that portal for names of the invoice types
                            portalId = skk.portal._id;

                            oldInvTypes = oldSup[sk][i]['invoiceTypes'];
                            newInvTypes = skk.invoiceTypes;
                        }
                    });
                }
            }
        });

        if (portalId) {
            const portal = await this.portalModel.findOne({ _id: portalId });
            newInvTypes.forEach((it) => {
                let index = oldInvTypes.indexOf(it);
                if (index === -1) {
                    let pe = portal.invoiceTypes.find((it1) => it1.id === it);
                    updates.push({
                        field: 'invoiceType',
                        prevValue: '',
                        newValue: pe.name,
                    });
                } else {
                    oldInvTypes.splice(index, 1);
                }
            });
            oldInvTypes.forEach((it) => {
                let pe = portal.invoiceTypes.find((it1) => it1.id === it);
                updates.push({
                    field: 'invoiceType',
                    prevValue: pe.name,
                    newValue: '',
                });
            });
            type = EnumFeedSubType.SUPPLIER_INV_TYPE_UPDATED;
        }

        return { refId, name, updates: updates.length ? updates : null, type };
    }
}
