// src/Dashboard.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome, FiBox, FiGlobe, FiServer, FiShield, FiMail,FiCreditCard,
  FiMenu, FiX, FiPlus, FiSettings, FiUser, FiChevronDown, FiZap, FiActivity, FiTerminal, FiRefreshCw, FiLogOut, FiEdit2, FiTrash2,
  FiAlertTriangle,
} from "react-icons/fi";
import { useAuth, useToast, apiRequest } from "./shared";
import { PCloudsOriginalDashboard } from "./pages/PCloudsDashboard";

// ----------------------------- TYPES ---------------------------------
type ResourceType = "server" | "domain" | "malware_scanner" | "smtp";
type ResourceStatus = "healthy" | "degraded" | "down" | "pending";
type BillingStatus = "paid" | "pending" | "overdue";
type ClusterHealth = "healthy" | "degraded" | "critical";

interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  provider: string;
  status: ResourceStatus;
  config: Record<string, any>;
  createdAt: string;
}

interface Cluster {
  id: string;
  name: string;
  description: string;
  resources: Resource[];
  resources_count: number;
  healthy_resources: number;
  health_overall: ClusterHealth;
  balance_cents: number;
  next_due: string;
  created_at: string;
}

interface LogEntry {
  id: string;
  resourceId: string;
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
}

interface Invoice {
  id: string;
  periodStart: string;
  periodEnd: string;
  amountCents: number;
  status: BillingStatus;
}

// ----------------------------- API SERVICES -----------------------------
async function fetchClusters(): Promise<Cluster[]> {
  const data = await apiRequest('/clusters');
  return data.map((item: any) => ({
    id: item.id,
    name: item.name,
    description: item.description || '',
    resources: [],
    resources_count: item.resources_count || 0,
    healthy_resources: item.healthy_resources || 0,
    health_overall: item.health_overall || 'healthy',
    balance_cents: item.balance_cents || 0,
    next_due: item.next_due || new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0,10),
    created_at: item.created_at,
  }));
}

async function fetchClusterResources(clusterId: string): Promise<Resource[]> {
  const data = await apiRequest(`/clusters/${clusterId}/resources`);
  return data.map((item: any) => ({
    id: item.id,
    name: item.name,
    type: item.type,
    provider: item.provider || 'custom',
    status: item.status || 'pending',
    config: item.config || {},
    createdAt: item.created_at || new Date().toISOString().slice(0,10),
  }));
}

async function fetchClusterMetrics(clusterId: string): Promise<any[]> {
  return await apiRequest(`/clusters/${clusterId}/metrics`);
}

async function fetchClusterLogs(clusterId: string): Promise<LogEntry[]> {
  const data = await apiRequest(`/clusters/${clusterId}/logs`);
  return data.map((item: any) => ({
    id: item.id,
    resourceId: item.resourceId,
    timestamp: item.timestamp,
    level: item.level,
    message: item.message,
  }));
}

async function fetchClusterInvoices(clusterId: string): Promise<Invoice[]> {
  const data = await apiRequest(`/clusters/${clusterId}/invoices`);
  return data.map((item: any) => ({
    id: item.id,
    periodStart: item.periodStart,
    periodEnd: item.periodEnd,
    amountCents: item.amountCents,
    status: item.status as BillingStatus,
  }));
}

