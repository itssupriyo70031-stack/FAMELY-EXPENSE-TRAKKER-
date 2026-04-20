import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface AuthHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: string;
  errorCode?: string;
}

export function AuthHelpModal({ isOpen, onClose, domain, errorCode }: AuthHelpModalProps) {
  const copyDomain = () => {
    navigator.clipboard.writeText(domain);
    toast.success('Domain copied to clipboard!');
  };

  const isNetworkError = errorCode === 'auth/network-request-failed';
  const isPopupError = errorCode === 'auth/popup-blocked';
  const isCancelledError = errorCode === 'auth/cancelled-popup-request';
  const isInternalError = errorCode === 'auth/internal-error';

  const isSpecialFixNeeded = isNetworkError || isPopupError || isCancelledError || isInternalError;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-[500px]">
        <DialogHeader>
          <div className={`h-12 w-12 rounded-2xl ${isSpecialFixNeeded ? 'bg-amber-500/20' : 'bg-rose-500/20'} flex items-center justify-center mb-4`}>
            <ShieldAlert className={`h-6 w-6 ${isSpecialFixNeeded ? 'text-amber-500' : 'text-rose-500'}`} />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {isNetworkError ? 'Network Connection Error' : 
             isPopupError ? 'Popup Blocked' : 
             isCancelledError ? 'Login Interrupted' :
             isInternalError ? 'Auth Engine Error' :
             'Access Restricted'}
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-base">
            {isNetworkError || isInternalError
              ? "Firebase couldn't finish the login. This usually happens in the 'Preview' mode when browser security segments the connection."
              : isPopupError 
              ? "Your browser blocked the sign-in window. We need it to let you select your Google account."
              : isCancelledError
              ? "The sign-in window was closed too early or multiple clicks were detected."
              : "Firebase is blocking the login because this domain is not on your 'Authorized' list. This is a security feature."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isSpecialFixNeeded ? (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">How to Fix</h4>
              <div className="space-y-4">
                <div className="p-4 bg-zinc-900 rounded-xl border border-emerald-500/30 space-y-2 ring-1 ring-emerald-500/20">
                  <p className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" /> Option 1: Open in New Tab (Recommended)
                  </p>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Click the **"Open in new window"** button at the top right of the editor. Auth works 100% perfectly outside of the restricted iframe.
                  </p>
                </div>
                
                {(isPopupError || isCancelledError) && (
                  <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
                    <p className="text-sm font-bold text-zinc-200">Option 2: Browser Settings</p>
                    <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
                      <li>Check your address bar for a "Popup Blocked" icon and click **Always Allow**.</li>
                      <li>Try refreshing the page and clicking the Sign In button only once.</li>
                    </ul>
                  </div>
                )}

                {isInternalError && (
                  <div className="p-4 bg-zinc-900 rounded-xl border border-rose-500/20 text-rose-200/80 text-xs">
                    This is a known Firebase/Chrome race condition in iframes. Using "Open in new window" is the only permanent fix.
                  </div>
                )}
              </div>
            </div>
          ) : (
            // ... unauthorized domain logic ...
            <>
              <div className="space-y-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">The Problematic Domain</h4>
                <div className="flex items-center gap-2 p-3 bg-zinc-900 rounded-xl border border-zinc-800 group">
                  <code className="text-emerald-400 font-mono text-sm flex-1 truncate">{domain}</code>
                  <Button variant="ghost" size="icon" onClick={copyDomain} className="h-8 w-8 hover:bg-zinc-800">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">How to Fix in 60 Seconds</h4>
                <div className="space-y-3">
                  {[
                    { step: 1, text: "Open Firebase Console", link: "https://console.firebase.google.com/project/gen-lang-client-0256127040/authentication/settings" },
                    { step: 2, text: "Go to Authentication > Settings > Authorized domains" },
                    { step: 3, text: "Click 'Add domain' and paste the URL above" },
                    { step: 4, text: "Save and refresh this page" }
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-4">
                      <div className="h-6 w-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 shrink-0">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-zinc-200">{item.text}</p>
                        {item.link && (
                          <a 
                            href={item.link} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-xs text-emerald-500 hover:underline inline-flex items-center gap-1 mt-1"
                          >
                            Visit Firebase Settings <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="pt-4 border-t border-zinc-800">
          <Button onClick={onClose} className="w-full bg-zinc-100 text-zinc-950 hover:bg-white font-bold h-12 rounded-xl">
            {isNetworkError ? 'Close' : "I Understand, I'll fix it"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
