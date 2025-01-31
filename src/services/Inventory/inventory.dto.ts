import { get } from 'lodash'
import { UpsertInventoryInput } from 'src/types'

export const tranfromUploadCsv = (
  datas: UpsertInventoryInput[],
  shopsId: string,
  userName: string,
  inventoryFileId: string,
) => {
  const result = datas.map((data) => {
    const {
      id,
      name,
      amount,
      inventoryTypeId,
      inventoryBrandId,
      inventoryBranchId,
      serialNumber,
      price,
      priceMember,
      reorderLevel,
      sku,
      favorite,
      expiryDate,
      description,
      size,
    } = data

    const width = get(size, 'width', '0')
    const length = get(size, 'length', '0')
    const height = get(size, 'height', '0')
    const weight = get(size, 'weight', '0')
    const _size = `${width}|${length}|${height}|${weight}`
    return {
      name: name + '|' + inventoryBranchId + '|' + shopsId,
      amount,
      inventoryTypeId,
      inventoryBrandId,
      inventoryBranchId,
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
      csvId: id,
      inventoryFileId,
    }
  })
  return result
}
