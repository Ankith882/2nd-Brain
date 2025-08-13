-- Enable realtime for all tables (only set replica identity)
ALTER TABLE public.workspaces REPLICA IDENTITY FULL;
ALTER TABLE public.missions REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.habits REPLICA IDENTITY FULL;
ALTER TABLE public.categories REPLICA IDENTITY FULL;
ALTER TABLE public.quick_notes REPLICA IDENTITY FULL;
ALTER TABLE public.note_folders REPLICA IDENTITY FULL;
ALTER TABLE public.task_attachments REPLICA IDENTITY FULL;
ALTER TABLE public.task_comments REPLICA IDENTITY FULL;
ALTER TABLE public.note_attachments REPLICA IDENTITY FULL;
ALTER TABLE public.note_comments REPLICA IDENTITY FULL;