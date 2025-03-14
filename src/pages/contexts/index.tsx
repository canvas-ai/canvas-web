import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { API_ROUTES } from "@/config/api"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/toast-container"
import { Plus, Trash } from "lucide-react"

export default function ContextsPage() {
  const [contexts, setContexts] = useState<Context[]>([])
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newContextUrl, setNewContextUrl] = useState("")
  const [newContextName, setNewContextName] = useState("")
  const [newContextDescription, setNewContextDescription] = useState("")
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("")
  const [isCreating, setIsCreating] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    fetchContexts()
    fetchWorkspaces()
  }, [])

  const fetchContexts = async () => {
    try {
      setIsLoading(true)
      const data = await api.get<ApiResponse<Context[] | { contexts: Context[] }>>(API_ROUTES.contexts)

      // Handle both response formats
      const contextsData = Array.isArray(data.payload)
        ? data.payload
        : (data.payload as { contexts: Context[] }).contexts || [];

      setContexts(contextsData)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch contexts'
      setError(message)
      showToast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchWorkspaces = async () => {
    try {
      const data = await api.get<ApiResponse<Workspace[] | { workspaces: Workspace[] }>>(API_ROUTES.workspaces)

      // Handle both response formats
      const workspacesData = Array.isArray(data.payload)
        ? data.payload
        : (data.payload as { workspaces: Workspace[] }).workspaces || [];

      setWorkspaces(workspacesData)
      if (workspacesData.length > 0) {
        setSelectedWorkspaceId(workspacesData[0].id)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch workspaces'
      showToast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      })
    }
  }

  const handleCreateContext = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContextUrl.trim() || !selectedWorkspaceId) return

    setIsCreating(true)
    try {
      await api.post(API_ROUTES.contexts, {
        url: newContextUrl,
        name: newContextName,
        description: newContextDescription,
        workspaceId: selectedWorkspaceId
      })
      await fetchContexts()
      setNewContextUrl("")
      setNewContextName("")
      setNewContextDescription("")
      showToast({
        title: 'Success',
        description: 'Context created successfully'
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create context'
      setError(message)
      showToast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteContext = async (contextId: string) => {
    if (!confirm('Are you sure you want to delete this context? This action cannot be undone.')) {
      return
    }

    try {
      await api.delete(`${API_ROUTES.contexts}/${contextId}`)
      await fetchContexts()
      showToast({
        title: 'Success',
        description: 'Context deleted successfully'
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete context'
      showToast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Context</CardTitle>
            <CardDescription>Create a new context in a workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateContext} className="space-y-4">
              <div className="grid gap-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="workspace" className="block text-sm font-medium text-gray-700 mb-1">
                      Workspace
                    </label>
                    <select
                      id="workspace"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                      value={selectedWorkspaceId}
                      onChange={(e) => setSelectedWorkspaceId(e.target.value)}
                      disabled={isCreating || workspaces.length === 0}
                    >
                      {workspaces.length === 0 && (
                        <option value="">No workspaces available</option>
                      )}
                      {workspaces.map((workspace) => (
                        <option key={workspace.id} value={workspace.id}>
                          {workspace.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                      Context URL
                    </label>
                    <Input
                      id="url"
                      value={newContextUrl}
                      onChange={(e) => setNewContextUrl(e.target.value)}
                      placeholder="e.g., my-laptop@universe://work/acme/devops/jira-1234"
                      disabled={isCreating}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name (Optional)
                    </label>
                    <Input
                      id="name"
                      value={newContextName}
                      onChange={(e) => setNewContextName(e.target.value)}
                      placeholder="Context Name"
                      disabled={isCreating}
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <Input
                      id="description"
                      value={newContextDescription}
                      onChange={(e) => setNewContextDescription(e.target.value)}
                      placeholder="Description"
                      disabled={isCreating}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isCreating || !newContextUrl.trim() || !selectedWorkspaceId}
                  className="mt-2"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Context
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Contexts</CardTitle>
            <CardDescription>Manage your contexts</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && <p className="text-center text-muted-foreground">Loading contexts...</p>}

            {error && (
              <div className="text-center text-destructive">
                <p>{error}</p>
              </div>
            )}

            {!isLoading && !error && contexts.length === 0 && (
              <p className="text-center text-muted-foreground">No contexts found</p>
            )}

            {contexts.length > 0 && (
              <div className="border rounded-md">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-3 font-medium">URL</th>
                        <th className="text-left p-3 font-medium">Name</th>
                        <th className="text-left p-3 font-medium">Workspace</th>
                        <th className="text-left p-3 font-medium">Created</th>
                        <th className="text-right p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contexts.map((context) => (
                        <tr key={context.id} className="border-t">
                          <td className="p-3 font-mono text-sm">{context.url}</td>
                          <td className="p-3">{context.name || '-'}</td>
                          <td className="p-3">{context.workspace?.name || '-'}</td>
                          <td className="p-3">{new Date(context.createdAt).toLocaleDateString()}</td>
                          <td className="p-3 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteContext(context.id)}
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
