import { d as defineEventHandler, r as readBody, c as createError } from '../../nitro/nitro.mjs';
import 'zod';
import 'winston';
import 'path';
import 'fs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'better-sqlite3';

const contact_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const name = ((body == null ? void 0 : body.name) || "").trim();
  const email = ((body == null ? void 0 : body.email) || "").trim();
  const message = ((body == null ? void 0 : body.message) || "").trim();
  if (!name || !email || !message) {
    throw createError({ statusCode: 400, statusMessage: "Missing required fields" });
  }
  const emailOk = /.+@.+\..+/.test(email);
  if (!emailOk) {
    throw createError({ statusCode: 422, statusMessage: "Invalid email" });
  }
  console.log("[contact] submission", { name, email, len: message.length });
  return { ok: true };
});

export { contact_post as default };
//# sourceMappingURL=contact.post.mjs.map
