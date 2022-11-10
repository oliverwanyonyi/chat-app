import express from "express";
import { createChat, createGroup, getUserChats } from "../controllers/chatControllers.js";

const router = express.Router();

router.post('/create',createChat);
router.get("/:id",getUserChats);

router.post('/group/create/:admin',createGroup)

export default router;
