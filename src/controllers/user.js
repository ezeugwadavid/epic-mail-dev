// import pool from "../database/db";
import Helper from "./helpers";
import uuidv4 from "uuid/v4";
import moment from "moment";
import {Pool} from "pg";
import validRegister from "../validations/register";
import Auth from "./Auth"



const connectionString =
  "postgresql://postgres:66139868AH@localhost:5432/epicmail_db";
const pool = new Pool({
  connectionString: connectionString
});

const User = {
  /**
   * Create A User
   * @param {object} req
   * @param {object} res
   * @returns {object} messages object
   */
  async create(req, res) {
    const { errors, isValid } = validRegister(req.body);

    // Check Validation
    if (!isValid) {
       res.status(400).json({
        status: 400,
        errors
      });
    }

    const { firstName, lastName, email, password } = req.body;

    const hashPassword = Helper.hashPassword(password);
  
    const createQuery = `INSERT INTO
      users(id, firstName, lastName, email, password, created_date )
      VALUES($1, $2, $3, $4, $5, $6)
      returning *`;
    const values = [
      uuidv4(),
      firstName,
      lastName,
      email,
      hashPassword,
      moment().format()
    ];

    try {
     
      const data = await pool.query(createQuery, values);
      
      const token = Helper.generateToken(values[0],values[3]);
      console.log(token)
     return  res.status(201).send({
       'firstName': firstName,
       'lastName': lastName,
       'email': email
     });
    } catch (error) {
       if (error.routine === "_bt_check_unique") {
        return res
          .status(400)
           .send({ message: "User with that EMAIL already exist" });
      }
      console.log(error)
      //res.status(400).send(error);
     
    }
  },
  /**
   * Login
   * @param {object} req
   * @param {object} res
   * @returns {object} user object
   */
  async login(req, res) {
    if (!req.body.email || !req.body.password) {
      return res.status(400).send({ message: "Some values are missing" });
    }
    if (!Helper.isValidEmail(req.body.email)) {
      return res
        .status(400)
        .send({ message: "Please enter a valid email address" });
    }
    const text = "SELECT * FROM users WHERE email = $1";
    try {
      const { rows } = await pool.query(text, [req.body.email]);
      if (!rows[0]) {
        return res
          .status(400)
          .send({ message: "The email you provided is incorrect" });
      }
      if (!Helper.comparePassword(rows[0].password, req.body.password)) {
        return res
          .status(400)
          .send({ message: "The password you provided is incorrect" });
      }
      const token = Helper.generateToken(rows[0].id, rows[0].email);
      console.log(token)
      return res.status(200).send({ message: "login successful!" });
    } catch (error) {
      return res.status(400).send(error);
    }
  },
  /**
   * Delete A User
   * @param {object} req
   * @param {object} res
   * @returns {void} return status code 204
   */
  async delete(req, res) {
    const deleteQuery = "DELETE FROM users WHERE id=$1 returning *";
    const userId = req.user.id
   console.log(userId);
   
    try {
      const  { rows } = await pool.query(deleteQuery, [userId]);
      if (!rows) {
        return res.status(404).send({ message: "user not found" });
      } 
       res.status(200).send({ message: "deleted" });
    } catch (error) {
      console.log(error) 
      res.status(400).send(error);
    }
   // console.log(error)
  }
};

export default User;
