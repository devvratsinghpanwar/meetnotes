// app/summaries/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trash } from 'lucide-react';
import { toast } from 'sonner';  

type Summary = {
  id: string;
  originalTranscript: string;
  generatedSummary: string;
  customPrompt: string;
  createdAt: string;
};

export default function SummariesPage() {
  const { isSignedIn } = useUser();
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isSignedIn) {
      fetchSummaries();
    }
  }, [isSignedIn]);

  const fetchSummaries = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/summaries');
      const data = await res.json();
      // Sort latest first
      const sortedData = data
        .map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt).toLocaleString(),
        }))
        .sort((a: Summary, b: Summary) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSummaries(sortedData);
    } catch (error) {
      console.error("Failed to fetch summaries:", error);
      toast('Failed to load summaries.', { style: { background: 'red', color: 'white' } });  // Red error toast
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSummary = async (id: string) => {
    try {
      const res = await fetch(`/api/summaries/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast('Summary deleted successfully!', { style: { background: 'green', color: 'white' } });  // Green success toast
      fetchSummaries();  // Refresh list
    } catch (error) {
      console.error("Failed to delete summary:", error);
      toast('Failed to delete summary.', { style: { background: 'red', color: 'white' } });  // Red error toast
    }
  };

  if (!isSignedIn) {
    return <div className="flex justify-center items-center h-screen">Please sign in to view summaries.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Summaries</h1>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : summaries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {summaries.map((sum) => (
            <Card key={sum.id} className="relative">
              <CardHeader>
                <CardTitle className="pr-8">{sum.customPrompt || 'Default Summary'}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2" 
                  onClick={() => deleteSummary(sum.id)}
                >
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{sum.createdAt}</p>
                <p className="text-sm truncate">{sum.generatedSummary}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">No summaries yet. Generate some on the home page!</p>
      )}
    </div>
  );
}
