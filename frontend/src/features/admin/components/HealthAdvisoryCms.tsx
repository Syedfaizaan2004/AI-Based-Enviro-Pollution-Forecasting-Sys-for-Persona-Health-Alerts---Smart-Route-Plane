import { useState } from 'react';
import { FileText, Save, X, Loader2, AlertCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { useHealthAdvisories, useUpdateHealthAdvisory } from '../hooks/useAdmin';

export function HealthAdvisoryCms() {
  const { data: advisories, isLoading } = useHealthAdvisories();
  const updateMutation = useUpdateHealthAdvisory();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editGeneral, setEditGeneral] = useState('');
  const [editSensitive, setEditSensitive] = useState('');

  const handleEdit = (id: string, general: string, sensitive: string) => {
    setEditingId(id);
    setEditGeneral(general);
    setEditSensitive(sensitive);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditGeneral('');
    setEditSensitive('');
  };

  const handleSave = async (id: string) => {
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          general_advice: editGeneral,
          sensitive_group_advice: editSensitive,
        }
      });
      setEditingId(null);
    } catch (error) {
      console.error(error);
      alert('Failed to save advisory template.');
    }
  };

  if (isLoading) {
    return <div className="animate-pulse h-96 bg-muted/20 rounded-xl" />;
  }

  const templates = advisories || [];

  const getAqiColor = (minAqi: number) => {
    if (minAqi <= 50) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (minAqi <= 100) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    if (minAqi <= 150) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    if (minAqi <= 200) return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    if (minAqi <= 300) return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
    return 'text-red-900 bg-red-900/10 border-red-900/20';
  };

  return (
    <GlassCard className="overflow-hidden">
      <div className="p-6 border-b border-border/50 flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Health Advisory CMS</h3>
          <p className="text-sm text-foreground/90 mt-1">Manage the content shown to users based on real-time AQI levels.</p>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          {templates.map((template) => {
            const isEditing = editingId === template.id;
            
            return (
              <GlassCard key={template.id} className="p-5 border border-border/50 bg-muted/5 transition-all">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getAqiColor(template.min_aqi)}`}>
                      AQI {template.min_aqi}-{template.max_aqi}
                    </span>
                    <h4 className="font-semibold text-lg">{template.aqi_category}</h4>
                  </div>
                  
                  {!isEditing && (
                    <Button variant="outline" size="sm" onClick={() => handleEdit(template.id, template.general_advice, template.sensitive_group_advice)}>
                      Edit Content
                    </Button>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* General Advice */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" /> General Public
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editGeneral}
                        onChange={(e) => setEditGeneral(e.target.value)}
                        className="w-full min-h-[100px] p-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
                      />
                    ) : (
                      <p className="text-sm p-4 rounded-lg bg-background/50 border border-border/30 h-full">
                        {template.general_advice}
                      </p>
                    )}
                  </div>

                  {/* Sensitive Group Advice */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-rose-500" /> Sensitive Groups
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editSensitive}
                        onChange={(e) => setEditSensitive(e.target.value)}
                        className="w-full min-h-[100px] p-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
                      />
                    ) : (
                      <p className="text-sm p-4 rounded-lg bg-background/50 border border-border/30 h-full">
                        {template.sensitive_group_advice}
                      </p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-border/30">
                    <Button variant="ghost" onClick={handleCancel} disabled={updateMutation.isPending}>
                      <X className="h-4 w-4 mr-2" /> Cancel
                    </Button>
                    <Button onClick={() => handleSave(template.id)} disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}
