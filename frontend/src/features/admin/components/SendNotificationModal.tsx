import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Mail, Smartphone, Bell, Loader2 } from 'lucide-react';
import { useSendNotification, useBroadcastNotification } from '../hooks/useAdmin';

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
}

export function SendNotificationModal({ isOpen, onClose, userId, userEmail }: SendNotificationModalProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('system_alert');
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['all']);
  
  const sendNotification = useSendNotification();
  const broadcastNotification = useBroadcastNotification();
  
  const isBroadcast = userId === 'broadcast';
  const isPending = isBroadcast ? broadcastNotification.isPending : sendNotification.isPending;

  const handleSend = () => {
    if (!title.trim() || !message.trim()) return;

    let payload: any = { title, message, notification_type: type };
    if (isBroadcast) {
      payload.target_regions = selectedRegions;
    }
    
    const callbacks = {
      onSuccess: () => {
        setTitle('');
        setMessage('');
        setType('system_alert');
        onClose();
      },
      onError: (err: any) => {
        console.error("Failed to send notification:", err);
        alert("Failed to send notification. Please try again.");
      }
    };

    if (isBroadcast) {
      broadcastNotification.mutate(payload, callbacks);
    } else {
      sendNotification.mutate({ userId, data: payload }, callbacks);
    }
  };

  const notificationTypes = [
    { id: 'system_alert', label: 'System Alert', icon: Bell },
    { id: 'health_alert', label: 'Health Alert', icon: Mail },
    { id: 'emergency', label: 'Emergency', icon: Smartphone },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-background/80 backdrop-blur-xl border-border/50">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              {isBroadcast ? 'Broadcast Alert' : 'Send Notification'}
            </DialogTitle>
            <DialogDescription>
              {isBroadcast 
                ? <span>Push a manual system-wide alert to <span className="font-semibold text-foreground">All Normal Users</span>.</span>
                : <span>Push a manual alert to <span className="font-semibold text-foreground">{userEmail}</span>.</span>
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase text-foreground/90 tracking-wider font-semibold">Notification Type</label>
              <div className="grid grid-cols-3 gap-2">
                {notificationTypes.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setType(t.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs gap-2 transition-all ${
                        type === t.id
                          ? 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-border/50 bg-muted/30 text-foreground/90 hover:bg-muted/50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase text-foreground/90 tracking-wider font-semibold">Title / Subject</label>
              <Input
                placeholder="e.g. Action Required: Account Review"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-background/50 border-border/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase text-foreground/90 tracking-wider font-semibold">Message Body</label>
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-border/50 resize-none"
                placeholder="Type the detailed message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            
            {isBroadcast && (
              <div className="space-y-2">
                <label className="text-xs uppercase text-foreground/90 tracking-wider font-semibold">Target Regions</label>
                <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto p-2 rounded-md bg-background/50 border border-border/50">
                  <label className="flex items-center space-x-2 cursor-pointer p-1.5 rounded hover:bg-muted/50 col-span-2">
                    <input 
                      type="checkbox" 
                      className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                      checked={selectedRegions.includes('all')}
                      onChange={() => {
                        setSelectedRegions(['all']);
                      }}
                    />
                    <span className="text-sm font-medium">All States / Nationwide</span>
                  </label>
                  {[
                    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
                    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
                    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
                    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", 
                    "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", 
                    "Lakshadweep", "Puducherry"
                  ].map((state) => (
                    <label key={state} className="flex items-center space-x-2 cursor-pointer p-1.5 rounded hover:bg-muted/50">
                      <input 
                        type="checkbox" 
                        className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                        checked={selectedRegions.includes(state)}
                        onChange={() => {
                          let newSelection = selectedRegions.filter(r => r !== 'all');
                          if (newSelection.includes(state)) {
                            newSelection = newSelection.filter(r => r !== state);
                            if (newSelection.length === 0) newSelection = ['all'];
                          } else {
                            newSelection.push(state);
                          }
                          setSelectedRegions(newSelection);
                        }}
                      />
                      <span className="text-sm truncate" title={state}>{state}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button variant="ghost" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={!title.trim() || !message.trim() || isPending}
              className="gap-2"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isPending ? 'Sending...' : (isBroadcast ? 'Broadcast Alert' : 'Dispatch Alert')}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
