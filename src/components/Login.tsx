import React, { useState } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
  Anchor,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  auth,
  db,
  signInWithEmailAndPassword,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  doc,
} from "../firebase";
import { UserRole } from "../constants/enums";

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [loginNotification, setLoginNotification] = useState<{
    isOpen: boolean;
    userData: any;
  }>({
    isOpen: false,
    userData: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      const authUser: any = result.user;

      let firestoreUser: any = authUser;
      try {
        const userDocSnap = await getDoc(doc(db, "users", authUser.uid || authUser.id));
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          firestoreUser = {
            ...authUser,
            ...data,
            name: data.nama || authUser.nama,
            role: data.role || authUser.role,
            position: data.jabatan || authUser.jabatan,
            division: data.divisi || authUser.divisi,
          };
        } else {
          const uidSnapshot = await getDocs(
            query(collection(db, "users"), where("uid", "==", authUser.uid))
          );
          const emailSnapshot = uidSnapshot.empty
            ? await getDocs(
                query(collection(db, "users"), where("email", "==", authUser.email))
              )
            : uidSnapshot;
          const profileDoc = emailSnapshot.docs[0];

          if (profileDoc) {
            const data = profileDoc.data();
            firestoreUser = {
              ...authUser,
              ...data,
              name: data.nama || authUser.nama,
              role: data.role || authUser.role,
              position: data.jabatan || authUser.jabatan,
              division: data.divisi || authUser.divisi,
            };
          }
        }
      } catch (err) {
        console.warn("Could not fetch user document from Firestore:", err);
      }

      const accountRole = String(
        firestoreUser.role || (authUser.email?.toLowerCase().includes("admin") ? "BPO" : "USER")
      ).toUpperCase();

      const activeUser = {
        uid: firestoreUser.uid || firestoreUser.id,
        name: firestoreUser.nama || firestoreUser.name || "Petugas Pelindo",
        email: firestoreUser.email,
        role: ["ADMIN", "BPO", "PENGAWAS"].includes(accountRole) ? UserRole.BPO : UserRole.USER,
        position: firestoreUser.jabatan || firestoreUser.position || "Staff Lapangan",
        division: firestoreUser.divisi || firestoreUser.division || "Operasional Terminal",
      };

      setLoginNotification({
        isOpen: true,
        userData: activeUser,
      });

      setTimeout(() => {
        onLoginSuccess(activeUser);
      }, 1600);
    } catch (err: any) {
      let msg = "Email atau kata sandi tidak cocok. Silakan coba lagi.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        msg = "Email atau kata sandi salah. Silakan periksa kembali.";
      } else if (err.code === "auth/user-not-found") {
        msg = "Akun email belum terdaftar di sistem Firebase.";
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <BackgroundGlow />

      <CardWrapper
        className="glass-card"
        as={motion.div}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* CENTERED LOGO BADGE */}
        <LogoHeader>
          <LogoBadge>
            <Anchor size={28} color="#ffffff" />
          </LogoBadge>
          <BrandTitle>SAFEGUARD</BrandTitle>
          <BrandSubtitle>PT. PELINDO MULTI TERMINAL</BrandSubtitle>
        </LogoHeader>

        {/* LOGIN FORM */}
        <Form onSubmit={handleSubmit}>
          {errorMessage && (
            <AlertBox
              as={motion.div}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
            >
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </AlertBox>
          )}

          {/* EMAIL INPUT */}
          <InputGroup>
            <FieldLabel>EMAIL</FieldLabel>
            <InputWrap>
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                required
                placeholder="nama@pelindo.co.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </InputWrap>
          </InputGroup>

          {/* PASSWORD INPUT */}
          <InputGroup>
            <FieldLabel>PASSWORD</FieldLabel>
            <InputWrap>
              <Lock size={16} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-pass"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Sembunyikan" : "Tampilkan"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </InputWrap>
          </InputGroup>

          {/* SIGN IN BUTTON */}
          <SubmitButton
            type="submit"
            disabled={isLoading}
            as={motion.button}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <span>SIGN IN</span>
                <ArrowRight size={16} />
              </>
            )}
          </SubmitButton>
        </Form>

        {/* FOOTER TEXT */}
        <FooterText>SISTEM PELAPORAN PT. PELINDO MULTI TERMINAL</FooterText>
      </CardWrapper>

      {/* POPUP NOTIFIKASI SUKSES */}
      <AnimatePresence>
        {loginNotification.isOpen && loginNotification.userData && (
          <NotificationOverlay
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <NotificationCard
              className="glass-card"
              as={motion.div}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -10 }}
            >
              <div className="check-icon-circle">
                <CheckCircle2 size={32} color="#10b981" />
              </div>
              <h4>Autentikasi Berhasil!</h4>
              <p className="subtext">
                Data pengguna berhasil diverifikasi dari database Firebase:
              </p>

              <UserDataGrid>
                <div className="grid-item">
                  <span className="item-label">NAMA PETUGAS</span>
                  <strong className="item-value highlight">
                    {loginNotification.userData.name}
                  </strong>
                </div>

                <div className="grid-item">
                  <span className="item-label">ROLE AKSES</span>
                  <div className="role-badge-row">
                    <span
                      className={`badge-pill ${
                        loginNotification.userData.role === UserRole.BPO
                          ? "bpo"
                          : "user"
                      }`}
                    >
                      {loginNotification.userData.role === UserRole.BPO
                        ? "BPO (Badan Pengawas Operasional)"
                        : "USER (Pelapor Lapangan)"}
                    </span>
                  </div>
                </div>

                <div className="grid-item">
                  <span className="item-label">JABATAN (DATABASE FIREBASE)</span>
                  <strong className="item-value">
                    {loginNotification.userData.position}
                  </strong>
                </div>

                <div className="grid-item">
                  <span className="item-label">DIVISI / UNIT KERJA</span>
                  <span className="item-sub">
                    {loginNotification.userData.division}
                  </span>
                </div>
              </UserDataGrid>

              <ContinueBtn
                onClick={() => onLoginSuccess(loginNotification.userData)}
                as={motion.button}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Buka Dashboard Sekarang</span>
                <ArrowRight size={15} />
              </ContinueBtn>
            </NotificationCard>
          </NotificationOverlay>
        )}
      </AnimatePresence>
    </Container>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLED COMPONENTS WITH FULL DARK & LIGHT MODE SUPPORT + AUTOFILL OVERRIDE
