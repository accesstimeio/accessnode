import { createClient } from "@ponder/client";
import * as lightSchema from "../../../light/ponder.schema";

const NODE_URL = import.meta.env.ACCESSNODE_URL ? import.meta.env.ACCESSNODE_URL : "http://localhost:42069";
const schema = import.meta.env.ACCESSNODE_TYPE == "full" ? lightSchema : lightSchema;
const client = createClient(`${NODE_URL}/sql`, { schema });
// todo: accessNode-full schema configurations

export { client, schema };