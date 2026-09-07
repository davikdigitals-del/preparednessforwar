import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface MaintenanceDebugInfo {
  tableExists: boolean;
  rowCount: number;
  currentData: any;
  permissions: string[];
  error: string | null;
}

export function MaintenanceDebug() {
  const [debugInfo, setDebugInfo] = useState<MaintenanceDebugInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const info: MaintenanceDebugInfo = {
      tableExists: false,
      rowCount: 0,
      currentData: null,
      permissions: [],
      error: null,
    };

    try {
      // Check if we can query the table
      const { data, error, count } = await supabase
        .from("maintenance_mode")
        .select("*", { count: "exact" });

      if (error) {
        info.error = error.message;
        info.tableExists = false;
      } else {
        info.tableExists = true;
        info.rowCount = count || 0;
        info.currentData = data?.[0] || null;
        info.permissions.push("SELECT");
      }

      // Test update permissions
      if (info.tableExists && info.currentData) {
        const { error: updateError } = await supabase
          .from("maintenance_mode")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", info.currentData.id);

        if (!updateError) {
          info.permissions.push("UPDATE");
        }
      }

    } catch (err: any) {
      info.error = err.message;
    }

    setDebugInfo(info);
    setLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  if (!debugInfo && !loading) return null;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Maintenance Mode Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Status:</span>
          <Button onClick={runDiagnostics} disabled={loading} size="sm" variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {debugInfo && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <span>Table Exists:</span>
                {debugInfo.tableExists ? (
                  <Badge variant="secondary" className="text-green-700 bg-green-100">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Yes
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="w-3 h-3 mr-1" />
                    No
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span>Row Count:</span>
                <Badge variant={debugInfo.rowCount > 0 ? "secondary" : "destructive"}>
                  {debugInfo.rowCount}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span>Permissions:</span>
              <div className="flex gap-1">
                {debugInfo.permissions.map((perm) => (
                  <Badge key={perm} variant="outline">
                    {perm}
                  </Badge>
                ))}
                {debugInfo.permissions.length === 0 && (
                  <Badge variant="destructive">None</Badge>
                )}
              </div>
            </div>

            {debugInfo.currentData && (
              <div className="space-y-2">
                <span className="font-medium">Current Settings:</span>
                <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                  <div>Enabled: {debugInfo.currentData.enabled ? 'true' : 'false'}</div>
                  <div>Message: "{debugInfo.currentData.message}"</div>
                  <div>Estimated Back: {debugInfo.currentData.estimated_back || 'null'}</div>
                  <div>Updated: {new Date(debugInfo.currentData.updated_at).toLocaleString()}</div>
                </div>
              </div>
            )}

            {debugInfo.error && (
              <div className="space-y-2">
                <span className="font-medium text-red-700">Error:</span>
                <div className="bg-red-50 p-3 rounded text-sm text-red-800">
                  {debugInfo.error}
                </div>
              </div>
            )}

            {!debugInfo.tableExists && (
              <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                <div className="font-medium text-yellow-800 mb-2">Fix Required:</div>
                <div className="text-sm text-yellow-700">
                  Run the <code className="bg-yellow-100 px-1 rounded">FIX_MAINTENANCE_MODE.sql</code> script 
                  in your Supabase SQL editor to create the maintenance mode table.
                </div>
              </div>
            )}

            {debugInfo.tableExists && debugInfo.rowCount === 0 && (
              <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                <div className="font-medium text-yellow-800 mb-2">Data Missing:</div>
                <div className="text-sm text-yellow-700">
                  The maintenance_mode table exists but has no data. 
                  Run the <code className="bg-yellow-100 px-1 rounded">FIX_MAINTENANCE_MODE.sql</code> script 
                  to insert the default row.
                </div>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center p-4">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}