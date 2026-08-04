import { UAParser } from "ua-parser-js";

export function parseDevice(userAgent?: string | null) {
  const parser = new UAParser(userAgent || "");
  return {
    device: parser.getDevice().type ?? "desktop",
    os: parser.getOS().name,
    browser: parser.getBrowser().name,
  };
}
