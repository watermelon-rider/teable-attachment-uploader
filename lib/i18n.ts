export type Language = 'en' | 'zh';

export interface Translations {
  // Header
  appName: string;
  connected: string;
  notConfigured: string;
  settings: string;

  // Tabs
  attachment: string;
  excel: string;
  excelWithImages: string;

  // Settings Modal
  connectToTeable: string;
  teableUrl: string;
  teableUrlPlaceholder: string;
  teableUrlHint: string;
  apiToken: string;
  apiTokenPlaceholder: string;
  apiTokenHint: string;
  cancel: string;
  connectAndSave: string;
  verifying: string;
  language: string;
  languageEn: string;
  languageZh: string;

  // Upload Zone
  dropFilesHere: string;
  dropExcelHere: string;
  supportBatchUpload: string;
  supportExcelWithImages: string;

  // File List
  filename: string;
  size: string;
  status: string;
  data: string;
  images: string;
  noFiles: string;
  noFilesPleaseSelect: string;
  noFilesPleaseSelectExcel: string;
  rows: string;

  // Status
  pending: string;
  uploading: string;
  success: string;
  failed: string;
  notMatched: string;
  matched: string;
  uploadComplete: string;
  viewTable: string;

  // Bottom Bar
  total: string;
  clear: string;
  startUpload: string;
  uploadingEllipsis: string;

  // Sidebar - Target Table
  targetTable: string;
  pleaseSelectTargetTable: string;
  pleaseConfigureConnection: string;

  // Sidebar - Upload Mode
  uploadMode: string;
  createRecords: string;
  createRecordsDesc: string;
  updateRecords: string;
  updateRecordsDesc: string;

  // Sidebar - Create Options
  createOptions: string;
  attachmentField: string;
  selectAttachmentField: string;
  noAttachmentFieldAvailable: string;
  createTeaPrintResult: string;
  default: string;
  recommendTeaPrintResult: string;
  willAutoCreateField: string;
  nameField: string;
  selectField: string;
  noFieldAvailable: string;
  pleaseSelectTargetTableFirst: string;

  // Sidebar - Update Options
  updateOptions: string;
  matchField: string;
  matchType: string;
  exactMatch: string;
  containsMatch: string;
  createIfNotMatched: string;

  // Sidebar - Upload Settings
  skipUploadedFiles: string;

  // Sidebar - Excel Options
  excelOptions: string;
  selectWorksheet: string;
  pleaseUploadExcelFirst: string;
  tableName: string;
  tableNamePlaceholder: string;
  headerRow: string;
  headerRowOption: string;
  importEmbeddedImages: string;

  // Toast Messages
  pleaseConfigureFirst: string;
  pleaseSelectNameField: string;
  pleaseSelectMatchField: string;
  pleaseSelectAttachmentField: string;
  fileAlreadyExists: string;
  pleaseSelectExcelFile: string;
  parsingExcel: string;
  parseSuccess: string;
  parseFailed: string;
  loadingTable: string;
  connectionExpired: string;
  loadTableFailed: string;
  allFilesUploaded: string;
  created: string;
  creating: string;
  fieldCreated: string;
  createFieldFailed: string;
  importComplete: string;
  uploadError: string;
  connectionFailed: string;
  connectedSuccess: string;
  pleaseFillAllFields: string;
  urlFormatError: string;
  mixedContentWarning: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Header
    appName: 'TeaUploader',
    connected: 'Connected',
    notConfigured: 'Not Configured',
    settings: 'Settings',

    // Tabs
    attachment: 'Attachment',
    excel: 'Excel',
    excelWithImages: 'Excel with Images',

    // Settings Modal
    connectToTeable: 'Connect to Teable',
    teableUrl: 'Teable URL',
    teableUrlPlaceholder: 'https://app.teable.cn/base/bseXXX/table/tblXXX/viwXXX (or http://...)',
    teableUrlHint: 'Supports http/https, full URL or short URL (e.g.: https://app.teable.ai/base/bseXXX)',
    apiToken: 'API Token',
    apiTokenPlaceholder: 'teable_xxxxxxxxxxxxxxxx',
    apiTokenHint: 'Personal Access Token generated in Teable settings',
    cancel: 'Cancel',
    connectAndSave: 'Connect & Save',
    verifying: 'Verifying...',
    language: 'Language',
    languageEn: 'English',
    languageZh: '中文',

    // Upload Zone
    dropFilesHere: 'Click or drag files here',
    dropExcelHere: 'Click or drag Excel file here',
    supportBatchUpload: 'Supports batch upload, multiple files allowed',
    supportExcelWithImages: 'Supports .xlsx format with embedded images',

