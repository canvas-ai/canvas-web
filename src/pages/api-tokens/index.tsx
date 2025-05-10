import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { API_ROUTES } from "@/config/api"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/toast-container"
import { Plus, Trash, Copy, Check } from "lucide-react"

interface ApiToken {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
}

interface ApiTokenResponse {
  id: string;
  token: string;
  name: string;
  description: string;
  createdAt: string;
}

interface ApiResponse<T> {
  message: string;
  payload: T;
  status: "success" | "error";
  statusCode: number;
}

export default function ApiTokensPage() {
  const [tokens, setTokens] = useState<ApiToken[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newTokenName, setNewTokenName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [newTokenValue, setNewTokenValue] = useState("")
  const [copiedToken, setCopiedToken] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    fetchTokens()
  }, [])

  const fetchTokens = async () => {
    try {
      setIsLoading(true)
      const data = await api.get<ApiResponse<ApiToken[] | { tokens: ApiToken[] }>>(API_ROUTES.tokens)

      // Handle both response formats
      const tokensData = Array.isArray(data.payload)
        ? data.payload
        : (data.payload as { tokens: ApiToken[] }).tokens || [];

      setTokens(tokensData)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch tokens'
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

  const handleGenerateToken = async () => {
    if (!newTokenName.trim() || isCreating) {
      return
    }

    setIsCreating(true)
    try {
      const response = await api.post<ApiResponse<ApiTokenResponse>>(API_ROUTES.tokens, {
        name: newTokenName
      })

      setNewTokenName("")
      await fetchTokens()

      if (response.payload && response.payload.token) {
        setNewTokenValue(response.payload.token);
      }

      showToast({
        title: 'Success',
        description: 'Token generated successfully',
        variant: 'default'
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate token'
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

  const handleRevokeToken = async (tokenId: string) => {
    if (!confirm('Are you sure you want to revoke this API token? This action cannot be undone.')) {
      return
    }

    try {
      await api.delete(`${API_ROUTES.tokens}/${tokenId}`)
      await fetchTokens()
      showToast({
        title: 'Success',
        description: 'API token revoked successfully'
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to revoke API token'
      showToast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      })
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedToken(true)
      showToast({
        title: 'Success',
        description: 'Token copied to clipboard'
      })
      setTimeout(() => setCopiedToken(false), 2000)
    } catch (err) {
      showToast({
        title: 'Error',
        description: 'Failed to copy token to clipboard',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Generate New API Token</CardTitle>
            <CardDescription>Create a new API token for programmatic access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTokenName}
                  onChange={(e) => setNewTokenName(e.target.value)}
                  placeholder="Token Name (e.g., 'CLI Access', 'Automation')"
                  disabled={isCreating}
                />
                <Button
                  type="button"
                  disabled={isCreating || !newTokenName.trim()}
                  onClick={handleGenerateToken}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {isCreating ? 'Generating...' : 'Generate'}
                </Button>
              </div>
            </div>

            {newTokenValue && (
              <div className="mt-4 p-4 border rounded-md bg-muted/50">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Your New API Token</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(newTokenValue)}
                  >
                    {copiedToken ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Make sure to copy your API token now. You won't be able to see it again!
                </p>
                <div className="p-2 bg-background border rounded font-mono text-sm break-all">
                  {newTokenValue}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your API Tokens</CardTitle>
            <CardDescription>Manage your API tokens</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && <p className="text-center text-muted-foreground">Loading API tokens...</p>}

            {error && (
              <div className="text-center text-destructive">
                <p>{error}</p>
              </div>
            )}

            {!isLoading && !error && tokens.length === 0 && (
              <p className="text-center text-muted-foreground">No API tokens found</p>
            )}

            {tokens.length > 0 && (
              <div className="border rounded-md">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-3 font-medium">Name</th>
                        <th className="text-left p-3 font-medium">Created</th>
                        <th className="text-left p-3 font-medium">Last Used</th>
                        <th className="text-left p-3 font-medium">Expires</th>
                        <th className="text-right p-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tokens.map((token) => (
                        <tr key={token.id} className="border-t">
                          <td className="p-3">{token.name}</td>
                          <td className="p-3">{new Date(token.createdAt).toLocaleDateString()}</td>
                          <td className="p-3">
                            {token.lastUsedAt ? new Date(token.lastUsedAt).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="p-3">
                            {token.expiresAt ? new Date(token.expiresAt).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRevokeToken(token.id)}
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
