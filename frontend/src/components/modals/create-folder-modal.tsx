'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateFolder } from '@/hooks/use-folder';
import { useToast } from '@/components/ui/toast';

const schema = z.object({ name: z.string().min(1, 'Name is required').max(255) });
type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  dataRoomId: string;
  parentId?: string | null;
  onClose: () => void;
}

export function CreateFolderModal({ open, dataRoomId, parentId, onClose }: Props) {
  const { addToast } = useToast();
  const { mutateAsync, isPending } = useCreateFolder();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await mutateAsync({ name: data.name, dataRoomId, parentId });
      addToast(`Folder "${data.name}" created`, 'success');
      reset();
      onClose();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Failed to create folder', 'error');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Folder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1.5 py-2">
            <Label htmlFor="folder-name">Name</Label>
            <Input
              id="folder-name"
              placeholder="Folder name"
              autoFocus
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
