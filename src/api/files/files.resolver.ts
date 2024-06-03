import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from 'common/guards/session.guard';
import { JwtAuthGuard } from 'common/guards/jwt.guard';

// Import inputs
import { FileInput } from './inputs/files.input';

// Import services
import { FilesService } from './files.service';

// Import models
import { FileType } from './models/file.model';

@Resolver()
export class FilesResolver {
    constructor(private filesService: FilesService) {}

    @Mutation((returns) => FileType)
    @UseGuards(JwtAuthGuard)
    async uploadFile(@Args({ name: 'file' }) file: FileInput) {
        return await this.filesService.uploadFile(file);
    }

    @Query(() => [FileType], { nullable: true })
    @UseGuards(JwtAuthGuard)
    async getAllFilesByInvoiceId(@Args({ name: 'invoiceId' }) invoiceId: string) {
        return await this.filesService.getAllFilesByInvoiceId(invoiceId);
    }
}
