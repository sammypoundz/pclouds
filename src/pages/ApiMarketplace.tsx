import React from 'react';
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiSearch,
  FiCpu,
  FiMail,
  FiMessageSquare,
  FiDollarSign,
  FiX,
  FiKey,
  FiArrowRight,
  FiTrendingUp,
  FiZap,
  FiBookOpen,
  FiLock,
  FiCode,
  FiInfo,
  FiWifi,
  FiCreditCard,
  FiFileText,
} from "react-icons/fi";

type ApiItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  endpoint: string;
  price: string;
  freeTier: string;
  icon: React.ReactNode;   // ✅ Changed from JSX.Element
  popular?: boolean;
  postmanLink?: string;
};

const ApiMarketplace = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedApi, setSelectedApi] = useState<ApiItem | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [docsTab, setDocsTab] = useState<"overview" | "auth" | "endpoints" | "examples">("overview");

  const categories = [
    { id: "all", name: "All APIs", icon: <FiCpu /> },
    { id: "communication", name: "Communication", icon: <FiMessageSquare /> },
    { id: "payment", name: "Payment", icon: <FiDollarSign /> },
    { id: "ai", name: "AI & ML", icon: <FiTrendingUp /> },
    { id: "utility", name: "Utility (Airtime, Internet, Bills)", icon: <FiWifi /> },
  ];

  const apis: ApiItem[] = [
    {
      id: "sms",
      name: "SMS API",
      category: "communication",
      description: "Send and receive SMS messages across Africa. Reliable delivery, real-time status.",
      endpoint: "https://api.pclouds.africa/v1/sms",
      price: "$0.005 per message",
      freeTier: "500 free credits / month",
      icon: <FiMessageSquare />,
      popular: true,
      postmanLink: "https://www.postman.com/pclouds/workspace/sms-api",
    },
    {
      id: "whatsapp",
      name: "WhatsApp Business API",
      category: "communication",
      description: "Engage customers on WhatsApp with automated messages, templates, and rich media.",
      endpoint: "https://api.pclouds.africa/v1/whatsapp",
      price: "$0.01 per conversation",
      freeTier: "200 free conversations / month",
      icon: <FiMessageSquare />,
      popular: true,
      postmanLink: "https://www.postman.com/pclouds/workspace/whatsapp-api",
    },
    {
      id: "email",
      name: "Email API",
      category: "communication",
      description: "Transactional and marketing emails with high deliverability and analytics.",
      endpoint: "https://api.pclouds.africa/v1/email",
      price: "$0.0001 per email",
      freeTier: "10,000 free emails / month",
      icon: <FiMail />,
      postmanLink: "https://www.postman.com/pclouds/workspace/email-api",
    },
    {
      id: "payment",
      name: "Payment Gateway",
      category: "payment",
      description: "Accept payments via card, mobile money, and bank transfer. Seamless checkout.",
      endpoint: "https://api.pclouds.africa/v1/payments",
      price: "2.9% + $0.30 per transaction",
      freeTier: "No monthly fee",
      icon: <FiDollarSign />,
      popular: true,
      postmanLink: "https://www.postman.com/pclouds/workspace/payment-api",
    },
    {
      id: "forex",
      name: "Forex Rate API",
      category: "payment",
      description: "Real-time and historical exchange rates for African currencies.",
      endpoint: "https://api.pclouds.africa/v1/forex",
      price: "Free",
      freeTier: "1000 requests/day",
      icon: <FiTrendingUp />,
      postmanLink: "https://www.postman.com/pclouds/workspace/forex-api",
    },
    {
      id: "ai",
      name: "AI Text Analysis",
      category: "ai",
      description: "Sentiment analysis, language detection, and text summarization for African languages.",
      endpoint: "https://api.pclouds.africa/v1/ai/text",
      price: "$0.001 per request",
      freeTier: "1000 free requests / month",
      icon: <FiCpu />,
      postmanLink: "https://www.postman.com/pclouds/workspace/ai-api",
    },
    {
      id: "airtime",
      name: "Airtime API",
      category: "utility",
      description: "Purchase airtime for all major African mobile networks. Instant top-up with balance check.",
      endpoint: "https://api.pclouds.africa/v1/airtime",
      price: "5% service fee",
      freeTier: "First $5 free",
      icon: <FiCreditCard />,
      popular: true,
      postmanLink: "https://www.postman.com/pclouds/workspace/airtime-api",
    },
    {
      id: "internet",
      name: "Internet Data API",
      category: "utility",
      description: "Buy data bundles for all major ISPs across Africa. Supports MTN, Airtel, Glo, Safaricom, and more.",
      endpoint: "https://api.pclouds.africa/v1/data",
      price: "5% service fee",
      freeTier: "First $10 free",
      icon: <FiWifi />,
      popular: true,
      postmanLink: "https://www.postman.com/pclouds/workspace/data-api",
    },
    {
      id: "bills",
      name: "Bill Payment API",
      category: "utility",
      description: "Pay electricity, water, TV, and internet bills across Africa. Real-time validation and receipts.",
      endpoint: "https://api.pclouds.africa/v1/bills",
      price: "3% + $0.50 per transaction",
      freeTier: "First 5 bills free",
      icon: <FiFileText />,
      popular: false,
      postmanLink: "https://www.postman.com/pclouds/workspace/bills-api",
    },
  ];

  const filteredApis = apis.filter((api) => {
    const matchesSearch = api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      api.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || api.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleGetApiKey = (api: ApiItem) => {
    setSelectedApi(api);
    setShowKeyModal(true);
  };

  const handleViewDocs = (api: ApiItem) => {
    setSelectedApi(api);
    setDocsTab("overview");
    setShowDocsModal(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const renderDocsContent = () => {
    if (!selectedApi) return null;

    switch (docsTab) {
      case "overview":
        return (
          <div className="space-y-4">
            <p className="text-gray-300">{selectedApi.description}</p>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">Key Features</h4>
              <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                <li>Production-ready with 99.9% uptime SLA</li>
                <li>Pay-as-you-go pricing, no hidden fees</li>
                <li>Free tier included: {selectedApi.freeTier}</li>
                <li>Global edge network for low latency in Africa</li>
                <li>Real-time analytics and logs</li>
              </ul>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">Rate Limits</h4>
              <p className="text-gray-300 text-sm">Default: 100 requests per minute. Contact support to increase limits.</p>
            </div>
          </div>
        );
      case "auth":
        return (
          <div className="space-y-4">
            <p className="text-gray-300 text-sm">All API requests require an API key. Include it in the request header:</p>
            <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs text-green-400">
              Authorization: Bearer YOUR_API_KEY
            </div>
            <p className="text-gray-300 text-sm">You can generate API keys from the dashboard. Each key can be scoped to specific endpoints.</p>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">Security</h4>
              <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
                <li>All requests must be over HTTPS</li>
                <li>Keys are hashed and stored encrypted</li>
                <li>Optional IP whitelisting available</li>
              </ul>
            </div>
          </div>
        );
      case "endpoints":
        return (
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">Base URL</h4>
              <code className="text-xs text-green-400 break-all">{selectedApi.endpoint.split('/v1')[0]}</code>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">Main Endpoint</h4>
              <div className="flex items-start gap-2 text-sm">
                <span className="text-yellow-400 font-mono">POST</span>
                <code className="text-green-400 break-all">{selectedApi.endpoint}</code>
              </div>
              <p className="text-gray-400 text-xs mt-2">Request body varies by API. See full documentation for details.</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">Response Format</h4>
              <pre className="text-xs text-gray-300 bg-gray-900 p-2 rounded overflow-x-auto">
{`{
  "status": "success",
  "data": { ... },
  "request_id": "uuid"
}`}
              </pre>
            </div>
          </div>
        );
      case "examples":
        return (
          <div className="space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">cURL Example</h4>
              <pre className="text-xs text-green-400 bg-gray-900 p-3 rounded overflow-x-auto">
{`curl -X POST ${selectedApi.endpoint} \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"to":"+234...","message":"Hello"}'`}
              </pre>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">JavaScript (Node.js)</h4>
              <pre className="text-xs text-gray-300 bg-gray-900 p-3 rounded overflow-x-auto">
{`const response = await fetch('${selectedApi.endpoint}', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ ... })
});`}
              </pre>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-400 mb-2">Python</h4>
              <pre className="text-xs text-gray-300 bg-gray-900 p-3 rounded overflow-x-auto">
{`import requests
headers = {"Authorization": "Bearer YOUR_API_KEY"}
response = requests.post("${selectedApi.endpoint}", headers=headers, json={...})`}
              </pre>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-4">
            <FiCpu className="w-4 h-4" />
            <span>API Marketplace</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
            Power your apps with
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              production‑ready APIs
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto mt-4 text-lg">
            Discover, integrate, and scale with APIs built for African developers.
            One SDK, unified billing.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="relative group max-w-2xl mx-auto mb-6">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
            <div className="relative flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 focus-within:border-blue-500/50 transition">
              <FiSearch className="text-gray-500 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search APIs by name or description..."
                className="bg-transparent w-full outline-none text-white placeholder:text-gray-500 py-3 text-base"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "bg-gray-800/50 text-gray-300 hover:bg-gray-700 border border-gray-700"
                }`}
              >
                {cat.icon}
                {cat.name}
              </button>
            ))}
          </div>
        </motion.div>

        {filteredApis.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No APIs found. Try adjusting your search.
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20"
          >
            {filteredApis.map((api) => (
              <motion.div
                key={api.id}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group relative rounded-xl border border-gray-800 bg-gray-900/40 backdrop-blur-sm p-6 transition-all duration-300 hover:border-blue-500/40 hover:bg-gray-800/40"
              >
                {api.popular && (
                  <div className="absolute -top-3 right-4 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                    <FiZap className="w-3 h-3" /> Popular
                  </div>
                )}
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl mb-4">
                  {api.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{api.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{api.description}</p>
                <div className="space-y-2 mb-5">
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-gray-500 shrink-0">Endpoint:</span>
                    <code className="text-blue-300 break-all font-mono text-xs">{api.endpoint}</code>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Pricing:</span>
                    <span className="font-mono text-green-400">{api.price}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Free tier:</span>
                    <span className="text-gray-300">{api.freeTier}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleViewDocs(api)}
                    className="flex-1 py-2.5 rounded-lg border border-gray-700 hover:border-blue-500 text-gray-300 hover:text-white font-medium transition flex items-center justify-center gap-2"
                  >
                    <FiBookOpen className="w-4 h-4" />
                    View Docs
                  </button>
                  <button
                    onClick={() => handleGetApiKey(api)}
                    className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                  >
                    <FiKey className="w-4 h-4" />
                    Get Key
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 p-8 rounded-2xl border border-gray-800 bg-gradient-to-r from-gray-900/50 to-gray-800/30 mb-20"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">50+</div>
            <div className="text-sm text-gray-500 mt-1">Available APIs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">99.9%</div>
            <div className="text-sm text-gray-500 mt-1">Uptime SLA</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">10k+</div>
            <div className="text-sm text-gray-500 mt-1">Active Developers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">24/7</div>
            <div className="text-sm text-gray-500 mt-1">Support</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 p-12 text-center"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-3">Build faster with our SDKs</h3>
            <p className="text-gray-400 max-w-xl mx-auto mb-6">
              Integrate any API in minutes with our official SDKs for Python, Node.js, PHP, and more.
            </p>
            <button className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto transition shadow-lg shadow-blue-600/20">
              View Documentation <FiArrowRight />
            </button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showKeyModal && selectedApi && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowKeyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6"
            >
              <button
                onClick={() => setShowKeyModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition"
              >
                <FiX className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-2xl mb-4">
                <FiKey />
              </div>
              <h3 className="text-xl font-semibold mb-2">Get API Key for {selectedApi.name}</h3>
              <p className="text-gray-400 text-sm mb-5">
                You'll receive an API key immediately. Free tier includes {selectedApi.freeTier}.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="flex-1 py-2 rounded-lg border border-gray-700 text-gray-300 hover:border-gray-500 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert(`API key for ${selectedApi.name} would be generated here.`);
                    setShowKeyModal(false);
                  }}
                  className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition"
                >
                  Generate Key
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDocsModal && selectedApi && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
            onClick={() => setShowDocsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6 max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowDocsModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition z-10"
              >
                <FiX className="w-5 h-5" />
              </button>
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-xl">
                    {selectedApi.icon}
                  </div>
                  <h2 className="text-2xl font-bold">{selectedApi.name} Documentation</h2>
                </div>
                {selectedApi.postmanLink && (
                  <a
                    href={selectedApi.postmanLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 transition text-sm font-medium"
                  >
                    <img src="https://www.vectorlogo.zone/logos/getpostman/getpostman-icon.svg" alt="Postman" className="w-4 h-4" />
                    View in Postman
                  </a>
                )}
              </div>

              <div className="flex gap-1 border-b border-gray-800 mb-6">
                {[
                  { id: "overview", label: "Overview", icon: <FiInfo /> },
                  { id: "auth", label: "Authentication", icon: <FiLock /> },
                  { id: "endpoints", label: "Endpoints", icon: <FiCode /> },
                  { id: "examples", label: "Examples", icon: <FiBookOpen /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setDocsTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition ${
                      docsTab === tab.id
                        ? "text-blue-400 border-b-2 border-blue-400"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="text-gray-300">
                {renderDocsContent()}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-800 flex justify-end">
                <button
                  onClick={() => setShowDocsModal(false)}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApiMarketplace;