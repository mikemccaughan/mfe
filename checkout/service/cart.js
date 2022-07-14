import { default as express } from 'express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import { MongoClient, ObjectId } from 'mongodb';
import cors from 'cors';

const schema = buildSchema(`
    input CartProductInput {
        _id: String,
        _cartId: String,
        price: Float,
        quantity: Float
    }
    type CartProduct {
        _id: String,
        _cartId: String,
        price: Float,
        quantity: Float
    }
    type Cart {
        _id: String,
        products: [CartProduct]
    }
    type Query {
        getCart(id: String!): Cart
    }
    type Mutation {
        addToCart(product: CartProductInput!): Cart
        deleteFromCart(product: CartProductInput!): Cart
        updateItemInCart(product: CartProductInput!): Cart
    }
`);

const client = new MongoClient('mongodb://127.0.0.1:27017/MFE');

const root = {
    getCart: async (args) => {
        let cursor = null;
        let results = null;
        try {
            await client.connect();
            const carts = client.db('MFE').collection('Carts');
            const query = { _id: ObjectId(args.id) };
            cursor = carts.query(query);
            results = (await cursor.toArray())?.at(0);
        } catch (e) {
            console.error(e);
        } finally {
            if (cursor) {
                await cursor.close();
            }
            if (client) {
                await client.close();
            }
        }
        return results;
    },
    addToCart: async ({ product }) => {
        let cursor = null;
        let results = null;
        try {
            await client.connect();
            const carts = client.db('MFE').collection('Carts');
            const query = { _id: ObjectId(product._cartId) };
            cursor = carts.query(query);
            results = (await cursor.toArray())?.at(0);
            const existingProduct = results.products.find(p => p._id.toString() === product._id.toString());
            let updateCart = {};
            if (existingProduct != null) {
                console.log('Product already in cart; incrementing quatity');
                updateCart = {
                    $pull: { products: existingProduct },
                    $push: { products: Object.assign(product, { quantity: product.quantity + 1 }) }
                };
            } else {
                updateCart = {
                    $addToSet: { products: product }
                };    
            }
            await carts.updateOne(query, updateCart);
        } catch (e) {
            console.error(e);
        } finally {
            if (cursor) {
                await cursor.close();
            }
            if (client) {
                await client.close();
            }
        }
        return results;
    },
    deleteFromCart: async ({ product }) => {
        let cursor = null;
        let results = null;
        try {
            await client.connect();
            const carts = client.db('MFE').collection('Carts');
            const query = { _id: ObjectId(product._cartId) };
            cursor = carts.query(query);
            results = (await cursor.toArray())?.at(0);
            const existingProduct = results.products.find(p => p._id.toString() === product._id);
            if (existingProduct === null) {
                throw new Error('Could not find the product in the cart, so it will not be deleted');
            }
            let updateCart = {};
            if ((product.quantity ?? 0) === 0 || product.quantity === existingProduct.quantity) {
                console.log('No quantity, a quantity of 0, or a quantity equal to existing quantity; removing from cart.');
                updateCart = {
                    $pull: { products: { _id: ObjectId(product._id) } }
                };
            } else {
                console.log('Updating quantity. Better to use updateProductInCart.');
                updateCart = {
                    $pull: { products: { _id: ObjectId(product._id) } },
                    $push: { products: product }
                }
            }
            await carts.updateOne(query, updateCart);
        } catch (e) {
            console.error(e);
        } finally {
            if (cursor) {
                await cursor.close();
            }
            if (client) {
                await client.close();
            }
        }
        return results;
    },
    updateItemInCart: async ({product}) => {
        let cursor = null;
        let results = null;
        try {
            await client.connect();
            const carts = client.db('MFE').collection('Carts');
            const query = { _id: ObjectId(product._cartId) };
            cursor = carts.query(query);
            results = (await cursor.toArray())?.at(0);
            const existingProduct = results.products.find(p => p._id.toString() === product._id);
            if (existingProduct === null) {
                throw new Error('Could not find the product in the cart, so it will not be updated');
            }
            const updateCart = {
                $pull: { products: { _id: ObjectId(product._id) } },
                $push: { products: product }
            };
            await carts.updateOne(query, updateCart);
        } catch (e) {
            console.error(e);
        } finally {
            if (cursor) {
                await cursor.close();
            }
            if (client) {
                await client.close();
            }
        }
        return results;
    }
};

const app = new express();
app.options('*', cors());
app.use('/cart', cors(), graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
    pretty: true
}));
app.listen(4002, function () {
    console.log('Running a GraphQL API server for search at http://localhost:4002/cart');
});
