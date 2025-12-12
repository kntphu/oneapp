// src/utils/hooks/useApiMutation.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { QueryKey, MutationFunction } from '@tanstack/react-query';
import { showSuccessToast, showErrorToast } from '@utils/toastUtils';

// ===================================================================
//                        INTERFACE DEFINITION
// ===================================================================

/**
 * Interface สำหรับ Options ที่จะส่งเข้ามาใน useApiMutation hook
 */
interface UseApiMutationOptions<TData, TVariables> {
  mutationFn: MutationFunction<TData, TVariables>;
  queryKeyToInvalidate: QueryKey;
  successMessage: string;
  errorMessage: string;
  onSuccessCallback?: (data: TData) => void;
}

// ===================================================================
//                        CUSTOM HOOK
// ===================================================================

/**
 * Custom Hook สำหรับจัดการ API mutations (Create, Update, Delete) โดยอัตโนมัติ
 * พร้อมแสดง Toast notification และทำการ Invalidate React Query cache
 * @param mutationFn - ฟังก์ชันที่ทำการเรียก API
 * @param queryKeyToInvalidate - Query Key ที่ต้องการให้ invalidate เมื่อ mutation สำเร็จ
 * @param successMessage - ข้อความที่จะแสดงเมื่อสำเร็จ
 * @param errorMessage - ข้อความที่จะแสดงเมื่อเกิดข้อผิดพลาด
 * @param onSuccessCallback - ฟังก์ชันที่จะถูกเรียกเสริมเมื่อสำเร็จ
 * @returns instance ของ useMutation จาก @tanstack/react-query
 */
export const useApiMutation = <TData = unknown, TVariables = void>({
  mutationFn,
  queryKeyToInvalidate,
  successMessage,
  errorMessage,
  onSuccessCallback,
}: UseApiMutationOptions<TData, TVariables>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      showSuccessToast(successMessage);
      
      // สั่งให้ข้อมูลที่เกี่ยวข้อง refetch ใหม่
      queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate });
      
      // เรียก Callback เสริมถ้ามี
      if (onSuccessCallback) {
        onSuccessCallback(data);
      }
    },
    onError: (error: any) => {
      // จัดการและแสดงข้อความ Error ที่เหมาะสม
      const specificError = error.response?.data?.message || error.message || 'Unknown error';
      showErrorToast(`${errorMessage}: ${specificError}`);
    },
  });
};