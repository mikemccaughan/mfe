import { default as express } from 'express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import { MongoClient, ObjectId } from 'mongodb';
import cors from 'cors';

const schema = buildSchema(`
    type Product {
        _id: String,
        name: String,
        description: String,
        originalPrice: Float,
        currentPrice: Float,
        similarProducts: [String]
    }
    type Query {
        product(id: String!): Product
    }
`);

const client = new MongoClient('mongodb://127.0.0.1:27017/MFE');

const root = {
    product: async (args) => {
        let cursor = null;
        let results = null;
        try {
            await client.connect();
            const products = client.db('MFE').collection('Products');
            const query = { _id: ObjectId(args.id) };
            cursor = products.find(query);
            results = (await cursor.toArray())?.at(0);
            console.log(`results of searching for "${args.id}":\n${JSON.stringify(results)}`);
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
}

const app = new express();
app.options('*', cors());
app.use('/product', cors(), graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
}));
app.listen(4001, function () {
    console.log('Running a GraphQL API server for product at http://localhost:4001/product');
});
