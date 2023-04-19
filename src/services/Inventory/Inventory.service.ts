import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common'
import { Logger } from '@nestjs/common'
import * as jwt from 'jsonwebtoken'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { createHash } from 'crypto'
import { HttpService } from '@nestjs/axios'
import { logContext } from 'src/common/helpers/log'
import { url } from 'inspector'
import { firstValueFrom } from 'rxjs'
import * as common from 'src/types'

import { v4 as uuidv4 } from 'uuid'
@Injectable()
export class InventoryService implements OnModuleInit {
  private readonly loggers = new Logger(InventoryService.name)

  constructor(private readonly repos: PrismaService) {}
  onModuleInit() {}
  async getInventories(
    params: common.ParamsInventory,
  ): Promise<common.Inventory[]> {
    const logctx = logContext(InventoryService, this.getInventories)
    const { search, limit, offset } = params
    try {
      const result = await this.repos.inventory.findMany({
        where: {
          deleted: false,
          name: { contains: search },
        },
        take: limit ?? 20,
        skip: offset ?? 0,
        orderBy: {
          createdAt: 'desc',
        },
      })
      this.loggers.debug({ result }, logctx)
      return result
    } catch (error) {
      this.loggers.error(error, `[MarchERR] Select Categories error`, logctx)
      throw new HttpException('Internal Error', 500)
    }
  }

  async getInventory(id: string): Promise<common.Inventory> {
    const logctx = logContext(InventoryService, this.getInventory)
    try {
      const result = await this.repos.inventory.findUnique({
        where: {
          id,
        },
      })
      this.loggers.debug({ result }, logctx)
      return result
    } catch (error) {
      this.loggers.error(error, `[MarchERR] Select Categories error`, logctx)
      throw new HttpException('Internal Error', 500)
    }
  }

  async getInventoryTypes(): Promise<common.InventoryType[]> {
    const logctx = logContext(InventoryService, this.getInventoryTypes)
    try {
      const result = await this.repos.inventoryType.findMany({
        where: {
          deleted: false,
        },
      })
      this.loggers.debug({ result }, logctx)
      return result
    } catch (error) {
      this.loggers.error(error, `[MarchERR] Select Categories error`, logctx)
      throw new HttpException('Internal Error', 500)
    }
  }

  async getInventoryType(id: string): Promise<common.InventoryType> {
    const logctx = logContext(InventoryService, this.getInventoryType)
    try {
      const result = await this.repos.inventoryType.findUnique({
        where: {
          id,
        },
      })
      this.loggers.debug({ result }, logctx)
      return result
    } catch (error) {
      this.loggers.error(error, `[MarchERR] Select Categories error`, logctx)
      throw new HttpException('Internal Error', 500)
    }
  }

  async getBrandTypes(): Promise<common.InventoryType[]> {
    const logctx = logContext(InventoryService, this.getBrandTypes)
    try {
      const result = await this.repos.brandType.findMany({
        where: {
          deleted: false,
        },
      })
      this.loggers.debug({ result }, logctx)
      return result
    } catch (error) {
      this.loggers.error(error, `[MarchERR] Select Brand error`, logctx)
      throw new HttpException('Internal Error', 500)
    }
  }

  async getBrandType(id: string): Promise<common.InventoryType> {
    const logctx = logContext(InventoryService, this.getBrandType)
    try {
      const result = await this.repos.brandType.findUnique({
        where: {
          id,
        },
      })
      this.loggers.debug({ result }, logctx)
      return result
    } catch (error) {
      this.loggers.error(error, `[MarchERR] Select Brand error`, logctx)
      throw new HttpException('Internal Error', 500)
    }
  }

  async deleteInventory(id: string): Promise<common.ResponseInventory> {
    const logctx = logContext(InventoryService, this.deleteInventory)
    try {
      const result = await this.repos.inventory.update({
        where: {
          id,
        },
        data: {
          deleted: true,
        },
        select: {
          id: true,
        },
      })
      this.loggers.debug({ result }, logctx)
      return result
    } catch (error) {
      this.loggers.error(error, `[MarchERR] Select Categories error`, logctx)
      throw new HttpException('Internal Error', 500)
    }
  }
  async deleteInventoryType(id: string): Promise<common.ResponseInventory> {
    const logctx = logContext(InventoryService, this.deleteInventoryType)
    try {
      const result = await this.repos.inventoryType.update({
        where: {
          id,
        },
        data: {
          deleted: true,
        },
        select: {
          id: true,
        },
      })
      this.loggers.debug({ result }, logctx)
      return result
    } catch (error) {
      this.loggers.error(error, `[MarchERR] Select Categories error`, logctx)
      throw new HttpException('Internal Error', 500)
    }
  }
  async deleteBrandType(id: string): Promise<common.ResponseBrand> {
    const logctx = logContext(InventoryService, this.deleteBrandType)
    try {
      const result = await this.repos.brandType.update({
        where: {
          id,
        },
        data: {
          deleted: true,
        },
        select: {
          id: true,
        },
      })
      this.loggers.debug({ result }, logctx)
      return result
    } catch (error) {
      this.loggers.error(error, `[MarchERR] Select Categories error`, logctx)
      throw new HttpException('Internal Error', 500)
    }
  }

