import { Product } from "../../common/Product.js";
import { Utility } from "../../common/Utility.js";

export class ProductDisplay extends HTMLElement {
    #instanceId: number = 0;
    #productUrl: string = "http://localhost:4001/product";
    #productMethod: string = "POST";
    #productUsesGraphQL: boolean = true;
    #type: string = "hero";
    #options: any = {};
    #productId: string = "";
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
        return this.#productId;
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
    constructor() {
        super();
        this.#instanceId = Date.now();
        this.attachShadow({ mode: 'open' });
        const productId = this.shadowRoot?.host.getAttribute('data-product-id');
        if (productId != null) {
            this.productId = productId;
        }
    }
    attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        if (['data-product-id', 'data-productId', 'product-id', 'productId', 'ProductId'].includes(name) && newValue != null && newValue.length) {
            this.productId = newValue;
        }
    }
    static get observedAttributes() {
        return ['data-product-id', 'data-productId', 'product-id', 'productId', 'ProductId'];
    }
    getStyle(): HTMLStyleElement | null {
        if (this.shadowRoot == null) {
            console.warn('shadowRoot was null');
            return null;
        }
        return this.shadowRoot.querySelector('style');
    }
    getWrapper(): HTMLElement | null {
        if (this.shadowRoot == null) {
            console.warn('shadowRoot was null');
            return null;
        }
        return this.shadowRoot.querySelector('article');
    }
    getFigure(): HTMLElement | null {
        if (this.shadowRoot == null) {
            console.warn('shadowRoot was null');
            return null;
        }
        return this.shadowRoot.querySelector('figure');
    }
    render() {
        if (this.shadowRoot == null) {
            console.warn('shadowRoot was null');
            return;
        }
        const cssStyle = this.getStyle() ?? document.createElement('style');
        cssStyle.setAttribute('type', 'text/css');
        cssStyle.textContent = `
    :host, :host * {
        box-sizing: border-box;
    }
`;
        this.shadowRoot.append(cssStyle);
        const id = `product-${this.#instanceId}`;
        this.shadowRoot.host.id = id;
        this.shadowRoot.host.setAttribute('data-product-id', this.productId);
        const wrapper = document.createElement('article');
        wrapper.classList.add('product-wrapper');
        wrapper.dataset.productId = this.productId;
        if (this.product != null) {
            if (this.product.images != null && this.product.mainImage != null) {
                const gallery = document.createElement('product-gallery');
                gallery.setAttribute('data-product-id', this.productId);
                wrapper.append(gallery);
            }
            if (this.product.name && this.product.name.length) {
                const productInfo = document.createElement('section');
                productInfo.classList.add('product-info');
                const productHeader = document.createElement('h1');
                productHeader.textContent = this.product.name;
                const productDesc = document.createElement('p');
                productDesc.textContent = this.product.description;
                productInfo.append(productHeader);
                productInfo.append(productDesc);
                wrapper.append(productInfo);
            }
            if (this.product.currentPrice > 0) {
                const cart = document.createElement('checkout-cart');
                cart.setAttribute('type', 'addto');
                cart.setAttribute('data-product-id', this.productId);
                wrapper.append(cart);
            }
        }
        this.shadowRoot.append(wrapper);
    }
    getQueryByGraphQL(value: string): any {
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
    getQueryByJson(value: string): any {
        return {
            id: value
        };
    }
    async loadProduct(): Promise<void> {
        const value = this.productId;
        const query = this.#productUsesGraphQL ? this.getQueryByGraphQL(value) : this.getQueryByJson(value);
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
        this.render();
    }
}
// Registers the element as a Custom Element with the DOM
customElements.define('product-display', ProductDisplay);
