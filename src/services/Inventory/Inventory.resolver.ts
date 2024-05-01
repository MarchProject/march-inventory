import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql'
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

  @Query(() => common.InventoryNameResponse, { name: 'test' })
  async test(@Context() context): Promise<string> {
    const logctx = logContext(InventoryResolver, this.getInventoryNames)
    const { headers } = context.req
    const LangHeader = headers['x-lang']
    const result = await this.inventoryService.test()
    this.loggers.debug({ result, LangHeader }, logctx)
    return result
  }

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
  @Query(() => common.InventoryTypesResponse, { name: 'getInventoryTypes' })
  async getInventoryTypes(
    @CurrentUser() req: ICurrentUser,
    @Args('params') params: common.ParamsInventoryType,
  ): Promise<common.InventoryTypesResponse> {
    const logctx = logContext(InventoryResolver, this.getInventoryTypes)
    const result = await this.inventoryService.getInventoryTypes(req, params)
    this.loggers.debug({ result }, logctx)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.Any))
  @Query(() => common.InventoryType, { name: 'getInventoryType' })
  async getInventoryType(
    @Args('id') id: string,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.InventoryType> {
    const logctx = logContext(InventoryResolver, this.getInventoryType)
    const result = await this.inventoryService.getInventoryType(id, req)
    this.loggers.debug({ result }, logctx)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.Any))
  @Query(() => common.InventoryBrandsDataResponse, {
    name: 'getInventoryBrands',
  })
  async getInventoryBrands(
    @CurrentUser() req: ICurrentUser,
    @Args('params') params: common.ParamsInventoryBrand,
  ): Promise<common.InventoryBrandsDataResponse> {
    const logctx = logContext(InventoryResolver, this.getInventoryBrands)
    const result = await this.inventoryService.getInventoryBrands(req, params)
    this.loggers.debug({ result }, logctx)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.Any))
  @Query(() => common.InventoryBranchsDataResponse, {
    name: 'getInventoryBranchs',
  })
  async getInventoryBranch(
    @CurrentUser() req: ICurrentUser,
    @Args('params') params: common.ParamsInventoryBrand,
  ): Promise<common.InventoryBranchsDataResponse> {
    const logctx = logContext(InventoryResolver, this.getInventoryBranch)
    const result = await this.inventoryService.getInventoryBranchs(req, params)
    this.loggers.debug({ result }, logctx)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.Any))
  @Query(() => common.InventoryBrand, { name: 'getInventoryBrand' })
  async getInventoryBrand(
    @Args('id') id: string,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.InventoryBrand> {
    const logctx = logContext(InventoryResolver, this.getInventoryBrand)
    const result = await this.inventoryService.getInventoryBrand(id, req)
    this.loggers.debug({ result }, logctx)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.SuperAdmin))
  @Mutation(() => common.MutationInventoryResponse, { name: 'upsertInventory' })
  async upsertInventory(
    @Context() context,
    @Args('input') input: common.UpsertInventoryInput,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.MutationInventoryResponse> {
    const logctx = logContext(InventoryResolver, this.upsertInventory)
    const { headers } = context.req
    const LangHeader = headers['x-lang']
    this.loggers.debug({ req, LangHeader }, logctx)
    await this.inventoryService.checkUpsert(req.tasks, input.id, 'INUP', 'INCP')
    const result = await this.inventoryService.upsertInventory(
      input,
      req,
      LangHeader,
    )
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.Any))
  @Mutation(() => common.MutationInventoryResponse, {
    name: 'upsertInventoryType',
  })
  async upsertInventoryType(
    @Args('input') input: common.UpsertInventoryTypeInput,
    @CurrentUser() req: ICurrentUser,
    @Context() context,
  ): Promise<common.MutationInventoryResponse> {
    const logctx = logContext(InventoryResolver, this.upsertInventoryType)
    const { headers } = context.req
    const LangHeader = headers['x-lang']
    this.loggers.debug({ input }, logctx)
    await this.inventoryService.checkUpsert(req.tasks, input.id, 'INTU', 'INTC')
    const result = await this.inventoryService.upsertInventoryType(
      input,
      req,
      LangHeader,
    )
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.SuperAdmin))
  @Mutation(() => common.MutationInventoryResponse, {
    name: 'upsertInventoryBrand',
  })
  async upsertInventoryBrand(
    @Args('input') input: common.UpsertInventoryBrandInput,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.MutationInventoryResponse> {
    const logctx = logContext(InventoryResolver, this.upsertInventoryBrand)
    this.loggers.debug({ input }, logctx)
    await this.inventoryService.checkUpsert(req.tasks, input.id, 'INBU', 'INBC')
    const result = await this.inventoryService.upsertInventoryBrand(input, req)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.SuperAdmin))
  @Mutation(() => common.MutationInventoryResponse, {
    name: 'deleteInventoryBrand',
  })
  async deleteInventoryBrand(
    @Args('id') id: string,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.MutationInventoryResponse> {
    const logctx = logContext(InventoryResolver, this.deleteInventoryBrand)
    this.loggers.debug({ id }, logctx)
    const result = await this.inventoryService.deleteInventoryBrand(id, req)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.SuperAdmin))
  @Mutation(() => common.MutationInventoryResponse, {
    name: 'upsertInventoryBranch',
  })
  async upsertInventoryBranch(
    @Args('input') input: common.UpsertInventoryBrandInput,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.MutationInventoryResponse> {
    const logctx = logContext(InventoryResolver, this.upsertInventoryBranch)
    this.loggers.debug({ input }, logctx)
    await this.inventoryService.checkUpsert(
      req.tasks,
      input.id,
      'INBCU',
      'INBCC',
    )
    const result = await this.inventoryService.upsertInventoryBranch(input, req)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.SuperAdmin))
  @Mutation(() => common.MutationInventoryResponse, {
    name: 'deleteInventoryBranch',
  })
  async deleteInventoryBranch(
    @Args('id') id: string,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.MutationInventoryResponse> {
    const logctx = logContext(InventoryResolver, this.deleteInventoryBranch)
    this.loggers.debug({ id }, logctx)
    const result = await this.inventoryService.deleteInventoryBranch(id, req)
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
  @Mutation(() => common.MutationInventoryResponse, {
    name: 'deleteInventoryType',
  })
  async deleteInventoryType(
    @Args('id') id: string,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.MutationInventoryResponse> {
    const logctx = logContext(InventoryResolver, this.deleteInventoryType)
    this.loggers.debug({ id }, logctx)
    const result = await this.inventoryService.deleteInventoryType(id, req)
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
    await this.inventoryService.checkUpsert(
      req.tasks,
      undefined,
      'INUP',
      'INCP',
    )
    const result = await this.inventoryService.uploadInventory(input, req)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.SuperAdmin))
  @Mutation(() => common.RecoveryHardDeletedResponse, {
    name: 'recoveryHardDeleted',
  })
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
