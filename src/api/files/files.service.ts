import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

// Import configs
import config from 'config';

// Import helpers
import BackblazeHelpers from 'helpers/backblaze.helper';

// Import inputs
import { FileInput } from './inputs/files.input';

// Import schemas
import { FileDocument } from './schemas/file.schema';
import { InvoiceDocument } from 'api/invoices/schemas/invoice.schema';

@Injectable()
export class FilesService {
    constructor(
        @InjectModel('File') private fileModel: Model<FileDocument>,
        @InjectModel('Invoice') private invoiceModel: Model<InvoiceDocument>,
    ) {}

    async getAllFilesByInvoiceId(invoiceId: string): Promise<FileDocument[]> {
        try {
            const invoices = await this.invoiceModel
                .findOne({ _id: invoiceId })
                .populate([
                    'files',
                    { path: 'files', populate: { path: 'createdBy', model: 'User' } },
                ]);
            return invoices.files;
        } catch (error) {
            throw error;
        }
    }

    async uploadFile(file: FileInput): Promise<FileDocument> {
        try {
            // Data check on file
            if (!file?.name) throw 'UPLOAD_FILE.NAME_MISSING';
            if (!file?.createdBy) throw 'UPLOAD_FILE.CREATEDBY_MISSING';
            if (!file?.teamId) throw 'UPLOAD_FILE.TEAMID_MISSING';
            if (!file?.invoiceId) throw 'UPLOAD_FILE.INVOICEID_MISSING';

            const now = new Date();
            const path = `${config.keys.B2.teamsFolder}/${file.teamId}/invoices/${file.invoiceId}/${file.name}`;
            const b2 = new BackblazeHelpers();
            const isInit = await b2.init();
            if (!isInit) throw 'Error on B2 init';
            const bbfile = await b2.uploadBase64File(path, file.file);
            const fileUrl = b2.getUrl(bbfile.data.fileId, true);
            file.file = fileUrl;
            const f = new this.fileModel(file);
            f.createdAt = now;
            f.updatedAt = now;
            f.updatedBy = f.createdBy;
            const res = await f.save();
            await this.pushToInvoice(file.invoiceId, res);
            return res.populate(['createdBy']);
        } catch (error) {
            throw error;
        }
    }
    async pushToInvoice(invoiceId: string, file: FileDocument): Promise<InvoiceDocument> {
        return await this.invoiceModel.findOneAndUpdate(
            { _id: invoiceId },
            { $push: { files: file._id } },
            { new: true },
        );
    }

    async updateFile(file: FileInput): Promise<FileDocument> {
        try {
            if (!file?.updatedBy) throw 'UPDATE_FILE.UPDATEDBY_MISSING';
            if (!file?.updatedAt) file.updatedAt = new Date();
            const data = new this.fileModel(file);
            return await this.fileModel.findOneAndUpdate(
                { _id: file._id },
                { $set: data },
                { new: true },
            );
        } catch (error) {
            throw error;
        }
    }

    async deleteFile(fileId: string, invoiceId: string, teamId: string): Promise<string> {
        try {
            // 1 - Get file
            const file = await this.fileModel.findOne({ _id: fileId });
            const name = file.name;
            // 2 - Init backblaze
            const b2 = new BackblazeHelpers();
            const fguid = file.file.split('?fileId=').pop();
            const fileName = `${config.keys.B2.teamsFolder}/${teamId}/invoices/${invoiceId}/${file.name}`;
            const isInit = await b2.init();
            if (!isInit) throw 'Error on B2 init';
            // 3 - Delete file from backblaze
            await b2.deleteFile(fguid, fileName);
            // 4 - Update DB by deleting the record
            await file.delete();
            return name;
        } catch (error) {
            throw error;
        }
    }
}
