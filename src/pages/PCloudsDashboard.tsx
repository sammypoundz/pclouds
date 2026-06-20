// src/pages/PCloudsDashboard.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  FiGlobe, FiServer, FiKey, FiLayers, FiCommand, FiBox,
  FiCheckCircle, FiZap, FiDollarSign, FiPlus,
  FiXCircle, FiRefreshCw, FiBookOpen,
  FiArrowLeft, FiX, FiEdit, FiTrash2, FiDownload,
  FiSettings, FiLogOut, FiUser, FiCpu, FiClock,
  FiActivity, FiChevronDown, FiChevronUp,
  FiCpu as FiCpuIcon, FiSearch,
} from "react-icons/fi";
import { useAuth, useToast, initializePaystack } from "../shared";
import { motion, AnimatePresence } from "framer-motion";

// ---------- Types ----------
interface PCloudsDomain {
  id: string;
  name: string;
  status: "active" | "expired" | "pending";
  expiresAt: string;
  registeredAt: string;
  registrar: string;
  dns: string[];
  autoRenew: boolean;
  price: number;
  tld: string;
}

interface HostingPlan {
  id: string;
  name: string;
  status: "active" | "suspended" | "pending";
  sites: number;
  storage: string;
  ram: string;
  price: number;
  nextBilling: string;
  serverLocation: string;
  phpVersion: string;
  nodeVersion: string;
  diskUsage: string;
  bandwidth: string;
}

interface ApiKey {
  id: string;
  name: string;
  status: "active" | "revoked" | "pending";
  usage: string;
  cost: string;
  provider: string;
  rateLimit: string;
  endpoints: string[];
  created: string;
}

interface LibraryItem {
  id: string;
  title: string;
  type: "boilerplate" | "sdk" | "dashboard" | "template";
  status: "purchased" | "downloaded";
  purchasedAt: string;
  price: number;
  description: string;
  downloadUrl: string;
  version: string;
  rating: number;
  downloads: number;
}

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  pricePer1kTokens: number;
  status: "active" | "beta" | "coming_soon";
  totalTokens: number;
  calls: number;
  cost: number;
  lastUsed: string;
}

interface AICallLog {
  id: string;
  modelId: string;
  timestamp: string;
  tokens: number;
  cost: number;
  status: "success" | "failed" | "pending";
  responseTime: number;
  feedback?: "positive" | "negative" | "neutral";
  networkLogs: string[];
  prompt: string;
  response: string;
}

interface CreditTransaction {
  id: string;
  amount: number;
  type: "purchase" | "usage" | "refund";
  description: string;
  date: string;
}

// ---------- Mock Data ----------
const mockDomains: PCloudsDomain[] = [
  { id: "d1", name: "my-startup.com", status: "active", expiresAt: "2026-04-01", registeredAt: "2025-03-01", registrar: "Namecheap", dns: ["ns1.cloudflare.com", "ns2.cloudflare.com"], autoRenew: true, price: 12.99, tld: ".com" },
  { id: "d2", name: "mybrand.ng", status: "active", expiresAt: "2026-05-15", registeredAt: "2025-04-10", registrar: "GoDaddy", dns: ["ns1.godaddy.com"], autoRenew: false, price: 8.99, tld: ".ng" },
  { id: "d3", name: "myafrica.africa", status: "pending", expiresAt: "2026-06-01", registeredAt: "2025-05-01", registrar: "Namecheap", dns: ["ns1.namecheap.com"], autoRenew: true, price: 15.99, tld: ".africa" },
];

const mockHosting: HostingPlan[] = [
  { id: "h1", name: "Starter", status: "active", sites: 1, storage: "10GB", ram: "1GB", price: 4.99, nextBilling: "2025-06-01", serverLocation: "Johannesburg, ZA", phpVersion: "8.2", nodeVersion: "18.x", diskUsage: "3.2 GB", bandwidth: "100 GB" },
  { id: "h2", name: "Pro", status: "active", sites: 10, storage: "50GB", ram: "4GB", price: 14.99, nextBilling: "2025-05-15", serverLocation: "London, UK", phpVersion: "8.2", nodeVersion: "20.x", diskUsage: "12.4 GB", bandwidth: "500 GB" },
];

const mockApis: ApiKey[] = [
  { id: "a1", name: "SMS API", status: "active", usage: "1,234 msgs", cost: "$6.17", provider: "AfricaSMS", rateLimit: "100/min", endpoints: ["/send", "/balance"], created: "2025-02-10" },
  { id: "a2", name: "WhatsApp API", status: "active", usage: "567 msgs", cost: "$5.67", provider: "Meta", rateLimit: "50/min", endpoints: ["/messages", "/templates"], created: "2025-03-01" },
];

const mockLibrary: LibraryItem[] = [
  { id: "l1", title: "Admin Dashboard", type: "dashboard", status: "purchased", purchasedAt: "2025-04-01", price: 49, description: "Full-featured admin dashboard with user management and analytics.", version: "2.1.0", downloadUrl: "#", rating: 4.8, downloads: 1240 },
  { id: "l2", title: "Node.js Boilerplate", type: "boilerplate", status: "downloaded", purchasedAt: "2025-03-15", price: 19, description: "REST API boilerplate with JWT authentication and MongoDB.", version: "1.0.0", downloadUrl: "#", rating: 4.5, downloads: 890 },
  { id: "l3", title: "React Native SDK", type: "sdk", status: "purchased", purchasedAt: "2025-04-10", price: 39, description: "Mobile SDK for React Native with authentication and push notifications.", version: "1.2.0", downloadUrl: "#", rating: 4.7, downloads: 560 },
];

