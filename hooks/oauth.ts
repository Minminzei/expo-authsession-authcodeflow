import axios from "axios";
import Constants from "expo-constants";

export type Params = {
  tokenCode: string;
  codeVerifier: string;
  redirectUri: string;
};

export type UserData = {
  id: string;
  username: string;
};

export async function facebookAccessToken(params: Params) {
  try {
    const { data } = await axios.post(
      `${Constants.manifest?.extra?.apiEndPoint}/facebook/access_token`,
      params
    );
    return data;
  } catch (e: any) {
    throw e;
  }
}

export async function twitterRequestToken(
  redirectUri: string
): Promise<string> {
  try {
    const { data } = await axios.post(
      `${Constants.manifest?.extra?.apiEndPoint}/twitter/request_token`,
      { redirectUri }
    );
    return data;
  } catch (e: any) {
    throw e;
  }
}

export async function twitterOAuth1AccessToken(
  params: Params
): Promise<UserData> {
  try {
    const { data } = await axios.post(
      `${Constants.manifest?.extra?.apiEndPoint}/twitter/oauth1/access_token`,
      params
    );
    return data;
  } catch (e: any) {
    throw e;
  }
}

export async function twitterOAuth2AccessToken(
  params: Params
): Promise<UserData> {
  try {
    const { data } = await axios.post(
      `${Constants.manifest?.extra?.apiEndPoint}/twitter/oauth2/access_token`,
      params
    );
    return data;
  } catch (e: any) {
    throw e;
  }
}
