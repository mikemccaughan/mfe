import { v4 as uuidv4, validate, version, NIL, parse } from 'uuid';
import { Utility } from './Utility';
export class Id {
    #value: string = NIL;
    #valueAsBytes: Uint8Array = new Uint8Array(16);
    constructor();
    constructor(value?: string);
    constructor(value?: Uint8Array);
    constructor(value?: string | Uint8Array) {
        if (typeof value === 'string') {
            if (validate(value as string) && version(value as string) === 4) {
                this.#value = value;
                this.#valueAsBytes = parse(value) as Uint8Array;
            } else {
                throw new Error(`"${value}" is not a valid v4 UUID`);
            }
        } else if (value instanceof Uint8Array) {
            if (value.byteLength === 16) {
                const options = { random: value };
                this.#valueAsBytes = value;
                this.#value = uuidv4(options);
            } else {
                throw new Error(`"${value}" does not have the 16 bytes required by a valid v4 UUID`);
            }
        } else if (typeof value === 'undefined') {
            this.#value = uuidv4();
            this.#valueAsBytes = parse(this.#value) as Uint8Array;
        } else {
            throw new Error(`"${value}" could not be parsed as a valid v4 UUID`);
        }
    }
    get value(): string {
        return this.#value;
    }
    set value(id: string) {
        if (validate(id) && version(id) === 4 && this.#value !== id) {
            this.#value = id;
            this.#valueAsBytes = parse(id) as Uint8Array;
        } else if (this.#value !== id) {
            throw new Error(`"${id}" is not a valid v4 UUID`);
        }
    }
    get valueAsBytes(): Uint8Array {
        return this.#valueAsBytes;
    }
    set valueAsBytes(id: Uint8Array) {
        if (id && id.byteLength === 16 && !Utility.typedArraysAreSame(this.#valueAsBytes, id)) {
            const options = { random: id };
            this.#valueAsBytes = id;
            this.#value = uuidv4(options);
        } else if (!Utility.typedArraysAreSame(this.#valueAsBytes, id)) {
            throw new Error(`"${id}" is null, undefined, or does not have the exactly 16 bytes required by a valid v4 UUID`);
        }
    }
}