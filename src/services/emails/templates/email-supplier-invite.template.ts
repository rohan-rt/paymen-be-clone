export default function supplierInvitationTemplate(link: string, team: string, supplier: string) {
    return (
        `Hi !
         <br>
         <br>
         ${supplier} has been invited as a supplier to ${team} on Paymen!
         <br>
         <br>` + `<a href=${link}>Click here to go to the invite</a>`
    );
}
