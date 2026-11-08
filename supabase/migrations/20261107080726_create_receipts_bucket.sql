-- Create private storage bucket for expense receipts
-- Single-tenant app (no auth): all apartment members share data
-- Private bucket: access via signed URLs only, no public URLs
-- MIME: images only (jpeg, png, webp, gif)
-- Size limit: 5 MB

INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES (
  'receipts',
  'receipts',
  false,
  '{image/jpeg, image/png, image/webp, image/gif}',
  5242880
)
ON CONFLICT (id) DO NOTHING;

-- SELECT: allow reading receipt objects (shared apartment data)
DROP POLICY IF EXISTS "receipts_read" ON storage.objects;
CREATE POLICY "receipts_read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'receipts');

-- INSERT: allow uploading receipts into expenses/ folder
DROP POLICY IF EXISTS "receipts_insert" ON storage.objects;
CREATE POLICY "receipts_insert"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'receipts'
  AND (storage.foldername(name))[1] = 'expenses'
);

-- UPDATE: allow replacing receipts
DROP POLICY IF EXISTS "receipts_update" ON storage.objects;
CREATE POLICY "receipts_update"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'receipts')
WITH CHECK (
  bucket_id = 'receipts'
  AND (storage.foldername(name))[1] = 'expenses'
);

-- DELETE: allow deleting receipts
DROP POLICY IF EXISTS "receipts_delete" ON storage.objects;
CREATE POLICY "receipts_delete"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'receipts');
