import "dotenv/config";
import axios from "axios";
import express from "express";
import { encrypt } from "./utils.js";
import { ovo_log } from "./logger.js";

const app = express();

app.use(express.json());

app.post("/ovo/generate", async (req, res) => {
  try {
    const { tid, mid, amount } = req.body;

    let local = new Date();
    local.setMinutes(local.getMinutes() - local.getTimezoneOffset());

    const clientId = process.env.OVO_CLIENT_ID;
    const time = Date.now();
    const method = "POST";
    const url_string = "/mps/H2H/v2/qr/generate";
    const traceNo = Math.round(local.getTime() / 1000);
    const transactionDate = local.toJSON().slice(2, 10).replace(/-/g, "");

    const postData = JSON.stringify({
      tid: tid,
      mid: mid,
      transactionDate: transactionDate,
      traceNo: traceNo,
      amount: amount,
    });

    ovo_log.info("[request_data]", postData);

    const base64url = Buffer.from(postData).toString("base64");
    const seed = clientId + time + method + url_string + base64url;
    const hmac = encrypt(seed);

    let config = {
      method: method,
      url: `${process.env.OVO_URL}${url_string}`,
      headers: {
        "Content-Type": "application/json",
        "client-id": clientId,
        time: time,
        signature: hmac,
      },
      data: postData,
    };

    ovo_log.info("[request_config]", JSON.stringify(config));

    axios(config)
      .then((response) => {
        ovo_log.info("[response_success]", JSON.stringify(response.data));
        res.json(response.data);
      })
      .catch((e) => {
        ovo_log.error("[response_error]", JSON.stringify(e));
        res.json(e);
      });
  } catch (e) {
    ovo_log.error("[catch_error]", JSON.stringify(e.message));
    res.json(e.message);
  }
});

app.post("/ovo/inquiry", async (req, res) => {
  try {
    const { tid, mid, traceNo, refNo } = req.body;

    let local = new Date();
    local.setMinutes(local.getMinutes() - local.getTimezoneOffset());

    const clientId = process.env.OVO_CLIENT_ID;
    const time = Date.now();
    const method = "POST";
    const url_string = "/mps/H2H/v2/qr/inquiry";
    const transactionDate = local.toJSON().slice(2, 10).replace(/-/g, "");

    const postData = JSON.stringify({
      tid: tid,
      mid: mid,
      transactionDate: transactionDate,
      traceNo: traceNo,
      refNo: refNo,
    });

    const base64url = Buffer.from(postData).toString("base64");
    const seed = clientId + time + method + url_string + base64url;
    const hmac = encrypt(seed);

    let config = {
      method: method,
      url: `${process.env.OVO_URL}${url_string}`,
      headers: {
        "Content-Type": "application/json",
        "client-id": clientId,
        time: time,
        signature: hmac,
      },
      data: postData,
    };

    axios(config)
      .then((response) => {
        ovo_log.info("[response_success]", JSON.stringify(response.data));
        res.json(response.data);
      })
      .catch((e) => {
        ovo_log.error("[response_error]", JSON.stringify(e));
        res.json(e);
      });
  } catch (e) {
    ovo_log.error("[catch_error]", JSON.stringify(e.message));
    res.json(e.message);
  }
});

app.post("/ovo/:clientId/v2/callback", async (req, res) => {
  try {
    const clientId = req.params["clientId"];
    const time = req.headers["time"];
    const signature = req.headers["signature"];
    const method = "POST";
    const url_string = `/ovo/${clientId}/v2/callback`;

    const base64url = Buffer.from(JSON.stringify(req.body)).toString("base64");
    const seed = clientId + time + method + url_string + base64url;
    const hmac = encrypt(seed);

    if (signature === hmac) {
      ovo_log.info("[callback_success]", JSON.stringify(req.body));
      return res.status(200).json("OKE");
    }

    throw Error("Bad Data");
  } catch (e) {
    ovo_log.error("[catch_error]", JSON.stringify(e.message));
    res.json(e.message);
  }
});

app.listen(process.env.PORT, process.env.IP_SERVER).on("listening", () => {
  console.log(`🚀 are live on ${process.env.PORT}`);
});
