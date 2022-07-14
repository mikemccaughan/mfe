import { Cart, CartProduct } from "../../common/Cart.js";
import { Product } from "../../common/Product.js";
import { Utility } from "../../common/Utility.js";

export class CheckoutCart extends HTMLElement {
    #instanceId: number = 0;
    #productUrl: string = "http://localhost:4001/product";
    #productMethod: string = "POST";
    #productUsesGraphQL: boolean = true;
    #cartUrl: string = "http://localhost:4002/cart";
    #cartMethod: string = "POST";
    #cartUsesGraphQL: boolean = true;
    #type: string = "hero";
    #options: any = {};
    #cartId: string | null = null;
    #cart: Cart | null = new Cart();
    #productId: string | null = null;
    #product: Product | null = null;

    get type(): string {
        return this.#type;
    }
    set type(value: string) {
        if (this.#type !== value) {
            this.#type = value;
            const changedType = new Event('product-type-change', { cancelable: true, bubbles: true });
            this.shadowRoot?.dispatchEvent(changedType);
        }
    }
    get options(): any {
        return this.#options;
    }
    set options(value: any) {
        if (typeof value === 'string') {
            let parsed: any = null;
            try {
                parsed = JSON.parse(value);
            } catch (e) {
                throw e;
            }
            const newOptions = { ...this.#options, ...parsed };
            if (!Utility.arraysAreSame(Object.entries(this.#options), Object.entries(newOptions), Utility.deepComparator)) {
                this.#options = newOptions;
            }
        } else if (typeof value === 'object') {
            const newOptions = { ...this.#options, ...value };
            if (!Utility.arraysAreSame(Object.entries(this.#options), Object.entries(newOptions), Utility.deepComparator)) {
                this.#options = newOptions;
            }
        } else {
            throw new Error(`The value "${value}" is not able to be used as options`);
        }
    }
    get productId(): string {
        return this.#productId ?? "";
    }
    set productId(value: string) {
        if (this.#productId !== value) {
            this.#productId = value;
            const changedType = new Event('product-id-change', { cancelable: true, bubbles: true });
            this.shadowRoot?.dispatchEvent(changedType);
            this.loadProduct();
        }
    }
    get product(): Product | null {
        return this.#product;
    }
    set product(value: Product | null) {
        if (this.#product == null ||
            value == null ||
            (this.#product != null &&
                value != null &&
                !Utility.arraysAreSame(Object.entries(this.#product), Object.entries(value), Utility.defaultComparator))) {
            this.#product = value;
            const changedProduct = new Event('product-change', { cancelable: true, bubbles: true });
            this.shadowRoot?.dispatchEvent(changedProduct);
        }
    }
    get cartId(): string | null {
        return this.#cartId;
    }
    set cartId(value: string | null) {
        if (this.#cartId !== value) {
            this.#cartId = value;
            const changedCartId = new Event('cart-id-change', { cancelable: true, bubbles: true });
            this.shadowRoot?.dispatchEvent(changedCartId);
            this.loadCart();
        }
    }
    get cart(): Cart | null {
        return this.#cart;
    }
    set cart(value: Cart | null) {
        if (this.#cart == null ||
            value == null ||
            (this.#cart != null &&
                value != null &&
                !Utility.arraysAreSame(Object.entries(this.#cart), Object.entries(value), Utility.defaultComparator))) {
            this.#cart = value;
            const changedCart = new Event('cart-change', { cancelable: true, bubbles: true });
            this.shadowRoot?.dispatchEvent(changedCart);
        }
    }
    constructor() {
        super();
        this.#instanceId = Date.now();
        this.attachShadow({ mode: 'open' });
    }
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        if (['data-product-id', 'data-productId', 'product-id', 'productId', 'ProductId'].includes(name) && newValue != null && newValue.length) {
            this.productId = newValue;
        }
        if (['data-cart-id', 'data-carttId', 'cart-id', 'cartId', 'CartId'].includes(name) && newValue != null && newValue.length) {
            this.cartId = newValue;
        }
    }
    static get observedAttributes() {
        return [
            'data-product-id', 'data-productId', 'product-id', 'productId', 'ProductId',
            'data-cart-id', 'data-cartId', 'cart-id', 'cartId', 'CartId'
        ];
    }
    render() {
        switch (this.type) {
            case "addto":

                break;
            case "header":
                break;
            case "page":
                break;
        }
    }
    addToCartMutationByGraphQL(product: CartProduct): any {
        product._cartId ??= this.#cart ? this.#cart._id.toHexString() : null;
        return {
            query: `mutation AddToCart($input: CartProduct) {
                addToCart(product: $input) {
                    _id,
                    products
                }
            }`,
            variables: {
                input: product
            }
        };
    }
    addToCartMutationByJson(product: CartProduct): any {
        return {
            input: product
        };
    }
    getCartQueryByGraphQL(value: string): any {
        return {
            query: `query GetCart($id: String!) {
                getCart(id: $id) {
                    _id
                    products
                }
            }`,
            variables: {
                id: value
            }
        };
    }
    getCartQueryByJson(value: string): any {
        return {
            id: value
        };
    }
    getProductQueryByGraphQL(value: string): any {
        return {
            query: `query GetProduct($id: String!) {
                product(id: $id) {
                    _id
                    name
                    description
                    originalPrice
                    currentPrice
                    similarProducts            
                }
            }`,
            variables: {
                id: value
            }
        };
    }
    getProductQueryByJson(value: string): any {
        return {
            id: value
        };
    }
    async addProductToCart(): Promise<void> {
        if (this.product == null) {
            console.warn('No product selected to add to product?!?');
            return;
        }
        const value = new CartProduct(this.cart?._id.toHexString(), this.product);
        const mutation = this.#cartUsesGraphQL ? this.addToCartMutationByGraphQL(value) : this.addToCartMutationByJson(value);
        const response = await fetch(this.#cartUrl, {
            method: this.#cartMethod,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(mutation)
        });
        const result = (await response.json())?.data.addToCart;
        this.cart = result;
        if (this.type === 'addto' && this.product != null) {
            this.render();
        } else if (this.type !== 'addto') {
            this.render();
        }
    }
    async loadCart(): Promise<void> {
        if (this.cartId == null) {
            console.warn('cartId was null');
            return;
        }
        const value = this.cartId;
        const query = this.#cartUsesGraphQL ? this.getCartQueryByGraphQL(value) : this.getCartQueryByJson(value);
        const response = await fetch(this.#cartUrl, {
            method: this.#cartMethod,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(query)
        });
        const result = (await response.json())?.data.getCart;
        this.cart = result;
        this.render();
    }
    async loadProduct(): Promise<void> {
        const value = this.productId;
        const query = this.#productUsesGraphQL ? this.getProductQueryByGraphQL(value) : this.getProductQueryByJson(value);
        const response = await fetch(this.#productUrl, {
            method: this.#productMethod,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(query)
        });
        const result = (await response.json())?.data.product;
        this.product = result;
        if (this.cart != null) {
            this.render();
        }
    }
}
// Registers the element as a Custom Element with the DOM
customElements.define('checkout-cart', CheckoutCart);
