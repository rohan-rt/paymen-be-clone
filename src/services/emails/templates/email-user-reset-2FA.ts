export default function resetPasswordTemplate(otp: string) {
    // otp = otp.slice(0, 3) + ' ' + otp.slice(3);
    return (
        'Dear <br><br>The one-time code below can be used to reset your 2FA<br><br>' +
        `<h2> ${otp} </h2>`
    );
}
