// components/UploadDialog.tsx
"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clientLogger } from "@/lib/logger";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface UploadDialogProps {
  prefix: string;
  onSuccess: () => void;
}

export function UploadDialog({ prefix, onSuccess }: UploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    setLoading(true);
    clientLogger.log(`Uploading file: ${file.name} to prefix: ${prefix}`);
    toast.info(`Uploading "${file.name}"...`);

    try {
      const presignedUrlResponse = await fetch("/api/objects/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          prefix,
        }),
      });

      if (!presignedUrlResponse.ok) {
        const errorText = await presignedUrlResponse.text();
        throw new Error(`Failed to get presigned URL: ${errorText}`);
      }

      const { url, fields } = await presignedUrlResponse.json();

      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append("file", file);

      const uploadResponse = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to S3");
      }

      toast.success("File uploaded successfully.");
      onSuccess();
      setOpen(false);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error(`Failed to upload file: ${errorMessage}`);
      clientLogger.error("Error uploading file:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
          setFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>Upload File</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload a File</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            type="file"
            onChange={handleFileChange}
            ref={fileInputRef}
            disabled={loading}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleUpload} disabled={!file || loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
