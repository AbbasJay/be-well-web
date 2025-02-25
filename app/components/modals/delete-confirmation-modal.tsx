import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  onCancel: () => void;
  title: string;
  description: string;
  deleteButtonText: string;
  cancelButtonText: string;
}

export default function DeleteConfirmationModal({
  open,
  onOpenChange,
  onDelete,
  onCancel,
  title,
  description,
  deleteButtonText,
  cancelButtonText,
}: DeleteConfirmationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        <DialogFooter>
          <Button onClick={onCancel}>{cancelButtonText}</Button>
          <Button variant="destructive" onClick={onDelete}>
            {deleteButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
