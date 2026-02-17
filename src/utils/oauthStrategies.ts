import { StrategyConfig } from "../types/functions";
import passport from "passport";
import { Strategy as PassportStrategy } from "passport";



// Define the expected type of the constructor for the strategy
type OAuthStrategyConstructor = new (
  options: any,
  verify: (
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: any, user?: any) => void,
  ) => void,
) => PassportStrategy;

// Main function
const setupStrategy = (
  Strategy: OAuthStrategyConstructor,
  config: StrategyConfig,
  callbackURL: string,
  oauthCallback: (
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: any, user?: any) => void,
  ) => void,
): void => {
  passport.use(
    new Strategy(
      {
        clientID: config.clientID,
        clientSecret: config.clientSecret,
        callbackURL,
        scope: ["profile", "email"],
      },
      oauthCallback,
    ),
  );
};

export default setupStrategy;
