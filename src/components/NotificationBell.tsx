import React, { useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, X, Clock, AlertCircle } from "lucide-react";

interface NotificationBellProps {
  notifications: any[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
}

export default function NotificationBell({
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Wrapper>
      <BellButton
        active={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        as={motion.button}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        title="Pusat Notifikasi Bahaya & Triage"
      >
        <Bell size={17} />
        {unreadCount > 0 && <UnreadDot />}
      </BellButton>

      <AnimatePresence>
        {isOpen && (
          <Drawer
            className="glass-card"
            as={motion.div}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
          >
            <DrawerHeader>
              <div className="title-row">
                <span className="title">Notifikasi Terkini</span>
                {unreadCount > 0 && <Badge>{unreadCount} Baru</Badge>}
              </div>
              <div className="action-row">
                {unreadCount > 0 && onMarkAllAsRead && (
                  <MarkAllBtn onClick={onMarkAllAsRead} title="Tandai semua telah dibaca">
                    <CheckCheck size={13} /> Baca Semua
                  </MarkAllBtn>
                )}
                <CloseBtn onClick={() => setIsOpen(false)}>
                  <X size={14} />
                </CloseBtn>
              </div>
            </DrawerHeader>

            <DrawerBody>
              {notifications.length === 0 ? (
                <EmptyNotif>
                  <AlertCircle size={28} color="var(--text-muted)" />
                  <p>Tidak ada notifikasi baru</p>
                </EmptyNotif>
              ) : (
                notifications.slice(0, 8).map((notif) => (
                  <NotifItem
                    key={notif.id}
                    unread={!notif.isRead}
                    onClick={() => onMarkAsRead?.(notif.id)}
                  >
                    <div className="notif-indicator" />
                    <div className="notif-content">
                      <p className="notif-msg">{notif.message}</p>
                      <div className="notif-meta">
                        <Clock size={10} />
                        <span>{notif.date || "Baru saja"}</span>
                      </div>
                    </div>
                  </NotifItem>
                ))
              )}
            </DrawerBody>
          </Drawer>
        )}
      </AnimatePresence>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
`;

const BellButton = styled.button<{ active?: boolean }>`
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 9px;
  border: 1px solid var(--border-color);
  background: ${({ active }) => (active ? "var(--border-hover)" : "var(--bg-card-subtle)")};
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--border-hover);
    color: var(--text-primary);
  }
`;

const UnreadDot = styled.span`
  position: absolute;
  top: 7px;
  right: 7px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.8);
`;

const Drawer = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 330px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  box-shadow: 0 20px 35px rgba(0, 0, 0, 0.35);
  z-index: 1000;
  overflow: hidden;
`;

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-card-subtle);

  .title-row {
    display: flex;
    align-items: center;
    gap: 6px;

    .title {
      font-size: 0.8rem;
      font-weight: 800;
      color: var(--text-primary);
    }
  }

  .action-row {
    display: flex;
    align-items: center;
    gap: 6px;
  }
`;

const Badge = styled.span`
  font-size: 0.65rem;
  font-weight: 800;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 1px 6px;
  border-radius: 999px;
`;

const MarkAllBtn = styled.button`
  background: transparent;
  border: none;
  color: #38bdf8;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 3px 6px;
  border-radius: 5px;

  &:hover {
    background: rgba(56, 189, 248, 0.1);
  }
`;

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 3px;
  border-radius: 4px;
  display: flex;

  &:hover {
    color: var(--text-primary);
  }
`;

const DrawerBody = styled.div`
  max-height: 340px;
  overflow-y: auto;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const EmptyNotif = styled.div`
  padding: 2.5rem 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  p {
    font-size: 0.75rem;
    color: var(--text-muted);
    margin: 0;
  }
`;

const NotifItem = styled.div<{ unread?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  background: ${({ unread }) => (unread ? "rgba(56, 189, 248, 0.08)" : "transparent")};
  border: 1px solid ${({ unread }) => (unread ? "rgba(56, 189, 248, 0.2)" : "transparent")};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: var(--bg-card-subtle);
  }

  .notif-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-top: 5px;
    background: ${({ unread }) => (unread ? "#38bdf8" : "transparent")};
    flex-shrink: 0;
  }

  .notif-content {
    flex: 1;

    .notif-msg {
      margin: 0;
      font-size: 0.75rem;
      font-weight: ${({ unread }) => (unread ? "700" : "500")};
      color: var(--text-primary);
      line-height: 1.35;
    }

    .notif-meta {
      margin-top: 3px;
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.65rem;
      color: var(--text-muted);
    }
  }
`;