const mockAIModels: AIModel[] = [
  { id: "ai1", name: "GPT-4 Turbo", provider: "OpenAI", description: "Most capable model, great for complex reasoning.", pricePer1kTokens: 0.03, status: "active", totalTokens: 2300000, calls: 342, cost: 69.00, lastUsed: "2025-04-14" },
  { id: "ai2", name: "Claude 3 Opus", provider: "Anthropic", description: "Excellent for nuanced tasks and long context.", pricePer1kTokens: 0.02, status: "active", totalTokens: 1800000, calls: 189, cost: 36.00, lastUsed: "2025-04-13" },
  { id: "ai3", name: "Gemini Pro", provider: "Google", description: "Fast and efficient, good for everyday tasks.", pricePer1kTokens: 0.01, status: "beta", totalTokens: 0, calls: 0, cost: 0, lastUsed: "" },
  { id: "ai4", name: "Llama 3", provider: "Meta", description: "Open-source model with strong performance.", pricePer1kTokens: 0.005, status: "coming_soon", totalTokens: 0, calls: 0, cost: 0, lastUsed: "" },
];

// Available hosting plans (for upgrades)
const availablePlans: HostingPlan[] = [
  { id: "avail1", name: "Starter", status: "pending", sites: 1, storage: "10GB", ram: "1GB", price: 4.99, nextBilling: "2025-07-01", serverLocation: "Johannesburg, ZA", phpVersion: "8.2", nodeVersion: "18.x", diskUsage: "N/A", bandwidth: "100 GB" },
  { id: "avail2", name: "Pro", status: "pending", sites: 10, storage: "50GB", ram: "4GB", price: 14.99, nextBilling: "2025-07-01", serverLocation: "London, UK", phpVersion: "8.2", nodeVersion: "20.x", diskUsage: "N/A", bandwidth: "500 GB" },
  { id: "avail3", name: "Business", status: "pending", sites: 100, storage: "200GB", ram: "8GB", price: 29.99, nextBilling: "2025-07-01", serverLocation: "New York, US", phpVersion: "8.3", nodeVersion: "20.x", diskUsage: "N/A", bandwidth: "1 TB" },
];

// Generate AI call logs
const generateAICallLogs = (modelId: string): AICallLog[] => {
  const logs: AICallLog[] = [];
  const now = Date.now();
  const statuses: ("success" | "failed" | "pending")[] = ["success", "success", "success", "success", "failed", "success"];
  const feedbacks: ("positive" | "negative" | "neutral")[] = ["positive", "positive", "neutral", "negative", "positive", "positive"];
  const prompts = [
    "Explain quantum computing in simple terms.",
    "Write a Python function to sort a list.",
    "What is the capital of Kenya?",
    "Generate a business plan for a startup.",
    "Summarize this article about AI.",
    "Translate 'Hello' to Swahili.",
  ];
  const responses = [
    "Quantum computing uses qubits...",
    "def sort_list(lst): return sorted(lst)",
    "The capital of Kenya is Nairobi.",
    "Business plan: Executive summary...",
    "AI is transforming industries...",
    "Hello in Swahili is 'Habari'.",
  ];
  const networkLogs = [
    "Connection established to api.openai.com",
    "Request headers: Authorization: Bearer sk-...",
    "Response received in 1.2s",
    "Tokens used: 150",
    "No retries needed",
  ];
  for (let i = 0; i < 50; i++) {
    const timestamp = new Date(now - i * 3600000).toISOString();
    const tokens = Math.floor(Math.random() * 500) + 100;
    const cost = (tokens / 1000) * (0.03);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const feedback = feedbacks[Math.floor(Math.random() * feedbacks.length)];
    logs.push({
      id: `log_${modelId}_${i}`,
      modelId,
      timestamp,
      tokens,
      cost,
      status,
      responseTime: Math.floor(Math.random() * 2000) + 200,
      feedback: status === "success" ? feedback : undefined,
      networkLogs: networkLogs.slice(0, Math.floor(Math.random() * 3) + 1),
      prompt: prompts[Math.floor(Math.random() * prompts.length)],
      response: responses[Math.floor(Math.random() * responses.length)],
    });
  }
  return logs.sort((a, b) => a.timestamp.localeCompare(b.timestamp)).slice(0, 30);
};

const mockTransactions: CreditTransaction[] = [
  { id: "t1", amount: 25, type: "purchase", description: "Purchased $25 credits", date: "2025-04-10" },
  { id: "t2", amount: -2.5, type: "usage", description: "GPT-4 API usage", date: "2025-04-11" },
  { id: "t3", amount: 10, type: "purchase", description: "Promotional credit", date: "2025-04-12" },
  { id: "t4", amount: -0.8, type: "usage", description: "Claude 3 API usage", date: "2025-04-13" },
  { id: "t5", amount: -1.2, type: "usage", description: "GPT-4 API usage", date: "2025-04-14" },
];

