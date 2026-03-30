'use client';

import React from 'react';
import { TeableTable, TeableField, UploadMode, MainTab } from '@/types';
import { IconAttachment, IconExcel, IconTable, IconUpload, IconEdit, IconRefresh } from './Icons';

interface SidebarProps {
  mainTab: MainTab;
  setMainTab: (tab: MainTab) => void;
  mode: UploadMode;
  setMode: (mode: UploadMode) => void;
  tables: TeableTable[];
  targetTableId: string;
  onTargetTableChange: (tableId: string) => void;
  fields: TeableField[];
  nameFieldId: string;
  setNameFieldId: (id: string) => void;
  matchFieldId: string;
  setMatchFieldId: (id: string) => void;
  matchType: 'exact' | 'contains';
  setMatchType: (type: 'exact' | 'contains') => void;
  forceCreate: boolean;
  setForceCreate: (v: boolean) => void;
  skipCompletedFiles: boolean;
  setSkipCompletedFiles: (v: boolean) => void;
  attachmentFieldId: string;
  setAttachmentFieldId: (id: string) => void;
  excelSheet: string;
  setExcelSheet: (v: string) => void;
  excelSheets: string[];
  excelTableName: string;
  setExcelTableName: (v: string) => void;
  excelHeaderRow: string;
  setExcelHeaderRow: (v: string) => void;
  excelImportImages: boolean;
  setExcelImportImages: (v: boolean) => void;
}

