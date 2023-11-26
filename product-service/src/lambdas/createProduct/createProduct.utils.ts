import { CreateProductDTO } from './createProduct.entities';

export const validateRequestBody = (body: CreateProductDTO): boolean => {
    if (body.title && typeof body.title !== 'string') return false

    if (body.description && typeof body.title !== 'string') return false

    if (body.price && typeof body.price !== 'number') return false

    if (body.count && typeof body.count !== 'number') return false

    return true
}