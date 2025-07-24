// components/FileTable.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Folder, File, Trash2, Download, Loader2 } from "lucide-react";
import { clientLogger } from "@/lib/logger";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FileItem {
  key: string;
  size?: number;
  lastModified?: Date;
  type: "file" | "folder";
}

interface FileTableProps {
  prefix: string;
  setPrefix: (prefix: string) => void;
  refresh: boolean;
}

export function FileTable({ prefix, setPrefix, refresh }: FileTableProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver>();

  const fetchFiles = useCallback(
    async (cursor?: string) => {
      setLoading(true);
      setError(null);
      clientLogger.log(`Fetching files for prefix: "${prefix}"`, { cursor });
      try {
        const response = await fetch(
          `/api/objects?prefix=${prefix}&cursor=${cursor || ""}`
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to fetch files: ${response.status} ${response.statusText} - ${errorText}`
          );
        }

        const data = await response.json();
        setFiles((prev) => (cursor ? [...prev, ...data.files] : data.files));
        setNextCursor(data.nextCursor);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred.";
        setError(errorMessage);
        toast.error(errorMessage);
        clientLogger.error("Error fetching files:", err);
      } finally {
        setLoading(false);
      }
    },
    [prefix]
  );

  useEffect(() => {
    setFiles([]);
    setNextCursor(undefined);
    fetchFiles();
  }, [prefix, refresh, fetchFiles]);

  const lastFileElementRef = useCallback(
    (node: HTMLTableRowElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && nextCursor) {
          fetchFiles(nextCursor);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, nextCursor, fetchFiles]
  );

  const handleFolderClick = (key: string) => {
    setPrefix(key);
  };

  const handleDelete = async (key: string) => {
    clientLogger.log(`Attempting to delete file: ${key}`);
    const originalFiles = [...files];
    setFiles((prev) => prev.filter((file) => file.key !== key));
    toast.info(`Deleting ${key}...`);

    try {
      const response = await fetch(`/api/objects`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to delete file");
      }

      toast.success("File deleted successfully.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error(`Failed to delete file: ${errorMessage}`);
      setFiles(originalFiles);
      clientLogger.error("Error deleting file:", error);
    }
  };

  const handleDownload = (key: string) => {
    clientLogger.log(`Downloading file: ${key}`);
    try {
      const downloadUrl = `/api/objects/download?key=${encodeURIComponent(key)}`;
      window.open(downloadUrl, "_blank");
      toast.success(`Downloading ${key}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error(`Failed to download file: ${errorMessage}`);
      clientLogger.error("Error initiating download:", error);
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Files</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file, index) => {
              const isLastFile = index === files.length - 1;
              return (
                <TableRow
                  ref={isLastFile ? lastFileElementRef : null}
                  key={file.key}
                >
                  <TableCell
                    className="cursor-pointer hover:underline"
                    onClick={() =>
                      file.type === "folder" && handleFolderClick(file.key)
                    }
                  >
                    <div className="flex items-center gap-2">
                      {file.type === "folder" ? (
                        <Folder className="text-blue-500" />
                      ) : (
                        <File className="text-gray-500" />
                      )}
                      {file.key.replace(prefix, "")}
                    </div>
                  </TableCell>
                  <TableCell>
                    {typeof file.size === "number"
                      ? formatBytes(file.size)
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {file.lastModified
                      ? new Date(file.lastModified).toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {file.type === "file" && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDownload(file.key)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(file.key)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {loading && (
          <div className="flex justify-center items-center p-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-2">Loading...</p>
          </div>
        )}
        {error && (
          <div className="text-center p-4 text-red-500">
            <p>{error}</p>
            <Button onClick={() => fetchFiles()} className="mt-2">
              Retry
            </Button>
          </div>
        )}
        {!loading && !error && files.length === 0 && (
          <p className="text-center p-4">No files found.</p>
        )}
      </CardContent>
    </Card>
  );
}
