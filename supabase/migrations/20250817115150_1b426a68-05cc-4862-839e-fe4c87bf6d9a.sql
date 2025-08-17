-- Create storage buckets for tasks and notes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('task-files', 'task-files', false, 52428800, ARRAY['image/*', 'application/pdf', 'text/*', 'application/vnd.openxmlformats-officedocument.*', 'application/msword', 'application/vnd.ms-*']),
  ('note-files', 'note-files', false, 52428800, ARRAY['image/*', 'application/pdf', 'text/*', 'application/vnd.openxmlformats-officedocument.*', 'application/msword', 'application/vnd.ms-*']);

-- Create policies for task files
CREATE POLICY "Users can view their own task files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'task-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own task files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'task-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own task files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'task-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own task files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'task-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create policies for note files
CREATE POLICY "Users can view their own note files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'note-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own note files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'note-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own note files"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'note-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own note files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'note-files' AND auth.uid()::text = (storage.foldername(name))[1]);