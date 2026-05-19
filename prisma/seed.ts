import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const pw = await bcrypt.hash("Bobs2026!", 10);

  // ── Tenant ──────────────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: "bobs" },
    create: {
      name: "Botswana Bureau of Standards",
      slug: "bobs",
      primaryColor: "#213976",
      status: "ACTIVE",
    },
    update: { primaryColor: "#213976" },
  });

  // ── Staff users ──────────────────────────────────────────────────────────────
  const platformAdmin = await prisma.user.upsert({
    where: { email: "platform@bobs.gov.bw" },
    create: { email: "platform@bobs.gov.bw", name: "BOBS Platform Admin", passwordHash: pw, role: "PLATFORM_ADMIN" },
    update: { passwordHash: pw },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@bobs.gov.bw" },
    create: {
      email: "admin@bobs.gov.bw",
      name: "Kabo Sithole",
      passwordHash: pw,
      role: "TENANT_ADMIN",
      tenantId: tenant.id,
    },
    update: { passwordHash: pw, tenantId: tenant.id },
  });

  const reviewer = await prisma.user.upsert({
    where: { email: "reviewer@bobs.gov.bw" },
    create: {
      email: "reviewer@bobs.gov.bw",
      name: "Naledi Mosweu",
      passwordHash: pw,
      role: "REVIEWER",
      tenantId: tenant.id,
    },
    update: { passwordHash: pw, tenantId: tenant.id },
  });

  // ── Licensee users ───────────────────────────────────────────────────────────
  const uBokomo = await prisma.user.upsert({
    where: { email: "quality@bokomo.co.bw" },
    create: { email: "quality@bokomo.co.bw", name: "Bokomo Botswana — Quality Dept", passwordHash: pw, role: "LICENSEE", tenantId: tenant.id },
    update: { passwordHash: pw, tenantId: tenant.id },
  });

  const uBolux = await prisma.user.upsert({
    where: { email: "compliance@bolux.co.bw" },
    create: { email: "compliance@bolux.co.bw", name: "Bolux Group — Compliance", passwordHash: pw, role: "LICENSEE", tenantId: tenant.id },
    update: { passwordHash: pw, tenantId: tenant.id },
  });

  const uBvi = await prisma.user.upsert({
    where: { email: "quality@bvi.co.bw" },
    create: { email: "quality@bvi.co.bw", name: "Botswana Vaccine Institute — QA", passwordHash: pw, role: "LICENSEE", tenantId: tenant.id },
    update: { passwordHash: pw, tenantId: tenant.id },
  });

  const uClover = await prisma.user.upsert({
    where: { email: "quality@clover.co.bw" },
    create: { email: "quality@clover.co.bw", name: "Clover Botswana — Quality", passwordHash: pw, role: "LICENSEE", tenantId: tenant.id },
    update: { passwordHash: pw, tenantId: tenant.id },
  });

  const uKalcon = await prisma.user.upsert({
    where: { email: "qms@kalcon.co.bw" },
    create: { email: "qms@kalcon.co.bw", name: "KALCON Pty Ltd — QMS", passwordHash: pw, role: "LICENSEE", tenantId: tenant.id },
    update: { passwordHash: pw, tenantId: tenant.id },
  });

  const uBhc = await prisma.user.upsert({
    where: { email: "compliance@bhc.co.bw" },
    create: { email: "compliance@bhc.co.bw", name: "Botswana Housing Corp — Compliance", passwordHash: pw, role: "LICENSEE", tenantId: tenant.id },
    update: { passwordHash: pw, tenantId: tenant.id },
  });

  const uBac = await prisma.user.upsert({
    where: { email: "quality@bac.ac.bw" },
    create: { email: "quality@bac.ac.bw", name: "Botswana Accountancy College — Quality", passwordHash: pw, role: "LICENSEE", tenantId: tenant.id },
    update: { passwordHash: pw, tenantId: tenant.id },
  });

  // ── Matrix dimensions ────────────────────────────────────────────────────────
  const dimSector = await prisma.matrixDimension.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: "sector" } },
    create: { tenantId: tenant.id, name: "Industry Sector", slug: "sector", sortOrder: 0 },
    update: {},
  });

  const dimCertType = await prisma.matrixDimension.upsert({
    where: { tenantId_slug: { tenantId: tenant.id, slug: "cert-type" } },
    create: { tenantId: tenant.id, name: "Certification Type", slug: "cert-type", sortOrder: 1 },
    update: {},
  });

  // Sector values
  const vFood = await prisma.matrixDimensionValue.upsert({
    where: { dimensionId_code: { dimensionId: dimSector.id, code: "food-agro" } },
    create: { dimensionId: dimSector.id, label: "Food & Agro-processing", code: "food-agro", sortOrder: 0 },
    update: {},
  });
  const vPharma = await prisma.matrixDimensionValue.upsert({
    where: { dimensionId_code: { dimensionId: dimSector.id, code: "pharma-health" } },
    create: { dimensionId: dimSector.id, label: "Pharmaceutical & Health", code: "pharma-health", sortOrder: 1 },
    update: {},
  });
  const vConstruction = await prisma.matrixDimensionValue.upsert({
    where: { dimensionId_code: { dimensionId: dimSector.id, code: "construction" } },
    create: { dimensionId: dimSector.id, label: "Construction & Engineering", code: "construction", sortOrder: 2 },
    update: {},
  });
  const vEducation = await prisma.matrixDimensionValue.upsert({
    where: { dimensionId_code: { dimensionId: dimSector.id, code: "education" } },
    create: { dimensionId: dimSector.id, label: "Education & Professional Services", code: "education", sortOrder: 3 },
    update: {},
  });
  await prisma.matrixDimensionValue.upsert({
    where: { dimensionId_code: { dimensionId: dimSector.id, code: "mining" } },
    create: { dimensionId: dimSector.id, label: "Mining & Resources", code: "mining", sortOrder: 4 },
    update: {},
  });
  await prisma.matrixDimensionValue.upsert({
    where: { dimensionId_code: { dimensionId: dimSector.id, code: "trade-retail" } },
    create: { dimensionId: dimSector.id, label: "Trade & Retail", code: "trade-retail", sortOrder: 5 },
    update: {},
  });

  // Certification type values
  const vQms = await prisma.matrixDimensionValue.upsert({
    where: { dimensionId_code: { dimensionId: dimCertType.id, code: "iso-9001" } },
    create: { dimensionId: dimCertType.id, label: "ISO 9001 — Quality Management", code: "iso-9001", sortOrder: 0 },
    update: {},
  });
  await prisma.matrixDimensionValue.upsert({
    where: { dimensionId_code: { dimensionId: dimCertType.id, code: "iso-14001" } },
    create: { dimensionId: dimCertType.id, label: "ISO 14001 — Environmental Management", code: "iso-14001", sortOrder: 1 },
    update: {},
  });
  await prisma.matrixDimensionValue.upsert({
    where: { dimensionId_code: { dimensionId: dimCertType.id, code: "iso-45001" } },
    create: { dimensionId: dimCertType.id, label: "ISO 45001 — Occupational Health & Safety", code: "iso-45001", sortOrder: 2 },
    update: {},
  });
  const vProdMark = await prisma.matrixDimensionValue.upsert({
    where: { dimensionId_code: { dimensionId: dimCertType.id, code: "product-mark" } },
    create: { dimensionId: dimCertType.id, label: "BOBS Product Standard Mark", code: "product-mark", sortOrder: 3 },
    update: {},
  });
  const vMetro = await prisma.matrixDimensionValue.upsert({
    where: { dimensionId_code: { dimensionId: dimCertType.id, code: "metrology" } },
    create: { dimensionId: dimCertType.id, label: "Metrology & Calibration", code: "metrology", sortOrder: 4 },
    update: {},
  });
  const vImport = await prisma.matrixDimensionValue.upsert({
    where: { dimensionId_code: { dimensionId: dimCertType.id, code: "import-coc" } },
    create: { dimensionId: dimCertType.id, label: "Import Inspection (CoC)", code: "import-coc", sortOrder: 5 },
    update: {},
  });

  // ── Templates ────────────────────────────────────────────────────────────────

  // 1. QMS Annual Surveillance Report
  const tSurv = await prisma.template.upsert({
    where: { tenantId_code_version: { tenantId: tenant.id, code: "QMS-SURV-001", version: 1 } },
    create: {
      tenantId: tenant.id,
      code: "QMS-SURV-001",
      version: 1,
      name: "QMS Annual Surveillance Report",
      description: "Annual surveillance audit submission for ISO 9001 certified organisations. Required 12 months after initial/recertification audit.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      schema: {
        jsonSchema: {
          type: "object",
          required: ["organisation_name", "cert_number", "audit_period_from", "audit_period_to", "scope", "ncr_count", "corrective_actions_summary"],
          properties: {
            organisation_name: { type: "string", title: "Organisation name" },
            cert_number: { type: "string", title: "Certification number (e.g. QMS/24-05/R001)" },
            audit_period_from: { type: "string", title: "Audit period — start date", format: "date" },
            audit_period_to: { type: "string", title: "Audit period — end date", format: "date" },
            scope: { type: "string", title: "Certified scope of activities" },
            ncr_count: { type: "integer", minimum: 0, title: "Number of non-conformances (NCRs) raised" },
            corrective_actions_summary: { type: "string", title: "Summary of corrective actions taken" },
            management_review_date: { type: "string", title: "Date of last management review", format: "date" },
            internal_audit_date: { type: "string", title: "Date of last internal audit", format: "date" },
            kpi_on_time_delivery: { type: "number", minimum: 0, maximum: 100, title: "On-time delivery KPI (%)" },
            kpi_customer_complaints: { type: "integer", minimum: 0, title: "Customer complaints (count)" },
            additional_notes: { type: "string", title: "Additional notes" },
          },
        },
        fileSlots: [
          { key: "management_review_minutes", label: "Management Review Minutes (PDF)", extensions: ["pdf"], maxSizeMB: 10, required: true },
          { key: "internal_audit_report", label: "Internal Audit Report (PDF)", extensions: ["pdf"], maxSizeMB: 20, required: true },
          { key: "ncr_register", label: "NCR & Corrective Action Register (PDF/XLSX)", extensions: ["pdf", "xlsx"], maxSizeMB: 10, required: false },
        ],
      },
    },
    update: {},
  });

  // 2. Product Certification Application (Standard Mark)
  const tProdCert = await prisma.template.upsert({
    where: { tenantId_code_version: { tenantId: tenant.id, code: "PROD-CERT-001", version: 1 } },
    create: {
      tenantId: tenant.id,
      code: "PROD-CERT-001",
      version: 1,
      name: "Product Certification Application — BOBS Standard Mark",
      description: "Application for a licence to use the BOBS Standard Mark on a product. The product must meet the requirements of the applicable Botswana Standard.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      schema: {
        jsonSchema: {
          type: "object",
          required: ["applicant_name", "product_name", "applicable_standard", "production_site", "annual_volume_units", "test_lab_name"],
          properties: {
            applicant_name: { type: "string", title: "Applicant / Company name" },
            product_name: { type: "string", title: "Product name and description" },
            applicable_standard: { type: "string", title: "Applicable Botswana Standard (BOS number)" },
            production_site: { type: "string", title: "Production site address" },
            annual_volume_units: { type: "integer", minimum: 1, title: "Estimated annual production volume (units)" },
            test_lab_name: { type: "string", title: "Testing laboratory used" },
            test_report_ref: { type: "string", title: "Test report reference number" },
            brand_name: { type: "string", title: "Brand name (if different from product name)" },
            has_existing_mark: { type: "boolean", title: "Does the applicant hold any existing BOBS Standard Mark licence?" },
            previous_cert_number: { type: "string", title: "Previous certification number (if applicable)" },
          },
        },
        fileSlots: [
          { key: "test_report", label: "Laboratory Test Report (PDF)", extensions: ["pdf"], maxSizeMB: 25, required: true },
          { key: "factory_inspection", label: "Factory Inspection Checklist (PDF)", extensions: ["pdf"], maxSizeMB: 10, required: true },
          { key: "label_sample", label: "Product Label Sample (PDF/PNG/JPG)", extensions: ["pdf", "png", "jpg", "jpeg"], maxSizeMB: 5, required: false },
        ],
      },
    },
    update: {},
  });

  // 3. Import Inspection — Certificate of Conformity Request
  const tImport = await prisma.template.upsert({
    where: { tenantId_code_version: { tenantId: tenant.id, code: "IMPORT-COC-001", version: 1 } },
    create: {
      tenantId: tenant.id,
      code: "IMPORT-COC-001",
      version: 1,
      name: "Import Inspection — Certificate of Conformity (CoC) Request",
      description: "Required for controlled products under the Standards (Import Inspection) Regulations. Submit before goods depart the country of origin.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      schema: {
        jsonSchema: {
          type: "object",
          required: ["importer_name", "supplier_name", "country_of_origin", "product_description", "hs_code", "quantity", "invoice_value_bwp", "port_of_entry"],
          properties: {
            importer_name: { type: "string", title: "Importer name (Botswana entity)" },
            importer_tin: { type: "string", title: "Importer TIN / BURS registration number" },
            supplier_name: { type: "string", title: "Overseas supplier name" },
            country_of_origin: { type: "string", title: "Country of origin" },
            product_description: { type: "string", title: "Product description" },
            hs_code: { type: "string", title: "HS / Tariff code" },
            quantity: { type: "string", title: "Quantity and unit of measure" },
            invoice_value_bwp: { type: "number", minimum: 0, title: "Invoice value (BWP)" },
            port_of_entry: { type: "string", title: "Intended port of entry into Botswana" },
            rib_name: { type: "string", title: "Recognised Inspection Body (RIB) used" },
            rib_ref: { type: "string", title: "RIB reference number (if already assigned)" },
          },
        },
        fileSlots: [
          { key: "commercial_invoice", label: "Commercial Invoice (PDF)", extensions: ["pdf"], maxSizeMB: 10, required: true },
          { key: "packing_list", label: "Packing List (PDF)", extensions: ["pdf"], maxSizeMB: 5, required: true },
          { key: "supplier_coc", label: "Supplier Certificate of Conformity (PDF)", extensions: ["pdf"], maxSizeMB: 10, required: false },
        ],
      },
    },
    update: {},
  });

  // 4. Calibration Service Request
  const tCalib = await prisma.template.upsert({
    where: { tenantId_code_version: { tenantId: tenant.id, code: "CALIB-REQ-001", version: 1 } },
    create: {
      tenantId: tenant.id,
      code: "CALIB-REQ-001",
      version: 1,
      name: "Industrial Metrology — Calibration Service Request",
      description: "Request calibration of measuring instruments against national and international measurement standards. Results are SADCAS-accredited.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      schema: {
        jsonSchema: {
          type: "object",
          required: ["organisation_name", "contact_person", "instrument_type", "instrument_make", "serial_number", "quantity", "urgency"],
          properties: {
            organisation_name: { type: "string", title: "Organisation name" },
            contact_person: { type: "string", title: "Contact person" },
            contact_email: { type: "string", title: "Contact email", format: "email" },
            contact_phone: { type: "string", title: "Contact phone number" },
            instrument_type: { type: "string", title: "Instrument type (e.g. Analytical balance, Pressure gauge, Thermometer)" },
            instrument_make: { type: "string", title: "Make / Manufacturer" },
            instrument_model: { type: "string", title: "Model number" },
            serial_number: { type: "string", title: "Serial number" },
            quantity: { type: "integer", minimum: 1, title: "Number of instruments" },
            measurement_range: { type: "string", title: "Measurement range required" },
            last_calibration_date: { type: "string", title: "Date of last calibration", format: "date" },
            urgency: { type: "string", title: "Urgency", enum: ["Routine (10 business days)", "Priority (5 business days)", "Urgent (2 business days)"] },
            delivery_method: { type: "string", title: "Instrument delivery", enum: ["Drop off at BOBS Gaborone", "BOBS field visit requested"] },
            special_instructions: { type: "string", title: "Special instructions" },
          },
        },
        fileSlots: [
          { key: "previous_cert", label: "Previous Calibration Certificate (PDF)", extensions: ["pdf"], maxSizeMB: 5, required: false },
        ],
      },
    },
    update: {},
  });

  // 5. ISO 9001 Certification Application (New Applicant)
  const tIso9001 = await prisma.template.upsert({
    where: { tenantId_code_version: { tenantId: tenant.id, code: "ISO9001-APP-001", version: 1 } },
    create: {
      tenantId: tenant.id,
      code: "ISO9001-APP-001",
      version: 1,
      name: "ISO 9001:2015 Certification Application (New Applicant)",
      description: "Application for initial certification of a Quality Management System against BOS ISO 9001:2015. Applicable to all industries and organisation sizes.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      schema: {
        jsonSchema: {
          type: "object",
          required: ["org_name", "org_address", "org_size_employees", "scope", "num_sites", "qms_in_place_months", "contact_name", "contact_email"],
          properties: {
            org_name: { type: "string", title: "Organisation legal name" },
            org_address: { type: "string", title: "Registered address" },
            org_size_employees: { type: "integer", minimum: 1, title: "Total number of employees" },
            scope: { type: "string", title: "Proposed scope of certification" },
            num_sites: { type: "integer", minimum: 1, title: "Number of sites to be included" },
            site_addresses: { type: "string", title: "Additional site addresses (if more than one)" },
            qms_in_place_months: { type: "integer", minimum: 0, title: "Months QMS has been operational" },
            previous_certification: { type: "boolean", title: "Has the organisation been previously certified?" },
            previous_cert_body: { type: "string", title: "Previous certification body (if applicable)" },
            contact_name: { type: "string", title: "Primary contact name" },
            contact_email: { type: "string", title: "Primary contact email", format: "email" },
            contact_phone: { type: "string", title: "Primary contact phone" },
          },
        },
        fileSlots: [
          { key: "quality_manual", label: "Quality Manual or Documented Information (PDF)", extensions: ["pdf"], maxSizeMB: 20, required: true },
          { key: "scope_statement", label: "Scope Statement (PDF)", extensions: ["pdf"], maxSizeMB: 5, required: true },
          { key: "org_chart", label: "Organisation Chart (PDF/PNG)", extensions: ["pdf", "png", "jpg"], maxSizeMB: 5, required: false },
        ],
      },
    },
    update: {},
  });

  // 6. Standards Public Comment Submission
  const tComment = await prisma.template.upsert({
    where: { tenantId_code_version: { tenantId: tenant.id, code: "STD-COMMENT-001", version: 1 } },
    create: {
      tenantId: tenant.id,
      code: "STD-COMMENT-001",
      version: 1,
      name: "Standards for Public Comment — Submission",
      description: "Submit technical comments on Botswana Standards open for public review. Comments are reviewed by the relevant Technical Committee.",
      status: "PUBLISHED",
      publishedAt: new Date(),
      schema: {
        jsonSchema: {
          type: "object",
          required: ["standard_ref", "standard_title", "commenter_name", "commenter_org", "comment_type"],
          properties: {
            standard_ref: { type: "string", title: "Standard reference number (e.g. BOS ISO 9001:2015)" },
            standard_title: { type: "string", title: "Standard title" },
            commenter_name: { type: "string", title: "Name of commenter" },
            commenter_org: { type: "string", title: "Organisation / Institution" },
            commenter_capacity: { type: "string", title: "Capacity", enum: ["Industry", "Government", "Consumer", "Academia", "Other"] },
            comment_type: { type: "string", title: "Type of comment", enum: ["General", "Technical — Editorial", "Technical — Substantive", "Safety concern"] },
            clause_reference: { type: "string", title: "Clause / Section reference (if applicable)" },
            comment_text: { type: "string", title: "Comment / Proposed change" },
            justification: { type: "string", title: "Justification / Rationale" },
            proposed_text: { type: "string", title: "Proposed replacement text (if applicable)" },
          },
        },
        fileSlots: [
          { key: "supporting_evidence", label: "Supporting Evidence / References (PDF)", extensions: ["pdf"], maxSizeMB: 10, required: false },
        ],
      },
    },
    update: {},
  });

  // ── Template matrix tags ──────────────────────────────────────────────────────
  async function tagTemplate(templateId: string, values: { id: string }[]) {
    await prisma.templateMatrixTag.deleteMany({ where: { templateId } });
    if (values.length > 0) {
      await prisma.templateMatrixTag.createMany({
        data: values.map((v) => ({ templateId, matrixDimensionValueId: v.id })),
      });
    }
  }

  await tagTemplate(tSurv.id, [vFood, vPharma, vConstruction, vEducation, vQms]);
  await tagTemplate(tProdCert.id, [vFood, vPharma, vProdMark]);
  await tagTemplate(tImport.id, [vFood, vPharma, vImport]);
  await tagTemplate(tCalib.id, [vFood, vPharma, vConstruction, vMetro]);
  await tagTemplate(tIso9001.id, [vFood, vPharma, vConstruction, vEducation, vQms]);
  await tagTemplate(tComment.id, [vFood, vPharma, vConstruction, vEducation]);

  // ── Instances (seed data) ─────────────────────────────────────────────────────
  await prisma.instance.deleteMany({ where: { tenantId: tenant.id } });

  // 1. Bokomo — QMS Annual Surveillance — SUBMITTED
  await prisma.instance.create({
    data: {
      tenantId: tenant.id,
      templateId: tSurv.id,
      assigneeId: uBokomo.id,
      provisionedById: admin.id,
      status: "SUBMITTED",
      deadline: new Date("2026-06-30"),
      submittedAt: new Date("2026-05-02"),
      draftPayload: {},
      submissionPayload: {
        organisation_name: "Bokomo Botswana (Pty) Ltd",
        cert_number: "QMS/14-05/R003",
        audit_period_from: "2025-05-01",
        audit_period_to: "2026-04-30",
        scope: "Milling, packaging and distribution of wheat and maize products.",
        ncr_count: 2,
        corrective_actions_summary: "Two minor NCRs were raised: (1) calibration record for weighing scale WS-004 was overdue by 3 weeks — corrected and recalibrated. (2) Document control procedure v2.3 referenced an obsolete form — form list updated.",
        management_review_date: "2026-03-15",
        internal_audit_date: "2026-02-20",
        kpi_on_time_delivery: 97.4,
        kpi_customer_complaints: 3,
        additional_notes: "No major non-conformances. Continuous improvement objectives on target.",
      },
    },
  });

  // 2. Bolux — QMS Annual Surveillance — IN_PROGRESS
  await prisma.instance.create({
    data: {
      tenantId: tenant.id,
      templateId: tSurv.id,
      assigneeId: uBolux.id,
      provisionedById: admin.id,
      status: "IN_PROGRESS",
      deadline: new Date("2026-05-31"),
      draftPayload: {
        organisation_name: "Bolux Group (Pty) Ltd",
        cert_number: "QMS/16-08/R007",
        audit_period_from: "2025-06-01",
        audit_period_to: "2026-05-31",
        scope: "Manufacture and distribution of wheaten flour, pasta, and confectionery products.",
        ncr_count: 1,
        corrective_actions_summary: "",
        management_review_date: "",
        internal_audit_date: "2026-04-10",
        kpi_on_time_delivery: 94.1,
        kpi_customer_complaints: 7,
        additional_notes: "",
      },
    },
  });

  // 3. BVI — Product Certification Application — PENDING
  await prisma.instance.create({
    data: {
      tenantId: tenant.id,
      templateId: tProdCert.id,
      assigneeId: uBvi.id,
      provisionedById: admin.id,
      status: "PENDING",
      deadline: new Date("2026-05-28"),
    },
  });

  // 4. Clover — QMS Annual Surveillance — APPROVED
  await prisma.instance.create({
    data: {
      tenantId: tenant.id,
      templateId: tSurv.id,
      assigneeId: uClover.id,
      provisionedById: admin.id,
      status: "APPROVED",
      deadline: new Date("2026-02-28"),
      submittedAt: new Date("2026-02-14"),
      reviewedAt: new Date("2026-02-25"),
      reviewedById: reviewer.id,
      reviewNotes: "All documentation in order. No major non-conformances. Certification recommended for renewal.",
      submissionPayload: {
        organisation_name: "Clover Botswana (Pty) Ltd",
        cert_number: "QMS/18-03/R012",
        audit_period_from: "2025-03-01",
        audit_period_to: "2026-02-28",
        scope: "Processing, packaging and distribution of dairy products and fermented milk.",
        ncr_count: 0,
        corrective_actions_summary: "No non-conformances raised during this cycle.",
        management_review_date: "2026-01-20",
        internal_audit_date: "2026-01-08",
        kpi_on_time_delivery: 99.1,
        kpi_customer_complaints: 1,
        additional_notes: "Cold chain monitoring system upgraded in Q3 2025.",
      },
    },
  });

  // 5. KALCON — QMS Annual Surveillance — FLAGGED
  await prisma.instance.create({
    data: {
      tenantId: tenant.id,
      templateId: tSurv.id,
      assigneeId: uKalcon.id,
      provisionedById: admin.id,
      status: "FLAGGED",
      deadline: new Date("2026-04-30"),
      submittedAt: new Date("2026-04-28"),
      reviewedAt: new Date("2026-05-06"),
      reviewedById: reviewer.id,
      reviewNotes: "Submission incomplete. NCR #3 (concrete batch testing non-compliance raised during Jan 2026 internal audit) has no documented corrective action or closure evidence. Internal audit report provided covers only 2 of 3 active project sites. Please resubmit with (a) corrective action closure record for NCR #3 and (b) complete internal audit report covering all sites.",
      submissionPayload: {
        organisation_name: "KALCON (Pty) Ltd",
        cert_number: "QMS/21-11/R002",
        audit_period_from: "2025-04-01",
        audit_period_to: "2026-03-31",
        scope: "Civil engineering and construction project management.",
        ncr_count: 3,
        corrective_actions_summary: "NCR #1 and #2 corrected. NCR #3 under investigation.",
        management_review_date: "2026-03-05",
        internal_audit_date: "2026-01-22",
        kpi_on_time_delivery: 81.0,
        kpi_customer_complaints: 5,
        additional_notes: "",
      },
    },
  });

  // 6. BHC — QMS Annual Surveillance — SUBMITTED
  await prisma.instance.create({
    data: {
      tenantId: tenant.id,
      templateId: tSurv.id,
      assigneeId: uBhc.id,
      provisionedById: admin.id,
      status: "SUBMITTED",
      deadline: new Date("2026-06-15"),
      submittedAt: new Date("2026-05-10"),
      submissionPayload: {
        organisation_name: "Botswana Housing Corporation",
        cert_number: "QMS/24-05/R001",
        audit_period_from: "2025-06-01",
        audit_period_to: "2026-05-31",
        scope: "Development, construction management, and maintenance of public housing infrastructure.",
        ncr_count: 4,
        corrective_actions_summary: "NCR #1: Procurement procedure non-conformance — updated and re-issued. NCR #2-3: Minor document control gaps — corrected. NCR #4: Subcontractor pre-qualification records incomplete — register updated.",
        management_review_date: "2026-04-18",
        internal_audit_date: "2026-03-12",
        kpi_on_time_delivery: 73.5,
        kpi_customer_complaints: 18,
        additional_notes: "Significant project volume increase in FY2025/26 has placed strain on QMS resources. Recruitment of QMS Coordinator ongoing.",
      },
    },
  });

  // 7. Bolux — Import CoC Request — PENDING
  await prisma.instance.create({
    data: {
      tenantId: tenant.id,
      templateId: tImport.id,
      assigneeId: uBolux.id,
      provisionedById: admin.id,
      status: "PENDING",
      deadline: new Date("2026-05-20"),
    },
  });

  // 8. Bokomo — Calibration Request — APPROVED
  await prisma.instance.create({
    data: {
      tenantId: tenant.id,
      templateId: tCalib.id,
      assigneeId: uBokomo.id,
      provisionedById: admin.id,
      status: "APPROVED",
      deadline: new Date("2026-04-15"),
      submittedAt: new Date("2026-04-02"),
      reviewedAt: new Date("2026-04-09"),
      reviewedById: reviewer.id,
      reviewNotes: "Calibration completed. Certificates dispatched to applicant.",
      submissionPayload: {
        organisation_name: "Bokomo Botswana (Pty) Ltd",
        contact_person: "T. Seretse",
        contact_email: "quality@bokomo.co.bw",
        instrument_type: "Analytical balance",
        instrument_make: "Mettler Toledo",
        instrument_model: "XS204",
        serial_number: "BKM-BAL-004",
        quantity: 3,
        measurement_range: "0 – 220 g",
        last_calibration_date: "2025-03-20",
        urgency: "Routine (10 business days)",
        delivery_method: "Drop off at BOBS Gaborone",
        special_instructions: "",
      },
    },
  });

  // 9. BAC — ISO 9001 Application — IN_PROGRESS
  await prisma.instance.create({
    data: {
      tenantId: tenant.id,
      templateId: tIso9001.id,
      assigneeId: uBac.id,
      provisionedById: admin.id,
      status: "IN_PROGRESS",
      deadline: new Date("2026-06-30"),
      draftPayload: {
        org_name: "Botswana Accountancy College",
        org_address: "Plot 50374 Fairgrounds, Gaborone",
        org_size_employees: 280,
        scope: "Provision of accounting, finance and business education — undergraduate and postgraduate programmes.",
        num_sites: 2,
        site_addresses: "Francistown Campus, Plot 14862 Haskins Street",
        qms_in_place_months: 8,
        previous_certification: false,
        previous_cert_body: "",
        contact_name: "Dr M. Kelobang",
        contact_email: "quality@bac.ac.bw",
        contact_phone: "+267 395 0180",
      },
    },
  });

  console.log("\n✅  BOBS seed complete");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Demo credentials (password: Bobs2026!)");
  console.log("  platform@bobs.gov.bw   — Platform Admin");
  console.log("  admin@bobs.gov.bw      — BOBS Admin (Kabo Sithole)");
  console.log("  reviewer@bobs.gov.bw   — Reviewer (Naledi Mosweu)");
  console.log("  quality@bokomo.co.bw   — Licensee (Bokomo Botswana)");
  console.log("  compliance@bolux.co.bw — Licensee (Bolux Group)");
  console.log("  quality@bvi.co.bw      — Licensee (BVI)");
  console.log("  quality@clover.co.bw   — Licensee (Clover Botswana)");
  console.log("  qms@kalcon.co.bw       — Licensee (KALCON)");
  console.log("  compliance@bhc.co.bw   — Licensee (BHC)");
  console.log("  quality@bac.ac.bw      — Licensee (BAC)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  void platformAdmin;
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
