import {ObjectId} from 'mongodb';

export class Product {
    _id: ObjectId;
    name: string;
    description: string;
    originalPrice: number;
    currentPrice: number;
    similarTo?: ObjectId[];
}