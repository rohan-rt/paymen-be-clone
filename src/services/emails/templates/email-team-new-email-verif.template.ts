export default function changeTeamEmailVerificationTemplate(
    firstName: string,
    teamName: string,
    newEmail: string,
    link: string,
) {
    return (
        `Dear ${firstName} <br>
    <br>For your team <b>` +
        teamName +
        `</b>, you have requested an e-mail change to: <b>` +
        newEmail +
        `</b>
    <br>
    <br>Finalise this change by confirming via the link below.<br><br>` +
        `<a href=${link}>CONFIRM NEW EMAIL</a>`
    );
}
