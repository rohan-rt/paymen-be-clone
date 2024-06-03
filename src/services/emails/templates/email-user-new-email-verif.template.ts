export default function changeUserEmailVerificationTemplate(
    firstName: string,
    newEmail: string,
    link: string,
) {
    return (
        `Dear ${firstName} <br>
    <br>You have requested a user e-mail change to: <b>` +
        newEmail +
        `</b>
    <br>
    <br>Finalise this change by confirming via the link below.<br><br>` +
        `<a href=${link}>CONFIRM NEW EMAIL</a>`
    );
}
