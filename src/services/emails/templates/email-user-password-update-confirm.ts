export default function updatePasswordConfirmationTemplate(link: string) {
  return (
    "Dear <br><br>Click on the link below to confirm your updated password<br><br>" +
    `<a href=${link}>Confirm my new password</a>`
  );
}
