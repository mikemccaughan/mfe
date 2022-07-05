export default class Flyout {
    #expanded = false;
    #container: HTMLElement | null = null;

    get expanded() {
        return this.#expanded;
    }

    get container() {
        return this.#container;
    }
    set container(value: HTMLElement | null) {
        this.#container = value;
    }

    constructor(container: HTMLElement | string | null) {
        if (typeof container === 'string') {
            this.container = document.querySelector(container);
        } else {
            this.container = container as HTMLElement;
        }

        if (this.container === null) {
            console.warn(`Could not set the container to an element using ${container}`);
            return;
        }
        this.container!.addEventListener('click', (e) => {
            if ((e.target as HTMLElement).matches('.flyout-toggle,.flyout-toggle *')) {
                this.toggle();
                e.preventDefault();
            }
        });
    }

    toggle(open?: boolean): void {
        if (this.container == null) {
            console.warn('Unable to find the specified container');
            return;
        }
        this.#expanded = open == null ? !this.#expanded : open;
        const flyout = this.container.querySelector('.flyout');
        if (flyout === null) {
            console.warn('Unable to find the element with class "flyout" in the specified container');
            return;
        }
        flyout.setAttribute('aria-expanded', this.expanded.toString());
    }
}