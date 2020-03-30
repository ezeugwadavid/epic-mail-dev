//import moment from 'moment';
import uuidv4 from 'uuid/v4';
//import pool from '../database/db';
import Helper from "./helpers";
import moment from "moment";
import {Pool} from "pg";
import validRegister from "../validations/register";
import Auth from "./Auth"



const connectionString =
  "postgresql://postgres:66139868AH@localhost:5432/epicmail_db";
const pool = new Pool({
  connectionString: connectionString
});






  


























const mails = {








  /**
   * Create A Message
   * @param {object} req 
   * @param {object} res
   * @returns {object} messages object 
   */
   create(req, res) {
    const senderId = req.user.id
    const decEmail = req.user.email;
    

    const {
      subject, message, toemail, msgstatus
    } = req.body;
    // Return user
    const returnUser = 'select * from users where email = $1';
    const createQuery = `INSERT INTO
    messages(id, senderId, fromemail, subject, message, toemail, msgstatus, created_date)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8)
    returning *`;
    const toMessage = [ uuidv4(), senderId, decEmail, subject, message, toemail, msgstatus, moment().format()];
    const userMessage = 'insert into userMessage (userId, messageId, status) values ($1, $2, $3)';
     pool.query(returnUser, [toemail])
    // check if email exists
      .then((result) => {
        if (result.rowCount !== 0 && (result.rows[0].email !== decEmail)) {
          const  userid  = result.rows[0];
          return pool.query(createQuery, toMessage)
            .then((data) => {

              const newMessage = data.rows[0];

              return pool.query(userMessage, [userid.id, newMessage.id, msgstatus])
                .then(() => res.status(200)
                  .send({
                    success: true,
                    message: 'Success: message sent successfully!',
                    newMessage
                  })).catch(err => res.status(400) 
                  .send({
                    success: false,
                    error: 'Error: message sending failed.'
                  })
                  );
            })
            .catch(err => res.status(500).send({
              success: false,
              message: 'Error: message sending failed.'
            })
           );
        }
        if (result.rows[0].email) {
          return res.status(400).send({
            success: false,
            message: 'Error: Oops! looks like you tried to email yourself.'
          });
        }
        if (result.rowCount === 0) {
          return res.status(400).send({
            success: false,
            message: 'Error: email does not exist.'
          });
        }
      })
      .catch(err => res.status(500).send({
        success: false,
        message: 'Error: email does not exist.'
      }))
  },




   /**
   * Get Mails
   * @param {object} req 
   * @param {object} res
   * @returns {object} messages object 
   */

   getMails(req, res) {
    const { userId } = req.user.id;


    const getMessages = 'select * from messages left join userMessage on userId = $1 order by created_date desc';

    pool.query(getMessages, [userId])
      .then((data) => {
        if (data.rowCount !== 0) {
          const retrievedMessages = data.rows;
          return res.status(200)
            .send({
              success: true,
              message: 'Success: messages retrieved successfully!',
              retrievedMessages
            });
        }
      })
      .catch(err => res.status(500)
        .send({
          success: false,
          message: 'Error: no message found'
        }));
  },




   /**
   * Get Unread
   * @param {object} req 
   * @param {object} res
   * @returns {object} messages object 
   */

   getUnread(req, res) {
     const  email  = req.user.email;
     console.log(email)

    const getUnread = 'select * from messages where toemail = $1 and msgstatus = $2 order by created_date desc';

    pool.query(getUnread, [email, 'unread'])
      .then((data) => {
        if (data.rowCount !== 0) {
          const retrievedMessages = data.rows;
          return res.status(200)
            .send({
              success: true,
              message: 'Success: unread messages retrieved successfully!',
              retrievedMessages
            });
        }
        return res.status(400)
          .send({
           success: false,
            message: 'Error: you have read all your messages'
          });
      })
      .catch(err =>  res.status(500)
        .send({
          success: false,
          message: 'Error: server not responding.'
        }));
  },









   /**
   * Get read
   * @param {object} req 
   * @param {object} res
   * @returns {object} messages object 
   */

  getRead(req, res) {
    const  email  = req.user.email;
    const getRead = 'select * from messages where toemail = $1 and msgstatus = $2 order by created_date desc';
    
    pool.query(getRead, [email, 'read'])
      .then((data) => {
        if (data.rowCount !== 0) {
          const retrievedMessages = data.rows;

          return res.status(200)
            .send({
              success: true,
              message: 'Success: read messages retrieved successfully!',
              retrievedMessages
            });
        }
        return res.status(400)
          .send({
            success: false,
            message: 'Error: you have not read any message'
          });
      })
      .catch(err =>  res.status(500)
        .send({
          success: false,
          message: 'Error: server not responding. Please try again.'
         }));
  },





   /**
   * Get Drafts
   * @param {object} req 
   * @param {object} res
   * @returns {object} messages object 
   */

   getDrafts(req, res) {
    const  userid  = req.user.id;
    const getDraft = 'select * from messages where senderid = $1 and msgstatus = $2 order by created_date desc';

    pool.query(getDraft, [userid, 'draft'])
      .then((data) => {
        if (data.rowCount !== 0) {
          const retrievedMessages = data.rows;
          return res.status(200)
            .send({
              success: true,
              message: 'Success: draft messages retrieved successfully!',
              retrievedMessages
            });
        }
        return res.status(400)
          .send({
            success: false,
            message: 'Error: you have not prepared any message'
          });
      })
      .catch(err => res.status(500)
        .send({
          success: false,
          message: 'Error: server not responding. Please try again.'
        }));
  },









   /**
   * Update Status
   * @param {object} req 
   * @param {object} res
   * @returns {object} messages object 
   */
  updateStatus(req, res) {
    const  email  = req.user.email;
    const  id    = req.body.id;
    const { status } = req.body;
    const updateMessageStatus = 'update messages set msgstatus=$3 where id=$2 and toemail=$1 returning *';

    const values = [email, id, status];

    pool.query(updateMessageStatus, values)
      .then((data) => {
        if (data.rowCount > 0) {
          const editedMessage = data.rows;
          // user message query starts
          return res.status(200)
            .send({
              success: true,
              message: 'Success: message status updated successfully!',
              editedMessage
            });
        }
        // If the message was not found
        return res.status(500)
          .send({
            success: false,
            message: 'Error: message not found',
          });
      })// If the message status was not edited
      .catch((err) => console.log(err) //res.status(500)
      //  .send({
        //  success: false,
        //  message: 'Error: message status could not be edited. Try again'
       // })
        );
  },






   /**
   * Get sentMail
   * @param {object} req 
   * @param {object} res
   * @returns {object} messages object 
   */

  getSentMails(req, res) {
    const { userid } = req.user.id;
    const getSentMessages = 'select * from messages where senderid = $1 and msgstatus = $2 order by createdOn desc';



    pool.query(getSentMessages, [userid, 'sent'])

      .then((data) => {
        if (data.rowCount !== 0) {
          const retrievedMessages = data.rows;
          return res.status(200)
            .send({
              success: true,
              message: 'Success: sent mails retrieved successfully!',
              retrievedMessages
            });
        }
        return res.status(400)
          .send({
            success: false,
            message: 'Error: you have not sent any message'
          });
      })
      .catch(err => res.status(500)
        .send({
          success: false,
          message: 'Error: server not responding. Please try again.'
        }));
  },


























































































































  /**
   * Get All messages
   * @param {object} req 
   * @param {object} res 
   * @returns {object} messages array
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
   * Get A message
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
    const findOneQuery = 'SELECT * FROM messages WHERE id=$1 AND senderId = $2';
    const updateOneQuery =`UPDATE messages
      SET fromEmail=$1, subject=$2, message=$3, toemail=$4, msgstatus=$5, created_date=$6
      WHERE id=$5 AND senderId = $6 returning *`;
    try {
      const { rows } = await pool.query(findOneQuery, [req.params.id, req.user.id]);
      if(!rows[0]) {
        return res.status(404).send({'message': 'message not found'});
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
        return res.status(404).send({'message': 'message not found'});
      }
      return res.status(204).send({ 'message': 'deleted' });
    } catch(error) {
      return res.status(400).send(error);
    }
  }
}

export default mails;