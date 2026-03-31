'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { TeableConfig, TeableField, TeableTable, UploadFile, UploadMode, MainTab, ExcelData } from '@/types';
import { loadConfig, saveConfig, clearConfig } from '@/lib/storage';
import { useI18n } from '@/lib/i18n-context';
import {
  getTables, getFields, getAllRecords, createRecords,
  getSignature, uploadToStorage, notifyUpload, uploadAttachment,
  createTable, createField, deleteRecords,
  ATTACHMENT_FIELD_NAME,
} from '@/lib/api';
import { ToastContainer, useToast } from '@/components/Toast';
import { SettingsModal } from '@/components/SettingsModal';
import { Sidebar } from '@/components/Sidebar';
import { FileList } from '@/components/FileList';
import { IconLogo, IconSettings, IconUpload, IconExcel, IconClose } from '@/components/Icons';

const MAX_CONCURRENT = 3;

export default function Home() {
  const { t } = useI18n();
  
  // Config & Connection
  const [config, setConfig] = useState<TeableConfig | null>(null);
  const [tables, setTables] = useState<TeableTable[]>([]);
  const [fields, setFields] = useState<TeableField[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // UI State
  const [mainTab, setMainTab] = useState<MainTab>('attachment');
  const { toasts, showToast, removeToast } = useToast();

  // Attachment Upload State
  const [mode, setMode] = useState<UploadMode>('create');
  const [targetTableId, setTargetTableId] = useState('');
  const [nameFieldId, setNameFieldId] = useState('');
  const [matchFieldId, setMatchFieldId] = useState('');
  const [matchType, setMatchType] = useState<'exact' | 'contains'>('exact');
  const [forceCreate, setForceCreate] = useState(false);
  const [skipCompletedFiles, setSkipCompletedFiles] = useState(true);
  const [attachmentFieldId, setAttachmentFieldId] = useState('');

  // Excel Upload State
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [excelSheet, setExcelSheet] = useState('');
  const [excelSheets, setExcelSheets] = useState<string[]>([]);
  const [excelTableName, setExcelTableName] = useState('');
  const [excelHeaderRow, setExcelHeaderRow] = useState('1');
  const [excelImportImages, setExcelImportImages] = useState(true);

  // Files
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, error: 0 });
  const [completedTableUrl, setCompletedTableUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Initialize
  useEffect(() => {
    const saved = loadConfig();
    if (saved) {
      setConfig(saved);
      loadTables(saved);
    } else {
      setIsSettingsOpen(true);
    }
  }, []);

  const loadTables = async (cfg: TeableConfig) => {
    try {
      const tables = await getTables(cfg);
      setTables(tables);
    } catch (err) {
      showToast(t.connectionExpired, 'error');
      clearConfig();
      setConfig(null);
      setIsSettingsOpen(true);
    }
  };

  const handleSaveConfig = (newConfig: TeableConfig) => {
    setConfig(newConfig);
    saveConfig(newConfig);
    setIsSettingsOpen(false);
    loadTables(newConfig);
    // Reset selections
    setTargetTableId('');
    setFields([]);
    setNameFieldId('');
    setMatchFieldId('');
  };

  const ATTACHMENT_FIELD_NAME = 'teaPrintResult';

  const handleTargetTableChange = async (tableId: string) => {
    setTargetTableId(tableId);
    setNameFieldId('');
    setMatchFieldId('');
    setAttachmentFieldId('');

    if (!tableId || !config) {
      setFields([]);
      return;
    }

    try {
      const fields = await getFields(config, tableId);
      setFields(fields);
      
      // Auto-select attachment field
      const attachFields = fields.filter(f => f.type === 'attachment');
      const defaultField = attachFields.find(f => f.name === ATTACHMENT_FIELD_NAME);
      
      if (defaultField) {
        // Use existing teaPrintResult field
        setAttachmentFieldId(defaultField.id);
      } else {
        // No teaPrintResult field - default to creating it
        // User can manually select other attachment field if they want
        setAttachmentFieldId('__create__');
      }
      
      const table = tables.find(t => t.id === tableId);
      showToast(`${t.loadingTable}: ${table?.name || tableId}`);
    } catch (err) {
      showToast(t.loadTableFailed, 'error');
      setFields([]);
    }
  };

  // Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    dropZoneRef.current?.classList.add('border-primary', 'bg-primary-light');
  };

  const handleDragLeave = () => {
    dropZoneRef.current?.classList.remove('border-primary', 'bg-primary-light');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dropZoneRef.current?.classList.remove('border-primary', 'bg-primary-light');
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    handleFiles(selectedFiles);
    e.target.value = '';
  };

  const handleFiles = (newFiles: File[]) => {
    if (mainTab === 'excel') {
      const excelFile = newFiles.find(f => f.name.match(/\.(xlsx|xls)$/i));
      if (excelFile) {
        handleExcelFile(excelFile);
      } else {
        showToast(t.pleaseSelectExcelFile, 'warning');
      }
    } else {
      addAttachmentFiles(newFiles);
    }
  };

  const addAttachmentFiles = (newFiles: File[]) => {
    const filtered = newFiles.filter(f => {
      if (files.some(sf => sf.file.name === f.name && sf.file.size === f.size)) {
        showToast(`"${f.name}" ${t.fileAlreadyExists}`, 'warning');
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...filtered.map(f => ({ file: f, status: 'pending' as const }))]);
  };

  const handleExcelFile = async (file: File) => {
    showToast(t.parsingExcel);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });

      // Parse embedded images
      const zip = await JSZip.loadAsync(data);
      const images = await parseEmbeddedImages(zip);

      const sheets = workbook.SheetNames;
      const firstSheet = sheets[0];
      const worksheet = workbook.Sheets[firstSheet];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

      const newExcelData: ExcelData = {
        fileName: file.name.replace(/\.[^/.]+$/, ''),
        sheets,
        currentSheet: firstSheet,
        workbook,
        currentData: jsonData,
        images,
        imageColIndex: -1,
      };

      // Find image column
      const headerRow = jsonData[0] || [];
      const imageColIndex = headerRow.findIndex(h =>
        String(h).includes('图') || String(h).toLowerCase().includes('image') || String(h).toLowerCase().includes('pic')
      );
      newExcelData.imageColIndex = imageColIndex;

      setExcelData(newExcelData);
      setExcelSheets(sheets);
      setExcelSheet(firstSheet);
      setExcelTableName(newExcelData.fileName);

      const totalRows = jsonData.length - 1;
      setFiles([{
        file,
        status: 'pending',
        excelInfo: { rows: totalRows, hasImages: Object.keys(images).length > 0 },
      }]);

      showToast(`${t.parseSuccess}: ${sheets.length} ${t.rows}`);
    } catch (err) {
      showToast(`${t.parseFailed}: ${(err as Error).message}`, 'error');
    }
  };

  const parseEmbeddedImages = async (zip: JSZip): Promise<ExcelData['images']> => {
    const images: ExcelData['images'] = {};
    console.log('[ParseImages] Starting to parse embedded images...');

    // Try cellimages.xml for DISPIMG (WPS/Excel format)
    try {
      const cellImagesXml = await zip.file('xl/cellimages.xml')?.async('text');
      const cellImagesRels = await zip.file('xl/_rels/cellimages.xml.rels')?.async('text');

      console.log('[ParseImages] cellimages.xml exists:', !!cellImagesXml);
      console.log('[ParseImages] cellimages.xml.rels exists:', !!cellImagesRels);

      if (cellImagesXml && cellImagesRels) {
        // Parse relationships
        const relMatches = cellImagesXml.matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"/g);
        const relMap: Record<string, string> = {};
        for (const m of relMatches) {
          relMap[m[1]] = m[2];
          console.log('[ParseImages] Rel mapping:', m[1], '->', m[2]);
        }

        // Parse cellImages - use more flexible regex
        // The name attribute is in <xdr:cNvPr id="..." name="ID_XXX" descr="..."/>
        const picMatches = cellImagesXml.matchAll(/<etc:cellImage[\s\S]*?<\/etc:cellImage>/g);
        let picIndex = 0;
        for (const m of picMatches) {
          const picXml = m[0];
          console.log('[ParseImages] Processing cellImage #', picIndex);
          
          // Find embed reference
          const embedMatch = picXml.match(/r:embed="([^"]+)"/);
          // Find name attribute (the ID used in DISPIMG function)
          const nameMatch = picXml.match(/name="([^"]+)"/);
          
          console.log('[ParseImages] embedMatch:', embedMatch?.[1]);
          console.log('[ParseImages] nameMatch:', nameMatch?.[1]);
          
          if (embedMatch && nameMatch) {
            const targetPath = relMap[embedMatch[1]];
            if (!targetPath) {
              console.warn('[ParseImages] No target path found for:', embedMatch[1]);
              continue;
            }
            
            const imagePath = targetPath.startsWith('xl/') ? targetPath : 'xl/' + targetPath;
            const imageId = nameMatch[1];
            
            console.log('[ParseImages] Looking for image at:', imagePath);
            const blob = await zip.file(imagePath)?.async('blob');
            
            if (blob) {
              images[imageId] = { path: imagePath, blob };
              console.log('[ParseImages] Successfully loaded image:', imageId, 'size:', blob.size);
            } else {
              console.warn('[ParseImages] Image not found at path:', imagePath);
              // List available media files
              const mediaFiles = Object.keys(zip.files).filter(f => f.includes('media/'));
              console.log('[ParseImages] Available media files:', mediaFiles);
            }
          }
          picIndex++;
        }
      }
    } catch (err) {
      console.error('[ParseImages] Error parsing cellimages.xml:', err);
    }

    console.log('[ParseImages] Images from cellimages.xml:', Object.keys(images));

    // Try drawing.xml (standard Excel format)
    const drawingFiles = Object.keys(zip.files).filter(f => f.match(/xl\/drawings\/drawing\d+\.xml/));
    console.log('[ParseImages] Drawing files found:', drawingFiles);
    
    for (const drawingFile of drawingFiles) {
      try {
        const drawingXml = await zip.file(drawingFile)?.async('text');
        const drawingRelsPath = drawingFile.replace(/xl\/drawings\//, 'xl/drawings/_rels/') + '.rels';
        const drawingRels = await zip.file(drawingRelsPath)?.async('text');

        if (drawingXml && drawingRels) {
          const relMatches = drawingRels.matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"/g);
          const relMap: Record<string, string> = {};
          for (const m of relMatches) {
            relMap[m[1]] = m[2].replace(/^\.\.\//, 'xl/');
          }

          const blipMatches = drawingXml.matchAll(/<a:blip[^>]*r:embed="([^"]+)"/g);
          let idx = 0;
          for (const m of blipMatches) {
            const imagePath = relMap[m[1]];
            if (imagePath) {
              const blob = await zip.file(imagePath)?.async('blob');
              if (blob) {
                images[`drawing_${idx}`] = { path: imagePath, blob };
                console.log('[ParseImages] Loaded from drawing:', `drawing_${idx}`);
                idx++;
              }
            }
          }
        }
      } catch (err) {
        console.error('[ParseImages] Error parsing drawing:', drawingFile, err);
      }
    }

    console.log('[ParseImages] Total images found:', Object.keys(images).length);
    return images;
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (files.length === 1) {
      setExcelData(null);
    }
  };

  const clearFiles = () => {
    setFiles([]);
    setExcelData(null);
    setProgress({ current: 0, total: 0, success: 0, error: 0 });
    setCompletedTableUrl(null);
  };

  // Upload Logic
  const startUpload = async () => {
    if (!config) {
      setIsSettingsOpen(true);
      return;
    }

    if (mainTab === 'excel') {
      await startExcelUpload();
    } else {
      await startAttachmentUpload();
    }
  };

  const startAttachmentUpload = async () => {
    if (!config) {
      setIsSettingsOpen(true);
      return;
    }

    if (!targetTableId) {
      showToast(t.pleaseSelectTargetTable, 'warning');
      return;
    }

    if (mode === 'create' && !nameFieldId) {
      showToast(t.pleaseSelectNameField, 'warning');
      return;
    }

    if (mode === 'update' && !matchFieldId) {
      showToast(t.pleaseSelectMatchField, 'warning');
      return;
    }

    if (!attachmentFieldId) {
      showToast(t.pleaseSelectAttachmentField, 'warning');
      return;
    }

    // Handle attachment field creation if needed
    let finalAttachmentFieldId = attachmentFieldId;
    if (attachmentFieldId === '__create__') {
      try {
        showToast(`${t.creating} ${ATTACHMENT_FIELD_NAME}...`);
        const newField = await createField(config, targetTableId, {
          name: ATTACHMENT_FIELD_NAME,
          type: 'attachment',
        });
        finalAttachmentFieldId = newField.id;
        setAttachmentFieldId(newField.id);
        // Refresh fields list
        const updatedFields = await getFields(config, targetTableId);
        setFields(updatedFields);
        showToast(`${ATTACHMENT_FIELD_NAME} ${t.fieldCreated}`);
      } catch (err) {
        showToast(`${t.createFieldFailed}: ${(err as Error).message}`, 'error');
        return;
      }
    }

    setIsUploading(true);
    setProgress({ current: 0, total: files.length, success: 0, error: 0 });

    try {
      let result: { success: number; error: number };
      if (mode === 'create') {
        result = await uploadCreate(nameFieldId, finalAttachmentFieldId);
      } else {
        result = await uploadUpdate(matchFieldId, finalAttachmentFieldId);
      }
      showToast(`${t.importComplete}: ${result.success} ${t.success}, ${result.error} ${t.failed}`);
      
      // Set link to target table
      if (config && targetTableId) {
        const tableUrl = `${config.baseUrl}/base/${config.baseId}/table/${targetTableId}`;
        setCompletedTableUrl(tableUrl);
      }
    } catch (err) {
      showToast(`${t.uploadError}: ${(err as Error).message}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const uploadCreate = async (nameFieldId: string, attachmentFieldId: string): Promise<{ success: number; error: number }> => {

    // Filter files to upload
    const filesToUpload = files.map((item, idx) => ({ item, idx })).filter(({ item }) => {
      if (skipCompletedFiles && item.status === 'success') {
        return false;
      }
      return true;
    });

    if (filesToUpload.length === 0) {
      showToast(t.allFilesUploaded, 'warning');
      return { success: 0, error: 0 };
    }

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = files.length - filesToUpload.length;

    const processOne = async (item: UploadFile, idx: number) => {
      updateFileStatus(idx, 'uploading');
      try {
        const sig = await getSignature(config!, item.file);
        const token = await uploadToStorage(item.file, sig);
        const info = await notifyUpload(config!, token, item.file.name);

        // Use the original filename without extension for the name field
        const nameWithoutExt = item.file.name.replace(/\.[^/.]+$/, '');
        
        const record = {
          fields: {
            [nameFieldId]: nameWithoutExt,
            [attachmentFieldId]: [{ name: item.file.name, token: info.token }],
          },
        };
        await createRecords(config!, targetTableId, [record]);

        updateFileStatus(idx, 'success');
        successCount++;
        setProgress(p => ({ ...p, current: p.current + 1, success: successCount + skippedCount, error: errorCount }));
      } catch {
        updateFileStatus(idx, 'error', t.failed);
        errorCount++;
        setProgress(p => ({ ...p, current: p.current + 1, success: successCount + skippedCount, error: errorCount }));
      }
    };

    await runWithConcurrency(
      filesToUpload.map(({ item, idx }) => () => processOne(item, idx)),
      MAX_CONCURRENT
    );

    return { success: successCount + skippedCount, error: errorCount };
  };

  const uploadUpdate = async (matchFieldId: string, attachmentFieldId: string): Promise<{ success: number; error: number }> => {

    // Filter files to upload
    const filesToUpload = files.map((item, idx) => ({ item, idx })).filter(({ item }) => {
      if (skipCompletedFiles && item.status === 'success') {
        return false;
      }
      return true;
    });

    if (filesToUpload.length === 0) {
      showToast(t.allFilesUploaded, 'warning');
      return { success: 0, error: 0 };
    }

    // Load records from target table
    const records = await getAllRecords(config!, targetTableId);
    const matchMap = new Map<string, typeof records[0]>();
    records.forEach(r => {
      const val = r.fields[matchFieldId];
      if (val) matchMap.set(String(val).toLowerCase().trim(), r);
    });

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = files.length - filesToUpload.length;

    const processOne = async (item: UploadFile, idx: number) => {
      updateFileStatus(idx, 'uploading');
      try {
        // Use original filename for matching (without extension, lowercase, trimmed)
        const fileNameForMatch = item.file.name.replace(/\.[^/.]+$/, '').toLowerCase().trim();
        let matched: typeof records[0] | null = null;

        if (matchType === 'exact') {
          matched = matchMap.get(fileNameForMatch) || null;
        } else {
          for (const [key, rec] of matchMap) {
            if (key.includes(fileNameForMatch) || fileNameForMatch.includes(key)) {
              matched = rec;
              break;
            }
          }
        }

        if (matched) {
          await uploadAttachment(config!, targetTableId, matched.id, attachmentFieldId, item.file);
          updateFileStatus(idx, 'success');
          successCount++;
          setProgress(p => ({ ...p, current: p.current + 1, success: successCount + skippedCount, error: errorCount }));
        } else if (forceCreate) {
          const sig = await getSignature(config!, item.file);
          const token = await uploadToStorage(item.file, sig);
          const info = await notifyUpload(config!, token, item.file.name);

          const record = {
            fields: {
              [matchFieldId]: fileNameForMatch,
              [attachmentFieldId]: [{ name: item.file.name, token: info.token }],
            },
          };
          await createRecords(config!, targetTableId, [record]);
          updateFileStatus(idx, 'success');
          successCount++;
          setProgress(p => ({ ...p, current: p.current + 1, success: successCount + skippedCount, error: errorCount }));
        } else {
          updateFileStatus(idx, 'error', t.notMatched);
          errorCount++;
          setProgress(p => ({ ...p, current: p.current + 1, success: successCount + skippedCount, error: errorCount }));
        }
      } catch {
        updateFileStatus(idx, 'error', t.failed);
        errorCount++;
        setProgress(p => ({ ...p, current: p.current + 1, success: successCount + skippedCount, error: errorCount }));
      }
    };

    await runWithConcurrency(
      filesToUpload.map(({ item, idx }) => () => processOne(item, idx)),
      MAX_CONCURRENT
    );

    return { success: successCount + skippedCount, error: errorCount };
  };

  const startExcelUpload = async () => {
    console.log('[ExcelUpload] Starting Excel upload...');
    
    if (!excelData) {
      console.error('[ExcelUpload] No excel data');
      showToast(t.pleaseSelectExcelFile, 'error');
      return;
    }
    if (!config) {
      console.error('[ExcelUpload] No config');
      showToast(t.pleaseConfigureFirst, 'error');
      return;
    }

    const tableName = excelTableName.trim() || excelData.fileName;
    const headerRowIdx = parseInt(excelHeaderRow) - 1;
    
    // Count valid (non-empty) data rows
    let validRowCount = 0;
    for (let i = headerRowIdx + 1; i < excelData.currentData.length; i++) {
      const row = excelData.currentData[i];
      const hasData = row.some(cell => cell !== undefined && cell !== null && String(cell).trim() !== '');
      if (hasData) validRowCount++;
    }
    
    console.log('[ExcelUpload] Table name:', tableName);
    console.log('[ExcelUpload] Header row index:', headerRowIdx);
    console.log('[ExcelUpload] Total data rows:', excelData.currentData.length - 1);
    console.log('[ExcelUpload] Valid data rows:', validRowCount);
    console.log('[ExcelUpload] Import images:', excelImportImages);
    console.log('[ExcelUpload] Images found:', Object.keys(excelData.images).length);

    setIsUploading(true);
    setProgress({ current: 0, total: validRowCount, success: 0, error: 0 });
    updateFileStatus(0, 'uploading');

    try {
      // Step 1: Get existing tables
      console.log('[ExcelUpload] Step 1: Getting existing tables...');
      const tables = await getTables(config);
      console.log('[ExcelUpload] Existing tables:', tables.map(t => t.name));
      
      const existingNames = tables.map(t => t.name);

      // Generate unique name
      let finalName = tableName;
      let suffix = 1;
      while (existingNames.includes(finalName)) {
        finalName = `${tableName}_${suffix}`;
        suffix++;
      }
      console.log('[ExcelUpload] Final table name:', finalName);

      // Step 2: Prepare fields
      console.log('[ExcelUpload] Step 2: Preparing fields...');
      const headers = excelData.currentData[headerRowIdx] || [];
      console.log('[ExcelUpload] Headers:', headers);
      
      const fieldsToCreate = headers.map((h, i) => ({
        name: String(h || `${t.rows}${i + 1}`),
        type: (i === excelData.imageColIndex && excelImportImages) ? 'attachment' : 'singleLineText',
      }));

      if (excelImportImages && excelData.imageColIndex === -1) {
        fieldsToCreate.push({ name: t.images, type: 'attachment' });
        console.log('[ExcelUpload] Added default image column');
      }
      
      console.log('[ExcelUpload] Fields to create:', fieldsToCreate);

      // Step 3: Create table
      showToast(`${t.creating}: ${finalName}...`);
      console.log('[ExcelUpload] Step 3: Creating table...');
      
      let newTable;
      try {
        newTable = await createTable(config, {
          name: finalName,
          fields: fieldsToCreate,
        });
        console.log('[ExcelUpload] Table created:', newTable);
      } catch (err) {
        console.error('[ExcelUpload] Failed to create table:', err);
        throw new Error(`${t.createFieldFailed}: ${(err as Error).message}`);
      }

      // Step 4: Wait a bit for fields to be ready
      console.log('[ExcelUpload] Step 4: Waiting for fields to be ready...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 5: Get fields of new table
      console.log('[ExcelUpload] Step 5: Getting fields of new table:', newTable.id);
      let tableFields;
      try {
        tableFields = await getFields(config, newTable.id);
        console.log('[ExcelUpload] Got fields:', tableFields.map(f => ({ id: f.id, name: f.name, type: f.type })));
      } catch (err) {
        console.error('[ExcelUpload] Failed to get fields:', err);
        throw new Error(`${t.loadTableFailed}: ${(err as Error).message}`);
      }

      // Step 5.5: Check and delete auto-created empty records
      console.log('[ExcelUpload] Step 5.5: Checking for auto-created empty records...');
      try {
        const existingRecords = await getAllRecords(config, newTable.id);
        console.log('[ExcelUpload] Found existing records:', existingRecords.length);
        
        // Find empty records (all fields are empty)
        const emptyRecordIds = existingRecords.filter(r => {
          const fields = r.fields || {};
          const hasData = Object.values(fields).some(v => 
            v !== undefined && v !== null && v !== '' && 
            !(Array.isArray(v) && v.length === 0)
          );
          return !hasData;
        }).map(r => r.id);
        
        if (emptyRecordIds.length > 0) {
          console.log('[ExcelUpload] Deleting empty records:', emptyRecordIds);
          await deleteRecords(config, newTable.id, emptyRecordIds);
          console.log('[ExcelUpload] Empty records deleted');
        }
      } catch (err) {
        console.warn('[ExcelUpload] Failed to clean up empty records:', err);
        // Continue even if cleanup fails
      }

      // Step 6: Prepare records
      console.log('[ExcelUpload] Step 6: Preparing records...');
      console.log('[ExcelUpload] Image column index:', excelData.imageColIndex);
      console.log('[ExcelUpload] Available images:', Object.keys(excelData.images));
      console.log('[ExcelUpload] Import images enabled:', excelImportImages);
      
      const records: Array<{ fields: Record<string, unknown>; _image?: { fieldId: string; blob: Blob; name: string } }> = [];
      const imageFieldId = tableFields.find(f => f.type === 'attachment')?.id;
      console.log('[ExcelUpload] Image field ID:', imageFieldId);

      // Get worksheet for checking DISPIMG
      // XLSX workbook structure: workbook.Sheets[sheetName] contains the worksheet
      const workbookSheets = excelData.workbook as { Sheets?: Record<string, Record<string, { f?: string }>> };
      const worksheet = workbookSheets.Sheets?.[excelData.currentSheet];
      console.log('[ExcelUpload] Worksheet loaded:', !!worksheet);
      console.log('[ExcelUpload] Available sheets:', Object.keys(workbookSheets.Sheets || {}));

      for (let i = headerRowIdx + 1; i < excelData.currentData.length; i++) {
        const row = excelData.currentData[i];
        
        // Skip empty rows (all cells are empty/undefined)
        const hasData = row.some(cell => cell !== undefined && cell !== null && String(cell).trim() !== '');
        if (!hasData) {
          console.log(`[ExcelUpload] Row ${i}: Skipping empty row`);
          continue;
        }
        
        const record: { fields: Record<string, unknown>; _image?: { fieldId: string; blob: Blob; name: string } } = { fields: {} };

        headers.forEach((h, colIdx) => {
          const field = tableFields.find(f => f.name === String(h || `${t.rows}${colIdx + 1}`));
          if (field && row[colIdx] !== undefined) {
            if (field.type === 'attachment') {
              record.fields[field.id] = [];
            } else {
              record.fields[field.id] = String(row[colIdx]);
            }
          }
        });

        // Find image for this row using DISPIMG formula
        if (excelImportImages && excelData.imageColIndex >= 0) {
          const cellRef = XLSX.utils.encode_cell({ r: i, c: excelData.imageColIndex });
          const cellObj = worksheet?.[cellRef];

          console.log(`[ExcelUpload] Row ${i}: cellRef=${cellRef}, hasFormula=${!!cellObj?.f}`);
          
          if (cellObj?.f) {
            console.log(`[ExcelUpload] Row ${i}: Formula=`, cellObj.f);
            const match = cellObj.f.match(/DISPIMG\("([^"]+)"/);
            if (match) {
              const imgId = match[1];
              console.log(`[ExcelUpload] Row ${i}: Found image ID=`, imgId);
              const imgData = excelData.images[imgId];
              if (imgData) {
                console.log(`[ExcelUpload] Row ${i}: Image data found, size=`, imgData.blob.size);
                if (imageFieldId) {
                  record._image = { fieldId: imageFieldId, blob: imgData.blob, name: `${imgId}.jpg` };
                  console.log(`[ExcelUpload] Row ${i}: Image attached to record`);
                } else {
                  console.warn(`[ExcelUpload] Row ${i}: No image field ID found!`);
                }
              } else {
                console.warn(`[ExcelUpload] Row ${i}: Image data NOT found for ID=`, imgId);
              }
            } else {
              console.log(`[ExcelUpload] Row ${i}: No DISPIMG match in formula`);
            }
          }
        }

        records.push(record);
      }
      
      // Count records with images
      const recordsWithImages = records.filter(r => r._image).length;
      console.log('[ExcelUpload] Prepared records:', records.length, ', with images:', recordsWithImages);

      // Step 7: Create records with concurrency control
      showToast(`${t.uploading} ${records.length} ${t.rows}...`);
      console.log('[ExcelUpload] Step 7: Creating records...');
      
      let successCount = 0;
      let errorCount = 0;
      const totalRecords = records.length;

      const processRecord = async (record: typeof records[0], idx: number) => {
        try {
          const image = record._image;
          delete record._image;

          // Create record
          const result = await createRecords(config!, newTable.id, [record]);
          console.log(`[ExcelUpload] Record ${idx} created:`, result.records?.[0]?.id);

          // Upload image if exists
          if (image && result.records?.[0]?.id) {
            console.log(`[ExcelUpload] Uploading image for record ${idx}...`);
            console.log(`[ExcelUpload] Image details:`, { 
              fieldId: image.fieldId, 
              name: image.name, 
              blobSize: image.blob.size,
              blobType: image.blob.type 
            });
            try {
              const file = new File([image.blob], image.name, { type: 'image/jpeg' });
              await uploadAttachment(config!, newTable.id, result.records[0].id, image.fieldId, file);
              console.log(`[ExcelUpload] Image uploaded successfully for record ${idx}`);
            } catch (uploadErr) {
              console.error(`[ExcelUpload] Failed to upload image for record ${idx}:`, uploadErr);
            }
          } else {
            if (image && !result.records?.[0]?.id) {
              console.warn(`[ExcelUpload] Image exists but record ID is missing for ${idx}`);
            }
          }

          successCount++;
          setProgress(p => ({ 
            ...p, 
            current: p.current + 1, 
            success: successCount, 
            error: errorCount 
          }));
        } catch (err) {
          console.error(`[ExcelUpload] Failed to create record ${idx}:`, err);
          errorCount++;
          setProgress(p => ({ 
            ...p, 
            current: p.current + 1, 
            success: successCount, 
            error: errorCount 
          }));
        }
      };

      // Process with concurrency
      const queue = [...records.entries()];
      const workers = [];
      for (let i = 0; i < Math.min(MAX_CONCURRENT, queue.length); i++) {
        workers.push((async () => {
          while (queue.length > 0) {
            const [idx, record] = queue.shift()!;
            await processRecord(record, idx);
          }
        })());
      }
      await Promise.all(workers);

      console.log('[ExcelUpload] Import complete:', successCount, 'success,', errorCount, 'error');

      if (errorCount === 0) {
        updateFileStatus(0, 'success');
        showToast(`${t.importComplete}: ${successCount} ${t.rows}`);
      } else {
        updateFileStatus(0, 'error', `${errorCount}${t.failed}`);
        showToast(`${t.importComplete}: ${successCount} ${t.success}, ${errorCount} ${t.failed}`, 'warning');
      }
      
      // Set link to newly created table
      if (config && newTable) {
        const tableUrl = `${config.baseUrl}/base/${config.baseId}/table/${newTable.id}`;
        setCompletedTableUrl(tableUrl);
      }
    } catch (err) {
      console.error('[ExcelUpload] Import failed:', err);
      updateFileStatus(0, 'error', t.failed);
      showToast(`${t.uploadError}: ${(err as Error).message}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const updateFileStatus = (idx: number, status: UploadFile['status'], errorMsg?: string) => {
    setFiles(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], status, errorMsg };
      return next;
    });
  };

  const runWithConcurrency = async (tasks: Array<() => Promise<void>>, maxConcurrent: number) => {
    const executing = new Map<number, Promise<void>>();
    let index = 0;

    const runTask = async (taskIndex: number, task: () => Promise<void>) => {
      try {
        await task();
      } finally {
        executing.delete(taskIndex);
      }
    };

    for (const task of tasks) {
      const taskPromise = runTask(index, task);
      executing.set(index, taskPromise);
      index++;

      if (executing.size >= maxConcurrent) {
        await Promise.race(executing.values());
      }
    }

    await Promise.all(executing.values());
  };

  const canUpload = files.length > 0 && !isUploading && config !== null &&
    (mainTab === 'excel' || targetTableId !== '');

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="h-[44px] bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-white">
            <IconLogo size={14} />
          </div>
          <span className="font-semibold text-[13px] tracking-tight text-gray-800">{t.appName}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
            config
              ? 'bg-success-light text-success border-success/20'
              : 'bg-gray-100 text-gray-500 border-transparent'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config ? 'bg-success' : 'bg-gray-400'}`} />
            {config ? t.connected : t.notConfigured}
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title={t.settings}
          >
            <IconSettings size={16} />
          </button>
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          mainTab={mainTab}
          setMainTab={setMainTab}
          mode={mode}
          setMode={setMode}
          tables={tables}
          targetTableId={targetTableId}
          onTargetTableChange={handleTargetTableChange}
          fields={fields}
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

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Upload Zone */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div
              ref={dropZoneRef}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded px-4 py-5 text-center cursor-pointer transition-all hover:border-primary hover:bg-primary-light/50 bg-gray-50/50"
            >
              <div className="text-gray-300 mb-2 flex justify-center transition-colors">
                {mainTab === 'excel' ? (
                  <IconExcel size={28} className="hover:text-primary" />
                ) : (
                  <IconUpload size={28} className="hover:text-primary" />
                )}
              </div>
              <div className="text-[12px] font-medium text-gray-700 mb-0.5">
                {mainTab === 'excel' ? t.dropExcelHere : t.dropFilesHere}
              </div>
              <div className="text-[11px] text-gray-400">
                {mainTab === 'excel' ? t.supportExcelWithImages : t.supportBatchUpload}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple={mainTab !== 'excel'}
              accept={mainTab === 'excel' ? '.xlsx,.xls' : undefined}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* File List Header */}
          <div className="grid grid-cols-[1fr_70px_80px_32px] gap-2 px-4 py-2 border-b border-gray-200 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            <span>{mainTab === 'excel' ? t.data : t.filename}</span>
            <span>{mainTab === 'excel' ? t.images : t.size}</span>
            <span>{t.status}</span>
            <span></span>
          </div>

          {/* File List */}
          <FileList
            files={files}
            mainTab={mainTab}
            excelData={excelData}
            onRemove={removeFile}
          />

          {/* Completed Table Link */}
          {completedTableUrl && (
            <div className="px-4 py-2 bg-success-light border-t border-success/20 flex items-center justify-between">
              <span className="text-[11px] text-success">{t.uploadComplete}</span>
              <a
                href={completedTableUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-medium text-primary hover:text-primary-hover flex items-center gap-1"
              >
                {t.viewTable}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          )}

          {/* Bottom Bar */}
          <div className="h-[48px] bg-white border-t border-gray-200 flex items-center justify-between px-4 gap-4">
            <div className="flex-1 flex items-center gap-2 max-w-[240px]">
              <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[11px] text-gray-400 min-w-[28px]">
                {progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0}%
              </span>
            </div>

            <div className="flex gap-4 text-[11px]">
              <div className="flex items-center gap-1">
                <span className="text-gray-400">{t.total}:</span>
                <span className="font-medium text-gray-600">{files.length}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-400">{t.success}:</span>
                <span className="font-medium text-success">{progress.success}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-400">{t.failed}:</span>
                <span className="font-medium text-error">{progress.error}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={clearFiles}
                disabled={isUploading || files.length === 0}
                className="px-3 py-1.5 rounded text-[11px] font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {t.clear}
              </button>
              <button
                onClick={startUpload}
                disabled={!canUpload}
                className="px-3 py-1.5 rounded text-[11px] font-medium bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUploading ? t.uploadingEllipsis : t.startUpload}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        isForced={!config}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveConfig}
        showToast={showToast}
      />
    </div>
  );
}
