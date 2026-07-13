import { Router } from "express";

import { signup, updatePassword,  login, createAdmin , createUser , logout , getMe} from "../controllers/auth.controller.js";
import { isAuth, isSuperAdmin, isAdmin} from "../middleware/auth.middleware.js"

const router = Router()




router.post("/signup",signup );
router.put("/update-password", isAuth, updatePassword);
router.post("/login", login);
router.post("/create-admin", isAuth, isSuperAdmin, createAdmin);
router.post("/create-user", isAuth, isAdmin, createUser);
router.post("/logout", isAuth, logout);
router.get("/me", isAuth, getMe);

export default router