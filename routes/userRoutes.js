import express from "express";
import {
  registerUser,
  authUser,
  allUsers,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(registerUser).get(protect, allUsers);
//here above we chained the request as both post and get
// requests where on same endpoint and protect is used
// as an auth middleware

router.post("/login", authUser);

export default router;
