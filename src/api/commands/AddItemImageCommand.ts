import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { ItemImageService } from '../services/ItemImageService';
import { ListingItemTemplateService } from '../services/ListingItemTemplateService';
import { RpcRequest } from '../requests/RpcRequest';
import { ItemImage } from '../models/ItemImage';
import {RpcCommand} from './RpcCommand';
import * as crypto from 'crypto-js';

export class AddItemImageCommand implements RpcCommand<ItemImage> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ItemImageService) private itemImageService: ItemImageService,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'additemimage';
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<ItemImage> {
        // find listing item template
        const listingItemTemplate = await this.listingItemTemplateService.findOne(data.params[0]);

        // find related itemInformation
        const itemInformation = listingItemTemplate.related('ItemInformation').toJSON();

        // create item images
        return await this.itemImageService.create({
            item_information_id: itemInformation.id,
            // we will replace this generate hash later
            hash: crypto.SHA256(new Date().getTime().toString()).toString(),
            data: {
                dataId: data.params[1] || '',
                protocol: data.params[2] || '',
                encoding: data.params[3] || '',
                data: data.params[4] || ''
            }
        });
    }

    public help(): string {
        return 'AddItemImageCommand: TODO: Fill in help string.';
    }
}
