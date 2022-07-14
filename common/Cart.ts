import { ObjectId } from "../node_modules/mongodb";
import { Product } from './Product';

export class Cart {
    _id: ObjectId = new ObjectId();
    products: CartProduct[] = [];
    get count(): number {
        return this.products.length;
    }
    get total(): number {
        return this.products.reduce((agg, cur) => agg += cur.price, 0);
    }
}

export class CartProduct {
    _id: string | object | null = typeof ObjectId !== 'undefined' ? new ObjectId() : null;
    _cartId: string | null = null;
    price: number = 0;
    quantity: number = 0;
    constructor(cartId?: string, product?: Product) {
        if (typeof cartId === 'string') {
            this._cartId = typeof ObjectId !== 'undefined' ? new ObjectId(cartId).toHexString() : cartId;
        } else if (typeof cartId === 'object') {
            product = cartId as Product;
        }

        if (product != null) {
            this._id = product._id;
            this.price = product.currentPrice;
            this.quantity = 1;
        }
    }
    get cartId(): string | null {
        if (typeof this._cartId === 'string') {
            return this._cartId;
        } else if (typeof this._cartId?.['toHexString'] === 'function') {
            return (this._cartId['toHexString'] as Function)() as string;
        } else {
            return null;
        }
    }
    set cartId(value: object | string | null) {
        if (typeof value === 'string') {
            this._cartId = value;
        } else if (typeof value === 'object' && typeof (value as any)?.['toHexString'] === 'function') {
            this._cartId = ((value as any)['toHexString'] as Function)() as string;
        } else {
            this._cartId = null;
        }
    }
}