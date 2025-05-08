import { createClient } from "@ponder/client";
import { NODE_TYPE } from "@/config";
import * as lightSchema from "../../../light/ponder.schema";

const schema = NODE_TYPE == "full" ? lightSchema : lightSchema;
const client = createClient("http://localhost:42069/sql", { schema });
// todo: get url from env and accessNode-full schema configurations
 
export { client, schema };