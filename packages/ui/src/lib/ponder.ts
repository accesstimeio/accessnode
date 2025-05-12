import { createClient } from "@ponder/client";
import * as lightSchema from "../../../light/ponder.schema";
import * as fullSchema from "../../../full/ponder.schema";

const NODE_URL = import.meta.env.VITE_ACCESSNODE_URL ? import.meta.env.VITE_ACCESSNODE_URL : "http://localhost:42069";
const schema = import.meta.env.VITE_ACCESSNODE_TYPE == "full" ? fullSchema : lightSchema;
const client = createClient(`${NODE_URL}/sql`, { schema });

export { client, schema };