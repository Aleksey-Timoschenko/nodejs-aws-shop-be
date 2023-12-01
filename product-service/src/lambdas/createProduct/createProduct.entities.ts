import { AvailableProduct } from "../../entities/product";

export type CreateProductDTO = Omit<AvailableProduct, 'id'>