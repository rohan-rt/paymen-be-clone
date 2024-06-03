// Import schemas
import { MemberDocument } from '../schemas/member.schema';
import { TeamInvitationDocument } from 'api/team-invitations/schemas/team-invitation.schema';

export interface IMembers {
    members?: [MemberDocument];
    invitees?: [TeamInvitationDocument];
}
