/**
 * Binary model chunk decoder supporting direct and gzip-compressed streams.
 */
export async function decodeModelResponse(response, expectedBytes, compressed) {
  if (!response.ok) {
    throw new Error(`Failed to load anatomy data chunk: ${response.statusText}`);
  }

  const payload = await response.arrayBuffer();
  const signature = new Uint8Array(payload, 0, Math.min(2, payload.byteLength));
  const isGzip = compressed && signature[0] === 0x1f && signature[1] === 0x8b;

  let buffer;
  if (isGzip && typeof DecompressionStream !== 'undefined') {
    buffer = await new Response(
      new Blob([payload]).stream().pipeThrough(new DecompressionStream('gzip'))
    ).arrayBuffer();
  } else {
    buffer = payload;
  }

  if (buffer.byteLength !== expectedBytes) {
    throw new Error(`Incomplete anatomy chunk (expected ${expectedBytes}, received ${buffer.byteLength})`);
  }

  return buffer;
}
