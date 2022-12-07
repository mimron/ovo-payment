import "dotenv/config";
import crypto from "crypto";
import axios from "axios";
import express from "express";
import { ovo_log } from "./logger.js";

const app = express();

app.use(express.json());

app.post("/ovo/generate", async (req, res) => {
  try {
    const { tid, mid, amount } = req.body;

    let local = new Date();
    local.setMinutes(local.getMinutes() - local.getTimezoneOffset());

    const key = process.env.OVO_SECRET_KEY;
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

    const base64url = Buffer.from(postData).toString("base64");
    const seed = clientId + time + method + url_string + base64url;
    const hmac = crypto
      .createHmac("sha256", key)
      .update(seed)
      .digest()
      .toString("base64");

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

app.post("/ovo/inquiry", async (req, res) => {
  try {
    const { tid, mid, traceNo, refNo } = req.body;

    let local = new Date();
    local.setMinutes(local.getMinutes() - local.getTimezoneOffset());

    const key = process.env.OVO_SECRET_KEY;
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
    const hmac = crypto
      .createHmac("sha256", key)
      .update(seed)
      .digest()
      .toString("base64");

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

app.listen(process.env.PORT, process.env.IP_SERVER).on("listening", () => {
  console.log(`🚀 are live on ${process.env.PORT}`);
});
