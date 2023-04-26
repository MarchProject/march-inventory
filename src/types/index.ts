
/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export class ParamsInventory {
    search?: string;
    offset?: number;
    limit?: number;
}

export class UpdateStatusInput {
    id: string;
}

export class UpsertBrandTypeInput {
    id?: string;
    name: string;
    description?: string;
    createdBy: string;
    updatedBy?: string;
}

export class UpsertInventoryInput {
    id?: string;
    name: string;
    inventoryTypeId?: string;
    brandTypeId?: string;
    amount?: number;
    price?: number;
    expiryDate?: Date;
    description?: string;
    createdBy: string;
    updatedBy?: string;
}

export class UpsertInventoryTypeInput {
    id?: string;
    name: string;
    description?: string;
    createdBy: string;
    updatedBy?: string;
}

export class BrandType {
    id?: string;
    name?: string;
    description?: string;
    createdBy?: string;
    updatedBy?: string;
    updatedAt?: Date;
    createdAt?: Date;
}

export class Inventory {
    id?: string;
    inventoryTypeId?: string;
    name: string;
    amount: number;
    price: number;
    expiryDate?: Date;
    brandType?: BrandType;
    inventoryType?: InventoryType;
    description?: string;
    createdBy?: string;
    updatedBy?: string;
    updatedAt?: Date;
    createdAt?: Date;
}

export class InventoryType {
    id?: string;
    name?: string;
    description?: string;
    createdBy?: string;
    updatedBy?: string;
    updatedAt?: Date;
    createdAt?: Date;
}

export abstract class IMutation {
    abstract upsertInventory(input: UpsertInventoryInput): ResponseInventory | Promise<ResponseInventory>;

    abstract deleteInventory(id: string): ResponseInventory | Promise<ResponseInventory>;

    abstract upsertInventoryType(input: UpsertInventoryTypeInput): ResponseInventory | Promise<ResponseInventory>;

    abstract deleteInventoryType(id: string): ResponseInventory | Promise<ResponseInventory>;

    abstract upsertBrandType(input: UpsertBrandTypeInput): ResponseBrand | Promise<ResponseBrand>;

    abstract deleteBrandType(id: string): ResponseBrand | Promise<ResponseBrand>;
}

export abstract class IQuery {
    abstract status(): string | Promise<string>;

    abstract getInventory(id?: string): Inventory | Promise<Inventory>;

    abstract getInventories(params?: ParamsInventory): Inventory[] | Promise<Inventory[]>;

    abstract getInventoryType(id?: string): InventoryType | Promise<InventoryType>;

    abstract getInventoryTypes(): InventoryType[] | Promise<InventoryType[]>;

    abstract getBrandType(id?: string): BrandType | Promise<BrandType>;

    abstract getBrandTypes(): BrandType[] | Promise<BrandType[]>;
}

export class ResponseBrand {
    id?: string;
}

export class ResponseInventories {
    inventories?: Inventory[];
    total?: number;
}

export class ResponseInventory {
    id?: string;
}

export type SortOrder = any;
