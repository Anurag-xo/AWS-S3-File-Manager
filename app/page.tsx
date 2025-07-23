"use client";

import NavBar from "@/components/ui/nav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Folder, Download, Calendar, HardDrive } from "lucide-react";
import { useState, useEffect } from "react";

interface FileItem {
  Key: string;
  Size: number;
  LastModified: string;
}

interface ApiResponse {
  files: FileItem[];
  folders: string[];
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Home() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/objects");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
        <NavBar />
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavBar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Files & Folders</h1>

        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200">
              {/* Folders */}
              {data?.folders.map((folder) => (
                <div
                  key={folder}
                  className="flex items-center p-4 hover:bg-gray-50"
                >
                  <Folder className="h-5 w-5 text-blue-500 mr-3" />
                  <span className="font-medium text-gray-900">
                    {folder.replace("/", "")}
                  </span>
                </div>
              ))}

              {/* Files */}
              {data?.files.map((file) => (
                <div
                  key={file.Key}
                  className="flex items-center p-4 hover:bg-gray-50"
                >
                  <FileText className="h-5 w-5 text-gray-500 mr-3" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{file.Key}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <HardDrive className="h-3 w-3 mr-1" />
                      <span className="mr-4">{formatFileSize(file.Size)}</span>
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{formatDate(file.LastModified)}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 text-sm text-gray-500">
          {data?.folders.length || 0} folders, {data?.files.length || 0} files
        </div>
      </div>
    </div>
  );
}
