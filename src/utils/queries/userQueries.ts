import sequelize from "../../database/dbConnection";
import { QueryTypes } from "sequelize";

interface userResetTokenDetails{
  id: number;
  email: string;
  resetPasswordCode: string;
  expiredTimeOfResetPasswordCode: Date;
}

export const getUserResetTokenAndDetails = async (resetToken: string) : Promise<userResetTokenDetails | false> => {
  try {
    const [results , metadata] = await sequelize.query(
      `
        SELECT "user"."email", "user"."id", "userAuth"."resetPasswordCode", "userAuth"."expiredTimeOfResetPasswordCode"
        FROM "users" as "user"
        LEFT JOIN "userAuthSettings" as "userAuth" ON "user"."id" = "userAuth"."userId"
        WHERE "userAuth"."resetPasswordCode" = :resetToken
    `,
      {
        replacements: { resetToken },
        type: QueryTypes.SELECT,
      }
    );

    return results as userResetTokenDetails;

  } catch (error) {
    console.log("Error executing raw query: ", error);
    return false;
  }
};
