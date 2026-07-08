import http from "k6/http";
import { sleep } from "k6";

export const options = {
  vus: 1000,
  duration: "1m",
};

export default function () {
  http.get("https://www.diecastprotectors.in/checkout");
  sleep(1);
}