"use client";

import { useState, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { parseExcelFile, downloadTemplate, type ParseResult, type SheetSummary } from "@/lib/excel";
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, Layers, ArrowRight, Info } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import { Asset } from "@/lib/types";

export default function UploadPage() {
  const { addAssets } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Asset[] | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [imported, setImported] = useState(false);
  const [importSummary, setImportSummary] = useState<{
    departments: string[];
    records: number;
    byDepartment: { department: string; count: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(null);
    setParseResult(null);
    setImported(false);
    setImportSummary(null);
    setLoading(true);
    try {
      const result = await parseExcelFile(f);
      setParseResult(result);
      setPreview(result.assets.length > 0 ? result.assets : null);
    } catch (err) {
      setParseResult({
        assets: [],
        errors: [{ message: String(err) }],
        missingTabs: [],
        sheetSummaries: [],
        detectedDepartments: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    if (!preview || preview.length === 0) return;
    addAssets(preview);
    const depts = parseResult?.detectedDepartments ?? [];
    const byDepartment = depts.map((d) => ({
      department: d,
      count: preview!.filter((a) => a.department === d).length,
    }));
    setImported(true);
    setImportSummary({
      departments: depts,
      records: preview.length,
      byDepartment,
    });
    setFile(null);
    setPreview(null);
    setParseResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const canImport = preview && preview.length > 0 && (parseResult?.missingTabs?.length ?? 1) === 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-hospital-navy">Excel Asset Upload</h1>
        <p className="text-slate-600">
          Import hospital assets and inventory using a workbook with three department tabs.
        </p>
      </div>

      {/* Explicit instructions */}
      <div className="rounded-xl border-2 border-hospital-teal/30 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2 text-hospital-navy">
          <Info className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Required workbook format</h2>
        </div>
        <p className="mb-4 text-slate-700">
          Your Excel workbook <strong>must contain exactly three tabs</strong>, with these exact names:
        </p>
        <ol className="mb-4 list-inside list-decimal space-y-2 rounded-lg bg-slate-50 p-4 text-slate-800">
          <li><strong>ICU</strong></li>
          <li><strong>Family Medicine</strong></li>
          <li><strong>Emergency</strong></li>
        </ol>
        <p className="mb-2 text-slate-700">
          <strong>Each tab is treated as its own department.</strong> All rows in the ICU tab will be labeled as <em>ICU</em> in the app; all rows in the Family Medicine tab will be labeled as <em>Family Medicine</em>; and all rows in the Emergency tab will be labeled as <em>Emergency</em>. You do not need to enter the department in each row — the tab name is used automatically.
        </p>
        <p className="text-sm text-slate-600">
          If a sheet has a &quot;Department&quot; column, it is ignored. The tab name is always the source of truth. A tab named <strong>Emergency Medicine</strong> is accepted as the Emergency department.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6">
        <h2 className="mb-3 font-semibold text-slate-800">How it works</h2>
        <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
          <li>Download the template (or build your own workbook) with the three tabs above.</li>
          <li>Each tab should have columns: Asset ID, Asset Name, Category, Quantity Available, Minimum Threshold, Unit Cost, Current Condition, Funding Source, Last Updated, Notes.</li>
          <li>Upload your file — we’ll detect the tabs and show a preview before you import.</li>
        </ul>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-800">1. Download template</h2>
          <p className="mb-4 text-sm text-slate-600">
            The template has three sheets: ICU, Family Medicine, and Emergency. Each sheet has the required columns: Asset ID, Asset Name, Category, Quantity Available, Minimum Threshold, Unit Cost, Current Condition, Funding Source, Last Updated, Notes.
          </p>
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            <Download className="h-4 w-4" />
            Download template
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 font-semibold text-slate-800">2. Upload your workbook</h2>
          <p className="mb-4 text-sm text-slate-600">
            Your file must contain the three tabs: <strong>ICU</strong>, <strong>Family Medicine</strong>, and <strong>Emergency</strong>. Each tab will be treated as that department.
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
          <div
            onClick={() => inputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-12 transition-colors hover:border-hospital-teal hover:bg-hospital-teal/5"
          >
            {loading ? (
              <p className="text-slate-500">Reading workbook...</p>
            ) : file ? (
              <>
                {parseResult ? (
                  <CheckCircle className="mb-2 h-10 w-10 text-emerald-500" />
                ) : (
                  <FileSpreadsheet className="mb-2 h-10 w-10 text-hospital-teal" />
                )}
                <p className="font-medium text-slate-700">{file.name}</p>
                <p className="text-sm text-slate-500">
                  {parseResult
                    ? "Finished processing"
                    : "Processing..."}
                </p>
                {parseResult && (preview?.length ?? 0) > 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    {preview?.length} records from {parseResult.detectedDepartments?.length ?? 0} departments
                  </p>
                )}
              </>
            ) : (
              <>
                <Upload className="mb-2 h-10 w-10 text-slate-400" />
                <p className="font-medium text-slate-700">Click to select .xlsx workbook</p>
                <p className="text-sm text-slate-500">Tabs required: ICU, Family Medicine, Emergency</p>
              </>
            )}
          </div>
        </div>
      </div>

      {parseResult && parseResult.errors.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span className="font-medium">Validation messages</span>
          </div>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-700">
            {parseResult.errors.map((e, i) => (
              <li key={i}>
                {e.sheet && `${e.sheet}: `}
                {e.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {parseResult && parseResult.sheetSummaries.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 flex items-center gap-2 font-semibold text-slate-800">
            <Layers className="h-5 w-5" />
            Tabs found in your workbook
          </h2>
          <p className="mb-4 text-sm text-slate-600">
            Each tab is treated as its own department. These will be the department labels in the app.
          </p>
          <div className="flex flex-wrap gap-4">
            {parseResult.sheetSummaries.map((s: SheetSummary) => (
              <div
                key={s.sheetName}
                className="rounded-lg border border-hospital-teal/20 bg-hospital-teal/5 px-4 py-3"
              >
                <p className="font-medium text-slate-800">{s.department}</p>
                <p className="text-sm text-slate-500">
                  {s.validRecordCount} asset record{s.validRecordCount !== 1 ? "s" : ""} → will appear as &quot;{s.department}&quot; in inventory
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {imported && importSummary && (
        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-semibold text-emerald-900">Import successful</h2>
              <p className="mt-1 text-emerald-800">
                Your hospital data has been imported and is ready to use.
              </p>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <dt className="font-medium text-emerald-800">Departments imported:</dt>
                  <dd className="text-emerald-700">{importSummary.departments.join(", ")}</dd>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <dt className="font-medium text-emerald-800">Total asset records:</dt>
                  <dd className="text-emerald-700">{importSummary.records}</dd>
                </div>
              </dl>
              {importSummary.byDepartment.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-3">
                  {importSummary.byDepartment.map(({ department, count }) => (
                    <li
                      key={department}
                      className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800"
                    >
                      {department}: {count} record{count !== 1 ? "s" : ""}
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href="/inventory"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
              >
                View Asset Inventory
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {preview && preview.length > 0 && (
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-semibold text-slate-800">Preview — confirm and import</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-600">
                    <th className="pb-3 pr-4">Asset ID</th>
                    <th className="pb-3 pr-4">Asset Name</th>
                    <th className="pb-3 pr-4">Category</th>
                    <th className="pb-3 pr-4">Department</th>
                    <th className="pb-3 pr-4">Qty</th>
                    <th className="pb-3 pr-4">Threshold</th>
                    <th className="pb-3 pr-4">Cost</th>
                    <th className="pb-3 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 10).map((a) => (
                    <tr key={a.id} className="border-b border-slate-100">
                      <td className="py-2 pr-4 font-mono text-slate-700">{a.assetId}</td>
                      <td className="py-2 pr-4">{a.assetName}</td>
                      <td className="py-2 pr-4">{a.category}</td>
                      <td className="py-2 pr-4">{a.department}</td>
                      <td className="py-2 pr-4">{a.quantityAvailable}</td>
                      <td className="py-2 pr-4">{a.minimumThreshold}</td>
                      <td className="py-2 pr-4">{formatCurrency(a.unitCost)}</td>
                      <td className="py-2 pr-4">
                        <StatusBadge status={a.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {preview.length > 10 && (
              <p className="mt-2 text-sm text-slate-500">
                Showing 10 of {preview.length} rows.
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={handleImport}
                disabled={!canImport}
                className="inline-flex items-center gap-2 rounded-lg bg-hospital-teal px-4 py-2.5 text-sm font-medium text-white hover:bg-hospital-teal/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="h-4 w-4" />
                Import {preview.length} assets from {parseResult?.detectedDepartments?.length ?? 0} departments
              </button>
              {!canImport && parseResult?.missingTabs && parseResult.missingTabs.length > 0 && (
                <span className="text-sm text-amber-600">
                  Add the missing tabs ({parseResult.missingTabs.join(", ")}) to your workbook to import.
                </span>
              )}
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                  setParseResult(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
