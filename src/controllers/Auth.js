import jwt from "jsonwebtoken";
//import pool from '../database/db';
import { Pool } from "pg";
const connectionString =
  "postgresql://postgres:66139868AH@localhost:5432/epicmail_db";
const pool = new Pool({
  connectionString: connectionString
});

const Auth = {
  /**
   * Verify Token
   * @param {object} req
   * @param {object} res
   * @param {object} next
   * @returns {object|void} response object
   */
  async verifyToken(req, res, next) {
    const token = req.headers["x-access-token"] || req.body.token;
    const secret = "justanotherrandomsecretkey";

    if (!token) {
      return res.status(400).send({ message: "Token is not provided" });
    }
    let decoded;
    try {
      decoded = await jwt.verify(token, secret);

      const query = "SELECT * FROM users WHERE id = $1";

      const rows = await pool.query(query, [decoded.userId]);
      if (!rows) {
        return res
          .status(400)
          .send({ message: "The token you provided is invalid" });
      }
      req.user = { id: decoded.userId, email: decoded.userEmail };
      next();
     
      
    } catch (error) {
      return res.status(400).send(error);
    }
  }
};

export default Auth;
