/** Runtime endpoints shared by every browser-facing Lingo surface.
 *
 * A deployed browser must never fall back to localhost: that points at the
 * visitor's machine, not the Azure agent service. Configure the public Azure
 * backend with NEXT_PUBLIC_LINGO_API_URL in Vercel instead.
 */
const configuredApiUrl = process.env.NEXT_PUBLIC_LINGO_API_URL?.trim().replace(/\/$/, "");

export const hasAgentBackend = Boolean(configuredApiUrl);
export const agentApiBaseUrl = configuredApiUrl ?? "";

export function agentApi(path: string) {
  return configuredApiUrl ? `${configuredApiUrl}${path}` : path;
}

export function agentWebSocket(path: string) {
  if (!configuredApiUrl) return null;
  return `${configuredApiUrl.replace(/^http/, "ws")}${path}`;
}
