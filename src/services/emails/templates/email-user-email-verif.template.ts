export default function emailVerificationTemplate(link: string) {
    return (
        'Hi! <br><br>Thank you for registering to Paymen !<br><br>Click here to complete your registration<br><br>' +
        `<a href=${link}>Activate your account</a>`
    );
}
