import { TeableConfig, TeableField, TeableTable, TeableRecord } from '@/types';

const ATTACHMENT_FIELD_NAME = 'tea_upload_attachment';

export function parseTeableUrl(url: string): { baseUrl: string; baseId: string; tableId?: string } | null {
  try {
    const urlObj = new URL(url);
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
    // 支持完整格式: /base/{baseId}/table/{tableId}
    const fullMatch = urlObj.pathname.match(/\/base\/(bse[a-zA-Z0-9]+)\/table\/(tbl[a-zA-Z0-9]+)/i);
    if (fullMatch) {
      return { baseUrl, baseId: fullMatch[1], tableId: fullMatch[2] };
    }
    // 支持短格式: /base/{baseId}
    const shortMatch = urlObj.pathname.match(/\/base\/(bse[a-zA-Z0-9]+)\/?$/i);
    if (shortMatch) {
      return { baseUrl, baseId: shortMatch[1] };
    }
    return null;
  } catch {
    return null;
  }
}

export function getBaseUrl(config: TeableConfig): string {
  return config.baseUrl;
}

export async function apiRequest<T>(
  config: TeableConfig,
  endpoint: string,
  opts: RequestInit = {}
): Promise<T> {
  const base = getBaseUrl(config);
  const url = `${base}/api${endpoint}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      'Authorization': `Bearer ${config.token}`,
      'Content-Type': 'application/json',
      ...opts.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function getTables(config: TeableConfig): Promise<TeableTable[]> {
  console.log('[API] Getting tables for base:', config.baseId);
  const result = await apiRequest<TeableTable[]>(config, `/base/${config.baseId}/table`);
  console.log('[API] Got tables:', result.length);
  return result;
}

export interface CreateTableRequest {
  name: string;
  fields?: Array<{
    name: string;
    type: string;
    options?: Record<string, unknown>;
  }>;
}

export async function createTable(
  config: TeableConfig,
  data: CreateTableRequest
): Promise<TeableTable> {
  console.log('[API] Creating table:', data.name, 'with fields:', data.fields?.length || 0);
  try {
    const result = await apiRequest<TeableTable>(config, `/base/${config.baseId}/table`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    console.log('[API] Table created:', result.id);
    return result;
  } catch (err) {
    console.error('[API] Failed to create table:', err);
    throw err;
  }
}

export interface CreateFieldRequest {
  name: string;
  type: string;
  options?: Record<string, unknown>;
}

export async function createField(
  config: TeableConfig,
  tableId: string,
  data: CreateFieldRequest
): Promise<TeableField> {
  console.log('[API] Creating field:', data.name, 'type:', data.type);
  try {
    const result = await apiRequest<TeableField>(config, `/table/${tableId}/field`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    console.log('[API] Field created:', result.id);
    return result;
  } catch (err) {
    console.error('[API] Failed to create field:', err);
    throw err;
  }
}

export async function getFields(config: TeableConfig, tableId: string): Promise<TeableField[]> {
  return apiRequest(config, `/table/${tableId}/field`);
}

export async function getAllRecords(config: TeableConfig, tableId: string): Promise<TeableRecord[]> {
  const all: TeableRecord[] = [];
  let skip = 0;
  while (true) {
    const res = await apiRequest<{ records: TeableRecord[] }>(
      config,
      `/table/${tableId}/record?fieldKeyType=id&take=1000&skip=${skip}`
    );
    all.push(...res.records);
    if (res.records.length < 1000) break;
    skip += 1000;
  }
  return all;
}

export async function createRecords(
  config: TeableConfig,
  tableId: string,
  records: Array<{ fields: Record<string, unknown> }>
): Promise<{ records: TeableRecord[] }> {
  return apiRequest(config, `/table/${tableId}/record`, {
    method: 'POST',
    body: JSON.stringify({ fieldKeyType: 'id', typecast: true, records }),
  });
}

export async function updateRecord(
  config: TeableConfig,
  tableId: string,
  recordId: string,
  fields: Record<string, unknown>
): Promise<void> {
  await apiRequest(config, `/table/${tableId}/record/${recordId}`, {
    method: 'PATCH',
    body: JSON.stringify({ fieldKeyType: 'id', typecast: true, record: { fields } }),
  });
}

export async function deleteRecords(
  config: TeableConfig,
  tableId: string,
  recordIds: string[]
): Promise<void> {
  console.log('[API] Deleting records:', recordIds.length);
  // DELETE with query params instead of body
  const queryParams = recordIds.map(id => `recordIds=${encodeURIComponent(id)}`).join('&');
  await apiRequest(config, `/table/${tableId}/record?${queryParams}`, {
    method: 'DELETE',
  });
}

export interface SignatureResponse {
  url: string;
  token: string;
  uploadMethod: string;
  requestHeaders: Record<string, string>;
}

export async function getSignature(
  config: TeableConfig,
  file: File
): Promise<SignatureResponse> {
  return apiRequest(config, '/attachments/signature', {
    method: 'POST',
    body: JSON.stringify({
      contentType: file.type || 'application/octet-stream',
      contentLength: file.size,
      type: 1,
      baseId: config.baseId,
    }),
  });
}

export async function uploadToStorage(file: File, sig: SignatureResponse): Promise<string> {
  const headers = { ...sig.requestHeaders };
  delete headers['Content-Length'];
  const res = await fetch(sig.url, {
    method: sig.uploadMethod,
    headers,
    body: file,
  });
  if (!res.ok) throw new Error('存储上传失败');
  return sig.token;
}

export async function notifyUpload(
  config: TeableConfig,
  token: string,
  filename: string
): Promise<{ token: string }> {
  return apiRequest(config, `/attachments/notify/${token}?filename=${encodeURIComponent(filename)}`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function uploadAttachment(
  config: TeableConfig,
  tableId: string,
  recordId: string,
  fieldId: string,
  file: File
): Promise<void> {
  const url = `${getBaseUrl(config)}/api/table/${tableId}/record/${recordId}/${fieldId}/uploadAttachment`;
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${config.token}` },
    body: form,
  });
  if (!res.ok) throw new Error('上传失败');
}

export { ATTACHMENT_FIELD_NAME };
