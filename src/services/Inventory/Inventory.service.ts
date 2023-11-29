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
import { mapFunction, statusCode } from '@march/core'
import { get, isNil } from 'lodash'
import { tranfromUploadCsv } from './inventory.dto'

@Injectable()
export class InventoryService implements OnModuleInit {
  private readonly loggers = new Logger(InventoryService.name)

  constructor(private readonly repos: PrismaService) {}
  onModuleInit() {}

  async getInventoryNames(req: ICurrentUser): Promise<common.InventoryName[]> {
    const logctx = logContext(InventoryService, this.getInventoryNames)
    const { shopsId, userId } = req

    this.loggers.debug({ shopsId, userId }, logctx)

    try {
      const result = await this.repos.inventory.findMany({
        where: { shopsId: shopsId },
        select: {
          id: true,
          name: true,
        },
      })
      this.loggers.debug({ result }, logctx)

      return result
    } catch (error) {
      this.loggers.error(error, `[MarchERR] getInventoryNames error`, logctx)
      throw new HttpException(
        'Internal Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
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
    this.loggers.debug(
      { _pageNo, offset, skip, search, userId, shopsId, brandIds, typeIds },
      logctx,
    )
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
    this.loggers.debug({ whereCondition }, logctx)
    if (isNil(shopsId) || isNil(req.userName)) {
      this.loggers.debug('Unauthorized ShopId', logctx)
      throw new HttpException('Unauthorized ShopId', HttpStatus.UNAUTHORIZED)
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
      this.loggers.debug({ result, limit, totalPage }, logctx)

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

  async getInventory(
    id: string,
    req: ICurrentUser,
  ): Promise<common.ResponseDataInventory> {
    const logctx = logContext(InventoryService, this.getInventory)
    this.loggers.debug({ id, req }, logctx)
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
        this.loggers.debug('req.shopsId !== result.shopsId:153', logctx)
        return {
          data: null,
          status: statusCode.forbidden,
        }
        // throw new HttpException('FORBIDDEN', HttpStatus.FORBIDDEN)
      }
      this.loggers.debug({ result }, logctx)
      return {
        data: result,
        status: statusCode.success,
      }
    } catch (error) {
      this.loggers.error(error, `[MarchERR] getInventories error`, logctx)
      return {
        data: null,
        status: statusCode.internalError,
      }
      // throw new HttpException(
      //   get(error, 'message', 'Internal Error'),
      //   get(error, 'status', HttpStatus.INTERNAL_SERVER_ERROR),
      // )
    }
  }

  async getInventoryTypes(
    req: ICurrentUser,
    params: common.ParamsInventoryType,
  ): Promise<common.InventoryType[]> {
    const logctx = logContext(InventoryService, this.getInventoryTypes)
    try {
      const { search, limit, offset } = params
      this.loggers.debug({ params }, logctx)
      const result = await this.repos.inventoryType.findMany({
        where: {
          name: {
            contains: `%${search}%|%`,
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
    this.loggers.debug({ id, req }, logctx)
    try {
      const result = await this.repos.inventoryType.findUnique({
        where: {
          id,
        },
      })

      if (req.shopsId !== result.shopsId) {
        this.loggers.debug('req.shopsId !== result.shopsId:207', logctx)
        return null
      }
      this.loggers.debug({ result }, logctx)
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
      this.loggers.debug({ params }, logctx)
      const result = await this.repos.brandType.findMany({
        where: {
          name: {
            contains: `%${search}%|%`,
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
    this.loggers.debug({ id, req }, logctx)
    try {
      const result = await this.repos.brandType.findUnique({
        where: {
          id,
        },
      })
      if (req.shopsId !== result.shopsId) {
        this.loggers.debug('req.shopsId !== result.shopsId:259', logctx)
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
    this.loggers.debug({ id, req }, logctx)
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
        this.loggers.debug('req.shopsId !== result.shopsId:286', logctx)
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
      throw new HttpException(
        get(error, 'message', 'Internal Error'),
        get(error, 'status', HttpStatus.INTERNAL_SERVER_ERROR),
      )
    }
  }
  async deleteInventoryType(
    id: string,
    req: ICurrentUser,
  ): Promise<common.ResponseInventory> {
    const logctx = logContext(InventoryService, this.deleteInventoryType)
    this.loggers.debug({ req, id }, logctx)
    try {
      const checkShopId = await this.repos.inventoryType.findUnique({
        where: {
          id,
        },
        select: {
          shopsId: true,
        },
      })
      this.loggers.debug({ checkShopId }, logctx)
      if (checkShopId.shopsId !== req.shopsId) {
        this.loggers.debug('req.shopsId !== result.shopsId:322', logctx)
        throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST)
      }
      const type = await this.repos.inventory.findMany({
        where: {
          InventoryTypeId: id,
        },
      })
      this.loggers.debug({ type }, logctx)
      if (type.length > 0) {
        this.loggers.debug('type.length > 0', logctx)
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
    this.loggers.debug({ id, req }, logctx)
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
        this.loggers.debug('req.shopsId !== result.shopsId:371', logctx)
        throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST)
      }
      const type = await this.repos.inventory.findMany({
        where: {
          BrandTypeId: id,
        },
      })
      if (type.length > 0) {
        this.loggers.debug('type.length > 0', logctx)
        throw new HttpException('BADHAVETYPE', 400)
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
  ): Promise<common.UpsertInventoryResponse> {
    const logctx = logContext(InventoryService, this.upsertInventory)
    const { shopsId, userName } = req
    this.loggers.debug({ req }, logctx)
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
      this.loggers.debug({ checkBrandType, checkInventoryType }, logctx)
      if (
        checkInventoryType.shopsId !== shopsId ||
        checkBrandType.shopsId !== shopsId
      ) {
        this.loggers.debug('checkInventoryType.shopsId !== shopsId', logctx)
        return {
          data: null,
          status: statusCode.forbidden,
        }
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
      this.loggers.debug({ findDup }, logctx)
      if (!id && findDup) {
        return {
          data: null,
          status: statusCode.duplicated,
        }
      }
      if (id && findDup && id !== findDup.id) {
        return {
          data: null,
          status: statusCode.badRequest,
        }
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
        data: { id: result.id },
        status: statusCode.success,
      }
    } catch (error) {
      this.loggers.debug({ error }, logctx)
      this.loggers.error(error, `[MarchERR] upsertInventory error`, logctx)
      return {
        data: null,
        status: statusCode.internalError,
      }
    }
  }

  async upsertInventoryType(
    input: common.UpsertInventoryTypeInput,
    req: ICurrentUser,
  ): Promise<common.ResponseInventory> {
    const logctx = logContext(InventoryService, this.upsertInventoryType)
    const { id, name, description } = input
    const { shopsId, userName } = req
    this.loggers.debug({ input, req }, logctx)
    if (!name) {
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST)
    }
    try {
      // const removeDel = await this.repos.inventoryType.findFirst({
      //   where: {
      //     shopsId,
      //     name: name + '|' + shopsId,
      //     deleted: true,
      //   },
      //   select: {
      //     id: true,
      //   },
      // })
      // this.loggers.debug({ removeDel }, logctx)

      // if (removeDel) {
      //   const updateDelete = await this.repos.inventoryType.update({
      //     where: {
      //       id: removeDel.id,
      //     },
      //     data: {
      //       deleted: false,
      //     },
      //     select: {
      //       id: true,
      //     },
      //   })

      //   return { id: updateDelete.id }
      // }
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
      this.loggers.debug({ findDup }, logctx)
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
    const { id, name, description } = input
    const { shopsId, userName } = req

    this.loggers.debug({ input, req }, logctx)

    if (!name) {
      throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST)
    }
    try {
      // const removeDel = await this.repos.brandType.findFirst({
      //   where: {
      //     shopsId,
      //     name: name + '|' + shopsId,
      //     deleted: true,
      //   },
      //   select: {
      //     id: true,
      //   },
      // })
      // this.loggers.debug({ removeDel }, logctx)
      // if (removeDel) {
      //   const updateDelete = await this.repos.brandType.update({
      //     where: {
      //       id: removeDel.id,
      //     },
      //     data: {
      //       deleted: false,
      //     },
      //     select: {
      //       id: true,
      //     },
      //   })
      //   this.loggers.debug({ updateDelete }, logctx)

      //   return { id: updateDelete.id }
      // }

      const findDup = await this.repos.brandType.findFirst({
        where: {
          name: name + '|' + shopsId,
          shopsId,
        },
        select: {
          id: true,
        },
      })
      this.loggers.debug({ findDup }, logctx)
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
    this.loggers.debug({ req, id }, logctx)
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
      this.loggers.debug({ checkShopId, req }, logctx)
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
    this.loggers.debug({ input, req }, logctx)
    try {
      const checkNames = await this.repos.inventoryFile.findFirst({
        where: {
          name: fileName + '|' + shopsId,
          shopsId: shopsId,
        },
      })
      this.loggers.debug({ checkNames }, logctx)
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
      this.loggers.debug({ createFile }, logctx)
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
      this.loggers.debug({ datasTranFrom }, logctx)
      try {
        const uploadFiles = await this.repos.inventory.createMany({
          data: datasTranFrom,
          skipDuplicates: true,
        })
        this.loggers.debug({ uploadFiles }, logctx)

        if (uploadFiles.count !== datasTranFrom.length) {
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
            id: '',
            success: false,
            reason:
              'maybe some item lost or duplicated. Please upload csv again.',
          }
        }
        return {
          id: createFile.id,
          success: true,
          reason: '',
        }
      } catch (error) {
        this.loggers.error(error, 'uploadInventory', logctx)

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
      this.loggers.error(error, `[MarchERR] uploadInventory error`, logctx)
      throw new HttpException(
        get(error, 'message', 'Internal Error'),
        get(error, 'status', 500),
      )
    }
  }

  async getInventoryAllDeleted(
    req: ICurrentUser,
  ): Promise<common.ResponseDeletedInventory> {
    const logctx = logContext(InventoryService, this.getInventoryAllDeleted)
    this.loggers.debug({ req }, logctx)
    const { shopsId } = req
    try {
      const inventoryDeleted = await this.repos.inventory.findMany({
        where: {
          shopsId: shopsId,
          deleted: true,
        },
        select: {
          id: true,
          name: true,
          updatedAt: true,
          createdAt: true,
          createdBy: true,
          updatedBy: true,
        },
      })
      this.loggers.debug({ inventoryDeleted }, logctx)
      const typeDeleted = await this.repos.inventoryType.findMany({
        where: {
          shopsId: shopsId,
          deleted: true,
        },
        select: {
          id: true,
          name: true,
          updatedAt: true,
          updatedBy: true,
          createdAt: true,
          createdBy: true,
        },
      })
      this.loggers.debug({ typeDeleted }, logctx)
      const brandDeleted = await this.repos.brandType.findMany({
        where: {
          shopsId: shopsId,
          deleted: true,
        },
        select: {
          id: true,
          name: true,
          updatedAt: true,
          updatedBy: true,
          createdAt: true,
          createdBy: true,
        },
      })
      this.loggers.debug({ brandDeleted }, logctx)
      return {
        inventory: inventoryDeleted,
        type: typeDeleted,
        brand: brandDeleted,
      }
    } catch (error) {
      this.loggers.error(
        error,
        `[MarchERR] getInventoryAllDeleted error`,
        logctx,
      )
      throw new HttpException('Internal Error', 500)
    }
  }

  async recoveryHardDeleted(
    input: common.RecoveryHardDeletedInput,
    req: ICurrentUser,
  ): Promise<common.RecoveryHardDeleted> {
    const logctx = logContext(InventoryService, this.recoveryHardDeleted)
    this.loggers.debug({ req, input }, logctx)

    const { shopsId, userName } = req
    const { id, mode, type } = input
    if (!id) {
      throw new HttpException(
        'Bad Request id is required',
        HttpStatus.BAD_REQUEST,
      )
    }

    const checkShopId = await this.repos[type.toString()].findUnique({
      where: {
        id,
      },
      select: {
        shopsId: true,
        deleted: true,
      },
    })
    this.loggers.debug({ checkShopId }, logctx)
    try {
      if (mode === common.DeletedMode.DELETE) {
        if (checkShopId.shopsId !== shopsId || checkShopId.deleted === false) {
          throw new HttpException(
            'Bad Request id is required',
            HttpStatus.BAD_REQUEST,
          )
        }
        const deleted = await this.repos[type.toString()].delete({
          where: {
            id: id,
          },
          select: {
            id: true,
          },
        })
        this.loggers.debug({ deleted }, logctx)

        return {
          id: deleted?.id,
          type: type,
        }
      } else if (mode === common.DeletedMode.RECOVERY) {
        if (checkShopId.shopsId !== shopsId || checkShopId.deleted === false) {
          throw new HttpException(
            'Bad Request id is required',
            HttpStatus.BAD_REQUEST,
          )
        }

        const deleted = await this.repos[type.toString()].update({
          where: {
            id: id,
          },
          data: {
            deleted: false,
            updatedBy: userName,
          },
          select: {
            id: true,
          },
        })
        this.loggers.debug({ deleted }, logctx)

        return {
          id: deleted?.id,
          type: type,
          mode: mode,
        }
      }
    } catch (error) {
      this.loggers.error(error, `[MarchERR] recoveryHardDeleted error`, logctx)
      throw new HttpException(
        get(error, 'message', 'Internal Error'),
        get(error, 'status', 500),
      )
    }
  }

  async checkUpsert(
    tasks: string[],
    id: string,
    update: string,
    create: string,
  ) {
    if (id) {
      if (tasks.includes(update)) {
        return
      } else {
        throw new HttpException('Permission', HttpStatus.UNAUTHORIZED)
      }
    } else {
      if (tasks.includes(create)) {
        return
      } else {
        throw new HttpException('Permission', HttpStatus.UNAUTHORIZED)
      }
    }
  }
}
