// Actually used paths as reference in Vue components, middleware, etc.
export default {
    home: '/',

    auth: '/auth',
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    verifyEmail: '/auth/verify-email',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    deleteSessions: '/auth/delete-sessions',
    teamInvite: '/auth/team-invite',
    supplierInvite: '/auth/supplier-invite',

    account: '/account',
    profile: '/account/profile',
    teams: '/account/teams',
    security: '/account/security',

    team: '/team',
    teamGeneral: '/team/general',
    members: '/team/members',
    invoiceTemplates: '/team/invoice-templates',

    invoicesIn: '/in',
    portals: '/in/portals',
    emails: '/in/emails',
    suppliers: '/in/suppliers',
    addInvoice: '/add-invoice',

    invoicesOut: '/out',
    clients: '/out/clients',
    sendInvoice: '/send-invoice',

    messages: '/messages',
    invites: '/messages/invitations',
    notifs: '/messages/notifications',
};
