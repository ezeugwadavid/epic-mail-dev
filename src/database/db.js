const pool  = require('./dbconnect');
const uuidv4 = require("uuid/v4");
uuidv4();





/**
 * Create messages Table
 */
const createMessagesTable = () => {
  const queryText = `CREATE TABLE IF NOT EXISTS
      messages(
        id UUID PRIMARY KEY,
        senderId UUID NOT NULL,
        lastName CHARACTER VARYING(50) NOT NULL,
        fromEmail CHARACTER VARYING(100) NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        toemail CHARACTER VARYING(100) NOT NULL,
        msgstatus TEXT NOT NULL,
        created_date TIMESTAMP,
        FOREIGN KEY (senderId) REFERENCES users (id) ON DELETE CASCADE
      )`;

  pool
    .query(queryText)
    .then(res => {
      console.log(res);
      pool.end();
    })
    .catch(err => {
      console.log(err);
      //pool.end();
    });
};

/**
 * Create groupmessages Table
 */
const createGroupMessagesTable = () => {
  const queryText = `CREATE TABLE IF NOT EXISTS
      GroupMessages(
        id UUID PRIMARY KEY,
        senderId UUID NOT NULL,
        fromEmail CHARACTER VARYING(100) NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        toemail CHARACTER VARYING(100) NOT NULL,
        msgstatus TEXT NOT NULL,
        created_date TIMESTAMP,
        FOREIGN KEY (senderId) REFERENCES users (id) ON DELETE CASCADE
      )`;

  pool
    .query(queryText)
    .then(res => {
      console.log(res);
      pool.end();
    })
    .catch(err => {
      console.log(err);
      //pool.end();
    });
};

/**
 * Create  userMessageTable Table
 */
const createUserMessageTable = () => {
  const queryText = `CREATE TABLE IF NOT EXISTS
      userMessage(
        userId UUID NOT NULL,
        messageId UUID NOT NULL,
        status TEXT NOT NULL,
        FOREIGN KEY(messageId) references messages(id) on DELETE CASCADE,
        FOREIGN KEY(userId) references users(id) on DELETE CASCADE
         )`;

  pool
    .query(queryText)
    .then(res => {
      console.log(res);
      pool.end();
    })
    .catch(err => {
      console.log(err);
      //pool.end();
    });
};

/**
 * Create  groupTable Table
 */
const createGroupTable = () => {
  const queryText = `CREATE TABLE IF NOT EXISTS
      groups(
        id UUID PRIMARY KEY NOT NULL,
        ownerId UUID NOT NULL,
        name TEXT NOT NULL,
        createdOn TIMESTAMP,
        FOREIGN KEY (ownerId) references users (id) on DELETE CASCADE
         )`;

  pool
    .query(queryText)
    .then(res => {
      console.log(res);
      pool.end();
    })
    .catch(err => {
      console.log(err);
      //pool.end();
    });
};

/**
 * Create  groupMembersTable Table
 */
const createGroupMembersTable = () => {
  const queryText = `CREATE TABLE IF NOT EXISTS
      groupMembers(
        id UUID PRIMARY KEY NOT NULL,
        groupId UUID NOT NULL,
        memberId UUID NOT NULL,
        email TEXT UNIQUE NOT NULL,
        addedOn TIMESTAMP,
        FOREIGN KEY (groupId) references groups (id) on DELETE CASCADE,
        FOREIGN KEY (memberId) references users (id) on DELETE CASCADE
         )`;

  pool
    .query(queryText)
    .then(res => {
      console.log(res);
      pool.end();
    })
    .catch(err => {
      console.log(err);
      //pool.end();
    });
};

/**
 * Create User Table
 */
const createUserTable = () => {
  const queryText = `CREATE TABLE IF NOT EXISTS
      users(
        id UUID PRIMARY KEY,
        firstName CHARACTER VARYING(50) NOT NULL,
        lastName CHARACTER VARYING(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(225) NOT NULL,
        created_date TIMESTAMP DEFAULT NOW()
      )`;

  pool
    .query(queryText)
    .then(res => {
      console.log(res);
      pool.end();
    })
    .catch(err => {
      console.log(err);
      //pool.end();
    });
};

/**
 * Drop messages Table
 */
const dropMessagesTable = () => {
  const queryText = "DROP TABLE IF EXISTS messages returning *";
  pool
    .query(queryText)
    .then(res => {
      console.log(res);
      pool.end();
    })
    .catch(err => {
      console.log(err);
      //pool.end();
    });
};

/**
 * Drop GroupMessages Table
 */
const dropGroupMessagesTable = () => {
  const queryText = "DROP TABLE IF EXISTS GroupMessages returning *";
  pool
    .query(queryText)
    .then(res => {
      console.log(res);
      pool.end();
    })
    .catch(err => {
      console.log(err);
      //pool.end();
    });
};

/**
 * Drop userMessage Table
 */
const dropUserMessageTable = () => {
  const queryText = "DROP TABLE IF EXISTS userMessage returning *";
  pool
    .query(queryText)
    .then(res => {
      console.log(res);
      pool.end();
    })
    .catch(err => {
      console.log(err);
      //pool.end();
    });
};

/**
 * Drop groupTable
 */
const dropGroupTable = () => {
  const queryText = "DROP TABLE IF EXISTS groups returning *";
  pool
    .query(queryText)
    .then(res => {
      console.log(res);
      pool.end();
    })
    .catch(err => {
      console.log(err);
      //pool.end();
    });
};

/**
 * Drop groupMembersTable
 */
const dropGroupMembersTable = () => {
  const queryText = "DROP TABLE IF EXISTS groupMembers returning *";
  pool
    .query(queryText)
    .then(res => {
      console.log(res);
      pool.end();
    })
    .catch(err => {
      console.log(err);
      //pool.end();
    });
};

/**
 * Drop User Table
 */
const dropUserTable = () => {
  const queryText = "DROP TABLE IF EXISTS users returning *";
  pool
    .query(queryText)
    .then(res => {
      console.log(res);
      pool.end();
    })
    .catch(err => {
      console.log(err);
      // pool.end();
    });
};
/**
 * Create All Tables
 */
const createAllTables = () => {
  createMessagesTable();
  createUserTable();
  createGroupMessagesTable();
  createUserMessageTable();
  createGroupTable();
  createGroupMembersTable();
};
/**
 * Drop All Tables
 */
const dropAllTables = () => {
  dropUserTable();
  dropMessagesTable();
  dropGroupMembersTable();
  dropGroupMessagesTable();
  dropGroupTable();
  dropUserMessageTable();
};

//  pool.on("remove", () => {
//    console.log("client removed");
//    process.exit(0);
//  });

module.exports = {
  createMessagesTable,
  createUserTable,
  createGroupMessagesTable,
  createUserMessageTable,
  createGroupTable,
  createGroupMembersTable,
  createUserTable,
  createAllTables,
  dropUserTable,
  dropMessagesTable,
  dropGroupMembersTable,
  dropGroupMessagesTable,
  dropGroupTable,
  dropUserMessageTable,
  dropAllTables,
  pool
};

require("make-runnable");
