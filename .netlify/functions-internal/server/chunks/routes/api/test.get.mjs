import { d as defineEventHandler } from '../../nitro/nitro.mjs';
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

const test_get = defineEventHandler(async () => {
  return {
    message: "API routes are working!",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
});

export { test_get as default };
//# sourceMappingURL=test.get.mjs.map
