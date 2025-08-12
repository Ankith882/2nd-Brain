export interface TaskAttachment {
  id: string;
  url: string;
  text: string;
  type: 'link' | 'file' | 'image';
  color: string;
}

export interface AttachmentFormData {
  url: string;
  text: string;
  type: 'link' | 'file' | 'image';
  color: string;
}

export interface AttachmentActions {
  addAttachment: (taskId: string, attachment: Omit<TaskAttachment, 'id'>) => void;
  editAttachment: (taskId: string, attachmentId: string, text: string, color: string) => void;
  deleteAttachment: (taskId: string, attachmentId: string) => void;
}