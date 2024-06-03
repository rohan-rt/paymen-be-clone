export default function deleteSessionsTemplate(link: string) {
  return (
    "Dear <br><br>The one-time link below can be used to all sessions<br><br>" +
    `<a href=${link}>Delete all sessions</a>`
  );
}
