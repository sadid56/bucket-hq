export function normalizePath(pathStr: string): string {
  let clean = decodeURIComponent(pathStr).replace(/\\/g, "/");

  clean = clean.replace(/\0/g, "").replace(/\/{2,}/g, "/");

  const segments = clean.split("/");
  const stack: string[] = [];

  for (const segment of segments) {
    if (segment === "" || segment === ".") {
      continue;
    }
    if (segment === "..") {
      if (stack.length === 0) {
        throw new Error("Invalid path traversal detected");
      }
      stack.pop();
    } else {
      stack.push(segment);
    }
  }

  let result = stack.join("/");
  if (clean.endsWith("/") && result !== "") {
    result += "/";
  }
  return result;
}

export function isPathAllowed(requestedPath: string, restrictionPrefix: string): boolean {
  const normRequest = normalizePath(requestedPath);
  const normRestriction = normalizePath(restrictionPrefix);

  if (!normRestriction || normRestriction === "" || normRestriction === "/") {
    return true;
  }

  const restrictionDir = normRestriction.endsWith("/") ? normRestriction : normRestriction + "/";

  return normRequest === normRestriction || normRequest.startsWith(restrictionDir);
}
