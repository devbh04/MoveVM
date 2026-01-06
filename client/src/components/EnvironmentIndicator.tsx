import { useEffect, useState } from 'react';
import { Badge } from './ui/badge';
import { getApiUrl } from '../lib/config';
import { Server, Database } from 'lucide-react';

interface EnvironmentStatus {
  environment: 'production' | 'local';
  vmAvailable: boolean;
  message: string;
}

export default function EnvironmentIndicator() {
  const [status, setStatus] = useState<EnvironmentStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch(getApiUrl('status'));
      const data = await response.json();
      if (data.success) {
        setStatus({
          environment: data.environment,
          vmAvailable: data.vmAvailable,
          message: data.message
        });
      }
    } catch (error) {
      console.error('Failed to fetch environment status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !status) return null;

  return (
    <Badge 
      variant="outline" 
      className={`text-xs ${
        status.environment === 'production' 
          ? 'bg-blue-600/20 text-blue-400 border-blue-500/50' 
          : 'bg-green-600/20 text-green-400 border-green-500/50'
      }`}
      title={status.message}
    >
      {status.environment === 'production' ? (
        <Database className="w-3 h-3 mr-1" />
      ) : (
        <Server className="w-3 h-3 mr-1" />
      )}
      {status.environment.toUpperCase()}
      {!status.vmAvailable && ' (Demo)'}
    </Badge>
  );
}
