import { ObjectId } from "mongodb";
export class Product {
    _id: ObjectId = new ObjectId();
    name: string = "";
    description: string = "";
    originalPrice: number = 0;
    currentPrice: number = 0;
    similarTo?: ObjectId[];
    images?: string[];
    get mainImage(): string | undefined { return this.images?.at(0); }
}