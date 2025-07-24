// components/CreateFolderDialog.tsx
"use client";

import { useState } from "react";
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

interface CreateFolderDialogProps {
  prefix: string;
  onSuccess: () => void;
}

export function CreateFolderDialog({
  prefix,
  onSuccess,
}: CreateFolderDialogProps) {
  const [open, setOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateFolder = async () => {
    if (!folderName) {
      toast.error("Folder name cannot be empty.");
      return;
    }
    setLoading(true);
    clientLogger.log(`Creating folder: ${folderName} in prefix: ${prefix}`);
    toast.info(`Creating folder "${folderName}"...`);

    try {
      const response = await fetch("/api/objects/folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefix, folderName }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create folder");
      }

      toast.success("Folder created successfully.");
      onSuccess();
      setOpen(false);
      setFolderName("");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error(`Failed to create folder: ${errorMessage}`);
      clientLogger.error("Error creating folder:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Create Folder</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Folder name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            disabled={loading}
          />
        </div>
        <DialogFooter>
          <Button
            onClick={handleCreateFolder}
            disabled={loading || !folderName}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
