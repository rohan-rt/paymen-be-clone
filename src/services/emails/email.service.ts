import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as nodemailer from 'nodemailer';

// Import configs
import config from 'config';

// Enums
import { EnumEmailVerifType } from 'api/email-verifications/schemas/email-verification.schema';

// Inputs
import { UserInput } from 'api/users/inputs/user.input';

// User-facing templates
import userEmailVerificationTemplate from './templates/email-user-email-verif.template';
import resetPasswordTemplate from './templates/email-user-reset-password';
import resetTwoFATemplate from './templates/email-user-reset-2FA';
import updatePasswordConfirmationTemplate from './templates/email-user-password-update-confirm';
import changeUserEmailVerificationTemplate from './templates/email-user-new-email-verif.template';
import deleteSessionsTemplate from './templates/email-user-delete-sessions';

// Team-facing templates
import teamEmailVerificationTemplate from './templates/email-team-email-verif.template';
import changeTeamEmailVerificationTemplate from './templates/email-team-new-email-verif.template';

// Member-facing templates
import memberInviteTemplate from './templates/email-member-invite.template';

// Supplier-facing templates
import supplierInvitationTemplate from './templates/email-supplier-invite.template';

@Injectable()
export class EmailService {
    constructor(private readonly httpService: HttpService) { }

    async sendEmailSMTP(to, subject, message) {
        try {
            // Create a transporter using SMTP details
            const transporter = nodemailer.createTransport({
                host: config.keys.MAILCOW.HOST,
                port: 587,
                secure: false, // Set to true if using SSL/TLS
                auth: {
                    user: config.keys.MAILCOW.NO_REPLY,
                    pass: config.keys.MAILCOW.MAILBOX_PASSWORD,
                },
            });

            // Send email
            const info = await transporter.sendMail({
                from: `Hello <${config.keys.MAILCOW.NO_REPLY}>`,
                to: to,
                subject: subject,
                html: message,
            });

            console.log('Email sent successfully!');
            console.log('Message ID:', info.messageId);
            return true
        } catch (error) {
            console.error('An error occurred while sending the email:', error);
            return false
        }
    }

    async sendEmailVerificationEmail(user: any, token: string, type: string): Promise<boolean> {
        let name = user.firstName;
        let query = config.tokens.userVerif;
        let subject = 'Welcome to Paymen!';

        if (type === EnumEmailVerifType.NEW_TEAM) {
            name = user.name;
            query = config.tokens.teamVerif;
            subject = 'Verify your new team';
        }
        const link = new URL(config.paths.signIn, config.keys.WEB_URI);
        link.searchParams.append(query, token);

        return await this.sendEmailSMTP(user.email, subject, type === EnumEmailVerifType.NEW_TEAM
            ? teamEmailVerificationTemplate(link.href, user.name)
            : userEmailVerificationTemplate(link.href))

    }

    async sendChangeEmailVerificationEmail(
        firstName: string,
        newEmail: string,
        token: string,
        type: string,
        teamName?: string,
    ): Promise<boolean> {
        let name = firstName;
        let route = config.paths.profile;
        let query = config.tokens.userVerif;
        let subject = 'Confirm new email';

        if (type === EnumEmailVerifType.TEAM) {
            name = teamName;
            route = config.paths.teamGeneral;
            query = config.tokens.teamVerif;
            subject = 'Confirm new team email';
        }
        const link = new URL(route, config.keys.WEB_URI);
        link.searchParams.append(query, token);
        const template =
            type === EnumEmailVerifType.TEAM
                ? changeTeamEmailVerificationTemplate(firstName, teamName, newEmail, link.href)
                : changeUserEmailVerificationTemplate(firstName, newEmail, link.href);

        return await this.sendEmailSMTP(newEmail, subject, template);
    }

    async sendResetPasswordEmail(user: UserInput, token: string): Promise<boolean> {
        const link = new URL(config.paths.resetPassword, config.keys.WEB_URI);
        link.searchParams.append(config.tokens.forgotPassword, token);
        const template = resetPasswordTemplate(link.href);

        return await this.sendEmailSMTP(user.email, 'Password reset', template);
    }

    async sendResetTwoFAEmail(user: UserInput, otp: string): Promise<boolean> {
        const template = resetTwoFATemplate(otp);
        return await this.sendEmailSMTP(user.email, 'TwoFA reset', template);
    }

    async sendDeleteSessionsEmail(user: UserInput, token: string): Promise<boolean> {
        const link = new URL(config.paths.deleteSessions, config.keys.WEB_URI);
        link.searchParams.append(config.tokens.deleteSessions, token);

        const template = deleteSessionsTemplate(link.href);

        return await this.sendEmailSMTP(user.email, 'Delete Sessions', template);
    }

    async sendUpdatePasswordConfirmationEmail(user: UserInput, token: string): Promise<boolean> {
        const link = new URL(config.paths.signIn, config.keys.WEB_URI);
        link.searchParams.append(config.tokens.updatePassword, token);
        const template = updatePasswordConfirmationTemplate(link.href);

        return await this.sendEmailSMTP(user.email, 'Password confirmation', template);
    }

    async sendTeamInvitationEmail(
        email: string,
        token: string,
        teamName: string,
    ): Promise<boolean> {
        const link = new URL(config.paths.teamInvite, config.keys.WEB_URI);
        link.searchParams.append(config.tokens.memberVerif, token);
        const template = memberInviteTemplate(teamName, link.href);

        return await this.sendEmailSMTP(email, 'Team invitation to Paymen', template);
    }

    async sendSupplierInvite(destination: any, token: string, invitor: any): Promise<boolean> {
        const link = new URL(config.paths.supplierInvite, config.keys.WEB_URI);
        link.searchParams.append(config.tokens.supplierVerif, token);
        const template = supplierInvitationTemplate(
            link.href,
            invitor.teamName,
            destination.supplierName,
        );
        return await this.sendEmailSMTP(destination.email, 'Supplier invitation from ' + invitor.firstName + ' to Paymen', template);

    }
}
