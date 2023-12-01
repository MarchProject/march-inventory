
/*
 * ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export enum DeletedMode {
    RECOVERY = "RECOVERY",
    DELETE = "DELETE"
}

export enum DeletedType {
    inventory = "inventory",
    inventoryType = "inventoryType",
    brandType = "brandType"
}

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

export class RecoveryHardDeletedInput {
    id: string;
    type: DeletedType;
    mode: DeletedMode;
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

export class UploadInventoryInput {
    uploadDatas?: UpsertInventoryInput[];
    fileName?: string;
}

export class UpsertBrandInventoryInput {
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

export class UpsertTypeInventoryInput {
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

export class DataUploadFile {
    id?: string;
    name?: string;
    type?: string;
    brand?: string;
    description?: string;
    expiryDate?: string;
    amount?: string;
    sku?: string;
    reorderLevel?: string;
    price?: string;
    priceMember?: string;
    favorite?: string;
    weight?: string;
    width?: string;
    height?: string;
    length?: string;
}

export class DeletedInventory {
    id?: string;
    name?: string;
    createdBy?: string;
    updatedBy?: string;
    updatedAt?: Date;
    createdAt?: Date;
}

export class DeleteInventoryResponse {
    data?: ResponseId;
    status?: Status;
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

export class InventoryName {
    id?: string;
    name?: string;
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
    abstract uploadInventory(input: UploadInventoryInput): UploadInventoryResponse | Promise<UploadInventoryResponse>;

    abstract upsertInventory(input: UpsertInventoryInput): MutationInventoryResponse | Promise<MutationInventoryResponse>;

    abstract deleteInventory(id: string): MutationInventoryResponse | Promise<MutationInventoryResponse>;

    abstract upsertTypeInventory(input: UpsertTypeInventoryInput): MutationInventoryResponse | Promise<MutationInventoryResponse>;

    abstract deleteInventoryType(id: string): MutationInventoryResponse | Promise<MutationInventoryResponse>;

    abstract upsertBrandInventory(input: UpsertBrandInventoryInput): MutationInventoryResponse | Promise<MutationInventoryResponse>;

    abstract deleteBrandType(id: string): MutationInventoryResponse | Promise<MutationInventoryResponse>;

    abstract favoriteInventory(id: string): MutationInventoryResponse | Promise<MutationInventoryResponse>;

    abstract recoveryHardDeleted(input: RecoveryHardDeletedInput): RecoveryHardDeleted | Promise<RecoveryHardDeleted>;
}

export class MutationInventoryResponse {
    data?: ResponseId;
    status?: Status;
}

export abstract class IQuery {
    abstract status(): string | Promise<string>;

    abstract getInventoryNames(): InventoryName[] | Promise<InventoryName[]>;

    abstract getInventory(id?: string): ResponseDataInventory | Promise<ResponseDataInventory>;

    abstract getInventories(params?: ParamsInventory): ResponseInventories | Promise<ResponseInventories>;

    abstract getInventoryType(id?: string): InventoryType | Promise<InventoryType>;

    abstract getInventoryTypes(params?: ParamsInventoryType): InventoryType[] | Promise<InventoryType[]>;

    abstract getBrandType(id?: string): BrandType | Promise<BrandType>;

    abstract getBrandTypes(params?: ParamsInventoryBrand): ResponseDataInventoryBrands | Promise<ResponseDataInventoryBrands>;

    abstract getInventoryAllDeleted(): ResponseDeletedInventory | Promise<ResponseDeletedInventory>;
}

export class RecoveryHardDeleted {
    id?: string;
    type?: DeletedType;
    mode?: DeletedMode;
}

export class ResponseBrand {
    id?: string;
}

export class ResponseDataInventory {
    data?: Inventory;
    status?: Status;
}

export class ResponseDataInventoryBrands {
    data?: BrandType[];
    status?: Status;
}

export class ResponseDeletedInventory {
    inventory?: DeletedInventory[];
    brand?: DeletedInventory[];
    type?: DeletedInventory[];
}

export class ResponseFavorite {
    id?: string;
}

export class ResponseFileUploadNames {
    id?: string;
    name?: string;
}

export class ResponseGetUploadFile {
    fileName?: string;
    data?: DataUploadFile[];
}

export class ResponseId {
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

export class Status {
    code: number;
    message?: string;
}

export class UploadInventoryResponse {
    id?: string;
    success?: boolean;
    reason?: string;
}

export type SortOrder = any;
