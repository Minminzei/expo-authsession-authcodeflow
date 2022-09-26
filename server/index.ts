import express, { Request } from "express";
import "dotenv/config";
import axios from "axios";
import OAuth from "oauth-1.0a";
import crypto from "crypto";
import * as qs from "query-string";

const app = express();
app.use(express.json({ limit: "10mb" }));

const twitterOAuth = new OAuth({
  consumer: {
    key: <string>process.env.TWITTER_CONSUMER_KEY,
    secret: <string>process.env.TWITTER_CONSUMER_SECRET,
  },
  signature_method: "HMAC-SHA1",
  hash_function: (baseString, key) =>
    crypto.createHmac("sha1", key).update(baseString).digest("base64"),
});

interface Params {
  tokenCode: string;
  codeVerifier: string;
  redirectUri: string;
}

function validateParams(data: Params) {
  const { tokenCode, codeVerifier, redirectUri } = data;
  if (!tokenCode || !codeVerifier || !redirectUri) {
    return false;
  }
  return true;
}

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "*");
  if ("OPTIONS" === req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.post("/facebook/access_token", async (req: Request<Params>, res) => {
  try {
    if (!validateParams(req.body)) {
      throw new Error("validation error");
    }
    const { data: token } = await axios({
      url: "https://graph.facebook.com/v14.0/oauth/access_token",
      method: "get",
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: req.body.redirectUri,
        code: req.body.tokenCode,
        code_verifier: req.body.codeVerifier,
      },
    });

    const { data } = await axios({
      url: "https://graph.facebook.com/v14.0/me",
      method: "get",
      params: {
        access_token: token.access_token,
      },
    });
    res.json({
      id: data.id,
      username: data.name,
    });
  } catch (e: any) {
    res.status(400);
    res.json({
      message: e.message,
    });
  }
});

app.post(
  "/twitter/request_token",
  async (req: Request<{ redirectUri: string }>, res) => {
    try {
      const requestUrl = `https://api.twitter.com/oauth/request_token?oauth_callback=${encodeURIComponent(
        req.body.redirectUri
      )}`;
      const authHeader = twitterOAuth.toHeader(
        twitterOAuth.authorize({
          url: requestUrl,
          method: "POST",
        })
      );

      const { data } = await axios({
        url: requestUrl,
        method: "POST",
        headers: {
          Authorization: authHeader["Authorization"],
        },
      });
      const { oauth_token } = qs.parse(data);
      res.json(oauth_token);
    } catch (e: any) {
      res.status(400);
      res.json({
        message: e.message,
      });
    }
  }
);

app.post("/twitter/oauth1/access_token", async (req: Request<Params>, res) => {
  try {
    if (!validateParams(req.body)) {
      throw new Error("validation error");
    }
    const authHeader = twitterOAuth.toHeader(
      twitterOAuth.authorize({
        url: "https://api.twitter.com/oauth/access_token",
        method: "POST",
      })
    );
    const { data } = await axios({
      url: `https://api.twitter.com/oauth/access_token?oauth_verifier=${req.body.codeVerifier}&oauth_token=${req.body.tokenCode}`,
      method: "POST",
      headers: {
        Authorization: authHeader["Authorization"],
      },
    });
    const { screen_name, user_id } = qs.parse(data);
    res.json({
      id: user_id,
      username: screen_name,
    });
  } catch (e: any) {
    res.status(400);
    res.json({
      message: e.message,
    });
  }
});

app.post("/twitter/oauth2/access_token", async (req: Request<Params>, res) => {
  try {
    console.log(req.body);
    if (!validateParams(req.body)) {
      throw new Error("validation error");
    }
    const credential = Buffer.from(
      `${encodeURIComponent(
        process.env.TWITTER_CLIENT_ID as string
      )}:${encodeURIComponent(process.env.TWITTER_CLIENT_SECRET as string)}`
    )
      .toString("base64")
      .replace(/\n/g, "");
    const { data: token } = await axios({
      url: "https://api.twitter.com/2/oauth2/token",
      method: "POST",
      headers: {
        Authorization: `Basic ${credential}`,
      },
      data: {
        code: req.body.tokenCode,
        grant_type: "authorization_code",
        client_id: <string>process.env.TWITTER_CLIENT_ID,
        redirect_uri: req.body.redirectUri,
        code_verifier: req.body.codeVerifier,
      },
    });

    const { data } = await axios({
      url: "https://api.twitter.com/2/users/me",
      method: "GET",
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    });
    res.json({
      id: data.data.id,
      username: data.data.username,
    });
  } catch (e: any) {
    console.log(e);
    res.status(400);
    res.json({
      message: e.message,
    });
  }
});

app.get("/expo-auth-session", async (req, res) => {
  try {
    if (!req.query.authUrl) {
      throw new Error("invalid access");
    }
    const { data } = await axios.get(req.query.authUrl as string);
    console.log(data);
    res.json({});
  } catch (e: any) {
    res.status(400);
    res.json({
      message: e.message,
    });
  }
});

app.get("/facebook/callback", async (req, res) => {
  console.log("body---", req.body);
  console.log("query---", req.query);
  res.json({
    message: "Twitter連携を行いました",
  });
});

app.get("/twitter/callback", async (req, res) => {
  res.json({
    message: "Twitter連携を行いました",
  });
});

app.set("port", 5000);
app.set("hostname", "localhost");

app.listen(5000, () => {
  console.log(
    `🚀 Server ready at http://${app.get("hostname")}:${app.get("port")}`
  );
});
