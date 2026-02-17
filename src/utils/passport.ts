import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile as GoogleProfile,
} from "passport-google-oauth20";

import { usersModel } from "../models";
import setupStrategy from "./oauthStrategies";
import { getters } from "../config";


type OAuthProfile = GoogleProfile ;

type OAuthStrategyConfig = {
  Strategy: any; // Strategy class (from passport-*)
  clientID: string;
  clientSecret: string;
  callbackURL: string;
}

const strategies: Record<string, OAuthStrategyConfig> = {
  google: {
    Strategy: GoogleStrategy,
    clientID: getters.getAppSecrets().googleClientId,
    clientSecret: getters.getAppSecrets().googleClientSecret,
    callbackURL: getters.getAppSecrets().googleRedirectUrl,
  },
};

const oauthCallback = async (
  accessToken: string,
  refreshToken: string,
  profile: OAuthProfile,
  done: (error: any, user?: any) => void,
) => {
  try {
    console.log(profile);
    return done(null, { accessToken, profile, refreshToken });
  } catch (err) {
    console.error(err);
    return done(err, false);
  }
};

// Setup strategies
Object.keys(strategies).forEach((key) => {
  const { Strategy, clientID, clientSecret, callbackURL } = strategies[key];
  setupStrategy(
    Strategy,
    {
      clientID,
      clientSecret,
    },
    callbackURL,
    oauthCallback,
  );
});

// Serialize and deserialize user
passport.serializeUser((user: any, done:any) => {
  console.log("Hello From Serialize");
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done:any) => {
  console.log("Hello From deserialize");
  try {
    const user = await usersModel.findUsersById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export  {passport};
