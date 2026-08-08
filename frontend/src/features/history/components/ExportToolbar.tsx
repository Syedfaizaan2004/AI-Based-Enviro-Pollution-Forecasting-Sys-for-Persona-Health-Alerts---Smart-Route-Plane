import { Download, FileJson, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { exportToCSV, exportToJSON } from '../utils/export';
import { useState } from 'react';

interface ExportToolbarProps {
  data: any[];
  filename: string;
}

export function ExportToolbar({ data, filename }: ExportToolbarProps) {
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingJSON, setIsExportingJSON] = useState(false);

  const handleExportCSV = async () => {
    setIsExportingCSV(true);
    // Simulate slight delay for progress animation
    await new Promise(r => setTimeout(r, 600));
    exportToCSV(data, filename);
    setIsExportingCSV(false);
  };

  const handleExportJSON = async () => {
    setIsExportingJSON(true);
    await new Promise(r => setTimeout(r, 600));
    exportToJSON(data, filename);
    setIsExportingJSON(false);
  };

  return (
    <GlassCard className="p-3 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
        <Download className="h-4 w-4" />
        Export Current View
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExportCSV}
          disabled={isExportingCSV || !data?.length}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          {isExportingCSV ? 'Exporting...' : 'CSV'}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExportJSON}
          disabled={isExportingJSON || !data?.length}
          className="gap-2"
        >
          <FileJson className="h-4 w-4" />
          {isExportingJSON ? 'Exporting...' : 'JSON'}
        </Button>
      </div>
    </GlassCard>
  );
}
