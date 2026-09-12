import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  Calendar,
  UserCheck,
  Building2,
  X,
  ExternalLink,
  Search,
  Send,
  Save,
  Check,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { ReportStatus, UserRole } from "../constants/enums";
import { db, getDocs, collection } from "../firebase";
import Pagination from "./Pagination";

interface ReportTableProps {
  reports: any[];
  user: any;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
  hideActions?: boolean;
  onImageClick?: (url: string) => void;
}

export default function ReportTable({
  reports,
  user,
  onUpdate,
  onDelete,
  hideActions,
  onImageClick,
}: ReportTableProps) {
  // State for EDIT modal
  const [editingReport, setEditingReport] = useState<any | null>(null);
  const [editEstimationDate, setEditEstimationDate] = useState("");
  const [editPlannedAction, setEditPlannedAction] = useState("");
  const [editStatusChoice, setEditStatusChoice] = useState<ReportStatus>(ReportStatus.OPEN);

  // State for DISPOSISI modal
  const [disposisiReport, setDisposisiReport] = useState<any | null>(null);
  const [searchRecipientQuery, setSearchRecipientQuery] = useState("");
  const [dbUsers, setDbUsers] = useState<any[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<any | null>(null);
  const [disposisiNotes, setDisposisiNotes] = useState("");
  const [disposisiSuccess, setDisposisiSuccess] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    field: "findingType" | "date";
    direction: "asc" | "desc";
  }>({ field: "date", direction: "desc" });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Reset page when report dataset changes
  useEffect(() => {
    setCurrentPage(1);
  }, [reports]);

  // Fetch users from database for Disposisi
  useEffect(() => {
    async function loadUsersFromDatabase() {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList: any[] = [];
        querySnapshot.docs.forEach((docSnap: any) => {
          const u = docSnap.data();
          usersList.push({
            id: docSnap.id,
            uid: u.uid || docSnap.id,
            nama: u.nama || u.name,
            jabatan: u.jabatan || u.position || "Petugas Lapangan",
            divisi: u.divisi || u.division || "Operasional Pelindo",
            role: u.role || "USER",
          });
        });
        setDbUsers(usersList);
      } catch (err) {
        console.warn("Error fetching users from database:", err);
      }
    }
    loadUsersFromDatabase();
  }, []);

  // Open Edit modal
  const handleOpenEdit = (report: any) => {
    setEditingReport(report);
    setEditEstimationDate(report.estimationDate || "");
    setEditPlannedAction(report.plannedAction || "");
    setEditStatusChoice(report.status || ReportStatus.OPEN);
  };

  // Save Edit modal
  const handleSaveEdit = () => {
    if (!editingReport) return;

    const updates: any = {
      estimationDate: editEstimationDate,
      plannedAction: editPlannedAction,
      status: editStatusChoice,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.name || "BPO Supervisor",
    };

    if (editStatusChoice === ReportStatus.CLOSED) {
      updates.closedAt = new Date().toISOString().split("T")[0];
      updates.handlingReport = "Selesai";
    } else if (editStatusChoice === ReportStatus.IN_PROGRESS) {
      updates.handlingReport = "Sedang Dikerjakan";
    }

    onUpdate(editingReport.id, updates);
    setEditingReport(null);
  };

  // Open Disposisi modal
  const handleOpenDisposisi = (report: any) => {
    setDisposisiReport(report);
    setSearchRecipientQuery("");
    setDisposisiNotes(report.plannedAction || "");
    setDisposisiSuccess(false);

    // Pre-select current recipient if already assigned
    if (report.picName) {
      const match = dbUsers.find((u) => u.nama === report.picName);
      setSelectedRecipient(match || { nama: report.picName, jabatan: "PIC Ditugaskan", divisi: report.disposisiUnit || "Pelindo" });
    } else {
      setSelectedRecipient(null);
    }
  };

  // Submit Disposisi
  const handleSaveDisposisi = () => {
    if (!disposisiReport || !selectedRecipient) return;

    const updates: any = {
      picName: selectedRecipient.nama,
      picUid: selectedRecipient.uid || selectedRecipient.id,
      disposisiUnit: selectedRecipient.divisi,
      status: ReportStatus.IN_PROGRESS, // Auto-move to in progress when delegated
      plannedAction: disposisiNotes || `Didisposisikan kepada ${selectedRecipient.nama} (${selectedRecipient.jabatan})`,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.name || "BPO Officer",
    };

    onUpdate(disposisiReport.id, updates);
    setDisposisiSuccess(true);
    setTimeout(() => {
      setDisposisiReport(null);
      setDisposisiSuccess(false);
    }, 900);
  };

  // Filter users from database by search input
  const filteredUsers = dbUsers.filter((u) => {
    const q = searchRecipientQuery.toLowerCase();
    return (
      (u.nama || "").toLowerCase().includes(q) ||
      (u.jabatan || "").toLowerCase().includes(q) ||
      (u.divisi || "").toLowerCase().includes(q)
    );
  });

  const sortedReports = [...reports].sort((a, b) => {
    let valueA = "";
    let valueB = "";

    if (sortConfig.field === "findingType") {
      valueA = a.findingType || "";
      valueB = b.findingType || "";
    } else {
      const dateA = a.createdAt?.seconds
        ? a.createdAt.seconds * 1000
        : new Date(a.date || 0).getTime();
      const dateB = b.createdAt?.seconds
        ? b.createdAt.seconds * 1000
        : new Date(b.date || 0).getTime();
      return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
    }

    const comparison = valueA.localeCompare(valueB, "id", { numeric: true });
    return sortConfig.direction === "asc" ? comparison : -comparison;
  });

  // Calculate pagination boundaries
  const totalItems = sortedReports.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedReports = sortedReports.slice(startIndex, endIndex);

  const handleSort = (field: "findingType" | "date") => {
    setSortConfig((current) => ({
      field,
      direction: current.field === field && current.direction === "desc" ? "asc" : "desc",
    }));
  };

  const SortIcon = ({ field }: { field: "findingType" | "date" }) => {
    if (sortConfig.field !== field) return <ArrowUpDown size={12} />;
    return sortConfig.direction === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  if (!reports || reports.length === 0) {
    return (
      <EmptyWrapper className="glass-card">
        <div className="empty-icon">
          <ShieldAlert size={38} color="#64748b" />
        </div>
        <h3>Belum Ada Laporan di Antrean Ini</h3>
        <p>Tidak ada catatan temuan K3 yang sesuai dengan status antrean ini.</p>
      </EmptyWrapper>
    );
  }

  return (
    <Container>
      <TableOuter className="glass-card">
        <TableScroll>
          <StyledTable>
            <thead>
              <tr>
                <th style={{ minWidth: "280px" }}>Temuan</th>
                <SortableHeader
                  style={{ width: "150px" }}
                  onClick={() => handleSort("findingType")}
                  title="Urutkan berdasarkan kategori"
                >
                  <span>Kategori</span>
                  <SortIcon field="findingType" />
                </SortableHeader>
                <SortableHeader
                  style={{ width: "130px" }}
                  onClick={() => handleSort("date")}
                  title="Urutkan berdasarkan tanggal"
                >
                  <span>Tanggal</span>
                  <SortIcon field="date" />
                </SortableHeader>
                <th style={{ width: "140px" }}>Status</th>
                {!hideActions && (
                  <th style={{ width: "180px", textAlign: "center" }}>Aksi</th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedReports.map((report) => {
                const isCondition = report.findingType === "Unsafe Condition";
                const hasGPS = Boolean(report.latitude && report.longitude);

                return (
                  <tr key={report.id}>
                    {/* 1. TEMUAN (Foto, Deskripsi, Usulan, Alamat, Peta) */}
                    <td>
                      <TemuanContentCell>
                        {report.photoUrl && (
                          <PhotoThumbnail
                            src={report.photoUrl}
                            alt="Foto Temuan"
                            onClick={() => onImageClick?.(report.photoUrl)}
                            title="Klik untuk memperbesar foto temuan"
                          />
                        )}
                        <TemuanTextGroup>
                          <p className="finding-title">
                            {report.description || "Temuan tidak memiliki deskripsi"}
                          </p>
                          {report.suggestion && (
                            <div className="usulan-wrapper">
                              <span className="usulan-tag">Usulan Perbaikan:</span>
                              <span className="usulan-content">"{report.suggestion}"</span>
                            </div>
                          )}
                          <div className="meta-loc-row">
                            <MapPin size={12} color="#38bdf8" />
                            <span>
                              {report.address || (hasGPS ? `${Number(report.latitude).toFixed(4)}, ${Number(report.longitude).toFixed(4)}` : "Lokasi Dermaga")}
                            </span>
                            {isCondition && hasGPS && (
                              <a
                                href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                                target="_blank"
                                rel="noreferrer"
                                className="map-link-btn"
                                title="Lihat Peta Google Maps"
                              >
                                <span>Lihat Peta</span>
                                <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                          {report.picName && (
                            <div className="pic-assigned-tag">
                              <UserCheck size={11} color="#10b981" />
                              <span>PIC: {report.picName}</span>
                            </div>
                          )}
                        </TemuanTextGroup>
                      </TemuanContentCell>
                    </td>

                    {/* 2. KATEGORI */}
                    <td>
                      <FindingBadge isCondition={isCondition}>
                        {isCondition ? <MapPin size={11} /> : <ShieldAlert size={11} />}
                        <span>{isCondition ? "Unsafe Condition" : "Unsafe Action"}</span>
                      </FindingBadge>
                    </td>

                    {/* 3. TANGGAL */}
                    <td>
                      <DateBadgeCell>
                        <Calendar size={12} color="var(--text-secondary)" />
                        <span>{report.date || "Hari Ini"}</span>
                      </DateBadgeCell>
                    </td>

                    {/* 4. STATUS */}
                    <td>
                      <StatusPill status={report.status}>
                        {report.status === ReportStatus.OPEN && <AlertTriangle size={12} />}
                        {report.status === ReportStatus.IN_PROGRESS && <Clock size={12} />}
                        {report.status === ReportStatus.CLOSED && <CheckCircle2 size={12} />}
                        <span>
                          {report.status === ReportStatus.OPEN
                            ? "MENUNGGU"
                            : report.status === ReportStatus.IN_PROGRESS
                            ? "DIPROSES"
                            : "SELESAI"}
                        </span>
                      </StatusPill>
                    </td>

                    {/* 5. AKSI (EDIT, DISPOSISI, HAPUS) */}
                    {!hideActions && (
                      <td>
                        <ActionBtnRow>
                          {/* BUTTON EDIT */}
                          <ActionBtn
                            className="edit"
                            onClick={() => handleOpenEdit(report)}
                            title="Edit Laporan (Estimasi, Tindakan, Status)"
                            as={motion.button}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </ActionBtn>

                          {/* BUTTON DISPOSISI */}
                          <ActionBtn
                            className="disposisi"
                            onClick={() => handleOpenDisposisi(report)}
                            title="Disposisi Penerima (Ambil Nama dari Database)"
                            as={motion.button}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <UserCheck size={13} />
                            <span>Disposisi</span>
                          </ActionBtn>

                          {/* BUTTON HAPUS */}
                          <ActionBtn
                            className="delete"
                            onClick={() => onDelete(report.id)}
                            title="Hapus Laporan ke Tempat Sampah"
                            as={motion.button}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Trash2 size={13} />
                            <span>Hapus</span>
                          </ActionBtn>
                        </ActionBtnRow>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </StyledTable>
        </TableScroll>
        <Pagination
          currentPage={validPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          itemLabel="laporan"
        />
      </TableOuter>

      {/* ========================================================= */}
      {/* 🛠️ MODAL EDIT (Estimasi Tanggal, Rencana Tindakan, Pilihan Status) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {editingReport && (
          <ModalBackdrop
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ModalCard
              as={motion.div}
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="glass-card"
            >
              <ModalHeader>
                <div className="header-text">
                  <div className="icon-wrap">
                    <Edit3 size={18} color="#38bdf8" />
                  </div>
                  <div>
                    <h3>Edit Laporan Temuan</h3>
                    <p>Ubah estimasi tanggal selesai, rencana tindakan, dan status penanganan</p>
                  </div>
                </div>
                <CloseBtn onClick={() => setEditingReport(null)}>
                  <X size={18} />
                </CloseBtn>
              </ModalHeader>

              <ModalBody>
                {/* 1. ESTIMASI TANGGAL SELESAI */}
                <FieldGroup>
                  <label>Estimasi Tanggal Selesai</label>
                  <input
                    type="date"
                    value={editEstimationDate}
                    onChange={(e) => setEditEstimationDate(e.target.value)}
                  />
                </FieldGroup>

                {/* 2. RENCANA TINDAKAN */}
                <FieldGroup>
                  <label>Rencana Tindakan</label>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan rencana tindakan korektif atau mitigasi..."
                    value={editPlannedAction}
                    onChange={(e) => setEditPlannedAction(e.target.value)}
                  />
                </FieldGroup>

                {/* 3. PILIHAN STATUS (BATAL, PROSES, SELESAIKAN) */}
                <FieldGroup>
                  <label>Pilihan Status Penanganan</label>
                  <StatusChoiceGrid>
                    {/* BATAL / MENUNGGU */}
                    <StatusOptionCard
                      type="button"
                      selected={editStatusChoice === ReportStatus.OPEN}
                      choice="batal"
                      onClick={() => setEditStatusChoice(ReportStatus.OPEN)}
                    >
                      <AlertTriangle size={16} />
                      <div className="choice-info">
                        <strong>Batal</strong>
                        <span>Status Menunggu</span>
                      </div>
                    </StatusOptionCard>

                    {/* PROSES */}
                    <StatusOptionCard
                      type="button"
                      selected={editStatusChoice === ReportStatus.IN_PROGRESS}
                      choice="proses"
                      onClick={() => setEditStatusChoice(ReportStatus.IN_PROGRESS)}
                    >
                      <Clock size={16} />
                      <div className="choice-info">
                        <strong>Proses</strong>
                        <span>Sedang Dikerjakan</span>
                      </div>
                    </StatusOptionCard>

                    {/* SELESAIKAN */}
                    <StatusOptionCard
                      type="button"
                      selected={editStatusChoice === ReportStatus.CLOSED}
                      choice="selesaikan"
                      onClick={() => setEditStatusChoice(ReportStatus.CLOSED)}
                    >
                      <CheckCircle2 size={16} />
                      <div className="choice-info">
                        <strong>Selesaikan</strong>
                        <span>Tuntas & Terverifikasi</span>
                      </div>
                    </StatusOptionCard>
                  </StatusChoiceGrid>
                </FieldGroup>
              </ModalBody>

              <ModalFooter>
                <SecondaryBtn onClick={() => setEditingReport(null)}>
                  Batal / Tutup
                </SecondaryBtn>
                <PrimaryBtn
                  onClick={handleSaveEdit}
                  as={motion.button}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Save size={15} />
                  <span>Simpan Perubahan</span>
                </PrimaryBtn>
              </ModalFooter>
            </ModalCard>
          </ModalBackdrop>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 🚀 MODAL DISPOSISI (Cari Penerima Nama, Ambil Nama dari Database) */}
      {/* ========================================================= */}
      <AnimatePresence>
        {disposisiReport && (
          <ModalBackdrop
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ModalCard
              as={motion.div}
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="glass-card"
            >
              <ModalHeader>
                <div className="header-text">
                  <div className="icon-wrap disposisi-icon">
                    <UserCheck size={18} color="#10b981" />
                  </div>
                  <div>
                    <h3>Disposisi Penanganan Temuan</h3>
                    <p>Tugaskan penanganan temuan kepada PIC dari database Firebase</p>
                  </div>
                </div>
                <CloseBtn onClick={() => setDisposisiReport(null)}>
                  <X size={18} />
                </CloseBtn>
              </ModalHeader>

              <ModalBody>
                {disposisiSuccess && (
                  <SuccessAlert
                    as={motion.div}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <CheckCircle2 size={16} />
                    <span>Disposisi berhasil dikirimkan ke petugas pelaksana!</span>
                  </SuccessAlert>
                )}

                {/* 1. CARI PENERIMA NAMA */}
                <FieldGroup>
                  <label>Cari Penerima Nama</label>
                  <SearchInputWrap>
                    <Search size={15} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Ketik nama petugas, jabatan, atau divisi..."
                      value={searchRecipientQuery}
                      onChange={(e) => setSearchRecipientQuery(e.target.value)}
                    />
                  </SearchInputWrap>
                </FieldGroup>

                {/* 2. AMBIL NAMA DARI DATABASE FIREBASE */}
                <FieldGroup>
                  <div className="label-row">
                    <label>Pilih Petugas (Database Firebase)</label>
                    <span className="count-pill">{filteredUsers.length} Petugas Terdaftar</span>
                  </div>

                  <UserListScroll>
                    {filteredUsers.length === 0 ? (
                      <div className="no-user-found">
                        <AlertCircle size={16} />
                        <span>Nama petugas tidak ditemukan di database.</span>
                      </div>
                    ) : (
                      filteredUsers.map((u) => {
                        const isSelected = selectedRecipient?.nama === u.nama;
                        return (
                          <UserOptionRow
                            key={u.id || u.uid}
                            selected={isSelected}
                            onClick={() => setSelectedRecipient(u)}
                            type="button"
                          >
                            <div className="user-avatar">
                              {u.nama.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-details">
                              <span className="user-name">{u.nama}</span>
                              <span className="user-position">
                                {u.jabatan} • {u.divisi}
                              </span>
                            </div>
                            {isSelected ? (
                              <CheckCircle2 size={18} color="#10b981" />
                            ) : (
                              <span className="select-hint">Pilih</span>
                            )}
                          </UserOptionRow>
                        );
                      })
                    )}
                  </UserListScroll>
                </FieldGroup>

                {/* 3. INSTRUKSI DISPOSISI */}
                <FieldGroup>
                  <label>Instruksi / Catatan Disposisi</label>
                  <textarea
                    rows={2}
                    placeholder="Instruksi perbaikan bagi petugas pelaksana..."
                    value={disposisiNotes}
                    onChange={(e) => setDisposisiNotes(e.target.value)}
                  />
                </FieldGroup>
              </ModalBody>

              <ModalFooter>
                <SecondaryBtn onClick={() => setDisposisiReport(null)}>
                  Batal
                </SecondaryBtn>
                <PrimaryBtn
                  disabled={!selectedRecipient}
                  onClick={handleSaveDisposisi}
                  as={motion.button}
                  whileHover={{ scale: selectedRecipient ? 1.02 : 1 }}
                  whileTap={{ scale: selectedRecipient ? 0.98 : 1 }}
                >
                  <Send size={15} />
                  <span>Kirim Disposisi</span>
                </PrimaryBtn>
              </ModalFooter>
            </ModalCard>
          </ModalBackdrop>
        )}
      </AnimatePresence>
    </Container>
  );
}

// LUXURIOUS STYLED COMPONENTS
const Container = styled.div`
  width: 100%;
`;

const TableOuter = styled.div`
  border-radius: 1.25rem;
  border: 1px solid var(--border-color);
  overflow: hidden;
  background: var(--bg-card);
  box-shadow: var(--card-shadow);
`;

const TableScroll = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.8rem;

  thead {
    background: var(--bg-card-subtle);
    border-bottom: 1px solid var(--border-color);

    th {
      padding: 0.9rem 1rem;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      color: var(--text-secondary);
      text-transform: uppercase;
      white-space: nowrap;
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid var(--border-color);
      transition: background 0.15s ease;

      &:hover {
        background: var(--bg-card-subtle);
      }

      &:last-child {
        border-bottom: none;
      }

      td {
        padding: 0.9rem 1rem;
        vertical-align: middle;
      }
    }
  }
`;

const SortableHeader = styled.th`
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition: color 0.18s ease, background 0.18s ease;

  > span {
    display: inline-flex;
    align-items: center;
  }

  > svg {
    display: inline-block;
    vertical-align: middle;
    margin-left: 4px;
  }

  &:hover,
  &:focus-visible {
    color: #38bdf8 !important;
    background: rgba(56, 189, 248, 0.1);
    outline: none;
  }
`;

const TemuanContentCell = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const PhotoThumbnail = styled.img`
  width: 52px;
  height: 52px;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid var(--border-color);
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: scale(1.08);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
  }
`;

const TemuanTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  .finding-title {
    margin: 0;
    font-weight: 700;
    font-size: 0.82rem;
    color: var(--text-primary);
    line-height: 1.4;
  }

  .usulan-wrapper {
    display: flex;
    align-items: baseline;
    gap: 4px;
    font-size: 0.73rem;
    color: var(--text-secondary);
    line-height: 1.35;

    .usulan-tag {
      font-weight: 700;
      color: #38bdf8;
      flex-shrink: 0;
    }

    .usulan-content {
      font-style: italic;
    }
  }

  .meta-loc-row {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.7rem;
    color: var(--text-secondary);
    margin-top: 2px;

    .map-link-btn {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 1px 6px;
      border-radius: 4px;
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.3);
      color: #38bdf8;
      font-weight: 700;
      font-size: 0.65rem;
      text-decoration: none;

      &:hover {
        background: rgba(56, 189, 248, 0.22);
      }
    }
  }

  .pic-assigned-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.68rem;
    font-weight: 700;
    color: #10b981;
    margin-top: 2px;
  }
`;

const FindingBadge = styled.span<{ isCondition: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  background: ${({ isCondition }) =>
    isCondition ? "rgba(14, 165, 233, 0.12)" : "rgba(245, 158, 11, 0.12)"};
  border: 1px solid
    ${({ isCondition }) =>
      isCondition ? "rgba(14, 165, 233, 0.3)" : "rgba(245, 158, 11, 0.3)"};
  color: ${({ isCondition }) => (isCondition ? "#38bdf8" : "#fbbf24")};
  white-space: nowrap;
`;

const DateBadgeCell = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-card-subtle);
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  white-space: nowrap;
`;

const StatusPill = styled.span<{ status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  white-space: nowrap;

  ${({ status }) => {
    switch (status) {
      case ReportStatus.OPEN:
        return `
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #fbbf24;
        `;
      case ReportStatus.IN_PROGRESS:
        return `
          background: rgba(59, 130, 246, 0.12);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #38bdf8;
        `;
      case ReportStatus.CLOSED:
        return `
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
        `;
      default:
        return `
          background: rgba(100, 116, 139, 0.12);
          border: 1px solid rgba(100, 116, 139, 0.3);
          color: #94a3b8;
        `;
    }
  }}
`;

const ActionBtnRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const ActionBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 9px;
  border-radius: 7px;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s ease;

  &.edit {
    background: rgba(56, 189, 248, 0.12);
    border-color: rgba(56, 189, 248, 0.3);
    color: #38bdf8;

    &:hover {
      background: rgba(56, 189, 248, 0.22);
    }
  }

  &.disposisi {
    background: rgba(16, 185, 129, 0.12);
    border-color: rgba(16, 185, 129, 0.3);
    color: #10b981;

    &:hover {
      background: rgba(16, 185, 129, 0.22);
    }
  }

  &.delete {
    background: rgba(239, 68, 68, 0.12);
    border-color: rgba(239, 68, 68, 0.3);
    color: #ef4444;

    &:hover {
      background: rgba(239, 68, 68, 0.22);
    }
  }
`;

const EmptyWrapper = styled.div`
  padding: 4rem 2rem;
  text-align: center;
  border-radius: 1.5rem;
  border: 1px solid var(--border-color);
  background: var(--bg-card);

  .empty-icon {
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: var(--bg-card-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.25rem;
  }

  h3 {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
    color: var(--text-primary);
  }

  p {
    margin: 0;
    font-size: 0.82rem;
    color: var(--text-muted);
  }
`;

// MODAL OVERLAY & CARD
const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
`;

const ModalCard = styled.div`
  width: 100%;
  max-width: 520px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;

  .header-text {
    display: flex;
    align-items: center;
    gap: 12px;

    .icon-wrap {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;

      &.disposisi-icon {
        background: rgba(16, 185, 129, 0.12);
        border-color: rgba(16, 185, 129, 0.3);
      }
    }

    h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 800;
      color: var(--text-primary);
    }

    p {
      margin: 2px 0 0;
      font-size: 0.72rem;
      color: var(--text-muted);
    }
  }
`;

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;

  &:hover {
    color: var(--text-primary);
    background: var(--bg-card-subtle);
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-height: 70vh;
  overflow-y: auto;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-secondary);
  }

  .label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .count-pill {
      font-size: 0.65rem;
      font-weight: 700;
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.12);
      padding: 2px 6px;
      border-radius: 4px;
    }
  }

  input[type="date"],
  input[type="text"],
  textarea {
    width: 100%;
    padding: 8px 12px;
    background: var(--bg-card-subtle);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-primary);
    font-size: 0.8rem;
    outline: none;
    transition: all 0.2s;

    &:focus {
      border-color: #38bdf8;
      box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.15);
    }
  }
`;

const StatusChoiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

const StatusOptionCard = styled.button<{ selected: boolean; choice: "batal" | "proses" | "selesaikan" }>`
  padding: 10px 8px;
  border-radius: 10px;
  border: 1px solid;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
  transition: all 0.2s ease;

  ${({ selected, choice }) => {
    if (choice === "batal") {
      return `
        border-color: ${selected ? "#fbbf24" : "var(--border-color)"};
        background: ${selected ? "rgba(245, 158, 11, 0.18)" : "var(--bg-card-subtle)"};
        color: ${selected ? "#fbbf24" : "var(--text-secondary)"};
      `;
    }
    if (choice === "proses") {
      return `
        border-color: ${selected ? "#38bdf8" : "var(--border-color)"};
        background: ${selected ? "rgba(56, 189, 248, 0.18)" : "var(--bg-card-subtle)"};
        color: ${selected ? "#38bdf8" : "var(--text-secondary)"};
      `;
    }
    return `
      border-color: ${selected ? "#10b981" : "var(--border-color)"};
      background: ${selected ? "rgba(16, 185, 129, 0.18)" : "var(--bg-card-subtle)"};
      color: ${selected ? "#10b981" : "var(--text-secondary)"};
    `;
  }}

  .choice-info {
    display: flex;
    flex-direction: column;
    gap: 2px;

    strong {
      font-size: 0.78rem;
    }

    span {
      font-size: 0.65rem;
      opacity: 0.8;
    }
  }
`;

const SearchInputWrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  .search-icon {
    position: absolute;
    left: 10px;
    color: var(--text-muted);
  }

  input {
    width: 100%;
    padding: 8px 12px 8px 32px !important;
  }
`;

const UserListScroll = styled.div`
  max-height: 180px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 6px;
  background: var(--bg-card-subtle);

  .no-user-found {
    padding: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 0.75rem;
    color: var(--text-muted);
  }
`;

const UserOptionRow = styled.button<{ selected: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid ${({ selected }) => (selected ? "#10b981" : "transparent")};
  background: ${({ selected }) => (selected ? "rgba(16, 185, 129, 0.14)" : "var(--bg-card)")};
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ selected }) => (selected ? "rgba(16, 185, 129, 0.18)" : "var(--bg-card-hover, rgba(255,255,255,0.05))")};
  }

  .user-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: white;
    font-weight: 800;
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .user-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow: hidden;

    .user-name {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .user-position {
      font-size: 0.67rem;
      color: var(--text-muted);
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }

  .select-hint {
    font-size: 0.68rem;
    font-weight: 700;
    color: var(--text-muted);
  }
`;

const SuccessAlert = styled.div`
  padding: 8px 12px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 8px;
  color: #10b981;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ModalFooter = styled.div`
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
`;

const SecondaryBtn = styled.button`
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-card-subtle);
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    color: var(--text-primary);
    background: var(--border-color);
  }
`;

const PrimaryBtn = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: white;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
