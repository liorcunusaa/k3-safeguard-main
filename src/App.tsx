import { useState, useEffect, useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "./firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy,
  writeBatch,
  increment,
  deleteDoc,
  getDocs
} from "./firebase";
import { auth, db } from "./firebase";
import { UserRole, ReportStatus } from "./constants/enums";
import { uploadToCloudinary } from "./utils/uploadToCloudinary";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import StatusPage from "./pages/StatusPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import GlobalStyle from "./components/GlobalStyle";
import ConfirmModal from "./components/ConfirmModal";
import { ThemeProvider } from "./context/ThemeContext";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, reportId: string | null }>({
    isOpen: false,
    reportId: null
  });
  const [loading, setLoading] = useState(true);
  const [profileReady, setProfileReady] = useState(false);

  useEffect(() => {
    if (!user) {
      console.log("❌ User belum ada");
      return;
    }

    console.log("✅ User UID:", user.uid);

    const q = query(
      collection(db, "notifications"),
      where("toUserId", "array-contains", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot: any) => {
      const notifData = snapshot.docs.map((d: any) => ({
        ...d.data(),
        id: d.id,
      }));
      setNotifications(notifData);
    }, (error: any) => {
      console.error("❌ Error snapshot:", error);
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser: any) => {
      if (firebaseUser) {
        // Ada session Firebase — fetch profile dari Firestore
        const userRef = doc(db, "users", firebaseUser.uid);
        unsubProfile = onSnapshot(userRef, async (docSnap: any) => {
          let userData = docSnap.exists() ? docSnap.data() : null;
          if (!userData) {
            try {
              const qUid = query(collection(db, "users"), where("uid", "==", firebaseUser.uid));
              const snapUid = await getDocs(qUid);
              if (!snapUid.empty) {
                userData = snapUid.docs[0].data();
              } else {
                const qEmail = query(collection(db, "users"), where("email", "==", firebaseUser.email));
                const snapEmail = await getDocs(qEmail);
                if (!snapEmail.empty) {
                  userData = snapEmail.docs[0].data();
                }
              }
            } catch (err) {
              console.warn("User fallback fetch error:", err);
            }
          }

          const rawRole = String(
            userData?.role ||
            (firebaseUser.email?.toLowerCase().includes("admin") ? "BPO" : "USER")
          ).toUpperCase();
          const firestoreRole = ["ADMIN", "BPO"].includes(rawRole) ? UserRole.BPO : UserRole.USER;

          // Jika ada role override dari toggle (disimpan di sessionStorage), gunakan itu
          const savedOverride = sessionStorage.getItem("safeguard_role_override") as UserRole | null;
          const correctRole = savedOverride ?? firestoreRole;

          setUser((prev: any) => {
            if (prev && prev.uid === firebaseUser.uid && prev.role === correctRole && prev.name) {
              return prev;
            }
            return {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: userData?.nama || firebaseUser.email?.split("@")[0].toUpperCase() || "USER",
              position:
                userData?.jabatan ||
                (correctRole === UserRole.BPO
                  ? "Pengawas K3 & HSE Supervisor"
                  : "Staff Pelaksana Lapangan"),
              division:
                userData?.divisi ||
                (correctRole === UserRole.BPO
                  ? "HSE & K3 Lingkungan"
                  : "Departemen Operasional & Bongkar Muat"),
              role: correctRole,
              points: userData?.points || 0,
            };
          });

          setProfileReady(true);
          setLoading(false);
        });
      } else {
        setUser(null);
        setLoading(false);
        setProfileReady(true);
        if (unsubProfile) {
          unsubProfile();
          unsubProfile = null;
        }
      }
    });

    // Fallback: jika Firestore lambat, maksimal tunggu 2 detik
    // (mode dummy tidak perlu tunggu lama)
    const timeout = setTimeout(() => {
      setLoading(false);
      setProfileReady(true);
    }, 2000);

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubActions = onSnapshot(collection(db, "unsafe_actions"), (snapshot: any) => {
      const actions = snapshot.docs.map((d: any) => ({
        ...d.data(),
        id: d.id,
        findingType: "Unsafe Action",
      }));
      setReports((prev) => {
        const others = prev.filter((r) => r.findingType !== "Unsafe Action");
        return [...actions, ...others];
      });
    });

    const unsubConditions = onSnapshot(collection(db, "unsafe_conditions"), (snapshot: any) => {
      const conditions = snapshot.docs.map((d: any) => ({
        ...d.data(),
        id: d.id,
        findingType: "Unsafe Condition",
      }));
      setReports((prev) => {
        const others = prev.filter((r) => r.findingType !== "Unsafe Condition");
        return [...conditions, ...others];
      });
    });

    return () => {
      unsubActions();
      unsubConditions();
    };
  }, [user]);

  const incrementUserPoints = async (userId: string, amount: number) => {
    try {
      const q = query(collection(db, "users"), where("uid", "==", userId));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0];
        await updateDoc(doc(db, "users", userDoc.id), { 
          points: increment(amount) 
        });
      }
    } catch (error) {
      console.error("Error incrementing points:", error);
    }
  };

  const handleAddReport = async (formData: any) => {
    if (!user) return;
    try {
      const imageUrl = formData.photo ? await uploadToCloudinary(formData.photo) : null;
      const collectionName = formData.findingType === "Unsafe Action" ? "unsafe_actions" : "unsafe_conditions";

      await addDoc(collection(db, collectionName), {
        date: formData.date,
        description: formData.description,
        suggestion: formData.suggestion,
        photoUrl: imageUrl,
        status: ReportStatus.OPEN,
        findingType: formData.findingType,
        latitude: formData.latitude ?? null,
        longitude: formData.longitude ?? null,
        reportedBy: {
          uid: user.uid,
          name: user.name,
          email: user.email,
          division: user.division,
        },
        createdAt: serverTimestamp(),
      });

      await incrementUserPoints(user.uid, 10);
    } catch (error) {
      console.error("Error saving report:", error);
      alert("Gagal mengirim laporan");
    }
  };

  const handleUpdateReport = async (reportId: string, updates: any) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    const collectionName = report.findingType === "Unsafe Action" ? "unsafe_actions" : "unsafe_conditions";
    const docRef = doc(db, collectionName, reportId);

    let newStatus = report.status;
    const finalUpdates: any = { ...updates };

    if (updates.handlingReport && report.status !== ReportStatus.CLOSED) {
      newStatus = ReportStatus.CLOSED;
      finalUpdates.closedAt = new Date().toISOString().split("T")[0];
      
      if (report.reportedBy?.uid) {
        await incrementUserPoints(report.reportedBy.uid, 50);
      }
      await incrementUserPoints(user.uid, 20);
    } else if ((updates?.estimationDate || updates?.moveToProses) && report?.status === ReportStatus.OPEN) {
      newStatus = ReportStatus.IN_PROGRESS;
    }

    finalUpdates.status = newStatus;

    try {
      await updateDoc(docRef, finalUpdates);
    } catch (error) {
      console.error("Error updating report:", error);
      alert("Gagal memperbarui laporan");
    }
  };
  
  const handleDeleteReport = (reportId: string) => {
    setDeleteConfirm({ isOpen: true, reportId });
  };

  const confirmDelete = async () => {
    const reportId = deleteConfirm.reportId;
    if (!reportId) return;

    const report = reports.find((r) => r.id === reportId);
    if (!report) {
      setDeleteConfirm({ isOpen: false, reportId: null });
      return;
    }

    const collectionName = report.findingType === "Unsafe Action" ? "unsafe_actions" : "unsafe_conditions";
    const docRef = doc(db, collectionName, reportId);

    try {
      // Soft delete: tandai isDeleted dan deletedAt agar tersimpan di Tempat Sampah (30 hari retention)
      await updateDoc(docRef, {
        isDeleted: true,
        deletedAt: new Date().toISOString(),
      });
      setDeleteConfirm({ isOpen: false, reportId: null });
    } catch (error) {
      console.error("❌ App: Error soft deleting report:", error);
      // Fallback jika dokumen belum support updateDoc
      try {
        await deleteDoc(docRef);
      } catch (e) {
        console.error(e);
      }
      setDeleteConfirm({ isOpen: false, reportId: null });
    }
  };

  const handleRestoreReport = async (reportId: string) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    const collectionName = report.findingType === "Unsafe Action" ? "unsafe_actions" : "unsafe_conditions";
    const docRef = doc(db, collectionName, reportId);

    try {
      await updateDoc(docRef, {
        isDeleted: false,
        deletedAt: null,
      });
    } catch (error) {
      console.error("Error restoring report:", error);
      alert("Gagal memulihkan laporan");
    }
  };

  const handlePermanentDeleteReport = async (reportId: string) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    const collectionName = report.findingType === "Unsafe Action" ? "unsafe_actions" : "unsafe_conditions";
    const docRef = doc(db, collectionName, reportId);

    try {
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error permanently deleting report:", error);
      alert("Gagal menghapus laporan permanen");
    }
  };

  // Auto-purge soft-deleted reports older than 30 days
  useEffect(() => {
    if (!reports || reports.length === 0) return;
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    reports.forEach(async (report) => {
      if (report.isDeleted && report.deletedAt) {
        const deletedTime = new Date(report.deletedAt).getTime();
        if (now - deletedTime > thirtyDaysMs) {
          const collectionName = report.findingType === "Unsafe Action" ? "unsafe_actions" : "unsafe_conditions";
          try {
            await deleteDoc(doc(db, collectionName, report.id));
            console.log(`Auto purged report ${report.id} after 30 days.`);
          } catch (err) {
            console.error("Auto purge failed:", err);
          }
        }
      }
    });
  }, [reports]);

  const activeReports = useMemo(() => {
    return reports.filter((r) => !r.isDeleted);
  }, [reports]);

  const deletedReports = useMemo(() => {
    return reports.filter((r) => r.isDeleted);
  }, [reports]);

  const handleMarkNotificationAsRead = async (id: string) => {
    try {
      const ref = doc(db, "notifications", id);
      await updateDoc(ref, { isRead: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkNotificationsAsRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;

    const batch = writeBatch(db);
    unread.forEach((notif) => {
      const ref = doc(db, "notifications", notif.id);
      batch.update(ref, { isRead: true });
    });
    await batch.commit();
  };

  const handleToggleRole = () => {
    setUser((prev: any) => {
      if (!prev) return prev;
      const nextRole = prev.role === UserRole.BPO ? UserRole.USER : UserRole.BPO;
      // Simpan role override ke sessionStorage agar tetap saat refresh
      sessionStorage.setItem("safeguard_role_override", nextRole);
      return { ...prev, role: nextRole };
    });
  };

  const handleLogout = async () => {
    sessionStorage.removeItem("safeguard_role_override");
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Signout error:", err);
    }
    setUser(null);
    setProfileReady(false);
  };

  if (loading || (user && !profileReady)) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#020617', 
        color: '#f8fafc',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '3px solid rgba(255,255,255,0.1)', 
          borderTopColor: '#3b82f6', 
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Memuat Aplikasi...</p>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <GlobalStyle />
        {!user ? (
          <Login onLoginSuccess={(userData) => {
            setUser(userData);
            setProfileReady(true);
            setLoading(false);
          }} />
        ) : (
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/reports" replace />}
            />
            <Route
              path="/reports"
              element={
                <Dashboard
                  user={user}
                  reports={activeReports}
                  notifications={notifications}
                  onAddReport={handleAddReport}
                  onUpdateReport={handleUpdateReport}
                  onDeleteReport={handleDeleteReport}
                  onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
                  onMarkNotificationAsRead={handleMarkNotificationAsRead}
                  onLogout={handleLogout}
                  onToggleRole={handleToggleRole}
                />
              }
            />
            <Route
              path="/reports/all"
              element={
                <StatusPage
                  user={user}
                  reports={activeReports}
                  allReports={activeReports}
                  deletedReports={deletedReports}
                  status="ALL"
                  notifications={notifications}
                  onAddReport={handleAddReport}
                  onUpdateReport={handleUpdateReport}
                  onDeleteReport={handleDeleteReport}
                  onRestoreReport={handleRestoreReport}
                  onPermanentDelete={handlePermanentDeleteReport}
                  onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
                  onMarkNotificationAsRead={handleMarkNotificationAsRead}
                  onLogout={handleLogout}
                  onToggleRole={handleToggleRole}
                />
              }
            />
            <Route
              path="/reports/menunggu"
              element={
                <StatusPage
                  user={user}
                  reports={activeReports.filter((r) => r.status === ReportStatus.OPEN)}
                  allReports={activeReports}
                  deletedReports={deletedReports}
                  status={ReportStatus.OPEN}
                  notifications={notifications}
                  onAddReport={handleAddReport}
                  onUpdateReport={handleUpdateReport}
                  onDeleteReport={handleDeleteReport}
                  onRestoreReport={handleRestoreReport}
                  onPermanentDelete={handlePermanentDeleteReport}
                  onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
                  onMarkNotificationAsRead={handleMarkNotificationAsRead}
                  onLogout={handleLogout}
                  onToggleRole={handleToggleRole}
                />
              }
            />
            <Route
              path="/reports/diproses"
              element={
                <StatusPage
                  user={user}
                  reports={activeReports.filter((r) => r.status === ReportStatus.IN_PROGRESS)}
                  allReports={activeReports}
                  deletedReports={deletedReports}
                  status={ReportStatus.IN_PROGRESS}
                  notifications={notifications}
                  onAddReport={handleAddReport}
                  onUpdateReport={handleUpdateReport}
                  onDeleteReport={handleDeleteReport}
                  onRestoreReport={handleRestoreReport}
                  onPermanentDelete={handlePermanentDeleteReport}
                  onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
                  onMarkNotificationAsRead={handleMarkNotificationAsRead}
                  onLogout={handleLogout}
                  onToggleRole={handleToggleRole}
                />
              }
            />
            <Route
              path="/reports/selesai"
              element={
                <StatusPage
                  user={user}
                  reports={activeReports.filter((r) => r.status === ReportStatus.CLOSED)}
                  allReports={activeReports}
                  deletedReports={deletedReports}
                  status={ReportStatus.CLOSED}
                  notifications={notifications}
                  onAddReport={handleAddReport}
                  onUpdateReport={handleUpdateReport}
                  onDeleteReport={handleDeleteReport}
                  onRestoreReport={handleRestoreReport}
                  onPermanentDelete={handlePermanentDeleteReport}
                  onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
                  onMarkNotificationAsRead={handleMarkNotificationAsRead}
                  onLogout={handleLogout}
                  onToggleRole={handleToggleRole}
                />
              }
            />
            <Route
              path="/reports/sampah"
              element={
                <StatusPage
                  user={user}
                  reports={deletedReports}
                  allReports={activeReports}
                  deletedReports={deletedReports}
                  status="SAMPAH"
                  notifications={notifications}
                  onAddReport={handleAddReport}
                  onUpdateReport={handleUpdateReport}
                  onDeleteReport={handleDeleteReport}
                  onRestoreReport={handleRestoreReport}
                  onPermanentDelete={handlePermanentDeleteReport}
                  onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
                  onMarkNotificationAsRead={handleMarkNotificationAsRead}
                  onLogout={handleLogout}
                  onToggleRole={handleToggleRole}
                />
              }
            />
            <Route
              path="/analytics"
              element={
                user.role === UserRole.BPO ? (
                  <AnalyticsPage reports={activeReports} user={user} onToggleRole={handleToggleRole} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/reports" replace />
                )
              }
            />
            <Route
              path="/leaderboard"
              element={<LeaderboardPage user={user} onToggleRole={handleToggleRole} onLogout={handleLogout} />}
            />
          </Routes>
        )}
        <ConfirmModal
          isOpen={deleteConfirm.isOpen}
          title="Pindahkan ke Tempat Sampah"
          message="Laporan temuan ini akan dipindahkan ke Tempat Sampah BPO. Data akan tersimpan selama 30 hari sebelum dihapus permanen secara otomatis oleh sistem."
          confirmText="Pindahkan ke Sampah"
          cancelText="Batal"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm({ isOpen: false, reportId: null })}
          type="danger"
        />
      </BrowserRouter>
    </ThemeProvider>
  );
}
