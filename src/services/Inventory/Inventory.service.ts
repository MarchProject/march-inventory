import {
  HttpException,
  HttpStatus,
  Injectable,
  OnModuleInit,
} from '@nestjs/common'
import { Logger } from '@nestjs/common'
import { PrismaService } from 'src/common/prisma/prisma.service'
import { logContext } from 'src/common/helpers/log'
import * as common from 'src/types'
import { v4 as uuidv4 } from 'uuid'
import { ICurrentUser } from 'src/common/helpers/user'

@Injectable()
export class InventoryService implements OnModuleInit {
  private readonly loggers = new Logger(InventoryService.name)

  constructor(private readonly repos: PrismaService) {}
  onModuleInit() {}

  async getInventories(
    params: common.ParamsInventory,
    req: ICurrentUser,
  ): Promise<common.ResponseInventories> {
    const logctx = logContext(InventoryService, this.getInventories)
    const { search, limit, pageNo, type, brand } = params
    const { shopsId } = req
    const _pageNo = pageNo ?? 1
    const offset = _pageNo * limit - limit ?? undefined
    const skip = offset ?? 0
    console.log({ _pageNo, offset, skip })
    const whereCondition = {
      deleted: false,
      name: { contains: search },

      inventoryType: type
        ? {
            id: type,
          }
        : {},
      brandType: brand
        ? {
            id: brand,
          }
        : {},
      shopsId,
    }
    try {
      const result = await this.repos.inventory.findMany({
        where: whereCondition,
        take: limit ?? 30,
        skip: offset ?? 0,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          brandType: {
            select: {
              id: true,
              name: true,
            },
          },
          inventoryType: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
      const totalRow = await this.repos.inventory.count({
        where: whereCondition,
      })
      this.loggers.debug({ result }, logctx)
      const totalPage = Math.ceil(totalRow / limit)
      return {
        inventories: result,
        pageLimit: limit,
        pageNo,
        totalPage,
        totalRow,
      }
    } catch (error) {
      this.loggers.error(error, `[MarchERR] Select Categories error`, logctx)
      throw new HttpException('Internal Error', 500)
    }
  }

  async getInventory(id: string, req: ICurrentUser): Promise<common.Inventory> {
    const logctx = logContext(InventoryService, this.getInventory)
    try {
      const result = await this.repos.inventory.findUnique({
        where: {
          id,
        },
      })

      if (req.shopsId !== result.shopsId) {
        return null
      }
      this.loggers.debug({ result }, logctx)
      return result
    } catch (error) {
      console.log({ error: error.status })
      this.loggers.error(error, `[MarchERR] Select Categories error`, logctx)
      throw new HttpException('Internal Error', 500)
    }
  }

  async getInventoryTypes(req: ICurrentUser): Promise<common.InventoryType[]> {
    const logctx = logContext(InventoryService, this.getInventoryTypes)
    try {
      const result = await this.repos.inventoryType.findMany({
        where: {
          deleted: false,
          shopsId: req.shopsId,
        },
      })

      this.loggers.debug({ result }, logctx)

      return result
    } catch (error) {
      this.loggers.error(error, `[MarchERR] Select Categories error`, logctx)
      throw new HttpException('Internal Error', 500)
    }
  }

  async getInventoryType(
    id: string,
    req: ICurrentUser,
  ): Promise<common.InventoryType> {
    const logctx = logContext(InventoryService, this.getInventoryType)
    try {
      const result = await this.repos.inventoryType.findUnique({
        where: {
          id,
        },
      })
      if (req.shopsId !== result.shopsId) {
        return null
      }
      return result
    } catch (error) {
      this.loggers.error(error, `[MarchERR] Select Categories error`, logctx)
      throw new HttpException('Internal Error', 500)
    }
  }

  async getBrandTypes(req: ICurrentUser): Promise<common.InventoryType[]> {
    const logctx = logContext(InventoryService, this.getBrandTypes)
    try {
      const result = await this.repos.brandType.findMany({
        where: {
          deleted: false,
          shopsId: req.shopsId,
        },
      })
      this.loggers.debug({ result }, logctx)
      return result
    } catch (error) {
      this.loggers.error(error, `[MarchERR] Select Brand error`, logctx)
      throw new HttpException('Internal Error', 500)
    }
  }

  async getBrandType(
    id: string,
    req: ICurrentUser,
  ): Promise<common.InventoryType> {
    const logctx = logContext(InventoryService, this.getBrandType)
    try {
      const result = await this.repos.brandType.findUnique({
        where: {
          id,
        },
      })
      if (req.shopsId !== result.shopsId) {
        return null
      }
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
  async deleteBrandType(
    id: string,
    req: ICurrentUser,
  ): Promise<common.ResponseBrand> {
    const logctx = logContext(InventoryService, this.deleteBrandType)
    try {
      const checkShopId = await this.repos.brandType.findUnique({
        where: {
          id,
        },
        select: {
          shopsId: true,
        },
      })
      if (checkShopId.shopsId !== req.shopsId) {
        throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST)
      }
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
    input: common.UpsertInventoryInput,
    req: ICurrentUser,
  ): Promise<common.ResponseInventory> {
    const logctx = logContext(InventoryService, this.upsertInventory)
    const { shopsId } = req
    console.log({ shopsId })
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
    } = input
    try {
      const removeDel = await this.repos.inventory.findFirst({
        where: {
          shopsId,
          name: name + '|' + shopsId,
          deleted: true,
        },
        select: {
          id: true,
        },
      })
      if (removeDel) {
        const updateDelete = await this.repos.inventory.update({
          where: {
            id: removeDel.id,
          },
          data: {
            deleted: false,
          },
          select: {
            id: true,
          },
        })

        return { id: updateDelete.id }
      }
      const checkInventoryType = await this.repos.inventoryType.findUnique({
        where: {
          id: inventoryTypeId,
        },
        select: {
          shopsId: true,
        },
      })
      const checkBrandType = await this.repos.brandType.findUnique({
        where: {
          id: brandTypeId,
        },
        select: {
          shopsId: true,
        },
      })
      if (
        checkInventoryType.shopsId !== shopsId ||
        checkBrandType.shopsId !== shopsId
      ) {
        throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST)
      }

      const findDup = await this.repos.inventory.findFirst({
        where: {
          name: name + '|' + shopsId,
          shopsId,
        },
        select: {
          id: true,
          shopsId: true,
        },
      })
      if (!id && findDup) {
        throw new HttpException('Duplicated Name', HttpStatus.BAD_REQUEST)
      }
      if (id && findDup && id !== findDup.id) {
        throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST)
      }

      const result = await this.repos.inventory.upsert({
        where: {
          id: id || uuidv4(),
        },
        create: {
          name: name + '|' + shopsId,
          amount,
          InventoryTypeId: inventoryTypeId,
          BrandTypeId: brandTypeId,
          price,
          expiryDate,
          shopsId,
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
          name: name + '|' + shopsId,
          amount,
          price,
          InventoryTypeId: inventoryTypeId,
          BrandTypeId: brandTypeId,
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
    input: common.UpsertInventoryTypeInput,
    req: ICurrentUser,
  ): Promise<common.ResponseInventory> {
    const logctx = logContext(InventoryService, this.upsertInventoryType)
    const { id, name, description, createdBy } = input
    const { shopsId } = req
    try {
      const removeDel = await this.repos.inventoryType.findFirst({
        where: {
          shopsId,
          name: name + '|' + shopsId,
          deleted: true,
        },
        select: {
          id: true,
        },
      })
      if (removeDel) {
        const updateDelete = await this.repos.inventoryType.update({
          where: {
            id: removeDel.id,
          },
          data: {
            deleted: false,
          },
          select: {
            id: true,
          },
        })

        return { id: updateDelete.id }
      }
      const findDup = await this.repos.inventoryType.findFirst({
        where: {
          name: name + '|' + shopsId,
          shopsId,
        },
        select: {
          id: true,
          shopsId: true,
        },
      })
      if (!id && findDup) {
        throw new HttpException('Duplicated Name', HttpStatus.BAD_REQUEST)
      }
      if (id && findDup && id !== findDup.id) {
        throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST)
      }

      const result = await this.repos.inventoryType.upsert({
        where: {
          id: id || uuidv4(),
        },
        create: {
          name: name + '|' + shopsId,
          description,
          shopsId,
          deleted: false,
          createdBy,
          updatedBy: createdBy,
        },
        select: {
          id: true,
        },
        update: {
          id,
          name: name + '|' + shopsId,
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
    input: common.UpsertBrandTypeInput,
    req: ICurrentUser,
  ): Promise<common.ResponseBrand> {
    const logctx = logContext(InventoryService, this.upsertBrandType)
    const { id, name, description, createdBy } = input
    const { shopsId } = req
    try {
      const removeDel = await this.repos.brandType.findFirst({
        where: {
          shopsId,
          name: name + '|' + shopsId,
          deleted: true,
        },
        select: {
          id: true,
        },
      })
      if (removeDel) {
        const updateDelete = await this.repos.brandType.update({
          where: {
            id: removeDel.id,
          },
          data: {
            deleted: false,
          },
          select: {
            id: true,
          },
        })

        return { id: updateDelete.id }
      }

      const findDup = await this.repos.brandType.findFirst({
        where: {
          name: name + '|' + shopsId,
          shopsId,
        },
        select: {
          id: true,
        },
      })

      if (!id && findDup) {
        throw new HttpException('Duplicated Name', HttpStatus.BAD_REQUEST)
      }
      if (id && findDup && id !== findDup.id) {
        throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST)
      }

      const result = await this.repos.brandType.upsert({
        where: {
          id: id || uuidv4(),
        },
        create: {
          shopsId,
          name: name + '|' + shopsId,
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
          name: name + '|' + shopsId,
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
