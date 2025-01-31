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
import { Constant, mapFunction, statusCode, dayjs } from '@march/core'
import { get, isNil } from 'lodash'
import { tranfromUploadCsv } from './inventory.dto'
import { Cron, CronExpression } from '@nestjs/schedule'
import { TranslationService } from 'src/common/i18n/translation.service'
import { PathImpl2 } from '@nestjs/config'
import { TranslateOptions } from 'nestjs-i18n'
import { I18nTranslations } from 'src/generated/i18n.generated'

@Injectable()
export class InventoryService implements OnModuleInit {
  private readonly loggers = new Logger(InventoryService.name)

  constructor(
    private readonly repos: PrismaService,
    private readonly translationService: TranslationService,
  ) {}
  onModuleInit() {}

  async test(): Promise<string> {
    return await this.getLocal('translation.BadRequest.name')
  }

  private async getLocal(
    key: PathImpl2<I18nTranslations>,
    options: TranslateOptions = {},
  ): Promise<string> {
    return await this.translationService.translate(key, options)
  }

  async getInventoryNames(
    req: ICurrentUser,
  ): Promise<common.InventoryNameResponse> {
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

      return statusCode.success(result)
    } catch (error) {
      this.loggers.error(error, `[MarchERR] getInventoryNames error`, logctx)
      throw new HttpException(error?.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getInventories(
    params: common.ParamsInventory,
    req: ICurrentUser,
  ): Promise<common.InventoriesResponse> {
    const logctx = logContext(InventoryService, this.getInventories)
    const { search, limit, pageNo, type, brand, branch, favorite } = params
    const { shopsId, userId } = req
    const _pageNo = pageNo ?? 1
    const offset = _pageNo * limit - limit ?? undefined
    const skip = offset ?? 0
    const brandIds = mapFunction(brand, 'id')
    const typeIds = mapFunction(type, 'id')
    const branchIds = mapFunction(branch, 'id')
    this.loggers.debug(
      {
        _pageNo,
        offset,
        skip,
        search,
        userId,
        shopsId,
        brandIds,
        branchIds,
        typeIds,
      },
      logctx,
    )
    const whereCondition = {
      deleted: false,
      name: search.startsWith('#') ? {} : { contains: `%${search}%|%` },
      favorite: favorite === common.FavoriteStatus.LIKE ? true : undefined,
      serialNumber: search.startsWith('#') ? { contains: search } : {},
      inventoryType:
        typeIds.length > 0
          ? {
              OR: typeIds,
            }
          : {},
      inventoryBrand:
        brandIds.length > 0
          ? {
              OR: brandIds,
            }
          : {},
      inventoryBranch:
        branchIds.length > 0
          ? {
              OR: branchIds,
            }
          : {},
      shopsId,
    }
    this.loggers.debug({ whereCondition }, logctx)
    if (isNil(shopsId) || isNil(req.userName)) {
      this.loggers.debug('Unauthorized ShopId', logctx)
      return statusCode.forbidden('Unauthorized ShopId')
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
          inventoryBrand: {
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
          inventoryBranch: {
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

      return statusCode.success({
        inventories: result,
        pageLimit: limit,
        pageNo,
        totalPage,
        totalRow,
      })
    } catch (error) {
      this.loggers.error(error, `[MarchERR] getInventories error`, logctx)
      return statusCode.internalError(error.meesage)
    }
  }

  async getInventory(
    id: string,
    req: ICurrentUser,
  ): Promise<common.InventoryDataResponse> {
    const logctx = logContext(InventoryService, this.getInventory)
    this.loggers.debug({ id, req }, logctx)
    try {
      const result = await this.repos.inventory.findUnique({
        where: {
          id,
        },
        include: {
          inventoryBrand: {
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
          inventoryBranch: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      if (req.shopsId !== result.shopsId) {
        this.loggers.debug('req.shopsId !== result.shopsId:153', logctx)
        return statusCode.forbidden('Unauthorized ShopId')
      }
      this.loggers.debug({ result }, logctx)
      return statusCode.success(result)
    } catch (error) {
      this.loggers.error(error, `[MarchERR] getInventories error`, logctx)
      throw new HttpException(error?.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getInventoryTypes(
    req: ICurrentUser,
    params: common.ParamsInventoryType,
  ): Promise<common.InventoryTypesResponse> {
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

      return statusCode.success(result)
    } catch (error) {
      this.loggers.error(error, `[MarchERR] getTypesInventory error`, logctx)
      throw new HttpException(error?.message, HttpStatus.INTERNAL_SERVER_ERROR)
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

  async getInventoryBrands(
    req: ICurrentUser,
    params: common.ParamsInventoryBrand,
  ): Promise<common.InventoryBrandsDataResponse> {
    const logctx = logContext(InventoryService, this.getInventoryBrands)
    try {
      const { search, limit, offset } = params
      this.loggers.debug({ params }, logctx)
      const result = await this.repos.inventoryBrand.findMany({
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

      return statusCode.success(result)
    } catch (error) {
      this.loggers.error(error, `[MarchERR] getBrandsInventory error`, logctx)

      throw new HttpException(error?.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getInventoryBrand(
    id: string,
    req: ICurrentUser,
  ): Promise<common.InventoryType> {
    const logctx = logContext(InventoryService, this.getInventoryBrand)
    this.loggers.debug({ id, req }, logctx)
    try {
      const result = await this.repos.inventoryBrand.findUnique({
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
      this.loggers.error(error, `[MarchERR] getInventoryBrand error`, logctx)
      throw new HttpException('Internal Error', 500)
    }
  }

  async getInventoryBranchs(
    req: ICurrentUser,
    params: common.ParamsInventoryBrand,
  ): Promise<common.InventoryBranchsDataResponse> {
    const logctx = logContext(InventoryService, this.getInventoryBranchs)
    try {
      const { search, limit, offset } = params
      this.loggers.debug({ params }, logctx)
      const result = await this.repos.inventoryBranch.findMany({
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

      return statusCode.success(result)
    } catch (error) {
      this.loggers.error(error, `[MarchERR] getBranchsInventory error`, logctx)

      throw new HttpException(error?.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async deleteInventory(
    id: string,
    req: ICurrentUser,
  ): Promise<common.MutationInventoryResponse> {
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
        return statusCode.forbidden('Unauthorized ShopId')
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

      return statusCode.success(
        result,
        await this.getLocal('translation.Success.inventory'),
      )
    } catch (error) {
      this.loggers.error(error, `[MarchERR] deleteInventory error`, logctx)
      throw new HttpException(error?.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
  async deleteInventoryType(
    id: string,
    req: ICurrentUser,
  ): Promise<common.MutationInventoryResponse> {
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
        return statusCode.forbidden('Unauthorized ShopId')
      }
      const type = await this.repos.inventory.findMany({
        where: {
          inventoryTypeId: id,
        },
      })
      this.loggers.debug({ type }, logctx)
      if (type.length > 0) {
        this.loggers.debug('type.length > 0', logctx)
        return statusCode.onUse(await this.getLocal('translation.onUse.type'))
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
      return statusCode.success(
        result,
        await this.getLocal('translation.Success.type'),
      )
    } catch (error) {
      this.loggers.error(error, `[MarchERR] deleteTypeInventory error`, logctx)
      throw new HttpException(error?.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async deleteInventoryBrand(
    id: string,
    req: ICurrentUser,
  ): Promise<common.MutationInventoryResponse> {
    const logctx = logContext(InventoryService, this.deleteInventoryBrand)
    this.loggers.debug({ id, req }, logctx)
    try {
      const checkShopId = await this.repos.inventoryBrand.findUnique({
        where: {
          id,
        },
        select: {
          shopsId: true,
        },
      })
      if (checkShopId.shopsId !== req.shopsId) {
        this.loggers.debug('req.shopsId !== result.shopsId:371', logctx)
        return statusCode.forbidden('Unauthorized ShopId')
      }
      const type = await this.repos.inventory.findMany({
        where: {
          inventoryBrandId: id,
        },
      })
      if (type.length > 0) {
        this.loggers.debug('type.length > 0', logctx)
        return statusCode.onUse(await this.getLocal('translation.onUse.brand'))
      }
      const result = await this.repos.inventoryBrand.update({
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
      return statusCode.success(
        result,
        await this.getLocal('translation.Success.brand'),
      )
    } catch (error) {
      this.loggers.error(error, `[MarchERR] deleteBrandInventory error`, logctx)
      throw new HttpException(error?.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async deleteInventoryBranch(
    id: string,
    req: ICurrentUser,
  ): Promise<common.MutationInventoryResponse> {
    const logctx = logContext(InventoryService, this.deleteInventoryBranch)
    this.loggers.debug({ id, req }, logctx)
    try {
      const checkShopId = await this.repos.inventoryBranch.findUnique({
        where: {
          id,
        },
        select: {
          shopsId: true,
        },
      })
      if (checkShopId.shopsId !== req.shopsId) {
        this.loggers.debug('req.shopsId !== result.shopsId:371', logctx)
        return statusCode.forbidden('Unauthorized ShopId')
      }
      const type = await this.repos.inventory.findMany({
        where: {
          inventoryBranchId: id,
        },
      })
      if (type.length > 0) {
        this.loggers.debug('type.length > 0', logctx)
        return statusCode.onUse(await this.getLocal('translation.onUse.branch'))
      }
      const result = await this.repos.inventoryBranch.update({
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
      return statusCode.success(
        result,
        await this.getLocal('translation.Success.branch'),
      )
    } catch (error) {
      this.loggers.error(
        error,
        `[MarchERR] deleteBranchInventory error`,
        logctx,
      )
      throw new HttpException(error?.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async upsertInventory(
    input: common.UpsertInventoryInput,
    req: ICurrentUser,
    LangHeader: string,
  ): Promise<common.MutationInventoryResponse> {
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
      inventoryBrandId,
      inventoryBranchId,
      serialNumber,
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
      const checkInventoryBrand = await this.repos.inventoryBrand.findUnique({
        where: {
          id: inventoryBrandId,
        },
        select: {
          shopsId: true,
        },
      })
      const checkInventoryBranch = await this.repos.inventoryBranch.findUnique({
        where: {
          id: inventoryBranchId,
        },
        select: {
          id: true,
          shopsId: true,
        },
      })
      this.loggers.debug(
        { checkInventoryBrand, checkInventoryType, checkInventoryBranch },
        logctx,
      )
      if (
        checkInventoryType.shopsId !== shopsId ||
        checkInventoryBrand.shopsId !== shopsId ||
        checkInventoryBranch.shopsId !== shopsId
      ) {
        this.loggers.debug('checkInventoryType.shopsId !== shopsId', logctx)
        return statusCode.forbidden('Unauthorized ShopId')
      }

      const findDup = await this.repos.inventory.findFirst({
        where: {
          name: name + '|' + checkInventoryBranch.id + '|' + shopsId,
          shopsId,
        },
        select: {
          id: true,
          shopsId: true,
        },
      })
      this.loggers.debug({ findDup }, logctx)
      if (!id && findDup) {
        return statusCode.duplicated(
          await this.getLocal('translation.Upsert.duplicated'),
        )
      }
      // if (id && findDup && id === findDup.id) {
      //   return statusCode.badRequest('2')
      // }
      if (id && findDup && id !== findDup.id) {
        return statusCode.badRequest(
          await this.getLocal('translation.Upsert.duplicated'),
        ) // dup branch + name
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
          name: name + '|' + checkInventoryBranch.id + '|' + shopsId,
          amount,
          inventoryTypeId: inventoryTypeId,
          inventoryBrandId: inventoryBrandId,
          inventoryBranchId: inventoryBranchId,
          price,
          priceMember,
          reorderLevel,
          sku,
          serialNumber,
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
          name: name + '|' + checkInventoryBranch.id + '|' + shopsId,
          amount,
          inventoryTypeId: inventoryTypeId,
          inventoryBrandId: inventoryBrandId,
          inventoryBranchId: inventoryBranchId,
          price,
          favorite,
          priceMember,
          reorderLevel,
          sku,
          serialNumber,
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
      return statusCode.success(
        { id: result.id },
        await this.getLocal(
          `translation.Upsert.success.${id ? 'update' : 'create'}.inventory`,
        ),
      )
    } catch (error) {
      this.loggers.debug({ error }, logctx)
      this.loggers.error(error, `[MarchERR] upsertInventory error`, logctx)
      throw new HttpException(error?.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async upsertInventoryType(
    input: common.UpsertInventoryTypeInput,
    req: ICurrentUser,
    LangHeader: string,
  ): Promise<common.MutationInventoryResponse> {
    const logctx = logContext(InventoryService, this.upsertInventoryType)
    const { id, name, description } = input
    const { shopsId, userName } = req
    this.loggers.debug({ input, req }, logctx)

    if (!name) {
      return statusCode.badRequest(
        await this.getLocal('translation.BadRequest.name'),
      )
    }
    try {
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
        return statusCode.duplicated(
          await this.getLocal('translation.Upsert.duplicated'),
        )
      }
      if (id && findDup && id !== findDup.id) {
        return statusCode.badRequest(
          await this.getLocal('translation.Upsert.duplicated'),
        )
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
      return statusCode.success(
        result,
        await this.getLocal(
          `translation.Upsert.success.${id ? 'update' : 'create'}.type`,
        ),
      )
    } catch (error) {
      this.loggers.debug({ error }, logctx)
      this.loggers.error(error, `[MarchERR] upsertInventoryType error`, logctx)
      throw new HttpException(error?.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async upsertInventoryBrand(
    input: common.UpsertInventoryBrandInput,
    req: ICurrentUser,
  ): Promise<common.MutationInventoryResponse> {
    const logctx = logContext(InventoryService, this.upsertInventoryBrand)
    const { id, name, description } = input
    const { shopsId, userName } = req

    this.loggers.debug({ input, req }, logctx)

    if (!name) {
      return statusCode.badRequest('name is required')
    }
    try {
      const findDup = await this.repos.inventoryBrand.findFirst({
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
        return statusCode.duplicated(
          await this.getLocal('translation.Upsert.duplicated'),
        )
      }
      if (id && findDup && id !== findDup.id) {
        return statusCode.badRequest(
          await this.getLocal('translation.Upsert.duplicated'),
        )
      }

      const result = await this.repos.inventoryBrand.upsert({
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
      return statusCode.success(
        result,
        await this.getLocal(
          `translation.Upsert.success.${id ? 'update' : 'create'}.brand`,
        ),
      )
    } catch (error) {
      this.loggers.debug({ error }, logctx)
      this.loggers.error(error, `[MarchERR] upsertInventoryBrand error`, logctx)
      throw new HttpException(error?.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async upsertInventoryBranch(
    input: common.UpsertInventoryBranchInput,
    req: ICurrentUser,
  ): Promise<common.MutationInventoryResponse> {
    const logctx = logContext(InventoryService, this.upsertInventoryBranch)
    const { id, name, description } = input
    const { shopsId, userName } = req

    this.loggers.debug({ input, req }, logctx)

    if (!name) {
      return statusCode.badRequest('name is required')
    }
    try {
      const findDup = await this.repos.inventoryBranch.findFirst({
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
        return statusCode.duplicated(
          await this.getLocal('translation.Upsert.duplicated'),
        )
      }
      if (id && findDup && id !== findDup.id) {
        return statusCode.badRequest(
          await this.getLocal('translation.Upsert.duplicated'),
        )
      }

      const result = await this.repos.inventoryBranch.upsert({
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
      return statusCode.success(
        result,
        await this.getLocal(
          `translation.Upsert.success.${id ? 'update' : 'create'}.branch`,
        ),
      )
    } catch (error) {
      this.loggers.debug({ error }, logctx)
      this.loggers.error(error, `[MarchERR] upsertBranchType error`, logctx)
      throw new HttpException(error?.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async favoriteInventory(
    id: string,
    req: ICurrentUser,
  ): Promise<common.MutationInventoryResponse> {
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
        return statusCode.forbidden('Unauthorized ShopId')
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
      return statusCode.success(
        result,
        await this.getLocal(
          `translation.favorite.${!checkShopId.favorite ? 'add' : 'delete'}`,
        ),
      )
    } catch (error) {
      this.loggers.error(error, `[MarchERR] favoriteInventory error`, logctx)

      throw new HttpException(error?.message, HttpStatus.INTERNAL_SERVER_ERROR)
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
        return statusCode.success(
          {
            id: '',
            success: false,
            reason: 'duplicated',
            //'Duplicated Filename. Upload again.'
          },
          await this.getLocal('translation.Upload.duplicated'),
        )
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
        return statusCode.internalError('create failed')
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
              inventoryFileId: createFile.id,
            },
          })
          await this.repos.inventoryFile.delete({
            where: {
              id: createFile.id,
            },
          })
          return statusCode.success(
            {
              id: '',
              success: false,
              reason: 'lost',
              // 'maybe some item lost or duplicated. Please upload csv again.',
            },
            await this.getLocal('translation.Upload.lost'),
          )
        }
        return statusCode.success(
          {
            id: createFile.id,
            success: true,
            reason: '',
          },
          await this.getLocal('translation.Upload.success'),
        )
      } catch (error) {
        this.loggers.error(error, 'uploadInventory', logctx)

        await this.repos.inventory.deleteMany({
          where: {
            inventoryFileId: createFile.id,
          },
        })
        await this.repos.inventoryFile.delete({
          where: {
            id: createFile.id,
          },
        })
        return statusCode.success(
          {
            id: createFile.id,
            success: false,
            reason: 'somethingWrong',
            // 'Upload Failed. Upload again',
          },
          await this.getLocal('translation.Upload.somethingWrong'),
        )
      }
    } catch (error) {
      this.loggers.error(error, `[MarchERR] uploadInventory error`, logctx)
      throw new HttpException(error?.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async getInventoryAllDeleted(
    req: ICurrentUser,
  ): Promise<common.DeletedInventoryResponse> {
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
        orderBy: {
          updatedAt: 'desc',
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
        orderBy: {
          updatedAt: 'desc',
        },
      })
      this.loggers.debug({ typeDeleted }, logctx)
      const brandDeleted = await this.repos.inventoryBrand.findMany({
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
        orderBy: {
          updatedAt: 'desc',
        },
      })
      this.loggers.debug({ brandDeleted }, logctx)
      const branchDeleted = await this.repos.inventoryBranch.findMany({
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
        orderBy: {
          updatedAt: 'desc',
        },
      })
      this.loggers.debug({ branchDeleted }, logctx)
      return statusCode.success({
        inventory: inventoryDeleted,
        type: typeDeleted,
        brand: brandDeleted,
        branch: branchDeleted,
      })
    } catch (error) {
      this.loggers.error(
        error,
        `[MarchERR] getInventoryAllDeleted error`,
        logctx,
      )
      throw new HttpException(error?.message, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  async recoveryHardDeleted(
    input: common.RecoveryHardDeletedInput,
    req: ICurrentUser,
  ): Promise<common.RecoveryHardDeletedResponse> {
    const logctx = logContext(InventoryService, this.recoveryHardDeleted)
    this.loggers.debug({ req, input }, logctx)

    const { shopsId, userName } = req
    const { id, mode, type } = input
    if (!id) {
      return statusCode.badRequest('id is required')
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
          return statusCode.forbidden('Unauthorized ShopId')
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

        return statusCode.success(
          {
            id: deleted?.id,
            type: type,
          },
          await this.getLocal('translation.Success.trash.delete'),
        )
      } else if (mode === common.DeletedMode.RECOVERY) {
        if (checkShopId.shopsId !== shopsId || checkShopId.deleted === false) {
          return statusCode.forbidden('Unauthorized ShopId')
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

        return statusCode.success(
          {
            id: deleted?.id,
            type: type,
            mode: mode,
          },
          await this.getLocal('translation.Success.trash.recovery'),
        )
      }
    } catch (error) {
      this.loggers.error(error, `[MarchERR] recoveryHardDeleted error`, logctx)
      throw new HttpException(error?.message, HttpStatus.INTERNAL_SERVER_ERROR)
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

  @Cron(CronExpression.EVERY_10_MINUTES, { timeZone: Constant.timezone })
  async RemoveTrash() {
    const logctx = logContext(InventoryService, this.RemoveTrash)
    const reposes = ['inventoryBrand', 'inventoryType', 'inventory']
    try {
      for (const repo of reposes) {
        const deletedBrand = await this.repos[repo].findMany({
          where: {
            deleted: true,
          },
        })
        let ids: string[] = []
        for (const deleted of deletedBrand) {
          const targetDate = dayjs(deleted.updatedAt)
          const currentDate = dayjs()
          const daysDifference = currentDate.diff(targetDate, 'day')

          if (daysDifference > 30) {
            ids.push(deleted.id)
          }
        }
        if (ids.length > 0)
          await this.repos[repo].deleteMany({
            where: {
              id: {
                in: ids,
              },
            },
          })
      }
    } catch (error) {
      this.loggers.error(error, `[MarchERR] RemoveTrashCron error`, logctx)
    }
  }
}
