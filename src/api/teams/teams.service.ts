import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
const mongoose = require('mongoose');

// Import libraries and helpers
import * as clone from 'lodash/clone';
import BackblazeHelpers from 'helpers/backblaze.helper';
import { getLogoName, clearPrefixB64, randomColorGenerator } from 'helpers/avatars-logos.helper';

// Import configs
import config from 'config';

// Import inputs
import { TeamInput } from './inputs/team.input';

// Import schemas and enums
import { UserDocument } from 'api/users/schemas/user.schema';
import {
    EnumEmailVerifType,
    EmailVerificationDocument,
} from 'api/email-verifications/schemas/email-verification.schema';
import { EnumTeamStatus, TeamDocument } from './schemas/team.schema';
import {
    EnumMemberRole,
    EnumMemberStatus,
    MemberDocument,
} from 'api/members/schemas/member.schema';

// Import services
import { RedisService } from 'api/redis/redis.service';
import { UtilService } from 'utils/util.service';
import { UsersService } from '../users/users.service';
import { EmailService } from 'services/emails/email.service';
import { MembersService } from 'api/members/members.service';
import { TeamInvitationsService } from 'api/team-invitations/team-invitations.service';
import { SupplierInvitationsService } from 'api/supplier-invitations/supplier-invitations.service';

// Import models
import { UserType } from 'api/users/models/user.model';
import { TeamType } from './models/team.model';
import { FeedsService } from 'api/feeds/feeds.service';
import { EnumFeedSubType, EnumFeedType } from 'api/feeds/schemas/feed.schema';
import { InvoiceTypeContext } from 'api/feeds/models/contexts.model';

