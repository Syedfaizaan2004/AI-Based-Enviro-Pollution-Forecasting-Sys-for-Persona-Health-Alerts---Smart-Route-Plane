import { useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { HeartPulse, Plus, ShieldAlert, Trash2 } from 'lucide-react';

export function EmergencySettings() {
  const [contacts, setContacts] = useState([
    { id: 1, name: "Dr. Sarah Jenkins", phone: "+1 (555) 123-4567", type: "Doctor" },
    { id: 2, name: "Home", phone: "+1 (555) 987-6543", type: "Family" }
  ]);

  const handleAddContact = () => {
    const name = window.prompt("Enter contact name:");
    if (!name) return;
    const phone = window.prompt("Enter phone number:");
    if (!phone) return;
    const type = window.prompt("Enter relation (e.g. Doctor, Family):") || "Other";
    
    setContacts(prev => [...prev, { id: Date.now(), name, phone, type }]);
  };

  const handleDeleteContact = (id: number) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };
  
  const [autoNotify, setAutoNotify] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Emergency & Sharing</h2>
        <p className="text-muted-foreground mt-1">Manage who gets notified during hazardous air quality events.</p>
      </div>

      <GlassCard className="p-6 space-y-6 border-rose-500/20">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0 mt-1">
            <ShieldAlert className="h-6 w-6 text-rose-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">Auto-Notify Contacts</h3>
            <p className="text-sm text-muted-foreground mb-4">
              If enabled, we will automatically send an SMS to your emergency contacts when you enter a 'Hazardous' AQI zone or log a severe asthma trigger.
            </p>
            <div className="flex items-center gap-3">
              <Button 
                variant={autoNotify ? "default" : "outline"} 
                onClick={() => setAutoNotify(true)}
                className={autoNotify ? "bg-rose-500 hover:bg-rose-600 text-white" : ""}
              >
                Enabled
              </Button>
              <Button 
                variant={!autoNotify ? "default" : "outline"} 
                onClick={() => setAutoNotify(false)}
              >
                Disabled
              </Button>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-primary" /> Emergency Contacts
          </h3>
          <Button size="sm" variant="outline" className="gap-2" onClick={handleAddContact}>
            <Plus className="h-4 w-4" /> Add Contact
          </Button>
        </div>

        {contacts.map((contact) => (
          <GlassCard key={contact.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-foreground">{contact.name}</p>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {contact.type}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{contact.phone}</p>
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0" onClick={() => handleDeleteContact(contact.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
