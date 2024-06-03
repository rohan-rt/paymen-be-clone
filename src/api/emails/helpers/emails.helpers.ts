export function populateParams() {
    return [
        'attachments',
        // 'team',
        'portal',
        'updatedBy',
        'invoice',
        { path: 'invoice', populate: { path: 'supplier', model: 'Supplier' } },
        {
            path: 'invoice',
            populate: { path: 'supplier', populate: { path: 'supplier', model: 'Team' } },
        },
        {
            path: 'invoice',
            populate: {
                path: 'supplier',
                populate: { path: 'settings.portal', model: 'Portal' },
            },
        },
        {
            path: 'invoice',
            populate: { path: 'supplier', populate: { path: 'team', model: 'Team' } },
        },
        {
            path: 'invoice',
            populate: { path: 'supplier', populate: { path: 'createdBy', model: 'User' } },
        },
        { path: 'invoice', populate: { path: 'portal', model: 'Portal' } },
    ];
}