// ---------- Main Component ----------
export const PCloudsOriginalDashboard = ({ onSwitchDashboard }: { onSwitchDashboard?: () => void }) => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();

  const [activeModule, setActiveModule] = useState("domains");
  const [credits, setCredits] = useState(25.5);
  const contentRef = useRef<HTMLDivElement>(null);

  // Data state
  const [domains, setDomains] = useState<PCloudsDomain[]>([]);
  const [hosting, setHosting] = useState<HostingPlan[]>([]);
  const [apis, setApis] = useState<ApiKey[]>([]);
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [aiModels, setAIModels] = useState<AIModel[]>([]);
  const [_aiLogs, setAILogs] = useState<AICallLog[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);

  // Detail panel
  const [selectedService, setSelectedService] = useState<{
    type: "domain" | "hosting" | "api" | "library" | "ai";
    item: any;
  } | null>(null);

  // ----- New modals state -----
  const [showBuyDomain, setShowBuyDomain] = useState(false);
  const [domainSearch, setDomainSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<any>(null);

  const [showUpgradeHosting, setShowUpgradeHosting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<HostingPlan | null>(null);

  const [showConfirmAction, setShowConfirmAction] = useState<{
    action: string;
    item: any;
    onConfirm: () => void;
  } | null>(null);

  const [showApiKey, setShowApiKey] = useState<{ key: string; model: string } | null>(null);

  // Scroll to content on module change
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeModule]);

  // Fetch data per module
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeModule === "services") {
          setDomains(mockDomains);
          setHosting(mockHosting);
          setLibrary(mockLibrary);
          setAIModels(mockAIModels);
        }
        if (activeModule === "api") {
          setApis(mockApis);
          setAIModels(mockAIModels);
          setTransactions(mockTransactions);
          setCredits(25.5);
          setAILogs(generateAICallLogs("ai1"));
        }
        if (activeModule === "domains") {
          setDomains(mockDomains);
        }
        if (activeModule === "library") {
          setLibrary(mockLibrary);
        }
      } catch (err) {
        console.error(err);
        addToast("error", "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeModule, addToast]);

  // ---------- Credit Purchase ----------
  const handleAddCredits = async () => {
    if (!user?.email) {
      addToast("error", "Please sign in to purchase credits");
      return;
    }
    try {
      await initializePaystack({
        email: user.email,
        amount: 1000,
        currency: "NGN",
        metadata: { purpose: "credit_purchase" },
        onSuccess: (reference) => {
          addToast("success", `Credits added! Reference: ${reference}`);
          setCredits(prev => prev + 10);
          setTransactions(prev => [
            {
              id: `t${Date.now()}`,
              amount: 10,
              type: "purchase",
              description: "Purchased $10 credits",
              date: new Date().toISOString().slice(0, 10),
            },
            ...prev,
          ]);
        },
        onCancel: () => addToast("info", "Payment cancelled"),
      });
    } catch (error) {
      console.error("Paystack error:", error);
      addToast("error", "Payment failed");
    }
  };

  // ---------- UI Helpers ----------
  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, string> = {
      active: "bg-green-500/20 text-green-400",
      expired: "bg-red-500/20 text-red-400",
      suspended: "bg-red-500/20 text-red-400",
      pending: "bg-yellow-500/20 text-yellow-400",
      revoked: "bg-gray-500/20 text-gray-400",
      purchased: "bg-blue-500/20 text-blue-400",
      downloaded: "bg-indigo-500/20 text-indigo-400",
      beta: "bg-purple-500/20 text-purple-400",
      coming_soon: "bg-gray-500/20 text-gray-400",
      success: "bg-green-500/20 text-green-400",
      failed: "bg-red-500/20 text-red-400",
    };

    const icons: Record<string, React.ReactNode> = {
      active: <FiCheckCircle className="inline mr-1" />,
      expired: <FiXCircle className="inline mr-1" />,
      suspended: <FiXCircle className="inline mr-1" />,
      pending: <FiRefreshCw className="inline mr-1 animate-spin" />,
      revoked: <FiXCircle className="inline mr-1" />,
      purchased: <FiCheckCircle className="inline mr-1" />,
      downloaded: <FiCheckCircle className="inline mr-1" />,
      beta: <FiZap className="inline mr-1" />,
      coming_soon: <FiClock className="inline mr-1" />,
      success: <FiCheckCircle className="inline mr-1" />,
      failed: <FiXCircle className="inline mr-1" />,
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full ${colors[status] || "bg-gray-500/20 text-gray-400"}`}>
        {icons[status]} {status}
      </span>
    );
  };

  // ---------- Action Handlers ----------
  const handleBuyDomain = async () => {
    if (!selectedDomain) return;
    addToast("info", `Purchasing ${selectedDomain.name}...`);
    setTimeout(() => {
      addToast("success", `Domain ${selectedDomain.name} purchased!`);
      setShowBuyDomain(false);
      setSelectedDomain(null);
      setDomainSearch("");
      setSearchResults([]);
    }, 1500);
  };

  const handleRenewDomain = (domain: PCloudsDomain) => {
    setShowConfirmAction({
      action: `Renew ${domain.name}`,
      item: domain,
      onConfirm: () => {
        addToast("success", `Domain ${domain.name} renewed!`);
        setShowConfirmAction(null);
      },
    });
  };

  const handleTransferDomain = (domain: PCloudsDomain) => {
    addToast("info", `Transfer flow for ${domain.name} would open here`);
  };

  const handleDeleteDomain = (domain: PCloudsDomain) => {
    setShowConfirmAction({
      action: `Delete ${domain.name}`,
      item: domain,
      onConfirm: () => {
        setDomains(prev => prev.filter(d => d.id !== domain.id));
        addToast("success", `Domain ${domain.name} deleted`);
        setShowConfirmAction(null);
      },
    });
  };

  const handleManageDNS = (domain: PCloudsDomain) => {
    addToast("info", `DNS management for ${domain.name} would open here`);
  };

  const handleUpgradeHosting = (plan: HostingPlan) => {
    setShowUpgradeHosting(true);
    setSelectedPlan(plan);
  };

  const confirmUpgrade = () => {
    if (!selectedPlan) return;
    addToast("success", `Upgraded to ${selectedPlan.name} plan!`);
    setShowUpgradeHosting(false);
    setSelectedPlan(null);
  };

  const handleGenerateApiKey = (model: AIModel) => {
    const key = `sk-${model.id}-${Math.random().toString(36).substring(2, 15)}`;
    setShowApiKey({ key, model: model.name });
  };

  const handleDownloadLibrary = (item: LibraryItem) => {
    addToast("success", `Downloading ${item.title}...`);
  };

  const handleRemoveLibrary = (item: LibraryItem) => {
    setShowConfirmAction({
      action: `Remove ${item.title}`,
      item: item,
      onConfirm: () => {
        setLibrary(prev => prev.filter(l => l.id !== item.id));
        addToast("success", `${item.title} removed`);
        setShowConfirmAction(null);
      },
    });
  };

  // ---------- Detail Panels ----------
  const DomainDetail = ({ domain }: { domain: PCloudsDomain }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">{domain.name}</h3>
        <StatusBadge status={domain.status} />
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="text-gray-400">Registered</div>
        <div className="text-white">{domain.registeredAt}</div>
        <div className="text-gray-400">Expires</div>
        <div className="text-white">{domain.expiresAt}</div>
        <div className="text-gray-400">Registrar</div>
        <div className="text-white">{domain.registrar}</div>
        <div className="text-gray-400">TLD</div>
        <div className="text-white">{domain.tld}</div>
        <div className="text-gray-400">Price (annual)</div>
        <div className="text-white">${domain.price.toFixed(2)}</div>
        <div className="text-gray-400">Auto‑Renew</div>
        <div className="text-white">{domain.autoRenew ? "Enabled" : "Disabled"}</div>
        <div className="text-gray-400">DNS Servers</div>
        <div className="text-white text-xs">{domain.dns.join(", ")}</div>
      </div>
      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-700">
        <button onClick={() => handleManageDNS(domain)} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <FiEdit /> Manage DNS
        </button>
        <button onClick={() => handleRenewDomain(domain)} className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <FiRefreshCw /> Renew (${domain.price.toFixed(2)})
        </button>
        <button onClick={() => handleTransferDomain(domain)} className="border border-gray-700 hover:bg-gray-800 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <FiGlobe /> Transfer
        </button>
        <button onClick={() => handleDeleteDomain(domain)} className="text-red-400 border border-red-400/30 hover:bg-red-500/10 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <FiTrash2 /> Delete
        </button>
      </div>
    </div>
  );

  const HostingDetail = ({ plan }: { plan: HostingPlan }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">{plan.name}</h3>
        <StatusBadge status={plan.status} />
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="text-gray-400">Price</div>
        <div className="text-white">${plan.price.toFixed(2)}/month</div>
        <div className="text-gray-400">Sites</div>
        <div className="text-white">{plan.sites}</div>
        <div className="text-gray-400">Storage</div>
        <div className="text-white">{plan.storage}</div>
        <div className="text-gray-400">RAM</div>
        <div className="text-white">{plan.ram}</div>
        <div className="text-gray-400">Bandwidth</div>
        <div className="text-white">{plan.bandwidth}</div>
        <div className="text-gray-400">Disk Usage</div>
        <div className="text-white">{plan.diskUsage}</div>
        <div className="text-gray-400">Server Location</div>
        <div className="text-white">{plan.serverLocation}</div>
        <div className="text-gray-400">PHP Version</div>
        <div className="text-white">{plan.phpVersion}</div>
        <div className="text-gray-400">Node.js Version</div>
        <div className="text-white">{plan.nodeVersion}</div>
        <div className="text-gray-400">Next Billing</div>
        <div className="text-white">{plan.nextBilling}</div>
      </div>
      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-700">
        <button onClick={() => addToast("info", "Manage hosting flow coming soon")} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <FiEdit /> Manage
        </button>
        <button onClick={() => handleUpgradeHosting(plan)} className="bg-yellow-600 hover:bg-yellow-500 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <FiZap /> Upgrade
        </button>
        <button onClick={() => setShowConfirmAction({ action: `Cancel ${plan.name}`, item: plan, onConfirm: () => { addToast("success", `${plan.name} cancelled`); setShowConfirmAction(null); } })} className="text-red-400 border border-red-400/30 hover:bg-red-500/10 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <FiTrash2 /> Cancel
        </button>
      </div>
    </div>
  );

  const ApiDetail = ({ api }: { api: ApiKey }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">{api.name}</h3>
        <StatusBadge status={api.status} />
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="text-gray-400">Provider</div>
        <div className="text-white">{api.provider}</div>
        <div className="text-gray-400">Usage</div>
        <div className="text-white">{api.usage}</div>
        <div className="text-gray-400">Cost</div>
        <div className="text-white">{api.cost}</div>
        <div className="text-gray-400">Rate Limit</div>
        <div className="text-white">{api.rateLimit}</div>
        <div className="text-gray-400">Created</div>
        <div className="text-white">{api.created}</div>
        <div className="text-gray-400">Endpoints</div>
        <div className="text-white text-xs">{api.endpoints.join(", ")}</div>
      </div>
      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-700">
        <button onClick={() => addToast("info", "Regenerate key flow")} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <FiKey /> Regenerate Key
        </button>
        <button onClick={() => addToast("info", "Usage details")} className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <FiDollarSign /> View Usage
        </button>
        <button onClick={() => setShowConfirmAction({ action: `Revoke ${api.name}`, item: api, onConfirm: () => { addToast("success", `${api.name} revoked`); setShowConfirmAction(null); } })} className="text-red-400 border border-red-400/30 hover:bg-red-500/10 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <FiXCircle /> Revoke
        </button>
      </div>
    </div>
  );

  const LibraryDetail = ({ item }: { item: LibraryItem }) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">{item.title}</h3>
        <StatusBadge status={item.status} />
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="text-gray-400">Type</div>
        <div className="text-white capitalize">{item.type}</div>
        <div className="text-gray-400">Price</div>
        <div className="text-white">${item.price.toFixed(2)}</div>
        <div className="text-gray-400">Purchased</div>
        <div className="text-white">{item.purchasedAt}</div>
        <div className="text-gray-400">Version</div>
        <div className="text-white">{item.version}</div>
        <div className="text-gray-400">Rating</div>
        <div className="text-white">{item.rating} ⭐</div>
        <div className="text-gray-400">Downloads</div>
        <div className="text-white">{item.downloads.toLocaleString()}</div>
        <div className="text-gray-400">Description</div>
        <div className="text-white text-sm">{item.description}</div>
      </div>
      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-700">
        <button onClick={() => handleDownloadLibrary(item)} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <FiDownload /> Download
        </button>
        <button onClick={() => addToast("info", "Documentation will open")} className="border border-gray-700 hover:bg-gray-800 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <FiBookOpen /> View Docs
        </button>
        <button onClick={() => handleRemoveLibrary(item)} className="text-red-400 border border-red-400/30 hover:bg-red-500/10 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <FiTrash2 /> Remove
        </button>
      </div>
    </div>
  );

  const AIModelDetail = ({ model }: { model: AIModel }) => {
    const [logs, setLogs] = useState<AICallLog[]>([]);
    const [showNetworkLogs, setShowNetworkLogs] = useState(false);

    useEffect(() => {
      setLogs(generateAICallLogs(model.id));
    }, [model.id]);

    const totalCalls = logs.length;
    const successCalls = logs.filter(l => l.status === "success").length;
    const totalCost = logs.reduce((sum, l) => sum + l.cost, 0);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">{model.name}</h3>
          <StatusBadge status={model.status} />
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-gray-400">Provider</div>
          <div className="text-white">{model.provider}</div>
          <div className="text-gray-400">Description</div>
          <div className="text-white text-sm">{model.description}</div>
          <div className="text-gray-400">Price (per 1k tokens)</div>
          <div className="text-white">${model.pricePer1kTokens.toFixed(3)}</div>
          <div className="text-gray-400">Total Tokens</div>
          <div className="text-white">{model.totalTokens.toLocaleString()}</div>
          <div className="text-gray-400">Total Calls</div>
          <div className="text-white">{model.calls}</div>
          <div className="text-gray-400">Total Cost</div>
          <div className="text-white">${model.cost.toFixed(2)}</div>
          <div className="text-gray-400">Last Used</div>
          <div className="text-white">{model.lastUsed || "Never"}</div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-800/30 rounded-lg p-3 text-center">
            <div className="text-gray-400 text-xs">Total Calls</div>
            <div className="text-xl font-bold">{totalCalls}</div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-3 text-center">
            <div className="text-gray-400 text-xs">Success Rate</div>
            <div className="text-xl font-bold text-green-400">{totalCalls > 0 ? Math.round((successCalls/totalCalls)*100) : 0}%</div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-3 text-center">
            <div className="text-gray-400 text-xs">Total Cost</div>
            <div className="text-xl font-bold text-yellow-400">${totalCost.toFixed(2)}</div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <FiActivity className="text-blue-400" /> Recent Calls
          </h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.slice(0, 20).map(log => (
              <div key={log.id} className="bg-gray-800/30 rounded-lg p-3 text-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={log.status} />
                      <span className="text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-300 mt-1 line-clamp-2">{log.prompt}</p>
                    <div className="flex gap-4 mt-1 text-xs text-gray-500">
                      <span>Tokens: {log.tokens}</span>
                      <span>Cost: ${log.cost.toFixed(4)}</span>
                      <span>Response: {log.responseTime}ms</span>
                      {log.feedback && <span>Feedback: {log.feedback} 👍</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowNetworkLogs(!showNetworkLogs)}
                    className="text-gray-400 hover:text-white text-xs"
                  >
                    {showNetworkLogs ? "Hide" : "Show"} Network Logs
                  </button>
                </div>
                {showNetworkLogs && (
                  <div className="mt-2 bg-black/30 rounded p-2 text-xs font-mono text-gray-400 overflow-x-auto">
                    {log.networkLogs.map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                    <div className="text-gray-500">Response: {log.response}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-700">
          <button onClick={() => handleGenerateApiKey(model)} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            <FiKey /> Generate API Key
          </button>
          <button onClick={() => addToast("info", "AI Playground coming soon")} className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            <FiZap /> Test in Playground
          </button>
          <button onClick={() => addToast("info", "Documentation will open")} className="border border-gray-700 hover:bg-gray-800 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
            <FiBookOpen /> View Docs
          </button>
        </div>
      </div>
    );
  };

  // ---------- Main Render Helpers ----------
  const renderDetailPanel = () => {
    if (!selectedService) return null;
    const { type, item } = selectedService;
    let content = null;
    let title = "";
    switch (type) {
      case "domain":
        content = <DomainDetail domain={item} />;
        title = "Domain Details";
        break;
      case "hosting":
        content = <HostingDetail plan={item} />;
        title = "Hosting Plan Details";
        break;
      case "api":
        content = <ApiDetail api={item} />;
        title = "API Key Details";
        break;
      case "library":
        content = <LibraryDetail item={item} />;
        title = "Library Item Details";
        break;
      case "ai":
        content = <AIModelDetail model={item} />;
        title = "AI Model Details";
        break;
    }
    return (
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed inset-y-0 right-0 w-full md:w-2/3 lg:w-1/2 xl:w-2/5 bg-gray-900 border-l border-gray-800 shadow-2xl z-50 overflow-y-auto p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedService(null)}
              className="text-gray-400 hover:text-white transition"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
          <button
            onClick={() => setSelectedService(null)}
            className="text-gray-400 hover:text-white transition"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>
        <div className="bg-gray-800/30 rounded-xl p-5">{content}</div>
      </motion.div>
    );
  };

  // ---------- API Marketplace (includes AI Models + Credits) ----------
  const renderAPIMarketplace = () => {
    if (loading) return <div className="text-center py-8 text-gray-400">Loading...</div>;

    const totalPurchased = transactions.filter(t => t.type === "purchase").reduce((sum, t) => sum + t.amount, 0);
    const totalUsage = transactions.filter(t => t.type === "usage").reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const remaining = credits;

    return (
      <div className="space-y-8">
        {/* Credit Summary */}
        <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl p-6 border border-gray-800">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FiDollarSign className="text-yellow-400" /> Credit Balance
              </h3>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-3xl font-bold text-blue-400">${credits.toFixed(2)}</span>
                <span className="text-sm text-gray-400">remaining</span>
              </div>
            </div>
            <button
              onClick={handleAddCredits}
              className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-lg text-sm flex items-center gap-2"
            >
              <FiPlus /> Buy Credits
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
            <div className="bg-gray-900/30 rounded-lg p-3">
              <div className="text-gray-400">Total Purchased</div>
              <div className="text-lg font-semibold text-green-400">${totalPurchased.toFixed(2)}</div>
            </div>
            <div className="bg-gray-900/30 rounded-lg p-3">
              <div className="text-gray-400">Total Usage</div>
              <div className="text-lg font-semibold text-yellow-400">${totalUsage.toFixed(2)}</div>
            </div>
            <div className="bg-gray-900/30 rounded-lg p-3">
              <div className="text-gray-400">Remaining</div>
              <div className="text-lg font-semibold text-blue-400">${remaining.toFixed(2)}</div>
            </div>
          </div>
          <div className="mt-4 border-t border-gray-700 pt-3">
            <button
              onClick={() => setShowTransactions(!showTransactions)}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
            >
              {showTransactions ? <FiChevronUp /> : <FiChevronDown />}
              {showTransactions ? "Hide" : "Show"} Transaction Audit Log
            </button>
            {showTransactions && (
              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                {transactions.length === 0 ? (
                  <p className="text-gray-500 text-sm">No transactions yet.</p>
                ) : (
                  transactions.map(tx => (
                    <div key={tx.id} className="flex justify-between items-center p-2 rounded-lg bg-gray-800/30 text-sm">
                      <div>
                        <div className="font-medium">{tx.description}</div>
                        <div className="text-xs text-gray-500">{tx.date}</div>
                      </div>
                      <div className={`font-semibold ${tx.type === "purchase" ? "text-green-400" : tx.type === "refund" ? "text-blue-400" : "text-red-400"}`}>
                        {tx.type === "purchase" ? "+" : tx.type === "refund" ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* AI Models */}
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <FiCpu className="text-purple-400" /> AI Models
          </h3>
          {aiModels.length === 0 ? (
            <p className="text-gray-500 text-sm">No AI models available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiModels.map(model => (
                <div
                  key={model.id}
                  onClick={() => setSelectedService({ type: "ai", item: model })}
                  className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 cursor-pointer hover:border-blue-500/50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg">{model.name}</h4>
                      <p className="text-xs text-gray-400">{model.provider}</p>
                    </div>
                    <StatusBadge status={model.status} />
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{model.description}</p>
                  <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                    <span>${model.pricePer1kTokens.toFixed(3)} / 1k tokens</span>
                    <span>Usage: {model.totalTokens.toLocaleString()} tokens</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Traditional APIs */}
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <FiKey className="text-yellow-400" /> Traditional APIs
          </h3>
          {apis.length === 0 ? (
            <p className="text-gray-500 text-sm">No APIs available.</p>
          ) : (
            <div className="space-y-3">
              {apis.map(api => (
                <div
                  key={api.id}
                  onClick={() => setSelectedService({ type: "api", item: api })}
                  className="flex flex-wrap items-center justify-between p-4 rounded-xl border border-gray-800 bg-gray-900/30 hover:bg-gray-800/30 cursor-pointer transition"
                >
                  <div>
                    <div className="font-medium">{api.name}</div>
                    <div className="text-xs text-gray-500">{api.provider} • {api.usage} • {api.cost}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={api.status} />
                    <FiArrowLeft className="w-4 h-4 text-gray-500 rotate-180" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ---------- Developer Library Module ----------
  const renderLibrary = () => {
    if (loading) return <div className="text-center py-8 text-gray-400">Loading library...</div>;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <FiBookOpen className="text-orange-400" /> Developer Library
          </h3>
          <button
            onClick={() => addToast("info", "More items coming soon")}
            className="text-sm text-blue-400 hover:underline"
          >
            Browse All →
          </button>
        </div>

        {library.length === 0 ? (
          <p className="text-gray-500">No library items yet. Purchase some from the marketplace.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {library.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedService({ type: "library", item })}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-orange-500/50 transition group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold">{item.title}</h4>
                    <p className="text-xs text-gray-400 capitalize">{item.type}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-sm text-gray-400 mt-2 line-clamp-2">{item.description}</p>
                <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                  <span>${item.price.toFixed(2)}</span>
                  <span>⭐ {item.rating} • {item.downloads.toLocaleString()} downloads</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ---------- My Services ----------
  const renderServices = () => {
    if (loading) return <div className="text-center py-8 text-gray-400">Loading services...</div>;

    const ServiceCard = ({ icon, title, items, type }: any) => (
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          {icon} {title} <span className="text-sm text-gray-400 ml-auto">{items.length}</span>
        </h3>
        {items.length === 0 ? (
          <p className="text-gray-500 text-sm">No {title.toLowerCase()} yet.</p>
        ) : (
          <div className="space-y-2">
            {items.map((item: any) => {
              let displayName = item.name || item.title;
              let subtitle = "";
              if (type === "domain") subtitle = `Expires: ${item.expiresAt} • $${item.price.toFixed(2)}/yr`;
              else if (type === "hosting") subtitle = `${item.sites} sites • ${item.storage} • $${item.price.toFixed(2)}/mo`;
              else if (type === "ai") subtitle = `${item.totalTokens.toLocaleString()} tokens • $${item.cost.toFixed(2)} used`;
              else if (type === "library") subtitle = `${item.type} • $${item.price.toFixed(2)} • ${item.purchasedAt}`;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedService({ type, item })}
                  className="flex justify-between items-center p-3 rounded-lg bg-gray-800/30 cursor-pointer hover:bg-gray-700/50 transition"
                >
                  <div>
                    <div className="font-medium">{displayName}</div>
                    <div className="text-xs text-gray-500">{subtitle}</div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              );
            })}
          </div>
        )}
        <button
          className="mt-4 text-blue-400 text-sm flex items-center gap-1 hover:underline"
          onClick={() => {
            if (type === "domain") setShowBuyDomain(true);
            else if (type === "hosting") setActiveModule("hosting");
            else if (type === "ai") setActiveModule("api");
            else if (type === "library") setActiveModule("library");
          }}
        >
          <FiPlus />{" "}
          {type === "domain"
            ? "Buy new domain"
            : type === "hosting"
            ? "Upgrade plan"
            : type === "ai"
            ? "Explore AI models"
            : "Explore library"}
        </button>
      </div>
    );

    return (
      <div className="space-y-6">
        <p className="text-gray-400 text-sm">
          All services you have purchased or activated on PCLOUDs.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ServiceCard
            icon={<FiGlobe className="text-green-400" />}
            title="Domains"
            items={domains}
            type="domain"
          />
          <ServiceCard
            icon={<FiServer className="text-blue-400" />}
            title="Hosting"
            items={hosting}
            type="hosting"
          />
          <ServiceCard
            icon={<FiCpuIcon className="text-purple-400" />}
            title="AI Models"
            items={aiModels}
            type="ai"
          />
          <ServiceCard
            icon={<FiBookOpen className="text-orange-400" />}
            title="Library"
            items={library}
            type="library"
          />
        </div>
      </div>
    );
  };

  // ---------- Main Modules ----------
  const modules = [
    { id: "domains", name: "Domains", icon: FiGlobe, color: "green" },
    { id: "hosting", name: "Hosting", icon: FiServer, color: "blue" },
    { id: "api", name: "API Marketplace", icon: FiKey, color: "purple" },
    { id: "library", name: "Developer Library", icon: FiLayers, color: "orange" },
    { id: "cli", name: "CLI Tool", icon: FiCommand, color: "gray" },
    { id: "deploy", name: "Deployment Console", icon: FiBox, color: "cyan" },
    { id: "services", name: "My Services", icon: FiLayers, color: "teal" },
  ];

  // ---------- Handle Logout ----------
  const handleLogout = () => {
    logout();
    addToast("success", "Logged out successfully");
  };

  // ---------- Render ----------
  return (
    <div className="space-y-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-md border-b border-gray-800 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">PClouds Dashboard</h2>
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">v2</span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto flex-nowrap max-w-full md:max-w-none scrollbar-hide">
            {modules.map((mod) => (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  activeModule === mod.id
                    ? `bg-${mod.color}-500/20 text-${mod.color}-400 border border-${mod.color}-500/30`
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <mod.icon className="inline mr-1 w-3 h-3" />
                {mod.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {onSwitchDashboard && (
              <button
                onClick={onSwitchDashboard}
                className="text-sm bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition font-medium"
              >
                Go to Klusters
              </button>
            )}
            <button
              onClick={() => addToast("info", "Settings page coming soon")}
              className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition"
              title="Settings"
            >
              <FiSettings className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-gray-800 transition"
              title="Logout"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
          <FiUser className="w-3 h-3" />
          <span>{user?.name || "User"} • {user?.email || "user@example.com"}</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-2xl p-6 border border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Africa's first developer cloud
            </h1>
            <p className="text-gray-300 mt-2 max-w-2xl">
              Build, deploy, scale faster — domains, hosting, APIs, and a developer marketplace unified for African developers.
            </p>
            <div className="flex gap-3 mt-4">
              <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium">
                Start Building →
              </button>
              <button className="border border-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-800">
                No credit card required
              </button>
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-xl p-3 font-mono text-xs border border-gray-800">
            <code>$ npx pclouds init my-app</code><br />
            <code>$ cd my-app</code><br />
            <code className="text-green-400">$ pclouds deploy --prod</code><br />
            <code className="text-blue-400">✅ Deployment ready in 12.3s</code><br />
            <code className="text-gray-400">→ https://my-app.pclouds.africa</code>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div ref={contentRef} className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
        {activeModule === "domains" && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Your Domains</h3>
            <div className="space-y-2">
              {domains.map(domain => (
                <div
                  key={domain.id}
                  onClick={() => setSelectedService({ type: "domain", item: domain })}
                  className="flex justify-between items-center p-3 rounded-lg bg-gray-800/30 cursor-pointer hover:bg-gray-700/50 transition"
                >
                  <div>
                    <span className="font-mono">{domain.name}</span>
                    <div className="text-xs text-gray-500">Expires: {domain.expiresAt} • ${domain.price.toFixed(2)}/yr</div>
                  </div>
                  <StatusBadge status={domain.status} />
                </div>
              ))}
              <button
                className="mt-2 text-blue-400 text-sm flex items-center gap-1 hover:underline"
                onClick={() => setShowBuyDomain(true)}
              >
                <FiPlus /> Buy new domain
              </button>
            </div>
          </div>
        )}

        {activeModule === "hosting" && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Hosting Plans</h3>
            <div className="grid md:grid-cols-3 gap-3">
              {availablePlans.map((plan) => {
                const isCurrentPlan = hosting.some(h => h.name === plan.name && h.status === "active");
                return (
                  <div
                    key={plan.id}
                    className={`p-4 rounded-xl border ${isCurrentPlan ? "border-blue-500 bg-blue-500/5" : "border-gray-800"}`}
                  >
                    <div className="font-bold">{plan.name}</div>
                    <div className="text-2xl font-bold mt-1">${plan.price}<span className="text-sm text-gray-400">/month</span></div>
                    <div className="text-xs text-gray-400 mt-1">{plan.sites} sites • {plan.storage} • {plan.ram} RAM</div>
                    <button
                      className={`mt-3 w-full py-1.5 rounded-lg text-sm ${isCurrentPlan ? "bg-blue-600 cursor-default" : "border border-gray-700 hover:bg-gray-700"}`}
                      onClick={() => {
                        if (isCurrentPlan) {
                          addToast("info", "You are already on this plan");
                          return;
                        }
                        setSelectedPlan(plan);
                        setShowUpgradeHosting(true);
                      }}
                    >
                      {isCurrentPlan ? "Current Plan" : "Select"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeModule === "api" && renderAPIMarketplace()}

        {activeModule === "library" && renderLibrary()}

        {activeModule === "cli" && (
          <div className="font-mono text-sm">
            <div className="bg-black/50 p-4 rounded-lg">
              <code>$ pcloud deploy</code><br />
              <code className="text-gray-400">→ Building your application...</code><br />
              <code className="text-gray-400">→ Deploying to edge network...</code><br />
              <code className="text-green-400">✓ Deployment complete (12.3s)</code><br />
              <code className="text-blue-400">→ https://my-app.pclouds.africa</code><br />
              <code>$ pcloud logs --tail</code><br />
              <code className="text-gray-500">pclouds-cli v1.0.0-beta connected</code>
            </div>
          </div>
        )}

        {activeModule === "deploy" && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Recent Deployments</h3>
              <button className="text-sm text-blue-400"><FiPlus /> New Deployment</button>
            </div>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-gray-800/30 flex justify-between">
                <div><span className="font-medium">my-app</span><div className="text-xs text-gray-500">my-app.pclouds.africa</div></div>
                <span className="text-green-400 text-xs">Ready</span>
              </div>
              <div className="p-3 rounded-lg bg-gray-800/30 flex justify-between">
                <div><span className="font-medium">api-backend</span><div className="text-xs text-gray-500">api-backend.pclouds.africa</div></div>
                <span className="text-green-400 text-xs">Ready</span>
              </div>
            </div>
          </div>
        )}

        {activeModule === "services" && renderServices()}
      </div>

      {/* Credits Quick Summary (global) */}
      <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl p-4 border border-gray-800 flex justify-between items-center">
        <div>
          <span className="text-gray-400">Available Credits</span>
          <div className="text-2xl font-bold">${credits.toFixed(2)}</div>
        </div>
        <button
          onClick={() => setActiveModule("api")}
          className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm"
        >
          Manage Credits
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm text-gray-400 pt-4 border-t border-gray-800">
        <div><span className="text-white font-bold">10,406+</span><br />Developers</div>
        <div><span className="text-white font-bold">38+</span><br />APIs available</div>
        <div><span className="text-white font-bold">205k+</span><br />Monthly deployments</div>
        <div><span className="text-white font-bold">99.99%</span><br />Uptime SLA</div>
      </div>

      {/* ---------- MODALS ---------- */}

      {/* Buy Domain Modal */}
      <AnimatePresence>
        {showBuyDomain && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => { setShowBuyDomain(false); setSearchResults([]); setDomainSearch(""); }}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-gray-900 border border-gray-800 rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Buy a Domain</h3>
                <button onClick={() => { setShowBuyDomain(false); setSearchResults([]); setDomainSearch(""); }} className="text-gray-400 hover:text-white">
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Search for a domain..."
                  value={domainSearch}
                  onChange={(e) => setDomainSearch(e.target.value)}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => {
                    if (!domainSearch.trim()) return;
                    const tlds = [".com", ".ng", ".africa", ".org", ".net"];
                    const results = tlds.map(tld => ({
                      name: domainSearch.trim() + tld,
                      price: (Math.random() * 15 + 5).toFixed(2),
                      available: Math.random() > 0.3,
                    }));
                    setSearchResults(results);
                  }}
                  className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FiSearch /> Search
                </button>
              </div>
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((result, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-gray-800/30">
                      <div>
                        <span className="font-medium">{result.name}</span>
                        <span className="text-xs text-gray-400 ml-2">${result.price}/yr</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {result.available ? (
                          <button
                            onClick={() => {
                              setSelectedDomain(result);
                              handleBuyDomain();
                            }}
                            className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded-lg text-sm"
                          >
                            Buy Now
                          </button>
                        ) : (
                          <span className="text-red-400 text-sm">Taken</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hosting Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeHosting && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => { setShowUpgradeHosting(false); setSelectedPlan(null); }}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-gray-900 border border-gray-800 rounded-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-2">Upgrade Hosting</h3>
              <p className="text-gray-400 text-sm mb-4">You are about to upgrade to <strong className="text-white">{selectedPlan.name}</strong> (${selectedPlan.price}/month).</p>
              <ul className="space-y-1 text-sm text-gray-300 mb-4">
                <li>✓ {selectedPlan.sites} sites</li>
                <li>✓ {selectedPlan.storage} storage</li>
                <li>✓ {selectedPlan.ram} RAM</li>
                <li>✓ {selectedPlan.bandwidth} bandwidth</li>
              </ul>
              <div className="flex gap-3 justify-end">
                <button onClick={() => { setShowUpgradeHosting(false); setSelectedPlan(null); }} className="px-4 py-2 rounded-lg border border-gray-700">Cancel</button>
                <button onClick={confirmUpgrade} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500">Confirm Upgrade</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Action Modal */}
      <AnimatePresence>
        {showConfirmAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmAction(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-gray-900 border border-gray-800 rounded-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-2">Confirm {showConfirmAction.action}</h3>
              <p className="text-gray-400 text-sm mb-4">Are you sure you want to proceed? This action cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowConfirmAction(null)} className="px-4 py-2 rounded-lg border border-gray-700">Cancel</button>
                <button onClick={showConfirmAction.onConfirm} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500">Confirm</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* API Key Display Modal */}
      <AnimatePresence>
        {showApiKey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowApiKey(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-gray-900 border border-gray-800 rounded-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-2">API Key Generated</h3>
              <p className="text-gray-400 text-sm mb-2">Your API key for <strong>{showApiKey.model}</strong>:</p>
              <div className="bg-gray-800 p-3 rounded-lg font-mono text-sm break-all text-blue-400 select-all">
                {showApiKey.key}
              </div>
              <p className="text-xs text-gray-500 mt-2">Copy this key and store it securely. You will not be able to see it again.</p>
              <div className="flex gap-3 justify-end mt-4">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(showApiKey.key);
                    addToast("success", "API key copied to clipboard!");
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500"
                >
                  Copy Key
                </button>
                <button onClick={() => setShowApiKey(null)} className="px-4 py-2 rounded-lg border border-gray-700">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Panel */}
      <AnimatePresence>{selectedService && renderDetailPanel()}</AnimatePresence>
    </div>
  );
};