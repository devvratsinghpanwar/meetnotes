// app/summaries/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trash } from 'lucide-react';
import { toast } from 'sonner';
// Import Dialog components from shadcn/ui
import { Textarea } from '@/components/ui/textarea';

type Summary = {
  id: string;
  name?: string;
  originalTranscript?: string;
  generatedSummary?: string;
  customPrompt?: string;
  createdAt: string;
  // For compatibility with main page summaries
  prompt?: string;
  transcript?: string;
  summary?: string;
};

export default function SummariesPage() {
  const { isSignedIn } = useUser();
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // New state to hold the summary selected by the user
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);

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
      const sortedData = data
        .map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt).toLocaleString(),
        }))
        .sort((a: Summary, b: Summary) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSummaries(sortedData);
    } catch (error) {
      console.error("Failed to fetch summaries:", error);
      toast.error('Failed to load summaries.', {
        icon: "❌",
        className: "bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-200 border-red-300 dark:border-red-800"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSummary = async (id: string) => {
    try {
      const res = await fetch(`/api/summaries/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Summary deleted successfully!', {
        icon: "✅",
        className: "bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800"
      });
      fetchSummaries(); // Refresh list
    } catch (error) {
      console.error("Failed to delete summary:", error);
      toast.error('Failed to delete summary.', {
        icon: "❌",
        className: "bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-200 border-red-300 dark:border-red-800"
      });
    }
  };

  if (!isSignedIn) {
    return <div className="flex justify-center items-center h-screen">Please sign in to view summaries.</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">My Summaries</h1>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : summaries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {summaries.map((sum) => (
            <Card
              key={sum.id}
              className="cursor-pointer hover:shadow-lg transition-shadow relative"
              onClick={() => setSelectedSummary(sum)}
            >
              <CardHeader>
                <CardTitle className="pr-8 truncate">{sum.name || sum.customPrompt || sum.prompt || 'Default Summary'}</CardTitle>
                <CardDescription>{sum.createdAt}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{sum.generatedSummary}</p>
              </CardContent>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSummary(sum.id);
                }}
              >
                <Trash className="h-4 w-4 text-red-500" />
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground mt-8">No summaries yet. Generate some on the home page!</p>
      )}

      {/* Custom modal for selected summary */}
      {selectedSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-colors">
          <div className="card-glass rounded-2xl shadow-lg max-w-lg w-full p-6 relative border border-border/70">
            <button
              className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-2xl font-bold transition-colors"
              onClick={() => setSelectedSummary(null)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-2 text-emerald-700 dark:text-emerald-300">{selectedSummary.name || selectedSummary.customPrompt || selectedSummary.prompt || 'Summary Details'}</h2>
            <div className="mb-4">
              <div className="mb-2">
                <span className="font-semibold text-zinc-700 dark:text-zinc-200">Prompt:</span>
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded p-2 mt-1 text-sm text-zinc-800 dark:text-zinc-100 whitespace-pre-line transition-colors">{selectedSummary.customPrompt || selectedSummary.prompt || ''}</div>
              </div>
              <div className="mb-2">
                <span className="font-semibold text-zinc-700 dark:text-zinc-200">Original Transcript:</span>
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded p-2 mt-1 text-xs text-zinc-800 dark:text-zinc-100 whitespace-pre-line max-h-40 overflow-y-auto transition-colors">{selectedSummary.originalTranscript || selectedSummary.transcript || ''}</div>
              </div>
              <div>
                <span className="font-semibold text-zinc-700 dark:text-zinc-200">Generated Summary:</span>
                <div className="bg-zinc-100 dark:bg-zinc-800 rounded p-2 mt-1 text-sm text-zinc-800 dark:text-zinc-100 whitespace-pre-line max-h-40 overflow-y-auto transition-colors">{selectedSummary.generatedSummary || selectedSummary.summary || ''}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}