import { Product } from './Product';

export class Cart {
    products: CartProduct[] = [];
    get count(): number {
        return this.products.length;
    }
    get total(): number {
        return this.products.reduce((agg, cur) => agg += cur.price, 0);
    }
}

export class CartProduct {
    cart: Cart | null = null;
    product: Product | null = null;
    price: number = 0;
    quantity: number = 0;
    constructor(cart?: Cart, product?: Product) {
        this.cart = cart ?? null;
        this.product = product ?? null;
        if (this.product != null) {
            this.price = this.product.currentPrice;
            this.quantity = 1;
        }
    }
}