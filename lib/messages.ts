import type { ChannelInfo } from './channel';

/** Mensagem que o popup envia ao content script da aba para saber de qual canal ela é. */
export const GET_CHANNEL = 'channel-landing:get-channel';

export interface GetChannelRequest {
  type: typeof GET_CHANNEL;
}

export type GetChannelResponse =
  { ok: true; channel: ChannelInfo } | { ok: false; reason: 'not-channel' | 'unavailable' };

export function isGetChannelRequest(message: unknown): message is GetChannelRequest {
  return (
    typeof message === 'object' &&
    message !== null &&
    (message as { type?: unknown }).type === GET_CHANNEL
  );
}
