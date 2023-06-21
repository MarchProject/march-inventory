
/*
 * ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export enum FavoriteStatus {
    LIKE = "LIKE",
    DEFAULT = "DEFAULT"
}

export class ParamsInventory {
    search?: string;
    favorite?: FavoriteStatus;
    type?: string[];
    brand?: string[];
    pageNo?: number;
    limit?: number;
}

export class ParamsInventoryBrand {
    search?: string;
    offset?: number;
    limit?: number;
}

export class ParamsInventoryType {
    search?: string;
    offset?: number;
    limit?: number;
}

export class SizeInventory {
    weight?: number;
    width?: number;
    length?: number;
    height?: number;
}

export class UpdateStatusInput {
    id: string;
}

export class UpsertBrandTypeInput {
    id?: string;
    name: string;
    description?: string;
    createdBy?: string;
    updatedBy?: string;
}

export class UpsertInventoryInput {
    id?: string;
    name: string;
    inventoryTypeId: string;
    brandTypeId: string;
    favorite?: boolean;
    amount: number;
    sku?: string;
    reorderLevel?: number;
    size?: SizeInventory;
    price: number;
    priceMember?: number;
    expiryDate?: Date;
    description?: string;
    createdBy?: string;
    updatedBy?: string;
}

export class UpsertInventoryTypeInput {
    id?: string;
    name: string;
    description?: string;
    createdBy?: string;
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
    sold?: number;
    sku?: string;
    size?: string;
    priceMember?: number;
    price: number;
    reorderLevel?: number;
    expiryDate?: Date;
    brandType?: BrandType;
    inventoryType?: InventoryType;
    favorite?: boolean;
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

    abstract favoriteInventory(id: string): ResponseFavorite | Promise<ResponseFavorite>;
}

export abstract class IQuery {
    abstract status(): string | Promise<string>;

    abstract getInventory(id?: string): Inventory | Promise<Inventory>;

    abstract getInventories(params?: ParamsInventory): ResponseInventories | Promise<ResponseInventories>;

    abstract getInventoryType(id?: string): InventoryType | Promise<InventoryType>;

    abstract getInventoryTypes(params?: ParamsInventoryType): InventoryType[] | Promise<InventoryType[]>;

    abstract getBrandType(id?: string): BrandType | Promise<BrandType>;

    abstract getBrandTypes(params?: ParamsInventoryBrand): BrandType[] | Promise<BrandType[]>;
}

export class ResponseBrand {
    id?: string;
}

export class ResponseFavorite {
    id?: string;
}

export class ResponseInventories {
    inventories?: Inventory[];
    pageLimit?: number;
    pageNo?: number;
    totalPage?: number;
    totalRow?: number;
}

export class ResponseInventory {
    id?: string;
}

export type SortOrder = any;
