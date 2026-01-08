import { d as defineEventHandler } from '../../nitro/nitro.mjs';
import { s as syncPlaylist } from '../../_/sync.service.mjs';
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
import 'googleapis';
import 'youtube-transcript';
import '@google/generative-ai';
import 'fs/promises';

const sync_post = defineEventHandler(async () => {
  const result = await syncPlaylist();
  return result;
});

export { sync_post as default };
//# sourceMappingURL=sync.post.mjs.map
