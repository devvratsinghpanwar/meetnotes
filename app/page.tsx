// app/page.tsx
"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, Wand2, Mail, Loader2, Download, Save } from "lucide-react"; // Added Save icon
import { toast } from "sonner";

// Import predefined prompts
import {
  ABSTRACT_SUMMARY_PROMPT,
  KEY_POINTS_PROMPT,
  ACTION_ITEMS_PROMPT,
  SENTIMENT_ANALYSIS_PROMPT,
} from "@/app/lib/prompts";

// For .docx download
import { Document, Packer, Paragraph } from "docx";

import { saveAs } from "file-saver";

export default function DashboardPage() {
  const { isSignedIn } = useUser();
  const [transcript, setTranscript] = useState("");
  const [prompt, setPrompt] = useState("");
  const [summary, setSummary] = useState("");
  const [recipients, setRecipients] = useState("");
  const [name, setName] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const generateSummary = async (customPrompt: string = prompt) => {
    if (!transcript) {
      toast.error("Please upload or provide a transcript first.", {
        icon: "❌",
        className: "bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-200 border-red-300 dark:border-red-800"
      });
      return;
    }
    setIsGenerating(true);
    setSummary("Generating summary, please wait...");
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          prompt: customPrompt || "Summarize this meeting transcript.",
        }),
      });
      const data = await res.json();
      setSummary(data.summary);
      toast.success(
        "Summary generated successfully! You can now edit and save.",
        {
          icon: "✅",
          className: "bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800"
        }
      );
    } catch (error) {
      console.error("Failed to generate summary:", error);
      setSummary("Failed to generate summary. Please try again.");
      toast.error("Failed to generate summary. Please try again.", {
        icon: "❌",
        className: "bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-200 border-red-300 dark:border-red-800"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // New function to handle saving the summary
  const handleSaveSummary = async () => {
    if (!summary) {
      toast.error("There is no summary to save.", {
        icon: "❌",
        className: "bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-200 border-red-300 dark:border-red-800"
      });
      return;
    }
    if (!name) {
      toast.error("Please provide a name for your summary.", {
        icon: "⚠️",
        className: "bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-200 border-yellow-300 dark:border-yellow-800"
      });
      return;
    }
    setIsSaving(true);
    try {
      await fetch("/api/save-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, transcript, prompt, summary }),
      });
      toast.success("Summary saved to your history!", {
        icon: "✅",
        className: "bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800"
      });
    } catch (error) {
      console.error("Failed to save summary:", error);
      toast.error("Failed to save summary.", {
        icon: "❌",
        className: "bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-200 border-red-300 dark:border-red-800"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const generateAbstractSummary = () => {
    setPrompt(ABSTRACT_SUMMARY_PROMPT);
    generateSummary(ABSTRACT_SUMMARY_PROMPT);
  };
  const generateKeyPoints = () => {
    setPrompt(KEY_POINTS_PROMPT);
    generateSummary(KEY_POINTS_PROMPT);
  };
  const generateActionItems = () => {
    setPrompt(ACTION_ITEMS_PROMPT);
    generateSummary(ACTION_ITEMS_PROMPT);
  };
  const generateSentimentAnalysis = () => {
    setPrompt(SENTIMENT_ANALYSIS_PROMPT);
    generateSummary(SENTIMENT_ANALYSIS_PROMPT);
  };

  const downloadAsDocx = () => {
    if (!summary) return;
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({ text: "Meeting Summary", heading: "Heading1" }),
            new Paragraph({ text: summary }),
          ],
        },
      ],
    });
    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "meeting-summary.docx");
    });
  };

  const shareViaEmail = async () => {
    if (!summary || !recipients) {
      toast.error("Please generate a summary and provide recipient emails.", {
        icon: "⚠️",
        className: "bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-200 border-yellow-300 dark:border-yellow-800"
      });
      return;
    }
    setIsSending(true);
    try {
      await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary,
          recipients: recipients.split(",").map((r) => r.trim()),
        }),
      });
      toast.success("Email sent!", {
        icon: "✅",
        className: "bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800"
      });
    } catch (error) {
      console.error("Failed to send email:", error);
      toast.error("Failed to send email. Please try again.", {
        icon: "❌",
        className: "bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-200 border-red-300 dark:border-red-800"
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center p-4">
        <Wand2 className="h-12 w-12 mb-4 text-primary" />
        <h1 className="text-4xl font-bold mb-2">Welcome to MeetNotes AI</h1>
        <p className="text-lg text-muted-foreground">
          Please sign in to summarize and share your meeting notes effortlessly.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 flex justify-center">
      <div className="w-full max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-6 w-6" />
              Step 1: Provide a Transcript
            </CardTitle>
            <CardDescription>
              Upload a .txt file or paste the text directly into the text area(max 2500 words)
              below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="file"
              accept=".txt"
              onChange={handleUpload}
              className="mb-4 gap-4"
            />
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
            <CardDescription>
              Add a custom prompt or use a quick summary type, then generate
              your summary.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Optional: Enter a custom prompt (e.g., 'Summarize in bullet points for executives')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mb-4"
            />

            <div className="mb-4 space-y-2">
              <p className="text-sm font-medium">Quick Summary Types:</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={generateAbstractSummary}
                  disabled={isGenerating}
                  className="bg-emerald-300 dark:bg-emerald-500 text-emerald-900 dark:text-white border-none hover:bg-emerald-400 dark:hover:bg-emerald-600 hover:text-white transition-colors"
                >
                  Abstract Summary
                </Button>
                <Button
                  variant="outline"
                  onClick={generateKeyPoints}
                  disabled={isGenerating}
                  className="bg-emerald-300 dark:bg-emerald-500 text-emerald-900 dark:text-white border-none hover:bg-emerald-400 dark:hover:bg-emerald-600 hover:text-white transition-colors"
                >
                  Key Points
                </Button>
                <Button
                  variant="outline"
                  onClick={generateActionItems}
                  disabled={isGenerating}
                  className="bg-emerald-300 dark:bg-emerald-500 text-emerald-900 dark:text-white border-none hover:bg-emerald-400 dark:hover:bg-emerald-600 hover:text-white transition-colors"
                >
                  Action Items
                </Button>
                <Button
                  variant="outline"
                  onClick={generateSentimentAnalysis}
                  disabled={isGenerating}
                  className="bg-emerald-300 dark:bg-emerald-500 text-emerald-900 dark:text-white border-none hover:bg-emerald-400 dark:hover:bg-emerald-600 hover:text-white transition-colors"
                >
                  Sentiment Analysis
                </Button>
              </div>
            </div>

            <Textarea
              placeholder="Generated Summary will appear here..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="h-48"
            />

            {/* New buttons for Save and Download */}
            {summary && (
              <div className="flex flex-col gap-2 mt-4">
                <Input
                  placeholder="Enter a name for your summary"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="max-w-xs"
                />
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    onClick={handleSaveSummary}
                    disabled={isSaving}
                    className="bg-emerald-300 dark:bg-emerald-500 text-emerald-900 dark:text-white hover:bg-emerald-400 dark:hover:bg-emerald-600 hover:text-white transition-colors"
                  >
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {isSaving ? "Saving..." : "Save Summary"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={downloadAsDocx}
                    className="bg-emerald-300 dark:bg-emerald-500 text-emerald-900 dark:text-white hover:bg-emerald-400 dark:hover:bg-emerald-600 hover:text-white transition-colors"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download as DOCX
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => generateSummary()}
              disabled={isGenerating}
              className="bg-emerald-300 dark:bg-emerald-500 text-emerald-900 dark:text-white hover:bg-emerald-400 dark:hover:bg-emerald-600 hover:text-white transition-colors"
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              {isGenerating ? "Generating..." : "Generate with Custom Prompt"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-6 w-6" />
              Step 3: Share Your Summary
            </CardTitle>
            <CardDescription>
              Enter one or more recipient emails, separated by commas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="recipient1@example.com, recipient2@example.com"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
            />
          </CardContent>
          <CardFooter>
            <Button
              onClick={shareViaEmail}
              disabled={isSending}
              className="bg-emerald-300 dark:bg-emerald-500 text-emerald-900 dark:text-white hover:bg-emerald-400 dark:hover:bg-emerald-600 hover:text-white transition-colors"
            >
              {isSending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              {isSending ? "Sending..." : "Share via Email"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
