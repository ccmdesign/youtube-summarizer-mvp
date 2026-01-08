import { d as defineEventHandler, s as setHeader } from '../../nitro/nitro.mjs';
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

const syncStream_post = defineEventHandler(async (event) => {
  setHeader(event, "Content-Type", "text/event-stream");
  setHeader(event, "Cache-Control", "no-cache");
  setHeader(event, "Connection", "keep-alive");
  const response = event.node.res;
  const sendEvent = (data) => {
    response.write(`data: ${JSON.stringify(data)}

`);
  };
  try {
    await syncPlaylist((progressEvent) => {
      sendEvent(progressEvent);
    });
  } catch (error) {
    sendEvent({
      type: "error",
      error: error instanceof Error ? error.message : String(error)
    });
  } finally {
    response.end();
  }
});

export { syncStream_post as default };
//# sourceMappingURL=sync-stream.post.mjs.map
