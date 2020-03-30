//import momentjs from 'momentjs';
import uuidv4 from 'uuid/v4';
import pool from '../database/db';


const gMessage = {
  /**
   * Create A groupMessage
   * @param {object} req 
   * @param {object} res
   * @returns {object} groupMessages object 
   */
  async create(req, res) {
    const createQuery = `INSERT INTO
    GroupMessages(id, senderId, fromEmail, subject, message, toemail, msgstatus, created_date)
      VALUES($1, $2, $3, $4, $5, $6, $7)
      returning *`;
    const values = [
      uuidv4(),
      req.user.id,
      req.body.email,
      req.body.subject,
      req.body.message,
      req.body.toemail,
      req.body.msgstatus,
      NOW()
    ];

    try {
      const { rows } = await pool.query(createQuery, values);
      return res.status(201).send(rows[0]);
    } catch(error) {
      return res.status(400).send(error);
    }
  },
  /**
   * Get All groupMessages
   * @param {object} req 
   * @param {object} res 
   * @returns {object} groupMessages array
   */
  async getAll(req, res) {
    const findAllQuery = 'SELECT * FROM messages INNER JOIN users ON users.email=messages.fromemail WHERE users.id =1$';
    try {
      const { rows, rowCount } = await pool.query(findAllQuery, [req.user.id]);
      return res.status(200).send({ rows, rowCount });
    } catch(error) {
      return res.status(400).send(error);
    }
  },
  /**
   * Get A groupMessage
   * @param {object} req 
   * @param {object} res
   * @returns {object} message object
   */
  async getOne(req, res) {
    const text = 'SELECT * FROM messages INNER JOIN users ON users.email=messages.fromemail WHERE messages.id = 1$ AND users.id = 2$';
    try {
      const { rows } = await pool.query(text, [req.params.id, req.user.id]);
      if (!rows[0]) {
        return res.status(404).send({'message': 'messages not found'});
      }
      return res.status(200).send(rows[0]);
    } catch(error) {
      return res.status(400).send(error)
    }
  },
  /**
   * Update A Message
   * @param {object} req 
   * @param {object} res 
   * @returns {object} updated message
   */
  async update(req, res) {
    const findOneQuery = 'SELECT * FROM GroupMessages WHERE id=$1 AND senderId = $2';
    const updateOneQuery =`UPDATE messages
      SET fromEmail=$1, subject=$2, message=$3, toemail=$4, msgstatus=$5, created_date=$6
      WHERE id=$5 AND senderId = $6 returning *`;
    try {
      const { rows } = await pool.query(findOneQuery, [req.params.id, req.user.id]);
      if(!rows[0]) {
        return res.status(404).send({'message': 'groupMessage not found'});
      }
      const values = [
        req.body.fromEmail || rows[0].fromEmail,
        req.body.subject || rows[0].subject,
        req.body.message || rows[0].message,
        req.body.toemail || rows[0].toemail,
        req.body.msgstatus || rows[0].msgstatus,
        NOW(),
        req.params.id,
        req.user.id
      ];
      const response = await pool.query(updateOneQuery, values);
      return res.status(200).send(response.rows[0]);
    } catch(err) {
      return res.status(400).send(err);
    }
  },
  /**
   * Delete A message
   * @param {object} req 
   * @param {object} res 
   * @returns {void} return statuc code 204 
   */
  async delete(req, res) {
    const deleteQuery = 'DELETE FROM messages WHERE id=$1 AND senderId = $2 returning *';
    try {
      const { rows } = await pool.query(deleteQuery, [req.params.id, req.user.id]);
      if(!rows[0]) {
        return res.status(404).send({'message': 'groupMessage not found'});
      }
      return res.status(204).send({ 'message': 'deleted' });
    } catch(error) {
      return res.status(400).send(error);
    }
  }
}

export default gMessage;