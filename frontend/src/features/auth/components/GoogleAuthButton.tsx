import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';

type GoogleButtonText = 'signin_with' | 'signup_with';

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleAccountsId {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type: 'standard';
      theme: 'outline';
      size: 'large';
      text: GoogleButtonText;
      shape: 'rectangular';
      logo_alignment: 'left';
      width: number;
    }
  ) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}

interface GoogleAuthButtonProps {
  text: GoogleButtonText;
  isLoading?: boolean;
  onCredential: (credential: string) => void;
  onError?: (message: string) => void;
}

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
let googleScriptPromise: Promise<void> | null = null;

const loadGoogleScript = () => {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (!googleScriptPromise) {
    googleScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(
        `script[src="${GOOGLE_SCRIPT_SRC}"]`
      );

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Google sign-in failed to load')), {
          once: true,
        });
        return;
      }

      const script = document.createElement('script');
      script.src = GOOGLE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Google sign-in failed to load'));
      document.head.appendChild(script);
    });
  }

  return googleScriptPromise;
};

export const GoogleAuthButton = ({
  text,
  isLoading = false,
  onCredential,
  onError,
}: GoogleAuthButtonProps) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  const [loadError, setLoadError] = useState<string | null>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!clientId) {
      setLoadError('Google sign-in is not configured');
      return;
    }

    let isMounted = true;

    loadGoogleScript()
      .then(() => {
        if (!isMounted || !buttonRef.current || !window.google?.accounts?.id) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          auto_select: false,
          callback: (response) => {
            if (response.credential) {
              onCredentialRef.current(response.credential);
              return;
            }

            onErrorRef.current?.('Google did not return a valid credential');
          },
        });

        buttonRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text,
          shape: 'rectangular',
          logo_alignment: 'left',
          width: Math.min(400, Math.max(buttonRef.current.offsetWidth, 260)),
        });
      })
      .catch(() => {
        if (isMounted) {
          setLoadError('Google sign-in could not be loaded');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [clientId, text]);

  if (loadError) {
    return (
      <Button type="button" variant="outline" className="w-full h-12 rounded-xl" disabled>
        {loadError}
      </Button>
    );
  }

  return (
    <div className={isLoading ? 'pointer-events-none opacity-60' : undefined}>
      <div ref={buttonRef} className="min-h-11 w-full [&>div]:mx-auto" />
    </div>
  );
};