    // File List
    filename: 'Filename',
    size: 'Size',
    status: 'Status',
    data: 'Data',
    images: 'Images',
    noFiles: 'No files',
    noFilesPleaseSelect: 'No files, please select attachments to upload',
    noFilesPleaseSelectExcel: 'No files, please select Excel file to import',
    rows: 'rows',

    // Status
    pending: 'Pending',
    uploading: 'Uploading',
    success: 'Success',
    failed: 'Failed',
    notMatched: 'Not Matched',
    matched: 'Matched',
    uploadComplete: 'Upload Complete',
    viewTable: 'View Table',

    // Bottom Bar
    total: 'Total',
    clear: 'Clear',
    startUpload: 'Start Upload',
    uploadingEllipsis: 'Uploading...',

    // Sidebar - Target Table
    targetTable: 'Target Table',
    pleaseSelectTargetTable: 'Please select target table',
    pleaseConfigureConnection: 'Please configure connection first',

    // Sidebar - Upload Mode
    uploadMode: 'Upload Mode',
    createRecords: 'Create Records',
    createRecordsDesc: 'Create a new record for each attachment',
    updateRecords: 'Update Records',
    updateRecordsDesc: 'Match by name and append to existing records',

    // Sidebar - Create Options
    createOptions: 'Create Options',
    attachmentField: 'Attachment Field',
    selectAttachmentField: 'Select attachment field',
    noAttachmentFieldAvailable: 'No attachment field available',
    createTeaPrintResult: 'Create teaPrintResult',
    default: 'default',
    recommendTeaPrintResult: 'Tip: Recommended to use "teaPrintResult" field',
    willAutoCreateField: 'Will auto-create "teaPrintResult" attachment field',
    nameField: 'Name Field',
    selectField: 'Select field',
    noFieldAvailable: 'No field available',
    pleaseSelectTargetTableFirst: 'Please select target table first',

    // Sidebar - Update Options
    updateOptions: 'Update Options',
    matchField: 'Match Field',
    matchType: 'Match Type',
    exactMatch: 'Exact Match',
    containsMatch: 'Contains Match',
    createIfNotMatched: 'Create new record if not matched',

    // Sidebar - Upload Settings
    skipUploadedFiles: 'Skip uploaded files',

    // Sidebar - Excel Options
    excelOptions: 'Excel Options',
    selectWorksheet: 'Select worksheet',
    pleaseUploadExcelFirst: 'Please upload Excel file first',
    tableName: 'Table Name',
    tableNamePlaceholder: 'Table name (default: filename)',
    headerRow: 'Header Row',
    headerRowOption: 'Header Row: Row',
    importEmbeddedImages: 'Import embedded images as attachments',

