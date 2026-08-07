import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SECTORS } from "@/lib/constants";

const BUCKET = "phase2-uploads";
const SIGNED_URL_EXPIRY_SECONDS = 60 * 60 * 24 * 14; // 14 days — enough for a review cycle

type OtherDoc = { name: string; path: string; uploaded_at?: string };

type Row = {
  project_code: string | null;
  project_name: string;
  college_name: string;
  leader_name: string;
  leader_email: string;
  leader_phone: string;
  sector_prefix: string;
  sector_label: string;
  amount_approved: number | null;
  screening_status: string;
  funding_status: string;
  mentor_requested: boolean | null;
  submitted_at: string | null;
  pitch_deck_path: string | null;
  bills_path: string | null;
  passbook_path: string | null;
  pan_path: string | null;
  other_documents: OtherDoc[];
};

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFC9741B" }, // marigold, matches portal accent
};

const COLUMNS: { header: string; key: keyof Row | string; width: number }[] = [
  { header: "Project Code", key: "project_code", width: 16 },
  { header: "Phase 3 Decision", key: "decision", width: 16 },
  { header: "Project Name", key: "project_name", width: 30 },
  { header: "College", key: "college_name", width: 26 },
  { header: "Team Leader", key: "leader_name", width: 20 },
  { header: "Leader Email", key: "leader_email", width: 26 },
  { header: "Leader Phone", key: "leader_phone", width: 16 },
  { header: "Amount Approved (₹)", key: "amount_approved", width: 18 },
  { header: "Submitted", key: "submitted_label", width: 12 },
  { header: "Screening Status", key: "screening_status", width: 16 },
  { header: "Funding Status", key: "funding_status", width: 16 },
  { header: "Mentor Requested", key: "mentor_requested_label", width: 16 },
  { header: "Pitch Deck", key: "pitch_deck_link", width: 16 },
  { header: "Bills / Quotations", key: "bills_link", width: 16 },
  { header: "Passbook Photo", key: "passbook_link", width: 16 },
  { header: "PAN Photo", key: "pan_link", width: 16 },
  { header: "Other Documents", key: "other_docs_links", width: 30 },
];

function styleHeaderRow(row: ExcelJS.Row) {
  row.eachCell((cell) => {
    cell.fill = HEADER_FILL;
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.alignment = { vertical: "middle", wrapText: true };
  });
  row.height = 20;
}

