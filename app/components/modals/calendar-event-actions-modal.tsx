import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CalendarEventActionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CalendarEventActionsModal({
  open,
  onOpenChange,
}: CalendarEventActionsModalProps) {}
