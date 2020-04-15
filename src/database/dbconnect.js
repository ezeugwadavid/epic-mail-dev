import {Pool} from "pg";
import dotenv from 'dotenv';

dotenv.config();










const connectionString = process.env.DATABASE_URL; 
const pool = new Pool({
  connectionString: connectionString
});

pool.on("connect", () => {
  console.log("connected to the db");
});

export default pool;