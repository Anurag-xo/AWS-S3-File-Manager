// app/page.tsx
"use client";

import { useState } from "react";
import { FileTable } from "@/components/FileTable";
import { CreateFolderDialog } from "@/components/CreateFolderDialog";
import { UploadDialog } from "@/components/UploadDialog";
import { clientLogger } from "@/lib/logger";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { S3ConnectionStatus } from "@/components/S3ConnectionStatus";

export default function Home() {
  const [prefix, setPrefix] = useState("");
  const [refresh, setRefresh] = useState(false);

  const handleUploadSuccess = () => {
    clientLogger.log("Upload successful, refreshing file list.");
    setRefresh((prev) => !prev);
  };

  const handleCreateFolderSuccess = () => {
    clientLogger.log("Folder creation successful, refreshing file list.");
    setRefresh((prev) => !prev);
  };

  const handleBreadcrumbClick = (index: number) => {
    const newPrefix = prefix.split("/").slice(0, index + 1).join("/");
    setPrefix(newPrefix === "" ? "" : newPrefix + "/");
  };

  const breadcrumbItems = prefix.split("/").filter(Boolean);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-bold">S3 File Manager</h1>
        <div className="flex items-center gap-4">
          <SignedIn>
            <S3ConnectionStatus />
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton />
          </SignedOut>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <SignedIn>
          <div className="flex items-center justify-between mb-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#" onClick={() => setPrefix("")}>
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbItems.map((item, index) => (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem key={index}>
                      {index === breadcrumbItems.length - 1 ? (
                        <BreadcrumbPage>{item}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          href="#"
                          onClick={() => handleBreadcrumbClick(index)}
                        >
                          {item}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex gap-2">
              <CreateFolderDialog
                prefix={prefix}
                onSuccess={handleCreateFolderSuccess}
              />
              <UploadDialog
                prefix={prefix}
                onSuccess={handleUploadSuccess}
              />
            </div>
          </div>
          <FileTable
            prefix={prefix}
            setPrefix={setPrefix}
            refresh={refresh}
          />
        </SignedIn>
        <SignedOut>
          <div className="flex items-center justify-center h-full">
            <p>Please sign in to manage your S3 files.</p>
          </div>
        </SignedOut>
      </main>
    </div>
  );
}
