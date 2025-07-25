import { API_ROUTES } from '@/config/api';
import { api } from '@/lib/api';
// GLOBAL Workspace type from src/types/api.d.ts will be used.
// No local Workspace interface should be defined here.

// listWorkspaces should return a Promise where Workspace is the global type.
export async function listWorkspaces(): Promise<Workspace[]> {
  try {
    // The API returns a ResponseObject with workspaces in the payload field
    const response = await api.get<{ payload: Workspace[]; message: string; status: string; statusCode: number }>(API_ROUTES.workspaces);

    // Ensure we always return an array even if the response structure is unexpected
    if (Array.isArray(response.payload)) {
      return response.payload;
    } else {
      console.warn('listWorkspaces: response.payload is not an array:', response.payload);
      return [];
    }
  } catch (error) {
    console.error('Failed to list workspaces:', error);
    throw error;
  }
}

// createWorkspace payload and response should align with the global Workspace type.
// Note: Global Workspace has owner, createdAt, updatedAt, status, type - some set by backend.
interface CreateWorkspacePayload {
    name: string;
    description?: string;
    color?: string;
    label?: string;
    type?: string; // This aligns with optional 'type' in global Workspace
}
export async function createWorkspace(payload: CreateWorkspacePayload): Promise<Workspace> {
  try {
    // The backend returns a ResponseObject with the workspace in the payload property
    const response = await api.post<{ payload: Workspace; message: string; status: string; statusCode: number }>(API_ROUTES.workspaces, payload);
    return response.payload;
  } catch (error) {
    console.error('Failed to create workspace:', error);
    throw error;
  }
}

export async function startWorkspace(id: string): Promise<Workspace> {
  try {
    const response = await api.post<{ payload: Workspace; message: string; status: string; statusCode: number }>(`${API_ROUTES.workspaces}/${id}/start`);
    return response.payload;
  } catch (error) {
    console.error('Failed to start workspace:', error);
    throw error;
  }
}

// openWorkspace and closeWorkspace should also operate with the global Workspace type.
export async function openWorkspace(id: string): Promise<Workspace> {
  try {
    const response = await api.post<{ payload: Workspace; message: string; status: string; statusCode: number }>(`${API_ROUTES.workspaces}/${id}/open`);
    return response.payload;
  } catch (error) {
    console.error(`Failed to open workspace ${id}:`, error);
    throw error;
  }
}

export async function closeWorkspace(id: string): Promise<Workspace> {
  try {
    const response = await api.post<{ payload: Workspace; message: string; status: string; statusCode: number }>(`${API_ROUTES.workspaces}/${id}/close`);
    return response.payload;
  } catch (error) {
    console.error('Failed to close workspace:', error);
    throw error;
  }
}

export async function removeWorkspace(id: string): Promise<Workspace> {
  try {
    const response = await api.delete<{ payload: Workspace; message: string; status: string; statusCode: number }>(`${API_ROUTES.workspaces}/${id}`);
    return response.payload;
  } catch (error) {
    console.error('Failed to remove workspace:', error);
    throw error;
  }
}

export async function purgeWorkspace(id: string): Promise<null> {
  try {
    return await api.delete<null>(`${API_ROUTES.workspaces}/${id}/purge`);
  } catch (error) {
    console.error(`Failed to purge workspace ${id}:`, error);
    throw error;
  }
}

// Get workspace tree
export async function getWorkspaceTree(id: string): Promise<any> {
  try {
    return await api.get<any>(`${API_ROUTES.workspaces}/${id}/tree`);
  } catch (error) {
    console.error(`Failed to get workspace tree ${id}:`, error);
    throw error;
  }
}

// Get workspace documents
export async function getWorkspaceDocuments(
  id: string,
  contextSpec: string = '/',
  featureArray: string[] = []
): Promise<any> {
  try {
    const params = new URLSearchParams();
    if (contextSpec !== '/') params.append('contextSpec', contextSpec);
    if (featureArray.length > 0) {
      featureArray.forEach(feature => params.append('featureArray', feature));
    }

    const queryString = params.toString();
    const url = `${API_ROUTES.workspaces}/${id}/documents${queryString ? '?' + queryString : ''}`;

    return await api.get<any>(url);
  } catch (error) {
    console.error(`Failed to get workspace documents ${id}:`, error);
    throw error;
  }
}

export async function updateWorkspace(id: string, payload: Partial<CreateWorkspacePayload>): Promise<Workspace> {
  try {
    const response = await api.put<{ payload: Workspace; message: string; status: string; statusCode: number }>(`${API_ROUTES.workspaces}/${id}`, payload);
    return response.payload;
  } catch (error) {
    console.error('Failed to update workspace:', error);
    throw error;
  }
}
