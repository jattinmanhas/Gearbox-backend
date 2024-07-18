import { Request, Response } from "express";
import { asyncHandler } from "../../utils/handlers/asyncHandler";
import { ApiResponse } from "../../utils/handlers/apiResponse";

export const getShopDetails = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("inside cookie");
    res.cookie("NESTJS", "Cookie Value from frontend", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    });

    return res.status(200).json(new ApiResponse(200, [], "Cookie Set Successfully..."));
  }
);
