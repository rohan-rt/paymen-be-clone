import { Inject, forwardRef, Injectable, HttpStatus, HttpException, Options } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
const mongoose = require('mongoose');

// Import inputs
import { MemberInput } from './inputs/member.input';

// Imports interfaces
import { IMembers } from './interfaces/members.interface';

// Import schemas
import { UserDocument } from 'api/users/schemas/user.schema';
import { EnumMemberRole, EnumMemberStatus, MemberDocument } from './schemas/member.schema';

// Import services
import { TeamInvitationsService } from 'api/team-invitations/team-invitations.service';

@Injectable()
export class MembersService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<UserDocument>,
        @InjectModel('Member') private readonly memberModel: Model<MemberDocument>,
        @Inject(forwardRef(() => TeamInvitationsService))
        private readonly teamInvitationsService: TeamInvitationsService,
    ) {}

    async getTeamMemberById(memberId: string): Promise<MemberDocument> {
        const members = await this.memberModel
            .findOne({ _id: memberId })
            .populate(['user', 'team', 'updatedBy', 'createdBy']);
        return members;
    }

    async getTeamMembersByUser(userId: string): Promise<MemberDocument[]> {
        const member = await this.memberModel
            .find({ user: mongoose.Types.ObjectId(userId) })
            .populate(['user', 'team', 'updatedBy', 'createdBy']);
        return member;
    }

    async getTeamMembers(teamId: string): Promise<MemberDocument[]> {
        let userTeams = [];
        userTeams = await this.memberModel
            .find({ team: mongoose.Types.ObjectId(teamId) })
            .populate(['user', 'team', 'updatedBy', 'createdBy']);
        return userTeams;
    }
    async getTeamMembersCount(teamId: string): Promise<number> {
        return await this.memberModel.countDocuments({ team: mongoose.Types.ObjectId(teamId) });
    }

    async getAllTeamMembers(teamId: string): Promise<IMembers> {
        let people = {};
        const members = await this.getTeamMembers(teamId);
        const invitees = await this.teamInvitationsService.getTeamInvitations(teamId);
        people = { members, invitees };
        return people;
    }

    async addMember(member: MemberInput, minimal?: boolean): Promise<MemberDocument> {
        const mem = await this.memberModel.findOne({
            team: mongoose.Types.ObjectId(member.team), // _id
            user: mongoose.Types.ObjectId(member.user), // _id
        });
        if (mem) return null;
        // Continue if no member is found
        if (!member.createdAt) member.createdAt = new Date();
        const m = new this.memberModel(member);
        const res = await m.save();
        if (minimal) return res;
        return await this.getTeamMemberById(res._id);
    }

    async changeMemberRole(userId: string, memberId: string, role: string): Promise<IMembers> {
        const now = new Date();
        const res = await this.memberModel.findOneAndUpdate(
            { _id: memberId },
            {
                role,
                updatedAt: now,
                updatedBy: mongoose.Types.ObjectId(userId),
            },
            { new: true },
        );
        return await this.getAllTeamMembers(res.team._id);
    }

    async toggleMemberStatus(userId: string, memberId: string): Promise<IMembers> {
        const member = await this.memberModel.findOne({ _id: memberId });
        const status =
            member.status === EnumMemberStatus.ACTIVE
                ? EnumMemberStatus.DEACTIVATED
                : EnumMemberStatus.ACTIVE;
        const data: any = {
            status,
            updatedAt: new Date(),
            updatedBy: mongoose.Types.ObjectId(userId),
        };
        // If an OWNER is being deactivated, make sure to downgrade role to MEMBER
        if (status === EnumMemberStatus.DEACTIVATED && member.role === EnumMemberRole.OWNER)
            data.role = EnumMemberRole.MEMBER;

        const res = await this.memberModel
            .findOneAndUpdate({ _id: memberId }, { $set: data }, { new: true })
            .populate(['user', 'team']);
        // If the team is currently selected as lastSelectedTeam, remove it!
        if (res.status === EnumMemberStatus.DEACTIVATED) await this.clearLstOfMember(res);
        return await this.getAllTeamMembers(res.team._id);
    }

    async fetchTeamInvite(inviteId: string) {
        const invitee = await this.teamInvitationsService.getTeamInvitationById(inviteId);
        return invitee;
    }

    async removeMember(memberId: string, all?: boolean): Promise<IMembers> {
        const res = await this.memberModel
            .findOneAndDelete({ _id: memberId })
            .populate(['user', 'team']);
        await this.clearLstOfMember(res);
        if (all) return await this.getAllTeamMembers(res.team._id);
    }

    async clearLstOfMember(member: any) {
        // If the team is currently selected as lastSelectedTeam, remove it!
        let lastTeamId = null;
        if (member.user.lastSelectedTeam) {
            lastTeamId = member.user.lastSelectedTeam._id;
        }
        const memTeamId = member.team._id;
        // if (member.status === 'DEACTIVATED' && lastTeamId === memTeamId) {
        if (String(lastTeamId) === String(memTeamId)) {
            await this.userModel.findOneAndUpdate(
                { _id: member.user._id },
                {
                    $unset: { lastSelectedTeam: 1 },
                    updatedAt: new Date(),
                },
            );
        }
    }
}