// ----------------------------- KLUSTERS DASHBOARD (with onSwitchDashboard prop) -----------------------------
const KlustersDashboard = ({ onSwitchDashboard }: { onSwitchDashboard?: () => void }) => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [selectedClusterId, setSelectedClusterId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"overview" | "resources" | "health" | "logs" | "billing">("overview");
  const [showCreateClusterModal, setShowCreateClusterModal] = useState(false);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [showEditResourceModal, setShowEditResourceModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
  const [newClusterName, setNewClusterName] = useState("");
  const [newClusterDesc, setNewClusterDesc] = useState("");
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [editFormData, setEditFormData] = useState<Record<string, any>>({});
  const [liveLogs, setLiveLogs] = useState<LogEntry[]>([]);
  const [liveEnabled, setLiveEnabled] = useState(true);
  const [isLoadingClusters, setIsLoadingClusters] = useState(true);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const selectedCluster = clusters.find((c) => c.id === selectedClusterId);

  // Load clusters on mount
  useEffect(() => {
    const loadClusters = async () => {
      try {
        setIsLoadingClusters(true);
        const data = await fetchClusters();
        setClusters(data);
        if (data.length > 0) {
          setSelectedClusterId(data[0].id);
        }
      } catch (error) {
        console.error('Failed to load clusters:', error);
        addToast('error', 'Failed to load clusters');
      } finally {
        setIsLoadingClusters(false);
      }
    };
    loadClusters();
  }, [addToast]);

  // Load resources when selected cluster changes
  useEffect(() => {
    if (!selectedClusterId) return;
    const loadResources = async () => {
      try {
        setIsLoadingResources(true);
        const resources = await fetchClusterResources(selectedClusterId);
        setClusters(prev => prev.map(c => 
          c.id === selectedClusterId ? { ...c, resources } : c
        ));
      } catch (error) {
        console.error('Failed to load resources:', error);
        addToast('error', 'Failed to load resources');
      } finally {
        setIsLoadingResources(false);
      }
    };
    loadResources();

    if (activeTab === 'health') {
      const loadMetrics = async () => {
        try {
          setIsLoadingMetrics(true);
          const data = await fetchClusterMetrics(selectedClusterId);
          setMetrics(data);
        } catch (error) {
          console.error('Failed to load metrics:', error);
        } finally {
          setIsLoadingMetrics(false);
        }
      };
      loadMetrics();
    }

    if (activeTab === 'logs') {
      const loadLogs = async () => {
        try {
          setIsLoadingLogs(true);
          const data = await fetchClusterLogs(selectedClusterId);
          setLiveLogs(data);
        } catch (error) {
          console.error('Failed to load logs:', error);
        } finally {
          setIsLoadingLogs(false);
        }
      };
      loadLogs();
    }

    if (activeTab === 'billing') {
      const loadInvoices = async () => {
        try {
          setIsLoadingInvoices(true);
          const data = await fetchClusterInvoices(selectedClusterId);
          setInvoices(data);
        } catch (error) {
          console.error('Failed to load invoices:', error);
        } finally {
          setIsLoadingInvoices(false);
        }
      };
      loadInvoices();
    }
  }, [selectedClusterId, activeTab, addToast]);

  // Live log simulation (placeholder – replace with WebSocket)
  useEffect(() => {
    if (!liveEnabled || !selectedClusterId) return;
    const interval = setInterval(() => {
      const resources = selectedCluster?.resources || [];
      if (resources.length === 0) return;
      const randomResource = resources[Math.floor(Math.random() * resources.length)];
      const newLog: LogEntry = {
        id: `live_${Date.now()}`,
        resourceId: randomResource.id,
        timestamp: new Date().toISOString(),
        level: ['info', 'warn', 'error'][Math.floor(Math.random() * 3)] as any,
        message: ['Health check passed', 'CPU spike detected', 'Memory usage normal', 'SSL expiry warning', 'Deployment triggered'][Math.floor(Math.random() * 5)],
      };
      setLiveLogs(prev => [newLog, ...prev.slice(0, 99)]);
    }, 5000);
    return () => clearInterval(interval);
  }, [liveEnabled, selectedClusterId, selectedCluster]);

  const formatMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  // --- Cluster CRUD ---
  const handleCreateCluster = async () => {
    if (!newClusterName.trim()) return;
    try {
      const data = await apiRequest('/clusters', {
        method: 'POST',
        body: JSON.stringify({ name: newClusterName, description: newClusterDesc }),
      });
      const newCluster: Cluster = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        resources: [],
        resources_count: 0,
        healthy_resources: 0,
        health_overall: 'healthy',
        balance_cents: 0,
        next_due: new Date(Date.now() + 30*24*60*60*1000).toISOString().slice(0,10),
        created_at: new Date().toISOString(),
      };
      setClusters(prev => [...prev, newCluster]);
      setSelectedClusterId(newCluster.id);
      setShowCreateClusterModal(false);
      setNewClusterName("");
      setNewClusterDesc("");
      addToast('success', `Cluster "${newClusterName}" created`);
    } catch (error) {
      console.error('Failed to create cluster:', error);
      addToast('error', 'Failed to create cluster');
    }
  };

  // --- Resource CRUD ---
  const handleAddResource = async (type: ResourceType) => {
    if (!selectedCluster) return;
    try {
      const data = await apiRequest(`/clusters/${selectedCluster.id}/resources`, {
        method: 'POST',
        body: JSON.stringify({ name: `New ${type}`, type, provider: 'custom', config: {} }),
      });
      const newResource: Resource = {
        id: data.id,
        name: data.name,
        type: data.type,
        provider: 'custom',
        status: 'pending',
        config: {},
        createdAt: new Date().toISOString().slice(0,10),
      };
      setClusters(prev => prev.map(c => 
        c.id === selectedCluster.id 
          ? { ...c, resources: [...c.resources, newResource], resources_count: c.resources_count + 1 }
          : c
      ));
      setShowAddResourceModal(false);
      addToast('success', `Resource "${newResource.name}" added`);
    } catch (error) {
      console.error('Failed to add resource:', error);
      addToast('error', 'Failed to add resource');
    }
  };

  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setEditFormData({
      provider: resource.provider || 'custom',
      status: resource.status,
      ...resource.config,
    });
    setShowEditResourceModal(true);
  };

  const handleSaveResourceEdit = async () => {
    if (!editingResource || !selectedCluster) return;
    try {
      const payload: any = {
        name: editingResource.name,
        provider: editFormData.provider || 'custom',
        status: editFormData.status || 'pending',
        config: { ...editFormData },
      };
      delete payload.config.provider;
      delete payload.config.status;

      await apiRequest(`/clusters/${selectedCluster.id}/resources/${editingResource.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setClusters(prev => prev.map(c => {
        if (c.id === selectedCluster.id) {
          const updatedResources = c.resources.map(r => {
            if (r.id === editingResource.id) {
              return {
                ...r,
                provider: payload.provider,
                status: payload.status,
                config: payload.config,
              };
            }
            return r;
          });
          return { ...c, resources: updatedResources };
        }
        return c;
      }));
      setShowEditResourceModal(false);
      setEditingResource(null);
      addToast('success', `Resource "${editingResource.name}" updated`);
    } catch (error) {
      console.error('Failed to update resource:', error);
      addToast('error', 'Failed to update resource');
    }
  };

  // Show delete confirmation modal
  const confirmDeleteResource = (resource: Resource) => {
    setResourceToDelete(resource);
    setShowDeleteModal(true);
  };

  // Execute deletion after confirmation
  const handleDeleteResource = async () => {
    if (!resourceToDelete || !selectedCluster) return;
    try {
      await apiRequest(`/clusters/${selectedCluster.id}/resources/${resourceToDelete.id}`, {
        method: 'DELETE',
      });
      setClusters(prev => prev.map(c => {
        if (c.id === selectedCluster.id) {
          const filtered = c.resources.filter(r => r.id !== resourceToDelete.id);
          return { ...c, resources: filtered, resources_count: filtered.length };
        }
        return c;
      }));
      addToast('success', `Resource "${resourceToDelete.name}" deleted`);
      setShowDeleteModal(false);
      setResourceToDelete(null);
    } catch (error) {
      console.error('Failed to delete resource:', error);
      addToast('error', 'Failed to delete resource');
    }
  };

  const handleLogout = () => {
    logout();
    addToast('success', 'Logged out successfully');
    setUserDropdownOpen(false);
  };

  // --- Helper: Render configuration fields based on resource type ---
  const renderConfigFields = (type: ResourceType) => {
    const fields: { key: string; label: string; type: string; placeholder?: string }[] = [];

    switch (type) {
      case 'server':
        fields.push(
          { key: 'ip', label: 'IP Address', type: 'text', placeholder: '192.168.1.1' },
          { key: 'port', label: 'Port', type: 'number', placeholder: '22' },
          { key: 'ssh_key', label: 'SSH Key (public)', type: 'text', placeholder: 'ssh-rsa AAA...' },
          { key: 'username', label: 'SSH Username', type: 'text', placeholder: 'root' },
        );
        break;
      case 'domain':
        fields.push(
          { key: 'dnsProvider', label: 'DNS Provider', type: 'text', placeholder: 'Cloudflare' },
          { key: 'sslExpiry', label: 'SSL Expiry Date', type: 'date' },
          { key: 'nameservers', label: 'Nameservers (comma separated)', type: 'text', placeholder: 'ns1.cloudflare.com, ns2.cloudflare.com' },
        );
        break;
      case 'malware_scanner':
        fields.push(
          { key: 'scanInterval', label: 'Scan Interval (hours)', type: 'number', placeholder: '6' },
          { key: 'scanPath', label: 'Scan Path', type: 'text', placeholder: '/var/www' },
          { key: 'alertEmail', label: 'Alert Email', type: 'email', placeholder: 'admin@example.com' },
        );
        break;
      case 'smtp':
        fields.push(
          { key: 'host', label: 'SMTP Host', type: 'text', placeholder: 'smtp.sendgrid.net' },
          { key: 'port', label: 'SMTP Port', type: 'number', placeholder: '587' },
          { key: 'username', label: 'Username', type: 'text' },
          { key: 'password', label: 'Password', type: 'password' },
        );
        break;
    }
    return fields;
  };

  const ResourceIcon = ({ type }: { type: ResourceType }) => {
    switch (type) {
      case "server": return <FiServer className="text-blue-400" />;
      case "domain": return <FiGlobe className="text-green-400" />;
      case "malware_scanner": return <FiShield className="text-purple-400" />;
      case "smtp": return <FiMail className="text-yellow-400" />;
      default: return <FiBox />;
    }
  };

  // --- Render functions ---
  const renderClusterList = () => {
    if (isLoadingClusters) {
      return <div className="text-center py-4 text-gray-400">Loading clusters...</div>;
    }
    if (clusters.length === 0) {
      return (
        <div className="text-center py-4 text-gray-400">
          No clusters yet.
          <button onClick={() => setShowCreateClusterModal(true)} className="block mt-2 text-blue-400 hover:underline">
            Create your first cluster
          </button>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Your Clusters</h3>
          <button onClick={() => setShowCreateClusterModal(true)} className="text-sm bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg flex items-center gap-1">
            <FiPlus /> New Cluster
          </button>
        </div>
        {clusters.map((cluster) => (
          <button
            key={cluster.id}
            onClick={() => { setSelectedClusterId(cluster.id); setActiveTab("overview"); }}
            className={`w-full text-left p-4 rounded-xl border transition ${
              selectedClusterId === cluster.id ? "border-blue-500 bg-blue-500/10" : "border-gray-800 bg-gray-900/30 hover:bg-gray-800/50"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold">{cluster.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{cluster.description || "No description"}</div>
              </div>
              <div className={`text-xs px-2 py-0.5 rounded-full ${
                cluster.health_overall === "healthy" ? "bg-green-500/20 text-green-400" :
                cluster.health_overall === "degraded" ? "bg-yellow-500/20 text-yellow-400" :
                "bg-red-500/20 text-red-400"
              }`}>
                {cluster.health_overall}
              </div>
            </div>
            <div className="flex gap-4 mt-3 text-xs text-gray-500">
              <span>{cluster.resources_count} resources</span>
              <span>Due: {cluster.next_due}</span>
              <span>{formatMoney(cluster.balance_cents)} balance</span>
            </div>
          </button>
        ))}
      </div>
    );
  };

  const renderOverview = () => {
    if (!selectedCluster) return null;
    const total = selectedCluster.resources_count;
    const healthy = selectedCluster.healthy_resources;
    const degraded = total - healthy;
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold">{selectedCluster.name}</h2>
            <p className="text-gray-400 text-sm mt-1">{selectedCluster.description}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAddResourceModal(true)} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <FiPlus /> Add Resource
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Total Resources</div>
            <div className="text-3xl font-bold">{total}</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Healthy</div>
            <div className="text-3xl font-bold text-green-400">{healthy}</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Degraded/Down</div>
            <div className="text-3xl font-bold text-yellow-400">{degraded}</div>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
            <div className="text-gray-400 text-sm">Next Billing</div>
            <div className="text-lg font-semibold">{selectedCluster.next_due}</div>
            <div className="text-xs text-gray-500">{formatMoney(selectedCluster.balance_cents)} due</div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">Recent Resources</h3>
          <div className="space-y-2">
            {selectedCluster.resources.slice(0, 3).map(res => (
              <div key={res.id} className="flex justify-between items-center p-3 rounded-lg border border-gray-800 bg-gray-900/30">
                <div className="flex items-center gap-3">
                  <ResourceIcon type={res.type} />
                  <div>
                    <div className="font-medium">{res.name}</div>
                    <div className="text-xs text-gray-500">{res.type} • {res.provider}</div>
                  </div>
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  res.status === "healthy" ? "bg-green-500/20 text-green-400" :
                  res.status === "degraded" ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-red-500/20 text-red-400"
                }`}>
                  {res.status}
                </div>
              </div>
            ))}
            {selectedCluster.resources.length === 0 && (
              <div className="text-center py-8 text-gray-500">No resources yet. Click "Add Resource" to get started.</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderResources = () => {
    if (!selectedCluster) return null;
    if (isLoadingResources) {
      return <div className="text-center py-8">Loading resources...</div>;
    }
    const grouped = {
      server: selectedCluster.resources.filter(r => r.type === "server"),
      domain: selectedCluster.resources.filter(r => r.type === "domain"),
      malware_scanner: selectedCluster.resources.filter(r => r.type === "malware_scanner"),
      smtp: selectedCluster.resources.filter(r => r.type === "smtp"),
    };
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Resources</h2>
          <button onClick={() => setShowAddResourceModal(true)} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            <FiPlus /> Add Resource
          </button>
        </div>
        {Object.entries(grouped).map(([type, resources]) => resources.length > 0 && (
          <div key={type}>
            <h3 className="text-lg font-semibold capitalize mb-3 flex items-center gap-2">
              <ResourceIcon type={type as ResourceType} /> {type.replace("_", " ")}s
            </h3>
            <div className="space-y-2">
              {resources.map(res => (
                <div key={res.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-gray-800 bg-gray-900/30">
                  <div className="flex-1">
                    <div className="font-medium">{res.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Provider: {res.provider} • Created: {res.createdAt}
                      {res.type === "domain" && res.config.sslExpiry && ` • SSL: ${res.config.sslExpiry}`}
                      {res.type === "server" && res.config.ip && ` • IP: ${res.config.ip}`}
                      {res.type === "server" && res.config.port && ` • Port: ${res.config.port}`}
                      {res.type === "smtp" && res.config.host && ` • Host: ${res.config.host}`}
                    </div>
                    <div className="text-xs mt-1">
                      <span className={`px-2 py-0.5 rounded-full ${
                        res.status === "healthy" ? "bg-green-500/20 text-green-400" :
                        res.status === "degraded" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {res.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => handleEditResource(res)}
                      className="text-gray-400 hover:text-blue-400 transition"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => confirmDeleteResource(res)}
                      className="text-gray-400 hover:text-red-400 transition"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {selectedCluster.resources.length === 0 && (
          <div className="text-center py-12 border border-dashed border-gray-700 rounded-xl">
            <p className="text-gray-400">No resources in this cluster. Add your first resource.</p>
          </div>
        )}
      </div>
    );
  };

  const renderHealth = () => {
    if (!selectedCluster) return null;
    if (isLoadingMetrics) {
      return <div className="text-center py-8">Loading metrics...</div>;
    }
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Health Monitoring</h2>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400">Overall Cluster Health</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedCluster.health_overall === "healthy" ? "bg-green-500/20 text-green-400" :
              selectedCluster.health_overall === "degraded" ? "bg-yellow-500/20 text-yellow-400" :
              "bg-red-500/20 text-red-400"
            }`}>
              {selectedCluster.health_overall.toUpperCase()}
            </span>
          </div>
          <div className="text-xs text-gray-500">Last check: {new Date().toLocaleString()}</div>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Resource Metrics</h3>
          {selectedCluster.resources.map(res => {
            const resMetrics = metrics.filter((m: any) => m.resourceId === res.id);
            return (
              <div key={res.id} className="border border-gray-800 rounded-xl p-4 bg-gray-900/30">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <ResourceIcon type={res.type} />
                    <span className="font-medium">{res.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">{res.type}</span>
                </div>
                {resMetrics.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <div className="text-gray-400">CPU</div>
                      <div className="font-mono">{resMetrics[0].cpu}%</div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${resMetrics[0].cpu}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Memory</div>
                      <div className="font-mono">{resMetrics[0].memory}%</div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${resMetrics[0].memory}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Latency</div>
                      <div className="font-mono">{resMetrics[0].latency} ms</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No recent metrics available</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderLogs = () => {
    if (!selectedCluster) return null;
    if (isLoadingLogs) {
      return <div className="text-center py-8">Loading logs...</div>;
    }
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Runtime Logs</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLiveEnabled(!liveEnabled)}
              className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 transition ${
                liveEnabled ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-gray-800 text-gray-400"
              }`}
            >
              <FiRefreshCw className={liveEnabled ? "animate-spin" : ""} /> {liveEnabled ? "Live" : "Paused"}
            </button>
          </div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-800 bg-gray-800/30 text-xs font-mono flex gap-4 sticky top-0">
            <span>Timestamp</span><span>Level</span><span>Resource</span><span>Message</span>
          </div>
          <div className="divide-y divide-gray-800 max-h-[500px] overflow-y-auto">
            <AnimatePresence initial={false}>
              {liveLogs.map((log, idx) => {
                const resource = selectedCluster.resources.find(r => r.id === log.resourceId);
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                    className="px-4 py-3 text-sm font-mono hover:bg-gray-800/30"
                  >
                    <div className="flex flex-wrap gap-4 items-start">
                      <span className="text-gray-500 w-40">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className={`w-16 ${
                        log.level === "error" ? "text-red-400" :
                        log.level === "warn" ? "text-yellow-400" : "text-green-400"
                      }`}>
                        {log.level.toUpperCase()}
                      </span>
                      <span className="text-blue-400 w-32 truncate">{resource?.name || log.resourceId.slice(0,8)}</span>
                      <span className="flex-1 text-gray-300">{log.message}</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {liveLogs.length === 0 && (
              <div className="px-4 py-8 text-center text-gray-500">No logs found for this cluster</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderBilling = () => {
    if (!selectedCluster) return null;
    if (isLoadingInvoices) {
      return <div className="text-center py-8">Loading invoices...</div>;
    }
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Billing</h2>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="text-sm text-gray-400">Current Balance</div>
              <div className="text-4xl font-bold">{formatMoney(selectedCluster.balance_cents)}</div>
              <div className="text-xs text-gray-500 mt-1">Due by {selectedCluster.next_due}</div>
            </div>
            <div className="flex gap-3">
              <button className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-lg">Pay Now</button>
              <button className="border border-gray-700 px-5 py-2 rounded-lg hover:bg-gray-800">Add Credits</button>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-3">Invoice History</h3>
          <div className="space-y-2">
            {invoices.map(inv => (
              <div key={inv.id} className="flex justify-between items-center p-4 rounded-xl border border-gray-800 bg-gray-900/30">
                <div>
                  <div className="font-medium">{inv.periodStart} – {inv.periodEnd}</div>
                  <div className="text-sm text-gray-400">{formatMoney(inv.amountCents)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    inv.status === "paid" ? "bg-green-500/20 text-green-400" :
                    "bg-yellow-500/20 text-yellow-400"
                  }`}>
                    {inv.status}
                  </span>
                  <button className="text-gray-400 hover:text-white text-sm">Download PDF</button>
                </div>
              </div>
            ))}
            {invoices.length === 0 && (
              <div className="text-center py-4 text-gray-500">No invoices yet</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderMainContent = () => {
    if (isLoadingClusters) {
      return <div className="flex items-center justify-center h-full py-20">Loading clusters...</div>;
    }
    if (!selectedCluster) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center py-20">
          <FiBox className="w-16 h-16 text-gray-700 mb-4" />
          <h2 className="text-xl font-semibold">No cluster selected</h2>
          <p className="text-gray-400 mt-2">Create a new cluster or select one from the sidebar</p>
          <button onClick={() => setShowCreateClusterModal(true)} className="mt-4 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg">
            Create Cluster
          </button>
        </div>
      );
    }
    switch(activeTab) {
      case "overview": return renderOverview();
      case "resources": return renderResources();
      case "health": return renderHealth();
      case "logs": return renderLogs();
      case "billing": return renderBilling();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-80 border-r border-gray-800 bg-gray-950/50 backdrop-blur-sm fixed h-full overflow-y-auto">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"><FiZap className="text-white" /></div>
            <span className="font-bold text-xl">Klusters</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">by PClouds</div>
        </div>
        <div className="p-4">{renderClusterList()}</div>
        <div className="p-4 border-t border-gray-800 mt-auto relative">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setUserDropdownOpen(!userDropdownOpen)}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm uppercase">
              {user?.name ? user.name.charAt(0) : <FiUser />}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{user?.name || "User"}</div>
              <div className="text-xs text-gray-500">{user?.email || "user@example.com"}</div>
            </div>
            <FiChevronDown className={`w-4 h-4 text-gray-400 transition ${userDropdownOpen ? "rotate-180" : ""}`} />
          </div>
          <AnimatePresence>
            {userDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-full mb-2 left-0 right-0 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-20"
              >
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-gray-700 transition"
                >
                  <FiLogOut className="w-4 h-4" /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 z-50 md:hidden" onClick={() => setSidebarOpen(false)}>
            <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="w-80 h-full bg-gray-950 border-r border-gray-800" onClick={(e) => e.stopPropagation()}>
              <div className="p-5 border-b border-gray-800 flex justify-between items-center">
                <span className="font-bold text-xl">Klusters</span>
                <button onClick={() => setSidebarOpen(false)}><FiX /></button>
              </div>
              <div className="p-4">{renderClusterList()}</div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 md:ml-80">
        <div className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-md border-b border-gray-800 px-6 py-4 flex justify-between items-center">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}><FiMenu className="w-6 h-6" /></button>
          {selectedCluster && (
            <div className="flex gap-2 overflow-x-auto">
              <button onClick={() => setActiveTab("overview")} className={`px-3 py-1.5 rounded-lg text-sm transition ${activeTab === "overview" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white"}`}>
                <FiHome className="inline mr-1" /> Overview
              </button>
              <button onClick={() => setActiveTab("resources")} className={`px-3 py-1.5 rounded-lg text-sm transition ${activeTab === "resources" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white"}`}>
                <FiBox className="inline mr-1" /> Resources
              </button>
              <button onClick={() => setActiveTab("health")} className={`px-3 py-1.5 rounded-lg text-sm transition ${activeTab === "health" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white"}`}>
                <FiActivity className="inline mr-1" /> Health
              </button>
              <button onClick={() => setActiveTab("logs")} className={`px-3 py-1.5 rounded-lg text-sm transition ${activeTab === "logs" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white"}`}>
                <FiTerminal className="inline mr-1" /> Logs
              </button>
              <button onClick={() => setActiveTab("billing")} className={`px-3 py-1.5 rounded-lg text-sm transition ${activeTab === "billing" ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white"}`}>
                <FiCreditCard className="inline mr-1" /> Billing
              </button>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button className="text-gray-400 hover:text-white"><FiSettings /></button>
            {onSwitchDashboard && (
              <button
                onClick={onSwitchDashboard}
                className="text-sm bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg transition font-medium"
              >
                Go to PClouds
              </button>
            )}
          </div>
        </div>
        <div className="p-6">{renderMainContent()}</div>
      </main>

      {/* Create Cluster Modal */}
      <AnimatePresence>
        {showCreateClusterModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateClusterModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-gray-900 border border-gray-800 rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4">Create New Cluster</h3>
              <input
                type="text"
                placeholder="Cluster name"
                value={newClusterName}
                onChange={(e) => setNewClusterName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 mb-3"
              />
              <textarea
                placeholder="Description (optional)"
                value={newClusterDesc}
                onChange={(e) => setNewClusterDesc(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 mb-4"
                rows={2}
              />
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowCreateClusterModal(false)} className="px-4 py-2 rounded-lg border border-gray-700">Cancel</button>
                <button onClick={handleCreateCluster} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Create</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Resource Modal */}
      <AnimatePresence>
        {showAddResourceModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowAddResourceModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-gray-900 border border-gray-800 rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4">Add Resource to {selectedCluster?.name}</h3>
              <div className="space-y-2">
                <button onClick={() => handleAddResource("server")} className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-700 hover:bg-gray-800">
                  <FiServer /> Server (AWS, DO, etc.)
                </button>
                <button onClick={() => handleAddResource("domain")} className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-700 hover:bg-gray-800">
                  <FiGlobe /> Domain
                </button>
                <button onClick={() => handleAddResource("malware_scanner")} className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-700 hover:bg-gray-800">
                  <FiShield /> Malware Scanner
                </button>
                <button onClick={() => handleAddResource("smtp")} className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-700 hover:bg-gray-800">
                  <FiMail /> SMTP Relay
                </button>
              </div>
              <div className="mt-4 flex justify-end">
                <button onClick={() => setShowAddResourceModal(false)} className="px-4 py-2 rounded-lg border border-gray-700">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Resource Modal */}
      <AnimatePresence>
        {showEditResourceModal && editingResource && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowEditResourceModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-gray-900 border border-gray-800 rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4">Edit Resource: {editingResource.name}</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Provider</label>
                  <input
                    type="text"
                    value={editFormData.provider || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, provider: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
                    placeholder="e.g., aws, digitalocean, cloudflare, custom"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Status</label>
                  <select
                    value={editFormData.status || 'pending'}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as ResourceStatus })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
                  >
                    <option value="healthy">Healthy</option>
                    <option value="degraded">Degraded</option>
                    <option value="down">Down</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="border-t border-gray-700 pt-3 mt-2">
                  <p className="text-sm font-medium text-gray-300 mb-2">Configuration</p>
                  {renderConfigFields(editingResource.type).map((field) => (
                    <div key={field.key} className="mb-2">
                      <label className="text-sm text-gray-400 block mb-1">{field.label}</label>
                      <input
                        type={field.type === 'password' ? 'password' : field.type}
                        value={editFormData[field.key] || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, [field.key]: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2"
                        placeholder={field.placeholder || ''}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button onClick={() => setShowEditResourceModal(false)} className="px-4 py-2 rounded-lg border border-gray-700">Cancel</button>
                <button onClick={handleSaveResourceEdit} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Save Changes</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && resourceToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-gray-900 border border-gray-800 rounded-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                  <FiAlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Confirm Deletion</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Are you sure you want to delete the resource <strong className="text-white">{resourceToDelete.name}</strong>? This action cannot be undone.
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteResource}
                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ----------------------------- DASHBOARD ROUTER -----------------------------
const DashboardRouter = () => {
  // Initialise from localStorage directly, with a fallback to "choice"
  const [view, setView] = useState<"choice" | "klusters" | "pclouds">(() => {
    const saved = localStorage.getItem('dashboardView') as "choice" | "klusters" | "pclouds" | null;
    if (saved && (saved === 'choice' || saved === 'klusters' || saved === 'pclouds')) {
      return saved;
    }
    return "choice";
  });

  // Save view to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('dashboardView', view);
  }, [view]);

  if (view === "choice") {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
              <FiZap className="text-white w-6 h-6" />
            </div>
            <h1 className="text-4xl font-bold mt-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">PCLOUDs Platform</h1>
            <p className="text-gray-400 mt-2">Choose your dashboard experience</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div whileHover={{ scale: 1.02 }} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 cursor-pointer hover:border-blue-500 transition-all" onClick={() => setView("klusters")}>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4"><FiBox className="text-blue-400 w-6 h-6" /></div>
              <h2 className="text-2xl font-bold">Klusters</h2>
              <p className="text-gray-400 mt-2">Group resources (servers, domains, malware scanners, SMTP) into clusters. Monitor health, view live logs, manage billing per cluster.</p>
              <div className="mt-4 flex gap-2 text-xs text-gray-500">
                <span>✓ Multi-provider</span>
                <span>✓ Health checks</span>
                <span>✓ Animated logs</span>
              </div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 cursor-pointer hover:border-purple-500 transition-all" onClick={() => setView("pclouds")}>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4"><FiZap className="text-purple-400 w-6 h-6" /></div>
              <h2 className="text-2xl font-bold">PClouds Dashboard</h2>
              <p className="text-gray-400 mt-2">Domains, hosting, API marketplace, developer library, CLI tool, deployment console — all in one place.</p>
              <div className="mt-4 flex gap-2 text-xs text-gray-500">
                <span>✓ Domain management</span>
                <span>✓ Hosting plans</span>
                <span>✓ API keys</span>
              </div>
            </motion.div>
          </div>
          <div className="text-center text-gray-500 text-xs mt-8">Built for African developers — no credit card required to start.</div>
        </div>
      </div>
    );
  }

  // Pass onSwitchDashboard to both dashboards
  if (view === "klusters") {
    return <KlustersDashboard onSwitchDashboard={() => setView("pclouds")} />;
  }

  // PClouds dashboard with prop to go back to Klusters
  return <PCloudsOriginalDashboard onSwitchDashboard={() => setView("klusters")} />;
};

export default DashboardRouter;