import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

const MARIGOLD = rgb(0xc9 / 255, 0x74 / 255, 0x1b / 255);
const INK = rgb(0x1a / 255, 0x1a / 255, 0x1a / 255);
const MUTED = rgb(0x5a / 255, 0x5a / 255, 0x5a / 255);
const CREAM = rgb(0.99, 0.975, 0.95);

export type CertificateInput = {
  recipientName: string;
  projectName: string;
  projectCode: string | null;
  phaseLabel: string; // e.g. "Phase 1" or "Phase 2"
  issuedOn: string; // pre-formatted display date, e.g. "8 August 2026"
};

function centerText(
  page: PDFPage,
  text: string,
  y: number,
  font: PDFFont,
  size: number,
  color = INK
) {
  const width = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: (page.getWidth() - width) / 2, y, size, font, color });
}

// Simple greedy word-wrap since pdf-lib has no built-in text flow.
function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function generateCertificatePdf(input: CertificateInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([842, 595]); // A4 landscape
  const { width, height } = page.getSize();

  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const timesItalic = await doc.embedFont(StandardFonts.TimesRomanItalic);

  page.drawRectangle({ x: 0, y: 0, width, height, color: CREAM });

  // Outer + inner decorative border
  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderColor: MARIGOLD,
    borderWidth: 3,
  });
  page.drawRectangle({
    x: 34,
    y: 34,
    width: width - 68,
    height: height - 68,
    borderColor: MARIGOLD,
    borderWidth: 0.75,
  });

  let y = height - 90;

  centerText(page, "IGNITED INNOVATORS OF INDIA", y, helvBold, 15, MARIGOLD);
  y -= 20;
  centerText(
    page,
    "Bhau Institute, COEP Technological University, Pune",
    y,
    helv,
    10.5,
    MUTED
  );

  y -= 44;
  centerText(page, "CERTIFICATE OF PARTICIPATION", y, helvBold, 30, INK);

  y -= 20;
  page.drawLine({
    start: { x: width / 2 - 90, y },
    end: { x: width / 2 + 90, y },
    thickness: 1,
    color: MARIGOLD,
  });

  y -= 42;
  centerText(page, "This is to certify that", y, timesItalic, 13, MUTED);

  y -= 44;
  centerText(page, input.recipientName, y, helvBold, 27, INK);
  y -= 10;
  const nameWidth = helvBold.widthOfTextAtSize(input.recipientName, 27);
  page.drawLine({
    start: { x: width / 2 - nameWidth / 2 - 20, y },
    end: { x: width / 2 + nameWidth / 2 + 20, y },
    thickness: 0.75,
    color: MARIGOLD,
  });

  y -= 40;
  const projectLabel = input.projectCode
    ? `${input.projectName} (${input.projectCode})`
    : input.projectName;
  const body =
    `has participated in Ignited Innovators of India (I2I) 2026-27, a flagship innovation ` +
    `and entrepreneurship initiative of Bhau Institute, COEP Technological University, Pune, ` +
    `with the project "${projectLabel}", and successfully completed ${input.phaseLabel} of the competition.`;
  const bodyLines = wrapText(body, helv, 13, width - 220);
  for (const line of bodyLines) {
    centerText(page, line, y, helv, 13, INK);
    y -= 22;
  }

  // Footer: date on the left, signature line on the right
  const footerY = 110;
  page.drawText(`Date: ${input.issuedOn}`, {
    x: 90,
    y: footerY,
    size: 11,
    font: helv,
    color: MUTED,
  });

  const sigX = width - 90 - 180;
  page.drawLine({
    start: { x: sigX, y: footerY + 26 },
    end: { x: sigX + 180, y: footerY + 26 },
    thickness: 0.75,
    color: MUTED,
  });
  const sigLabel = "Programme Secretary, I2I";
  const sigWidth = helv.widthOfTextAtSize(sigLabel, 10.5);
  page.drawText(sigLabel, {
    x: sigX + (180 - sigWidth) / 2,
    y: footerY + 10,
    size: 10.5,
    font: helv,
    color: MUTED,
  });

  return doc.save();
}
