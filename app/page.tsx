// app/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Wand2, Mail, Loader2, History, RefreshCcw } from 'lucide-react';

// Define a type for our summary objects for better type safety
type Summary = {
  id: string;
  originalTranscript: string;
  generatedSummary: string;
  customPrompt: string;
  createdAt: string;
};

export default function DashboardPage() {
  const { isSignedIn, user } = useUser();
  const [transcript, setTranscript] = useState('');
  const [prompt, setPrompt] = useState('');
  const [summary, setSummary] = useState('');
  const [recipients, setRecipients] = useState('');
  const [previousSummaries, setPreviousSummaries] = useState<Summary[]>([]);
  
  // Loading states for better UX
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Fetch summaries when the user is signed in
  useEffect(() => {
    if (isSignedIn) {
      fetchSummaries();
    }
  }, [isSignedIn]);

  const fetchSummaries = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch('/api/summaries');
      const data = await res.json();
      // Format the date for better readability
      const formattedData = data.map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt).toLocaleString(),
      }));
      setPreviousSummaries(formattedData);
    } catch (error) {
      console.error("Failed to fetch summaries:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTranscript(`Reading file: ${file.name}...`);
      const reader = new FileReader();
      reader.onload = (event) => {
        setTranscript(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const generateSummary = async () => {
    if (!transcript) {
      alert('Please upload or provide a transcript first.');
      return;
    }
    setIsGenerating(true);
    setSummary('Generating summary, please wait...');
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, prompt: prompt || 'Summarize this meeting transcript.' }),
      });
      const data = await res.json();
      setSummary(data.summary);
      fetchSummaries(); // Refresh previous summaries list
    } catch (error) {
      console.error("Failed to generate summary:", error);
      setSummary('Failed to generate summary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const shareViaEmail = async () => {
    if (!summary || !recipients) {
      alert('Please generate a summary and provide recipient emails.');
      return;
    }
    setIsSending(true);
    try {
      await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary, recipients: recipients.split(',').map(r => r.trim()) }),
      });
      alert('Email sent!');
    } catch (error) {
      console.error("Failed to send email:", error);
      alert('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const loadPrevious = (prev: Summary) => {
    setTranscript(prev.originalTranscript);
    setPrompt(prev.customPrompt);
    setSummary(prev.generatedSummary);
  };
  
  // Render a loading state or a welcome message for signed-out users
  if (!isSignedIn) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center p-4">
        <Wand2 className="h-12 w-12 mb-4 text-primary" />
        <h1 className="text-4xl font-bold mb-2">Welcome to MeetNotes AI</h1>
        <p className="text-lg text-muted-foreground">Please sign in to summarize and share your meeting notes effortlessly.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Main Content: Summarizer Workflow */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-6 w-6" />
                Step 1: Provide a Transcript
              </CardTitle>
              <CardDescription>Upload a .txt file or paste the text directly into the text area below.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input type="file" accept=".txt" onChange={handleUpload} className="mb-4" />
              <Textarea
                placeholder="Or paste your transcript here..."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="h-32"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-6 w-6" />
                Step 2: Generate & Refine Summary
              </CardTitle>
              <CardDescription>Add an optional prompt for specific instructions, then generate your summary. You can edit the result before sharing.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Optional: Enter a custom prompt (e.g., 'Summarize in bullet points for executives')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mb-4"
              />
              <Textarea
                placeholder="Generated Summary will appear here..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="h-48"
              />
            </CardContent>
            <CardFooter>
              <Button onClick={generateSummary} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                {isGenerating ? 'Generating...' : 'Generate Summary'}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-6 w-6" />
                Step 3: Share Your Summary
              </CardTitle>
              <CardDescription>Enter one or more recipient emails, separated by commas.</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="recipient1@example.com, recipient2@example.com"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
              />
            </CardContent>
            <CardFooter>
              <Button onClick={shareViaEmail} disabled={isSending}>
                {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                {isSending ? 'Sending...' : 'Share via Email'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Sidebar: Previous Summaries */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className='flex items-center gap-2'>
                  <History className="h-6 w-6" />
                  History
                </div>
                <Button variant="ghost" size="icon" onClick={fetchSummaries} disabled={isLoadingHistory}>
                  {isLoadingHistory ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                </Button>
              </CardTitle>
              <CardDescription>View and reload your previously generated summaries.</CardDescription>
            </CardHeader>
            <CardContent className="max-h-[60vh] overflow-y-auto">
              {isLoadingHistory ? (
                <div className="flex justify-center items-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : previousSummaries.length > 0 ? (
                <div className="space-y-4">
                  {previousSummaries.map((sum) => (
                    <div key={sum.id} className="border p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">{sum.createdAt}</p>
                      <p className="font-semibold truncate my-1" title={sum.customPrompt || 'Default Summary'}>{sum.customPrompt || 'Default Summary'}</p>
                      <Button variant="link" className="p-0 h-auto" onClick={() => loadPrevious(sum)}>
                        Load this summary
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Your generated summaries will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}