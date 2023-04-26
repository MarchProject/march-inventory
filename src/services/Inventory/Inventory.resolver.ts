import {
  Resolver,
  Mutation,
  Args,
  Query,
} from '@nestjs/graphql'
import {
  Inject,
  Logger,
  UseGuards,
} from '@nestjs/common'
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

  @UseGuards(new UserAuthGuard(uamAuthRole.Admin))
  @Query(() => [common.Inventory], { name: 'getInventories' })
  async getInventories(
    @Args('params') params: common.ParamsInventory,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.Inventory[]> {
    const logctx = logContext(InventoryResolver, this.getInventories)
    const result = await this.inventoryService.getInventories(params, req)
    this.loggers.debug({ result }, logctx)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.Admin))
  @Query(() => [common.Inventory], { name: 'getInventory' })
  async getInventory(
    @Args('id') id: string,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.Inventory> {
    const logctx = logContext(InventoryResolver, this.getInventories)
    const result = await this.inventoryService.getInventory(id, req)
    this.loggers.debug({ result }, logctx)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.Admin))
  @Query(() => [common.Inventory], { name: 'getInventoryTypes' })
  async getInventoryTypes(
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.InventoryType[]> {
    const logctx = logContext(InventoryResolver, this.getInventories)
    const result = await this.inventoryService.getInventoryTypes(req)
    this.loggers.debug({ result }, logctx)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.Admin))
  @Query(() => [common.Inventory], { name: 'getInventoryType' })
  async getInventoryType(
    @Args('id') id: string,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.InventoryType> {
    const logctx = logContext(InventoryResolver, this.getInventories)
    const result = await this.inventoryService.getInventoryType(id, req)
    this.loggers.debug({ result }, logctx)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.Admin))
  @Query(() => [common.Inventory], { name: 'getBrandTypes' })
  async getBrandTypes(
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.BrandType[]> {
    const logctx = logContext(InventoryResolver, this.getBrandTypes)
    const result = await this.inventoryService.getBrandTypes(req)
    this.loggers.debug({ result }, logctx)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.Admin))
  @Query(() => [common.Inventory], { name: 'getBrandType' })
  async getBrandType(
    @Args('id') id: string,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.BrandType> {
    const logctx = logContext(InventoryResolver, this.getBrandType)
    const result = await this.inventoryService.getBrandType(id, req)
    this.loggers.debug({ result }, logctx)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.Admin))
  @Mutation(() => String, { name: 'upsertInventory' })
  async upsertInventory(
    @Args('input') input: common.UpsertInventoryInput,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.ResponseInventory> {
    const logctx = logContext(InventoryResolver, this.upsertInventory)
    this.loggers.debug({ req }, logctx)
    const result = await this.inventoryService.upsertInventory(input, req)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.Admin))
  @Mutation(() => String, { name: 'upsertInventoryType' })
  async upsertInventoryType(
    @Args('input') input: common.UpsertInventoryTypeInput,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.ResponseInventory> {
    const logctx = logContext(InventoryResolver, this.upsertInventoryType)
    this.loggers.debug({ input }, logctx)
    const result = await this.inventoryService.upsertInventoryType(input, req)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.Admin))
  @Mutation(() => String, { name: 'upsertBrandType' })
  async upsertBrandType(
    @Args('input') input: common.UpsertBrandTypeInput,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.ResponseBrand> {
    const logctx = logContext(InventoryResolver, this.upsertBrandType)
    this.loggers.debug({ input }, logctx)
    const result = await this.inventoryService.upsertBrandType(input, req)
    return result
  }

  @UseGuards(new UserAuthGuard(uamAuthRole.Admin))
  @Mutation(() => String, { name: 'deleteBrandType' })
  async deleteBrandType(
    @Args('id') id: string,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.ResponseBrand> {
    const logctx = logContext(InventoryResolver, this.deleteBrandType)
    this.loggers.debug({ id }, logctx)
    const result = await this.inventoryService.deleteBrandType(id, req)
    return result
  }

  @Mutation(() => String, { name: 'deleteInventory' })
  async deleteInventory(
    @Args('id') id: string,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.ResponseInventory> {
    const logctx = logContext(InventoryResolver, this.deleteInventory)
    this.loggers.debug({ id }, logctx)
    const result = await this.inventoryService.deleteInventory(id)
    return result
  }

  @Mutation(() => String, { name: 'deleteInventoryType' })
  async deleteInventoryType(
    @Args('id') id: string,
    @CurrentUser() req: ICurrentUser,
  ): Promise<common.ResponseInventory> {
    const logctx = logContext(InventoryResolver, this.deleteInventoryType)
    this.loggers.debug({ id }, logctx)
    const result = await this.inventoryService.deleteInventoryType(id)
    return result
  }
}
