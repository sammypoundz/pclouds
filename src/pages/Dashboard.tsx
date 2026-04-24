import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiBox,
  FiGlobe,
  FiServer,
  FiDatabase,
  FiKey,
  FiCreditCard,
  FiMenu,
  FiX,
  FiPlus,
  FiExternalLink,
  FiSettings,
  FiUser,
  FiChevronDown,
  FiCheckCircle,
  FiZap,
  FiShield,
} from "react-icons/fi";
import { Link } from "react-router-dom";

type Deployment = {
  id: string;
  name: string;
  url: string;
  status: "ready" | "deploying" | "failed";
  createdAt: string;
};

type Domain = {
  name: string;
  status: "active" | "pending";
  expiresAt?: string;
};

type Database = {
  id: string;
  name: string;
  type: "postgres" | "mysql" | "mongodb";
  status: "running" | "stopped";
  size: string;
};

type ApiKey = {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
};

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data
  const [deployments] = useState<Deployment[]>([
    { id: "1", name: "my-app", url: "my-app.pclouds.africa", status: "ready", createdAt: "2025-04-01" },
    { id: "2", name: "api-backend", url: "api-backend.pclouds.africa", status: "ready", createdAt: "2025-04-05" },
    { id: "3", name: "test-staging", url: "test-staging.pclouds.africa", status: "deploying", createdAt: "2025-04-10" },
  ]);

  const [domains] = useState<Domain[]>([
    { name: "my-startup.com", status: "active", expiresAt: "2026-04-01" },
    { name: "mybrand.ng", status: "active", expiresAt: "2026-05-15" },
  ]);

  const [databases] = useState<Database[]>([
    { id: "db1", name: "main-db", type: "postgres", status: "running", size: "1 GB" },
    { id: "db2", name: "cache-redis", type: "mongodb", status: "running", size: "512 MB" },
  ]);

  const [apiKeys] = useState<ApiKey[]>([
    { id: "key1", name: "Production Key", key: "pclouds_live_xxxxxxxxxxxx", createdAt: "2025-03-01", lastUsed: "2025-04-09" },
    { id: "key2", name: "Development Key", key: "pclouds_test_yyyyyyyyyyyy", createdAt: "2025-03-15", lastUsed: "2025-04-08" },
  ]);

  const credits = 25.50; // dollars

  // Sidebar navigation items
  const navItems = [
    { id: "overview", label: "Overview", icon: <FiHome /> },
    { id: "deployments", label: "Deployments", icon: <FiBox /> },
    { id: "domains", label: "Domains", icon: <FiGlobe /> },
    { id: "hosting", label: "Hosting", icon: <FiServer /> },
    { id: "databases", label: "Databases", icon: <FiDatabase /> },
    { id: "api-keys", label: "API Keys", icon: <FiKey /> },
    { id: "billing", label: "Billing", icon: <FiCreditCard /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-8">
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Active Deployments</span>
                  <FiBox className="text-blue-400" />
                </div>
                <div className="text-3xl font-bold mt-2">{deployments.filter(d => d.status === "ready").length}</div>
                <div className="text-xs text-green-400 mt-1">+2 this month</div>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Domains</span>
                  <FiGlobe className="text-blue-400" />
                </div>
                <div className="text-3xl font-bold mt-2">{domains.length}</div>
                <div className="text-xs text-gray-500 mt-1">Active</div>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Databases</span>
                  <FiDatabase className="text-blue-400" />
                </div>
                <div className="text-3xl font-bold mt-2">{databases.length}</div>
                <div className="text-xs text-green-400 mt-1">All running</div>
              </div>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">API Credits</span>
                  <FiCreditCard className="text-blue-400" />
                </div>
                <div className="text-3xl font-bold mt-2">${credits.toFixed(2)}</div>
                <div className="text-xs text-gray-500 mt-1">Remaining this month</div>
              </div>
            </div>

            {/* Recent deployments */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Deployments</h2>
                <button className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  <FiPlus /> New Deployment
                </button>
              </div>
              <div className="space-y-3">
                {deployments.slice(0, 3).map((dep) => (
                  <div key={dep.id} className="flex justify-between items-center p-4 rounded-xl border border-gray-800 bg-gray-900/30">
                    <div>
                      <div className="font-medium">{dep.name}</div>
                      <div className="text-sm text-gray-400">{dep.url}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        dep.status === "ready" ? "bg-green-500/20 text-green-400" :
                        dep.status === "deploying" ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"
                      }`}>
                        {dep.status === "ready" ? "Ready" : dep.status === "deploying" ? "Deploying..." : "Failed"}
                      </span>
                      <a href={`https://${dep.url}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                        <FiExternalLink />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-gray-800 rounded-xl p-5">
                <h3 className="font-semibold mb-2">Deploy a new app</h3>
                <p className="text-sm text-gray-400 mb-4">Push your code and get a live URL in seconds.</p>
                <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium transition">New Project</button>
              </div>
              <div className="bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-gray-800 rounded-xl p-5">
                <h3 className="font-semibold mb-2">Add credits</h3>
                <p className="text-sm text-gray-400 mb-4">Your credits are running low. Top up to keep your services running.</p>
                <button className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg text-sm font-medium transition">Add Credits</button>
              </div>
            </div>
          </div>
        );
      case "deployments":
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Deployments</h2>
              <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                <FiPlus /> New Deployment
              </button>
            </div>
            <div className="space-y-3">
              {deployments.map((dep) => (
                <div key={dep.id} className="flex justify-between items-center p-4 rounded-xl border border-gray-800 bg-gray-900/30">
                  <div>
                    <div className="font-medium">{dep.name}</div>
                    <div className="text-sm text-gray-400">{dep.url}</div>
                    <div className="text-xs text-gray-500 mt-1">Deployed: {dep.createdAt}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      dep.status === "ready" ? "bg-green-500/20 text-green-400" :
                      dep.status === "deploying" ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"
                    }`}>
                      {dep.status === "ready" ? "Ready" : dep.status === "deploying" ? "Deploying..." : "Failed"}
                    </span>
                    <button className="text-gray-400 hover:text-white">Settings</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "domains":
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Domains</h2>
              <Link to="/domains" className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                <FiPlus /> Buy Domain
              </Link>
            </div>
            <div className="space-y-3">
              {domains.map((domain) => (
                <div key={domain.name} className="flex justify-between items-center p-4 rounded-xl border border-gray-800 bg-gray-900/30">
                  <div>
                    <div className="font-mono">{domain.name}</div>
                    <div className="text-xs text-gray-500">Expires: {domain.expiresAt}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-green-400 text-xs flex items-center gap-1"><FiCheckCircle /> Active</span>
                    <button className="text-gray-400 hover:text-white">Manage DNS</button>
                  </div>
                </div>
              ))}
              <div className="text-center py-8 border border-dashed border-gray-700 rounded-xl">
                <p className="text-gray-400">No more domains? <Link to="/domains" className="text-blue-400">Search for a domain</Link></p>
              </div>
            </div>
          </div>
        );
      case "hosting":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Hosting Plans</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border border-gray-800 rounded-xl p-5 bg-gray-900/30">
                <h3 className="font-semibold">Starter</h3>
                <div className="text-2xl font-bold mt-2">$9<span className="text-sm text-gray-400">/month</span></div>
                <p className="text-xs text-gray-400 mt-1">1 website, 10 GB SSD</p>
                <button className="mt-4 w-full border border-gray-700 py-2 rounded-lg text-sm">Current Plan</button>
              </div>
              <div className="border border-blue-500/50 rounded-xl p-5 bg-blue-500/5 relative">
                <div className="absolute -top-2 right-4 text-xs bg-blue-600 px-2 py-0.5 rounded-full">Popular</div>
                <h3 className="font-semibold">Pro</h3>
                <div className="text-2xl font-bold mt-2">$29<span className="text-sm text-gray-400">/month</span></div>
                <p className="text-xs text-gray-400 mt-1">10 websites, 50 GB SSD</p>
                <button className="mt-4 w-full bg-blue-600 py-2 rounded-lg text-sm">Upgrade</button>
              </div>
              <div className="border border-gray-800 rounded-xl p-5 bg-gray-900/30">
                <h3 className="font-semibold">Business</h3>
                <div className="text-2xl font-bold mt-2">$79<span className="text-sm text-gray-400">/month</span></div>
                <p className="text-xs text-gray-400 mt-1">Unlimited websites, 200 GB SSD</p>
                <button className="mt-4 w-full border border-gray-700 py-2 rounded-lg text-sm">Contact Sales</button>
              </div>
            </div>
          </div>
        );
      case "databases":
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Databases</h2>
              <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium">Create Database</button>
            </div>
            <div className="space-y-3">
              {databases.map((db) => (
                <div key={db.id} className="flex justify-between items-center p-4 rounded-xl border border-gray-800 bg-gray-900/30">
                  <div>
                    <div className="font-medium">{db.name}</div>
                    <div className="text-xs text-gray-400">{db.type.toUpperCase()} • {db.size}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      db.status === "running" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}>
                      {db.status}
                    </span>
                    <button className="text-gray-400 hover:text-white">Connection String</button>
                  </div>
                </div>
              ))}
              <div className="text-center py-8 border border-dashed border-gray-700 rounded-xl">
                <p className="text-gray-400">Need a database? <button className="text-blue-400">Create one now</button></p>
              </div>
            </div>
          </div>
        );
      case "api-keys":
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">API Keys</h2>
              <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm font-medium">Generate Key</button>
            </div>
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div key={key.id} className="p-4 rounded-xl border border-gray-800 bg-gray-900/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{key.name}</div>
                      <div className="text-xs font-mono text-gray-400 mt-1">{key.key}</div>
                      <div className="text-xs text-gray-500 mt-2">Created: {key.createdAt} • Last used: {key.lastUsed || "Never"}</div>
                    </div>
                    <button className="text-red-400 text-xs hover:text-red-300">Revoke</button>
                  </div>
                </div>
              ))}
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-sm">
                <FiShield className="inline mr-2" /> Keep your keys secure. Never share them publicly.
              </div>
            </div>
          </div>
        );
      case "billing":
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Billing & Credits</h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <div className="text-sm text-gray-400">Available Credits</div>
                  <div className="text-4xl font-bold">${credits.toFixed(2)}</div>
                </div>
                <button className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-lg">Add Credits</button>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between p-4 border-b border-gray-800">
                <span>Monthly subscription (Pro plan)</span>
                <span>$29.00</span>
              </div>
              <div className="flex justify-between p-4 border-b border-gray-800">
                <span>Domain renewal (my-startup.com)</span>
                <span>$12.99</span>
              </div>
              <div className="flex justify-between p-4 font-semibold">
                <span>Total due</span>
                <span>$41.99</span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-gray-800 bg-gray-950/50 backdrop-blur-sm fixed h-full overflow-y-auto">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FiZap className="text-white" />
            </div>
            <span className="font-bold text-xl">PCLOUDs</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">Dashboard</div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                activeTab === item.id ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              <FiUser />
            </div>
            <div>
              <div className="text-sm font-medium">John Doe</div>
              <div className="text-xs text-gray-500">john@example.com</div>
            </div>
            <FiChevronDown className="ml-auto text-gray-500" />
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="w-64 h-full bg-gray-950 border-r border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-gray-800 flex justify-between items-center">
                <span className="font-bold text-xl">PCLOUDs</span>
                <button onClick={() => setSidebarOpen(false)}><FiX /></button>
              </div>
              <nav className="p-4 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                      activeTab === item.id ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 md:ml-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-md border-b border-gray-800 px-6 py-4 flex justify-between items-center">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <FiMenu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold capitalize">{activeTab}</h1>
          <div className="flex items-center gap-3">
            <button className="text-gray-400 hover:text-white">
              <FiSettings />
            </button>
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              <FiUser />
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;