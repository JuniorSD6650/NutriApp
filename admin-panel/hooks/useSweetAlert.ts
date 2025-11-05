import Swal from 'sweetalert2';
import { useEffect } from 'react';

export interface SweetAlertProps {
  open: boolean;
  type?: 'success' | 'error' | 'warning' | 'info' | 'question';
  title: string;
  text?: string;
  html?: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  timer?: number;
  toast?: boolean;
  position?: 'top-end' | 'center' | 'top' | 'bottom' | 'bottom-end';
  iconColor?: string;
  confirmColor?: string;
  cancelColor?: string;
  allowOutsideClick?: boolean;
}

export const SweetAlert = ({
  open,
  type = 'info',
  title,
  text,
  html,
  confirmText = 'OK',
  cancelText = 'Cancelar',
  showCancel = false,
  onConfirm,
  onCancel,
  timer,
  toast = false,
  position = 'center',
  iconColor,
  confirmColor,
  cancelColor,
  allowOutsideClick = true,
}: SweetAlertProps) => {
  useEffect(() => {
    if (!open) return;
    Swal.fire({
      title,
      text,
      html,
      icon: type,
      showCancelButton: showCancel,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      timer,
      toast,
      position,
      iconColor,
      confirmButtonColor: confirmColor,
      cancelButtonColor: cancelColor,
      allowOutsideClick,
      willOpen: () => {
        if (type === 'info' && !toast) Swal.showLoading();
      },
    }).then((result) => {
      if (result.isConfirmed && onConfirm) onConfirm();
      if (result.isDismissed && onCancel) onCancel();
    });
    // eslint-disable-next-line
  }, [open]);
  return null;
};

// Hook para uso programático (opcional, legacy)
export const useSweetAlert = () => {
  const showSuccess = (title: string, text?: string, timer: number = 3000) => {
    return Swal.fire({
      title,
      text,
      icon: 'success',
      confirmButtonText: 'Continuar',
      confirmButtonColor: '#10B981',
      timer,
      timerProgressBar: true,
    });
  };

  const showError = (title: string, text?: string) => {
    return Swal.fire({
      title,
      text,
      icon: 'error',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#EF4444',
    });
  };

  const showConfirmDelete = (itemName: string, itemType: string = 'elemento') => {
    return Swal.fire({
      title: `¿Eliminar ${itemType}?`,
      html: `
        <div class="text-center">
          <div class="text-6xl mb-4">🗑️</div>
          <p class="mb-2">¿Está seguro de que desea eliminar:</p>
          <p class="font-semibold text-lg text-gray-800">"${itemName}"</p>
          <p class="mt-3 text-sm text-gray-600">Esta acción no se puede deshacer.</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      focusCancel: true,
    });
  };

  const showLoading = (title: string = 'Procesando...', text: string = 'Por favor espere') => {
    return Swal.fire({
      title,
      text,
      icon: 'info',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
  };

  const showToast = (icon: 'success' | 'error' | 'warning' | 'info', title: string) => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });

    return Toast.fire({
      icon,
      title,
    });
  };

  const showWarning = (title: string, html: string, confirmText: string = 'Entendido') => {
    return Swal.fire({
      title,
      html,
      icon: 'warning',
      confirmButtonText: confirmText,
      confirmButtonColor: '#F59E0B',
    });
  };

  return {
    showSuccess,
    showError,
    showConfirmDelete,
    showLoading,
    showToast,
    showWarning,
  };
};
