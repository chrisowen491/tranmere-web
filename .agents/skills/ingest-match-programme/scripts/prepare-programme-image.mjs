#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const MAX_DOWNLOAD_BYTES = 50 * 1024 * 1024;
const DEFAULT_THRESHOLD = 12;

function usage() {
  return `Usage:
  node prepare-programme-image.mjs --url <image-url> --output <output.png> [--threshold <0-255>]

Downloads an image, applies EXIF orientation, trims near-white outer margins,
and writes a PNG. The download limit is 50 MB.`;
}

function parseArgs(argv) {
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === '--help' || argument === '-h') {
      options.help = true;
      continue;
    }

    if (!['--url', '--output', '--threshold'].includes(argument)) {
      throw new Error(`Unknown argument: ${argument}`);
    }

    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for ${argument}`);
    }

    options[argument.slice(2)] = value;
    index += 1;
  }

  return options;
}

async function readResponse(response) {
  const declaredLength = Number(response.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_DOWNLOAD_BYTES) {
    throw new Error(
      `Image exceeds the ${MAX_DOWNLOAD_BYTES} byte download limit`
    );
  }

  if (!response.body) {
    throw new Error('Image response did not contain a body');
  }

  const chunks = [];
  let totalBytes = 0;

  for await (const chunk of response.body) {
    const buffer = Buffer.from(chunk);
    totalBytes += buffer.length;
    if (totalBytes > MAX_DOWNLOAD_BYTES) {
      throw new Error(
        `Image exceeds the ${MAX_DOWNLOAD_BYTES} byte download limit`
      );
    }
    chunks.push(buffer);
  }

  return Buffer.concat(chunks, totalBytes);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }

  if (!options.url || !options.output) {
    throw new Error(`Both --url and --output are required\n\n${usage()}`);
  }

  const sourceUrl = new URL(options.url);
  if (!['http:', 'https:'].includes(sourceUrl.protocol)) {
    throw new Error('The image URL must use HTTP or HTTPS');
  }

  const threshold =
    options.threshold === undefined
      ? DEFAULT_THRESHOLD
      : Number(options.threshold);
  if (!Number.isInteger(threshold) || threshold < 0 || threshold > 255) {
    throw new Error('--threshold must be an integer between 0 and 255');
  }

  const response = await fetch(sourceUrl, {
    redirect: 'follow',
    signal: AbortSignal.timeout(30_000),
    headers: {
      accept:
        'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'user-agent': 'TranmereWeb programme importer/1.0'
    }
  });

  if (!response.ok) {
    throw new Error(`Image download failed with HTTP ${response.status}`);
  }

  const downloaded = await readResponse(response);
  const original = await sharp(downloaded, { failOn: 'error' }).metadata();

  const { data, info } = await sharp(downloaded, { failOn: 'error' })
    .rotate()
    .flatten({ background: '#ffffff' })
    .trim({ background: '#ffffff', threshold })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer({ resolveWithObject: true });

  if (info.width < 2 || info.height < 2) {
    throw new Error('Cropping produced an empty or effectively blank image');
  }

  const outputPath = resolve(options.output);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, data);

  console.log(
    JSON.stringify(
      {
        sourceUrl: response.url,
        outputPath,
        downloadedBytes: downloaded.length,
        outputBytes: data.length,
        original: {
          format: original.format,
          width: original.width,
          height: original.height
        },
        cropped: {
          format: info.format,
          width: info.width,
          height: info.height
        },
        threshold,
        sha256: createHash('sha256').update(data).digest('hex')
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
