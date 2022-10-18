import express from "express";
import { createMessage, getMessages } from "../controllers/messageControllers.js";

const router = express.Router();

router.post("/send", createMessage);
router.get('/',getMessages)
export default router;