export function Sidebar(props: SidebarProps) {
  const {
    mainTab, setMainTab, mode, setMode,
    tables, targetTableId, onTargetTableChange, fields,
    nameFieldId, setNameFieldId, matchFieldId, setMatchFieldId,
    matchType, setMatchType, forceCreate, setForceCreate,
    skipCompletedFiles, setSkipCompletedFiles,
    attachmentFieldId, setAttachmentFieldId,
    excelSheet, setExcelSheet, excelSheets, excelTableName, setExcelTableName,
    excelHeaderRow, setExcelHeaderRow, excelImportImages, setExcelImportImages,
  } = props;

  const textFields = fields.filter(f => ['singleLineText', 'longText'].includes(f.type) && !f.isComputed);

  return (
    <aside className="w-[240px] bg-gray-50 border-r border-gray-300 p-3 flex flex-col gap-3 overflow-y-auto text-[12px]">
      {/* Tabs */}
      <div className="flex gap-1">
        <button
          onClick={() => setMainTab('attachment')}
          className={`flex-1 py-1.5 px-2 rounded text-[11px] font-medium flex items-center justify-center gap-1 border transition-all ${
            mainTab === 'attachment'
              ? 'bg-white border-primary text-primary shadow-sm'
              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <IconAttachment size={12} />
          附件
        </button>
        <button
          onClick={() => setMainTab('excel')}
          className={`flex-1 py-1.5 px-2 rounded text-[11px] font-medium flex items-center justify-center gap-1 border transition-all ${
            mainTab === 'excel'
              ? 'bg-white border-primary text-primary shadow-sm'
              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <IconExcel size={12} />
          嵌图表格
        </button>
      </div>

      {mainTab === 'attachment' ? (
        <AttachmentOptions
          tables={tables}
          targetTableId={targetTableId}
          onTargetTableChange={onTargetTableChange}
          mode={mode}
          setMode={setMode}
          fields={fields}
          textFields={textFields}
          nameFieldId={nameFieldId}
          setNameFieldId={setNameFieldId}
          matchFieldId={matchFieldId}
          setMatchFieldId={setMatchFieldId}
          matchType={matchType}
          setMatchType={setMatchType}
          forceCreate={forceCreate}
          setForceCreate={setForceCreate}
          skipCompletedFiles={skipCompletedFiles}
          setSkipCompletedFiles={setSkipCompletedFiles}
          attachmentFieldId={attachmentFieldId}
          setAttachmentFieldId={setAttachmentFieldId}
        />
      ) : (
        <ExcelOptions
          excelSheet={excelSheet}
          setExcelSheet={setExcelSheet}
          excelSheets={excelSheets}
          excelTableName={excelTableName}
          setExcelTableName={setExcelTableName}
          excelHeaderRow={excelHeaderRow}
          setExcelHeaderRow={setExcelHeaderRow}
          excelImportImages={excelImportImages}
          setExcelImportImages={setExcelImportImages}
        />
      )}
    </aside>
  );
}

const ATTACHMENT_FIELD_NAME = 'teaPrintResult';

interface AttachmentOptionsProps {
  tables: TeableTable[];
  targetTableId: string;
  onTargetTableChange: (tableId: string) => void;
  mode: UploadMode;
  setMode: (mode: UploadMode) => void;
  fields: TeableField[];
  textFields: TeableField[];
  nameFieldId: string;
  setNameFieldId: (id: string) => void;
  matchFieldId: string;
  setMatchFieldId: (id: string) => void;
  matchType: 'exact' | 'contains';
  setMatchType: (type: 'exact' | 'contains') => void;
  forceCreate: boolean;
  setForceCreate: (v: boolean) => void;
  skipCompletedFiles: boolean;
  setSkipCompletedFiles: (v: boolean) => void;
  attachmentFieldId: string;
  setAttachmentFieldId: (id: string) => void;
}

function AttachmentOptions({
  tables, targetTableId, onTargetTableChange, mode, setMode,
  fields, textFields, nameFieldId, setNameFieldId, matchFieldId, setMatchFieldId,
  matchType, setMatchType, forceCreate, setForceCreate,
  skipCompletedFiles, setSkipCompletedFiles,
  attachmentFieldId, setAttachmentFieldId,
}: AttachmentOptionsProps) {
  // Get attachment fields
  const attachmentFields = fields.filter(f => f.type === 'attachment');
  const hasDefaultField = attachmentFields.some(f => f.name === ATTACHMENT_FIELD_NAME);
  const defaultField = attachmentFields.find(f => f.name === ATTACHMENT_FIELD_NAME);
  return (
    <>
      {/* Target Table */}
      <div className="bg-white border border-gray-300 rounded p-3 shadow-sm">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
          <IconTable size={12} />
          目标表
        </div>
        <div>
          <select
            value={targetTableId}
            onChange={(e) => onTargetTableChange(e.target.value)}
            className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-[11px] text-gray-700 focus:outline-none focus:border-primary transition-all appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2710%27%20height%3D%2710%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%23999%27%20stroke-width%3D%272%27%3E%3Cpolyline%20points%3D%276%209%2012%2015%2018%209%27%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center] pr-6"
          >
            <option value="">{tables.length > 0 ? '请选择目标表' : '请先配置连接'}</option>
            {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      </div>

      {/* Upload Mode */}
      <div className="bg-white border border-gray-300 rounded p-3 shadow-sm">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
          <IconUpload size={12} />
          上传模式
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            className={`flex items-start gap-2 p-2 bg-white border rounded cursor-pointer transition-all ${
              mode === 'create' ? 'border-primary bg-primary-light' : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              name="uploadMode"
              value="create"
              checked={mode === 'create'}
              onChange={() => setMode('create')}
              className="w-3.5 h-3.5 mt-0.5 accent-primary"
            />
            <div className="flex-1">
              <div className="font-medium text-[11px] text-gray-700">上传创建记录</div>
              <div className="text-[10px] text-gray-500">每个附件创建一行新记录</div>
            </div>
          </label>
          <label
            className={`flex items-start gap-2 p-2 bg-white border rounded cursor-pointer transition-all ${
              mode === 'update' ? 'border-primary bg-primary-light' : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              name="uploadMode"
              value="update"
              checked={mode === 'update'}
              onChange={() => setMode('update')}
              className="w-3.5 h-3.5 mt-0.5 accent-primary"
            />
            <div className="flex-1">
              <div className="font-medium text-[11px] text-gray-700">上传更新记录</div>
              <div className="text-[10px] text-gray-500">按名称匹配追加到现有记录</div>
            </div>
          </label>
        </div>
      </div>

      {/* Create Options */}
      {mode === 'create' && (
        <div className="bg-white border border-gray-300 rounded p-3 shadow-sm">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
            <IconEdit size={12} />
            创建选项
          </div>
          <div className="space-y-3">
            {/* Attachment Field */}
            <div>
              <label className="text-[10px] text-gray-500 mb-1 block">附件字段</label>
              <select
                value={attachmentFieldId}
                onChange={(e) => setAttachmentFieldId(e.target.value)}
                disabled={!targetTableId}
                className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-[11px] text-gray-700 focus:outline-none focus:border-primary transition-all disabled:bg-gray-100 disabled:text-gray-400 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2710%27%20height%3D%2710%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%23999%27%20stroke-width%3D%272%27%3E%3Cpolyline%20points%3D%276%209%2012%2015%2018%209%27%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center] pr-6"
              >
                {!targetTableId ? (
                  <option value="">请先选择目标表</option>
                ) : (
                  <>
                    <option value="">{attachmentFields.length > 0 || hasDefaultField ? '选择附件字段' : '无可用附件字段'}</option>
                    {attachmentFields.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} {f.name === ATTACHMENT_FIELD_NAME ? '(默认)' : ''}
                      </option>
                    ))}
                    {!hasDefaultField && (
                      <option value="__create__">➕ 创建 {ATTACHMENT_FIELD_NAME}</option>
                    )}
                  </>
                )}
              </select>
              {!hasDefaultField && attachmentFieldId && attachmentFieldId !== '__create__' && (
                <p className="text-[10px] text-amber-600 mt-1">
                  提示：推荐使用 "{ATTACHMENT_FIELD_NAME}" 字段
                </p>
              )}
              {attachmentFieldId === '__create__' && (
                <p className="text-[10px] text-primary mt-1">
                  将自动创建 "{ATTACHMENT_FIELD_NAME}" 附件字段
                </p>
              )}
            </div>
            {/* Name Field */}
            <div>
              <label className="text-[10px] text-gray-500 mb-1 block">名称写入字段</label>
              <select
                value={nameFieldId}
                onChange={(e) => setNameFieldId(e.target.value)}
                disabled={!targetTableId}
                className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-[11px] text-gray-700 focus:outline-none focus:border-primary transition-all disabled:bg-gray-100 disabled:text-gray-400 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2710%27%20height%3D%2710%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%23999%27%20stroke-width%3D%272%27%3E%3Cpolyline%20points%3D%276%209%2012%2015%2018%209%27%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center] pr-6"
              >
                {!targetTableId ? (
                  <option value="">请先选择目标表</option>
                ) : (
                  <>
                    <option value="">{textFields.length > 0 ? '选择字段' : '无可用字段'}</option>
                    {textFields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </>
                )}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Update Options */}
      {mode === 'update' && (
        <div className="bg-white border border-gray-300 rounded p-3 shadow-sm">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
            <IconRefresh size={12} />
            更新选项
          </div>
          <div className="space-y-3">
            {/* Attachment Field */}
            <div>
              <label className="text-[10px] text-gray-500 mb-1 block">附件字段</label>
              <select
                value={attachmentFieldId}
                onChange={(e) => setAttachmentFieldId(e.target.value)}
                disabled={!targetTableId}
                className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-[11px] text-gray-700 focus:outline-none focus:border-primary transition-all disabled:bg-gray-100 disabled:text-gray-400 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2710%27%20height%3D%2710%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%23999%27%20stroke-width%3D%272%27%3E%3Cpolyline%20points%3D%276%209%2012%2015%2018%209%27%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center] pr-6"
              >
                {!targetTableId ? (
                  <option value="">请先选择目标表</option>
                ) : (
                  <>
                    <option value="">{attachmentFields.length > 0 || hasDefaultField ? '选择附件字段' : '无可用附件字段'}</option>
                    {attachmentFields.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} {f.name === ATTACHMENT_FIELD_NAME ? '(默认)' : ''}
                      </option>
                    ))}
                    {!hasDefaultField && (
                      <option value="__create__">➕ 创建 {ATTACHMENT_FIELD_NAME}</option>
                    )}
                  </>
                )}
              </select>
              {!hasDefaultField && attachmentFieldId && attachmentFieldId !== '__create__' && (
                <p className="text-[10px] text-amber-600 mt-1">
                  提示：推荐使用 "{ATTACHMENT_FIELD_NAME}" 字段
                </p>
              )}
              {attachmentFieldId === '__create__' && (
                <p className="text-[10px] text-primary mt-1">
                  将自动创建 "{ATTACHMENT_FIELD_NAME}" 附件字段
                </p>
              )}
            </div>
            {/* Match Field */}
            <div>
              <label className="text-[10px] text-gray-500 mb-1 block">匹配字段</label>
              <select
                value={matchFieldId}
                onChange={(e) => setMatchFieldId(e.target.value)}
                disabled={!targetTableId}
                className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-[11px] text-gray-700 focus:outline-none focus:border-primary transition-all disabled:bg-gray-100 disabled:text-gray-400 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2710%27%20height%3D%2710%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%23999%27%20stroke-width%3D%272%27%3E%3Cpolyline%20points%3D%276%209%2012%2015%2018%209%27%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center] pr-6"
              >
                {!targetTableId ? (
                  <option value="">请先选择目标表</option>
                ) : (
                  <>
                    <option value="">{textFields.length > 0 ? '选择字段' : '无可用字段'}</option>
                    {textFields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </>
                )}
              </select>
            </div>
            {/* Match Type */}
            <div>
              <label className="text-[10px] text-gray-500 mb-1 block">匹配方式</label>
              <select
                value={matchType}
                onChange={(e) => setMatchType(e.target.value as 'exact' | 'contains')}
                className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-[11px] text-gray-700 focus:outline-none focus:border-primary transition-all appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2710%27%20height%3D%2710%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%23999%27%20stroke-width%3D%272%27%3E%3Cpolyline%20points%3D%276%209%2012%2015%2018%209%27%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center] pr-6"
              >
                <option value="exact">精确匹配</option>
                <option value="contains">包含匹配</option>
              </select>
            </div>
            <label className="flex items-center gap-1.5 text-[11px] text-gray-600 pt-0.5">
              <input
                type="checkbox"
                checked={forceCreate}
                onChange={(e) => setForceCreate(e.target.checked)}
                className="w-3.5 h-3.5 accent-primary cursor-pointer"
              />
              未匹配时创建新记录
            </label>
          </div>
        </div>
      )}

      {/* Upload Settings - compact version */}
      <div className="bg-gray-100/50 border border-gray-200 rounded p-2.5">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={skipCompletedFiles}
            onChange={(e) => setSkipCompletedFiles(e.target.checked)}
            className="w-3.5 h-3.5 accent-primary cursor-pointer"
          />
          <span className="text-[11px] text-gray-600">跳过已上传的文件</span>
        </label>
      </div>
    </>
  );
}

