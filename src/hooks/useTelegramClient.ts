import { StringSession } from "telegram/sessions";
import { TelegramClient } from "telegram";
import { useEffect, useRef } from "react";

// Official Telegram Web API credentials
const API_ID = 2496;
const API_HASH = "8da85b0d5bfe62527e5b244c209159c3";

export const useTelegramClient = (session: string | null) => {
  const clientRef = useRef<TelegramClient | null>(null);

  if (!clientRef.current) {
    const stringSession = new StringSession(session || "");
    const client = new TelegramClient(stringSession, API_ID, API_HASH, {
      appVersion: "2.2 K",
      systemLangCode: "en-US",
      langCode: "en",
      deviceModel: navigator.userAgent,
      systemVersion: navigator.platform,
      connectionRetries: 5,
    });

    clientRef.current = client;
  }

  useEffect(() => {
    return () => {
      clientRef.current?.destroy();
      clientRef.current = null;
    };
  }, [session]);

  return clientRef.current;
};
