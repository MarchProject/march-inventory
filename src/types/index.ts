
/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export enum PaymentStatus {
    Success = "Success",
    Wait = "Wait"
}

export enum PaymentTypes {
    Utility = "Utility",
    CreditCard = "CreditCard",
    Telecom = "Telecom",
    Insurance = "Insurance",
    Loan = "Loan",
    Leasing = "Leasing",
    Education = "Education",
    Other = "Other"
}

export enum RoleUser {
    ADMIN = "ADMIN",
    SUPERADMIN = "SUPERADMIN"
}

export class ParamsInventory {
    search?: string;
    offset?: number;
    limit?: number;
}

export class PayCreditCardRequest {
    description: string;
    amount: number;
    currency: string;
    return_uri: string;
    card: string;
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

export class CreateResponse {
    id?: string;
    role?: RoleUser;
    username?: string;
}

export class Inventory {
    id?: string;
    inventoryTypeId?: string;
    name: string;
    amount: number;
    price: number;
    expiryDate?: Date;
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

    abstract tokenExpire(refreshToken: string): Token | Promise<Token>;

    abstract signIn(username: string, password: string): Token | Promise<Token>;

    abstract signOut(id: string): SignOutResponse | Promise<SignOutResponse>;

    abstract createUser(username: string, password: string): CreateResponse | Promise<CreateResponse>;

    abstract redis(test: string): string | Promise<string>;

    abstract verifyAccessToken(token: string): VerifyAccessTokenResponse | Promise<VerifyAccessTokenResponse>;

    abstract addPayment(amount: number, name: string, lastDay: string, types: string): Payment | Promise<Payment>;

    abstract deletePayment(id: string): Payment | Promise<Payment>;

    abstract editPayment(id: string, amount: number, name: string, lastDay: string, types: string): Payment | Promise<Payment>;

    abstract payCreditCard(params: PayCreditCardRequest): string | Promise<string>;

    abstract payPromptPay(tokenId: string): string | Promise<string>;
}

export class Payment {
    id?: string;
    status?: PaymentStatus;
    amount?: number;
    name?: string;
    types?: PaymentTypes;
    lastDay?: Date;
    updatedAt?: Date;
    createdAt?: Date;
}

export abstract class IQuery {
    abstract status(): string | Promise<string>;

    abstract getInventory(id?: string): Inventory | Promise<Inventory>;

    abstract getInventories(params?: ParamsInventory): Inventory[] | Promise<Inventory[]>;

    abstract getInventoryType(id?: string): InventoryType | Promise<InventoryType>;

    abstract getInventoryTypes(): InventoryType[] | Promise<InventoryType[]>;

    abstract getBrandType(id?: string): BrandType | Promise<BrandType>;

    abstract getBrandTypes(): BrandType[] | Promise<BrandType[]>;

    abstract getPaymentList(id?: string): Payment[] | Promise<Payment[]>;
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

export class SignOutResponse {
    id: string;
}

export class Token {
    access_token: string;
    refresh_token?: string;
    username?: string;
    userId?: string;
}

export class VerifyAccessTokenResponse {
    success?: boolean;
}

export type SortOrder = any;
