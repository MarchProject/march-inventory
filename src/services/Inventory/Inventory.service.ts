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
import { mapFunction } from '@march/core'
import { get } from 'lodash'
import { tranfromUploadCsv } from './inventory.dto'

@Injectable()
export class InventoryService implements OnModuleInit {
  private readonly loggers = new Logger(InventoryService.name)

  constructor(private readonly repos: PrismaService) {}
  onModuleInit() {}

  async getInventoryNames(req: ICurrentUser): Promise<common.InventoryName[]> {
    const logctx = logContext(InventoryService, this.getInventories)
    const { shopsId, userId } = req
    try {
      const result = await this.repos.inventory.findMany({
        where: { shopsId: shopsId },
        select: {
          id: true,
          name: true,
        },
      })

      return result
    } catch (error) {
      this.loggers.error(error, `[MarchERR] getInventoryNames error`, logctx)
      throw new HttpException('Internal Error', 500)
    }
  }

  async getInventories(
    params: common.ParamsInventory,
    req: ICurrentUser,
  ): Promise<common.ResponseInventories> {
    const logctx = logContext(InventoryService, this.getInventories)
    const { search, limit, pageNo, type, brand, favorite } = params
    const { shopsId, userId } = req
    const _pageNo = pageNo ?? 1
    const offset = _pageNo * limit - limit ?? undefined
    const skip = offset ?? 0
    const brandIds = mapFunction(brand, 'id')
    const typeIds = mapFunction(type, 'id')
    console.log({ _pageNo, offset, skip, search, userId })

    const whereCondition = {
      deleted: false,
      name: { contains: `%${search}%|%` },
      favorite: favorite === common.FavoriteStatus.LIKE ? true : undefined,
      inventoryType:
        typeIds.length > 0
          ? {
              OR: typeIds,
            }
          : {},
      brandType:
        brandIds.length > 0
          ? {
              OR: brandIds,
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
      const totalPage = Math.ceil(totalRow / limit)
      this.loggers.debug({ result: result.length, limit, totalPage }, logctx)

      return {
        inventories: result,
        pageLimit: limit,
        pageNo,
        totalPage,
        totalRow,
      }
    } catch (error) {
      this.loggers.error(error, `[MarchERR] getInventories error`, logctx)
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

      if (req.shopsId !== result.shopsId) {
        return null
      }
      this.loggers.debug({ result }, logctx)
      return result
    } catch (error) {
      console.log({ error: error.status })
      this.loggers.error(error, `[MarchERR] getInventories error`, logctx)
      throw new HttpException('Internal Error', 500)
    }
  }

  async getInventoryTypes(
    req: ICurrentUser,
    params: common.ParamsInventoryType,
  ): Promise<common.InventoryType[]> {
    const logctx = logContext(InventoryService, this.getInventoryTypes)
    try {
      const { search, limit, offset } = params
      const result = await this.repos.inventoryType.findMany({
        where: {
          name: {
            contains: search.split('|')[0],
          },
          deleted: false,
          shopsId: req.shopsId,
        },
        skip: offset,
        take: limit,
      })

      this.loggers.debug({ result }, logctx)

      return result
    } catch (error) {
      this.loggers.error(error, `[MarchERR] getInventoryTypes error`, logctx)
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
      this.loggers.error(error, `[MarchERR] getInventoryType error`, logctx)
      throw new HttpException('Internal Error', 500)
    }
  }

  async getBrandTypes(
    req: ICurrentUser,
    params: common.ParamsInventoryBrand,
  ): Promise<common.InventoryType[]> {
    const logctx = logContext(InventoryService, this.getBrandTypes)
    try {
      const { search, limit, offset } = params

      const result = await this.repos.brandType.findMany({
        where: {
          name: {
            contains: search.split('|')[0],
          },
          deleted: false,
          shopsId: req.shopsId,
        },
        skip: offset,
        take: limit,
      })
      this.loggers.debug({ result }, logctx)
      return result
    } catch (error) {
      this.loggers.error(error, `[MarchERR] getBrandTypes error`, logctx)
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
      this.loggers.error(error, `[MarchERR] getBrandType error`, logctx)
      throw new HttpException('Internal Error', 500)
    }
  }

  async deleteInventory(
    id: string,
    req: ICurrentUser,
  ): Promise<common.ResponseInventory> {
    const logctx = logContext(InventoryService, this.deleteInventory)
    try {
      const checkShopId = await this.repos.inventory.findUnique({
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
      this.loggers.error(error, `[MarchERR] deleteInventory error`, logctx)
      throw new HttpException('Internal Error', 500)
    }
  }
  async deleteInventoryType(
    id: string,
    req: ICurrentUser,
  ): Promise<common.ResponseInventory> {
    const logctx = logContext(InventoryService, this.deleteInventoryType)
    try {
      const checkShopId = await this.repos.inventoryType.findUnique({
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
      const type = await this.repos.inventory.findMany({
        where: {
          InventoryTypeId: id,
        },
      })
      if (type.length > 0) {
        throw new HttpException('BADHAVETYPE', 400)
      }
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
      this.loggers.error(error, `[MarchERR] deleteInventoryType error`, logctx)
      throw new HttpException(error.message, error.status)
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
      const type = await this.repos.inventory.findMany({
        where: {
          BrandTypeId: id,
        },
      })
      if (type.length > 0) {
        throw new HttpException('Bad request', 400)
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
      this.loggers.error(error, `[MarchERR] deleteBrandType error`, logctx)
      throw new HttpException(
        get(error, 'message', 'Internal Error'),
        get(error, 'status', 500),
      )
    }
  }

  async upsertInventory(
    input: common.UpsertInventoryInput,
    req: ICurrentUser,
  ): Promise<common.ResponseInventory> {
    const logctx = logContext(InventoryService, this.upsertInventory)
    const { shopsId, userId, userName } = req
    console.log({ shopsId })
    const {
      id,
      name,
      amount,
      price,
      size,
      priceMember,
      sku,
      reorderLevel,
      favorite,
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
      const width = get(size, 'width', '0')
      const length = get(size, 'length', '0')
      const height = get(size, 'height', '0')
      const weight = get(size, 'weight', '0')
      const _size = `${width}|${length}|${height}|${weight}`
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
          priceMember,
          reorderLevel,
          sku,
          favorite,
          size: _size,
          expiryDate,
          shopsId,
          description,
          deleted: false,
          createdBy: userName,
          updatedBy: userName,
        },
        select: {
          id: true,
        },
        update: {
          id,
          name: name + '|' + shopsId,
          amount,
          InventoryTypeId: inventoryTypeId,
          BrandTypeId: brandTypeId,
          price,
          favorite,
          priceMember,
          reorderLevel,
          sku,
          size: _size,
          expiryDate,
          shopsId,
          description,
          deleted: false,
          createdBy: userName,
          updatedBy: userName,
        },
      })
      this.loggers.debug({ result }, logctx)

      return {
        id: result.id,
      }
    } catch (error) {
      this.loggers.debug({ error }, logctx)
      this.loggers.error(error, `[MarchERR] upsertInventory error`, logctx)
      throw new HttpException(
        get(error, 'message', 'Internal Error'),
        get(error, 'status', 500),
      )
    }
  }

  async upsertInventoryType(
    input: common.UpsertInventoryTypeInput,
    req: ICurrentUser,
  ): Promise<common.ResponseInventory> {
    const logctx = logContext(InventoryService, this.upsertInventoryType)
    const { id, name, description, createdBy } = input
    const { shopsId, userId, userName } = req
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
          createdBy: userName,
          updatedBy: userName,
        },
        select: {
          id: true,
        },
        update: {
          id,
          name: name + '|' + shopsId,
          description,
          deleted: false,
          updatedBy: userName,
        },
      })
      this.loggers.debug({ result }, logctx)

      return {
        id: result.id,
      }
    } catch (error) {
      this.loggers.debug({ error }, logctx)
      this.loggers.error(error, `[MarchERR] upsertInventoryType error`, logctx)
      throw new HttpException(
        get(error, 'message', 'Internal Error'),
        get(error, 'status', 500),
      )
    }
  }

  async upsertBrandType(
    input: common.UpsertBrandTypeInput,
    req: ICurrentUser,
  ): Promise<common.ResponseBrand> {
    const logctx = logContext(InventoryService, this.upsertBrandType)
    const { id, name, description, createdBy } = input
    const { shopsId, userId, userName } = req
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
          createdBy: userName,
          updatedBy: userName,
        },
        select: {
          id: true,
        },
        update: {
          id,
          name: name + '|' + shopsId,
          description,
          deleted: false,
          updatedBy: userName,
        },
      })
      this.loggers.debug({ result }, logctx)

      return {
        id: result.id,
      }
    } catch (error) {
      this.loggers.debug({ error }, logctx)
      this.loggers.error(error, `[MarchERR] upsertBrandType error`, logctx)
      throw new HttpException(
        get(error, 'message', 'Internal Error'),
        get(error, 'status', 500),
      )
    }
  }

  async favoriteInventory(
    id: string,
    req: ICurrentUser,
  ): Promise<common.ResponseBrand> {
    const logctx = logContext(InventoryService, this.favoriteInventory)
    try {
      const checkShopId = await this.repos.inventory.findUnique({
        where: {
          id,
        },
        select: {
          shopsId: true,
          favorite: true,
        },
      })
      if (checkShopId.shopsId !== req.shopsId) {
        throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST)
      }
      const result = await this.repos.inventory.update({
        where: {
          id,
        },
        data: {
          favorite: !checkShopId.favorite,
        },
        select: {
          id: true,
        },
      })
      this.loggers.debug({ result }, logctx)
      return result
    } catch (error) {
      this.loggers.error(error, `[MarchERR] favoriteInventory error`, logctx)
      throw new HttpException(
        get(error, 'message', 'Internal Error'),
        get(error, 'status', 500),
      )
    }
  }

  async uploadInventory(
    input: common.UploadInventoryInput,
    req: ICurrentUser,
  ): Promise<common.UploadInventoryResponse> {
    const logctx = logContext(InventoryService, this.uploadInventory)
    const { uploadDatas, fileName } = input
    const { shopsId, userName } = req
    try {
      const checkNames = await this.repos.inventoryFile.findFirst({
        where: {
          name: fileName + '|' + shopsId,
          shopsId: shopsId,
        },
      })
      if (checkNames) {
        return {
          id: '',
          success: false,
          reason: 'Duplicated Filename. Upload again.',
        }
      }
      const createFile = await this.repos.inventoryFile.create({
        data: {
          name: fileName + '|' + shopsId,
          shopsId,
          createdBy: userName,
          updatedBy: userName,
        },
        select: {
          id: true,
        },
      })
      if (!createFile) {
        throw new HttpException(
          'Internal Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }
      const datasTranFrom = tranfromUploadCsv(
        uploadDatas,
        shopsId,
        userName,
        createFile.id,
      )
      try {
        const uploadFiles = await this.repos.inventory.createMany({
          data: datasTranFrom,
          skipDuplicates: true,
        })
        return {
          id: uploadFiles.count !== datasTranFrom.length ? '' : createFile.id,
          success: uploadFiles.count !== datasTranFrom.length ? false : true,
          reason:
            uploadFiles.count !== datasTranFrom.length
              ? 'maybe some item lost. Please download result csv to check.'
              : '',
        }
      } catch (error) {
        await this.repos.inventory.deleteMany({
          where: {
            InventoryFileId: createFile.id,
          },
        })
        await this.repos.inventoryFile.delete({
          where: {
            id: createFile.id,
          },
        })
        return {
          id: createFile.id,
          success: false,
          reason: 'Upload Failed. Upload again',
        }
      }
    } catch (error) {
      this.loggers.error(error, `[MarchERR] favoriteInventory error`, logctx)
      throw new HttpException(
        get(error, 'message', 'Internal Error'),
        get(error, 'status', 500),
      )
    }
  }
}
