import { Cart, CartProduct } from "../../common/Cart.js";
import { Product } from "../../common/Product.js";
import { Utility } from "../../common/Utility.js";
import { v4 as uuidv4 } from "uuid";
import { ObjectId } from "bson";
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

    static moneyDisplayOpts = {
        currency: "USD",
        currencyDisplay: "narrowSymbol",
        style: "currency",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        minimumSignificantDigits: 3
    };

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
    get cartId(): string {
        this.#cartId ??= ObjectId.generate().toString('hex');
        return this.#cartId;
    }
    set cartId(value: string) {
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
    getForm(): HTMLFormElement | null {
        if (this.shadowRoot == null) {
            console.warn('shadowRoot was null');
            return null;
        }
        return this.shadowRoot.querySelector('.checkout-cart-product-container');
    }
    getCartIdInput(): HTMLInputElement | null {
        if (this.shadowRoot == null) {
            console.warn('shadowRoot was null');
            return null;
        }
        return this.shadowRoot.querySelector('input[name="cartId"]');
    }
    getProductIdInput(): HTMLInputElement | null {
        if (this.shadowRoot == null) {
            console.warn('shadowRoot was null');
            return null;
        }
        return this.shadowRoot.querySelector('input[name="productId"]');
    }
    getCsrf(): HTMLInputElement | null {
        if (this.shadowRoot == null) {
            console.warn('shadowRoot was null');
            return null;
        }
        return this.shadowRoot.querySelector('input[name="CSRF"]');
    }
    getCsrfToken(): string {
        return uuidv4();
    }
    getPriceContainer(): HTMLDivElement | null {
        if (this.shadowRoot == null) {
            console.warn('shadowRoot was null');
            return null;
        }
        return this.shadowRoot.querySelector('.checkout-cart-product-price-container');
    }
    getOriginalPriceDisplay(): HTMLFieldSetElement | null {
        if (this.shadowRoot == null) {
            console.warn('shadowRoot was null');
            return null;
        }
        return this.shadowRoot.querySelector('fieldset.checkout-cart-product-original-price');
    }
    getCurrentPriceDisplay(): HTMLFieldSetElement | null {
        if (this.shadowRoot == null) {
            console.warn('shadowRoot was null');
            return null;
        }
        return this.shadowRoot.querySelector('fieldset.checkout-cart-product-current-price');
    }
    getSavingsDisplay(): HTMLFieldSetElement | null {
        if (this.shadowRoot == null) {
            console.warn('shadowRoot was null');
            return null;
        }
        return this.shadowRoot.querySelector('fieldset.checkout-cart-product-savings');
    }
    getCartDisplay(): HTMLAnchorElement | null {
        if (this.shadowRoot == null) {
            console.warn('shadowRoot was null');
            return null;
        }
        return this.shadowRoot.querySelector('a.checkout-cart-display-toggle');
    }
    getCartBadge(): HTMLAnchorElement | null {
        if (this.shadowRoot == null) {
            console.warn('shadowRoot was null');
            return null;
        }
        return this.shadowRoot.querySelector('span.checkout-cart-display-badge');
    }
    render() {
        switch (this.type) {
            case "addto":
                const container = this.getForm() ?? document.createElement('form');
                container.classList.add('checkout-cart-product-container');
                container.method = this.#cartMethod;
                container.id = `checkout-cart-add-to-cart-${this.#instanceId}`;
                container.action = this.#cartUrl;
                const csrf = this.getCsrf() ?? document.createElement('input');
                csrf.type = 'hidden';
                csrf.name = 'CSRF';
                csrf.value = this.getCsrfToken();
                container.append(csrf);
                const cartIdInput = this.getCartIdInput() ?? document.createElement('input');
                cartIdInput.type = 'hidden';
                cartIdInput.name = 'cartId';
                cartIdInput.value = this.#cartId ?? uuidv4().replace('-', '').substring(0, 24);
                container.append(cartIdInput);
                const productIdInput = this.getProductIdInput() ?? document.createElement('input');
                productIdInput.type = 'hidden';
                productIdInput.name = 'productId';
                if (this.#productId == null || this.product == null) {
                    throw new Error('productId is null');
                }
                productIdInput.value = this.#productId;
                container.append(productIdInput);
                const priceDisplay = this.getPriceContainer() ?? document.createElement('div');
                priceDisplay.classList.add('checkout-cart-product-price-container');
                priceDisplay.dataset.originalPrice = this.product.originalPrice.toLocaleString([], CheckoutCart.moneyDisplayOpts);
                priceDisplay.dataset.currentPrice = this.product.currentPrice.toLocaleString([], CheckoutCart.moneyDisplayOpts);
                priceDisplay.dataset.savings = (this.product.originalPrice - this.product.currentPrice).toLocaleString([], CheckoutCart.moneyDisplayOpts);
                const originalPriceDisplay: HTMLFieldSetElement = this.getOriginalPriceDisplay() ?? document.createElement('fieldset');
                originalPriceDisplay.classList.add('minimal', 'checkout-cart-product-original-price');
                const originalPriceLabel: HTMLLabelElement = originalPriceDisplay.querySelector('label') ?? document.createElement('label');
                originalPriceLabel.htmlFor = `originalPrice-${this.productId}`;
                originalPriceLabel.textContent = 'List Price:'
                originalPriceDisplay.append(originalPriceLabel);
                const originalPriceValue: HTMLInputElement = originalPriceDisplay.querySelector(`#originalPrice-${this.productId}`) ?? document.createElement('input');
                originalPriceValue.type = 'text';
                originalPriceValue.readOnly = true;
                originalPriceValue.disabled = true;
                originalPriceValue.value = priceDisplay.dataset.originalPrice;
                originalPriceValue.classList.add('view-only', 'not-applicable');
                originalPriceDisplay.append(originalPriceValue);
                priceDisplay.append(originalPriceDisplay);
                const currentPriceDisplay: HTMLFieldSetElement = this.getCurrentPriceDisplay() ?? document.createElement('fieldset');
                currentPriceDisplay.classList.add('minimal');
                const currentPriceLabel: HTMLLabelElement = currentPriceDisplay.querySelector('label') ?? document.createElement('label');
                currentPriceLabel.htmlFor = `currentPrice-${this.productId}`;
                currentPriceLabel.textContent = 'List Price:'
                currentPriceDisplay.append(currentPriceLabel);
                const currentPriceValue: HTMLInputElement = currentPriceDisplay.querySelector(`#currentPrice-${this.productId}`) ?? document.createElement('input');
                currentPriceValue.type = 'text';
                currentPriceValue.readOnly = true;
                currentPriceValue.disabled = true;
                currentPriceValue.value = priceDisplay.dataset.currentPrice;
                currentPriceValue.classList.add('view-only', 'current-price');
                currentPriceDisplay.append(currentPriceValue);
                priceDisplay.append(currentPriceDisplay);
                const savingsDisplay: HTMLFieldSetElement = this.getSavingsDisplay() ?? document.createElement('fieldset');
                savingsDisplay.classList.add('minimal');
                const savingsLabel: HTMLLabelElement = savingsDisplay.querySelector('label') ?? document.createElement('label');
                savingsLabel.htmlFor = `savings-${this.productId}`;
                savingsLabel.textContent = 'List Price:'
                savingsDisplay.append(savingsLabel);
                const savingsValue: HTMLInputElement = savingsDisplay.querySelector(`#savings-${this.productId}`) ?? document.createElement('input');
                savingsValue.type = 'text';
                savingsValue.readOnly = true;
                savingsValue.disabled = true;
                savingsValue.value = `${priceDisplay.dataset.savings} (${((this.product.originalPrice - this.product.currentPrice) / this.product.originalPrice).toLocaleString([], { style: "percent" })})`;
                savingsValue.classList.add('view-only', 'savings');
                savingsDisplay.append(savingsValue);
                priceDisplay.append(savingsDisplay);
                break;
            case "header":
                const cartDisplay: HTMLAnchorElement = this.getCartDisplay() ?? document.createElement('a');
                cartDisplay.classList.add('checkout-cart-display-toggle');
                cartDisplay.href = `#cart-${this.cartId ?? ''}`;
                cartDisplay.dataset.cartId = this.cartId ?? undefined;
                cartDisplay.textContent = '🛒';
                this.shadowRoot?.append(cartDisplay);
                const cartBadge: HTMLSpanElement = this.getCartBadge() ?? document.createElement('span');
                cartBadge.classList.add('checkout-cart-display-badge');
                cartBadge.textContent = this.cart?.products.length.toString() ?? "";
                break;
            case "flyout":
                break;
            case "page":
                break;
        }
    }
    addToCartMutationByGraphQL(product: CartProduct): any {
        product.cart ??= this.#cart ?? null;
        return {
            query: `mutation AddToCart($input: CartProduct) {
                addToCart(product: $input) {
                    _id,
                    products {
                        _id
                        _cartId
                        price
                        quantity
                    }
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
                  products {
                    _id
                    _cartId
                    price
                    quantity
                  }
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
            console.warn('No product selected to add to cart?!?');
            return;
        }
        if (this.cart == null) {
            console.warn('No cart selected to which to add?!?');
            return;
        }
        const value = new CartProduct(this.cart, this.product);
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
        if (this.product != null) {
            this.render();
        }
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
