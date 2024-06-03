export default function memberInviteTemplate(team: string, link: string) {
    return (
        `Hi! <br><br>You have been invited to <b>${team}</b> on Paymen!<br>` +
        `<br>Click the link below to head over to the invitation:<br><br>` +
        `<a href=${link}>GO TO INVITATION</a>`
    );
}
