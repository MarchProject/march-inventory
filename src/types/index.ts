
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
    inventoryBrand = "inventoryBrand",
    inventoryBranch = "inventoryBranch"
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
    branch?: string[];
    pageNo?: number;
    limit?: number;
}

export class ParamsInventoryBranch {
    search?: string;
    offset?: number;
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

export class UpsertInventoryBranchInput {
    id?: string;
    name: string;
    description?: string;
    createdBy?: string;
    updatedBy?: string;
}

export class UpsertInventoryBrandInput {
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
    inventoryBrandId: string;
    inventoryBranchId: string;
    favorite?: boolean;
    amount: number;
    sku?: string;
    serialNumber?: string;
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
    inventory?: DeletedInventoryType[];
    brand?: DeletedInventoryType[];
    branch?: DeletedInventoryType[];
    type?: DeletedInventoryType[];
}

export class DeletedInventoryResponse {
    data?: DeletedInventory;
    status?: Status;
}

export class DeletedInventoryType {
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

export class InventoriesResponse {
    data?: ResponseInventories;
    status?: Status;
}

export class Inventory {
    id?: string;
    inventoryTypeId?: string;
    name: string;
    amount: number;
    sold?: number;
    sku?: string;
    serialNumber?: string;
    size?: string;
    priceMember?: number;
    price: number;
    reorderLevel?: number;
    expiryDate?: Date;
    inventoryBrand?: InventoryBrand;
    inventoryBranch?: InventoryBranch;
    inventoryType?: InventoryType;
    favorite?: boolean;
    description?: string;
    createdBy?: string;
    updatedBy?: string;
    updatedAt?: Date;
    createdAt?: Date;
}

export class InventoryBranch {
    id?: string;
    name?: string;
    description?: string;
    createdBy?: string;
    updatedBy?: string;
    updatedAt?: Date;
    createdAt?: Date;
}

export class InventoryBranchsDataResponse {
    data?: InventoryBranch[];
    status?: Status;
}

export class InventoryBrand {
    id?: string;
    name?: string;
    description?: string;
    createdBy?: string;
    updatedBy?: string;
    updatedAt?: Date;
    createdAt?: Date;
}

export class InventoryBrandsDataResponse {
    data?: InventoryBrand[];
    status?: Status;
}

export class InventoryDataResponse {
    data?: Inventory;
    status?: Status;
}

export class InventoryName {
    id?: string;
    name?: string;
}

export class InventoryNameResponse {
    data?: InventoryName[];
    status?: Status;
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

export class InventoryTypesResponse {
    data?: InventoryType[];
    status?: Status;
}

export abstract class IMutation {
    abstract uploadInventory(input: UploadInventoryInput): UploadInventoryResponse | Promise<UploadInventoryResponse>;

    abstract upsertInventory(input: UpsertInventoryInput): MutationInventoryResponse | Promise<MutationInventoryResponse>;

    abstract deleteInventory(id: string): MutationInventoryResponse | Promise<MutationInventoryResponse>;

    abstract upsertInventoryType(input: UpsertInventoryTypeInput): MutationInventoryResponse | Promise<MutationInventoryResponse>;

    abstract deleteInventoryType(id: string): MutationInventoryResponse | Promise<MutationInventoryResponse>;

    abstract upsertInventoryBrand(input: UpsertInventoryBrandInput): MutationInventoryResponse | Promise<MutationInventoryResponse>;

    abstract deleteInventoryBrand(id: string): MutationInventoryResponse | Promise<MutationInventoryResponse>;

    abstract upsertInventoryBranch(input: UpsertInventoryBranchInput): MutationInventoryResponse | Promise<MutationInventoryResponse>;

    abstract deleteInventoryBranch(id: string): MutationInventoryResponse | Promise<MutationInventoryResponse>;

    abstract favoriteInventory(id: string): MutationInventoryResponse | Promise<MutationInventoryResponse>;

    abstract recoveryHardDeleted(input: RecoveryHardDeletedInput): RecoveryHardDeletedResponse | Promise<RecoveryHardDeletedResponse>;
}

export class MutationInventoryResponse {
    data?: ResponseId;
    status?: Status;
}

export abstract class IQuery {
    abstract status(): string | Promise<string>;

    abstract getInventoryNames(): InventoryNameResponse | Promise<InventoryNameResponse>;

    abstract getInventory(id?: string): InventoryDataResponse | Promise<InventoryDataResponse>;

    abstract getInventories(params?: ParamsInventory): InventoriesResponse | Promise<InventoriesResponse>;

    abstract getInventoryType(id?: string): InventoryType | Promise<InventoryType>;

    abstract getInventoryTypes(params?: ParamsInventoryType): InventoryTypesResponse | Promise<InventoryTypesResponse>;

    abstract getInventoryBrand(id?: string): InventoryBrand | Promise<InventoryBrand>;

    abstract getInventoryBrands(params?: ParamsInventoryBrand): InventoryBrandsDataResponse | Promise<InventoryBrandsDataResponse>;

    abstract getInventoryBranchs(params?: ParamsInventoryBranch): InventoryBranchsDataResponse | Promise<InventoryBranchsDataResponse>;

    abstract getInventoryAllDeleted(): DeletedInventoryResponse | Promise<DeletedInventoryResponse>;
}

export class RecoveryHardDeleted {
    id?: string;
    type?: DeletedType;
    mode?: DeletedMode;
}

export class RecoveryHardDeletedResponse {
    data?: RecoveryHardDeleted;
    status?: Status;
}

export class ResponseBrand {
    id?: string;
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

export class UploadInventory {
    id?: string;
    success?: boolean;
    reason?: string;
}

export class UploadInventoryResponse {
    data?: UploadInventory;
    status?: Status;
}

export type SortOrder = any;
