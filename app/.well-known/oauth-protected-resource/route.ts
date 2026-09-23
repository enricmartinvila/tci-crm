import {
  protectedResourceHandler,
  metadataCorsOptionsRequestHandler,
} from "mcp-handler";

const handler = protectedResourceHandler({
  // ChatGPT discovers this; we authenticate with Bearer workspace API keys
  // (tci_…) rather than a full OAuth authorization server.
  authServerUrls: [
    process.env.NEXT_PUBLIC_APP_URL || "https://tci-crm.vercel.app",
  ],
});

const corsHandler = metadataCorsOptionsRequestHandler();

export { handler as GET, corsHandler as OPTIONS };
