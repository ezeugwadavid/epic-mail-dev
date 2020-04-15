
import Helper from "./helpers";
import uuidv4 from "uuid/v4";
import moment from "moment";
import pool from "../database/dbconnect";
import validRegister from "../validations/register";
import nodemailer from "nodemailer";

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
        errors,
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
      moment().format(),
    ];

    try {
      const data = await pool.query(createQuery, values);

      const token = Helper.generateToken(values[0], values[3]);
      console.log(token);
      return res.status(201).send({
        firstName: firstName,
        lastName: lastName,
        email: email,
      });
    } catch (error) {
      if (error.routine === "_bt_check_unique") {
        return res
          .status(400)
          .send({ message: "User with that EMAIL already exist" });
      }
      console.log(error);
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
      // console.log(token)
      return res.status(200).send({ message: "login successful!" });
    } catch (error) {
      return res.status(400).send(error);
    }
  },
  /**
   * Delete A User
   * @param {object} req
   * @param {object} res
   * @returns {void} return status code 200
   */
  async delete(req, res) {
    const deleteQuery = "DELETE FROM users WHERE id=$1 returning *";
    const userId = req.user.id;

    try {
      const { rows } = await pool.query(deleteQuery, [userId]);
      if (!rows) {
        return res.status(404).send({ message: "user not found" });
      }
      res.status(200).send({ message: "deleted" });
    } catch (error) {
      console.log(error);
      res.status(400).send(error);
    }
  },

  /**
   * Reset Password
   * @param {object} req
   * @param {object} res
   * @returns {void}
   */

  reset(req, res) {
    const email = req.body.email;
    const getUsers = "select * FROM users WHERE email=$1";
    const tokenid = process.env.TOKEN_ID;
    const token = Helper.generateToken(tokenid, email);
    const output = `
      
      <h3>Click the link below to reset your password</h3>
      <ul>
      <li>Link: <a href='http://recipe-app-restructure.herokuapp.com/contact?token=${token}'>Reset Password</a></li>
      </ul>
      

    `;

    pool
      .query(getUsers, [email])
      .then((result) => {
        if (result.rows[0]) {
          return nodemailer.createTestAccount((err, account) => {
            if (err) {
              console.error("Failed to create a testing account");
              console.error(err);
              //   return process.exit(1);
            }

            console.log("Credentials obtained, sending message...");

            // NB! Store the account object values somewhere if you want
            // to re-use the same account for future mail deliveries

            // Create a SMTP transporter object
            let transporter = nodemailer.createTransport(
              {
                service: "gmail",
                auth: {
                  user: process.env.GMAIL_USER,
                  pass: process.env.GMAIL_PASSWORD,
                },
                logger: true,
                debug: false, // include SMTP traffic in the logs
              },
              {
                // default message fields

                // sender info
                from: "Epic Mail <ebubeezeugwa@gmail.com>",
              }
            );

            // Message object
            let message = {
              // Comma separated list of recipients
              to: email,

              // Subject of the message
              subject: "Reset Password",

              // plaintext body
              text: "Follow the link to reset password",

              // HTML body
              html: output,
            };

            transporter.sendMail(message, (error, info) => {
              if (error) {
                return res.send({
                  success: false,
                  message: "Something went wrong. Pls try again",
                });

                // return process.exit(0)
              }

              transporter.close();
            });

            return res.send({
              message: "Kindly check your email for further instructions",
            });
          });
        }
        return res.status(400).send({
          success: false,
          message: "Error: there is no user with that email. Please try again",
        });
      })

      .catch((err) =>
        res.status(500).send({
          success: false,
          message: "Error: server not responding. Please try again.",
        })
      );
  },

  /**
   * reset password
   * @param {object} req
   * @param {object} res
   * @returns {object} group object
   */

  updatepassword(req, res) {
    const { password } = req.body;
    const hashPassword = Helper.hashPassword(password);
    const userEmail = req.user.email;
    const resetPassword =
      "update users set password=$1 where email=$2 returning *";

    const values = [hashPassword, userEmail];

    pool
      .query(resetPassword, values)
      .then((data) => {
        if (data.rowCount !== 0) {
          const updatedUser = data.rows;
          const myEmail = data.rows[0].email;
          return res.status(200).send({
            success: true,
            message: "Success: password reset successfull!",
            myEmail, // returns the email of the user who updated the password
          });
        }
        return res.status(500).send({
          success: false,
          message: "Error: user not found",
        });
      })
      .catch((err) =>
        res.status(500).send({
          success: false,
          message: "Error: password reset failed. Try again",
        })
      );
  },
};

export default User;
