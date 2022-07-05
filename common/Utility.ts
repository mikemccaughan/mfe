type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array;

export class Utility {
    static defaultComparator(a: any, b: any): boolean {
        return (!a && !b) || (a && b && a === b);
    }
    static deepComparator(a: any, b: any): boolean {
        if (typeof a !== typeof b) {
            return false;
        }
        if (['string','number','boolean'].includes(typeof a)) {
            return a === b;
        }
        if (Array.isArray(a) !== Array.isArray(b)) {
            return false;
        }
        if (Array.isArray(a) && Array.isArray(b)) {
            return Utility.arraysAreSame(a, b, Utility.deepComparator);
        }
        if (typeof a === 'object') {
            if (a instanceof Date) {
                return a.valueOf() === b.valueOf();
            }
            if (!Utility.arraysAreSame(Object.entries(a), Object.entries(b))) {
                return false;
            }
        }

        return true;
    }
    static arraysAreSame<T>(a: Array<T>, b: Array<T>, comparator: (a: T, b: T) => boolean = Utility.defaultComparator): boolean {
        return a && b && a.length === b.length && a.every((i, idx) => comparator(i, b[idx]));
    }
    static typedArraysAreSame(a: TypedArray, b: TypedArray): boolean {
        return a && b && a.length === b.length && a.every((val, idx) => val === b[idx]);
    }
}