  async upsertInventory(
    req: common.UpsertInventoryInput,
  ): Promise<common.ResponseInventory> {
    const logctx = logContext(InventoryService, this.upsertInventory)
    const {
      id,
      name,
      amount,
      price,
      description,
      expiryDate,
      inventoryTypeId,
      brandTypeId,
      createdBy,
    } = req
    try {
      const findDup = await this.repos.inventory.findFirst({
        where: {
          name,
        },
        select: {
          id: true,
        },
      })

      if (findDup)
        throw new HttpException('Name is duplicated', HttpStatus.BAD_REQUEST)

      const result = await this.repos.inventory.upsert({
        where: {
          id: id || uuidv4(),
        },
        create: {
          name,
          amount,
          InventoryTypeId: inventoryTypeId,
          BrandTypeId: brandTypeId,
          price,
          expiryDate,
          description,
          deleted: false,
          createdBy,
          updatedBy: createdBy,
        },
        select: {
          id: true,
        },
        update: {
          id,
          name,
          description,
          deleted: false,
          createdBy,
          updatedBy: createdBy,
        },
      })
      this.loggers.debug({ result }, logctx)

      return {
        id: result.id,
      }
    } catch (error) {
      this.loggers.debug({ error }, logctx)
      this.loggers.error(error, `[MarchERR] Create Categoriy error`, logctx)
      throw new HttpException(error.message, error.status)
    }
  }
  async upsertInventoryType(
    req: common.UpsertInventoryTypeInput,
  ): Promise<common.ResponseInventory> {
    const logctx = logContext(InventoryService, this.upsertInventory)
    const { id, name, description, createdBy } = req
    try {
      const findDup = await this.repos.inventoryType.findFirst({
        where: {
          name,
        },
        select: {
          id: true,
        },
      })

      if (findDup)
        throw new HttpException('Name is duplicated', HttpStatus.BAD_REQUEST)

      const result = await this.repos.inventoryType.upsert({
        where: {
          id: id || uuidv4(),
        },
        create: {
          name,
          description,
          deleted: false,
          createdBy,
          updatedBy: createdBy,
        },
        select: {
          id: true,
        },
        update: {
          id,
          name,
          description,
          deleted: false,
          createdBy,
          updatedBy: createdBy,
        },
      })
      this.loggers.debug({ result }, logctx)

      return {
        id: result.id,
      }
    } catch (error) {
      this.loggers.debug({ error }, logctx)
      this.loggers.error(error, `[MarchERR] Create Categoriy error`, logctx)
      throw new HttpException(error.message, error.status)
    }
  }

  async upsertBrandType(
    req: common.UpsertBrandTypeInput,
  ): Promise<common.ResponseBrand> {
    const logctx = logContext(InventoryService, this.upsertBrandType)
    const { id, name, description, createdBy } = req
    try {
      const findDup = await this.repos.brandType.findFirst({
        where: {
          name,
        },
        select: {
          id: true,
        },
      })

      if (findDup)
        throw new HttpException('Name is duplicated', HttpStatus.BAD_REQUEST)

      const result = await this.repos.brandType.upsert({
        where: {
          id: id || uuidv4(),
        },
        create: {
          name,
          description,
          deleted: false,
          createdBy,
          updatedBy: createdBy,
        },
        select: {
          id: true,
        },
        update: {
          id,
          name,
          description,
          deleted: false,
          createdBy,
          updatedBy: createdBy,
        },
      })
      this.loggers.debug({ result }, logctx)

      return {
        id: result.id,
      }
    } catch (error) {
      this.loggers.debug({ error }, logctx)
      this.loggers.error(error, `[MarchERR] Create Categoriy error`, logctx)
      throw new HttpException(error.message, error.status)
    }
  }
}
