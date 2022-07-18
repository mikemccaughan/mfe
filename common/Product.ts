import { ObjectId } from "bson";
export class Product {
    name: string = "";
    description: string = "";
    originalPrice: number = 0;
    currentPrice: number = 0;
    similarTo?: ObjectId[];
    images?: string[];
    get mainImage(): string | undefined { return this.images?.at(0); }
}