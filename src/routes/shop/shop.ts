import { Router } from "express";
import authMiddleware from '../../middlewares/authMiddleware';
import { getShopDetails } from "../../controllers/shop/shopController";

export const shopRoute = Router();


shopRoute.get('/', getShopDetails)