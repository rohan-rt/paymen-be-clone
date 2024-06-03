export default {
    REFRESH_CURRENCY_RATES: 1000 * 60 * 60 * 3, // Refresh rates every 3 hours
    INVOICES_NEAR_DUE: 3, // Invoices reaching due date within 3 days

    VALID_2FA_OTP: 3, // Validate OTP within 3 minutes

    DEL_EMAIL_VERIF: 10 * 60, // Delete email verif records from DB after 10 minutes

    DEL_FORGOT_PASS: 24 * 60 * 60, // Delete forgot password records from DB after 1 day
    DEL_UPDATE_PASS: 24 * 60 * 60, // Delete forgot password records from DB after 1 day

    DEL_INACTIVE_TEAM: 14, // Delete inactive team records from DB after 14 days

    DEL_EXPIRED_TEAM_INVITES: 14, // Delete expired team invite records from DB after 14 days

    DEL_EXPIRED_SUPPLIER_INVITES: 7, // Delete expired supplier invite records from DB after 7 days
};