export async function GET() {
  try {
    // ---- Auth: Secretary only ----
    const authed = await createClient();
    const {
      data: { user },
    } = await authed.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const { data: staff } = await authed
      .from("staff_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (!staff || staff.role !== "secretary") {
      return NextResponse.json({ error: "Only the Secretary can export this data" }, { status: 403 });
    }

    const admin = createAdminClient();

    // ---- Fetch every Phase 2 application with its team + sector ----
    const { data: raw, error: queryErr } = await admin
      .from("phase2_applications")
      .select(
        `id, amount_approved, screening_status, funding_status, mentor_requested, submitted_at,
         pitch_deck_url, bills_doc_url, passbook_doc_url, pan_doc_url, other_documents,
         teams(project_code, project_name, college_name, leader_name, leader_email, leader_phone, sectors(prefix, display_name))`
      )
      .order("created_at", { ascending: true });

    if (queryErr) {
      console.error("Phase 2 export query failed:", queryErr);
      return NextResponse.json({ error: "Could not load Phase 2 data" }, { status: 500 });
    }

    const rows: Row[] = (raw ?? []).map((r) => {
      const team = r.teams as unknown as {
        project_code: string | null;
        project_name: string;
        college_name: string;
        leader_name: string;
        leader_email: string;
        leader_phone: string;
        sectors: { prefix: string; display_name: string } | null;
      } | null;
      return {
        project_code: team?.project_code ?? null,
        project_name: team?.project_name ?? "—",
        college_name: team?.college_name ?? "—",
        leader_name: team?.leader_name ?? "—",
        leader_email: team?.leader_email ?? "—",
        leader_phone: team?.leader_phone ?? "—",
        sector_prefix: team?.sectors?.prefix ?? "OTHER",
        sector_label: team?.sectors?.display_name ?? "Unassigned Sector",
        amount_approved: r.amount_approved,
        screening_status: r.screening_status,
        funding_status: r.funding_status,
        mentor_requested: r.mentor_requested,
        submitted_at: r.submitted_at,
        pitch_deck_path: r.pitch_deck_url,
        bills_path: r.bills_doc_url,
        passbook_path: r.passbook_doc_url,
        pan_path: r.pan_doc_url,
        other_documents: Array.isArray(r.other_documents) ? r.other_documents : [],
      };
    });

    // ---- Batch-sign every uploaded file path in one call per bucket ----
    // (Not every application has uploaded every file, so this list is
    // usually much smaller than rows.length * 5.)
    const allPaths = new Set<string>();
    for (const row of rows) {
      for (const p of [row.pitch_deck_path, row.bills_path, row.passbook_path, row.pan_path]) {
        if (p) allPaths.add(p);
      }
      for (const doc of row.other_documents) {
        if (doc?.path) allPaths.add(doc.path);
      }
    }

    const signedUrlByPath = new Map<string, string>();
    if (allPaths.size > 0) {
      try {
        const { data: signed, error: signErr } = await admin.storage
          .from(BUCKET)
          .createSignedUrls(Array.from(allPaths), SIGNED_URL_EXPIRY_SECONDS);
        if (signErr) throw signErr;
        for (const entry of signed ?? []) {
          if (entry.signedUrl && entry.path) signedUrlByPath.set(entry.path, entry.signedUrl);
        }
      } catch (err) {
        // Don't fail the whole export just because signing had a hiccup —
        // the Secretary still gets every other column; file links just
        // show "Not available" for that batch instead.
        console.error("Phase 2 export: batch signed-url generation failed:", err);
      }
    }

    function link(path: string | null): string | { text: string; hyperlink: string } {
      if (!path) return "Not uploaded";
      const url = signedUrlByPath.get(path);
      if (!url) return "Link unavailable — check Storage manually";
      return { text: "View", hyperlink: url };
    }

    // The UI caps participants at one extra document, so a single real
    // hyperlink covers the normal case; anything beyond that falls back to
    // a plain-text list rather than a cell ExcelJS can't represent as one
    // clickable link with multiple distinct URLs.
    function otherDocsCell(docs: OtherDoc[]): string | { text: string; hyperlink: string } {
      if (docs.length === 0) return "None";
      if (docs.length === 1) {
        const url = docs[0].path ? signedUrlByPath.get(docs[0].path) : null;
        return url ? { text: docs[0].name, hyperlink: url } : `${docs[0].name}: link unavailable`;
      }
      return docs
        .map((d) => `${d.name}: ${d.path ? (signedUrlByPath.get(d.path) ?? "link unavailable") : "not uploaded"}`)
        .join("\n");
    }

    // ---- Build the workbook ----
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "I2I Portal";
    workbook.created = new Date();

    // Summary sheet first
    const summary = workbook.addWorksheet("Summary");
    summary.columns = [
      { header: "Sector", key: "sector", width: 32 },
      { header: "Submissions", key: "count", width: 14 },
      { header: "Pending Screening", key: "pending", width: 18 },
      { header: "Passed", key: "pass", width: 12 },
      { header: "Rejected", key: "reject", width: 12 },
    ];
    styleHeaderRow(summary.getRow(1));
    for (const sector of SECTORS) {
      const sectorRows = rows.filter((r) => r.sector_prefix === sector.prefix);
      summary.addRow({
        sector: sector.label,
        count: sectorRows.length,
        pending: sectorRows.filter((r) => r.screening_status === "pending").length,
        pass: sectorRows.filter((r) => r.screening_status === "pass").length,
        reject: sectorRows.filter((r) => r.screening_status === "reject").length,
      });
    }
    summary.addRow({
      sector: "TOTAL",
      count: rows.length,
      pending: rows.filter((r) => r.screening_status === "pending").length,
      pass: rows.filter((r) => r.screening_status === "pass").length,
      reject: rows.filter((r) => r.screening_status === "reject").length,
    });
    summary.getRow(summary.rowCount).font = { bold: true };

    // One sheet per sector, plus a catch-all for anything unassigned
    const sectorGroups = [
      ...SECTORS.map((s) => ({ prefix: s.prefix, label: s.label })),
      { prefix: "OTHER", label: "Unassigned Sector" },
    ];

    for (const group of sectorGroups) {
      const sectorRows = rows.filter((r) => r.sector_prefix === group.prefix);
      if (sectorRows.length === 0) continue;

      // Sheet names are capped at 31 chars and can't contain []:*?/\
      const sheetName = group.label.replace(/[\[\]:*?/\\]/g, "").slice(0, 31);
      const sheet = workbook.addWorksheet(sheetName);
      sheet.columns = COLUMNS.map((c) => ({ header: c.header, key: String(c.key), width: c.width }));
      styleHeaderRow(sheet.getRow(1));
      sheet.views = [{ state: "frozen", ySplit: 1 }];
      sheet.autoFilter = { from: "A1", to: `${String.fromCharCode(64 + COLUMNS.length)}1` };

      for (const r of sectorRows) {
        const existingDecision =
          r.funding_status === "approved" || r.funding_status === "partial"
            ? "Accept"
            : r.funding_status === "rejected"
              ? "Reject"
              : "";
        const newRow = sheet.addRow({
          project_code: r.project_code ?? "Pending",
          decision: existingDecision,
          project_name: r.project_name,
          college_name: r.college_name,
          leader_name: r.leader_name,
          leader_email: r.leader_email,
          leader_phone: r.leader_phone,
          amount_approved: r.amount_approved ?? "",
          submitted_label: r.submitted_at ? "Yes" : "No",
          screening_status: r.screening_status,
          funding_status: r.funding_status,
          mentor_requested_label: r.mentor_requested === true ? "Yes" : r.mentor_requested === false ? "No" : "Not answered",
          pitch_deck_link: link(r.pitch_deck_path),
          bills_link: link(r.bills_path),
          passbook_link: link(r.passbook_path),
          pan_link: link(r.pan_path),
          other_docs_links: otherDocsCell(r.other_documents),
        });
        // Real dropdown in Excel/Sheets for the decision column — keeps the
        // Secretary from typing free text that then fails to parse back on
        // import (e.g. "accepted" vs "Accept").
        const decisionCell = newRow.getCell("decision");
        decisionCell.dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: ['"Accept,Reject"'],
          showErrorMessage: true,
          errorStyle: "warning",
          error: 'Please choose "Accept" or "Reject" from the dropdown.',
        };
        decisionCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: existingDecision === "Accept" ? "FFDCFCE7" : existingDecision === "Reject" ? "FFFEE2E2" : "FFFFFFFF" },
        };
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `i2i-phase2-${new Date().toISOString().slice(0, 10)}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    // Last-resort catch: a broken export should never take down the
    // Secretary's screen, it should just fail with a clear message.
    console.error("Phase 2 export failed:", err);
    return NextResponse.json(
      { error: "Export failed unexpectedly. Try again — if it persists, contact the developer." },
      { status: 500 }
    );
  }
}
