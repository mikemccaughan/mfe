import { Product } from "../../common/Product.js";
import { Utility } from "../../common/Utility.js";

export class Gallery extends HTMLElement {
    #productUrl: string = "http://localhost:4001/product";
    #productMethod: string = "POST";
    #productUsesGraphQL: boolean = true;
    #options: any = {};
    #productId: string = "";
    #product: Product | null = null;
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
    render() {
        if (this.shadowRoot == null) {
            console.warn('render: shadowRoot was null');
            return;
        }
        if (this.product == null) {
            console.warn('render: product was null');
            return;
        }
        if (this.product.mainImage != null && this.product.images != null && this.product.images.length > 0) {
            const gallery = document.createElement('figure');
            const mainImage = document.createElement('img');
            mainImage.src = this.product.mainImage;
            mainImage.classList.add('product-image');
            gallery.append(mainImage);
            const thumbs = document.createElement('figcaption');
            const menu = document.createElement('menu');
            this.product.images.map(img => {
                const thumbUrl = new URL(img);
                const lastDot = thumbUrl.pathname.lastIndexOf('.');
                // this is a little trick to use array methods to insert a string at a specific index. 
                // Could use string manipulation methods, but they get unwieldy.
                const newPath = [...thumbUrl.pathname];
                newPath.splice(lastDot, 0, ...[...'.thumb']);
                // newPath is the same path, but with file.thumb.ext instead of file.ext
                thumbUrl.pathname = newPath.join('');
                var thumb = document.createElement('li');
                thumb.classList.add('product-thumb');
                var thumbImg = document.createElement('img');
                thumbImg.src = thumbUrl.toString();
                thumb.append(thumbImg);
                return thumb;
            }).forEach(thumb => menu.append(thumb));
            thumbs.append(menu);
            gallery.append(thumbs);
            this.shadowRoot?.append(gallery);
        }
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
                    images
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
customElements.define('product-gallery', Gallery);
