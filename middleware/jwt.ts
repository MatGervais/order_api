import {NextFunction, Request, Response} from "express";
import * as jwt from "jsonwebtoken";


import config from "./../config/config";
import {database} from "../config/database";

import {getUserProfilePicture} from "../service/utils/getUserProfilePicture";

@Service()
export default class JWTService {
  public checkJwt = (req: Request, res: Response, next: NextFunction) => {
    //Get the jwt token from the head

    if (
      req.url !== "/login_check" &&
      req.url !== "/ask-reset-password" &&
      req.url !== "/candidatures" &&
      !req.url.includes("/utils/") &&
      !req.url.includes("/rabbit") &&
      !req.url.includes("/users/confirm-user-token/") &&
      !req.url.includes("/users/confirm-reset-password") &&
      !req.url.includes("/users/confirm-new-password") &&
      !req.url.includes("/users/confirm-user-password/") &&
      !req.url.includes("/users/confirm-user-email/") &&
      !req.url.includes("/settings/school/") &&
      (!req.url.includes("schools") || !req.url.includes("min-informations")) &&
      (!req.url.includes("schools") || !req.url.includes("candidature-page")) &&
      (!req.url.includes("schools") ||
        !req.url.includes("candidature-fields")) &&
      (!req.url.includes("schools") ||
        !req.url.includes("candidature-course-specialty")) &&
      (!req.url.includes("schools") || !req.url.includes("candidature-slots"))
    ) {
      let token = <string>req.headers["authorization"];
      if (token != undefined) {
        if (token.startsWith("Bearer ")) {
          // Remove Bearer from string
          token = token.slice(7, token.length);
        }
      }
      let jwtPayload;

      //Try to validate the token and get data
      try {
        jwtPayload = <any>jwt.verify(token, config.jwtSecret);
        res.locals.jwtPayload = jwtPayload;
      } catch (error) {
        //If token is not valid, respond with 401 (unauthorized)
        res.status(401).send();
        return;
      }

      //The token is valid for 1 hour
      //We want to send a new token on every request
      const { userId, username } = jwtPayload;
      const newToken = jwt.sign({ userId, username }, config.jwtSecret, {
        expiresIn: "3h",
      });

      res.setHeader("token", newToken);
    }
    //Call the next middleware or controller
    next();
  };

  public generateJwt = async (
    user: User & { rank: Rank; gender: Gender }
  ): Promise<Result<string>> => {
    try {
      const profilePicture = await getUserProfilePicture(user.id);

      //TEMP
      const school = await (async () => {
        if (user.rank.label === "ROLE_LEVELUP") {
          return null;
        } else {
          const school_user = await database
            .select("*")
            .from("school_user")
            .where({ user_id: user.id });
          return { id: school_user[0].school_id };
        }
      })();

      // console.log("got school", school);
      const token = jwt.sign(
        {
          id: user.id,
          role: user.rank.label,
          profilePicture,
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
          permissions: user.permissions ? JSON.parse(user.permissions) : "",
          gender: user.gender,
          school,
          email: user.email,
        },
        config.jwtSecret,
        {
          expiresIn: config.tokenDuration,
        }
      );

      return { success: true, value: token };
    } catch (error) {
      console.log(error.message);
      return { success: false, message: error.message };
    }
  };
}