@Injectable()
export class TeamsService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<UserDocument>,
        @InjectModel('Team') private readonly teamModel: Model<TeamDocument>,
        @InjectModel('Member') private readonly memberModel: Model<MemberDocument>,
        @InjectModel('EmailVerification')
        private readonly emailVerificationModel: Model<EmailVerificationDocument>,

        private readonly utilService: UtilService,
        private readonly emailService: EmailService,
        private readonly usersService: UsersService,
        private readonly membersService: MembersService,
        private readonly teamInvitationsService: TeamInvitationsService,
        private readonly redisService: RedisService,
        private readonly feedsService: FeedsService,

        @Inject(forwardRef(() => SupplierInvitationsService))
        private readonly supplierInvitationsService: SupplierInvitationsService,
    ) {}

    async getTeamById(_id: string): Promise<TeamDocument> {
        const res = await this.teamModel.findOne({ _id });
        return res;
    }

    async selectTeam(userId: string, teamId: string): Promise<string> {
        try {
            const members = await this.membersService.getTeamMembersByUser(userId);
            if (!members) return 'TEAM.NO_TEAMS_FOUND_TO_SELECT';
            // Check whether user is still a member of team
            // If not, set the first available team as lastSelectedTeam
            const found = members.find((k) => String(k.team._id) === teamId);
            const lastSelectedTeam = found?._id ? found.team._id : members[0].team._id;
            await this.userModel.updateOne(
                { _id: userId },
                {
                    lastSelectedTeam,
                    updatedAt: new Date(),
                },
            );
            return 'TEAM.SELECTED';
        } catch (err) {
            throw err;
        }
    }

    async getLastSelectedTeam(userId: string): Promise<UserDocument> {
        try {
            return await this.userModel
                .findOne({ _id: userId }, { lastSelectedTeam: 1 })
                .populate([
                    'lastSelectedTeam',
                    { path: 'lastSelectedTeam', populate: { path: 'createdBy', model: 'User' } },
                    { path: 'lastSelectedTeam', populate: { path: 'updatedBy', model: 'User' } },
                ]);
        } catch (err) {
            throw err;
        }
    }

    async getTeamsByUserId(userId: string): Promise<UserType> {
        // 1 - Define UserType variable
        let res = new UserType();
        // 2 - Get user including populated lastSelectedTeam
        res = await this.getLastSelectedTeam(userId);
        // 3 - Get myTeams
        res.myTeams = await this.membersService.getTeamMembersByUser(userId);
        return res;
    }

    async createTeam(team: TeamInput): Promise<UserType> {
        try {
            const now = new Date();
            // 1 -- Create a new team
            const newTeam = new this.teamModel(team);
            newTeam.createdAt = now;
            newTeam.updatedAt = now;
            newTeam.updatedBy = mongoose.Types.ObjectId(team.createdBy);
            newTeam.status = EnumTeamStatus.UNDER_VERIF;
            newTeam.logoBg = randomColorGenerator();
            await newTeam.save(); // Creates an ID
            team._id = String(newTeam._id);

            // 2 -- Send team email verification email
            await this.createAndSendEmailVerification(
                team,
                team.createdBy,
                EnumEmailVerifType.NEW_TEAM,
            );

            // 3 -- Add owner member
            const member = {
                team: team._id,
                user: team.createdBy,
                role: EnumMemberRole.OWNER,
                createdAt: now,
                updatedAt: now,
                createdBy: team.createdBy,
                updatedBy: team.createdBy,
            };
            await this.membersService.addMember(member, true);

            // 4 -- Update lastSelectedTeam
            await this.selectTeam(team.createdBy, team._id);

            // 5 -- Return all teams the user is a member of
            return await this.getTeamsByUserId(team.createdBy);
        } catch (err) {
            throw err;
        }
    }

    // email and t.email should always contain current team email
    async createAndSendEmailVerification(
        team: TeamInput,
        userId: string,
        type: string, // Should be either 'NEW_TEAM' or 'TEAM'
        newEmail?: string,
    ): Promise<EmailVerificationDocument> {
        let res, payload, token, emailVerification;

        const now = new Date();
        const t = new this.teamModel(team);
        const uid = mongoose.Types.ObjectId(userId);
        const newEmailVerificationId = mongoose.Types.ObjectId();

        switch (type) {
            case EnumEmailVerifType.NEW_TEAM:
                // === Create a JWT
                payload = {
                    _id: newEmailVerificationId,
                    teamId: t._id,
                    name: t.name,
                    email: t.email,
                    userId,
                };
                token = this.utilService.createToken(payload);
                emailVerification = new this.emailVerificationModel({
                    _id: newEmailVerificationId,
                    team: t._id,
                    email: t.email,
                    token: token,
                    type: EnumEmailVerifType.NEW_TEAM,
                    createdAt: now,
                    createdBy: uid,
                });
                res = await emailVerification.save();
                await this.emailService.sendEmailVerificationEmail(
                    t,
                    token,
                    type, // 'NEW_TEAM',
                );
                return res;

            case EnumEmailVerifType.TEAM:
                // === Create a JWT
                payload = {
                    _id: newEmailVerificationId,
                    email: t.email,
                    newEmail: newEmail,
                    teamId: t._id,
                    userId,
                };
                token = this.utilService.createToken(payload);
                emailVerification = new this.emailVerificationModel({
                    _id: newEmailVerificationId,
                    team: t._id,
                    type: EnumEmailVerifType.TEAM,
                    email: t.email,
                    token: token,
                    newEmail: newEmail,
                    createdAt: now,
                    createdBy: uid,
                });
                res = await emailVerification.save();
                const user = await this.usersService.getUserById(userId);
                if (!user) throw 'SEND_VERIF.USER_NOT_FOUND';
                await this.emailService.sendChangeEmailVerificationEmail(
                    user.firstName,
                    newEmail,
                    token,
                    type,
                    t.name,
                );
                return res;

            default:
                throw 'SEND_VERIF.INVALID_REQUEST';
        }
    }

    async verifyTeamEmail(token: string, userId: string): Promise<string> {
        const decodedToken: any = this.utilService.verifyToken(token);
        if (!decodedToken) throw 'VERIFY_EMAIL.INVALID_TOKEN';
        if (decodedToken.userId !== userId) throw 'VERIFY_EMAIL.INVALID_USER';
        const { _id, teamId } = decodedToken;
        const emailVerification = await this.emailVerificationModel.findOne({ _id });
        if (!emailVerification) throw 'VERIFY_EMAIL.INVALID_REQUEST';
        let payload = null;
        const now = new Date();
        switch (emailVerification.type) {
            case EnumEmailVerifType.NEW_TEAM:
                payload = {
                    _id: teamId,
                    status: EnumTeamStatus.ACTIVE,
                    updatedAt: now,
                };
                await this.updateTeam(payload, userId, true);
                await this.memberModel.updateOne(
                    {
                        role: EnumMemberRole.OWNER,
                        status: EnumMemberStatus.PENDING,
                        user: mongoose.Types.ObjectId(userId),
                        team: mongoose.Types.ObjectId(teamId),
                    },
                    {
                        status: EnumMemberStatus.ACTIVE,
                        updatedAt: now,
                        updatedBy: mongoose.Types.ObjectId(userId),
                    },
                );
                break;

            case EnumEmailVerifType.TEAM:
                payload = {
                    _id: teamId,
                    email: decodedToken.newEmail,
                    updatedAt: now,
                };
                await this.updateTeam(payload, userId, true, true);
                break;

            default:
                break;
        }
        await this.emailVerificationModel.deleteOne({ _id });
        return 'VERIFY_EMAIL.SUCCESS';
    }

    async getTeamEmailVerification(teamId: string): Promise<EmailVerificationDocument> {
        const tid = mongoose.Types.ObjectId(teamId);
        const res = await this.emailVerificationModel.findOne({
            team: tid,
            type: { $in: [EnumEmailVerifType.TEAM, EnumEmailVerifType.NEW_TEAM] },
        });
        return res;
    }

    async requestTeamEmailVerification(team: TeamInput, userId: string): Promise<string> {
        try {
            const t = await this.teamModel.findOne({ _id: team._id });
            if (t.status === EnumTeamStatus.UNDER_VERIF) {
                await this.createAndSendEmailVerification(
                    team,
                    userId,
                    EnumEmailVerifType.NEW_TEAM,
                );
            } else if (t.status === EnumTeamStatus.ACTIVE) {
                // 1 -- Make a clone of inTeam to retain the new email address
                const email = clone(team.email);
                // 2 -- Now assign the current email address from t to inTeam
                // This so as to pass team properly next
                team.email = t.email;
                await this.createAndSendEmailVerification(
                    team,
                    userId,
                    EnumEmailVerifType.TEAM,
                    email, // new email
                );
            }
            return 'UPDATE_TEAM_EMAIL.SUCCESS';
        } catch (err) {
            throw err;
        }
    }

    async updateTeam(
        team: TeamInput,
        userId: string,
        compact?: boolean,
        verify?: boolean, // ! For new email verification
    ): Promise<TeamType | UserType> {
        try {
            const t = await this.teamModel.findOne({ _id: team._id });
            const { UNDER_VERIF, ACTIVE } = EnumTeamStatus;
            if (!compact && !verify) {
                // 1 -- Check whether this team still needs initial verification and, if so, send a verif email
                const verif = await this.getTeamEmailVerification(team._id);
                // Condition 1 -- If verif doesn't exist
                const c1 = !verif;
                // Condition 2.A -- Team is either still not actived
                const p1 = t.status === UNDER_VERIF;
                // Condition 2.B -- Team is active but a new email address is provided
                const p2 = t.status === ACTIVE && !!team.email && team.email !== t.email;
                // Condition 2 -- If either A or B are applicable
                const c2 = p1 || p2;
                if (c1 && c2) await this.requestTeamEmailVerification(team, userId);
            }

            // 2 -- Prepare object for saving
            if (!verify) delete team?.email; // Team.email not needed anymore due to step 1
            if (!team.updatedAt) team.updatedAt = new Date();
            team.updatedBy = userId;
            const input = new this.teamModel(team);

            // 3 -- Save and return myTeams of this user
            const res = await this.teamModel.findOneAndUpdate(
                { _id: team._id },
                { $set: input },
                { new: true },
            );
            const updates = this.compareTeam(t, res);
            this.feedsService.createFeed({
                type: EnumFeedType.TEAM,
                subType: EnumFeedSubType.TEAM_UPDATED,
                context: new InvoiceTypeContext(null, null, updates),
                team: team._id,
                userId: userId,
            });
            return compact ? res : await this.getTeamsByUserId(userId);
        } catch (err) {
            throw err;
        }
    }

    async uploadLogo(userId: string, teamId: string, base64Image: string): Promise<string> {
        try {
            // 1 -- Init properly
            const fileName = getLogoName(teamId);
            const b2 = new BackblazeHelpers();
            const isInit = await b2.init();
            if (!isInit) throw 'Error on B2 init';

            // 2 -- Delete all preexisting logos
            await b2.deleteAllFileVersions(fileName);

            // 3 -- Upload to logo to the cloud
            await b2.uploadBase64File(fileName, base64Image);

            // 4 -- Updating it into redis
            const base64 = clearPrefixB64(base64Image);
            const file = Buffer.from(base64, 'base64');
            await this.redisService.setData(fileName, file);

            // 5 -- Update DB record
            await this.logoUpdateDb(userId, teamId);

            return await 'TEAM.LOGO_UPLOADED';
        } catch (err) {
            throw err;
        }
    }

    async deleteLogo(teamId: string, userId?: string): Promise<string> {
        try {
            const fileName = getLogoName(teamId);
            const b2 = new BackblazeHelpers();
            const isInit = await b2.init();
            if (!isInit) throw 'Error on B2 init';
            await b2.deleteAllFileVersions(fileName);
            const team = await this.logoUpdateDb(userId, teamId);
            await this.redisService.deleteData(fileName);
            return team.logoBg; // Return logoBg
        } catch (err) {
            throw err;
        }
    }

    async logoUpdateDb(userId: string, teamId: string): Promise<TeamType> {
        const payload = {
            _id: teamId,
            logoBg: randomColorGenerator(),
        };
        return await this.updateTeam(payload, userId, true);
    }

    async leaveTeam(teamId: string, userId: string): Promise<UserType> {
        const uid = mongoose.Types.ObjectId(userId);
        const tid = mongoose.Types.ObjectId(teamId);
        try {
            // 1 -- Check if active or pending member exists
            const member = await this.memberModel
                .findOne({
                    team: tid,
                    user: uid,
                    $or: [
                        { status: EnumMemberStatus.ACTIVE },
                        { status: EnumMemberStatus.PENDING },
                        { status: EnumMemberStatus.DEACTIVATED },
                    ],
                })
                .populate('team');
            if (!member) throw 'LEAVE_TEAM.MEMBER_NOT_FOUND';

            // 2 -- Get role, team and current active owners of this team
            const currOwners = await this.memberModel.find({
                team: tid,
                role: EnumMemberRole.OWNER,
                status: EnumMemberStatus.ACTIVE,
            });

            // 3.1 -- If the team is not even verified yet, then just delete it completely
            if (member.team.status === EnumTeamStatus.UNDER_VERIF) {
                await this.deleteTeam(teamId, userId, true);
            }
            // 3.2 -- If user is the only owner
            else if (member.role === EnumMemberRole.OWNER && currOwners.length === 1) {
                await this.deactivateTeam(teamId, userId);
            }
            // 3.3 -- If user is a mere member
            else if (member.role === EnumMemberRole.MEMBER) {
                await this.membersService.removeMember(member._id);
            }

            // 4 -- Return all teams
            return await this.getTeamsByUserId(userId);
        } catch (err) {
            throw err;
        }
    }

    async deactivateTeam(teamId: string, userId: string): Promise<TeamType> {
        try {
            const now = new Date();
            const tid = mongoose.Types.ObjectId(teamId);
            const payload = {
                _id: tid,
                status: EnumTeamStatus.INACTIVE,
                updatedAt: now,
            };
            const team = await this.updateTeam(payload, userId, true);
            // Don't forget to remove the teamId from ALL lastSelectedTeam references
            // This way, all current members won't have access to this team any longer
            // We don't want to delete the MEMBERS yet!
            await this.userModel.updateMany(
                { lastSelectedTeam: tid },
                {
                    $unset: { lastSelectedTeam: 1 },
                    updatedAt: now,
                },
            );
            return team;
        } catch (err) {
            throw err;
        }
    }

    async reinstateTeam(teamId: string, userId: string): Promise<UserType> {
        try {
            const now = new Date();
            const tid = mongoose.Types.ObjectId(teamId);
            const uid = mongoose.Types.ObjectId(userId);
            const member = await this.memberModel.findOne({
                user: uid,
                team: tid,
                role: EnumMemberRole.OWNER,
            });
            if (member) {
                await this.memberModel.updateOne(
                    { _id: member._id },
                    {
                        status: EnumMemberStatus.ACTIVE,
                        updatedAt: now,
                        updatedBy: uid,
                    },
                );
                const payload = {
                    _id: teamId,
                    status: EnumTeamStatus.ACTIVE,
                    updatedAt: now,
                };
                await this.updateTeam(payload, userId, true);
            }
            const userTeams = await this.getTeamsByUserId(userId);
            return userTeams;
        } catch (err) {
            throw err;
        }
    }

    async deleteTeam(teamId: string, userId: string, hardDelete?: boolean): Promise<string> {
        const now = new Date();
        const tid = mongoose.Types.ObjectId(teamId);
        // const uid = mongoose.Types.ObjectId(userId);
        try {
            // 1 -- Handle TEAM
            if (hardDelete) {
                await this.teamModel.deleteOne({
                    _id: teamId,
                    status: EnumTeamStatus.UNDER_VERIF,
                });
                await this.deleteLogo(teamId);
            } else {
                // Set status = 'DELETED' so that it can get removed via the cronjob
                const payload = {
                    _id: teamId,
                    status: EnumTeamStatus.DELETED,
                    updatedAt: now,
                };
                await this.updateTeam(payload, userId, true);
            }

            // 2 -- Delete all MEMBERS from the team
            await this.memberModel.deleteMany({ team: tid });
            await this.emailVerificationModel.deleteMany({ team: tid });
            await this.teamInvitationsService.deleteInvitesByTeam(teamId);
            await this.supplierInvitationsService.deleteInvitesByTeam(teamId);

            await this.userModel.updateMany(
                { lastSelectedTeam: tid },
                {
                    $unset: { lastSelectedTeam: 1 },
                    updatedAt: now,
                },
            );
            return 'DELETE_TEAM.SUCCESS';
        } catch (err) {
            throw err;
        }
    }

    /* This function is executed everyday by cronjob call */
    async deleteExpiredTeams(): Promise<any> {
        try {
            const now = new Date();
            // 1 -- Find inactive teams older than 14 days and set the status to 'DELETED'
            const expiry = new Date(
                now.setDate(now.getDate() - config.intervals.DEL_INACTIVE_TEAM),
            );
            const teamsToDel = await this.teamModel.updateMany(
                { updatedAt: { $lte: expiry }, status: EnumTeamStatus.INACTIVE },
                // Only CRONJOB can update a status to 'DELETED'
                // i.e. there is no immediate need to update updatedBy too
                { status: EnumTeamStatus.DELETED, updatedAt: now },
                { new: true },
            );
            console.log('teamsTODel', teamsToDel);

            // 2 -- Get all Deleted teams
            const deletedTeams = await this.teamModel.find({
                status: EnumTeamStatus.DELETED,
            });

            // 3 -- Permanently delete all MEMBERS still related to deleted teams
            await Promise.all(
                deletedTeams.map(async (dt) => {
                    await this.memberModel.deleteMany({ team: dt._id });
                    await this.emailVerificationModel.deleteMany({ team: dt._id });
                    await this.teamInvitationsService.deleteInvitesByTeam(String(dt._id));
                    await this.supplierInvitationsService.deleteInvitesByTeam(String(dt._id));
                }),
            );

            // 4 -- Return all teams set to status 'DELETED'
            return teamsToDel;
        } catch (err) {
            throw err;
        }
    }

    compareTeam(oldTeam, newTeam) {
        const updates = [];
        newTeam = newTeam.toJSON();
        oldTeam = oldTeam.toJSON();
        Object.keys(oldTeam).map(async (tk) => {
            console.log(typeof oldTeam[tk], tk);
            if (typeof oldTeam[tk] === 'string' || tk === 'address' || tk === 'phone') {
                if (tk === 'address' || tk === 'phone') {
                    Object.keys(oldTeam[tk]).map((tkk) => {
                        if (oldTeam[tk][tkk] !== newTeam[tk][tkk]) {
                            updates.push({
                                field: tkk,
                                parentField: tk,
                                prevValue: oldTeam[tk][tkk],
                                newValue: newTeam[tk][tkk],
                            });
                        }
                    });
                } else if (oldTeam[tk] !== newTeam[tk]) {
                    updates.push({
                        field: tk,
                        prevValue: oldTeam[tk],
                        newValue: newTeam[tk],
                    });
                }
            }
        });
        return updates;
    }
}
