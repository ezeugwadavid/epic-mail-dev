import jwt from "jsonwebtoken";
//import pool from '../database/db';
import pool from '../database/dbconnect';


const Auth = {
  /**
   * Verify Token
   * @param {object} req
   * @param {object} res
   * @param {object} next
   * @returns {object|void} response object
   */
  async verifyToken(req, res, next) {
    const token = req.headers.authorization || req.body.token;
    const secret = process.env.SECRET_KEY;

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
