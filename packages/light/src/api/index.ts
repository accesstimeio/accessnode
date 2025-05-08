import { db } from "ponder:api";
import schema from "ponder:schema";
import { Hono } from "hono";
import { client, graphql } from "ponder";

const app = new Hono();

app.use("/", async (c) => c.json({
    version: "0.1.0",
    type: "light"
}));
app.use("/sql/*", client({ db, schema }));
app.use("/graphql", graphql({ db, schema }));

export default app;
