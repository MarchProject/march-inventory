import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql'
import { Inject, Logger, UseGuards } from '@nestjs/common'
import { logContext } from 'src/common/helpers/log'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { InventoryService } from './Inventory.service'
import { AuthGuard } from '@nestjs/passport'
import * as common from 'src/types'
import { UserAuthGuard, uamAuthRole } from '@march/core'
// import { AuthService } from './auth.service';

@Resolver(() => common.Inventory)
export class InventoryResolver {
  private readonly loggers = new Logger(InventoryResolver.name)

  constructor() {}
  @Inject(InventoryService) private inventoryService: InventoryService

  @UseGuards(new UserAuthGuard(uamAuthRole.Admin))
  @Query(() => [common.Inventory], { name: 'getInventories' })
  async getInventories(
    @Args('params') params: common.ParamsInventory,
  ): Promise<common.Inventory[]> {
    console.log({ params })
    const logctx = logContext(InventoryResolver, this.getInventories)
    const result = await this.inventoryService.getInventories(params)
    this.loggers.debug({ result }, logctx)

    return result
  }

  @Query(() => [common.Inventory], { name: 'getInventory' })
  async getInventory(@Args('id') id: string): Promise<common.Inventory> {
    const logctx = logContext(InventoryResolver, this.getInventories)
    const result = await this.inventoryService.getInventory(id)
    this.loggers.debug({ result }, logctx)

    return result
  }

  @Query(() => [common.Inventory], { name: 'getInventoryTypes' })
  async getInventoryTypes(): Promise<common.InventoryType[]> {
    const logctx = logContext(InventoryResolver, this.getInventories)
    const result = await this.inventoryService.getInventoryTypes()
    this.loggers.debug({ result }, logctx)

    return result
  }

  @Query(() => [common.Inventory], { name: 'getInventoryType' })
  async getInventoryType(
    @Args('id') id: string,
  ): Promise<common.InventoryType> {
    const logctx = logContext(InventoryResolver, this.getInventories)
    const result = await this.inventoryService.getInventoryType(id)
    this.loggers.debug({ result }, logctx)

    return result
  }

  @Query(() => [common.Inventory], { name: 'getBrandTypes' })
  async getBrandTypes(): Promise<common.BrandType[]> {
    const logctx = logContext(InventoryResolver, this.getBrandTypes)
    const result = await this.inventoryService.getBrandTypes()
    this.loggers.debug({ result }, logctx)

    return result
  }

  @Query(() => [common.Inventory], { name: 'getBrandType' })
  async getBrandType(@Args('id') id: string): Promise<common.BrandType> {
    const logctx = logContext(InventoryResolver, this.getBrandType)
    const result = await this.inventoryService.getBrandType(id)
    this.loggers.debug({ result }, logctx)

    return result
  }

  @Mutation(() => String, { name: 'upsertInventory' })
  async upsertInventory(
    @Args('input') req: common.UpsertInventoryInput,
  ): Promise<common.ResponseInventory> {
    const logctx = logContext(InventoryResolver, this.upsertInventory)
    this.loggers.debug({ req }, logctx)
    const result = await this.inventoryService.upsertInventory(req)

    return result
  }

  @Mutation(() => String, { name: 'upsertInventoryType' })
  async upsertInventoryType(
    @Args('input') req: common.UpsertInventoryTypeInput,
  ): Promise<common.ResponseInventory> {
    const logctx = logContext(InventoryResolver, this.upsertInventoryType)
    this.loggers.debug({ req }, logctx)
    const result = await this.inventoryService.upsertInventoryType(req)

    return result
  }

  @Mutation(() => String, { name: 'upsertBrandType' })
  async upsertBrandType(
    @Args('input') req: common.UpsertBrandTypeInput,
  ): Promise<common.ResponseBrand> {
    const logctx = logContext(InventoryResolver, this.upsertBrandType)
    this.loggers.debug({ req }, logctx)
    const result = await this.inventoryService.upsertBrandType(req)

    return result
  }

  @Mutation(() => String, { name: 'deleteBrandType' })
  async deleteBrandType(
    @Args('id') id: string,
  ): Promise<common.ResponseBrand> {
    const logctx = logContext(InventoryResolver, this.deleteBrandType)
    this.loggers.debug({ id }, logctx)
    const result = await this.inventoryService.deleteBrandType(id)

    return result
  }

  @Mutation(() => String, { name: 'deleteInventory' })
  async deleteInventory(
    @Args('id') id: string,
  ): Promise<common.ResponseInventory> {
    const logctx = logContext(InventoryResolver, this.deleteInventory)
    this.loggers.debug({ id }, logctx)
    const result = await this.inventoryService.deleteInventory(id)

    return result
  }

  @Mutation(() => String, { name: 'deleteInventoryType' })
  async deleteInventoryType(
    @Args('id') id: string,
  ): Promise<common.ResponseInventory> {
    const logctx = logContext(InventoryResolver, this.deleteInventoryType)
    this.loggers.debug({ id }, logctx)
    const result = await this.inventoryService.deleteInventoryType(id)

    return result
  }
}
