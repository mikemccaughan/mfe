import { Utility } from "../../common/Utility.js";

export class Search extends HTMLElement {
    #type: string = "header";
    #options: any = {};
    #label: string = "Search";
    #value: string = "";
    #buttonText: string = "🔍";
    #instanceId: number = 0;
    #searchUrl: string = "http://localhost:4000/search";
    #searchMethod: string = "POST";
    #searchUsesGraphQL: boolean = true;
    get type(): string {
        return this.#type;
    }
    set type(value: string) {
        if (this.#type !== value) {
            this.#type = value;
            const changedType = new Event('search-type-change', { cancelable: true, bubbles: true });
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
    get label(): string {
        return this.#label;
    }
    set label(value: string) {
        if (this.#label !== value) {
            this.#label = value;
            const labelEl = this.shadowRoot?.querySelector('label');
            if (labelEl != null) {
                labelEl.textContent = value;
            }
            const changedLabel = new Event('search-label-change', { cancelable: true, bubbles: true });
            this.shadowRoot?.dispatchEvent(changedLabel);
        }
    }
    get buttonText(): string {
        return this.#buttonText;
    }
    set buttonText(value: string) {
        if (this.#buttonText !== value) {
            this.#buttonText = value;
            const buttonEl = this.shadowRoot?.querySelector('button');
            if (buttonEl != null) {
                buttonEl.textContent = value;
            }
            const changedButton = new Event('search-button-text-change', { cancelable: true, bubbles: true });
            this.shadowRoot?.dispatchEvent(changedButton);
        }
    }
    get value(): string {
        return this.#value;
    }
    set value(value: string) {
        if (this.#value !== value) {
            this.#value = value;
            const changedValue = new Event('search-value-change', { cancelable: true, bubbles: true });
            this.shadowRoot?.dispatchEvent(changedValue);
            if (value != null && value.length > 0) {
                this.doSearch();
            } else {
                this.clearSearch();
            }
        }
    }
    constructor() {
        super();
        this.#instanceId = Date.now();
        this.attachShadow({ mode: 'open' });
        this.render();
    }
    getStyle(): HTMLStyleElement | null {
        if (this.shadowRoot == null) {
            console.warn('shadowRoot was null');
            return null;
        }
        return this.shadowRoot.querySelector<HTMLStyleElement>('style');
    }
    getLabel(): HTMLLabelElement | null {
        if (this.shadowRoot == null) {
            console.warn('shadowRoot was null');
            return null;
        }
        return this.shadowRoot.querySelector<HTMLLabelElement>('label');
    }
    getInput(): HTMLInputElement | null {
        if (this.shadowRoot == null) {
            console.warn('shadowRoot was null');
            return null;
        }
        return this.shadowRoot.querySelector<HTMLInputElement>('input[type="search"]');
    }
    getButton(): HTMLButtonElement | null {
        if (this.shadowRoot == null) {
            console.warn('shadowRoot was null');
            return null;
        }
        return this.shadowRoot.querySelector<HTMLButtonElement>('button');
    }
    getDocument(): Document | null {
        if (this.shadowRoot == null) {
            console.warn('shadowRoot was null');
            return null;
        }
        return this.shadowRoot.ownerDocument;
    }
    getOutput(): HTMLOutputElement | null {
        if (this.shadowRoot == null) {
            console.warn('shadowRoot was null');
            return null;
        }
        return this.shadowRoot.querySelector<HTMLOutputElement>('output');
    }
    render() {
        if (this.shadowRoot == null) {
            console.warn('shadowRoot was null');
            return;
        }
        if (this.shadowRoot.hasChildNodes()) {
            this.shadowRoot.innerHTML = '';
        }
        const cssStyle = this.getStyle() ?? document.createElement('style');
        cssStyle.setAttribute('type', 'text/css');
        cssStyle.textContent = `
    :host, :host * {
        box-sizing: border-box;
    }
    :host {
        display: var(--search-host-display, inline-block);
        position: var(--search-host-position, relative);
        max-width: var(--search-host-max-width, 100%);
    }
    :host > label {
        position: absolute;
        left: -10000px;
    }
    :host > input {
        margin: 0.5rem 1rem;
        padding: 0.25rem calc(0.5rem + 24px) 0.25rem 0.5rem;
        width: 100%;
        min-height: 24px;
        height: calc(100% - 1rem);
    }
    :host > button {
        position: var(--search-button-position, absolute);
        right: var(--search-button-right, 0);
        width: var(--search-button-width, 24px);
        padding: 0;
        marign: 0;
        background: transparent;
        border-color: transparent;
        top: 50%;
        transform: translateY(-50%);
    }
    :host > output {
        position: var(--search-results-position, absolute);
        top: var(--search-results-top, calc(100% - 0.4rem));
        left: var(--search-results-left, 1.05rem);
        height: 10rem;
        width: calc(100% - 0.1rem);
        background: white;
        box-shadow: 0px 4px 8px 8px rgb(0 0 0 / 20%);
        overflow-y: auto;
        overflow-x: clip;
    }
    :host > output > ul {
        list-style: none;
        margin: 0;
        padding: 0;
        text-indent: 0;
    }
    :host > output > ul > li {
        display: block;
        list-style: none;
        margin: 0;
        padding: 0.5rem 1rem;
        text-indent: 0;
        width: 100%;
    }
    :host > output > ul > li > a {
        display: inline-block;
        width: 100%;
        height: 100%;
    }
`;
        this.shadowRoot.append(cssStyle);
        const inputId = `search-input-${this.#instanceId}`;
        const label = this.getLabel() ?? document.createElement('label');
        label.htmlFor = inputId;
        label.textContent = this.label;
        this.shadowRoot.append(label);
        const input = this.getInput() ?? document.createElement('input');
        input.id = inputId;
        input.type = 'search';
        input.ariaHasPopup = 'true';
        input.className = this.className;
        input.name = inputId;
        input.placeholder = "Search for items' name";
        input.value = this.value;
        input.addEventListener('input', this.inputInput.bind(this), { capture: true });
        this.shadowRoot.append(input);
        const button = this.getButton() ?? document.createElement('button');
        button.type = 'button';
        button.enterKeyHint = 'search';
        button.textContent = this.#buttonText;
        button.addEventListener('click', this.buttonClick.bind(this), { capture: true });
        this.shadowRoot.append(button);
        const doc = this.getDocument() ?? window.document;
        doc.addEventListener('click', this.clickAnywhere.bind(this), { capture: true });
    }
    inputInput(e: Event): void {
        this.value = (e.currentTarget as HTMLInputElement).value;
    }
    buttonClick(e: Event): void {
        const input = this.getInput();
        if (input != null) {
            this.value = input.value.trim();
        }
    }
    clickAnywhere(e: Event): void {
        const clicked = (e.currentTarget as HTMLElement);
        const me = this.shadowRoot;
        if (me?.contains(clicked)) {
            // we're within the shadow DOM, so do nothing
            return;
        } else {
            // outside the shadow DOM, close the autocomplete
            const output = this.shadowRoot?.querySelector('output');
            if (output != null) {
                output.hidden = true;
            }
        }

    }
    getSearchByGraphQL(value: string): any {
        return {
            query: `query Search($value: String!) {
                search(value: $value) {
                    _id
                    name
                    description
                    originalPrice
                    currentPrice
                    similarProducts            
                }
            }`,
            variables: {
                value: value
            }
        };
    }
    getSearchByJson(value: string): any {
        return {
            name: value
        };
    }
    clearSearch(): void {
        const resultsEl = this.shadowRoot?.querySelector('output');
        if (resultsEl != null) {
            resultsEl.innerHTML = "";
            resultsEl.hidden = true;
        }
    }
    async doSearch(): Promise<void> {
        const value = this.value;
        const query = this.#searchUsesGraphQL ? this.getSearchByGraphQL(value) : this.getSearchByJson(value);
        const response = await fetch(this.#searchUrl, {
            method: this.#searchMethod,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(query)
        });
        const results = (await response.json())?.data.search;
        const resultsEl = this.getOutput() ?? document.createElement('output');
        resultsEl.innerHTML = "";
        resultsEl.hidden = false;
        const resultList = document.createElement('ul');
        if (results == null || results.length === 0) {
            const item = document.createElement('li');
            const noResultsMessage = document.createElement('span');
            noResultsMessage.classList.add('search-autocomplete-item');
            noResultsMessage.classList.add('search-autocomplete-no-results');
            noResultsMessage.textContent = `No products matched the text "${value}"`;
            item.append(noResultsMessage);
            resultList.append(item);
        } else {
            results.map((result: any) => {
                const item = document.createElement('li');
                const productAnchor = document.createElement('a');
                productAnchor.classList.add('search-autocomplete-item');
                productAnchor.href = `#product?id=${result._id}`;
                productAnchor.textContent = result.name;
                productAnchor.title = result.description;
                productAnchor.dataset.originalPrice = result.originalPrice;
                productAnchor.dataset.currentPrice = result.currentPrice;
                item.append(productAnchor);
                return item;
            }).forEach((element: HTMLLIElement) => {
                resultList.append(element);
            });
        }
        resultsEl.append(resultList);
        this.shadowRoot?.append(resultsEl);
    }
}
// Registers the element as a Custom Element with the DOM
customElements.define('search-search', Search);
