import React from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Hapus",
  cancelText = "Batal",
  onConfirm,
  onCancel,
  type = "danger",
}: {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "danger" | "warning" | "info";
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <Overlay
        as={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <ModalBox
          as={motion.div}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="glass-card"
        >
          <IconWrapper type={type}>
            <AlertTriangle size={24} />
          </IconWrapper>
          <Title>{title}</Title>
          <Message>{message}</Message>
          <ButtonGroup>
            <CancelBtn onClick={onCancel}>{cancelText}</CancelBtn>
            <ConfirmBtn type={type} onClick={onConfirm}>
              {confirmText}
            </ConfirmBtn>
          </ButtonGroup>
        </ModalBox>
      </Overlay>
    </AnimatePresence>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
`;

const ModalBox = styled.div`
  width: 100%;
  max-width: 400px;
  border-radius: 1.5rem;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
`;

const IconWrapper = styled.div<{ type: string }>`
  width: 48px;
  height: 48px;
  border-radius: 1rem;
  background: ${({ type }) =>
    type === "danger"
      ? "rgba(239, 68, 68, 0.15)"
      : "rgba(245, 158, 11, 0.15)"};
  color: ${({ type }) => (type === "danger" ? "#ef4444" : "#f59e0b")};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
`;

const Title = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem;
`;

const Message = styled.p`
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0 0 1.5rem;
  line-height: 1.5;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  width: 100%;
`;

const CancelBtn = styled.button`
  flex: 1;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const ConfirmBtn = styled.button<{ type: string }>`
  flex: 1;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: ${({ type }) => (type === "danger" ? "#dc2626" : "#2563eb")};
  border: none;
  color: white;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px
    ${({ type }) =>
      type === "danger"
        ? "rgba(220, 38, 38, 0.4)"
        : "rgba(37, 99, 235, 0.4)"};

  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }
`;
