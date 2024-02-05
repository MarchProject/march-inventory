import { Resolver, Mutation, Args, Query } from '@nestjs/graphql'
import { Inject, Logger, UseGuards } from '@nestjs/common'
import { logContext } from 'src/common/helpers/log'
import { InventoryService } from './Inventory.service'
import * as common from 'src/types'
import { UserAuthGuard, uamAuthRole } from '@march/core'
import { CurrentUser, ICurrentUser } from 'src/common/helpers/user'

@Resolver(() => common.Inventory)
export class InventoryResolver {
  private readonly loggers = new Logger(InventoryResolver.name)

  constructor() {}
  @Inject(InventoryService) private inventoryService: InventoryService

  @UseGuards(new UserAuthGuard(uamAuthRole.Any))
  @Query(() => common.InventoryNameResponse, { name: 'getInventoryNames' })
  async getInventoryNames(
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.InventoryNameResponse> {
    const logctx = logContext(InventoryResolver, this.getInventoryNames)
    const result = await this.inventoryService.getInventoryNames(req)
    this.loggers.debug({ result }, logctx)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.Any))
  @Query(() => common.InventoriesResponse, { name: 'getInventories' })
  async getInventories(
    @Args('params') params: common.ParamsInventory,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.InventoriesResponse> {
    const logctx = logContext(InventoryResolver, this.getInventories)
    const result = await this.inventoryService.getInventories(params, req)
    this.loggers.debug({ result }, logctx)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.Any))
  @Query(() => common.InventoryDataResponse, { name: 'getInventory' })
  async getInventory(
    @Args('id') id: string,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.InventoryDataResponse> {
    const logctx = logContext(InventoryResolver, this.getInventory)
    const result = await this.inventoryService.getInventory(id, req)
    this.loggers.debug({ result }, logctx)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.Any))
  @Query(() => common.TypesInventoryResponse, { name: 'getTypesInventory' })
  async getTypesInventory(
    @CurrentUser() req: ICurrentUser,
    @Args('params') params: common.ParamsInventoryType,
  ): Promise<common.TypesInventoryResponse> {
    const logctx = logContext(InventoryResolver, this.getTypesInventory)
    const result = await this.inventoryService.getTypesInventory(req, params)
    this.loggers.debug({ result }, logctx)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.Any))
  @Query(() => common.TypeInventory, { name: 'getInventoryType' })
  async getInventoryType(
    @Args('id') id: string,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.TypeInventory> {
    const logctx = logContext(InventoryResolver, this.getInventoryType)
    const result = await this.inventoryService.getInventoryType(id, req)
    this.loggers.debug({ result }, logctx)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.Any))
  @Query(() => common.BrandsInventoryDataResponse, {
    name: 'getBrandsInventory',
  })
  async getBrandsInventory(
    @CurrentUser() req: ICurrentUser,
    @Args('params') params: common.ParamsInventoryBrand,
  ): Promise<common.BrandsInventoryDataResponse> {
    const logctx = logContext(InventoryResolver, this.getBrandsInventory)
    const result = await this.inventoryService.getBrandsInventory(req, params)
    this.loggers.debug({ result }, logctx)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.Any))
  @Query(() => common.BrandType, { name: 'getBrandType' })
  async getBrandType(
    @Args('id') id: string,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.BrandType> {
    const logctx = logContext(InventoryResolver, this.getBrandType)
    const result = await this.inventoryService.getBrandType(id, req)
    this.loggers.debug({ result }, logctx)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.SuperAdmin))
  @Mutation(() => common.MutationInventoryResponse, { name: 'upsertInventory' })
  async upsertInventory(
    @Args('input') input: common.UpsertInventoryInput,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.MutationInventoryResponse> {
    const logctx = logContext(InventoryResolver, this.upsertInventory)
    this.loggers.debug({ req }, logctx)
    await this.inventoryService.checkUpsert(req.tasks, input.id, 'INUP', 'INCP')
    const result = await this.inventoryService.upsertInventory(input, req)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.Any))
  @Mutation(() => common.MutationInventoryResponse, {
    name: 'upsertTypeInventory',
  })
  async upsertTypeInventory(
    @Args('input') input: common.UpsertTypeInventoryInput,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.MutationInventoryResponse> {
    const logctx = logContext(InventoryResolver, this.upsertTypeInventory)
    this.loggers.debug({ input }, logctx)
    await this.inventoryService.checkUpsert(req.tasks, input.id, 'INTU', 'INTC')
    const result = await this.inventoryService.upsertInventoryType(input, req)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.SuperAdmin))
  @Mutation(() => common.MutationInventoryResponse, {
    name: 'upsertBrandInventory',
  })
  async upsertBrandInventory(
    @Args('input') input: common.UpsertBrandInventoryInput,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.MutationInventoryResponse> {
    const logctx = logContext(InventoryResolver, this.upsertBrandInventory)
    this.loggers.debug({ input }, logctx)
    await this.inventoryService.checkUpsert(req.tasks, input.id, 'INBU', 'INBC')
    const result = await this.inventoryService.upsertBrandInventory(input, req)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.SuperAdmin))
  @Mutation(() => common.MutationInventoryResponse, {
    name: 'deleteBrandInventory',
  })
  async deleteBrandInventory(
    @Args('id') id: string,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.MutationInventoryResponse> {
    const logctx = logContext(InventoryResolver, this.deleteBrandInventory)
    this.loggers.debug({ id }, logctx)
    const result = await this.inventoryService.deleteBrandInventory(id, req)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.Any))
  @Mutation(() => common.MutationInventoryResponse, {
    name: 'favoriteInventory',
  })
  async favoriteInventory(
    @Args('id') id: string,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.MutationInventoryResponse> {
    const logctx = logContext(InventoryResolver, this.favoriteInventory)
    this.loggers.debug({ id }, logctx)
    await this.inventoryService.checkUpsert(req.tasks, id, 'INBU', 'INBC')
    const result = await this.inventoryService.favoriteInventory(id, req)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.SuperAdmin))
  @Mutation(() => common.MutationInventoryResponse, { name: 'deleteInventory' })
  async deleteInventory(
    @Args('id') id: string,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.MutationInventoryResponse> {
    const logctx = logContext(InventoryResolver, this.deleteInventory)
    this.loggers.debug({ id }, logctx)
    const result = await this.inventoryService.deleteInventory(id, req)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.SuperAdmin))
  @Mutation(() => common.MutationInventoryResponse, { name: 'deleteTypeInventory' })
  async deleteTypeInventory(
    @Args('id') id: string,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.MutationInventoryResponse> {
    const logctx = logContext(InventoryResolver, this.deleteTypeInventory)
    this.loggers.debug({ id }, logctx)
    const result = await this.inventoryService.deleteTypeInventory(id, req)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.SuperAdmin))
  @Mutation(() => common.UploadInventoryResponse, { name: 'uploadInventory' })
  async uploadInventory(
    @Args('input') input: common.UploadInventoryInput,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.UploadInventoryResponse> {
    const logctx = logContext(InventoryResolver, this.uploadInventory)
    this.loggers.debug({ input }, logctx)
    const result = await this.inventoryService.uploadInventory(input, req)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.SuperAdmin))
  @Mutation(() => common.RecoveryHardDeletedResponse, { name: 'recoveryHardDeleted' })
  async recoveryHardDeleted(
    @Args('input') input: common.RecoveryHardDeletedInput,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.RecoveryHardDeletedResponse> {
    const logctx = logContext(InventoryResolver, this.recoveryHardDeleted)
    this.loggers.debug({ input }, logctx)
    const result = await this.inventoryService.recoveryHardDeleted(input, req)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.SuperAdmin))
  @Query(() => common.DeletedInventoryResponse, {
    name: 'getInventoryAllDeleted',
  })
  async getInventoryAllDeleted(
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.DeletedInventoryResponse> {
    const logctx = logContext(InventoryResolver, this.getInventoryAllDeleted)
    this.loggers.debug({ req }, logctx)
    const result = await this.inventoryService.getInventoryAllDeleted(req)
    return result
  }
}
