'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRenameFolder } from '@/hooks/use-folder';
import { useRenameFile } from '@/hooks/use-files';
import { useToast } from '@/components/ui/toast';

const schema = z.object({ name: z.string().min(1, 'Name is required').max(255) });
type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  type: 'file' | 'folder';
  currentName: string;
  id: string;
  dataRoomId: string;
  onClose: () => void;
}

export function RenameModal({ open, type, currentName, id, dataRoomId, onClose }: Props) {
  const { addToast } = useToast();
  const renameFolder = useRenameFolder();
  const renameFile = useRenameFile();
  const isPending = type === 'folder' ? renameFolder.isPending : renameFile.isPending;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: currentName },
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (type === 'folder') {
        await renameFolder.mutateAsync({ id, name: data.name, dataRoomId });
      } else {
        await renameFile.mutateAsync({ id, name: data.name, dataRoomId });
      }
      addToast('Renamed successfully', 'success');
      onClose();
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Rename failed', 'error');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename {type}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1.5 py-2">
            <Label htmlFor="rename-input">New name</Label>
            <Input
              id="rename-input"
              autoFocus
              onFocus={(e) => e.target.select()}
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
