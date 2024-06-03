export default function emailVerificationTemplate(
    link: string,
    teamName: string,
) {
    return (
        'Hi! <br><br>You just created team <b>' +
        teamName +
        '</b>!<br><br>Click the link below to verify it!<br><br>' +
        `<a href=${link}>VERIFY TEAM</a>`
    );
}
