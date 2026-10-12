#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const MAX_BYTES = 50 * 1024 * 1024;

function argumentsFrom(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!['--file', '--url', '--output'].includes(key) || !value) {
      throw new Error(
        'Use --file <path> or --url <https-url>, plus --output <path.jpg>.'
      );
    }
    options[key.slice(2)] = value;
  }
  if (Boolean(options.file) === Boolean(options.url) || !options.output) {
    throw new Error('Supply exactly one of --file and --url, plus --output.');
  }
  if (!/\.jpe?g$/i.test(options.output)) {
    throw new Error('The output filename must end in .jpg or .jpeg.');
  }
  if (options.file && resolve(options.file) === resolve(options.output)) {
    throw new Error('The output must not overwrite the source file.');
  }
  return options;
}

async function download(urlText) {
  const url = new URL(urlText);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('The source URL must use HTTP or HTTPS.');
  }
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok || !response.body) {
    throw new Error(`Image download failed: HTTP ${response.status}.`);
  }
  const declaredSize = Number(response.headers.get('content-length'));
  if (declaredSize > MAX_BYTES)
    throw new Error('Image exceeds the 50 MB limit.');

  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.byteLength;
    if (size > MAX_BYTES) throw new Error('Image exceeds the 50 MB limit.');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks, size);
}

async function main() {
  const options = argumentsFrom(process.argv.slice(2));
  let input;
  if (options.file) {
    const source = await stat(options.file);
    if (source.size > MAX_BYTES)
      throw new Error('Image exceeds the 50 MB limit.');
    input = await readFile(options.file);
  } else {
    input = await download(options.url);
  }

  await sharp(input, { failOn: 'error' })
    .rotate()
    .jpeg({ quality: 95 })
    .toFile(options.output);

  const output = await readFile(options.output);
  const metadata = await sharp(output).metadata();
  console.log(
    JSON.stringify({
      output: resolve(options.output),
      width: metadata.width,
      height: metadata.height,
      bytes: output.byteLength,
      sha256: createHash('sha256').update(output).digest('hex')
    })
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
