import express from "express";
import { createChat, createGroup,updateGroup, getUserChats, removeFromGroup, leaveGroup } from "../controllers/chatControllers.js";
import Chat from "../models/Chat.js";

const router = express.Router();

router.post('/create',createChat);
router.get("/:id",getUserChats);

router.post('/group/create/:admin',createGroup)
router.put('/group/update/:admin',updateGroup)
router.put('/group/remove/:admin',removeFromGroup)
router.put('/group/leave/:id',leaveGroup)

export default router;
