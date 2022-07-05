import { default as express } from 'express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import { MongoClient } from 'mongodb';

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
        search(value: String!): [Product]
    }
`);

const client = new MongoClient('mongodb://127.0.0.1:27017/MFE');

const root = {
    search: async (args) => {
        let cursor = null;
        let results = null;
        try {
            await client.connect();
            const products = client.db('MFE').collection('Products');
            const query = { name: { $regex: `.*${args.value}.*` } };
            cursor = products.find(query);
            results = await cursor.toArray();
            console.log(`results: ${JSON.stringify(results)}`)
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
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true
}));
app.listen(4000);
console.log('Running a GraphQL API server for search at http://localhost:4000/graphql');
