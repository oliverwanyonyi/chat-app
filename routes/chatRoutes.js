import express from "express";
import { createChat, getUserChats } from "../controllers/chatControllers.js";

const router = express.Router();

router.post('/create',createChat);
router.get("/:id",getUserChats);


export default router;
