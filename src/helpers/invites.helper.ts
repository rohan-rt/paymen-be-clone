export function getRecentEmail(invite: any) {
    return invite?.invitee?.email
        ? invite.invitee.email
        : invite?.inviteeNewEmail
        ? invite.inviteeNewEmail
        : invite?.inviteeEmail;
}
