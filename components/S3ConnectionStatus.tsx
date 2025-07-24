// components/S3ConnectionStatus.tsx
"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { clientLogger } from "@/lib/logger";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Status {
  status: "ok" | "error" | "checking";
  message: string;
}

export function S3ConnectionStatus() {
  const [status, setStatus] = useState<Status>({
    status: "checking",
    message: "Checking S3 connection...",
  });

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/health/s3");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to check S3 status.");
        }

        setStatus({ status: data.status, message: data.message });
        if (data.status === 'ok') {
            clientLogger.log("S3 connection check successful.");
        } else {
            clientLogger.error("S3 connection check failed:", data.message);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        setStatus({
          status: "error",
          message: errorMessage,
        });
        clientLogger.error("Error during S3 connection check:", error);
      }
    };

    checkStatus();
  }, []);

  const getBadgeVariant = () => {
    switch (status.status) {
      case "ok":
        return "success" as any;
      case "error":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant={getBadgeVariant()}>
            S3 Status: {status.status}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{status.message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
