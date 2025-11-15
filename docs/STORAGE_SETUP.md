# Supabase Storage Setup Guide

This guide explains how to set up Supabase Storage buckets for GyanPath.

## Required Buckets

Create the following buckets in your Supabase project:

1. **videos** - For video lesson files
2. **pdfs** - For PDF documents and lesson materials
3. **images** - For course thumbnails and lesson images
4. **thumbnails** - For course and lesson thumbnails

## Setup Steps

### 1. Create Buckets in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the sidebar
3. Click **New bucket**
4. Create each bucket with the following settings:

#### Videos Bucket
- **Name**: `videos`
- **Public bucket**: `false` (private - users need to be authenticated)
- **File size limit**: 500MB
- **Allowed MIME types**: `video/*`

#### PDFs Bucket
- **Name**: `pdfs`
- **Public bucket**: `false` (private)
- **File size limit**: 50MB
- **Allowed MIME types**: `application/pdf`

#### Images Bucket
- **Name**: `images`
- **Public bucket**: `true` (public - for course thumbnails)
- **File size limit**: 10MB
- **Allowed MIME types**: `image/*`

#### Thumbnails Bucket
- **Name**: `thumbnails`
- **Public bucket**: `true` (public)
- **File size limit**: 5MB
- **Allowed MIME types**: `image/*`

### 2. Set Up Storage Policies (RLS)

Run the following SQL in your Supabase SQL Editor to set up Row Level Security policies:

```sql
-- Allow authenticated users to upload videos
CREATE POLICY "Users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos');

-- Allow authenticated users to read videos
CREATE POLICY "Users can read videos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'videos');

-- Allow authenticated users to upload PDFs
CREATE POLICY "Users can upload PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pdfs');

-- Allow authenticated users to read PDFs
CREATE POLICY "Users can read PDFs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'pdfs');

-- Allow anyone to read images (public)
CREATE POLICY "Anyone can read images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

-- Allow authenticated users to upload images
CREATE POLICY "Users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Allow anyone to read thumbnails (public)
CREATE POLICY "Anyone can read thumbnails"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'thumbnails');

-- Allow authenticated users to upload thumbnails
CREATE POLICY "Users can upload thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'thumbnails');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid()::text = (storage.foldername(name))[1]);
```

### 3. Environment Variables

Ensure your `.env.local` file has the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Usage

#### Client-Side Upload

```tsx
import { FileUpload } from "@/components/file-upload"

<FileUpload
  bucket="videos"
  folder="lessons"
  accept="video/*"
  maxSize={500 * 1024 * 1024} // 500MB
  compress={false}
  onUploadComplete={(url, path) => {
    console.log("Uploaded:", url, path)
  }}
/>
```

#### Using the Hook

```tsx
import { useFileUpload } from "@/hooks/use-file-upload"

const { upload, uploading, progress } = useFileUpload({
  bucket: "images",
  folder: "thumbnails",
  compress: true,
  onSuccess: (url, path) => {
    console.log("Uploaded:", url)
  },
})

// Usage
await upload(file)
```

## File Compression

Images are automatically compressed before upload to reduce bandwidth usage. Compression settings:

- **Max width**: 1920px
- **Max height**: 1080px
- **Quality**: 0.8 (80%)

## Security Considerations

1. **Private Buckets**: Videos and PDFs are stored in private buckets, requiring authentication
2. **File Validation**: File types and sizes are validated before upload
3. **RLS Policies**: Row Level Security ensures users can only access files they're authorized to view
4. **Signed URLs**: For private files, use signed URLs that expire after a set time

## Troubleshooting

### Upload Fails with 403 Forbidden
- Check that RLS policies are correctly set up
- Verify the user is authenticated
- Ensure the bucket exists and is correctly named

### Files Not Appearing
- Check bucket name matches exactly (case-sensitive)
- Verify file path is correct
- Check RLS policies allow reading from the bucket

### Compression Issues
- Ensure the file is an image (compression only works for images)
- Check browser console for errors
- Large images may take time to compress

