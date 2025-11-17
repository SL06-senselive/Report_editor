"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getAiAssistedInsights } from "@/ai/flows/ai-assisted-insights";
import { Sparkles } from "lucide-react";
import { useState } from "react";

type AIAssistedInsightsButtonProps = {
  onInsight: (insight: string) => void;
  getReportTextContent: () => string;
  getChartDescriptions: () => string;
};

export default function AIAssistedInsightsButton({ onInsight, getReportTextContent, getChartDescriptions }: AIAssistedInsightsButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetInsights = async () => {
    setIsLoading(true);
    toast({
      title: "Generating AI Insights...",
      description: "Please wait while the AI analyzes your report data.",
    });

    try {
      const reportData = getReportTextContent();
      const chartDescriptions = getChartDescriptions();
      
      const result = await getAiAssistedInsights({
        reportData,
        chartDescriptions,
      });

      if (result.insights) {
        onInsight(result.insights);
        toast({
          title: "AI Insights Generated!",
          description: "The conclusion has been updated with AI-powered insights.",
        });
      } else {
        throw new Error("No insights were returned from the AI.");
      }

    } catch (error) {
      console.error("AI Insight generation failed:", error);
      toast({
        title: "Error Generating Insights",
        description: "Could not generate AI insights. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleGetInsights} 
      disabled={isLoading} 
      variant="outline" 
      className="ai-insights-btn"
    >
      <Sparkles className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      {isLoading ? "Analyzing..." : "Get AI Insights"}
    </Button>
  );
}