interface ExcelOptionsProps {
  excelSheet: string;
  setExcelSheet: (v: string) => void;
  excelSheets: string[];
  excelTableName: string;
  setExcelTableName: (v: string) => void;
  excelHeaderRow: string;
  setExcelHeaderRow: (v: string) => void;
  excelImportImages: boolean;
  setExcelImportImages: (v: boolean) => void;
}

function ExcelOptions({
  excelSheet, setExcelSheet, excelSheets, excelTableName, setExcelTableName,
  excelHeaderRow, setExcelHeaderRow, excelImportImages, setExcelImportImages,
}: ExcelOptionsProps) {
  return (
    <div className="bg-white border border-gray-300 rounded p-3 shadow-sm">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
        <IconExcel size={12} />
        嵌图表格选项
      </div>
      <div className="space-y-2">
        <select
          value={excelSheet}
          onChange={(e) => setExcelSheet(e.target.value)}
          className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-[11px] text-gray-700 focus:outline-none focus:border-primary transition-all appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2710%27%20height%3D%2710%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%23999%27%20stroke-width%3D%272%27%3E%3Cpolyline%20points%3D%276%209%2012%2015%2018%209%27%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center] pr-6"
        >
          <option value="">{excelSheets.length > 0 ? '选择工作表' : '请先上传嵌图表格文件'}</option>
          {excelSheets.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input
          type="text"
          value={excelTableName}
          onChange={(e) => setExcelTableName(e.target.value)}
          placeholder="表名（默认使用文件名）"
          className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-[11px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-primary transition-all"
        />
        <select
          value={excelHeaderRow}
          onChange={(e) => setExcelHeaderRow(e.target.value)}
          className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded text-[11px] text-gray-700 focus:outline-none focus:border-primary transition-all appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20width%3D%2710%27%20height%3D%2710%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%23999%27%20stroke-width%3D%272%27%3E%3Cpolyline%20points%3D%276%209%2012%2015%2018%209%27%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_8px_center] pr-6"
        >
          <option value="1">标题行：第 1 行</option>
          <option value="2">标题行：第 2 行</option>
          <option value="3">标题行：第 3 行</option>
        </select>
        <label className="flex items-center gap-1.5 text-[11px] text-gray-600 pt-0.5">
          <input
            type="checkbox"
            checked={excelImportImages}
            onChange={(e) => setExcelImportImages(e.target.checked)}
            className="w-3.5 h-3.5 accent-primary cursor-pointer"
          />
          导入内嵌图片为附件
        </label>
      </div>
    </div>
  );
}
