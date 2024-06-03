export default function resetPasswordTemplate(link: string) {
  return (
    "Dear <br><br>The one-time link below can be used to reset your password<br><br>" +
    `<a href=${link}>Reset your password</a>`
  );
}
