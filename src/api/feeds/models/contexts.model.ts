export class GeneralContext {
    refId: string;
    name: string;



    constructor(refId: string, name: string) {
        // If an invoicetype was created:
        if (refId)
            this.refId = refId;
        if (name) this.name = name;

    }
}


export class InvoiceTypeContext {
    id: string;
    name: string;
    updates: Array<{
        field?: string;
        prevValue?: string;
        newValue?: string;
        prevArray?: Array<string>;
        newArray?: Array<string>;
    }>;

    constructor(id: string, name: string, updates: Array<{ field?: string; prevValue?: string; newValue?: string; prevArray?: Array<string>; newArray?: Array<string> }>) {
        // Document ID of the related collection (PORTA)
        if (id) this.id = id;
        if (name) this.name = name;
        // If fields were updated :
        if (updates) this.updates = updates;
    }
}


export class DeletedPortalContext {
    name: string;
    invoiceTypes: Array<{
        id: string
        name: string;
    }>
    mailboxes: Array<{
        id: string
        email: string
    }>

    constructor(name: string, invoiceTypes: Array<{ id: string; name: string; }>, mailboxes: Array<{ id: string; email: string; }>) {
        // Document ID of the related collection (PORTA)
        if (name)
            this.name = name;

        if (invoiceTypes) this.invoiceTypes = invoiceTypes;
        if (mailboxes) this.mailboxes = mailboxes;
    }
}