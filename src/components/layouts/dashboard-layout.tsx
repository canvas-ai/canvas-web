import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect, useCallback } from "react"
import { LogOut, Briefcase, Network, KeyRound, Infinity, ChevronRight, Users, FolderOpen } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/toast-container"
import { getCurrentUserFromToken } from "@/services/auth"
import { listWorkspaces } from "@/services/workspace"
import { listContexts } from "@/services/context"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

// Workspace interface
interface Workspace {
  id: string
  name: string
  label: string
  description: string
  owner: string
  color?: string | null
  status: 'available' | 'not_found' | 'error' | 'active' | 'inactive' | 'removed' | 'destroyed'
  type?: string
  createdAt: string
  updatedAt: string
}

// Context interface (from global types but redefined for local use)
interface LocalContext {
  id: string
  url: string
  description?: string
  workspace?: string
  baseUrl?: string
  owner?: string
  createdAt?: string
  updatedAt?: string
}

// Navigation items (excluding workspaces and contexts which will be submenus)
const navigationItems = [
  {
    title: "universe",
    url: "/workspaces/universe",
    icon: Infinity,
    description: "universe"
  }
]

// Separate component for sidebar content that uses useSidebar hook
function DashboardSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { state } = useSidebar()
  const [user, setUser] = useState<{ id: string; email: string; userType: string } | null>(null)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [isWorkspacesOpen, setIsWorkspacesOpen] = useState(true)
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false)
  const [contexts, setContexts] = useState<LocalContext[]>([])
  const [isContextsOpen, setIsContextsOpen] = useState(true)
  const [isLoadingContexts, setIsLoadingContexts] = useState(false)

  // Get user information from token
  useEffect(() => {
    const currentUser = getCurrentUserFromToken()
    setUser(currentUser)
  }, [])

  // Fetch workspaces
  useEffect(() => {
    const fetchWorkspaces = async () => {
      setIsLoadingWorkspaces(true)
      try {
        const workspaceData = await listWorkspaces()
        if (Array.isArray(workspaceData)) {
          // Transform the API response to match our interface
          const transformedData = workspaceData.map((ws: any) => ({
            id: ws.id,
            name: ws.name,
            label: ws.label || ws.name,
            description: ws.description,
            owner: ws.owner,
            color: ws.color,
            status: ws.status,
            type: ws.type,
            createdAt: ws.created || ws.createdAt,
            updatedAt: ws.updated || ws.updatedAt,
          }))
          setWorkspaces(transformedData)
        } else {
            console.warn('listWorkspaces response is not an array:', workspaceData);
            setWorkspaces([]);
        }
      } catch (error) {
        console.error('Failed to fetch workspaces:', error)

        // Set empty array to prevent "A.map is not a function" errors
        setWorkspaces([]);

        showToast({
          title: 'Error',
          description: 'Failed to load workspaces',
          variant: 'destructive'
        })
      } finally {
        setIsLoadingWorkspaces(false)
      }
    }

    fetchWorkspaces()
  }, [])

  // Fetch contexts
  useEffect(() => {
    const fetchContexts = async () => {
      setIsLoadingContexts(true)
      try {
        const contextData = await listContexts()
        if (Array.isArray(contextData)) {
            setContexts(contextData)
        } else {
            console.warn('listContexts response is not an array:', contextData);
            setContexts([]);
        }
      } catch (error) {
        console.error('Failed to fetch contexts:', error)

        // Set empty array to prevent "A.map is not a function" errors
        setContexts([]);

        showToast({
          title: 'Error',
          description: 'Failed to load contexts',
          variant: 'destructive'
        })
      } finally {
        setIsLoadingContexts(false)
      }
    }

    fetchContexts()
  }, [])

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/")
  }

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
      localStorage.removeItem('authToken')
      navigate('/login')
    } catch (error) {
      console.error('Logout failed', error)
      showToast({
        title: 'Error',
        description: 'Logout failed',
        variant: 'destructive'
      })
    }
  }

  // Safe navigation function that uses React Router
  const navigateTo = useCallback((path: string) => {
    if (location.pathname !== path) {
      navigate(path)
    }
  }, [location.pathname, navigate])

  // Get user initials for avatar fallback
  const getUserInitials = (email: string) => {
    return email
      .split('@')[0]
      .split('.')
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2)
  }

  return (
    <>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <button
                  onClick={() => navigateTo('/home')}
                  className="flex items-center"
                  type="button"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <img
                      src='/images/logo_128x128.png'
                      alt="Canvas Logo"
                      className="size-4"
                    />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Canvas</span>

                  </div>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.description}
                    >
                      <button
                        onClick={() => navigateTo(item.url)}
                        className="flex items-center"
                        type="button"
                      >
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

                                {/* Workspaces submenu */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => {
                      // If sidebar is collapsed, navigate to workspaces page
                      if (state === 'collapsed') {
                        navigateTo('/workspaces')
                      } else {
                        // If sidebar is expanded, toggle the submenu
                        setIsWorkspacesOpen(!isWorkspacesOpen)
                      }
                    }}
                    tooltip="Manage your workspaces"
                  >
                    <Briefcase className="size-4" />
                    <span>Workspaces</span>
                    <ChevronRight
                      className={`ml-auto size-4 transition-transform ${isWorkspacesOpen ? 'rotate-90' : ''}`}
                    />
                  </SidebarMenuButton>

                  {isWorkspacesOpen && (
                    <SidebarMenuSub>
                      {/* Manage Workspaces link */}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={location.pathname === '/workspaces'}
                        >
                          <button
                            onClick={() => navigateTo('/workspaces')}
                            className="flex items-center"
                            type="button"
                          >
                            <span>Manage Workspaces</span>
                          </button>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                                             {/* Individual workspaces */}
                       {isLoadingWorkspaces ? (
                         <SidebarMenuSubItem>
                           <div className="px-2 py-1 text-xs text-muted-foreground">
                             Loading...
                           </div>
                         </SidebarMenuSubItem>
                       ) : (
                         workspaces.map((workspace) => (
                           <SidebarMenuSubItem key={`${workspace.owner}-${workspace.name}`}>
                             <SidebarMenuSubButton
                               asChild
                               isActive={location.pathname === `/workspaces/${workspace.name}`}
                             >
                               <button
                                 onClick={() => navigateTo(`/workspaces/${workspace.name}`)}
                                 className="flex items-center relative"
                                 type="button"
                               >
                                 {workspace.color && (
                                   <div
                                     className="absolute left-0 top-0 bottom-0 w-1 rounded-none"
                                     style={{ backgroundColor: workspace.color, borderRadius: '0' }}
                                   />
                                 )}
                                 <span className="truncate">{workspace.label}</span>
                               </button>
                             </SidebarMenuSubButton>
                           </SidebarMenuSubItem>
                         ))
                       )}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>

                {/* Contexts submenu */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => {
                      // If sidebar is collapsed, navigate to contexts page
                      if (state === 'collapsed') {
                        navigateTo('/contexts')
                      } else {
                        // If sidebar is expanded, toggle the submenu
                        setIsContextsOpen(!isContextsOpen)
                      }
                    }}
                    tooltip="Browse and manage contexts"
                  >
                    <Network className="size-4" />
                    <span>Contexts</span>
                    <ChevronRight
                      className={`ml-auto size-4 transition-transform ${isContextsOpen ? 'rotate-90' : ''}`}
                    />
                  </SidebarMenuButton>

                  {isContextsOpen && (
                    <SidebarMenuSub>
                      {/* Manage Contexts link */}
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          asChild
                          isActive={location.pathname === '/contexts'}
                        >
                          <button
                            onClick={() => navigateTo('/contexts')}
                            className="flex items-center"
                            type="button"
                          >
                            <span>Manage Contexts</span>
                          </button>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>

                      {/* Individual contexts */}
                      {isLoadingContexts ? (
                        <SidebarMenuSubItem>
                          <div className="px-2 py-1 text-xs text-muted-foreground">
                            Loading...
                          </div>
                        </SidebarMenuSubItem>
                      ) : (
                        contexts.map((context) => (
                          <SidebarMenuSubItem key={`${context.owner || 'unknown'}-${context.id}`}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={location.pathname === `/contexts/${context.id}`}
                            >
                              <button
                                onClick={() => navigateTo(`/contexts/${context.id}`)}
                                className="flex items-center"
                                type="button"
                              >
                                <span className="truncate">{context.url || context.id}</span>
                              </button>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))
                      )}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>

                {/* API Keys */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/api-tokens')}
                    tooltip="Manage your API tokens"
                  >
                    <button
                      onClick={() => navigateTo('/api-tokens')}
                      className="flex items-center"
                      type="button"
                    >
                      <KeyRound className="size-4" />
                      <span>API Keys</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Admin Section - Only visible to admin users */}
                {user?.userType === 'admin' && (
                  <>
                    <SidebarGroupLabel>Administration</SidebarGroupLabel>

                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive('/admin/users')}
                        tooltip="Manage users"
                      >
                        <button
                          onClick={() => navigateTo('/admin/users')}
                          className="flex items-center"
                          type="button"
                        >
                          <Users className="size-4" />
                          <span>User Management</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive('/admin/workspaces')}
                        tooltip="Manage workspaces for all users"
                      >
                        <button
                          onClick={() => navigateTo('/admin/workspaces')}
                          className="flex items-center"
                          type="button"
                        >
                          <FolderOpen className="size-4" />
                          <span>Workspace Administration</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                asChild
                tooltip={`${user?.email?.split('@')[0] || "User"} - Go to Home`}
              >
                <button
                  onClick={() => navigateTo('/home')}
                  className="flex items-center gap-2 p-2"
                  type="button"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={user?.email || "User"} />
                    <AvatarFallback className="text-xs">
                      {user?.email ? getUserInitials(user.email) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.email?.split('@')[0] || "User"}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email || "user@example.com"}
                    </span>
                  </div>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <SidebarSeparator />

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="size-4" />
                  <span>Logout</span>
                </Button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="h-4 w-px bg-sidebar-border" />
            <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {location.pathname === '/home' && 'Home'}
                {location.pathname === '/workspaces' && 'Workspaces'}
                {location.pathname.startsWith('/workspaces/') && location.pathname !== '/workspaces' && 'Workspace Details (read-only)'}
                {location.pathname === '/contexts' && 'Contexts'}
                {location.pathname.startsWith('/contexts/') && location.pathname !== '/contexts' && 'Context Details'}
                {location.pathname.startsWith('/users/') && location.pathname.includes('/contexts/') && 'Shared Context Details'}
                {location.pathname === '/api-tokens' && 'API Tokens'}
                {location.pathname === '/admin/users' && 'User Management'}
                {location.pathname === '/admin/workspaces' && 'Workspace Administration'}
              </span>
            </nav>
          </div>
        </header>

        {/* Main content */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>

        {/* Footer */}
        <footer className="border-t py-4">
          <div className="container mx-auto px-4 flex justify-between items-center text-sm text-muted-foreground">
            <div>© {new Date().getFullYear()} Canvas. All rights reserved.</div>
            <a
              href="https://github.com/canvas-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:text-foreground"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
              GitHub
            </a>
          </div>
        </footer>
      </SidebarInset>
    </>
  )
}

export function DashboardLayout() {
  return (
    <SidebarProvider defaultOpen={false}>
      <DashboardSidebar />
    </SidebarProvider>
  )
}
