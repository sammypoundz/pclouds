import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiServer,
  FiZap,
  FiCheck,
  FiArrowRight,
  FiHardDrive,
  FiCpu,
  FiUsers,
  FiCloud,
} from "react-icons/fi";

type BillingCycle = "monthly" | "yearly";

const Hosting = () => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [activeCategory, setActiveCategory] = useState<"shared" | "vps">("shared");

  const sharedPlans = [
    {
      name: "Starter",
      price: { monthly: 9, yearly: 7.5 },
      features: [
        "1 Website",
        "10 GB SSD Storage",
        "Unmetered Bandwidth",
        "Free SSL Certificate",
        "Daily Backups",
        "Basic CDN",
      ],
      highlighted: false,
      icon: <FiHardDrive />,
      buttonText: "Start Free Trial",
    },
    {
      name: "Pro",
      price: { monthly: 29, yearly: 24 },
      features: [
        "10 Websites",
        "50 GB SSD Storage",
        "Unmetered Bandwidth",
        "Free SSL + Wildcard",
        "Hourly Backups",
        "Advanced CDN",
        "Priority Support",
        "Free Domain (.com/.ng)",
      ],
      highlighted: true,
      icon: <FiCpu />,
      buttonText: "Get Started",
    },
    {
      name: "Business",
      price: { monthly: 79, yearly: 66 },
      features: [
        "Unlimited Websites",
        "200 GB SSD Storage",
        "Unmetered Bandwidth",
        "Free SSL + Wildcard",
        "Real-time Backups",
        "Enterprise CDN",
        "24/7 Dedicated Support",
        "Free Domain + Privacy",
        "Team Access",
      ],
      highlighted: false,
      icon: <FiUsers />,
      buttonText: "Contact Sales",
    },
  ];

  const vpsPlans = [
    {
      name: "VPS Basic",
      price: { monthly: 49, yearly: 42 },
      features: [
        "2 vCPU Cores",
        "4 GB RAM",
        "80 GB NVMe SSD",
        "5 TB Bandwidth",
        "Dedicated IPv4",
        "Root Access",
        "24/7 Monitoring",
        "Snapshots",
      ],
      highlighted: false,
      icon: <FiCloud />,
      buttonText: "Deploy VPS",
    },
    {
      name: "VPS Pro",
      price: { monthly: 89, yearly: 75 },
      features: [
        "4 vCPU Cores",
        "8 GB RAM",
        "160 GB NVMe SSD",
        "10 TB Bandwidth",
        "Dedicated IPv4 + IPv6",
        "Root Access",
        "Advanced Firewall",
        "Automated Backups",
        "Priority Support",
      ],
      highlighted: true,
      icon: <FiServer />,
      buttonText: "Deploy VPS",
    },
    {
      name: "VPS Enterprise",
      price: { monthly: 179, yearly: 149 },
      features: [
        "8 vCPU Cores",
        "16 GB RAM",
        "320 GB NVMe SSD",
        "20 TB Bandwidth",
        "Dedicated IPv4 + IPv6",
        "Root Access",
        "Load Balancer Ready",
        "Real-time Backups",
        "24/7 Dedicated Support",
      ],
      highlighted: false,
      icon: <FiZap />,
      buttonText: "Contact Sales",
    },
  ];

  const currentPlans = activeCategory === "shared" ? sharedPlans : vpsPlans;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-28 pb-24 relative z-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-4">
            <FiServer className="w-4 h-4" />
            <span>High‑Performance Hosting</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
            Host your projects
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              with African edge
            </span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto mt-4 text-lg">
            Choose between optimized shared hosting or powerful VPS solutions.
            Deploy in seconds, scale effortlessly.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-gray-900/50 border border-gray-800 rounded-full p-1 inline-flex">
            <button
              onClick={() => setActiveCategory("shared")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === "shared"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Shared Hosting
            </button>
            <button
              onClick={() => setActiveCategory("vps")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === "vps"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              VPS Hosting
            </button>
          </div>
        </div>

        {/* Billing Toggle - FIXED VERTICAL CENTERING */}
        <div className="flex justify-center items-center gap-4 mb-12">
          <span
            className={`text-sm font-medium transition-colors ${
              billingCycle === "monthly" ? "text-white" : "text-gray-500"
            }`}
          >
            Monthly
          </span>
          <button
            onClick={() =>
              setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")
            }
            className="relative w-14 h-8 rounded-full bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <div
              className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-500 shadow-md transition-transform duration-300 ${
                billingCycle === "yearly" ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium transition-colors ${
              billingCycle === "yearly" ? "text-white" : "text-gray-500"
            }`}
          >
            Yearly <span className="text-green-400 ml-1">(Save 20%)</span>
          </span>
        </div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-8 mb-20"
        >
          {currentPlans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className={`relative rounded-2xl border ${
                plan.highlighted
                  ? "border-blue-500/50 shadow-xl shadow-blue-500/10"
                  : "border-gray-800"
              } bg-gray-900/40 backdrop-blur-sm p-8 transition-all duration-300`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-2xl mb-5">
                {plan.icon}
              </div>
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-5">
                <span className="text-4xl font-bold">
                  ${billingCycle === "monthly" ? plan.price.monthly : plan.price.yearly}
                </span>
                <span className="text-gray-400">/month</span>
                {billingCycle === "yearly" && (
                  <div className="text-sm text-green-400 mt-1">
                    Billed annually (${(plan.price.yearly * 12).toFixed(0)}/year)
                  </div>
                )}
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <FiCheck className="text-green-400 w-4 h-4 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                  plan.highlighted
                    ? "bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/20"
                    : "border border-gray-700 hover:border-gray-500 text-white"
                }`}
              >
                {plan.buttonText}
                <FiArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">
              {activeCategory === "shared" ? "Shared Hosting Features" : "VPS Hosting Features"}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              {activeCategory === "shared"
                ? "Perfect for small to medium projects with easy management."
                : "Full control, dedicated resources, and scalability for demanding applications."}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {(activeCategory === "shared"
              ? [
                  "cPanel Control Panel",
                  "One-Click Installer (200+ apps)",
                  "Free Website Migration",
                  "Daily Malware Scan",
                  "99.9% Uptime Guarantee",
                  "24/7 Chat Support",
                ]
              : [
                  "Full Root Access",
                  "Choice of OS (Ubuntu, CentOS, Debian)",
                  "Dedicated CPU Cores",
                  "NVMe SSD Storage",
                  "1 Gbps Uplink",
                  "API Access for Automation",
                ]
            ).map((feature, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-800">
                <FiCheck className="text-green-400 w-5 h-5 flex-shrink-0" />
                <span className="text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trust stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 p-8 rounded-2xl border border-gray-800 bg-gradient-to-r from-gray-900/50 to-gray-800/30 mb-20"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">99.9%</div>
            <div className="text-sm text-gray-500 mt-1">Uptime SLA</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">50ms</div>
            <div className="text-sm text-gray-500 mt-1">Avg DNS Response</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">12+</div>
            <div className="text-sm text-gray-500 mt-1">Global Edge Locations</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">24/7</div>
            <div className="text-sm text-gray-500 mt-1">Expert Support</div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 p-12 text-center"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-3">Ready to launch?</h3>
            <p className="text-gray-400 max-w-xl mx-auto mb-6">
              Start with a 14‑day free trial. No credit card required.
            </p>
            <button className="bg-blue-600 hover:bg-blue-500 px-8 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto transition shadow-lg shadow-blue-600/20">
              Get Started Now <FiArrowRight />
            </button>
            <p className="text-xs text-gray-600 mt-4">Cancel anytime. No hidden fees.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hosting;