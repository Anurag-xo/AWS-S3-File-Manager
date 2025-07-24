# S3 File Manager

This is a simple S3 file manager built with Next.js, TypeScript, and Tailwind CSS. It allows you to browse, upload, download, and delete files in an S3 bucket.

## Features

*   **Authentication**: Uses [Clerk](https://clerk.com/) for user authentication.
*   **File Browsing**: Browse files and folders in your S3 bucket.
*   **File Upload**: Upload files to your S3 bucket with a drag-and-drop interface.
*   **File Download**: Download files from your S3 bucket.
*   **File Deletion**: Delete files from your S3 bucket.
*   **Folder Creation**: Create new folders in your S3 bucket.
*   **S3 Connection Status**: Check the connection status to your S3 bucket.
*   **Error Handling**: Provides user-friendly error messages and feedback.
*   **Loading Indicators**: Shows loading indicators when performing actions.

## Technologies Used

*   [Next.js](https://nextjs.org/)
*   [TypeScript](https://www.typescriptlang.org/)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [Clerk](https://clerk.com/)
*   [AWS SDK for JavaScript v3](https://aws.amazon.com/sdk-for-javascript/)
*   [shadcn/ui](https://ui.shadcn.com/)
*   [Lucide React](https://lucide.dev/guide/packages/lucide-react)
*   [Sonner](https://sonner.emilkowal.ski/)

## Getting Started

First, you need to set up your environment variables. Create a `.env.local` file in the root of the project and add the following variables:

```
S3_BUCKET_NAME=your-s3-bucket-name
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=your-aws-region

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
```

Then, install the dependencies:

```bash
pnpm install
```

Finally, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.