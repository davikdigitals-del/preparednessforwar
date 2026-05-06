import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function AdminDebug() {
  const [results, setResults] = useState<any[]>([]);

  const runTest = async (name: string, fn: () => Promise<any>) => {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      setResults(prev => [...prev, { name, success: true, result, duration, error: null }]);
    } catch (error: any) {
      const duration = Date.now() - start;
      setResults(prev => [...prev, { name, success: false, result: null, duration, error: error.message }]);
    }
  };

  const runAllTests = async () => {
    setResults([]);
    
    // Test 1: Check environment
    await runTest("Environment Variables", async () => {
      return {
        url: import.meta.env.VITE_SUPABASE_URL ? "✓ Set" : "✗ Missing",
        key: import.meta.env.VITE_SUPABASE_ANON_KEY ? "✓ Set" : "✗ Missing",
      };
    });

    // Test 2: Check auth
    await runTest("Auth Status", async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user: user?.email || "Not logged in", id: user?.id };
    });

    // Test 3: Test posts table
    await runTest("Posts Table", async () => {
      const { data, error, count } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return { count, accessible: true };
    });

    // Test 4: Test categories table
    await runTest("Categories Table", async () => {
      const { data, error, count } = await supabase
        .from("categories")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return { count, accessible: true };
    });

    // Test 5: Test sections table
    await runTest("Sections Table", async () => {
      const { data, error, count } = await supabase
        .from("sections")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return { count, accessible: true };
    });

    // Test 6: Check admin status
    await runTest("Admin Check", async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");
      
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("is_admin, role")
        .eq("id", user.id)
        .single();
      
      if (error) throw error;
      return profile;
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Debug Panel</h1>
      
      <Button onClick={runAllTests} className="mb-6">
        Run All Tests
      </Button>

      <div className="space-y-4">
        {results.map((result, i) => (
          <div
            key={i}
            className={`p-4 rounded border ${
              result.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold">
                {result.success ? "✓" : "✗"} {result.name}
              </h3>
              <span className="text-sm text-gray-600">{result.duration}ms</span>
            </div>
            {result.success ? (
              <pre className="text-sm bg-white p-2 rounded overflow-auto">
                {JSON.stringify(result.result, null, 2)}
              </pre>
            ) : (
              <div className="text-red-700 text-sm">{result.error}</div>
            )}
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <div className="text-gray-500 text-center py-12">
          Click "Run All Tests" to diagnose connection issues
        </div>
      )}
    </div>
  );
}
