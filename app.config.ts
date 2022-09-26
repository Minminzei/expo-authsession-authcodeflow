import { ExpoConfig, ConfigContext } from "@expo/config";
import "dotenv/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    name: "expo-authsession-authcodeflow",
    slug: "expo-authsession-authcodeflow",
    scheme: "expo-authsession-authcodeflow",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon.png",
        backgroundColor: "#FFFFFF",
      },
    },
    web: {
      favicon: "./assets/images/favicon.png",
    },
    extra: {
      twitterClientId: process.env.TWITTER_CLIENT_ID,
      facebookAppId: process.env.FACEBOOK_APP_ID,
      apiEndPoint: process.env.API_END_POINT,
      codeVerifierForTwitterOAuth2:
        process.env.CODE_VERIFIER_FOR_TWITTER_OAUTH2,
    },
  };
};
