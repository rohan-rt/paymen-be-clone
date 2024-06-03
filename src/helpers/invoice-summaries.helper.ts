import { ObjectId } from 'mongoose';
const moment = require('moment-timezone');

// Import config
import intervals from 'config/intervals.config';

// Import schemas
import { EnumInvoiceStatus } from 'api/invoices/schemas/invoice.schema';

export function aggrInvoicesInSummary(
    teamId: ObjectId,
    timeZone: string,
    supplierId?: ObjectId,
): Array<any> {
    const tzNow = moment.tz(new Date(), timeZone);
    const day = tzNow.date();
    const now = moment.utc();
    now.date(day);
    now.endOf('day');
    const nowDate = now.toDate();
    return [
        {
            $facet: {
                ...aggrByStatus(teamId, supplierId),
                ...aggrByDueDate(nowDate, teamId, supplierId),
                ...aggrByNearDate(nowDate, teamId, supplierId),
            },
        },
    ];
}

// teamId needs to be type ObjectId
function aggrByStatus(teamId: ObjectId, supplierId?: ObjectId): object {
    let match: object = { team: teamId };
    if (supplierId) match['supplier'] = supplierId;
    return { byStatus: [{ $match: match }, ...aggrGroup(), aggrAddFields()] };
}

// teamId needs to be type ObjectId
function aggrByDueDate(now: Date, teamId: ObjectId, supplierId?: ObjectId): object {
    let match: object = {
        team: teamId,
        $expr: {
            $and: [
                { $ne: ['$status', EnumInvoiceStatus.PAID] },
                { $ne: ['$status', EnumInvoiceStatus.ARCHIVED] },
                {
                    $lte: [
                        {
                            $dateDiff: {
                                startDate: now,
                                endDate: '$dueDate_D',
                                unit: 'day',
                                // timezone: timeZone,
                            },
                        },
                        -1,
                    ],
                },
            ],
        },
    };
    if (supplierId) match['supplier'] = supplierId;
    return { byDueDate: [{ $match: match }, ...aggrGroup(now), aggrAddFields()] };
}

// teamId needs to be type ObjectId
function aggrByNearDate(now: Date, teamId: ObjectId, supplierId?: ObjectId): object {
    let match: object = {
        team: teamId,
        $expr: {
            $and: [
                { $ne: ['$status', EnumInvoiceStatus.PAID] },
                { $ne: ['$status', EnumInvoiceStatus.ARCHIVED] },
                {
                    $gte: [
                        {
                            $dateDiff: {
                                startDate: now,
                                endDate: '$dueDate_D',
                                unit: 'day',
                                // timezone: timeZone,
                            },
                        },
                        0,
                    ],
                },
                {
                    $gte: [
                        {
                            $dateDiff: {
                                startDate: {
                                    $dateSubtract: {
                                        startDate: '$dueDate_D',
                                        unit: 'day',
                                        amount: intervals.INVOICES_NEAR_DUE,
                                        // timezone: timeZone, // ! Don't include timezone here!
                                    },
                                },
                                endDate: now,
                                unit: 'day',
                                // timezone: timeZone,
                            },
                        },
                        0,
                    ],
                },
            ],
        },
    };
    if (supplierId) match['supplier'] = supplierId;
    return { byNearDate: [{ $match: match }, ...aggrGroup(), aggrAddFields()] };
}

function aggrGroup(now?: Date): Array<object> {
    return [
        {
            $group: {
                _id: { status: '$status', currency: '$currency_C' },
                count: { $sum: 1 },
                amount: { $sum: '$totalAmountWithVat_N' },
                supps: { $addToSet: '$supplier' },
                daysLateMin: {
                    $max: {
                        $subtract: [
                            {
                                $dateDiff: {
                                    startDate: now,
                                    endDate: '$dueDate_D',
                                    unit: 'day',
                                    // timezone: timeZone,
                                },
                            },
                            0,
                        ],
                    },
                },
                daysLateMax: {
                    $min: {
                        $subtract: [
                            {
                                $dateDiff: {
                                    startDate: now,
                                    endDate: '$dueDate_D',
                                    unit: 'day',
                                    // timezone: timeZone,
                                },
                            },
                            0,
                        ],
                    },
                },
            },
        },
    ];
}

function aggrAddFields(): object {
    return {
        $addFields: {
            suppliers: { $size: '$supps' },
            supplierIds: '$supps',
        },
    };
}