// ─────────────────────────────────────────────────────────────────────────────

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  background: var(--bg-primary, #090d16);
  transition: background-color 0.3s ease;
`;

const BackgroundGlow = styled.div`
  position: absolute;
  width: 650px;
  height: 650px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, rgba(9, 13, 22, 0) 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
`;

const CardWrapper = styled.div`
  width: 100%;
  max-width: 380px;
  padding: 2.75rem 2.25rem 2.25rem;
  border-radius: 2rem;
  background: var(--bg-card, rgba(17, 24, 39, 0.85));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.45);
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  backdrop-filter: blur(16px);
  transition: background-color 0.3s, border-color 0.3s;
`;

const LogoHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 2rem;
  width: 100%;
`;

const LogoBadge = styled.div`
  width: 58px;
  height: 58px;
  border-radius: 18px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.45);
  margin-bottom: 1.25rem;
`;

const BrandTitle = styled.h1`
  margin: 0;
  font-size: 1.45rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  color: var(--text-primary, #ffffff);
  text-transform: uppercase;
`;

const BrandSubtitle = styled.p`
  margin: 6px 0 0;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.15em;
  color: var(--text-muted, #60a5fa);
  text-transform: uppercase;
  opacity: 0.85;
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

const FieldLabel = styled.label`
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  padding-left: 2px;
`;

const InputWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;

  .input-icon {
    position: absolute;
    left: 14px;
    color: var(--text-muted, #64748b);
    transition: color 0.2s;
    z-index: 2;
  }

    input {
    width: 100%;
    padding: 12px 42px 12px 42px;
    background: #ffffff;
    border: 1px solid rgba(226, 232, 240, 1);
    border-radius: 14px;
    font-size: 0.85rem;
    color: #0f172a;
    outline: none;
    transition: all 0.2s;

    &::placeholder {
      color: #94a3b8;
      opacity: 0.7;
    }

    &:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
    }

    /* OVERRIDE CHROME/EDGE BROWSER AUTOFILL GREY BACKGROUND */
    &:-webkit-autofill,
    &:-webkit-autofill:hover, 
    &:-webkit-autofill:focus, 
    &:-webkit-autofill:active {
      -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
      -webkit-text-fill-color: #0f172a !important;
      caret-color: #0f172a !important;
      border-radius: 14px !important;
      transition: background-color 9999s ease-in-out 0s;
    }
  }

  &:focus-within .input-icon {
    color: #3b82f6;
  }

  .toggle-pass {
    position: absolute;
    right: 12px;
    background: transparent;
    border: none;
    color: var(--text-muted, #64748b);
    cursor: pointer;
    padding: 4px;
    display: flex;
    z-index: 2;

    &:hover {
      color: var(--text-primary, #0f172a);
    }
  }
`;

const SubmitButton = styled.button`
  margin-top: 0.5rem;
  width: 100%;
  padding: 13px 20px;
  background: linear-gradient(135deg, #3b82f6 0%, #4f46e5 100%);
  border: none;
  border-radius: 14px;
  color: white;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.55);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const AlertBox = styled.div`
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  color: #ef4444;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const FooterText = styled.p`
  margin-top: 2rem;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--text-muted, #64748b);
  text-align: center;
  text-transform: uppercase;
  opacity: 0.75;
`;

// SUCCESS NOTIFICATION MODAL
const NotificationOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
`;

const NotificationCard = styled.div`
  width: 100%;
  max-width: 420px;
  padding: 2rem;
  border-radius: 1.75rem;
  background: var(--bg-card, #1e293b);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;

  .check-icon-circle {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: rgba(16, 185, 129, 0.12);
    border: 1px solid rgba(16, 185, 129, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
  }

  h4 {
    margin: 0 0 4px;
    font-size: 1.15rem;
    font-weight: 800;
    color: var(--text-primary, #ffffff);
  }

  .subtext {
    font-size: 0.75rem;
    color: var(--text-muted, #94a3b8);
    margin: 0 0 1.25rem;
  }
`;

const UserDataGrid = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 1.5rem;
  background: var(--bg-card-subtle, rgba(15, 23, 42, 0.5));
  border-radius: 14px;
  padding: 1rem;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  text-align: left;

  .grid-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .item-label {
    font-size: 0.65rem;
    font-weight: 800;
    color: var(--text-muted, #64748b);
    letter-spacing: 0.05em;
  }

  .item-value {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-primary, #f8fafc);

    &.highlight {
      color: #38bdf8;
    }
  }

  .item-sub {
    font-size: 0.75rem;
    color: var(--text-secondary, #cbd5e1);
  }

  .badge-pill {
    display: inline-flex;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 0.72rem;
    font-weight: 800;
    margin-top: 2px;

    &.bpo {
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }

    &.user {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
  }
`;

const ContinueBtn = styled.button`
  width: 100%;
  padding: 12px;
  background: #2563eb;
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 0.82rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
`;
