import "babel-polyfill";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import express from "express";
import User from "./src/controllers/user";
import mails from "./src/controllers/messages";
import gMessage from "./src/controllers/groupmessages";
import Auth from "./src/controllers/Auth";
import morgan from "morgan";

dotenv.config();

const app = express();
app.use(morgan('dev'));

//app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/api/v1/messages", Auth.verifyToken, mails.create);
app.get("/api/v1/messages", Auth.verifyToken, mails.getMails);
app.get('/api/v1/messages/unread', Auth.verifyToken, mails.getUnread);
app.get('/api/v1/messages/read', Auth.verifyToken, mails.getRead);
app.get('/api/v1/messages/drafts', Auth.verifyToken, mails.getDrafts);
app.put('/api/v1/messages/updateStatus', Auth.verifyToken, mails.updateStatus);
app.get('/api/v1/messages/sentMail', Auth.verifyToken, mails.getSentMails);


app.get("/api/v1/messages/:id", Auth.verifyToken, mails.getOne);
app.put("/api/v1/messages/:id", Auth.verifyToken, mails.update);
app.delete("/api/v1/messages/:id", Auth.verifyToken, mails.delete);
app.post("/api/v1/users", User.create);
app.post("/api/v1/users/login", User.login);
app.delete("/api/v1/users/me", Auth.verifyToken, User.delete);

app.post("/api/v1/groupMessages", Auth.verifyToken, gMessage.create);
app.get("/api/v1/messages", Auth.verifyToken, gMessage.getAll);
app.get("/api/v1/messages/:id", Auth.verifyToken, gMessage.getOne);
app.put("/api/v1/messages/:id", Auth.verifyToken, gMessage.update);
app.delete("/api/v1/messages/:id", Auth.verifyToken, gMessage.delete);

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
