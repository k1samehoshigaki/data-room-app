'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sharingApi } from '@/lib/api';

export function useSharedWithMe() {
  return useQuery({
    queryKey: ['shared-with-me'],
    queryFn: () => sharingApi.sharedWithMe().then((r) => r.data),
  });
}

export function useSharePermissions(resourceType: string, resourceId: string) {
  return useQuery({
    queryKey: ['sharing-permissions', resourceType, resourceId],
    queryFn: async () => {
      const res = await sharingApi.listPermissions(resourceType, resourceId);
      return res.data as Array<{
        id: string;
        granteeUserId: string;
        role: string;
        grantee: { id: string; name: string; email: string; avatarUrl: string | null };
      }>;
    },
    enabled: !!resourceId,
  });
}

export function useShareLinks(resourceType: string, resourceId: string) {
  return useQuery({
    queryKey: ['sharing-links', resourceType, resourceId],
    queryFn: async () => {
      const res = await sharingApi.listLinks(resourceType, resourceId);
      return res.data as Array<{
        id: string;
        token: string;
        role: string;
        revokedAt: string | null;
        createdAt: string;
      }>;
    },
    enabled: !!resourceId,
  });
}

export function useCreatePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { resourceType: string; resourceId: string; granteeEmail: string }) =>
      sharingApi.createPermission(data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['sharing-permissions', vars.resourceType, vars.resourceId] });
    },
  });
}

export function useRevokePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; resourceType: string; resourceId: string }) =>
      sharingApi.deletePermission(id),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['sharing-permissions', vars.resourceType, vars.resourceId] });
    },
  });
}

export function useCreateLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { resourceType: string; resourceId: string }) =>
      sharingApi.createLink(data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['sharing-links', vars.resourceType, vars.resourceId] });
    },
  });
}

export function useRevokeLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; resourceType: string; resourceId: string }) =>
      sharingApi.revokeLink(id),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['sharing-links', vars.resourceType, vars.resourceId] });
    },
  });
}
