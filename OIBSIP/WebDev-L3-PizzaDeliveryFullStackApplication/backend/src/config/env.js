import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();
const schema=z.object({NODE_ENV:z.enum(["development","test","production"]).default("development"),PORT:z.coerce.number().int().min(1).max(65535).default(5000),CLIENT_ORIGIN:z.string().url().default("http://localhost:5173"),MONGODB_URI:z.string().min(1,"MONGODB_URI is required"),LOG_LEVEL:z.enum(["fatal","error","warn","info","debug","trace"]).default("info")});
const result=schema.safeParse(process.env);
if(!result.success){console.error("Environment configuration error:",result.error.flatten().fieldErrors);process.exit(1);}
export const env=Object.freeze(result.data);