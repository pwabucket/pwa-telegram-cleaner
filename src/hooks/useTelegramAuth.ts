import type { TelegramClient } from "telegram";
import { useCallback, useEffect, useRef, useState } from "react";

interface TelegramAuthHandlers {
  phone: ((data: string) => Promise<void>) | null;
  code: ((data: string) => Promise<void>) | null;
  password: ((data: string) => Promise<void>) | null;
}

interface ProcessingRef {
  resolve: ((value?: unknown) => void) | null;
  reject: ((reason?: unknown) => void) | null;
}

type AuthStage = "phone" | "code" | "password";

export const useTelegramAuth = (client: TelegramClient | null) => {
  const [initialized, setInitialized] = useState(false);
  const [stage, setStage] = useState<AuthStage>("phone");
  const [handlers, setHandlers] = useState<TelegramAuthHandlers>({
    phone: null,
    code: null,
    password: null,
  });

  const processingRef = useRef<ProcessingRef>({
    resolve: null,
    reject: null,
  });

  /** Set Processing Resolver */
  const setProcessingResolver = useCallback(() => {
    return new Promise((resolve, reject) => {
      processingRef.current = { resolve, reject };
    });
  }, []);

  /** Create Handler */
  const createHandler = useCallback(
    (stage: AuthStage) => () =>
      new Promise<string>((resolve) => {
        /** Resolve Previous */
        processingRef.current?.resolve?.();

        /** Set Stage */
        setStage(stage);

        /** Store Handler */
        setHandlers((prev) => ({
          ...prev,
          [stage]: (data: string) => {
            resolve(data);
            return setProcessingResolver();
          },
        }));
      }),
    [setStage, setHandlers, setProcessingResolver]
  );

  /** Initialize Auth */
  useEffect(() => {
    if (client) {
      /** Set Promise */
      setProcessingResolver().then(() => {
        setInitialized(true);
      });

      /** Start Client */
      client
        .start({
          phoneNumber: createHandler("phone"),
          phoneCode: createHandler("code"),
          password: createHandler("password"),

          onError: (error) => {
            /** Log Error */
            console.error(error);

            /** Reject */
            processingRef.current?.reject?.(error);
          },
        })
        .then(() => {
          // Authorized
        });

      return () => {
        client.isUserAuthorized().then((status) => {
          if (status === false) {
            client.destroy();
          }
        });
      };
    }
  }, [client, createHandler, setInitialized, setProcessingResolver]);

  return { stage, handlers, initialized };
};
