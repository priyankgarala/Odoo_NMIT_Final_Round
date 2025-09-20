import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { uploadSingle, uploadMultiple } from "../middlewares/uploadMiddleware.js";
import uploadController from "../controllers/uploadController.js";

const router = Router();

router.use(authenticateToken);

router.post("/single", (req, res, next) => {
  uploadSingle(req, res, function (err) {
    if (err) return next(err);
    next();
  });
}, uploadController.upload_single);

router.post("/multiple", (req, res, next) => {
  uploadMultiple(req, res, function (err) {
    if (err) return next(err);
    next();
  });
}, uploadController.upload_multiple);

export default router;