    // Toast Messages
    pleaseConfigureFirst: 'Please configure connection first',
    pleaseSelectNameField: 'Please select name field',
    pleaseSelectMatchField: 'Please select match field',
    pleaseSelectAttachmentField: 'Please select attachment field',
    fileAlreadyExists: 'already exists',
    pleaseSelectExcelFile: 'Please select Excel file',
    parsingExcel: 'Parsing Excel...',
    parseSuccess: 'Parse successful',
    parseFailed: 'Parse failed',
    loadingTable: 'Table loaded',
    connectionExpired: 'Connection expired, please reconfigure',
    loadTableFailed: 'Failed to load table fields',
    allFilesUploaded: 'All files have been uploaded',
    created: 'created',
    creating: 'Creating',
    fieldCreated: 'Field created successfully',
    createFieldFailed: 'Failed to create field',
    importComplete: 'Import complete',
    uploadError: 'Upload error',
    connectionFailed: 'Connection failed',
    connectedSuccess: 'Connected successfully',
    pleaseFillAllFields: 'Please fill in all fields',
    urlFormatError: 'URL format error, please copy the full link from browser address bar',
    mixedContentWarning: '⚠️ Warning: You are accessing the application via HTTPS, but the Teable URL uses HTTP. Browser security policy will block this connection.',
  },
  zh: {
    // Header
    appName: 'TeaUploader',
    connected: '已连接',
    notConfigured: '未配置',
    settings: '设置',

    // Tabs
    attachment: '附件',
    excel: '嵌图表格',
    excelWithImages: '嵌图表格',

    // Settings Modal
    connectToTeable: '连接到 Teable',
    teableUrl: 'Teable URL',
    teableUrlPlaceholder: 'https://app.teable.cn/base/bseXXX/table/tblXXX/viwXXX（或 http://...）',
    teableUrlHint: '支持 http/https，完整链接或短链接（如：https://app.teable.ai/base/bseXXX）',
    apiToken: 'API Token',
    apiTokenPlaceholder: 'teable_xxxxxxxxxxxxxxxx',
    apiTokenHint: '在 Teable 设置中生成的 Personal Access Token',
    cancel: '取消',
    connectAndSave: '连接并保存',
    verifying: '验证中...',
    language: '语言',
    languageEn: 'English',
    languageZh: '中文',

    // Upload Zone
    dropFilesHere: '点击或拖拽文件到此处',
    dropExcelHere: '点击或拖拽嵌图表格到此处',
    supportBatchUpload: '支持批量上传，可多选文件',
    supportExcelWithImages: '支持 .xlsx 格式，含内嵌图片',

    // File List
    filename: '文件名',
    size: '大小',
    status: '状态',
    data: '数据',
    images: '图片',
    noFiles: '暂无文件',
    noFilesPleaseSelect: '暂无文件，请选择要上传的附件',
    noFilesPleaseSelectExcel: '暂无文件，请选择要导入的嵌图表格',
    rows: '行',

    // Status
    pending: '待上传',
    uploading: '上传中',
    success: '完成',
    failed: '失败',
    notMatched: '未匹配',
    matched: '已匹配',
    uploadComplete: '上传完成',
    viewTable: '查看表格',

    // Bottom Bar
    total: '总计',
    clear: '清空',
    startUpload: '开始上传',
    uploadingEllipsis: '上传中...',

    // Sidebar - Target Table
    targetTable: '目标表',
    pleaseSelectTargetTable: '请选择目标表',
    pleaseConfigureConnection: '请先配置连接',

    // Sidebar - Upload Mode
    uploadMode: '上传模式',
    createRecords: '上传创建记录',
    createRecordsDesc: '每个附件创建一行新记录',
    updateRecords: '上传更新记录',
    updateRecordsDesc: '按名称匹配追加到现有记录',

    // Sidebar - Create Options
    createOptions: '创建选项',
    attachmentField: '附件字段',
    selectAttachmentField: '选择附件字段',
    noAttachmentFieldAvailable: '无可用附件字段',
    createTeaPrintResult: '创建 teaPrintResult',
    default: '默认',
    recommendTeaPrintResult: '提示：推荐使用 "teaPrintResult" 字段',
    willAutoCreateField: '将自动创建 "teaPrintResult" 附件字段',
    nameField: '名称写入字段',
    selectField: '选择字段',
    noFieldAvailable: '无可用字段',
    pleaseSelectTargetTableFirst: '请先选择目标表',

    // Sidebar - Update Options
    updateOptions: '更新选项',
    matchField: '匹配字段',
    matchType: '匹配方式',
    exactMatch: '精确匹配',
    containsMatch: '包含匹配',
    createIfNotMatched: '未匹配时创建新记录',

    // Sidebar - Upload Settings
    skipUploadedFiles: '跳过已上传的文件',

    // Sidebar - Excel Options
    excelOptions: '嵌图表格选项',
    selectWorksheet: '选择工作表',
    pleaseUploadExcelFirst: '请先上传嵌图表格文件',
    tableName: '表名',
    tableNamePlaceholder: '表名（默认使用文件名）',
    headerRow: '标题行',
    headerRowOption: '标题行：第',
    importEmbeddedImages: '导入内嵌图片为附件',

    // Toast Messages
    pleaseConfigureFirst: '请先配置连接',
    pleaseSelectNameField: '请选择名称写入字段',
    pleaseSelectMatchField: '请选择匹配字段',
    pleaseSelectAttachmentField: '请选择附件字段',
    fileAlreadyExists: '已存在',
    pleaseSelectExcelFile: '请选择嵌图表格文件',
    parsingExcel: '正在解析表格...',
    parseSuccess: '解析成功',
    parseFailed: '解析失败',
    loadingTable: '已加载表',
    connectionExpired: '连接失效，请重新配置',
    loadTableFailed: '加载表字段失败',
    allFilesUploaded: '所有文件已上传完成',
    created: '创建',
    creating: '正在创建',
    fieldCreated: '字段创建成功',
    createFieldFailed: '创建字段失败',
    importComplete: '导入完成',
    uploadError: '上传出错',
    connectionFailed: '连接失败',
    connectedSuccess: '连接成功',
    pleaseFillAllFields: '请填写完整信息',
    urlFormatError: 'URL 格式错误，请复制浏览器地址栏完整链接',
    mixedContentWarning: '⚠️ 警告：您正在通过 HTTPS 访问本应用，但 Teable 地址使用 HTTP。浏览器安全策略会阻止此连接。'
  },
};

function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  const browserLang = navigator.language || (navigator as unknown as { browserLanguage?: string }).browserLanguage || 'en';
  // Check if browser language starts with 'zh' (Chinese)
  return browserLang.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

export function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem('teaUploaderLanguage') as Language;
  // If no stored language, auto-detect from browser
  if (!stored) {
    return detectBrowserLanguage();
  }
  return stored === 'zh' ? 'zh' : 'en';
}

export function setStoredLanguage(lang: Language): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('teaUploaderLanguage', lang);
}
