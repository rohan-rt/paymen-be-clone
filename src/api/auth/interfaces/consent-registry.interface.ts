import { Document } from 'mongoose';

export interface IConsentRegistry extends Document {
    email: string;
    registrationForm: string[];
    checkboxText: string;
    date: Date;
    privacyPolicy: string;
    cookiePolicy: string;
    acceptedPolicy: string;
}
